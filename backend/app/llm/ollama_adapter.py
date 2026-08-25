import time
import json
import httpx
import logging
from typing import Dict, Any, Optional
from backend.app.llm.adapter import BaseLLMAdapter
from backend.app.llm.models import NarrativeResponse, CostCalculator
from backend.app.prompts.prompt_manager import PromptManager

logger = logging.getLogger("ur_console.llm")

class OllamaGemmaAdapter(BaseLLMAdapter):
    """Offline local fallback adapter using Ollama gemma model at 127.0.0.1:11434."""

    def __init__(self, base_url: str = "http://127.0.0.1:11434", model_name: str = "gemma:2b"):
        self.base_url = base_url
        self.model_name = model_name
        self.prompt_manager = PromptManager()

    async def generate_narrative(
        self,
        patient_summary: Dict[str, Any],
        ur_decision: Dict[str, Any],
        target_payer: str = "Medicare Advantage / Commercial",
        correlation_id: str = "",
    ) -> NarrativeResponse:
        start_time = time.time()
        system_prompt = self.prompt_manager.get_system_prompt("v1")
        user_prompt = self.prompt_manager.format_user_prompt(patient_summary, ur_decision, target_payer)

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "format": "json",
            "stream": False,
        }

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(f"{self.base_url}/api/chat", json=payload, timeout=20.0)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("message", {}).get("content", "{}")
                    parsed = json.loads(content)
                    prompt_tokens = data.get("prompt_eval_count", 950)
                    completion_tokens = data.get("eval_count", 320)
                else:
                    raise RuntimeError(f"Ollama returned HTTP {resp.status_code}")
        except Exception as e:
            logger.warning("Ollama offline call failed: %s. Falling back to deterministic mock generator.", e)
            from backend.app.llm.mock_adapter import MockLLMAdapter
            return await MockLLMAdapter().generate_narrative(patient_summary, ur_decision, target_payer, correlation_id)

        latency = round((time.time() - start_time) * 1000, 2)
        cost = CostCalculator.calculate_cost("ollama-gemma", prompt_tokens, completion_tokens)

        return NarrativeResponse(
            patient_id=patient_summary.get("id", "unknown"),
            narrative_text=parsed.get("narrative_text", "Medical necessity justified under observation/inpatient criteria."),
            criteria_cited=parsed.get("criteria_cited", ["Local Clinical Practice Guideline"]),
            clinical_rationale=parsed.get("clinical_rationale", "Patient meets inpatient admission intensity of service thresholds."),
            model_used=f"ollama-{self.model_name}",
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            estimated_cost_usd=cost,
            latency_ms=latency,
            correlation_id=correlation_id,
        )

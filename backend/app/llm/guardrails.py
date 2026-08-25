import logging
import re

logger = logging.getLogger("ur_console.security")

# Regex patterns matching potential real-world PHI identifiers
SSN_PATTERN = re.compile(r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b")
PHONE_PATTERN = re.compile(r"\b(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})\b")
CREDIT_CARD_PATTERN = re.compile(r"\b(?:\d{4}[- ]?){3}\d{4}\b")


class PHIGuardrail:
    """Security guardrail to block real PHI from ever being processed by LLM endpoints."""

    @staticmethod
    def validate_content(text: str) -> tuple[bool, list[str]]:
        violations = []
        if not text:
            return True, violations

        if SSN_PATTERN.search(text):
            violations.append("Detected potential Social Security Number (SSN)")

        if CREDIT_CARD_PATTERN.search(text):
            violations.append("Detected potential payment card number")

        # Flag specific non-synthetic phone formats if not standard demo numbers
        phone_matches = PHONE_PATTERN.findall(text)
        for match in phone_matches:
            area_code = match[0]
            if area_code not in ["555", "800", "888"]:
                violations.append(f"Detected potential real telephone number with area code {area_code}")
                break

        if violations:
            logger.warning(
                "SECURITY GUARDRAIL TRIGGERED: Input text rejected due to potential real PHI violation(s): %s",
                violations,
            )
            return False, violations

        return True, []

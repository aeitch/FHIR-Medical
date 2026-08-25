from typing import Any

from pydantic import BaseModel, Field


class Coding(BaseModel):
    system: str | None = None
    code: str | None = None
    display: str | None = None


class CodeableConcept(BaseModel):
    coding: list[Coding] = Field(default_factory=list)
    text: str | None = None


class Identifier(BaseModel):
    system: str | None = None
    value: str | None = None


class HumanName(BaseModel):
    use: str | None = None
    family: str | None = None
    given: list[str] = Field(default_factory=list)


class Quantity(BaseModel):
    value: float | None = None
    unit: str | None = None
    system: str | None = None
    code: str | None = None


class ReferenceRange(BaseModel):
    low: Quantity | None = None
    high: Quantity | None = None


class PatientResource(BaseModel):
    resourceType: str = "Patient"
    id: str
    identifier: list[Identifier] = Field(default_factory=list)
    active: bool | None = True
    name: list[HumanName] = Field(default_factory=list)
    gender: str | None = None
    birthDate: str | None = None


class EncounterResource(BaseModel):
    resourceType: str = "Encounter"
    id: str
    status: str
    class_: Coding | None = Field(default=None, alias="class")
    subject: dict[str, Any] | None = None
    period: dict[str, Any] | None = None
    reasonCode: list[CodeableConcept] = Field(default_factory=list)


class ConditionResource(BaseModel):
    resourceType: str = "Condition"
    id: str
    clinicalStatus: dict[str, Any] | None = None
    category: list[CodeableConcept] = Field(default_factory=list)
    code: CodeableConcept | None = None
    subject: dict[str, Any] | None = None


class ObservationResource(BaseModel):
    resourceType: str = "Observation"
    id: str
    status: str
    category: list[CodeableConcept] = Field(default_factory=list)
    code: CodeableConcept | None = None
    subject: dict[str, Any] | None = None
    effectiveDateTime: str | None = None
    valueQuantity: Quantity | None = None
    referenceRange: list[ReferenceRange] = Field(default_factory=list)


class DocumentReferenceResource(BaseModel):
    resourceType: str = "DocumentReference"
    id: str
    status: str
    type: CodeableConcept | None = None
    subject: dict[str, Any] | None = None
    date: str | None = None
    description: str | None = None


class PatientSummary(BaseModel):
    id: str
    mrn: str
    full_name: str
    gender: str
    birth_date: str
    age: int
    active_encounter: dict[str, Any] | None = None
    conditions: list[dict[str, Any]] = Field(default_factory=list)
    observations: list[dict[str, Any]] = Field(default_factory=list)
    documents: list[dict[str, Any]] = Field(default_factory=list)
    scenario_description: str

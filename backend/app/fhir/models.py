from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class Coding(BaseModel):
    system: Optional[str] = None
    code: Optional[str] = None
    display: Optional[str] = None

class CodeableConcept(BaseModel):
    coding: List[Coding] = Field(default_factory=list)
    text: Optional[str] = None

class Identifier(BaseModel):
    system: Optional[str] = None
    value: Optional[str] = None

class HumanName(BaseModel):
    use: Optional[str] = None
    family: Optional[str] = None
    given: List[str] = Field(default_factory=list)

class Quantity(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None
    system: Optional[str] = None
    code: Optional[str] = None

class ReferenceRange(BaseModel):
    low: Optional[Quantity] = None
    high: Optional[Quantity] = None

class PatientResource(BaseModel):
    resourceType: str = "Patient"
    id: str
    identifier: List[Identifier] = Field(default_factory=list)
    active: Optional[bool] = True
    name: List[HumanName] = Field(default_factory=list)
    gender: Optional[str] = None
    birthDate: Optional[str] = None

class EncounterResource(BaseModel):
    resourceType: str = "Encounter"
    id: str
    status: str
    class_: Optional[Coding] = Field(default=None, alias="class")
    subject: Optional[Dict[str, Any]] = None
    period: Optional[Dict[str, Any]] = None
    reasonCode: List[CodeableConcept] = Field(default_factory=list)

class ConditionResource(BaseModel):
    resourceType: str = "Condition"
    id: str
    clinicalStatus: Optional[Dict[str, Any]] = None
    category: List[CodeableConcept] = Field(default_factory=list)
    code: Optional[CodeableConcept] = None
    subject: Optional[Dict[str, Any]] = None

class ObservationResource(BaseModel):
    resourceType: str = "Observation"
    id: str
    status: str
    category: List[CodeableConcept] = Field(default_factory=list)
    code: Optional[CodeableConcept] = None
    subject: Optional[Dict[str, Any]] = None
    effectiveDateTime: Optional[str] = None
    valueQuantity: Optional[Quantity] = None
    referenceRange: List[ReferenceRange] = Field(default_factory=list)

class DocumentReferenceResource(BaseModel):
    resourceType: str = "DocumentReference"
    id: str
    status: str
    type: Optional[CodeableConcept] = None
    subject: Optional[Dict[str, Any]] = None
    date: Optional[str] = None
    description: Optional[str] = None

class PatientSummary(BaseModel):
    id: str
    mrn: str
    full_name: str
    gender: str
    birth_date: str
    age: int
    active_encounter: Optional[Dict[str, Any]] = None
    conditions: List[Dict[str, Any]] = Field(default_factory=list)
    observations: List[Dict[str, Any]] = Field(default_factory=list)
    documents: List[Dict[str, Any]] = Field(default_factory=list)
    scenario_description: str

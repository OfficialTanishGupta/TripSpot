from typing import List, Optional
from pydantic import BaseModel, Field


class TripEvent(BaseModel):
    mode: str = Field(..., description="CAB, TRAIN, BUS, or FLIGHT")
    adults: int = 1
    children: int = 0
    isWeekend: bool = False
    advanceDays: int = 0
    price: float
    cheapestAvailablePrice: Optional[float] = None
    daysAgo: int = 0


class CurrentParty(BaseModel):
    adults: int = 1
    children: int = 0
    isWeekend: Optional[bool] = None
    advanceDays: Optional[int] = None


class PersonaRequest(BaseModel):
    trips: List[TripEvent] = []


class PersonaResponse(BaseModel):
    persona: str
    confidence: float
    isNewTraveler: bool
    features: dict
    insight: str


class CandidateOption(BaseModel):
    id: str
    mode: str
    providerName: str
    price: float
    rating: float = 4.0
    durationRank: int = 2  # 1 = fastest among the options given, higher = slower


class RerankRequest(BaseModel):
    trips: List[TripEvent] = []
    currentParty: Optional[CurrentParty] = None
    options: List[CandidateOption]


class RankedOption(BaseModel):
    id: str
    personalizedScore: float
    reason: str


class RerankResponse(BaseModel):
    persona: str
    rankedOptionIds: List[str]
    scored: List[RankedOption]

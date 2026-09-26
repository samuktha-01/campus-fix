"""Abstract base class and types for AI LLM providers."""

from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel, Field


class AIAnalysisResult(BaseModel):
    """Structured response from complaint categorization and priority engine."""

    department_code: str = Field(..., description="Target department code (e.g. IT, ESTATE, HOSTEL)")
    category_name: str = Field(..., description="Suggested sub-category name")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    severity: int = Field(..., ge=1, le=5, description="Impact/danger scale (1-5)")
    urgency: int = Field(..., ge=1, le=5, description="Time sensitivity scale (1-5)")
    priority: str = Field(..., description="Computed priority: LOW, MEDIUM, HIGH, CRITICAL")
    reasoning: str = Field(..., description="Justification for priority and category")


class LLMProvider(ABC):
    """Abstract interface for AI LLM and Embedding services."""

    @abstractmethod
    async def analyze_complaint(
        self, title: str, description: str, location: str
    ) -> AIAnalysisResult:
        """Categorize complaint, assess severity/urgency, and determine priority."""
        pass

    @abstractmethod
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate a dense vector embedding for semantic duplicate detection."""
        pass

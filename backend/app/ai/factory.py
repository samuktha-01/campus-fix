"""AI Provider factory with multi-provider support and mock fallback."""

import logging
import hashlib
from typing import List
from app.ai.base import AIAnalysisResult, LLMProvider
from app.core.config import settings

logger = logging.getLogger(__name__)


class MockProvider(LLMProvider):
    """Deterministic, rule-based fallback provider for offline development and testing."""

    async def analyze_complaint(
        self, title: str, description: str, location: str
    ) -> AIAnalysisResult:
        combined = f"{title.lower()} {description.lower()} {location.lower()}"

        # Categorization heuristic
        if any(w in combined for w in ["wifi", "wi-fi", "internet", "network", "portal", "login", "server"]):
            dept_code = "IT"
            category = "Wi-Fi & Network Infrastructure"
        elif any(w in combined for w in ["leak", "water", "pipe", "plumb", "tap", "bathroom", "toilet"]):
            dept_code = "ESTATE"
            category = "Plumbing & Water Supply"
        elif any(w in combined for w in ["light", "fan", "ac", "power", "switch", "short circuit", "spark"]):
            dept_code = "ESTATE"
            category = "Electrical & Air Conditioning"
        elif any(w in combined for w in ["bed", "room", "warden", "mess", "roommate", "hostel"]):
            dept_code = "HOSTEL"
            category = "Hostel Room Maintenance"
        elif any(w in combined for w in ["bus", "shuttle", "parking", "vehicle"]):
            dept_code = "TRANSPORT"
            category = "Transport & Parking"
        else:
            dept_code = "ESTATE"
            category = "General Estate Maintenance"

        # Severity & urgency heuristic
        is_critical = any(w in combined for w in ["fire", "spark", "electric shock", "flood", "emergency", "danger"])
        is_high = any(w in combined for w in ["broken", "no water", "blackout", "exam", "entire hostel", "blocked"])

        if is_critical:
            severity, urgency, priority = 5, 5, "CRITICAL"
            reason = "Potential safety hazard or immediate emergency identified."
        elif is_high:
            severity, urgency, priority = 4, 4, "HIGH"
            reason = "Significant impediment to academic or living conditions."
        elif "slow" in combined or "dirty" in combined:
            severity, urgency, priority = 2, 2, "LOW"
            reason = "Routine maintenance request with low disruption impact."
        else:
            severity, urgency, priority = 3, 3, "MEDIUM"
            reason = "Standard campus issue requiring scheduled maintenance."

        return AIAnalysisResult(
            department_code=dept_code,
            category_name=category,
            confidence=0.88,
            severity=severity,
            urgency=urgency,
            priority=priority,
            reasoning=reason,
        )

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate a deterministic pseudo-embedding (768 dimensions) based on SHA-256."""
        h = hashlib.sha256(text.encode("utf-8")).digest()
        # Repeat and normalize to 768 floats
        vec = []
        for i in range(768):
            byte_val = h[i % len(h)]
            # normalize between -1.0 and 1.0
            vec.append((byte_val - 128.0) / 128.0)
        return vec


def get_ai_provider() -> LLMProvider:
    """Instantiate the active AI Provider based on configuration."""
    provider_name = settings.AI_PROVIDER.lower()

    if provider_name == "gemini" and settings.GEMINI_API_KEY:
        try:
            from app.ai.gemini_provider import GeminiProvider
            return GeminiProvider(api_key=settings.GEMINI_API_KEY, model_name=settings.AI_MODEL_NAME)
        except Exception as e:
            logger.warning(f"Failed to initialize GeminiProvider: {e}. Falling back to MockProvider.")

    # Default fallback
    return MockProvider()

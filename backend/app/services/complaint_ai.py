"""Complaint Analysis and Intelligence Engine.

Provides deep campus taxonomy classification, multi-factor priority calculation,
emergency hazard detection, and semantic duplicate matching.
"""

import re
import difflib
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from app.models.ticket import TicketPriority


@dataclass
class PriorityFactorScores:
    severity_score: float
    affected_users_score: float
    safety_score: float
    location_score: float
    recurrence_score: float
    sla_risk_score: float
    final_score: float
    priority: TicketPriority
    reasoning: str


@dataclass
class ComplaintAnalysis:
    department_code: str
    department_name: str
    category: str
    subcategory: str
    confidence: float
    factors: PriorityFactorScores
    is_emergency: bool


class ComplaintIntelligenceEngine:
    """SmartCampus complaint classification, safety scoring, and routing engine."""

    # Campus department definitions and taxonomy
    TAXONOMY = {
        "HOSTEL": {
            "name": "Hostel Administration",
            "keywords": [
                "hostel", "room", "bed", "cot", "mattress", "cupboard", "wardrobe", "almirah",
                "warden", "caretaker", "roommate", "block a", "block b", "block c", "block d",
                "curtain", "study table", "chair", "door lock", "key", "hostel washroom",
                "laundry", "washing machine", "hostel mess", "corridor", "balcony", "hostel geyser"
            ],
            "subcategories": {
                "Hostel Plumbing & Sanitation": ["leak", "water", "pipe", "tap", "flush", "washroom", "toilet", "geyser", "drain", "clog", "shower"],
                "Room Furniture & Fixtures": ["chair", "desk", "table", "bed", "cot", "mattress", "cupboard", "almirah", "lock", "handle", "hinge"],
                "Hostel Electrical": ["light", "fan", "switch", "socket", "regulator", "bulb", "power"],
                "Hostel Room Maintenance": ["window", "mesh", "glass", "paint", "wall", "door", "mosquito"],
                "Hostel Common Areas": ["water cooler", "laundry", "corridor", "study room", "tv room", "lift"],
            },
            "default_category": "Hostel Administration",
            "default_subcategory": "Hostel Room Maintenance",
        },
        "IT": {
            "name": "IT & Network Infrastructure",
            "keywords": [
                "wifi", "wi-fi", "internet", "network", "ethernet", "lan", "router", "ssid",
                "portal", "lms", "moodle", "erp", "login", "password", "server", "email",
                "outlook", "computer", "pc", "laptop", "lab computer", "printer", "projector",
                "smart board", "display", "hdmi", "screen", "teams", "zoom", "connectivity"
            ],
            "subcategories": {
                "Wi-Fi & Network Infrastructure": ["wifi", "wi-fi", "internet", "signal", "connect", "ssid", "slow speed", "eduroam", "lan", "ethernet"],
                "Campus Portal & LMS Access": ["portal", "lms", "moodle", "login", "password", "erp", "registration", "student account", "grades"],
                "Computer Lab Hardware": ["computer", "pc", "mouse", "keyboard", "monitor", "cpu", "printer", "lab"],
                "Classroom AV & Smart Systems": ["projector", "smart board", "hdmi", "speaker", "mic", "microphone", "display", "av"],
                "Student Email & Digital Services": ["email", "outlook", "office 365", "license", "account", "2fa"],
            },
            "default_category": "IT & Network Infrastructure",
            "default_subcategory": "Wi-Fi & Network Infrastructure",
        },
        "ESTATE": {
            "name": "Estate & Maintenance",
            "keywords": [
                "light", "fan", "switch", "switchboard", "socket", "wire", "spark", "electric",
                "short circuit", "mcb", "blackout", "power", "power cut", "wiring", "ac",
                "air conditioner", "air conditioning", "cooling", "chiller", "hvac", "ventilation",
                "wall", "ceiling", "crack", "plaster", "seepage", "damp", "pipe burst", "tank",
                "civil", "pathway", "road", "pothole", "street light", "ground", "drainage", "sewage"
            ],
            "subcategories": {
                "Electrical & Power Supply": ["spark", "short circuit", "switch", "socket", "switchboard", "mcb", "electric", "power", "wire", "blackout", "shock"],
                "Air Conditioning & Ventilation": ["ac", "air conditioner", "air conditioning", "cooling", "hvac", "thermostat", "blower", "duct"],
                "Campus Water Supply & Plumbing": ["main pipe", "water tank", "burst", "pressure", "sewage", "drainage", "overflow", "plumbing"],
                "Civil & Structural Maintenance": ["crack", "wall", "ceiling", "falling", "plaster", "seepage", "pothole", "road", "pathway", "tiles", "glass"],
                "Campus Sanitation & Grounds": ["garbage", "trash", "waste", "drain", "cleanliness", "grass", "tree"],
            },
            "default_category": "Estate & Maintenance",
            "default_subcategory": "Electrical & Power Supply",
        },
        "TRANSPORT": {
            "name": "Transport & Parking",
            "keywords": [
                "bus", "shuttle", "transit", "route", "driver", "transport", "pickup", "stop",
                "schedule", "delay", "parking", "bike", "car", "vehicle", "scooter", "pass",
                "parking slot", "helmet", "bicycle", "cycle stand", "traffic", "rash driving"
            ],
            "subcategories": {
                "Bus Transit & Schedules": ["bus", "shuttle", "route", "timing", "schedule", "delay", "missed", "overcrowded", "transit"],
                "Parking Management": ["parking", "slot", "bike", "car", "cycle", "bicycle stand", "sticker", "pass", "blocked car"],
                "Campus Transit Safety": ["speed", "rash driving", "driver", "safety", "night shuttle", "escort"],
            },
            "default_category": "Transport & Parking",
            "default_subcategory": "Bus Transit & Schedules",
        },
        "CANTEEN": {
            "name": "Canteen & Dining Services",
            "keywords": [
                "canteen", "mess", "dining", "food", "cafeteria", "lunch", "dinner", "breakfast",
                "meal", "snack", "water cooler", "ro water", "drinking water", "plate", "utensil",
                "insect", "hygiene", "stale", "taste", "caterer", "counter", "token", "billing"
            ],
            "subcategories": {
                "Food Quality & Hygiene": ["food", "insect", "cockroach", "stale", "smell", "taste", "uncooked", "hair", "poisoning", "raw", "quality"],
                "Drinking Water Coolers": ["water cooler", "ro water", "drinking water", "cooler", "filter", "cold water", "murky", "dispenser"],
                "Dining Hall Sanitation": ["table", "plate", "utensil", "flies", "wash basin", "cleanliness", "sink", "soap"],
                "Canteen Service & Billing": ["counter", "token", "bill", "price", "overcharge", "delay", "staff behavior"],
            },
            "default_category": "Canteen & Dining Services",
            "default_subcategory": "Food Quality & Hygiene",
        },
    }

    # Emergency & critical danger patterns
    CRITICAL_SAFETY_KEYWORDS = [
        "fire", "spark", "electric shock", "short circuit", "burnt smell", "burning",
        "gas leak", "live wire", "open manhole", "ceiling collapse", "falling cement",
        "explosion", "chemical spill", "elevator stuck", "lift drop", "emergency", "danger to life"
    ]

    # High impact/disruption keywords
    HIGH_IMPACT_KEYWORDS = [
        "entire", "all students", "blackout", "no water", "flooding", "water leaking continuously",
        "exam", "cannot study", "severe", "completely broken", "urgent", "major"
    ]

    # Public/high-traffic locations
    HIGH_TRAFFIC_LOCATION_KEYWORDS = [
        "library", "auditorium", "central", "main", "canteen", "mess", "gate",
        "lab", "classroom", "corridor", "hall", "block", "floor"
    ]

    @classmethod
    def analyze_complaint(
        cls,
        title: str,
        description: str,
        location: str,
        user_category: Optional[str] = None,
        user_subcategory: Optional[str] = None,
    ) -> ComplaintAnalysis:
        """Run full linguistic and heuristic analysis on the complaint text."""
        combined_text = f"{title.lower()} {description.lower()} {location.lower()}"
        words = re.findall(r"\b[a-z0-9\-]+\b", combined_text)

        # 1. Check for immediate emergency/safety hazards
        is_emergency = any(k in combined_text for k in cls.CRITICAL_SAFETY_KEYWORDS)

        # 2. Score candidate departments based on keyword frequency and specificity
        dept_scores: Dict[str, float] = {}
        for dept_code, data in cls.TAXONOMY.items():
            score = 0.0
            for kw in data["keywords"]:
                if kw in combined_text:
                    # Longer keyword matches carry higher weight
                    score += 1.0 + (len(kw.split()) * 0.5)
            dept_scores[dept_code] = score

        # Prioritize hostel if location specifically says hostel
        if "hostel" in location.lower():
            dept_scores["HOSTEL"] = dept_scores.get("HOSTEL", 0.0) + 2.5
        elif any(k in location.lower() for k in ["lab", "computer", "library"]):
            dept_scores["IT"] = dept_scores.get("IT", 0.0) + 1.5
        elif any(k in location.lower() for k in ["canteen", "mess", "dining"]):
            dept_scores["CANTEEN"] = dept_scores.get("CANTEEN", 0.0) + 2.5
        elif any(k in location.lower() for k in ["bus", "parking"]):
            dept_scores["TRANSPORT"] = dept_scores.get("TRANSPORT", 0.0) + 2.5

        # If electric hazard is present, ensure Estate or Hostel Electrical is prioritized
        if any(k in combined_text for k in ["spark", "short circuit", "switchboard", "electric shock"]):
            dept_scores["ESTATE"] = dept_scores.get("ESTATE", 0.0) + 4.0

        # Determine best department
        best_dept_code = max(dept_scores, key=dept_scores.get)
        if dept_scores[best_dept_code] == 0:
            # Fallback if text is very brief or generic
            best_dept_code = "ESTATE"

        dept_meta = cls.TAXONOMY[best_dept_code]
        assigned_dept_name = dept_meta["name"]

        # 3. Determine Category and Subcategory
        # If user provided category, validate or use it; otherwise use AI determined
        if user_category and len(user_category.strip()) > 2:
            resolved_category = user_category.strip()
        else:
            resolved_category = dept_meta["default_category"]

        # Subcategory determination
        if user_subcategory and len(user_subcategory.strip()) > 2:
            resolved_subcategory = user_subcategory.strip()
        else:
            # Match subcategories within department
            subcat_scores: Dict[str, float] = {}
            for subcat_name, subcat_kws in dept_meta["subcategories"].items():
                s_score = sum(1.0 for sk in subcat_kws if sk in combined_text)
                subcat_scores[subcat_name] = s_score

            best_subcat = max(subcat_scores, key=subcat_scores.get)
            if subcat_scores[best_subcat] > 0:
                resolved_subcategory = best_subcat
            else:
                resolved_subcategory = dept_meta["default_subcategory"]

        # 4. Multi-factor Priority Calculation
        factors = cls.calculate_priority_factors(title, description, location, is_emergency)

        # Confidence calculation based on score differential
        total_score = sum(dept_scores.values()) or 1.0
        confidence = min(0.96, max(0.72, dept_scores[best_dept_code] / total_score + 0.35))

        return ComplaintAnalysis(
            department_code=best_dept_code,
            department_name=assigned_dept_name,
            category=resolved_category,
            subcategory=resolved_subcategory,
            confidence=round(confidence, 2),
            factors=factors,
            is_emergency=is_emergency,
        )

    @classmethod
    def calculate_priority_factors(
        cls, title: str, description: str, location: str, is_emergency: bool
    ) -> PriorityFactorScores:
        """Compute objective multi-factor scores and map to TicketPriority."""
        combined = f"{title.lower()} {description.lower()} {location.lower()}"

        # 1. Safety Score (0.0 to 5.0)
        if is_emergency:
            safety_score = 5.0
        elif any(k in combined for k in ["broken glass", "falling", "leak", "slippery", "stuck"]):
            safety_score = 3.5
        elif any(k in combined for k in ["dark", "street light", "lock"]):
            safety_score = 2.8
        else:
            safety_score = 1.0

        # 2. Severity Score (0.0 to 5.0)
        if is_emergency or any(k in combined for k in ["no water", "blackout", "flooding", "completely broken"]):
            severity_score = 4.8
        elif any(k in combined for k in ["leak", "not working", "slow", "disconnects", "bad smell"]):
            severity_score = 3.6
        elif any(k in combined for k in ["loose", "wobbly", "dirty", "scratch", "creaking"]):
            severity_score = 2.0
        else:
            severity_score = 2.5

        # 3. Affected Users Score (0.0 to 5.0)
        if any(k in combined for k in ["entire", "all students", "block c", "auditorium", "library", "mess", "canteen"]):
            affected_users_score = 4.7
        elif any(k in combined for k in ["lab", "classroom", "washroom", "floor", "corridor"]):
            affected_users_score = 3.6
        elif any(k in combined for k in ["room", "desk", "chair"]):
            affected_users_score = 1.8
        else:
            affected_users_score = 2.5

        # 4. Location Score (0.0 to 5.0)
        if any(k in location.lower() for k in cls.HIGH_TRAFFIC_LOCATION_KEYWORDS):
            location_score = 4.2
        else:
            location_score = 2.5

        # 5. Recurrence Score (0.0 to 5.0)
        recurrence_score = 2.0  # Base nominal recurrence

        # 6. SLA Risk Score (0.0 to 5.0)
        if safety_score >= 4.0 or severity_score >= 4.0:
            sla_risk_score = 4.6
        elif severity_score >= 3.0:
            sla_risk_score = 3.2
        else:
            sla_risk_score = 1.8

        # Weighted Final Score (0 - 100)
        final_score = (
            (safety_score * 0.32) +
            (severity_score * 0.25) +
            (affected_users_score * 0.20) +
            (location_score * 0.13) +
            (recurrence_score * 0.10)
        ) * 20.0

        final_score = min(99.0, max(15.0, final_score))

        # Priority categorization
        if safety_score >= 4.5 or final_score >= 80.0:
            priority = TicketPriority.CRITICAL
            reasoning = "Immediate physical safety or high-risk hazard detected requiring instant escalation."
        elif final_score >= 58.0:
            priority = TicketPriority.HIGH
            reasoning = "Substantial operational disruption impacting multiple residents or essential utilities."
        elif final_score >= 35.0:
            priority = TicketPriority.MEDIUM
            reasoning = "Standard campus maintenance issue requiring normal scheduled attention."
        else:
            priority = TicketPriority.LOW
            reasoning = "Routine cosmetic or single-user comfort request with low operational urgency."

        return PriorityFactorScores(
            severity_score=round(severity_score, 1),
            affected_users_score=round(affected_users_score, 1),
            safety_score=round(safety_score, 1),
            location_score=round(location_score, 1),
            recurrence_score=round(recurrence_score, 1),
            sla_risk_score=round(sla_risk_score, 1),
            final_score=round(final_score, 1),
            priority=priority,
            reasoning=reasoning,
        )

    @classmethod
    def calculate_text_similarity(cls, text1: str, text2: str) -> float:
        """Calculate word-token Jaccard and Levenshtein similarity ratio between two complaint texts."""
        # Clean tokens
        stopwords = {"the", "a", "an", "is", "in", "at", "and", "or", "to", "for", "of", "with", "on", "from", "by"}
        t1_words = set(re.findall(r"\b[a-z0-9]+\b", text1.lower())) - stopwords
        t2_words = set(re.findall(r"\b[a-z0-9]+\b", text2.lower())) - stopwords

        if not t1_words or not t2_words:
            return 0.0

        # Jaccard index
        intersection = t1_words.intersection(t2_words)
        union = t1_words.union(t2_words)
        jaccard = len(intersection) / len(union)

        # Sequence matcher ratio
        seq_ratio = difflib.SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

        # Composite score
        return round((jaccard * 0.55) + (seq_ratio * 0.45), 2)

import random
from typing import List
from app.ai.base import AIProvider

class MockProvider(AIProvider):
    async def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        # Generate clean mock responses for local testing
        if "safety" in (system_instruction or "").lower() or "safety" in prompt.lower():
            return (
                "Mock Safety Response: For your immediate safety, contact the National Women Sports Safety Hotline at "
                "1-800-555-SAFE (7233). Document any incident details, secure screenshots if applicable, and report it "
                "through our secure safety center to notify the administrator team immediately. Please consult a trusted "
                "mentor or administrative staff for direct support."
            )
        elif "scholarship" in (system_instruction or "").lower() or "scholarship" in prompt.lower():
            return (
                "Mock Scholarship Response: The Sports Authority Scholarship offers up to 50,000 INR annually for athletes "
                "who have placed in state-level championships. Applications close on October 15. Candidates must submit "
                "their athletic resume, proof of tournament rankings, and income certificates. (Document: Karnataka Sports Quota, Page 2)"
            )
        else:
            return (
                "Mock Response: I am running in local offline mock mode. This answer simulates text generation "
                "since the primary Gemini API provider is either offline or simulated. Please verify your environment "
                "credentials to connect with production-level AI models."
            )

    async def get_embeddings(self, text: str) -> List[float]:
        # Return a deterministic mock vector of dimension 768
        random.seed(hash(text))
        return [random.uniform(-0.1, 0.1) for _ in range(768)]

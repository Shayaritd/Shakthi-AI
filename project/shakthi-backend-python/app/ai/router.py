import logging
from app.ai.base import AIProvider
from app.ai.gemini import GeminiProvider
from app.ai.mock import MockProvider
from app.config import settings

logger = logging.getLogger("shakthi.ai.router")

class AIProviderRouter:
    """Orchestrates AI providers with seamless fallback routing for text and embeddings"""
    
    def __init__(self, primary: AIProvider = None, fallback: AIProvider = None):
        self.primary = primary or GeminiProvider(api_key=settings.GEMINI_API_KEY)
        self.fallback = fallback or MockProvider()

    async def generate(self, prompt: str, system_instruction: str = None) -> str:
        """Tries primary provider, falls back to mock provider on failure"""
        try:
            logger.info("Attempting content generation using Primary AI provider")
            return await self.primary.generate_response(prompt, system_instruction)
        except Exception as e:
            logger.warning(
                f"Primary AI provider failed: {e}. "
                f"Failing over to Mock/Fallback provider.", 
                exc_info=True
            )
            try:
                return await self.fallback.generate_response(prompt, system_instruction)
            except Exception as fe:
                logger.error(f"Fallback AI provider failed: {fe}")
                raise RuntimeError("All configured AI providers failed to generate content.")

    async def embed(self, text: str) -> list[float]:
        """Tries primary embedding generation, falls back to mock embedding on failure"""
        try:
            return await self.primary.get_embeddings(text)
        except Exception as e:
            logger.warning(
                f"Primary embedding generation failed: {e}. "
                f"Failing over to Mock embedding generator.", 
                exc_info=True
            )
            try:
                return await self.fallback.get_embeddings(text)
            except Exception as fe:
                logger.error(f"Fallback embedding generation failed: {fe}")
                raise RuntimeError("All configured embedding providers failed.")

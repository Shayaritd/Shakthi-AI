from abc import ABC, abstractmethod
from typing import List

class AIProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, system_instruction: str = None) -> str:
        """Generate response using the specified provider models"""
        pass

    @abstractmethod
    async def get_embeddings(self, text: str) -> List[float]:
        """Generate text vector embeddings using the provider models"""
        pass

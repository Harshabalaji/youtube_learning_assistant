"""
LLM provider factory — instantiates the appropriate provider based on configuration.
"""

from core.config import settings
from core.logging_config import get_logger
from llm.providers import BaseLLMProvider, OpenAIProvider, GeminiProvider, OllamaProvider

logger = get_logger(__name__)

# Default models for each provider
DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "google": "gemini-1.5-flash",
    "ollama": "llama3",
}


def _is_valid_key(key: str | None) -> bool:
    if not key:
        return False
    k = key.lower().strip()
    return not (k.startswith("your-") or k.startswith("change-") or "api-key-here" in k or k == "")


def get_llm_provider(
    provider: str = None,
    model: str = None,
    temperature: float = 0.3,
) -> BaseLLMProvider:
    """
    Factory function to create an LLM provider instance.

    Args:
        provider: Provider name ('openai', 'google', 'ollama').
                  Falls back to settings.DEFAULT_LLM_PROVIDER.
        model: Specific model to use.
               Falls back to provider's default model.
        temperature: Generation temperature (0.0-1.0).

    Returns:
        An instance of BaseLLMProvider.

    Raises:
        ValueError: If the provider is not supported or API key is missing.
    """
    provider = provider or settings.DEFAULT_LLM_PROVIDER
    provider = provider.lower().strip()

    if provider == "openai":
        if not _is_valid_key(settings.OPENAI_API_KEY):
            # Fallback to Google if available, else Ollama
            if _is_valid_key(settings.GOOGLE_API_KEY):
                provider = "google"
            else:
                provider = "ollama"

    if provider == "google":
        if not _is_valid_key(settings.GOOGLE_API_KEY):
            if _is_valid_key(settings.OPENAI_API_KEY):
                provider = "openai"
            else:
                provider = "ollama"

    if provider == "openai":
        model = model if (model and model != "gpt-4.1") else DEFAULT_MODELS["openai"]
        logger.info("Creating OpenAI provider with model: {}", model)
        return OpenAIProvider(model=model, temperature=temperature)

    elif provider == "google":
        model = model if (model and model != "gemini-2.5-flash") else DEFAULT_MODELS["google"]
        logger.info("Creating Gemini provider with model: {}", model)
        return GeminiProvider(model=model, temperature=temperature)

    elif provider == "ollama":
        model = model or DEFAULT_MODELS["ollama"]
        logger.info("Creating Ollama provider with model: {}", model)
        return OllamaProvider(model=model, temperature=temperature)

    else:
        # Fallback to Ollama or OpenAI/Google
        model = DEFAULT_MODELS["google"]
        return GeminiProvider(model=model, temperature=temperature)


def get_available_providers() -> dict:
    """
    Get information about all available LLM providers.
    
    Returns:
        Dict mapping provider names to their availability and models.
    """
    providers = {}

    providers["google"] = {
        "available": _is_valid_key(settings.GOOGLE_API_KEY),
        "models": ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"],
        "default_model": DEFAULT_MODELS["google"],
    }

    providers["openai"] = {
        "available": _is_valid_key(settings.OPENAI_API_KEY),
        "models": ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
        "default_model": DEFAULT_MODELS["openai"],
    }

    providers["ollama"] = {
        "available": True,  # Always potentially available
        "models": settings.ollama_models_list,
        "default_model": DEFAULT_MODELS["ollama"],
        "base_url": settings.OLLAMA_BASE_URL,
    }

    return providers

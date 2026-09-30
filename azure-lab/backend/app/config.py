"""Azure AI Foundry configuration and lazy client construction.

Everything is driven by environment variables (see .env.example). If the
credentials are missing the app still boots — endpoints report `configured:
false` so the frontend can show a friendly setup screen instead of crashing.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()


def _normalize_endpoint(raw: str) -> str:
    """Reduce any pasted Azure/Foundry URL to its scheme://host base.

    Foundry project URLs like https://x.services.ai.azure.com/api/projects/proj
    must be trimmed to the host, which is what the AzureOpenAI client expects.
    """
    raw = raw.strip().rstrip("/")
    if not raw:
        return ""
    u = urlparse(raw)
    if u.scheme and u.netloc:
        return f"{u.scheme}://{u.netloc}"
    return raw


class Settings:
    endpoint: str = _normalize_endpoint(os.getenv("AZURE_OPENAI_ENDPOINT", ""))
    api_key: str = os.getenv("AZURE_OPENAI_API_KEY", "").strip()
    api_version: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-10-21").strip()
    chat_deployment: str = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT", "").strip()
    embed_deployment: str = os.getenv("AZURE_OPENAI_EMBED_DEPLOYMENT", "").strip()

    @property
    def chat_ready(self) -> bool:
        return bool(self.endpoint and self.api_key and self.chat_deployment)

    @property
    def embed_ready(self) -> bool:
        return bool(self.endpoint and self.api_key and self.embed_deployment)


settings = Settings()


@lru_cache(maxsize=1)
def get_client():
    """Return a cached AzureOpenAI client, or raise if not configured."""
    if not (settings.endpoint and settings.api_key):
        raise RuntimeError("Azure AI Foundry is not configured. Fill in backend/.env")
    from openai import AzureOpenAI

    return AzureOpenAI(
        azure_endpoint=settings.endpoint,
        api_key=settings.api_key,
        api_version=settings.api_version,
    )


def config_status() -> dict:
    return {
        "configured": settings.chat_ready,
        "chat_ready": settings.chat_ready,
        "embed_ready": settings.embed_ready,
        "endpoint": settings.endpoint or None,
        "api_version": settings.api_version,
        "chat_deployment": settings.chat_deployment or None,
        "embed_deployment": settings.embed_deployment or None,
    }

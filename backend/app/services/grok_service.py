"""
Reusable client for the xAI Grok API. All Grok calls in this project go
through here so error handling, timeouts, and retries are consistent —
and so the API key never has to be touched anywhere else in the codebase.
"""
import json
import time
import httpx
from app import config


class GrokServiceError(Exception):
    """Raised for any Grok call failure. Message is always safe to show to a user."""
    def __init__(self, message: str, code: str = "grok_error"):
        super().__init__(message)
        self.code = code


async def call_grok(
    system_prompt: str,
    user_message: str,
    *,
    temperature: float = 0.3,
    max_tokens: int = None,
    force_json: bool = False,
) -> str:
    """
    Calls the Grok chat completions endpoint. Returns the raw text content.
    Raises GrokServiceError with a safe, user-facing message on any failure.
    """
    if not config.grok_configured():
        raise GrokServiceError(
            "Grok API key is not configured. Set XAI_API_KEY in your .env file.",
            code="missing_api_key",
        )

    payload = {
        "model": config.GROK_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens or config.MAX_OUTPUT_TOKENS,
    }
    if force_json:
        payload["response_format"] = {"type": "json_object"}

    headers = {
        "Authorization": f"Bearer {config.XAI_API_KEY}",
        "Content-Type": "application/json",
    }

    last_error: Exception | None = None
    for attempt in range(config.GROK_MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=config.GROK_TIMEOUT_SECONDS) as client:
                resp = await client.post(
                    f"{config.XAI_BASE_URL}/chat/completions",
                    json=payload,
                    headers=headers,
                )
            if resp.status_code == 401:
                raise GrokServiceError("Grok API key was rejected (invalid key).", code="invalid_api_key")
            if resp.status_code == 429:
                raise GrokServiceError("Grok API rate limit reached. Please try again shortly.", code="rate_limited")
            if resp.status_code == 404:
                raise GrokServiceError(f"Grok model '{config.GROK_MODEL}' is unavailable.", code="model_unavailable")
            if resp.status_code >= 500:
                raise GrokServiceError("Grok API is temporarily unavailable.", code="upstream_error")
            resp.raise_for_status()

            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                raise GrokServiceError("Grok returned an empty response.", code="malformed_response")
            content = choices[0].get("message", {}).get("content")
            if content is None:
                raise GrokServiceError("Grok returned a malformed response.", code="malformed_response")
            return content

        except GrokServiceError as e:
            if e.code in {"invalid_api_key", "missing_api_key", "model_unavailable"}:
                raise
            last_error = e
        except httpx.TimeoutException as e:
            last_error = GrokServiceError("Grok API request timed out.", code="timeout")
        except httpx.NetworkError as e:
            last_error = GrokServiceError("Could not reach the Grok API (network error).", code="network_error")
        except json.JSONDecodeError:
            last_error = GrokServiceError("Grok returned an unparseable response.", code="malformed_response")

        if attempt < config.GROK_MAX_RETRIES:
            time.sleep(0.4 * (attempt + 1))

    raise last_error or GrokServiceError("Grok API call failed for an unknown reason.")


def timed_ms(start: float) -> float:
    return round((time.perf_counter() - start) * 1000, 2)

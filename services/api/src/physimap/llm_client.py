"""
LLM client for PhysiMap V0.
Handles OpenAI API calls for generating explanations.
"""

import os
from openai import OpenAI


def call_llm(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    max_output_tokens: int = 500
) -> str:
    """
    Call OpenAI Responses API and return the assistant's response.
    
    Args:
        messages: List of message dicts with "role" and "content" keys
                  Expected format: [{"role": "system", "content": ...},
                                   {"role": "user", "content": ...}, ...]
        model: OpenAI model to use (default: gpt-4o-mini)
        max_output_tokens: Maximum tokens in the response (default: 500)
        
    Returns:
        The assistant's response text as a string
        
    Raises:
        ValueError: If OPENAI_API_KEY environment variable is not set
    """
    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY environment variable is not set. "
            "Please set it before starting the server."
        )

    client = OpenAI(api_key=api_key)

    # Call the Chat Completions API (stable across all SDK versions)
    response = client.chat.completions.create(
        model=model,
        messages=messages,  # type: ignore[arg-type]
        max_tokens=max_output_tokens,
    )

    return response.choices[0].message.content or ""


def call_llm_json(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    max_output_tokens: int = 800
) -> str:
    """
    Call OpenAI with JSON mode enabled and return the raw JSON string.
    The caller is responsible for parsing the returned string.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY environment variable is not set. "
            "Please set it before starting the server."
        )

    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=model,
        messages=messages,  # type: ignore[arg-type]
        max_tokens=max_output_tokens,
        response_format={"type": "json_object"},
    )

    return response.choices[0].message.content or "{}"


if __name__ == "__main__":
    # Demo: Send a trivial prompt and print response
    print("=== PhysiMap LLM Client Demo ===\n")
    
    try:
        test_messages = [
            {"role": "system", "content": "You are a helpful fitness assistant."},
            {"role": "user", "content": "Say 'Hello from PhysiMap!' and nothing else."}
        ]
        
        print("Sending test prompt to OpenAI Responses API...")
        print(f"Messages: system + user")
        
        response_text = call_llm(test_messages, max_output_tokens=100)
        
        print(f"\nResponse from LLM:")
        print("-" * 60)
        print(response_text)
        print("-" * 60)
        
        print("\n=== Demo Complete ===")
        
    except ValueError as e:
        print(f"ERROR: {e}")
        print("\nTo run this demo, set your OpenAI API key:")
        print("  export OPENAI_API_KEY='your-key-here'  (Linux/Mac)")
        print("  $env:OPENAI_API_KEY='your-key-here'   (PowerShell)")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")
        print("\nNote: This uses the OpenAI Responses API.")


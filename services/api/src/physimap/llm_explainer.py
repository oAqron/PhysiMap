"""
LLM explainer for PhysiMap V0.
Builds messages for LLM API calls to explain bias analysis results.
"""

import json


def build_messages(
    analysis: dict,
    self_assessment: str,
    preferences: str | None = None
) -> list[dict]:
    """
    Build OpenAI-style messages for explaining bias analysis.
    
    Args:
        analysis: The bias engine analysis result dictionary
        self_assessment: User's self-assessment text
        preferences: Optional user preferences
        
    Returns:
        List of message dicts with "role" and "content" keys
    """
    # Make self_assessment robust
    self_assessment = (self_assessment or "").strip()
    
    # Build system message with strict guardrails
    system_content = """You are a fitness coaching assistant for PhysiMap.

STRICT GUARDRAILS:
1. Do NOT perform new analysis. Your job is to explain the provided analysis object only.
2. Do NOT add any muscles, exercises, or recommendations that are not present in the analysis data provided.
3. Do NOT make up information. Only explain and elaborate on what is in the analysis.
4. If analysis["clarifying_questions"] is non-empty, respond with ONLY the "Questions" section. Do not include Summary, What to Bias Toward, What to Reduce, or Common Mistakes sections.
5. If analysis["clarifying_questions"] is empty, keep your response structured with these headings:
   - Summary
   - What to Bias Toward
   - What to Reduce
   - Common Mistakes
6. Use bullet points under each heading.

Your role is to explain the analysis in a friendly, supportive tone while being precise about the data provided."""

    # Build user message with self-assessment and analysis
    user_parts = [
        "Please explain the bias analysis below and provide guidance based on it.",
        "",
        "MY SELF-ASSESSMENT:",
        self_assessment,
    ]
    
    if preferences:
        user_parts.extend([
            "",
            "MY PREFERENCES:",
            preferences.strip(),
        ])
    
    user_parts.extend([
        "",
        "BIAS ANALYSIS:",
        json.dumps(analysis, indent=2, sort_keys=True)
    ])
    
    user_content = "\n".join(user_parts)
    
    # Return messages in OpenAI format
    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": user_content}
    ]
    
    return messages


def build_analysis_messages(survey_data: dict) -> list[dict]:
    """
    Build OpenAI messages for the new GPT-wrapper /analyze endpoint.

    GPT receives the structured survey answers and must return a JSON object
    that drives both the muscle-map visualisation and the written advice.

    Valid muscle IDs (used in targeted / underemphasized / overemphasized):
      chest, front_delts, lateral_delts, rear_delts, upper_traps,
      biceps, triceps, lats, abs, quads, hamstrings, calves
    """
    system_content = """\
You are an expert fitness coaching AI for PhysiMap.

Given a user's survey answers, return a single JSON object with exactly these keys:

{
  "targeted":         [<1-4 muscle IDs the user specifically wants to develop>],
  "underemphasized":  [<0-3 muscle IDs the user is likely neglecting that support their goal>],
  "overemphasized":   [<0-2 muscle IDs that appear overtrained or should be reduced>],
  "do_more":          [<3-6 specific, actionable exercise/training recommendations>],
  "do_less":          [<0-3 things to cut back or avoid>],
  "common_mistakes":  [<2-4 common mistakes relevant to this user's situation>],
  "clarifying_questions": [<0-2 questions if you genuinely need more info, otherwise empty>],
  "response_text":    "<2-4 paragraphs of personalised advice as a plain string>"
}

Valid muscle IDs (only use these exact strings):
  chest, front_delts, lateral_delts, rear_delts, upper_traps,
  biceps, triceps, lats, abs, quads, hamstrings, calves

Rules:
- targeted: the muscles the user said they want to develop. Map their goal to the correct IDs.
- underemphasized: muscles they are likely neglecting that support long-term progress.
- overemphasized: muscles that appear overtrained relative to goal balance.
- response_text: be specific — reference their exact exercises, volume, and goal in the advice.
- Do NOT include any text outside the JSON object."""

    lines = ["USER SURVEY ANSWERS:"]
    for key, value in survey_data.items():
        if value:
            lines.append(f"  {key}: {value}")

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": "\n".join(lines)},
    ]


def build_clarify_v2_messages(
    survey_data: dict,
    clarifying_question: str,
    user_answer: str,
) -> list[dict]:
    """
    Follow-up clarification messages for the new /clarify endpoint.
    Uses the survey payload (dict) rather than raw text strings.
    """
    system_content = """\
You are an expert fitness coaching AI for PhysiMap.

The user previously completed a survey and you asked a clarifying question. They have answered it.
Using all the context below, provide structured, personalised training advice.

Format your response with these headings, using bullet points under each:
  - Summary
  - What to Focus On
  - What to Reduce
  - Common Mistakes to Avoid

Reference the user's answer to the clarifying question directly in your Summary."""

    lines = [
        "ORIGINAL SURVEY ANSWERS:",
        *[f"  {k}: {v}" for k, v in survey_data.items() if v],
        "",
        f"CLARIFYING QUESTION: {clarifying_question}",
        f"USER'S ANSWER: {user_answer.strip()}",
        "",
        "Please provide detailed personalised advice.",
    ]

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": "\n".join(lines)},
    ]


def build_clarify_messages(
    analysis: dict,
    self_assessment: str,
    clarifying_question: str,
    user_answer: str,
    preferences: str | None = None,
) -> list[dict]:
    """
    Build OpenAI-style messages for a follow-up clarification exchange.

    After the initial analysis surfaces a clarifying question and the user
    has answered it, this function constructs the full context so the LLM
    can produce concrete, personalised advice.

    Args:
        analysis: The bias engine analysis result dictionary
        self_assessment: User's original self-assessment text
        clarifying_question: The question the AI asked the user
        user_answer: The user's answer to that question
        preferences: Optional user preferences

    Returns:
        List of message dicts with "role" and "content" keys
    """
    self_assessment = (self_assessment or "").strip()

    system_content = """You are a fitness coaching assistant for PhysiMap.

You previously analysed the user's training and asked a clarifying question. The user has now answered it. Using all the context below, provide concrete, personalised training advice.

STRICT GUARDRAILS:
1. Base your advice on the original analysis data provided plus the new clarification.
2. Do NOT add muscles or exercises not present in the analysis.
3. Structure your response with these headings:
   - Summary
   - What to Bias Toward
   - What to Reduce
   - Common Mistakes
4. Use bullet points under each heading.
5. Directly reference the user's answer to the clarifying question in your Summary."""

    user_parts = [
        "Here is the original analysis and the clarification I just provided.",
        "",
        "MY SELF-ASSESSMENT:",
        self_assessment,
    ]

    if preferences:
        user_parts.extend([
            "",
            "MY PREFERENCES:",
            preferences.strip(),
        ])

    user_parts.extend([
        "",
        "BIAS ANALYSIS:",
        json.dumps(analysis, indent=2, sort_keys=True),
        "",
        "CLARIFYING QUESTION YOU ASKED:",
        clarifying_question,
        "",
        "MY ANSWER:",
        user_answer.strip(),
        "",
        "Please now provide detailed personalised advice based on everything above.",
    ])

    return [
        {"role": "system", "content": system_content},
        {"role": "user", "content": "\n".join(user_parts)},
    ]


if __name__ == "__main__":
    # Demo: Build messages with a fake analysis
    print("=== PhysiMap LLM Explainer Demo ===\n")
    
    fake_analysis = {
        "underemphasized": ["lateral_delts", "rear_delts"],
        "overemphasized": ["front_delts"],
        "why": [
            "Front delts often overdeveloped from chest work",
            "Lateral raises are key for shoulder width"
        ],
        "do_more": [
            "Add more work for lateral delts.",
            "Add more work for rear delts."
        ],
        "do_less": [
            "Reduce emphasis on front delts."
        ],
        "exercise_categories": [
            "lateral_raise_variations",
            "rear_delt_isolations"
        ],
        "common_mistakes": [
            "Neglecting rear delts in favor of front/lateral work",
            "Using too much weight on lateral raises"
        ],
        "clarifying_questions": [
            "Are you currently experiencing shoulder pain or injury symptoms?"
        ]
    }
    
    sample_assessment = "I do bench press 3x per week and some overhead press. I hate lateral raises."
    sample_preferences = "I prefer dumbbells over cables"
    
    messages = build_messages(
        analysis=fake_analysis,
        self_assessment=sample_assessment,
        preferences=sample_preferences
    )
    
    print("Generated Messages:\n")
    
    for i, msg in enumerate(messages, 1):
        print(f"Message {i} - Role: {msg['role']}")
        print(f"Content Preview: {msg['content'][:150]}...")
        print(f"Content Length: {len(msg['content'])} characters")
        print()
    
    print("Full System Message:")
    print("-" * 60)
    print(messages[0]["content"])
    print("-" * 60)
    
    print("\nFull User Message:")
    print("-" * 60)
    print(messages[1]["content"])
    print("-" * 60)
    
    print("\n=== Demo Complete ===")


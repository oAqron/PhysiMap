"""
Minimal CLI entry point for PhysiMap V0.
Run with: python -m physimap.main
"""

from physimap.bias_engine import analyze
from physimap.llm_explainer import build_messages
from physimap.llm_client import call_llm


def read_multiline(prompt: str) -> str:
    """Read multi-line input until the user enters a blank line."""
    print(prompt)
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)
    return "\n".join(lines)


def main():
    print("=" * 50)
    print("  PhysiMap V0 — Training Bias Analyzer")
    print("=" * 50)
    print()

    # 1. Goal ID
    goal_id = input("Goal [broader_shoulders]: ").strip()
    if not goal_id:
        goal_id = "broader_shoulders"

    # 2. Self-assessment (required, multi-line)
    self_assessment = read_multiline(
        "\nDescribe your current training (blank line to finish):"
    )
    if not self_assessment.strip():
        print("\nSelf-assessment is required. Exiting.")
        return

    # 3. Preferences (optional)
    preferences = input("\nPreferences (optional, press Enter to skip): ").strip() or None

    # 4. Run bias analysis
    print("\nAnalyzing...")
    analysis = analyze(goal_id, self_assessment, preferences=preferences)

    # 5. If there are clarifying questions, print them and stop
    if analysis["clarifying_questions"]:
        print("\n--- Questions ---")
        for question in analysis["clarifying_questions"]:
            print(f"  - {question}")
        print("\nPlease answer the questions above and run again.")
        return

    # 6. Otherwise, call LLM for a friendly explanation
    messages = build_messages(analysis, self_assessment, preferences)

    print("Generating explanation...\n")
    try:
        text = call_llm(messages)
        print(text)
    except ValueError as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    main()

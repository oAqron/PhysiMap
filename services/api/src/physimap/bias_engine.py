"""
Bias engine for PhysiMap V0.
Deterministic analysis of user self-assessments to provide personalized guidance.
"""

from physimap.goals import get_goal, GoalId, GoalDefinition


def analyze(
    goal_id: str | GoalId,
    self_assessment: str,
    training_days_per_week: int | None = None,
    equipment: str | None = None,
    preferences: str | None = None
) -> dict:
    """
    Analyze user input and provide personalized guidance.
    
    Args:
        goal_id: The fitness goal to analyze for
        self_assessment: User's description of their current training
        training_days_per_week: Optional training frequency
        equipment: Optional equipment availability
        preferences: Optional user preferences
        
    Returns:
        Dict containing guidance with keys: underemphasized, overemphasized,
        why, do_more, do_less, exercise_categories, common_mistakes, 
        clarifying_questions
    """
    # Ensure self_assessment is always a string
    self_assessment = self_assessment or ""
    
    # Load goal definition
    goal = get_goal(goal_id)
    
    # Normalize self-assessment once
    normalized_text = self_assessment.lower().strip()
    
    # Initialize result lists
    underemphasized = list(goal.primary_muscles)  # Start with primary muscles
    overemphasized = []
    why = []
    clarifying_questions = []
    
    # Track if any rules matched
    rules_matched = False
    
    # Apply bias rules using substring matching
    for rule in goal.bias_rules:
        # Check if any trigger keyword is a substring of normalized text
        matched = any(
            keyword.lower() in normalized_text
            for keyword in rule["trigger_keywords"]
        )
        
        if matched:
            rules_matched = True
            effect = rule["effect"]
            targets = rule.get("targets", [])
            reason = rule.get("reason", "")
            
            if effect == "increase_focus":
                # Add targets to underemphasized (avoid duplicates)
                for target in targets:
                    if target not in underemphasized:
                        underemphasized.append(target)
                # Add reason to why
                if reason and reason not in why:
                    why.append(reason)
                        
            elif effect == "decrease_focus":
                # Add targets to overemphasized (avoid duplicates)
                for target in targets:
                    if target not in overemphasized:
                        overemphasized.append(target)
                # Add reason to why
                if reason and reason not in why:
                    why.append(reason)
                        
            elif effect == "ask_question":
                # Generate clarifying question from rule
                question = None
                
                # Check for pain/injury keywords in user's normalized text
                has_pain_keyword = any(kw in normalized_text for kw in ["pain", "hurt", "injury", "impingement"])
                
                if has_pain_keyword and not targets:
                    question = "Are you currently experiencing shoulder pain or injury symptoms?"
                elif targets:
                    target_names = ", ".join(t.replace("_", " ") for t in targets)
                    question = f"Are you intentionally emphasizing {target_names}, or is it happening unintentionally?"
                elif reason:
                    question = f"Can you clarify: {reason}?"
                    
                if question and question not in clarifying_questions:
                    clarifying_questions.append(question)
    
    # Handle uncertainty: if no rules matched and no questions generated, use goal's clarifying questions
    if not rules_matched and not clarifying_questions:
        clarifying_questions = list(goal.clarifying_questions)
    
    # Generate do_more from underemphasized muscles
    do_more = []
    for muscle in underemphasized:
        advice = f"Add more work for {muscle.replace('_', ' ')}."
        do_more.append(advice)
    
    # Generate do_less from overemphasized muscles
    do_less = []
    for muscle in overemphasized:
        advice = f"Reduce emphasis on {muscle.replace('_', ' ')}."
        do_less.append(advice)
    
    # Build result dictionary with exact keys
    result = {
        "underemphasized": underemphasized,
        "overemphasized": overemphasized,
        "why": why,
        "do_more": do_more,
        "do_less": do_less,
        "exercise_categories": list(goal.recommended_categories),
        "common_mistakes": list(goal.common_mistakes),
        "clarifying_questions": clarifying_questions
    }
    
    return result


if __name__ == "__main__":
    # Demo: Test the bias engine with sample input
    print("=== PhysiMap Bias Engine Demo ===\n")
    
    sample_assessment = """
    I do bench press 3x per week and some overhead press.
    I hate lateral raises, they hurt my shoulders.
    """
    
    result = analyze(
        goal_id="broader_shoulders",
        self_assessment=sample_assessment
    )
    
    print(f"Goal: Broader Shoulders")
    print(f"Assessment: {sample_assessment.strip()}\n")
    
    print(f"Underemphasized: {result['underemphasized']}")
    print(f"Overemphasized: {result['overemphasized']}")
    
    print(f"\nWhy:")
    for reason in result['why']:
        print(f"  {reason}")
    
    print(f"\nDo More:")
    for item in result['do_more']:
        print(f"  • {item}")
    
    print(f"\nDo Less:")
    for item in result['do_less']:
        print(f"  • {item}")
    
    print(f"\nExercise Categories:")
    for cat in result['exercise_categories']:
        print(f"  - {cat}")
    
    print(f"\nCommon Mistakes:")
    for mistake in result['common_mistakes'][:2]:  # Show first 2
        print(f"  ! {mistake}")
    
    print(f"\nClarifying Questions:")
    for q in result['clarifying_questions']:
        print(f"  ? {q}")
    
    print("\n=== Demo Complete ===")


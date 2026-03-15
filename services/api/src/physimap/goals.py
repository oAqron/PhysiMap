"""
Goal definitions for PhysiMap V0.
Data-only file containing goal definitions, muscle vocabulary, and exercise categories.
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Any


# Vocabulary constants
MUSCLES = [
    "lateral_delts",
    "rear_delts",
    "front_delts",
    "upper_traps",
    "rotator_cuff",
    "chest"
]

CATEGORIES = [
    "lateral_raise_variations",
    "rear_delt_isolations",
    "overhead_pressing",
    "scapular_stability",
    "rotator_cuff_prehab"
]


class GoalId(Enum):
    """Enumeration of available fitness goals."""
    BROADER_SHOULDERS = "broader_shoulders"


@dataclass
class GoalDefinition:
    """
    Complete definition of a fitness goal.
    
    Attributes:
        id: Unique identifier for the goal (GoalId enum)
        name: Human-readable name
        description: Detailed description of the goal
        primary_muscles: Main muscle groups targeted
        secondary_muscles: Supporting muscle groups
        overemphasis_risks: Potential issues from overtraining
        bias_rules: Rules for exercise bias engine
        recommended_categories: Exercise categories to prioritize
        common_mistakes: Frequent errors users make
        clarifying_questions: Questions to refine the goal
    """
    id: GoalId
    name: str
    description: str
    primary_muscles: List[str]
    secondary_muscles: List[str]
    overemphasis_risks: List[str]
    bias_rules: List[Dict[str, Any]]
    recommended_categories: List[str]
    common_mistakes: List[str]
    clarifying_questions: List[str]


# Goal definitions
GOALS = {
    GoalId.BROADER_SHOULDERS: GoalDefinition(
        id=GoalId.BROADER_SHOULDERS,
        name="Broader Shoulders",
        description=(
            "Build wider, more developed shoulders with emphasis on lateral deltoids "
            "for width, while maintaining balanced development of all three deltoid heads "
            "and supporting rotator cuff health."
        ),
        primary_muscles=["lateral_delts", "rear_delts"],
        secondary_muscles=["front_delts", "upper_traps", "rotator_cuff"],
        overemphasis_risks=[
            "Neglecting rear delts can lead to shoulder imbalances and internal rotation",
            "Overtraining front delts (often from excessive pressing) risks impingement",
            "Ignoring rotator cuff work increases injury risk with heavy overhead movements",
            "Too much trap activation can create a 'shrugging' appearance instead of width"
        ],
        bias_rules=[
            {
                "trigger_keywords": ["overhead press", "press overhead"],
                "effect": "increase_focus",
                "targets": ["front_delts"],
                "reason": "Overhead pressing builds shoulder mass and strength"
            },
            {
                "trigger_keywords": ["bench", "chest"],
                "effect": "decrease_focus",
                "targets": ["front_delts"],
                "reason": "Front delts often overdeveloped from chest work; prioritize lateral/rear delts"
            },
            {
                "trigger_keywords": ["no laterals", "hate lateral raises", "never lateral raise", "skip laterals"],
                "effect": "increase_focus",
                "targets": ["lateral_delts"],
                "reason": "Lateral raises are key for shoulder width; user may need alternative variations"
            },
            {
                "trigger_keywords": ["shrug", "trap"],
                "effect": "ask_question",
                "targets": ["upper_traps"],
                "reason": "Excessive trap development can reduce appearance of shoulder width"
            },
            {
                "trigger_keywords": ["pain", "hurt", "injury", "impingement"],
                "effect": "ask_question",
                "targets": [],
                "reason": "Pain or injury requires assessment before recommending exercises"
            },
            {
                "trigger_keywords": ["rotator", "cuff", "external rotation"],
                "effect": "increase_focus",
                "targets": ["rotator_cuff"],
                "reason": "Rotator cuff health is essential for sustainable shoulder development"
            }
        ],
        recommended_categories=[
            "lateral_raise_variations",
            "rear_delt_isolations",
            "overhead_pressing",
            "scapular_stability",
            "rotator_cuff_prehab"
        ],
        common_mistakes=[
            "Neglecting rear delts in favor of front/lateral work",
            "Using too much weight on lateral raises with poor form",
            "Excessive shrugging during lateral raises (overusing traps)",
            "Skipping rotator cuff prehab work",
            "Not balancing push-to-pull ratio (should be 1:1 or more pulling)"
        ],
        clarifying_questions=[
            "Do you have any existing shoulder pain or mobility issues?",
            "Are you currently doing more pushing or pulling exercises?",
            "How many days per week can you dedicate to shoulder-focused training?",
            "Do you have access to cables, dumbbells, and bands for variety?"
        ]
    )
}


def get_goal(goal_id: str | GoalId) -> GoalDefinition:
    """
    Retrieve a goal definition by ID.
    
    Normalizes string inputs to handle various formats (e.g., "broader_shoulders",
    "BROADER_SHOULDERS").
    
    Args:
        goal_id: Goal identifier as string or GoalId enum
        
    Returns:
        GoalDefinition for the requested goal
        
    Raises:
        ValueError: If goal_id is not recognized
    """
    # If already a GoalId enum, use it directly
    if isinstance(goal_id, GoalId):
        if goal_id in GOALS:
            return GOALS[goal_id]
        raise ValueError(f"Goal '{goal_id.value}' exists in enum but not in GOALS dict")
    
    # Normalize string input to lowercase with underscores
    normalized = goal_id.lower().strip().replace(" ", "_").replace("-", "_")
    
    # Try to match against known GoalIds
    for goal_enum in GoalId:
        if goal_enum.value == normalized:
            return GOALS[goal_enum]
    
    # If not found, provide helpful error message
    available_goals = [g.value for g in GoalId]
    raise ValueError(
        f"Unknown goal: '{goal_id}'. "
        f"Available goals: {', '.join(available_goals)}"
    )


if __name__ == "__main__":
    # Demo: Print goal information
    print("=== PhysiMap Goals Demo ===\n")
    
    # Test different input formats
    test_inputs = ["broader_shoulders", "BROADER_SHOULDERS", GoalId.BROADER_SHOULDERS]
    
    for test_input in test_inputs:
        goal = get_goal(test_input)
        print(f"Input: {test_input}")
        print(f"Goal: {goal.name}")
        print(f"Primary Muscles: {', '.join(goal.primary_muscles)}")
        print()
    
    # Test error handling
    print("Testing invalid goal...")
    try:
        get_goal("invalid_goal")
    except ValueError as e:
        print(f"✓ Correctly raised ValueError: {e}")
    
    print("\n=== Demo Complete ===")



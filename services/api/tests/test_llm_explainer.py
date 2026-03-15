"""
Tests for PhysiMap V0 LLM explainer.
"""

import pytest
from physimap.llm_explainer import build_messages


def test_build_messages_shape_and_roles():
    """Test that build_messages returns correct structure with proper roles."""
    messages = build_messages(analysis={}, self_assessment="test")
    
    assert isinstance(messages, list) and len(messages) == 2
    assert messages[0]["role"] == "system"
    assert messages[1]["role"] == "user"


def test_user_message_contains_assessment_and_json():
    """Test that user message contains all required sections."""
    analysis = {
        "underemphasized": ["lateral_delts"],
        "clarifying_questions": []
    }
    messages = build_messages(
        analysis=analysis,
        self_assessment="hello",
        preferences="no laterals"
    )
    
    user_content = messages[1]["content"]
    
    assert "MY SELF-ASSESSMENT:" in user_content
    assert "MY PREFERENCES:" in user_content
    assert "BIAS ANALYSIS:" in user_content
    assert '"underemphasized"' in user_content


"""
Tests for PhysiMap V0 bias engine.
"""

import pytest
from physimap.bias_engine import analyze


def test_returns_expected_keys():
    """Test that analyze returns all expected dictionary keys."""
    result = analyze("broader_shoulders", "I do bench press")
    
    expected_keys = {
        "underemphasized",
        "overemphasized",
        "why",
        "do_more",
        "do_less",
        "exercise_categories",
        "common_mistakes",
        "clarifying_questions"
    }
    
    assert set(result.keys()) == expected_keys


def test_bench_flags_front_delts_overemphasized():
    """Test that bench press triggers front_delts as overemphasized."""
    result = analyze("broader_shoulders", "I bench and train chest a lot")
    
    assert "front_delts" in result["overemphasized"]


def test_hate_laterals_adds_lateral_delts():
    """Test that avoiding lateral raises adds lateral_delts to underemphasized."""
    result = analyze("broader_shoulders", "I hate lateral raises and I skip laterals")
    
    assert "lateral_delts" in result["underemphasized"]


def test_pain_generates_pain_question():
    """Test that pain keywords generate appropriate clarifying question."""
    result = analyze("broader_shoulders", "Lateral raises hurt my shoulders")
    
    assert any(
        "pain" in q.lower() or "injury" in q.lower() or "hurt" in q.lower()
        for q in result["clarifying_questions"]
    )


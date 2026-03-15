import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Ellipse, Path, Circle, G } from 'react-native-svg';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const API_BASE_URL = 'http://10.0.2.2:8000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Screen = 'onboarding' | 'loading' | 'results';

interface Answers {
  muscleTarget: string;        // Step 0 — which muscle group
  specificGoal: string;        // Step 1 — branch-specific aspect
  currentExercises: string[];  // Step 2 — current exercises (multi-select)
  setsPerWeek: string;         // Step 3 — weekly volume
  performanceLevel: string;    // Step 4 — branch-specific strength/context
  experience: string;          // Step 5 — training age
  trainingDays: string;        // Step 6 — days per week
  equipment: string[];         // Step 7 — available gear (multi-select)
  bodyWeight: string;          // Step 8 — body weight range
  notes: string;               // Step 9 — injuries / free text (optional)
}

interface AnalysisResult {
  targeted: string[];
  underemphasized: string[];
  overemphasized: string[];
  do_more: string[];
  do_less: string[];
  common_mistakes: string[];
  clarifying_questions: string[];
}

// ---------------------------------------------------------------------------
// Survey option sets
// ---------------------------------------------------------------------------

// Step 0 — which muscle group to focus on
const MUSCLE_TARGET_OPTIONS = [
  { label: '💪  Chest', value: 'chest' },
  { label: '🔙  Back & Lats', value: 'back' },
  { label: '🏋  Shoulders', value: 'shoulders' },
  { label: '💪  Arms  (Biceps & Triceps)', value: 'arms' },
  { label: '🔥  Core & Abs', value: 'core' },
  { label: '🦵  Legs', value: 'legs' },
];

// Step 1 — specific goal per branch
const SPECIFIC_GOAL_OPTIONS: Record<string, { label: string; value: string }[]> = {
  chest: [
    { label: 'Upper chest fullness', value: 'Upper chest fullness' },
    { label: 'Overall chest mass', value: 'Overall chest mass' },
    { label: 'Inner chest definition', value: 'Inner chest definition' },
    { label: 'Lower chest thickness', value: 'Lower chest thickness' },
  ],
  back: [
    { label: 'Wider back / V-taper', value: 'Wider back and V-taper' },
    { label: 'Thicker / denser back', value: 'Thicker and denser back' },
    { label: 'Overall back development', value: 'Overall back development' },
    { label: 'Improve posture', value: 'Improve posture' },
  ],
  shoulders: [
    { label: 'Lateral delts — shoulder width', value: 'Lateral delt width' },
    { label: 'Rear delts — balance & health', value: 'Rear delt balance' },
    { label: 'Front delts — pressing strength', value: 'Front delt pressing strength' },
    { label: 'Overall shoulder development', value: 'Overall shoulder development' },
  ],
  arms: [
    { label: 'Bicep size & peak', value: 'Bicep size and peak' },
    { label: 'Tricep size  (2/3 of arm)', value: 'Tricep size' },
    { label: 'Overall arm size', value: 'Overall arm size' },
    { label: 'Arm definition & conditioning', value: 'Arm definition' },
  ],
  core: [
    { label: 'Visible six-pack aesthetics', value: 'Visible six-pack' },
    { label: 'Core strength for heavy lifting', value: 'Core strength for lifting' },
    { label: 'Stability & injury prevention', value: 'Core stability' },
    { label: 'Complete core development', value: 'Complete core development' },
  ],
  legs: [
    { label: 'Quad size & shape', value: 'Quad size and shape' },
    { label: 'Hamstring development', value: 'Hamstring development' },
    { label: 'Calf development', value: 'Calf development' },
    { label: 'Overall leg mass', value: 'Overall leg mass' },
  ],
};

// Step 2 — current exercises per branch (multi-select)
const CURRENT_EXERCISES_OPTIONS: Record<string, { label: string; value: string }[]> = {
  chest: [
    { label: 'Flat barbell bench press', value: 'Flat barbell bench' },
    { label: 'Incline bench press', value: 'Incline bench' },
    { label: 'Decline bench press', value: 'Decline bench' },
    { label: 'Dumbbell press', value: 'Dumbbell press' },
    { label: 'Push-ups', value: 'Push-ups' },
    { label: 'Cable flyes / crossovers', value: 'Cable flyes' },
    { label: 'Pec deck machine', value: 'Pec deck' },
    { label: 'Chest dips', value: 'Chest dips' },
  ],
  back: [
    { label: 'Pull-ups / chin-ups', value: 'Pull-ups' },
    { label: 'Lat pulldown', value: 'Lat pulldown' },
    { label: 'Barbell row', value: 'Barbell row' },
    { label: 'Dumbbell row', value: 'Dumbbell row' },
    { label: 'Seated cable row', value: 'Cable row' },
    { label: 'T-bar row', value: 'T-bar row' },
    { label: 'Face pulls', value: 'Face pulls' },
    { label: 'Deadlifts', value: 'Deadlifts' },
  ],
  shoulders: [
    { label: 'Barbell overhead press', value: 'Barbell OHP' },
    { label: 'Dumbbell overhead press', value: 'Dumbbell OHP' },
    { label: 'Lateral raises', value: 'Lateral raises' },
    { label: 'Cable lateral raises', value: 'Cable laterals' },
    { label: 'Face pulls', value: 'Face pulls' },
    { label: 'Rear delt flies', value: 'Rear delt flies' },
    { label: 'Front raises', value: 'Front raises' },
    { label: 'Upright rows', value: 'Upright rows' },
  ],
  arms: [
    { label: 'Barbell curl', value: 'Barbell curl' },
    { label: 'Dumbbell curl', value: 'Dumbbell curl' },
    { label: 'Hammer curl', value: 'Hammer curl' },
    { label: 'Preacher curl', value: 'Preacher curl' },
    { label: 'Tricep pushdown', value: 'Tricep pushdown' },
    { label: 'Skull crushers', value: 'Skull crushers' },
    { label: 'Close-grip bench press', value: 'Close-grip bench' },
    { label: 'Overhead tricep extension', value: 'Overhead tricep' },
    { label: 'Dips', value: 'Dips' },
  ],
  core: [
    { label: 'Crunches / sit-ups', value: 'Crunches' },
    { label: 'Hanging leg raises', value: 'Hanging leg raises' },
    { label: 'Plank variations', value: 'Planks' },
    { label: 'Cable crunches', value: 'Cable crunches' },
    { label: 'Ab wheel rollouts', value: 'Ab wheel' },
    { label: 'Oblique / twisting work', value: 'Oblique work' },
    { label: 'Compound lifts only  (no isolation)', value: 'Compound only' },
  ],
  legs: [
    { label: 'Barbell squats', value: 'Squats' },
    { label: 'Leg press', value: 'Leg press' },
    { label: 'Romanian deadlift', value: 'RDL' },
    { label: 'Leg curl', value: 'Leg curl' },
    { label: 'Leg extension', value: 'Leg extension' },
    { label: 'Lunges / split squats', value: 'Lunges' },
    { label: 'Calf raises', value: 'Calf raises' },
  ],
};

// Step 3 — weekly sets for target muscle
const SETS_PER_WEEK_OPTIONS = [
  { label: 'Under 6 sets / week', value: 'Under 6 sets per week' },
  { label: '6 – 10 sets / week', value: '6-10 sets per week' },
  { label: '11 – 15 sets / week', value: '11-15 sets per week' },
  { label: '16+ sets / week', value: '16+ sets per week' },
];

// Step 4 — performance / context level (per branch)
const PERFORMANCE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  chest: [
    { label: 'Under 60 kg bench  (< 132 lbs)', value: 'Bench under 60 kg' },
    { label: '60 – 80 kg bench', value: 'Bench 60-80 kg' },
    { label: '80 – 100 kg bench', value: 'Bench 80-100 kg' },
    { label: '100 – 120 kg bench', value: 'Bench 100-120 kg' },
    { label: '120 – 140 kg bench', value: 'Bench 120-140 kg' },
    { label: 'Over 140 kg bench', value: 'Bench 140+ kg' },
    { label: "Don't know / N/A", value: 'Bench unknown' },
  ],
  back: [
    { label: "Can't do pull-ups yet", value: '0 pull-ups' },
    { label: '1 – 5 pull-ups', value: '1-5 pull-ups' },
    { label: '6 – 10 pull-ups', value: '6-10 pull-ups' },
    { label: '10+ pull-ups', value: '10+ pull-ups' },
    { label: 'I prefer machines / cables', value: 'Prefers machine pulling' },
  ],
  shoulders: [
    { label: 'Heavy OHP is my main movement', value: 'Heavy OHP main lift' },
    { label: 'I press but keep weight moderate', value: 'Moderate OHP' },
    { label: 'I mostly avoid overhead pressing', value: 'Avoids OHP' },
    { label: 'Shoulder pain prevents pressing', value: 'Shoulder pain prevents OHP' },
  ],
  arms: [
    { label: 'Arms are roughly balanced', value: 'Arms balanced' },
    { label: 'Triceps lag behind biceps', value: 'Triceps lag' },
    { label: 'Biceps lag behind triceps', value: 'Biceps lag' },
    { label: 'Left arm is weaker', value: 'Left arm weaker' },
    { label: 'Right arm is weaker', value: 'Right arm weaker' },
  ],
  core: [
    { label: 'Lean — abs already visible', value: 'Lean / abs visible' },
    { label: 'Some fat — abs partially visible', value: 'Moderate fat / abs partially visible' },
    { label: 'Higher body fat — abs covered', value: 'Higher body fat' },
    { label: 'Prefer not to say', value: 'Body comp unspecified' },
  ],
  legs: [
    { label: 'Under 60 kg squat  (< 132 lbs)', value: 'Squat under 60 kg' },
    { label: '60 – 80 kg squat', value: 'Squat 60-80 kg' },
    { label: '80 – 100 kg squat', value: 'Squat 80-100 kg' },
    { label: '100 – 120 kg squat', value: 'Squat 100-120 kg' },
    { label: '120 – 160 kg squat', value: 'Squat 120-160 kg' },
    { label: 'Over 160 kg squat', value: 'Squat 160+ kg' },
    { label: "Don't squat / injury", value: 'Does not squat' },
  ],
};

// Step 5 — training experience
const EXPERIENCE_OPTIONS = [
  { label: 'Beginner  (< 1 year)', value: 'Beginner under 1 year' },
  { label: 'Novice  (1 – 2 years)', value: 'Novice 1-2 years' },
  { label: 'Intermediate  (2 – 5 years)', value: 'Intermediate 2-5 years' },
  { label: 'Advanced  (5+ years)', value: 'Advanced 5+ years' },
];

// Step 6 — training days per week
const TRAINING_DAYS_OPTIONS = [
  { label: '2 days / week', value: '2 days per week' },
  { label: '3 days / week', value: '3 days per week' },
  { label: '4 days / week', value: '4 days per week' },
  { label: '5 days / week', value: '5 days per week' },
  { label: '6 days / week', value: '6 days per week' },
];

// Step 7 — equipment
const EQUIPMENT_OPTIONS = [
  { label: 'Barbell & squat rack', value: 'Barbell and rack' },
  { label: 'Dumbbells', value: 'Dumbbells' },
  { label: 'Cable machines', value: 'Cable machines' },
  { label: 'Resistance machines', value: 'Resistance machines' },
  { label: 'Pull-up bar', value: 'Pull-up bar' },
  { label: 'Bodyweight only', value: 'Bodyweight only' },
  { label: 'Resistance bands', value: 'Resistance bands' },
];

// Step 8 — body weight
const BODY_WEIGHT_OPTIONS = [
  { label: 'Under 55 kg  (< 121 lbs)', value: 'Under 55 kg' },
  { label: '55 – 65 kg  (121 – 143 lbs)', value: '55-65 kg' },
  { label: '65 – 75 kg  (143 – 165 lbs)', value: '65-75 kg' },
  { label: '75 – 85 kg  (165 – 187 lbs)', value: '75-85 kg' },
  { label: '85 – 95 kg  (187 – 209 lbs)', value: '85-95 kg' },
  { label: '95 – 110 kg  (209 – 243 lbs)', value: '95-110 kg' },
  { label: 'Over 110 kg  (> 243 lbs)', value: 'Over 110 kg' },
];

// Step labels shown in the progress header per branch
const BRANCH_STEP_TITLES: Record<string, string[]> = {
  chest:     ['Goal', 'Exercises', 'Volume', 'Bench strength'],
  back:      ['Goal', 'Exercises', 'Volume', 'Pull-up level'],
  shoulders: ['Goal', 'Exercises', 'Volume', 'Pressing context'],
  arms:      ['Goal', 'Exercises', 'Volume', 'Balance'],
  core:      ['Goal', 'Exercises', 'Volume', 'Body composition'],
  legs:      ['Goal', 'Exercises', 'Volume', 'Squat strength'],
};

// ---------------------------------------------------------------------------
// Build survey payload to send to /analyze
// ---------------------------------------------------------------------------
function buildSurveyPayload(a: Answers): Record<string, string> {
  const targetLabel: Record<string, string> = {
    chest: 'Chest', back: 'Back & Lats', shoulders: 'Shoulders',
    arms: 'Arms (Biceps & Triceps)', core: 'Core & Abs', legs: 'Legs',
  };
  return {
    'Target muscle group': targetLabel[a.muscleTarget] ?? a.muscleTarget,
    'Specific goal': a.specificGoal,
    'Current exercises for this muscle': a.currentExercises.join(', ') || 'None listed',
    'Weekly sets for target': a.setsPerWeek,
    'Performance / strength context': a.performanceLevel,
    'Training experience': a.experience,
    'Training frequency': a.trainingDays,
    'Available equipment': a.equipment.join(', ') || 'Not specified',
    'Body weight': a.bodyWeight,
    ...(a.notes.trim() ? { 'Injuries / additional notes': a.notes.trim() } : {}),
  };
}

// ---------------------------------------------------------------------------
// Muscle descriptions
// ---------------------------------------------------------------------------
const MUSCLE_INFO: Record<string, { label: string; desc: string }> = {
  chest:        { label: 'Chest',         desc: 'Pectoralis major/minor. Responsible for horizontal pushing and shoulder adduction.' },
  front_delts:  { label: 'Front Delts',   desc: 'Anterior deltoid. Drives forward shoulder raises and overhead pressing.' },
  lateral_delts:{ label: 'Lateral Delts', desc: 'Medial deltoid. Creates shoulder width. Key target for broader shoulders.' },
  rear_delts:   { label: 'Rear Delts',    desc: 'Posterior deltoid. Balances the shoulder and supports rowing movements.' },
  upper_traps:  { label: 'Upper Traps',   desc: 'Upper trapezius. Elevates the shoulder girdle. Often overdeveloped with shrugs.' },
  biceps:       { label: 'Biceps',        desc: 'Biceps brachii. Elbow flexion and supination. Trained with curls.' },
  triceps:      { label: 'Triceps',       desc: 'Triceps brachii. Makes up 2/3 of upper arm mass. Key for pressing strength.' },
  lats:         { label: 'Lats',          desc: 'Latissimus dorsi. Largest back muscle. Creates the V-taper.' },
  abs:          { label: 'Abs',           desc: 'Rectus abdominis & obliques. Core stability and trunk flexion.' },
  quads:        { label: 'Quads',         desc: 'Quadriceps. Front of the thigh. Primary movers in squatting and leg pressing.' },
  hamstrings:   { label: 'Hamstrings',    desc: 'Posterior thigh. Hip extension and knee flexion. Key in deadlifts.' },
  calves:       { label: 'Calves',        desc: 'Gastrocnemius & soleus. Plantarflexion and lower leg aesthetics.' },
};

// ---------------------------------------------------------------------------
// Muscle map SVG (front-view body silhouette)
// musclePaths maps muscle id -> SVG path/shape data
// ---------------------------------------------------------------------------

// Colour palette
const C = {
  body:          '#1a2535',
  bodyStroke:    '#2a3d58',
  neutral:       '#2e4060',
  neutralStroke: '#3a5280',
  target:        '#0e6b38',   // green — primary target muscles
  targetStroke:  '#22c55e',
  under:         '#0a7ea4',   // blue — supporting / should-do-more muscles
  underStroke:   '#0dcaf0',
  over:          '#c0392b',   // red — overworked muscles
  overStroke:    '#e74c3c',
  tooltip:       '#1a2440',
  tooltipBorder: '#3a5280',
};

type MuscleId = keyof typeof MUSCLE_INFO;

interface MusclePatch {
  id: MuscleId;
  // 200 × 460 viewBox. Arms hang at sides (x≈26-66 left, x≈134-174 right).
  render: (fill: string, stroke: string, onPress: () => void) => React.ReactNode;
}

const MUSCLES: MusclePatch[] = [
  {
    id: 'upper_traps',
    render: (f, s, p) => (
      <G key="upper_traps" onPress={p}>
        {/* Smooth trapezoid bridging neck base to shoulder caps */}
        <Path d="M93,68 C80,72 60,76 44,84 C54,90 70,93 84,91 C92,89 100,87 100,87 C100,87 108,89 116,91 C130,93 146,90 156,84 C140,76 120,72 107,68 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'front_delts',
    render: (f, s, p) => (
      <G key="front_delts" onPress={p}>
        {/* Left — teardrop cap sitting on shoulder */}
        <Path d="M40,90 C32,98 32,114 40,122 C46,128 56,126 60,118 C64,110 62,98 56,92 C50,86 44,86 40,90 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right */}
        <Path d="M160,90 C168,98 168,114 160,122 C154,128 144,126 140,118 C136,110 138,98 144,92 C150,86 156,86 160,90 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'lateral_delts',
    render: (f, s, p) => (
      <G key="lateral_delts" onPress={p}>
        {/* Outermost shoulder cap */}
        <Ellipse cx={28} cy={108} rx={8} ry={14} fill={f} stroke={s} strokeWidth={1.2} />
        <Ellipse cx={172} cy={108} rx={8} ry={14} fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'rear_delts',
    render: (f, s, p) => (
      <G key="rear_delts" onPress={p}>
        {/* Small posterior cap behind front delt */}
        <Ellipse cx={40} cy={120} rx={7} ry={8} fill={f} stroke={s} strokeWidth={1.2} />
        <Ellipse cx={160} cy={120} rx={7} ry={8} fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'chest',
    render: (f, s, p) => (
      <G key="chest" onPress={p}>
        {/* Left pec — fan shape from sternum to shoulder */}
        <Path d="M70,104 C66,116 66,138 70,152 C76,160 90,160 98,152 C104,142 102,120 96,108 C90,100 74,98 70,104 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right pec */}
        <Path d="M130,104 C134,116 134,138 130,152 C124,160 110,160 102,152 C96,142 98,120 104,108 C110,100 126,98 130,104 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'biceps',
    render: (f, s, p) => (
      <G key="biceps" onPress={p}>
        {/* Left — elongated teardrop on front of upper arm */}
        <Path d="M40,122 C34,136 30,160 32,178 C34,190 40,196 48,194 C54,192 58,182 58,170 C58,150 54,128 48,120 C44,116 42,118 40,122 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right */}
        <Path d="M160,122 C166,136 170,160 168,178 C166,190 160,196 152,194 C146,192 142,182 142,170 C142,150 146,128 152,120 C156,116 158,118 160,122 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'triceps',
    render: (f, s, p) => (
      <G key="triceps" onPress={p}>
        {/* Left — lateral edge of upper arm, visible from front */}
        <Path d="M24,122 C20,138 18,162 20,182 C22,196 28,204 34,202 C38,200 40,190 40,178 C40,156 36,132 30,122 C28,116 26,118 24,122 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right */}
        <Path d="M176,122 C180,138 182,162 180,182 C178,196 172,204 166,202 C162,200 160,190 160,178 C160,156 164,132 170,122 C172,116 174,118 176,122 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'lats',
    render: (f, s, p) => (
      <G key="lats" onPress={p}>
        {/* Left — triangular flank strip from armpit tapering to waist */}
        <Path d="M62,124 C66,136 69,152 69,168 C70,182 70,194 70,204 C66,200 62,192 60,180 C58,164 58,148 60,136 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right */}
        <Path d="M138,124 C134,136 131,152 131,168 C130,182 130,194 130,204 C134,200 138,192 140,180 C142,164 142,148 140,136 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'abs',
    render: (f, s, p) => (
      <G key="abs" onPress={p}>
        {/* Three rows of paired rectus abdominis blocks */}
        <Path d="M83,160 L98,158 L98,175 L83,176 Z" fill={f} stroke={s} strokeWidth={1.2} />
        <Path d="M102,158 L117,160 L117,176 L102,175 Z" fill={f} stroke={s} strokeWidth={1.2} />
        <Path d="M82,178 L98,177 L98,196 L81,197 Z" fill={f} stroke={s} strokeWidth={1.2} />
        <Path d="M102,177 L118,178 L119,197 L102,196 Z" fill={f} stroke={s} strokeWidth={1.2} />
        <Path d="M82,199 L98,199 L98,217 L82,219 Z" fill={f} stroke={s} strokeWidth={1.2} />
        <Path d="M102,199 L118,199 L118,219 L102,217 Z" fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'quads',
    render: (f, s, p) => (
      <G key="quads" onPress={p}>
        {/* Left — large teardrop covering front of thigh */}
        <Path d="M58,248 C54,266 52,292 54,316 C56,332 64,342 72,340 C80,338 86,326 88,310 C90,288 88,262 82,246 C78,236 62,240 58,248 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right */}
        <Path d="M142,248 C146,266 148,292 146,316 C144,332 136,342 128,340 C120,338 114,326 112,310 C110,288 112,262 118,246 C122,236 138,240 142,248 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'hamstrings',
    render: (f, s, p) => (
      <G key="hamstrings" onPress={p}>
        {/* Outer thigh strip — partially visible from front */}
        <Ellipse cx={54} cy={296} rx={6} ry={44} fill={f} stroke={s} strokeWidth={1.2} />
        <Ellipse cx={146} cy={296} rx={6} ry={44} fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
  {
    id: 'calves',
    render: (f, s, p) => (
      <G key="calves" onPress={p}>
        {/* Left — diamond/teardrop gastrocnemius shape */}
        <Path d="M58,364 C52,380 52,404 56,422 C60,434 70,438 78,432 C84,424 84,402 80,380 C78,362 66,356 58,364 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
        {/* Right */}
        <Path d="M142,364 C148,380 148,404 144,422 C140,434 130,438 122,432 C116,424 116,402 120,380 C122,362 134,356 142,364 Z"
          fill={f} stroke={s} strokeWidth={1.2} />
      </G>
    ),
  },
];

// ---------------------------------------------------------------------------
// Body silhouette — front view, 200 × 460 viewBox
// Smooth anatomical curves; arms hanging at sides.
// ---------------------------------------------------------------------------
const SILHOUETTE = (
  <>
    {/* Head */}
    <Ellipse cx={100} cy={28} rx={19} ry={23} fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />
    {/* Neck — slight taper */}
    <Path d="M92,50 C92,50 94,52 100,52 C106,52 108,50 108,50 L107,68 L93,68 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1} />

    {/* Torso — shoulder slope → armpit → waist taper → hip flare → crotch */}
    <Path
      d="M93,68
         C78,70 56,74 40,84
         C32,90 30,102 36,112
         C40,118 48,122 54,124
         C60,128 66,136 68,148
         C70,162 72,178 72,194
         C71,206 70,218 70,230
         L86,240 L114,240
         C130,218 129,206 128,194
         C128,178 130,162 132,148
         C134,136 140,128 146,124
         C152,122 160,118 164,112
         C170,102 168,90 160,84
         C144,74 122,70 107,68 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />

    {/* Left upper arm — smooth taper from shoulder to elbow */}
    <Path
      d="M36,112
         C28,122 22,144 20,168
         C18,188 22,206 28,216
         C34,224 46,226 56,218
         C64,210 64,190 62,172
         C62,148 58,126 54,124
         C48,122 40,118 36,112 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />
    {/* Right upper arm */}
    <Path
      d="M164,112
         C172,122 178,144 180,168
         C182,188 178,206 172,216
         C166,224 154,226 144,218
         C136,210 136,190 138,172
         C138,148 142,126 146,124
         C152,122 160,118 164,112 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />

    {/* Left forearm — slight taper toward wrist */}
    <Path
      d="M28,216
         C22,230 18,256 20,282
         C20,298 26,310 34,314
         C42,318 52,314 58,304
         C64,292 62,266 60,246
         C58,228 56,218 56,218
         C46,226 34,224 28,216 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />
    {/* Right forearm */}
    <Path
      d="M172,216
         C178,230 182,256 180,282
         C180,298 174,310 166,314
         C158,318 148,314 142,304
         C136,292 138,266 140,246
         C142,228 144,218 144,218
         C154,226 166,224 172,216 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />

    {/* Hands */}
    <Ellipse cx={34} cy={324} rx={10} ry={14} fill={C.body} stroke={C.bodyStroke} strokeWidth={1} />
    <Ellipse cx={166} cy={324} rx={10} ry={14} fill={C.body} stroke={C.bodyStroke} strokeWidth={1} />

    {/* Left thigh — quad bulge on outer front */}
    <Path
      d="M70,230
         C62,244 56,270 54,298
         C52,320 54,342 60,354
         C66,364 78,368 88,362
         C94,354 94,332 92,314
         L86,240 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />
    {/* Right thigh */}
    <Path
      d="M130,230
         C138,244 144,270 146,298
         C148,320 146,342 140,354
         C134,364 122,368 112,362
         C106,354 106,332 108,314
         L114,240 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />

    {/* Left lower leg — calf bulge medially */}
    <Path
      d="M60,354
         C54,368 52,394 54,418
         C56,432 64,442 74,442
         C82,442 86,432 86,420
         C86,394 88,366 88,362
         C78,368 66,364 60,354 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />
    {/* Right lower leg */}
    <Path
      d="M140,354
         C146,368 148,394 146,418
         C144,432 136,442 126,442
         C118,442 114,432 114,420
         C114,394 112,366 112,362
         C122,368 134,364 140,354 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1.5} />

    {/* Left foot */}
    <Path d="M54,418 C46,428 44,440 52,446 C62,450 80,446 84,432 L86,420 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1} />
    {/* Right foot */}
    <Path d="M146,418 C154,428 156,440 148,446 C138,450 120,446 116,432 L114,420 Z"
      fill={C.body} stroke={C.bodyStroke} strokeWidth={1} />
  </>
);

// ---------------------------------------------------------------------------
// MuscleMap component
// ---------------------------------------------------------------------------
function MuscleMap({
  targeted,
  underemphasized,
  overemphasized,
}: {
  targeted: string[];
  underemphasized: string[];
  overemphasized: string[];
}) {
  const [tooltip, setTooltip] = useState<{ id: MuscleId } | null>(null);

  function colorFor(id: MuscleId): [string, string] {
    if (targeted.includes(id))       return [C.target, C.targetStroke];
    if (overemphasized.includes(id)) return [C.over,   C.overStroke];
    if (underemphasized.includes(id))return [C.under,  C.underStroke];
    return [C.neutral, C.neutralStroke];
  }

  function handlePress(id: MuscleId) {
    setTooltip(prev => (prev?.id === id ? null : { id }));
  }

  const tooltipInfo = tooltip ? MUSCLE_INFO[tooltip.id] : null;

  return (
    <View style={mmStyles.wrapper}>
      {/* Legend */}
      <View style={mmStyles.legend}>
        <View style={mmStyles.legendItem}>
          <View style={[mmStyles.dot, { backgroundColor: C.target }]} />
          <Text style={mmStyles.legendText}>Primary target</Text>
        </View>
        <View style={mmStyles.legendItem}>
          <View style={[mmStyles.dot, { backgroundColor: C.under }]} />
          <Text style={mmStyles.legendText}>Also focus on</Text>
        </View>
        <View style={mmStyles.legendItem}>
          <View style={[mmStyles.dot, { backgroundColor: C.over }]} />
          <Text style={mmStyles.legendText}>Overworked</Text>
        </View>
        <View style={mmStyles.legendItem}>
          <View style={[mmStyles.dot, { backgroundColor: C.neutral }]} />
          <Text style={mmStyles.legendText}>Neutral</Text>
        </View>
      </View>

      {/* SVG canvas */}
      <Svg width={200} height={460} viewBox="0 0 200 460" style={mmStyles.svg}>
        {SILHOUETTE}
        {MUSCLES.map(m => {
          const [fill, stroke] = colorFor(m.id);
          return m.render(fill, stroke, () => handlePress(m.id));
        })}
      </Svg>

      {/* Tooltip */}
      {tooltipInfo && (
        <View style={mmStyles.tooltip}>
          <Text style={mmStyles.tooltipTitle}>{tooltipInfo.label}</Text>
          <Text style={mmStyles.tooltipDesc}>{tooltipInfo.desc}</Text>
          <TouchableOpacity onPress={() => setTooltip(null)}>
            <Text style={mmStyles.tooltipClose}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const mmStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginVertical: 8 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#aaa', fontSize: 12 },
  svg: { alignSelf: 'center' },
  tooltip: {
    marginTop: 12,
    backgroundColor: C.tooltip,
    borderColor: C.tooltipBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    width: '100%',
  },
  tooltipTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 4 },
  tooltipDesc: { color: '#ccc', fontSize: 13, lineHeight: 19, marginBottom: 8 },
  tooltipClose: { color: '#0a7ea4', fontSize: 13, fontWeight: '600' },
});

// ---------------------------------------------------------------------------
// Generic option-chip row
// ---------------------------------------------------------------------------
function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.75}>
      <Text style={[chipStyles.chipText, selected && chipStyles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: '#2e3240',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: '#1c1f26',
  },
  chipSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#0d2d3d',
  },
  chipText: { color: '#aaa', fontSize: 14 },
  chipTextSelected: { color: '#0dcaf0', fontWeight: '600' },
});

// ---------------------------------------------------------------------------
// Onboarding wizard — branched survey
// Step 0: target muscle  →  Steps 1-4: branch questions  →  Steps 5-9: common
// ---------------------------------------------------------------------------
const TOTAL_STEPS = 10;

const defaultAnswers: Answers = {
  muscleTarget: '',
  specificGoal: '',
  currentExercises: [],
  setsPerWeek: '',
  performanceLevel: '',
  experience: '',
  trainingDays: '',
  equipment: [],
  bodyWeight: '',
  notes: '',
};

function OnboardingWizard({ onSubmit }: { onSubmit: (a: Answers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);

  const t = answers.muscleTarget;  // shorthand for branch lookup

  function setSingle(key: keyof Answers, value: string) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key: 'currentExercises' | 'equipment', value: string) {
    setAnswers(prev => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  }

  // When the user picks a new muscle target, clear branch-specific answers
  function selectTarget(value: string) {
    setAnswers(prev => ({
      ...defaultAnswers,
      muscleTarget: value,
    }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return !!answers.muscleTarget;
      case 1: return !!answers.specificGoal;
      case 2: return answers.currentExercises.length > 0;
      case 3: return !!answers.setsPerWeek;
      case 4: return !!answers.performanceLevel;
      case 5: return !!answers.experience;
      case 6: return !!answers.trainingDays;
      case 7: return answers.equipment.length > 0;
      case 8: return !!answers.bodyWeight;
      case 9: return true;
      default: return true;
    }
  }

  // Branch-specific step titles for the sub-header tag
  const branchTitles = t ? BRANCH_STEP_TITLES[t] ?? [] : [];

  function stepTag(): string {
    if (step === 0) return 'Muscle target';
    if (step >= 1 && step <= 4) return branchTitles[step - 1] ?? `Step ${step + 1}`;
    const commonTags = ['Experience', 'Frequency', 'Equipment', 'Body weight', 'Notes'];
    return commonTags[step - 5] ?? `Step ${step + 1}`;
  }

  function renderStep() {
    switch (step) {
      // ── Step 0: which muscle group? ────────────────────────────────────────
      case 0:
        return (
          <StepShell
            title="What do you want to develop?"
            hint="Choose the muscle group you want to focus on.">
            {MUSCLE_TARGET_OPTIONS.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.muscleTarget === o.value}
                onPress={() => selectTarget(o.value)} />
            ))}
          </StepShell>
        );

      // ── Step 1: specific goal (branch) ─────────────────────────────────────
      case 1: {
        const opts = SPECIFIC_GOAL_OPTIONS[t] ?? [];
        const labels: Record<string, string> = {
          chest: 'What is your chest goal?',
          back: 'What is your back goal?',
          shoulders: 'What is your shoulder goal?',
          arms: 'What is your arm goal?',
          core: 'What is your core goal?',
          legs: 'What is your leg goal?',
        };
        return (
          <StepShell title={labels[t] ?? 'What is your specific goal?'}>
            {opts.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.specificGoal === o.value}
                onPress={() => setSingle('specificGoal', o.value)} />
            ))}
          </StepShell>
        );
      }

      // ── Step 2: current exercises (multi-select, branch) ───────────────────
      case 2: {
        const opts = CURRENT_EXERCISES_OPTIONS[t] ?? [];
        return (
          <StepShell
            title="Which exercises do you currently do?"
            hint="Select all that apply.">
            {opts.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.currentExercises.includes(o.value)}
                onPress={() => toggleMulti('currentExercises', o.value)} />
            ))}
          </StepShell>
        );
      }

      // ── Step 3: weekly volume ──────────────────────────────────────────────
      case 3: {
        const targetLabel: Record<string, string> = {
          chest: 'chest', back: 'back', shoulders: 'shoulder',
          arms: 'arm', core: 'core', legs: 'leg',
        };
        return (
          <StepShell
            title={`How many ${targetLabel[t] ?? ''} sets per week?`}
            hint="Count direct sets for this muscle group only.">
            {SETS_PER_WEEK_OPTIONS.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.setsPerWeek === o.value}
                onPress={() => setSingle('setsPerWeek', o.value)} />
            ))}
          </StepShell>
        );
      }

      // ── Step 4: performance / context (branch) ─────────────────────────────
      case 4: {
        const opts = PERFORMANCE_OPTIONS[t] ?? [];
        const perfTitles: Record<string, string> = {
          chest: 'What is your approximate bench press?',
          back: 'What is your pull-up ability?',
          shoulders: 'How do you approach overhead pressing?',
          arms: 'How are your arms balanced?',
          core: 'What is your current body composition?',
          legs: 'What is your approximate squat?',
        };
        return (
          <StepShell title={perfTitles[t] ?? 'Performance context'}>
            {opts.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.performanceLevel === o.value}
                onPress={() => setSingle('performanceLevel', o.value)} />
            ))}
          </StepShell>
        );
      }

      // ── Step 5: training experience ────────────────────────────────────────
      case 5:
        return (
          <StepShell title="What is your training experience?">
            {EXPERIENCE_OPTIONS.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.experience === o.value}
                onPress={() => setSingle('experience', o.value)} />
            ))}
          </StepShell>
        );

      // ── Step 6: training days ──────────────────────────────────────────────
      case 6:
        return (
          <StepShell title="How many days per week do you train?">
            {TRAINING_DAYS_OPTIONS.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.trainingDays === o.value}
                onPress={() => setSingle('trainingDays', o.value)} />
            ))}
          </StepShell>
        );

      // ── Step 7: equipment ──────────────────────────────────────────────────
      case 7:
        return (
          <StepShell title="What equipment do you have access to?" hint="Select all that apply.">
            {EQUIPMENT_OPTIONS.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.equipment.includes(o.value)}
                onPress={() => toggleMulti('equipment', o.value)} />
            ))}
          </StepShell>
        );

      // ── Step 8: body weight ────────────────────────────────────────────────
      case 8:
        return (
          <StepShell title="What is your body weight?">
            {BODY_WEIGHT_OPTIONS.map(o => (
              <OptionChip key={o.value} label={o.label}
                selected={answers.bodyWeight === o.value}
                onPress={() => setSingle('bodyWeight', o.value)} />
            ))}
          </StepShell>
        );

      // ── Step 9: notes ──────────────────────────────────────────────────────
      case 9:
        return (
          <StepShell
            title="Anything else?"
            hint="Optional — injuries, imbalances, training style, or other context for the AI.">
            <TextInput
              style={[wStyles.textInput, wStyles.multiline]}
              value={answers.notes}
              onChangeText={v => setSingle('notes', v)}
              placeholder="e.g. I have a left shoulder impingement, prefer cables over barbells…"
              placeholderTextColor="#555"
              multiline
              textAlignVertical="top"
            />
          </StepShell>
        );

      default:
        return null;
    }
  }

  return (
    <KeyboardAvoidingView style={wStyles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={wStyles.header}>
        <Text style={wStyles.logo}>PhysiMap</Text>
        <Text style={wStyles.headerSub}>AI BODY MAP</Text>
      </View>

      {/* Progress */}
      <View style={wStyles.progressOuter}>
        <View style={[wStyles.progressInner, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` as any }]} />
      </View>
      <View style={wStyles.progressRow}>
        <Text style={wStyles.progressLabel}>Step {step + 1} of {TOTAL_STEPS}</Text>
        <Text style={wStyles.stepTagText}>{stepTag()}</Text>
      </View>

      {/* Step content */}
      <ScrollView style={wStyles.flex} contentContainerStyle={wStyles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>

      {/* Nav buttons */}
      <View style={wStyles.navRow}>
        <TouchableOpacity
          style={[wStyles.navBtn, wStyles.backBtn, step === 0 && wStyles.navBtnDisabled]}
          onPress={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}>
          <Text style={wStyles.backBtnText}>← Back</Text>
        </TouchableOpacity>

        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity
            style={[wStyles.navBtn, wStyles.nextBtn, !canAdvance() && wStyles.navBtnDisabled]}
            onPress={() => setStep(s => s + 1)}
            disabled={!canAdvance()}>
            <Text style={wStyles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[wStyles.navBtn, wStyles.submitBtn]}
            onPress={() => onSubmit(answers)}>
            <Text style={wStyles.nextBtnText}>Analyze →</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function StepShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={wStyles.stepShell}>
      <Text style={wStyles.stepTitle}>{title}</Text>
      {hint && <Text style={wStyles.stepHint}>{hint}</Text>}
      <View style={wStyles.optionsWrap}>{children}</View>
    </View>
  );
}

const wStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  header: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 4 },
  logo: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSub: { fontSize: 11, color: '#555', letterSpacing: 1.5, marginTop: 2 },
  progressOuter: { height: 4, backgroundColor: '#1c2535', marginHorizontal: 24, marginTop: 14, borderRadius: 4 },
  progressInner: { height: 4, backgroundColor: '#22c55e', borderRadius: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 24, marginTop: 6, marginBottom: 2 },
  progressLabel: { color: '#555', fontSize: 11 },
  stepTagText: { color: '#22c55e', fontSize: 11, fontWeight: '600' },
  scrollContent: { padding: 24, paddingBottom: 16 },
  stepShell: { flex: 1 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  stepHint: { fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 18 },
  optionsWrap: { marginTop: 4 },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#0a7ea4', marginBottom: 8, letterSpacing: 0.3 },
  textInput: {
    backgroundColor: '#1c1f26',
    color: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e3240',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: { height: 140, paddingTop: 12 },
  navRow: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20 },
  navBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  backBtn: { backgroundColor: '#1c1f26', borderWidth: 1, borderColor: '#2e3240' },
  nextBtn: { backgroundColor: '#0a7ea4' },
  submitBtn: { backgroundColor: '#1a7a45' },
  backBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------
function ResultsScreen({
  analysis,
  responseText,
  surveyPayload,
  onReset,
}: {
  analysis: AnalysisResult;
  responseText: string;
  surveyPayload: Record<string, string>;
  onReset: () => void;
}) {
  const [showDebug, setShowDebug] = useState(false);

  // Clarify section state
  const clarifyQuestions = analysis.clarifying_questions ?? [];
  const [clarifyAnswer, setClarifyAnswer] = useState('');
  const [clarifyLoading, setClarifyLoading] = useState(false);
  const [clarifyResponse, setClarifyResponse] = useState('');
  const [clarifyError, setClarifyError] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');

  async function handleClarifySubmit() {
    if (!clarifyAnswer.trim() || clarifyQuestions.length === 0) return;
    const question = clarifyQuestions[0];
    setClarifyLoading(true);
    setClarifyError('');
    setClarifyResponse('');
    setSubmittedQuestion(question);

    try {
      const res = await fetch(`${API_BASE_URL}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_payload: surveyPayload,
          clarifying_question: question,
          user_answer: clarifyAnswer.trim(),
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Server ${res.status}: ${detail}`);
      }

      const data = await res.json();
      setClarifyResponse(data.response_text ?? '');
    } catch (err: unknown) {
      setClarifyError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setClarifyLoading(false);
    }
  }

  const targeted = analysis.targeted ?? [];
  const under    = analysis.underemphasized ?? [];
  const over     = analysis.overemphasized  ?? [];

  return (
    <KeyboardAvoidingView
      style={rStyles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={rStyles.flex} contentContainerStyle={rStyles.container}
        keyboardShouldPersistTaps="handled">
        {/* Title row */}
        <View style={rStyles.titleRow}>
          <View>
            <Text style={rStyles.title}>Your Body Map</Text>
            <Text style={rStyles.subtitle}>PHYSI MAP  ·  AI</Text>
          </View>
          <TouchableOpacity style={rStyles.resetBtn} onPress={onReset}>
            <Text style={rStyles.resetBtnText}>Retake</Text>
          </TouchableOpacity>
        </View>

        {/* Muscle map card */}
        <View style={rStyles.card}>
          <Text style={rStyles.cardTitle}>Interactive Muscle Map</Text>
          <Text style={rStyles.cardHint}>Tap any muscle group for details.</Text>
          <MuscleMap targeted={targeted} underemphasized={under} overemphasized={over} />
        </View>

        {/* Summary card */}
        <View style={rStyles.card}>
          <Text style={rStyles.cardTitle}>AI Summary</Text>
          <Text style={rStyles.summaryText}>{responseText || 'No summary available.'}</Text>
        </View>

        {/* Clarifying question input — shown when AI has questions */}
        {clarifyQuestions.length > 0 && (
          <View style={rStyles.card}>
            <Text style={rStyles.cardTitle}>Help the AI help you</Text>
            <Text style={rStyles.cardHint}>Answer the question below for more personalised advice.</Text>

            {/* Question bubble */}
            <View style={rStyles.questionBubble}>
              <Text style={rStyles.questionIcon}>AI</Text>
              <Text style={rStyles.questionText}>{clarifyQuestions[0]}</Text>
            </View>

            {/* Answer input */}
            <TextInput
              style={[rStyles.clarifyInput, clarifyLoading && rStyles.clarifyInputDisabled]}
              value={clarifyAnswer}
              onChangeText={setClarifyAnswer}
              placeholder="Type your answer here…"
              placeholderTextColor="#555"
              multiline
              textAlignVertical="top"
              editable={!clarifyLoading}
            />

            {/* Submit button */}
            <Pressable
              style={[
                rStyles.clarifyBtn,
                (!clarifyAnswer.trim() || clarifyLoading) && rStyles.clarifyBtnDisabled,
              ]}
              onPress={handleClarifySubmit}
              disabled={!clarifyAnswer.trim() || clarifyLoading}>
              {clarifyLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={rStyles.clarifyBtnText}>
                  {clarifyResponse ? 'Update advice →' : 'Get advice →'}
                </Text>
              )}
            </Pressable>

            {/* Error */}
            {!!clarifyError && (
              <Text style={rStyles.clarifyError}>⚠ {clarifyError}</Text>
            )}

            {/* AI response */}
            {!!clarifyResponse && (
              <View style={rStyles.clarifyResponseWrap}>
                <View style={rStyles.clarifyResponseHeader}>
                  <Text style={rStyles.clarifyResponseLabel}>AI Advice</Text>
                  <Text style={rStyles.clarifyResponseSub}>Based on: "{submittedQuestion}"</Text>
                </View>
                <Text style={rStyles.clarifyResponseText}>{clarifyResponse}</Text>
              </View>
            )}
          </View>
        )}

        {/* Do more / do less chips */}
        {(analysis.do_more?.length > 0 || analysis.do_less?.length > 0) && (
          <View style={rStyles.card}>
            <Text style={rStyles.cardTitle}>Focus Adjustments</Text>
            {analysis.do_more?.map((item, i) => (
              <View key={`more-${i}`} style={rStyles.bulletRow}>
                <Text style={rStyles.bulletPlus}>+</Text>
                <Text style={rStyles.bulletText}>{item}</Text>
              </View>
            ))}
            {analysis.do_less?.map((item, i) => (
              <View key={`less-${i}`} style={rStyles.bulletRow}>
                <Text style={rStyles.bulletMinus}>−</Text>
                <Text style={rStyles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Common mistakes */}
        {analysis.common_mistakes?.length > 0 && (
          <View style={rStyles.card}>
            <Text style={rStyles.cardTitle}>Common Mistakes to Avoid</Text>
            {analysis.common_mistakes.map((m, i) => (
              <View key={i} style={rStyles.bulletRow}>
                <Text style={rStyles.bulletWarn}>!</Text>
                <Text style={rStyles.bulletText}>{m}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Debug panel */}
        <TouchableOpacity
          style={rStyles.debugToggle}
          onPress={() => setShowDebug(v => !v)}>
          <Text style={rStyles.debugToggleText}>
            {showDebug ? 'Hide debug ▲' : 'Show debug ▼'}
          </Text>
        </TouchableOpacity>
        {showDebug && (
          <ScrollView horizontal style={rStyles.jsonScroll} contentContainerStyle={rStyles.jsonContent}>
            <Text style={rStyles.jsonText}>{JSON.stringify(analysis, null, 2)}</Text>
          </ScrollView>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const rStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { padding: 20, paddingTop: 56 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 11, color: '#555', letterSpacing: 1.5, marginTop: 2 },
  resetBtn: { borderWidth: 1, borderColor: '#2e3240', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  resetBtnText: { color: '#888', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#13161d',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2535',
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cardHint: { fontSize: 12, color: '#555', marginBottom: 12 },
  summaryText: { color: '#ddd', fontSize: 14, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, gap: 8 },
  bulletPlus: { color: '#0dcaf0', fontWeight: '800', fontSize: 16, width: 16, marginTop: 1 },
  bulletMinus: { color: '#f56565', fontWeight: '800', fontSize: 16, width: 16, marginTop: 1 },
  bulletWarn: { color: '#f0a500', fontWeight: '800', fontSize: 16, width: 16, marginTop: 1 },
  bulletText: { color: '#ccc', fontSize: 13, lineHeight: 20, flex: 1 },
  debugToggle: { paddingVertical: 8, alignSelf: 'flex-start' },
  debugToggleText: { color: '#3a5280', fontSize: 12, fontWeight: '600' },
  jsonScroll: { backgroundColor: '#0a0d12', borderRadius: 10, marginTop: 6, borderWidth: 1, borderColor: '#1e2535' },
  jsonContent: { padding: 12 },
  jsonText: { color: '#4a7a9b', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 17 },
  // Clarify section
  questionBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#0d2d3d',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    padding: 12,
    marginBottom: 14,
  },
  questionIcon: {
    color: '#0dcaf0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    minWidth: 22,
  },
  questionText: { color: '#e0f4fa', fontSize: 14, lineHeight: 21, flex: 1 },
  clarifyInput: {
    backgroundColor: '#1c1f26',
    color: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e3240',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  clarifyInputDisabled: { opacity: 0.5 },
  clarifyBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clarifyBtnDisabled: { opacity: 0.4 },
  clarifyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  clarifyError: { color: '#f56565', fontSize: 12, marginTop: 10, lineHeight: 17 },
  clarifyResponseWrap: {
    marginTop: 16,
    backgroundColor: '#0a1520',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1a4060',
    padding: 14,
  },
  clarifyResponseHeader: { marginBottom: 10 },
  clarifyResponseLabel: { color: '#0dcaf0', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  clarifyResponseSub: { color: '#3a6080', fontSize: 11, marginTop: 2 },
  clarifyResponseText: { color: '#dce8f0', fontSize: 13, lineHeight: 21 },
});

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------
function LoadingScreen() {
  return (
    <View style={lStyles.container}>
      <ActivityIndicator size="large" color="#22c55e" />
      <Text style={lStyles.text}>Building your body map…</Text>
      <Text style={lStyles.sub}>GPT is analysing your training profile</Text>
    </View>
  );
}

const lStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', justifyContent: 'center', alignItems: 'center', gap: 16 },
  text: { color: '#fff', fontSize: 17, fontWeight: '600' },
  sub: { color: '#555', fontSize: 13 },
});

// ---------------------------------------------------------------------------
// Root component — manages screen state
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [responseText, setResponseText] = useState('');
  const [surveyPayload, setSurveyPayload] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  async function handleSubmit(answers: Answers) {
    setScreen('loading');
    setError('');

    const payload = buildSurveyPayload(answers);
    setSurveyPayload(payload);

    try {
      const res = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survey_data: payload }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Server ${res.status}: ${detail}`);
      }

      const data = await res.json();
      setAnalysis(data.analysis as AnalysisResult);
      setResponseText(data.response_text ?? '');
      setScreen('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error.');
      setScreen('onboarding');
    }
  }

  if (screen === 'loading') return <LoadingScreen />;

  if (screen === 'results' && analysis) {
    return (
      <ResultsScreen
        analysis={analysis}
        responseText={responseText}
        surveyPayload={surveyPayload}
        onReset={() => {
          setScreen('onboarding');
          setAnalysis(null);
          setResponseText('');
          setSurveyPayload({});
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingWizard onSubmit={handleSubmit} />
      {!!error && (
        <View style={errStyles.banner}>
          <Text style={errStyles.bannerText}>⚠ {error}</Text>
        </View>
      )}
    </View>
  );
}

const errStyles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#3d0f0f',
    borderColor: '#7a1f1f',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  bannerText: { color: '#f56565', fontSize: 13, lineHeight: 18 },
});

import json
import random
import math
from pathlib import Path

# typing hints (optional)
from typing import Dict, Any, List

# ----------------------------
# PARAMETERS
# ----------------------------
N = 10_000
TIME_WINDOW_YEARS = 20

# Target average 20-year mortality across the whole simulated portfolio
# Adjust this to steer overall prevalence while preserving relative risks
TARGET_20Y_MORTALITY = 0.28  # ~28% across ages 18-85

# Output file (v2 to preserve the original dataset); write next to this script
OUTPUT_FILE = str(Path(__file__).with_name(f"synthetic_life_insurance_{N}.json"))

random.seed(42)

# ----------------------------
# DISTRIBUTIONS & HELPERS
# ----------------------------
def truncated_normal(mean, sd, low, high):
    """Sample from truncated normal distribution."""
    while True:
        x = random.gauss(mean, sd)
        if low <= x <= high:
            return x

def weighted_choice(options):
    """Return a random key from a dict of {option: weight}."""
    total = sum(options.values())
    r = random.uniform(0, total)
    upto = 0
    for k, w in options.items():
        if upto + w >= r:
            return k
        upto += w
    assert False

# ----------------------------
# RISK MODEL
# ----------------------------
def compute_risk_multiplier(person: Dict[str, Any]) -> float:
    """Compute a relative risk multiplier m (no base rate).

    The final 20-year mortality will be p = min(scale * m, 0.95), where
    `scale` is calibrated post-simulation so that the portfolio-average p
    matches TARGET_20Y_MORTALITY.
    """
    age = person["age"]
    gender = person["gender"]
    bmi = person["bmi"]
    smoking = person["smoking"]
    packs_per_week = person["packs_per_week"]
    drug_use = person["drug_use"]
    drug_type = person["drug_type"]
    staying_abroad = person["staying_abroad"]
    abroad_type = person["abroad_type"]
    dangerous_sports = person["dangerous_sports"]
    sport_type = person["sport_type"]
    medical_issue = person["medical_issue"]
    medical_type = person["medical_type"]
    regular_medication = person["regular_medication"]
    medication_type = person["medication_type"]
    sports_activity_h_per_week = person["sports_activity_h_per_week"]
    earning_chf = person["earning_chf"]

    m = 1.0

    # Age factor (softened vs v1 to avoid extreme tails)
    if age >= 60:
        m *= 3.0
    elif age >= 40:
        m *= 2.0

    # Gender
    if gender == "m":
        m *= 1.05

    # Smoking (softened)
    if smoking:
        m *= (1 + 0.3 * packs_per_week)  # up to x1.9 at 3 packs/week

    # Drugs (softened)
    if drug_use:
        m *= {"safe": 1.1, "warning": 1.5, "danger": 2.5}[drug_type]

    # Dangerous sports (softened)
    if dangerous_sports:
        m *= {"safe": 1.0, "warning": 1.1, "danger": 1.3}[sport_type]

    # Staying abroad (softened)
    if staying_abroad:
        m *= {"safe": 1.0, "warning": 1.05, "danger": 1.15}[abroad_type]

    # Medical issues (softened but still strong)
    if medical_issue:
        m *= {"safe": 1.0, "warning": 1.6, "danger": 3.0}[medical_type]

    # Regular medication
    if regular_medication:
        m *= {"safe": 1.0, "warning": 1.2, "danger": 1.6}[medication_type]

    # BMI effect (outside 18.5-30)
    if bmi < 18.5 or bmi > 30:
        m *= 1.2

    # Sports activity (protective, cap at 25%)
    m *= max(0.75, 1 - 0.02 * sports_activity_h_per_week)

    # Income protective (slightly stronger cap at 0.3)
    income_factor = min(0.3, max(0.0, (earning_chf - 50_000) / 50_000 * 0.05))
    m *= (1 - income_factor)

    return m


# ----------------------------
# PERSON GENERATION (attributes only)
# ----------------------------
def generate_person() -> Dict[str, Any]:
    # --- Demographics ---
    gender = random.choice(["m", "f"])
    age = random.randint(18, 85)
    marital_status = random.choice(["single", "married", "divorced", "widowed"])

    # --- Anthropometrics ---
    height_cm = random.randint(150, 200)
    bmi = truncated_normal(mean=25.5, sd=4.0, low=16, high=45)
    weight_kg = round((bmi * (height_cm / 100) ** 2), 1)

    # --- Lifestyle ---
    smoking = random.random() < 0.25
    packs_per_week = random.randint(0, 3) if smoking else 0

    drug_use = random.random() < 0.1
    drug_type = weighted_choice({"safe": 0.6, "warning": 0.3, "danger": 0.1})
    drug_frequency = round(random.uniform(0.5, 5.0), 1) if drug_use else 0.0

    staying_abroad = random.random() < 0.05
    abroad_type = weighted_choice({"safe": 0.7, "warning": 0.2, "danger": 0.1})

    dangerous_sports = random.random() < 0.15
    sport_type = weighted_choice({"safe": 0.5, "warning": 0.35, "danger": 0.15})

    # --- Health ---
    medical_issue = random.random() < 0.2
    medical_type = weighted_choice({"safe": 0.5, "warning": 0.35, "danger": 0.15})

    doctor_visits = random.random() < 0.5
    visit_type = random.choice(["doctor", "physician", "therapist"])

    regular_medication = random.random() < 0.25
    medication_type = weighted_choice({"safe": 0.6, "warning": 0.3, "danger": 0.1})

    # --- Sports & Income ---
    sports_activity_h_per_week = random.randint(0, 10)
    earning_chf = random.randint(30_000, 250_000)

    # ----------------------------
    # Record assembly (attributes only)
    # ----------------------------
    person: Dict[str, Any] = {
        "gender": gender,
        "age": age,
        "marital_status": marital_status,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "bmi": round(bmi, 1),
        "smoking": smoking,
        "packs_per_week": packs_per_week,
        "drug_use": drug_use,
        "drug_frequency": drug_frequency,
        "drug_type": drug_type,
        "staying_abroad": staying_abroad,
        "abroad_type": abroad_type,
        "dangerous_sports": dangerous_sports,
        "sport_type": sport_type,
        "medical_issue": medical_issue,
        "medical_type": medical_type,
        "doctor_visits": doctor_visits,
        "visit_type": visit_type,
        "regular_medication": regular_medication,
        "medication_type": medication_type,
        "sports_activity_h_per_week": sports_activity_h_per_week,
        "earning_chf": earning_chf,
    }

    # Some operational fields to mimic past business records
    person["application_year"] = random.randint(2005, 2010)  # fully observed 20y by 2025

    # store raw multiplier for later calibration
    person["risk_multiplier"] = compute_risk_multiplier(person)

    return person

# ----------------------------
# GENERATE DATA
# ----------------------------
raw_people: List[Dict[str, Any]] = [generate_person() for _ in range(N)]

# ----------------------------
# CALIBRATE PORTFOLIO MORTALITY
# ----------------------------
def calibrate_scale(multipliers: List[float], target: float) -> float:
    """Find scale s so mean(min(s*m, 0.95)) ~= target using binary search."""
    lo, hi = 0.0, 10.0  # reasonable bounds
    for _ in range(40):  # enough for double precision
        mid = (lo + hi) / 2
        avg = sum(min(mid * m, 0.95) for m in multipliers) / len(multipliers)
        if avg < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2

multipliers = [p["risk_multiplier"] for p in raw_people]
scale = calibrate_scale(multipliers, TARGET_20Y_MORTALITY)

# ----------------------------
# UNDERWRITER DECISIONS
# ----------------------------
def decide_underwriter(prob_est: float) -> Dict[str, Any]:
    """Map an estimated 20y death probability to a decision and premium.

    Returns: {decision: str, premium_loading: float}
    decision in {"accept", "accept_with_premium", "needs_more_info", "reject"}
    premium_loading is a non-negative multiplier (e.g., 0.0 for none, 0.25 = +25%).
    """
    # thresholds (you can tweak these)
    t_accept = 0.10
    t_premium = 0.25
    t_needinfo = 0.35

    if prob_est < t_accept:
        return {"decision": "accept", "premium_loading": 0.0}
    if prob_est < t_premium:
        # scale premium from 10% to 100% depending on where it sits in band
        frac = (prob_est - t_accept) / max(1e-6, (t_premium - t_accept))
        loading = round(0.1 + 0.9 * frac, 2)  # 10%..100%
        return {"decision": "accept_with_premium", "premium_loading": loading}
    if prob_est < t_needinfo:
        return {"decision": "needs_more_info", "premium_loading": 0.0}
    return {"decision": "reject", "premium_loading": 0.0}


# Finalize outcomes using calibrated probabilities and simulated underwriting
dataset: List[Dict[str, Any]] = []
deaths = 0
decisions_count: Dict[str, int] = {"accept": 0, "accept_with_premium": 0, "needs_more_info": 0, "reject": 0}

for person in raw_people:
    p_true = min(scale * person["risk_multiplier"], 0.95)
    died_within_20y = random.random() < p_true

    # Underwriter estimates risk with a little noise (log-normal-ish)
    noise = random.gauss(1.0, 0.15)  # ~15% std; clamps later
    noise = max(0.6, min(noise, 1.6))
    p_est = max(0.0, min(p_true * noise, 0.95))

    decision_pack = decide_underwriter(p_est)
    decisions_count[decision_pack["decision"]] += 1
    if died_within_20y:
        deaths += 1

    record = dict(person)
    record.update({
        "p_true_20y": round(p_true, 4),
        "underwriter_score": round(p_est, 4),
        "underwriter_decision": decision_pack["decision"],
        "premium_loading": decision_pack["premium_loading"],
        "died_within_20y": died_within_20y,
    })

    dataset.append(record)

# ----------------------------
# SAVE
# ----------------------------
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

avg_mortality = deaths / N
print(f"Generated {N} synthetic records → {OUTPUT_FILE}")
print(f"Achieved average 20y mortality: {avg_mortality:.2%} (target {TARGET_20Y_MORTALITY:.2%})")
print("Decision mix:", decisions_count)
print("Example record:")
print(json.dumps(dataset[0], indent=2))

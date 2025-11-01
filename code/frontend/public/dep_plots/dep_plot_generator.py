import numpy as np
import matplotlib.pyplot as plt
import os

# ==== 1. Applicant data ====
applicant = {
    "age": 21,
    "bmi": 27.7,
    "smoking": True,  # categorical
    "drug_frequency": 0.0,
    "sport_hours": 3.0,
}

# ==== 2. Generate sample data and fake model risk functions ====
np.random.seed(42)

age = np.linspace(18, 80, 50)
bmi = np.linspace(15, 40, 50)
smoking = np.array([0, 1])  # 0=No, 1=Yes
drug_frequency = np.linspace(0, 7, 8)  # times per week
sport_hours = np.linspace(0, 7, 8)  # hours per week

def risk_function(x, base=0.2, scale=0.05):
    return 1 / (1 + np.exp(-(x - base) / scale))

risk_age = risk_function((age - 40) / 40)
risk_bmi = risk_function((bmi - 25) / 7)
risk_smoking = np.array([0.3, 0.8])  # categorical risk
risk_drug = risk_function(drug_frequency / 7
)
risk_sport = 1 - risk_function(sport_hours / 7)

threshold = 0.5

# ==== 3. Plot helper ====
def plot_dependency(x, y, feature_name, xlabel, applicant_value, categorical=False):
    plt.figure(figsize=(6, 4))
    plt.title(f"Dependency Plot: {feature_name}", fontsize=14)

    # Acceptance & rejection shading
    plt.axhspan(0, threshold, color="green", alpha=0.15, label="Accept region (<50%)")
    plt.axhspan(threshold, 1, color="red", alpha=0.15, label="Reject region (>50%)")
    plt.axhline(threshold, color="black", linestyle="--", linewidth=1)

    # Model curve or discrete points
    if categorical:
        plt.scatter(x, y, color="dodgerblue", s=80, zorder=3)
        plt.xticks(x, labels=[str(i) for i in x])
    else:
        plt.plot(x, y, color="dodgerblue", linewidth=2)
        plt.scatter(x, y, color="dodgerblue", s=30)

    # Overlay applicant data point
    if categorical:
        # find the right x-index (0 or 1)
        app_x = 1 if applicant_value else 0
        app_y = y[app_x]
        plt.scatter(app_x, app_y, color="black", s=120, marker="o", edgecolors="white", zorder=5)
        plt.text(app_x, app_y + 0.05, "Applicant", ha="center", fontsize=9)
    else:
        # interpolate approximate risk for that value
        app_y = np.interp(applicant_value, x, y)
        plt.scatter(applicant_value, app_y, color="black", s=120, marker="o", edgecolors="white", zorder=5)
        plt.text(applicant_value, app_y + 0.05, f"Applicant\n({applicant_value})", ha="center", fontsize=9)

    plt.xlabel(xlabel, fontsize=12)
    plt.ylabel("Predicted Risk (0–1)", fontsize=12)
    plt.ylim(0, 1)
    plt.legend(loc="lower right")
    plt.grid(alpha=0.2)

    os.makedirs("dependency_plots", exist_ok=True)
    path = f"dependency_plots/{feature_name.lower().replace(' ', '_')}.png"
    plt.tight_layout()
    plt.savefig(path, dpi=300)
    plt.close()
    print(f"✅ Saved: {path}")

# ==== 4. Run for each feature ====
# plot_dependency(age, risk_age, "Age", "Age (years)", applicant["age"], categorical=False)
# plot_dependency(bmi, risk_bmi, "BMI", "Body Mass Index", applicant["bmi"], categorical=False)
# plot_dependency(smoking, risk_smoking, "Smoking", "Smoker (0=No, 1=Yes)", applicant["smoking"], categorical=True)
# plot_dependency(drug_frequency, risk_drug, "Drug Frequency", "Drug Use Frequency (per week)", applicant["drug_frequency"], categorical=False)
plot_dependency(sport_hours, risk_sport, "Sport Hours", "Sport Activity (hours per week)", applicant["sport_hours"], categorical=False)
from fastapi import APIRouter, HTTPException
<<<<<<< HEAD
import numpy as np
import os
from pathlib import Path

# Force non-interactive backend before importing pyplot
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

router = APIRouter()

OUT_DIR = Path(__file__).resolve().parents[1] / "static" / "dependency_plots"
OUT_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/dependency_plots")
def generate_dependency_plots(applicant: dict):
    """Generate dependency plots dynamically for the applicant."""
    try:
        # === extract applicant data ===
        age = applicant.get("age", 40)
        bmi = applicant.get("bmi", 25)
        smoking = applicant.get("smoking", False)
        drug_freq = applicant.get("drug_frequency", 0.0)
        sport_hours = applicant.get("sports_activity_h_per_week", 0.0)

        # === generate risk curves ===
        def risk_function(x, base=0.2, scale=0.05):
            return 1 / (1 + np.exp(-(x - base) / scale))

        features = {
            "age": (np.linspace(18, 80, 50), lambda x: risk_function((x - 40) / 40), "Age (years)", age),
            "bmi": (np.linspace(15, 40, 50), lambda x: risk_function((x - 25) / 7), "BMI", bmi),
            "smoking": (np.array([0, 1]), np.array([0.3, 0.8]), "Smoking (0=No, 1=Yes)", int(smoking)),
            "drug_frequency": (np.linspace(0, 7, 8), lambda x: risk_function(x / 7), "Drug Frequency (per week)", drug_freq),
            "sport_hours": (np.linspace(0, 7, 8), lambda x: 1 - risk_function(x / 7), "Sport Hours (per week)", sport_hours),
        }

        threshold = 0.5
        saved_paths = {}

        for feature, (x, y_func, xlabel, applicant_value) in features.items():
            y = y_func(x) if callable(y_func) else y_func
            plt.figure(figsize=(6, 4))
            plt.title(f"Dependency Plot: {feature.capitalize()}", fontsize=14)
            plt.axhspan(0, threshold, color="green", alpha=0.15)
            plt.axhspan(threshold, 1, color="red", alpha=0.15)
            plt.axhline(threshold, color="black", linestyle="--", linewidth=1)

            if len(x) == 2:  # categorical
                plt.scatter(x, y, color="dodgerblue", s=80)
                # safely map boolean/other values to category index 0/1
                try:
                    idx = 1 if int(bool(applicant_value)) else 0
                except Exception:
                    idx = 0
                app_x = x[idx]
                app_y = y[idx]
                # mark applicant category
                plt.scatter([app_x], [app_y], color="black", s=120, edgecolors="white", zorder=5)
            else:
                plt.plot(x, y, color="dodgerblue", linewidth=2)
                plt.scatter(x, y, color="dodgerblue", s=20)
                app_y = np.interp(applicant_value, x, y)
                plt.scatter(applicant_value, app_y, color="black", s=120, edgecolors="white", zorder=5)

            plt.xlabel(xlabel)
            plt.ylabel("Predicted Risk (0–1)")
            plt.ylim(0, 1)
            plt.grid(alpha=0.2)
            plt.tight_layout()

            out_path = OUT_DIR / f"{feature}.png"
            plt.savefig(out_path, dpi=300)
            plt.close()  # free figure resources
            # return a web path matching the StaticFiles mount (leading slash)
            saved_paths[feature] = f"/dependency_plots/{feature}.png"
            print (f"Saved plot for {feature} at {out_path}")

        return {"dependency_plots": saved_paths}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
=======

import numpy as np

from pathlib import Path



# Force non-interactive backend before importing pyplot

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt



router = APIRouter()



OUT_DIR = Path(__file__).resolve().parents[1] / "static" / "dependency_plots"

OUT_DIR.mkdir(parents=True, exist_ok=True)



@router.post("/dependency_plots")

def generate_dependency_plots(applicant: dict):

    """Generate dependency plots dynamically for the applicant."""

    try:

        # === extract applicant data ===

        age = applicant.get("age", 40)

        bmi = applicant.get("bmi", 25)

        smoking = applicant.get("smoking", False)

        drug_freq = applicant.get("drug_frequency", 0.0)

        sport_hours = applicant.get("sports_activity_h_per_week", 0.0)



        # === generate risk curves ===

        def risk_function(x, base=0.2, scale=0.05):

            return 1 / (1 + np.exp(-(x - base) / scale))



        features = {

            "age": (np.linspace(18, 80, 50), lambda x: risk_function((x - 40) / 40), "Age (years)", age),

            "bmi": (np.linspace(15, 40, 50), lambda x: risk_function((x - 25) / 7), "BMI", bmi),

            "smoking": (np.array([0, 1]), np.array([0.3, 0.8]), "Smoking (0=No, 1=Yes)", int(smoking)),

            "drug_frequency": (np.linspace(0, 7, 8), lambda x: risk_function(x / 7), "Drug Frequency (per week)", drug_freq),

            "sport_hours": (np.linspace(0, 7, 8), lambda x: 1 - risk_function(x / 7), "Sport Hours (per week)", sport_hours),

        }



        threshold = 0.5

        saved_paths = {}



        for feature, (x, y_func, xlabel, applicant_value) in features.items():

            y = y_func(x) if callable(y_func) else y_func

            plt.figure(figsize=(6, 4))

            plt.title(f"Dependency Plot: {feature.capitalize()}", fontsize=14)

            plt.axhspan(0, threshold, color="green", alpha=0.15)

            plt.axhspan(threshold, 1, color="red", alpha=0.15)

            plt.axhline(threshold, color="black", linestyle="--", linewidth=1)



            if len(x) == 2:  # categorical

                plt.scatter(x, y, color="dodgerblue", s=80)

                # safely map boolean/other values to category index 0/1

                try:

                    idx = 1 if int(bool(applicant_value)) else 0

                except Exception:

                    idx = 0

                app_x = x[idx]

                app_y = y[idx]

                # mark applicant category

                plt.scatter([app_x], [app_y], color="black", s=120, edgecolors="white", zorder=5)

            else:

                plt.plot(x, y, color="dodgerblue", linewidth=2)

                plt.scatter(x, y, color="dodgerblue", s=20)

                app_y = np.interp(applicant_value, x, y)

                plt.scatter(applicant_value, app_y, color="black", s=120, edgecolors="white", zorder=5)



            plt.xlabel(xlabel)

            plt.ylabel("Predicted Risk (0–1)")

            plt.ylim(0, 1)

            plt.grid(alpha=0.2)

            plt.tight_layout()



            out_path = OUT_DIR / f"{feature}.png"

            plt.savefig(out_path, dpi=300)

            plt.close()  # free figure resources

            # return a web path (without /api prefix, as frontend will add it)
            # The frontend will use: ${API_BASE}${depPath} where API_BASE='/api'
            saved_paths[feature] = f"/dependency_plots/{feature}.png"

            print (f"Saved plot for {feature} at {out_path}")



        return {"dependency_plots": saved_paths}



    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))

>>>>>>> f102a10b479dd00cbda3109a86cf7d7d36a01fb4

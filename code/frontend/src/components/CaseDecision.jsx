import React, { useState } from "react";

const API_BASE = '/api'

// -------- Helper functions for payload and API --------
function getCategoryAnswer(applicantData, category, predicate) {
  const list = applicantData?.categories?.[category];
  if (!Array.isArray(list)) return undefined;
  if (!predicate) {
    const a = list.find((x) => typeof x?.answer !== "undefined");
    return a?.answer;
  }
  const hit = list.find(predicate);
  return hit?.answer;
}

function parseYesNo(val) {
  if (typeof val === 'boolean') return val;
  if (!val) return undefined;
  const s = String(val).toLowerCase();
  if (["yes", "y", "true"].includes(s)) return true;
  if (["no", "n", "false"].includes(s)) return false;
  return undefined;
}

function parseNumber(val) {
  if (typeof val === 'number') return val;
  if (val == null) return undefined;
  const n = Number(String(val).replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function findRiskKeyword(listLike) {
  if (!listLike) return undefined;
  const s = String(listLike).toLowerCase();
  if (s.includes('danger')) return 'danger';
  if (s.includes('warning')) return 'warning';
  if (s.includes('safe')) return 'safe';
  return undefined;
}

function normalizeGender(val) {
  if (!val) return undefined;
  const s = String(val).toLowerCase();
  if (s.startsWith('m')) return 'm';
  if (s.startsWith('f')) return 'f';
  if (s.startsWith('o')) return 'other';
  return undefined;
}

async function callPredictAPI(payload) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

function buildPayload(applicantData) {
  // Extract values from our demo structure with best-effort normalization
  const gender = normalizeGender(getCategoryAnswer(applicantData, 'Gender'));
  const age = parseNumber(getCategoryAnswer(applicantData, 'Age'));
  const marital_status = String(getCategoryAnswer(applicantData, 'Marital Status') || '').toLowerCase() || undefined;
  const height_cm = parseNumber(getCategoryAnswer(applicantData, 'Height (cm)'));
  const weight_kg = parseNumber(getCategoryAnswer(applicantData, 'Weight (kg)'));
  const bmi = parseNumber(getCategoryAnswer(applicantData, 'BMI'));
  const smoking = parseYesNo(getCategoryAnswer(applicantData, 'Smoking'));
  const packs_per_week = parseNumber(getCategoryAnswer(applicantData, 'Packs per Week'));
  const drug_use = parseYesNo(getCategoryAnswer(applicantData, 'Drug Use'));
  const drug_frequency = parseNumber(getCategoryAnswer(applicantData, 'Drug Frequency'));
  const drug_type = findRiskKeyword(getCategoryAnswer(applicantData, 'Drug Type')) || 'safe';
  const staying_abroad = parseYesNo(getCategoryAnswer(applicantData, 'Staying Abroad'));
  const abroad_type = findRiskKeyword(getCategoryAnswer(applicantData, 'Abroad Type')) || 'safe';
  const dangerous_sports = parseYesNo(getCategoryAnswer(applicantData, 'Dangerous Sports'));
  const sport_type = findRiskKeyword(getCategoryAnswer(applicantData, 'Sport Type')) || 'safe';
  const medical_issue = parseYesNo(getCategoryAnswer(applicantData, 'Medical Issue'));
  const medical_type = findRiskKeyword(getCategoryAnswer(applicantData, 'Medical Type')) || 'safe';
  const doctor_visits = parseYesNo(getCategoryAnswer(applicantData, 'Doctor Visits'));
  const visit_type = String(getCategoryAnswer(applicantData, 'Visit Type') || '').toLowerCase() || undefined;
  const regular_medication = parseYesNo(getCategoryAnswer(applicantData, 'Regular Medication'));
  const medication_type = findRiskKeyword(getCategoryAnswer(applicantData, 'Medication Type')) || 'safe';
  const sports_activity_h_per_week = parseNumber(getCategoryAnswer(applicantData, 'Sports Activity (hours/week)'));
  const earning_chf = parseNumber(getCategoryAnswer(applicantData, 'Earning (CHF)'));

  return {
    gender, age, marital_status,
    height_cm, weight_kg, bmi,
    smoking, packs_per_week,
    drug_use, drug_frequency, drug_type,
    staying_abroad, abroad_type,
    dangerous_sports, sport_type,
    medical_issue, medical_type,
    doctor_visits, visit_type,
    regular_medication, medication_type,
    sports_activity_h_per_week,
    earning_chf,
    include_explanation: true
  };
}

async function handleRunCalculationInner({ applicantData, setLoading, setError, setDecision, setLastResult, updateShapImpacts }) {
  try {
    setError("");
    setLoading(true);
    const payload = buildPayload(applicantData);
    const result = await callPredictAPI(payload);
    setDecision(result.decision || "");
    setLastResult(result);
    // Update SHAP impacts mapping for the category bars
    const grouped = result?.explanation?.grouped_impacts || [];
    const mapping = grouped.reduce((acc, g) => { acc[g.category] = Number(g.impact || 0); return acc; }, {});
    updateShapImpacts(mapping);
  } catch (e) {
    console.error(e);
    setError(String(e?.message || e));
  } finally {
    setLoading(false);
  }
}
export default function CaseDecision({ onBack }) {
  const model_decision = "reject";
 const applicantData = {
    general: {
      name: data?.name || "Applicant",
      birthdate: data?.birthdate || "Not provided",
      address: "—"
    },
    categories: {
      "Gender": [
        { question: "What is your gender?", answer: data.gender },
        { question: "Do you identify with your registered gender?", answer: "Yes" }
      ],
      "Age": [
        { question: "What is your current age?", answer: data.age },
        { question: "Has your age been verified through official ID?", answer: "Yes" }
      ],
      "Marital Status": [
        { question: "What is your marital status?", answer: data.marital_status }
      ],
      "BMI": [
        { question: "What is your BMI?", answer: data.bmi },
        { question: "Height (cm)", answer: data.height_cm },
        { question: "Weight (kg)", answer: data.weight_kg }
      ],
      "Smoking": [
        { question: "Do you smoke?", answer: data.smoking ? "Yes" : "No" },
        { question: "Packs per week", answer: data.packs_per_week }
      ],
      "Drug Use": [
        { question: "Do you use recreational drugs?", answer: data.drug_use ? "Yes" : "No" },
        { question: "Frequency (per week)", answer: data.drug_frequency },
        { question: "Type", answer: data.drug_type }
      ],
      "Medical": [
        { question: "Do you have any medical issues?", answer: data.medical_issue ? "Yes" : "No" },
        { question: "Condition severity", answer: data.medical_type }
      ],
      "Doctor Visits": [
        { question: "Do you visit a doctor regularly?", answer: data.doctor_visits ? "Yes" : "No" },
        { question: "Type of doctor", answer: data.visit_type }
      ],
      "Sports": [
        { question: "Do you play dangerous sports?", answer: data.dangerous_sports ? "Yes" : "No" },
        { question: "Sport type", answer: data.sport_type },
        { question: "Activity hours per week", answer: data.sports_activity_h_per_week }
      ],
      "Financial": [
        { question: "Annual earning (CHF)", answer: data.earning_chf }
      ]
    },
    modelExplanation:
      `Based on this person's critical heart condition and old age of 70, the model predicts a high insurance payout risk.`,
    non_modelFactors:
        {"application_year": 2006,
    "risk_multiplier": 0.8621382,
    "risk_score": 0.1002100210021002,
    "underwriter_score": 0.1003,
    "underwriter_decision": "accept_with_premium",
    "premium_loading": 0.1}
    
  };

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const toggleExpand = (cat) =>
    setExpandedCategory(expandedCategory === cat ? null : cat);

  // Persisted SHAP-like impact values (stable across re-renders and page reloads)
  const SHAP_STORAGE_KEY = "shapImpacts_v1";
  const [shapImpacts, setShapImpacts] = useState(() => {
    try {
      const raw = localStorage.getItem(SHAP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const categoryKeys = Object.keys(applicantData.categories);
        const hasAll = categoryKeys.every((k) => typeof parsed[k] !== "undefined");
        if (hasAll) return parsed;
      }
    } catch (e) {
      // ignore and regenerate on error
    }

    const generated = Object.keys(applicantData.categories).reduce((acc, key) => {
      acc[key] = parseFloat((Math.random() * 2 - 1).toFixed(2)); // -1 to 1 numeric
      return acc;
    }, {});

    try { localStorage.setItem(SHAP_STORAGE_KEY, JSON.stringify(generated)); } catch {}

    return generated;
  });

  const updateShapImpacts = (newMap) => {
    try {
      const merged = { ...shapImpacts, ...newMap };
      localStorage.setItem(SHAP_STORAGE_KEY, JSON.stringify(merged));
      setShapImpacts(merged);
    } catch {
      setShapImpacts({ ...shapImpacts, ...newMap });
    }
  };

const getImpactColor = (value) => {
  // value normalized between -1 (protective) and 1 (high risk)
  const clamped = Math.max(-1, Math.min(1, value));

  if (clamped < 0) {
    // more vibrant green scale
    const mag = Math.abs(clamped); // 0..1
    const hue = 140; // green
    const saturation = Math.min(100, 80 + Math.round(mag * 20)); // 80%..100%
    const lightness = 45 + Math.round((1 - mag) * 10); // 45%..55%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } else if (clamped === 0) {
    return "#cccccc"; // neutral gray
  } else {
    // more vibrant red scale
    const mag = clamped; // 0..1
    const hue = 0; // red
    const saturation = Math.min(100, 80 + Math.round(mag * 20)); // 80%..100%
    const lightness = 45 - Math.round(mag * 12); // 45%..33%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
};
  const getBarWidth = (value) => `${Math.abs(value) * 60 + 20}px`; // scale visually
// Mock consolidated SHAP values (for global plot)
  const consolidatedSHAP = Object.entries(shapImpacts)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
        width: "100%",
        flex: "1 1 auto",    // allow parent flex to size this component
        minHeight: 0,        // necessary so flex child can shrink and allow scrolling
        overflow: "auto",    // internal scrolling when content overflows
        backgroundColor: "#ffffff",
        position: "relative",
        zIndex: 10
      }}
    >
      {/* Action button above the page title */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "0.75rem", alignItems: "center" }}>
        {decision && (
          <span style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: "#f0f3ff",
            color: "#2c3e50",
            fontWeight: 700,
            border: "1px solid #dce3ff"
          }}>
            Decision: {String(decision)} {lastResult?.score != null ? `(${(lastResult.score*100).toFixed(1)}%)` : ""}
          </span>
        )}
        <button
          className="btn-run-analysis"
          style={{ width: "auto" }}
          type="button"
          disabled={loading}
          onClick={() => handleRunCalculationInner({ applicantData, setLoading, setError, setDecision, setLastResult, updateShapImpacts })}
        >
          {loading ? "Calculating..." : "Run Calculation"}
        </button>
      </div>
      <h1>Life Insurance Analysis</h1>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        ← Back to Form
      </button>

      {/* General info */}
      <section
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}
      >
        <h2>General Details</h2>
        <p><strong>Name:</strong> {applicantData.general.name}</p>
        <p><strong>Date of Birth:</strong> {applicantData.general.birthdate}</p>
        <p><strong>Address:</strong> {applicantData.general.address}</p>
      </section>

      {/* Risk factor section with per-category SHAP mock */}
      <section>
        <h2>Risk Factor Details</h2>
        {Object.entries(applicantData.categories).map(([category, qaList]) => {
          const shapValue = shapImpacts[category];
          const color = getImpactColor(shapValue); // <-- add this
            return (
            <div key={category} style={{ marginBottom: "1rem" }}>
              <button
              onClick={() => toggleExpand(category)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#dedfdeff",
                color: "black",
                border: "none",
                padding: "0.75rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
              >
              {/* Category Title */}
              <span style={{ flex: "1", textAlign: "left" }}>
                {category} {expandedCategory === category ? "▲" : "▼"}
              </span>

              {/* Mock SHAP mini-plot */}
              <div
                style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                }}
              >
                <div
                style={{
                  position: "relative",
                  height: "18px",
                  width: getBarWidth(shapValue),
                  backgroundColor: color,
                  clipPath:
                  shapValue > 0
                    ? "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)"
                    : "polygon(10% 0%, 100% 0%, 100% 100%, 10% 100%, 0% 50%)",
                  borderRadius: "3px",
                  transition: "width 0.3s ease",
                }}
                ></div>
                <span style={{ fontSize: "0.8rem", color: "#4c4848ff" }}>
                {shapValue > 0 ? "+" : ""}
                {shapValue}
                </span>
              </div>
              </button>

              {/* Expanded Q&A with dependency image on the right */}
              {expandedCategory === category && (
              <div
                style={{
                backgroundColor: "#f1f1f1",
                padding: "1rem",
                borderRadius: "4px",
                marginTop: "0.5rem",
                }}
              >
                {(() => {
                const depItem = qaList.find((q) => q.dependency_plot_path);
                const depPath = depItem?.dependency_plot_path;
                // show only QA items that are not the dependency placeholder
                const qaItems = qaList.filter((q) => !q.dependency_plot_path);

                return (
                  <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                  >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {qaItems.map((item, index) => (
                    <p key={index} style={{ marginBottom: "0.75rem" }}>
                      <strong>{item.question}</strong>
                      <br />
                      Answer: {String(item.answer)}
                    </p>
                    ))}
                  </div>

                  {depPath && (
                    <div
                    style={{
                      flex: "0 0 320px",
                      maxWidth: "40%",
                      textAlign: "center",
                      alignSelf: "flex-start",
                    }}
                    >
                    <img
                      src={depPath}
                      alt={`${category} dependency plot`}
                      style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                      }}
                    />
                    </div>
                  )}
                  </div>
                );
                })()}
              </div>
              )}
            </div>
            );
        })}
      </section>

      {/* Optional server-side SHAP summary for this client */}
      {lastResult?.explanation?.top_features && (
        <section
          style={{
            backgroundColor: "#eef6ff",
            padding: "1rem",
            borderRadius: "8px",
            marginTop: "1.25rem",
            border: "1px solid #d6e9ff"
          }}
        >
          <h2>SHAP Waterfall (top contributors)</h2>
          <p style={{ marginTop: 0, color: "#4a5568" }}>
            Target class: <strong>{lastResult.explanation.target_class}</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lastResult.explanation.top_features.slice(0, 12).map((f, idx) => {
              const val = Number(f.impact || 0);
              const pos = val >= 0;
              const width = Math.min(100, Math.round(Math.abs(val) * 100));
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: "0 0 240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.feature}</div>
                  <div style={{ flex: 1, height: 12, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, position: "relative" }}>
                    <div style={{
                      position: "absolute",
                      left: pos ? 0 : `calc(50% - ${width/2}%)`,
                      right: pos ? undefined : undefined,
                      height: "100%",
                      width: `${width}%`,
                      background: pos ? "#ef4444" : "#10b981",
                      borderRadius: 6,
                      transform: pos ? "translateX(0)" : "translateX(0)"
                    }} />
                  </div>
                  <div style={{ width: 70, textAlign: "right", color: "#374151" }}>{val.toFixed(3)}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Model explanation */}
      <section
        style={{
          backgroundColor: "#fff3cd",
          padding: "1rem",
          borderRadius: "8px",
          marginTop: "2rem",
          border: "1px solid #ffeeba"
        }}
      >
  <div
    style={{
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
      flexWrap: "wrap",
    }}
  >
    {/* Left: explanation */}
    <div style={{ flex: 1, minWidth: "280px" }}>
      <h2>Model Decision Explanation</h2>
      <p>{applicantData.modelExplanation}</p>
      <p>
        <strong>Model Recommendation:</strong>{" "}
        {model_decision.charAt(0).toUpperCase() + model_decision.slice(1)}
      </p>
    </div>

    {/* Right: consolidated SHAP summary mock */}
    <div style={{ flex: 1, minWidth: "280px" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>Feature Contributions</h3>
      {consolidatedSHAP.map(([feature, value]) => {
        const color = getImpactColor(value);
        return (
          <div
            key={feature}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "6px",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: `${Math.abs(value) * 80 + 20}px`,
                height: "16px",
                backgroundColor: color,
                clipPath:
                  value > 0
                    ? "polygon(0% 0%, 90% 0%, 100% 50%, 90% 100%, 0% 100%)"
                    : "polygon(10% 0%, 100% 0%, 100% 100%, 10% 100%, 0% 50%)",
                borderRadius: "3px",
              }}
            ></div>
            <span
              style={{
                fontSize: "0.85rem",
                color,
                fontWeight: "bold",
              }}
            >
              {value > 0 ? "+" : ""}
              {value}
            </span>
            <span style={{ fontSize: "0.8rem", color: "#333" }}>{feature}</span>
          </div>
        );
      })}
    </div>
  </div>
  </section>
      <section style={{  }}>
        <div style={{  backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "1rem" }}>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginTop: "1rem",
              width: "100%", // or fixed like "400px"
              minHeight: "150px", // makes box taller
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between", // spaces out vertically
            }}
          >
            <h3>Underwriter Decision</h3>
            
            <div
              onChange={(e) => setDecision(e.target.value)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem", // adds consistent spacing between options
                padding: "0.5rem 1rem",
              }}
            >
              <label>
                <input type="radio" name="decision" value="accept" /> Accept
              </label>

              <label>
                <input type="radio" name="decision" value="reject" /> Reject
              </label>

              <label>
                <input type="radio" name="decision" value="accept_high_premium" /> Accept with Higher Premium
              </label>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: "0.95rem", marginBottom: "0.35rem" }}>
            Additional comments (optional)
          </div>
          <textarea
            id="additional_comments"
            name="additional_comments"
            rows="3"
            placeholder="Any notes for underwriting or context..."
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "0.95rem",
              resize: "vertical",
              boxSizing: "border-box"
            }}
          />
        </div>
        </div>
        {decision && (
          <p style={{ marginTop: "1rem" , color: "#175fc4ff"}}>
            <strong>Selected decision:</strong>{" "}
            {decision
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
        )}
        <div style={{ marginTop: "1rem" , display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => {
              if (!decision) {
                alert("Please select a decision before submitting.");
                return;
              }
              const pretty = (d) => d.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              if (decision !== model_decision) {
                const proceed = window.confirm(
                  `Model recommended "${pretty(model_decision)}" but you chose "${pretty(decision)}".\n\nDo you want to proceed?`
                );
                if (!proceed) {
                  return;
                }
                alert(`Decision "${pretty(decision)}" submitted.`);
              } else {
                alert(`Decision "${pretty(decision)}" submitted.`);
              }
            }}
            style={{
              padding: "0.6rem 1rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              
            }}
          >
            Submit Decision
          </button>
        </div>
      </section>

    </div>
    
  );
}
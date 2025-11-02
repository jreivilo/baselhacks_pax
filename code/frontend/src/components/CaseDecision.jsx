import React, { useState } from "react";
import AnalysisAnimation from "./AnalysisAnimation";
import SuccessConfetti from "./SuccessConfetti";

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

// Normalize model decision to either "accept" or "reject" for display/comparison purposes
// Handles: "accept", "accept_with_premium", "needs_more_info", "reject", etc.
// Both "accept" and "accept_with_premium" → "accept"
// Both "reject" and "needs_more_info" → "reject"
function normalizeDecision(decision) {
  if (!decision) return null;
  const s = String(decision).toLowerCase();
  // If decision contains "accept" (e.g., "accept", "accept_with_premium"), treat as accept
  if (s.includes('accept')) return 'accept';
  // "needs_more_info" and "reject" are both treated as reject
  if (s.includes('needs_more_info') || s.includes('more_info') || s === 'reject') return 'reject';
  // Default to reject for any other unknown values
  return 'reject';
}

// Check if a decision is an accept (for display purposes)
function isAcceptDecision(decision) {
  if (!decision) return false;
  const normalized = normalizeDecision(decision);
  return normalized === 'accept';
}

// Get display text for decision - shows "ACCEPT" or "REJECT" regardless of variant
function getDecisionDisplayText(decision) {
  if (!decision) return "Pending Assessment";
  const normalized = normalizeDecision(decision);
  return normalized === 'accept' ? 'ACCEPT' : 'REJECT';
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

function buildPayload(applicantData, data) {
  // Extract values from our demo structure with best-effort normalization
  const gender = normalizeGender(getCategoryAnswer(applicantData, 'Gender'));
  const age = parseNumber(getCategoryAnswer(applicantData, 'Age'));
  const birthdate = data?.birthdate || applicantData?.general?.birthdate || undefined;
  const marital_status = String(getCategoryAnswer(applicantData, 'Marital Status') || '').toLowerCase() || undefined;
  // Height and Weight are in the BMI category, so we need to find them by question text
  const height_cm = parseNumber(getCategoryAnswer(applicantData, 'BMI', (item) => item.question === 'Height (cm)')) || parseNumber(data?.height_cm);
  const weight_kg = parseNumber(getCategoryAnswer(applicantData, 'BMI', (item) => item.question === 'Weight (kg)')) || parseNumber(data?.weight_kg);
  // BMI is in the BMI category as a question
  let bmi = parseNumber(getCategoryAnswer(applicantData, 'BMI', (item) => item.question === 'BMI')) || parseNumber(data?.bmi);
  
  // Validate BMI - typically ranges from 10-70 (170 would be impossible)
  // If BMI seems like it might be weight in kg (e.g., > 100), calculate it from height/weight instead
  if (bmi != null && height_cm != null && weight_kg != null && !isNaN(height_cm) && !isNaN(weight_kg) && height_cm > 0) {
    // If BMI is suspiciously high (>100), it might be weight - recalculate from height/weight
    if (bmi > 100) {
      console.warn(`BMI value ${bmi} seems unrealistic. Recalculating from height (${height_cm}cm) and weight (${weight_kg}kg)`);
      bmi = weight_kg / Math.pow(height_cm / 100, 2);
    }
    // If provided BMI seems reasonable but we can verify, log it
    else if (bmi > 70) {
      console.warn(`BMI value ${bmi} is extremely high (>70). This will likely result in rejection.`);
    }
  }
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
    // const [modelExplanation, setModelExplanation] = useState(
    //     data?.model_explanation ||
    //     `Based on this person's critical heart condition and old age of 70, the model predicts a high insurance payout risk.`
    // );
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


async function handleRunCalculationInner({ applicantData, setLoading, setError, setDecision, setLastResult, updateShapImpacts, setModelExplanation,data
}) {

  try {
    setError("");
    setLoading(true);
    
    // Add minimum delay to ensure animation is visible (3 seconds minimum)
    const startTime = Date.now();
    const minDuration = 3000;
    
    const payload = buildPayload(applicantData, data);
    const result = await callPredictAPI(payload);
    
    // Ensure minimum animation duration
    const elapsed = Date.now() - startTime;
    if (elapsed < minDuration) {
      await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
    }
    
    // Normalize the model decision to "accept" or "reject" for the underwriter decision
    // Both "accept"/"accept_with_premium" → "accept"
    // Both "reject"/"needs_more_info" → "reject"
    const normalizedModelDecision = normalizeDecision(result.decision);
    console.log("Model decision:", result.decision, "→ Normalized:", normalizedModelDecision);
    // Only set the underwriter decision if:
    // 1. User hasn't already made a decision, AND
    // 2. The normalized decision is a clear "accept" or "reject"
    setDecision(prevDecision => {
      if (prevDecision) {
        // User has already made a decision, don't override it
        return prevDecision;
      }
      // Auto-populate with normalized decision (accept or reject)
      const newDecision = normalizedModelDecision || "";
      console.log("Setting decision:", newDecision, "(model was:", result.decision, ")");
      return newDecision;
    });
    setLastResult(result);
    console.log(result.explanation);
    if (result.explanation?.model_explanation) {
          setModelExplanation(result.explanation.model_explanation);
    }
    // Update SHAP impacts mapping for the category bars
    const grouped = result?.explanation?.grouped_impacts || [];
    const mapping = grouped.reduce((acc, g) => { acc[g.category] = Number(g.impact || 0); return acc; }, {});
    updateShapImpacts(mapping);
    
    // Get the updated model explanation
    const updatedExplanation = result.explanation?.model_explanation || applicantData.modelExplanation;
    
    // Save prediction results to backend for persistence
    if (data?.id) {
      try {
        const savePayload = {
          ...data,
          model_prediction_data: result,
          model_explanation: updatedExplanation,
          shap_impacts: mapping,
          model_prediction: result.decision
        };
        await fetch(`${API_BASE}/save/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(savePayload)
        });
      } catch (saveError) {
        console.error('Failed to save prediction data:', saveError);
      }
    }
  } catch (e) {
    console.error(e);
    setError(String(e?.message || e));
  } finally {
    setLoading(false);
  }
}
export default function CaseDecision({ data, onBack }) {
  const plotPaths = data.dependency_plot_paths || {};
  // Note: modelDecision will be defined after lastResult is set

 const applicantData = {
    general: {
      name: (`${data?.first_name ?? ''} ${data?.last_name ?? ''}`.trim()) || "Applicant",
      birthdate: data?.birthdate || "Not provided",
      address: data?.address || "—"
    },
    categories: {
      "Gender": [
        { question: "What is your gender?", answer: data?.gender }
      ],
      "Age": [

        { question: "What is your current age?", answer: data?.age },

      ],
      "Marital Status": [
        { question: "What is your marital status?", answer: data?.marital_status }
      ],
      "BMI": [
        { question: "Height (cm)", answer: data?.height_cm },
        { question: "Weight (kg)", answer: data?.weight_kg },
        { question: "BMI", answer: data?.bmi }
      ],
      "Smoking": [
        { question: "Do you smoke?", answer: data?.smoking ? "Yes" : "No" },
        { question: "Packs per week", answer: data?.packs_per_week }
      ],
      "Drug Use": [
        { question: "Do you use recreational drugs?", answer: data?.drug_use ? "Yes" : "No" },
        { question: "Frequency (per week)", answer: data?.drug_frequency },
        { question: "Type", answer: data?.drug_type }
      ],
      "Medical": [
        { question: "Do you have any medical issues?", answer: data?.medical_issue ? "Yes" : "No" },
        { question: "Condition severity", answer: data?.medical_type }
      ],
      "Doctor Visits": [
        { question: "Do you visit a doctor regularly?", answer: data?.doctor_visits ? "Yes" : "No" },
        { question: "Type of doctor", answer: data?.visit_type }
      ],
      "Sports": [
        { question: "Do you play dangerous sports?", answer: data?.dangerous_sports ? "Yes" : "No" },
        { question: "Sport type", answer: data?.sport_type },
        { question: "Activity hours per week", answer: data?.sports_activity_h_per_week }
      ],
      "Financial": [
        { question: "Annual earning (CHF)", answer: data?.earning_chf }
      ]
    },
    modelExplanation:
      `Based on this person's critical heart condition and old age of 70, the model predicts a high insurance payout risk.`
  };

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [decision, setDecision] = useState(data?.human_prediction ? (data.human_prediction === "Accepted" ? "accept" : "reject") : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState(data?.model_prediction_data || null);
  const [modelExplanation, setModelExplanation] = useState(
        data?.model_explanation || applicantData.modelExplanation
    );
  const [showSuccessConfetti, setShowSuccessConfetti] = useState(false);
  const toggleExpand = (cat) =>
    setExpandedCategory(expandedCategory === cat ? null : cat);

  // SHAP impacts - load from stored data if available
  const [shapImpacts, setShapImpacts] = useState(data?.shap_impacts || {});

  const updateShapImpacts = (newMap) => {
    // Merge backend-provided values; no localStorage or placeholders.
    setShapImpacts((prev) => ({ ...prev, ...newMap }));
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
      {/* Report Header */}
      <div style={{ 
        marginBottom: "3rem",
        paddingBottom: "2rem",
        borderBottom: "2px solid #e5e7eb"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          marginBottom: "2rem"
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              margin: "0 0 0.5rem 0",
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.025em"
            }}>
              Underwriting Risk Assessment Report
            </h1>
            <div style={{ 
              fontSize: "0.875rem",
              color: "#6b7280",
              lineHeight: "1.75"
            }}>
              <div><strong>Case Reference:</strong> {data?.id || "N/A"}</div>
              <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              {applicantData.general.name && (
                <div><strong>Applicant:</strong> {applicantData.general.name}</div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
            <button
              onClick={onBack}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500
              }}
            >
              Back to Application
            </button>
            <button
              className="btn-run-analysis"
              style={{ 
                padding: "0.625rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                boxShadow: loading ? "none" : "0 1px 2px rgba(0,0,0,0.1)"
              }}
              type="button"
              disabled={loading}
              onClick={() => handleRunCalculationInner({ applicantData, setLoading, setError, setDecision, setLastResult, updateShapImpacts,setModelExplanation ,data})}
            >
              {loading ? "Processing..." : "Generate Risk Assessment"}
            </button>
          </div>
        </div>
      </div>

      {/* 1. Executive Summary & AI Risk Assessment */}
      <section
        style={{
          backgroundColor: "#ffffff",
          padding: "2.5rem",
          marginBottom: "2.5rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "2px solid #e5e7eb"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.875rem",
            marginRight: "1rem"
          }}>
            1
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: "1.5rem", 
            fontWeight: 700,
            color: "#111827"
          }}>
            Executive Summary & AI Risk Assessment
          </h2>
        </div>

        {/* Applicant Information */}
        <div style={{
          marginBottom: "2.5rem"
        }}>
          <h3 style={{
            margin: "0 0 1rem 0",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Applicant Information
          </h3>
          <div style={{ 
            fontSize: "0.9375rem", 
            color: "#374151", 
            lineHeight: "2",
            fontFamily: "ui-monospace, monospace"
          }}>
            <div><strong style={{ color: "#111827" }}>Name:</strong> {applicantData.general.name}</div>
            <div><strong style={{ color: "#111827" }}>Date of Birth:</strong> {applicantData.general.birthdate}</div>
            <div><strong style={{ color: "#111827" }}>Address:</strong> {applicantData.general.address}</div>
          </div>
        </div>

        {/* AI Risk Assessment */}
        {lastResult && (
          <div style={{
            marginBottom: "2.5rem"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              AI Risk Assessment
            </h3>
            
            {/* Recommendation */}
            <div style={{
              marginBottom: "2rem",
              padding: "2rem",
              backgroundColor: isAcceptDecision(lastResult.decision) 
                ? "#ecfdf5" 
                : "#fef2f2",
              borderRadius: "8px",
              border: `2px solid ${
                isAcceptDecision(lastResult.decision) 
                  ? "#10b981" 
                  : "#ef4444"
              }`
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "2rem"
              }}>
                <div>
                  <div style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem"
                  }}>
                    Recommendation
                  </div>
                  <div style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: isAcceptDecision(lastResult.decision) 
                      ? "#059669" 
                      : "#dc2626",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    {getDecisionDisplayText(lastResult.decision)}
                  </div>
                </div>
                {lastResult?.score != null && (
                  <div>
                    <div style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.75rem"
                    }}>
                      Confidence Level
                    </div>
                    <div style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#111827"
                    }}>
                      {(lastResult.score * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Assessment Rationale */}
            {modelExplanation && (
              <div>
                <h3 style={{ 
                  margin: "0 0 1rem 0", 
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Assessment Rationale
                </h3>
                <div style={{
                  padding: "1.5rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb"
                }}>
                  <p style={{ 
                    margin: 0, 
                    lineHeight: "1.75", 
                    color: "#374151",
                    fontSize: "0.9375rem"
                  }}>
                    {modelExplanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendation Discrepancy Notice */}
        {lastResult?.decision && decision && normalizeDecision(lastResult.decision) !== normalizeDecision(decision) && (
          <div style={{
            marginTop: "1.5rem",
            padding: "1.25rem",
            backgroundColor: "#fffbeb",
            borderLeft: "4px solid #f59e0b",
            borderRadius: "6px"
          }}>
            <div style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "#92400e",
              marginBottom: "0.5rem"
            }}>
              Recommendation Discrepancy
            </div>
            <div style={{
              fontSize: "0.875rem",
              color: "#78350f",
              lineHeight: "1.75"
            }}>
              The AI risk assessment recommends <strong>{getDecisionDisplayText(lastResult.decision)}</strong>, 
              while the underwriter recommendation is <strong>{decision.toUpperCase()}</strong>.
            </div>
          </div>
        )}
      </section>

      {/* 2. Risk Factor Analysis */}
      <section style={{ 
        backgroundColor: "#ffffff",
        padding: "2.5rem",
        marginBottom: "2.5rem",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "2px solid #e5e7eb"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.875rem",
            marginRight: "1rem"
          }}>
            2
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#111827"
          }}>
            Risk Factor Analysis
          </h2>
        </div>
        <p style={{ 
          margin: "0 0 2rem 0", 
          fontSize: "0.9375rem",
          color: "#6b7280",
          lineHeight: "1.75"
        }}>
          Detailed review of applicant information and risk factor impacts on the assessment outcome.
        </p>
        <div style={{
          display: "grid",
          gap: "1rem"
        }}>
          {Object.entries(applicantData.categories)
            .filter(([category]) => {
              // Only show categories that have dependency plots
              const categoriesWithPlots = ["Age", "BMI", "Smoking", "Drug Use", "Sports"];
              return categoriesWithPlots.includes(category);
            })
            .map(([category, qaList]) => {
            const shapValue = shapImpacts[category];
            const hasValue = typeof shapValue === 'number' && Number.isFinite(shapValue);
            const color = hasValue ? getImpactColor(shapValue) : "#e5e7eb";
            const isExpanded = expandedCategory === category;
            
            return (
              <div 
                key={category} 
                style={{ 
                  border: `1px solid ${isExpanded ? "#2563eb" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease",
                  boxShadow: isExpanded ? "0 4px 6px rgba(0,0,0,0.05)" : "0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                <button
                  onClick={() => toggleExpand(category)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: isExpanded ? "#f8fafc" : "#ffffff",
                    color: "#111827",
                    border: "none",
                    padding: "1rem 1.25rem",
                    cursor: "pointer",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    textAlign: "left",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "1rem",
                    flex: 1
                  }}>
                    <span style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#111827"
                    }}>
                      {category}
                    </span>
                    
                    {/* SHAP Impact Indicator */}
                    {hasValue && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.25rem 0.75rem",
                        backgroundColor: shapValue > 0 ? "#fef2f2" : "#ecfdf5",
                        borderRadius: "12px",
                        border: `1px solid ${shapValue > 0 ? "#fecaca" : "#86efac"}`
                      }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            flexShrink: 0
                          }}
                        ></div>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 600,
                          color: shapValue > 0 ? "#dc2626" : "#059669"
                        }}>
                          {shapValue > 0 ? "+" : ""}{shapValue.toFixed(2)}
                        </span>
                        <span style={{ 
                          fontSize: "0.7rem", 
                          color: "#6b7280",
                          fontWeight: 500
                        }}>
                          {shapValue > 0 ? "Risk" : "Protective"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div style={{
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280",
                    transition: "transform 0.2s ease",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div style={{
                    padding: "1.5rem",
                    backgroundColor: "#ffffff",
                    borderTop: "1px solid #e5e7eb"
                  }}>
                    {(() => {
                      // Map category names to plot path keys
                      const plotKeyMap = {
                        "Age": "age",
                        "BMI": "bmi",
                        "Smoking": "smoking",
                        "Drug Use": "drug_frequency",
                        "Sports": "sport_hours"
                      };
                      const plotKey = plotKeyMap[category];
                      const depPath = plotPaths?.[plotKey];
                      const qaItems = qaList.filter((q) => !q.dependency);

                      return (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: depPath ? "1fr 320px" : "1fr",
                          gap: "2rem",
                          alignItems: "flex-start"
                        }}>
                          {/* Questions and Answers */}
                          <div>
                            <h4 style={{
                              margin: "0 0 1rem 0",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em"
                            }}>
                              Applicant Responses
                            </h4>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "1rem"
                            }}>
                              {qaItems.map((item, index) => (
                                <div 
                                  key={index} 
                                  style={{
                                    padding: "1rem",
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "6px",
                                    border: "1px solid #e5e7eb"
                                  }}
                                >
                                  <div style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#374151",
                                    marginBottom: "0.5rem"
                                  }}>
                                    {item.question}
                                  </div>
                                  <div style={{
                                    fontSize: "0.875rem",
                                    color: "#6b7280",
                                    fontFamily: "ui-monospace, monospace"
                                  }}>
                                    {String(item.answer ?? '—')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dependency Plot */}
                          {depPath && (
                            <div style={{
                              position: "sticky",
                              top: "1rem"
                            }}>
                              <h4 style={{
                                margin: "0 0 1rem 0",
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                              }}>
                                Impact Analysis
                              </h4>
                              <div style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                overflow: "hidden",
                                backgroundColor: "#ffffff"
                              }}>
                                <img
                                  src={`${API_BASE}${depPath}`}
                                  alt={`${category} dependency plot`}
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    display: "block"
                                  }}
                                />
                              </div>
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
        </div>
      </section>

      {/* 3. Feature Impact Analysis */}
      {lastResult?.explanation?.waterfall_url && (
        <section
          style={{
            backgroundColor: "#ffffff",
            padding: "2.5rem",
            marginBottom: "2.5rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "2px solid #e5e7eb"
          }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
              marginRight: "1rem"
            }}>
              3
            </div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827"
            }}>
              Feature Impact Analysis
            </h2>
          </div>
          <p style={{ 
            margin: "0 0 2rem 0", 
            fontSize: "0.9375rem",
            color: "#6b7280",
            lineHeight: "1.75"
          }}>
            SHAP (SHapley Additive exPlanations) waterfall diagram illustrating the relative contribution of each risk factor to the AI assessment outcome.
          </p>
          <div style={{ 
            width: "100%", 
            overflowX: "auto",
            textAlign: "center"
          }}>
            <img
              src={lastResult.explanation.waterfall_url}
              alt="SHAP Waterfall Analysis"
              style={{ 
                maxHeight: "500px", 
                borderRadius: "6px", 
                border: "1px solid #e5e7eb", 
                display: "block", 
                margin: "0 auto"
              }}
            />
          </div>
        </section>
      )}

      {/* 4. Underwriter Decision */}
      <section
        style={{
          backgroundColor: "#ffffff",
          padding: "2.5rem",
          marginBottom: "2.5rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          paddingBottom: "1rem",
          borderBottom: "2px solid #e5e7eb"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.875rem",
            marginRight: "1rem"
          }}>
            4
          </div>
          <h2 style={{ 
            margin: 0, 
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#111827"
          }}>
            Underwriter Decision
          </h2>
        </div>
        <p style={{ 
          margin: "0 0 2rem 0", 
          fontSize: "0.9375rem",
          color: "#6b7280",
          lineHeight: "1.75"
        }}>
          Review the AI risk assessment above and provide your final underwriting recommendation.
        </p>

        <div style={{ 
          backgroundColor: "#f9fafb", 
          borderRadius: "8px", 
          padding: "2rem",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ 
            margin: "0 0 1.5rem 0", 
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            Select Recommendation
          </h3>
          <div
            onChange={(e) => setDecision(e.target.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1.25rem",
              borderRadius: "8px",
              border: decision === "accept" ? "2px solid #10b981" : "1px solid #d1d5db",
              backgroundColor: decision === "accept" ? "#ecfdf5" : "white",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "1rem"
            }}>
              <input 
                type="radio" 
                name="decision" 
                value="accept"
                checked={decision === "accept"}
                onChange={() => setDecision("accept")}
                style={{ margin: "0.25rem 0 0 0" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: decision === "accept" ? "#059669" : "#374151",
                  marginBottom: "0.5rem"
                }}>
                  Accept Application
                </div>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "#6b7280",
                  lineHeight: "1.6"
                }}>
                  Approve this application for life insurance coverage based on acceptable risk profile.
                </div>
              </div>
            </label>

            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "1.25rem",
              borderRadius: "8px",
              border: decision === "reject" ? "2px solid #ef4444" : "1px solid #d1d5db",
              backgroundColor: decision === "reject" ? "#fef2f2" : "white",
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
              <input 
                type="radio" 
                name="decision" 
                value="reject"
                checked={decision === "reject"}
                onChange={() => setDecision("reject")}
                style={{ margin: "0.25rem 0 0 0" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: decision === "reject" ? "#dc2626" : "#374151",
                  marginBottom: "0.5rem"
                }}>
                  Decline Application
                </div>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "#6b7280",
                  lineHeight: "1.6"
                }}>
                  Decline this application due to elevated risk factors that do not meet underwriting criteria.
                </div>
              </div>
            </label>
          </div>
          <div style={{ 
            marginTop: "2rem", 
            paddingTop: "2rem", 
            borderTop: "2px solid #e5e7eb" 
          }}>
            <label style={{ 
              display: "block", 
              fontSize: "0.8125rem", 
              fontWeight: 600, 
              marginBottom: "0.75rem", 
              color: "#374151",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              Additional Notes (Optional)
            </label>
            <textarea
              id="additional_comments"
              name="additional_comments"
              rows="4"
              placeholder="Provide additional notes, context, or reasoning for your underwriting decision..."
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
                backgroundColor: "#ffffff",
                lineHeight: "1.6"
              }}
            />
          </div>
        </div>
        
        <div style={{ 
          marginTop: "1.5rem", 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "0.75rem" 
        }}>
          <button
            onClick={async () => {
              if (!decision) {
                alert("Please select a decision before submitting.");
                return;
              }
              // Show confirmation if decision differs from AI assessment
              if (lastResult?.decision && normalizeDecision(decision) !== normalizeDecision(lastResult.decision)) {
                const aiDisplay = getDecisionDisplayText(lastResult.decision);
                const proceed = window.confirm(
                  `Recommendation Discrepancy\n\n` +
                  `AI Assessment: ${aiDisplay}\n` +
                  `Your Recommendation: ${decision.toUpperCase()}\n\n` +
                  `Proceed with submitting your recommendation?`
                );
                if (!proceed) {
                  return;
                }
              }
              
              // Save decision to backend
              if (data?.id) {
                try {
                  const humanPrediction = decision === "accept" ? "Accepted" : "Rejected";
                  const response = await fetch(`${API_BASE}/documents/${data.id}/human-prediction`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ human_prediction: humanPrediction })
                  });
                  
                  if (response.ok) {
                    // Show success confetti animation
                    setShowSuccessConfetti(true);
                  } else {
                    throw new Error('Failed to save decision');
                  }
                } catch (error) {
                  console.error('Error saving decision:', error);
                  alert(`Failed to save decision: ${error.message}. Please try again.`);
                }
              } else {
                alert(`Underwriting recommendation "${decision.toUpperCase()}" has been submitted.`);
              }
            }}
            disabled={!decision}
            style={{
              padding: "0.625rem 1.5rem",
              backgroundColor: decision ? "#2563eb" : "#9ca3af",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: decision ? "pointer" : "not-allowed",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
          >
            Submit Decision
          </button>
        </div>
      </section>

      {loading && (
        <div className="modal-overlay">
          <div className="modal-content extraction-modal">
            <AnalysisAnimation />
          </div>
        </div>
      )}

      {showSuccessConfetti && (
        <SuccessConfetti 
          onComplete={() => {
            // After animation completes, reload the page
            setTimeout(() => {
              if (window.location) {
                window.location.reload();
              }
            }, 500);
          }}
        />
      )}

    </div>
    
  );
}
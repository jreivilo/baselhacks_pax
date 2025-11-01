import React, { useState } from "react";

// Function to check if a document is empty (missing critical fields)
function isDocumentEmpty(doc) {
  if (!doc) return true;
  
  // Check if critical fields are missing or empty
  const requiredFields = ['age', 'sex', 'address', 'occupation'];
  const criticalMissing = requiredFields.some(field => {
    const value = doc[field];
    return value === null || value === undefined || value === '' || value === 0;
  });
  
  // Also check if numeric fields are invalid
  const numericFields = ['height_cm', 'weight_kg'];
  const numericMissing = numericFields.some(field => {
    const value = doc[field];
    return value === null || value === undefined || value === 0;
  });
  
  return criticalMissing || numericMissing;
}

export default function CaseDecision({ data, onBack }) {
  const isEmpty = isDocumentEmpty(data);
  const model_decision = "reject";
  const applicantData = {
    general: {
      name: "Jane Doe",
      birthdate: "1955-04-12",
      address: "123 Maple Street, Vancouver, Canada"
    },
    categories: {
      "4.1 Gender": [{ question: "What is your gender?", answer: "f" }],
      "4.2 Age": [{ question: "How old are you?", answer: 70 }],
      "6.1 Medical issue": [
        { question: "Do you have any chronic or long-term medical conditions?", answer: "yes" },
        { question: "What medical conditions have you been diagnosed with?", answer: "heart disease" },
        { question: "How serious is the condition?", answer: "danger" }
      ],
      "5.3 Smoking": [
        { question: "Do you smoke?", answer: "yes" },
        { question: "How many packs per week?", answer: 2 }
      ],
      "6.4 Sports activity": [
        { question: "Do you engage in regular exercise?", answer: "no" }
      ]
    },
    modelExplanation:
      `Based on this person's critical heart condition and old age of 70, the model predicts a high insurance payout risk.`,
    
    
  };

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [decision, setDecision] = useState("");

  const toggleExpand = (cat) =>
    setExpandedCategory(expandedCategory === cat ? null : cat);

  // Persisted SHAP-like impact values (stable across re-renders and page reloads)
  const [shapImpacts] = useState(() => {
    const storageKey = "shapImpacts_v1";
    try {
      const raw = localStorage.getItem(storageKey);
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

    try {
      localStorage.setItem(storageKey, JSON.stringify(generated));
    } catch (e) {
      // ignore storage errors
    }

    return generated;
  });

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

              {/* Expanded Q&A */}
              {expandedCategory === category && (
                <div
                  style={{
                    backgroundColor: "#f1f1f1",
                    padding: "1rem",
                    borderRadius: "4px",
                    marginTop: "0.5rem"
                  }}
                >
                  {qaList.map((item, index) => (
                    <p key={index}>
                      <strong>{item.question}</strong><br />
                      Answer: {String(item.answer)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

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
      <section style={{ marginTop: "1.5rem" }}>
        <h3>Underwriter Decision</h3>
        {isEmpty && (
          <div style={{ 
            padding: "12px", 
            backgroundColor: "#f8d7da", 
            border: "1px solid #f5c6cb", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            color: "#721c24"
          }}>
            <strong>⚠️ Incomplete case data.</strong> Complete all required fields to enable Accept decision.
          </div>
        )}
        <div onChange={(e) => {
          const value = e.target.value;
          // Prevent setting accept if document is empty
          if (value === 'accept' && isEmpty) {
            return;
          }
          setDecision(value);
        }}>
          <label style={{ opacity: isEmpty ? 0.5 : 1, cursor: isEmpty ? 'not-allowed' : 'pointer' }}>
            <input 
              type="radio" 
              name="decision" 
              value="accept" 
              disabled={isEmpty}
              checked={decision === 'accept' && !isEmpty}
              style={{ cursor: isEmpty ? 'not-allowed' : 'pointer' }}
            /> 
            Accept
            {isEmpty && <span style={{ fontSize: "0.85rem", color: "#721c24", marginLeft: "8px" }}>(incomplete case)</span>}
          </label>
          <br />
          <label>
            <input type="radio" name="decision" value="reject" checked={decision === 'reject'} /> Reject
          </label>
          <br />
          <label style={{ display: "block", marginTop: "0.75rem" }}>
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
          </label>
          {/* <label>
            <input type="radio" name="decision" value="accept_high_premium" /> Accept with Higher Premium
          </label> */}
        </div>
        {decision && (
          <p style={{ marginTop: "1rem" }}>
            <strong>Selected decision:</strong>{" "}
            {decision.replace(/_/g, " ")}
          </p>
        )}
        <div style={{ marginTop: "1rem" , display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => {
              if (!decision) {
                alert("Please select a decision before submitting.");
                return;
              }
              // Prevent submitting accept for empty documents
              if (decision === 'accept' && isEmpty) {
                alert("Cannot accept incomplete case. Please complete all required fields first.");
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
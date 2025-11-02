import React, { useState } from 'react'

// Static report content for each suggestion
const REPORT_CONTENT = {
  'bmi-sport': {
    title: 'BMI and Sport',
    summary: 'BMI threshold combined with sports activity frequency.',
    executiveSummary: 'Underwriters consistently noted that applicants with elevated BMI (>27) should not be automatically rejected when they demonstrate high sports activity frequency (5+ times/week). Comments emphasized that regular physical activity indicates cardiovascular health and metabolic fitness, which offsets BMI concerns. Multiple underwriters highlighted cases where active individuals with BMI 28-30 were healthier overall than sedentary applicants with lower BMI.',
    technicalFeatures: {
      condition: 'BMI > 27 AND sports_frequency >= 5/week',
      decision: 'ACCEPT',
      reasoning: 'High sports activity frequency compensates for elevated BMI'
    },
    statistics: [
      { label: 'Expected Sales Increase', value: '+18.5%', color: 'green' },
      { label: 'Cases Analyzed', value: '1,247', color: 'blue' },
      { label: 'Confidence Level', value: '87%', color: 'purple' }
    ],
    recommendations: [
      'Train model with counterfactual data where applicants with BMI > 27 AND sports_frequency >= 5/week are labeled as ACCEPT based on past underwriter patterns'
    ]
  },
  'age-occupation': {
    title: 'Age and Occupation',
    summary: 'Age limit combined with occupation risk level.',
    executiveSummary: 'Underwriter comments reveal that age-based rejection should consider occupation type. Cases show underwriters accepting applicants up to age 65 when they have moderate occupational risk levels, noting that professional and desk-based roles have lower physical wear. Comments consistently argue that blanket age limits penalize low-risk occupations unnecessarily and that risk stratification must account for occupational demands.',
    technicalFeatures: {
      condition: 'age < 65 AND occupation_risk_level <= 4',
      decision: 'ACCEPT',
      reasoning: 'Age limit adjusted for moderate occupational risk'
    },
    statistics: [
      { label: 'Expected Sales Increase', value: '+12.3%', color: 'green' },
      { label: 'Cases Analyzed', value: '2,103', color: 'blue' },
      { label: 'Confidence Level', value: '91%', color: 'purple' }
    ],
    recommendations: [
      'Train model with counterfactual data where applicants with age < 65 AND occupation_risk_level <= 4 are labeled as ACCEPT based on past underwriter patterns'
    ]
  },
  'medical-smoking': {
    title: 'Medical Issues and Heavy Smoking',
    summary: 'Medical conditions combined with high smoking frequency.',
    executiveSummary: 'Underwriter analysis reveals that applicants with existing medical issues who also have high smoking frequency (10+ packs per week) present significantly elevated risk that exceeds current model predictions. Underwriters consistently note that medical conditions combined with heavy smoking create multiplicative health risks, particularly for cardiovascular and respiratory conditions. Multiple cases show underwriters rejecting such applicants even when individual risk factors might be borderline acceptable.',
    technicalFeatures: {
      condition: 'medical_issue = true AND packs_per_week >= 10',
      decision: 'REJECT',
      reasoning: 'Applicants with medical issues and heavy smoking (10+ packs/week) have compounded risk exceeding model predictions.'
    },
    statistics: [
      { label: 'Expected Sales Impact', value: '-15.3%', color: 'red' },
      { label: 'Cases Analyzed', value: '856', color: 'blue' },
      { label: 'Confidence Level', value: '94%', color: 'purple' }
    ],
    recommendations: [
      'Train model to REJECT applicants with medical_issue = true AND packs_per_week >= 10 due to compounded risk factors exceeding model predictions.'
    ]
  }
}

export default function Models() {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const [suggestions, setSuggestions] = useState([
    {
      id: 'bmi-sport',
      title: 'BMI and Sport',
      description: 'BMI threshold with sports activity frequency',
      status: 'accepted'
    },
    {
      id: 'age-occupation',
      title: 'Age and Occupation',
      description: 'Age limit with occupation risk level',
      status: 'pending'
    },
    {
      id: 'medical-smoking',
      title: 'Medical Issues and Heavy Smoking',
      description: 'Medical conditions with high smoking frequency',
      status: 'rejected'
    }
  ])

  function handleSuggestionClick(suggestionId) {
    setSelectedSuggestion(suggestionId)
  }

  function handleAcceptProposition() {
    if (selectedSuggestion) {
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === selectedSuggestion 
            ? { ...suggestion, status: 'accepted' }
            : suggestion
        )
      )
    }
  }

  function handleRejectProposition() {
    if (selectedSuggestion) {
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === selectedSuggestion 
            ? { ...suggestion, status: 'rejected' }
            : suggestion
        )
      )
    }
  }

  function handleApplyChanges() {
    const acceptedPropositions = suggestions.filter(s => s.status === 'accepted')
    
    if (acceptedPropositions.length === 0) {
      alert('No accepted propositions to apply.')
      return
    }

    // Process accepted propositions
    const acceptedIds = acceptedPropositions.map(p => p.id)
    const propositionsToApply = acceptedIds.map(id => ({
      id,
      ...REPORT_CONTENT[id],
      status: 'applied'
    }))

    // Here you would typically send this to a backend API
    console.log('Applying accepted propositions:', propositionsToApply)
    
    // Update status to 'applied' for accepted propositions
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.status === 'accepted'
          ? { ...suggestion, status: 'applied' }
          : suggestion
      )
    )

    alert(`Successfully applied ${acceptedPropositions.length} model proposition(s).`)
  }

  const report = selectedSuggestion ? REPORT_CONTENT[selectedSuggestion] : null
  const currentSuggestion = suggestions.find(s => s.id === selectedSuggestion)
  const acceptedCount = suggestions.filter(s => s.status === 'accepted').length
  // Build absolute image URL to the backend GET endpoint so the browser
  // issues a direct GET request to FastAPI. Adjust the host/port if your
  // backend runs elsewhere.
  const recommendationImgUrl = selectedSuggestion
    ? `http://localhost:8000/model_recommendations_plot/${encodeURIComponent(selectedSuggestion)}.png`
    : null

  return (
    <div className="analytics-container">
      <div className="analytics-sidebar">
        <div className="analytics-sidebar-header">
          <h2>Model Propositions</h2>
          <p className="sidebar-subtitle">Top 3 auto-generated proposals from precision evaluation and underwriter overrides</p>
        </div>
        <div className="suggestions-list">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className={`suggestion-item ${selectedSuggestion === suggestion.id ? 'active' : ''}`}
              onClick={() => handleSuggestionClick(suggestion.id)}
            >
              <div className="suggestion-header">
                <h3>{suggestion.title}</h3>
                <span className={`suggestion-status status-${suggestion.status}`}>
                  {suggestion.status}
                </span>
              </div>
              <p className="suggestion-description">{suggestion.description}</p>
            </button>
          ))}
        </div>
        <div className="sidebar-footer" style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            className="btn-apply-changes"
            onClick={handleApplyChanges}
            disabled={acceptedCount === 0}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: acceptedCount > 0 ? 'var(--pax-primary)' : 'var(--border)',
              color: acceptedCount > 0 ? 'white' : 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: acceptedCount > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            Apply Changes {acceptedCount > 0 && `(${acceptedCount})`}
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {report ? (
          <div className="analytics-report">
            <div className="report-header">
              <h1>{report.title}</h1>
              <p className="report-summary">{report.summary}</p>
            </div>

            <div className="report-statistics">
              {report.statistics.map((stat, index) => (
                <div key={index} className={`stat-card stat-${stat.color}`}>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="report-section">
              <h2>Executive Summary</h2>
              <div className="executive-summary">
                <div className="summary-badge">
                  <span className="llm-badge">Generated by LLM</span>
                </div>
                <p className="summary-text">{report.executiveSummary}</p>
              </div>
            </div>

            <div className="report-section">
              <h2>Technical Feature & Decision Logic</h2>
              <div className="technical-features">
                <div className="feature-rule">
                  <div className="feature-condition">
                    <code className="condition-code">{report.technicalFeatures.condition}</code>
                  </div>
                  <div className="feature-arrow">→</div>
                  <div className="feature-decision">
                    <span className={`decision-badge decision-${report.technicalFeatures.decision.toLowerCase()}`}>
                      {report.technicalFeatures.decision}
                    </span>
                  </div>
                  <div className="feature-reasoning">{report.technicalFeatures.reasoning}</div>
                </div>
              </div>
            </div>

            <div className="report-section">
              <h2>Model Change Recommendation</h2>
              <div className="recommendation-single">
                <p className="recommendation-text">{report.recommendations[0]}</p>

                {recommendationImgUrl && (
                  <div style={{ width: "100%", overflowX: "auto" }}>
                    <img
                      src={recommendationImgUrl}
                      alt={`${currentSuggestion?.title || 'recommendation'} plot`}
                      style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'contain', borderRadius: 6, border: '1px solid #d6e9ff', display: 'block', margin: '0 auto' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'
                        console.log("Failed to load recommendation image:", e);
                       }}
                    />
                  </div>
                )}
              </div>
              


            </div>

            <div className="report-actions">
              <button 
                className="btn-accept-proposition"
                onClick={handleAcceptProposition}
                disabled={currentSuggestion?.status === 'accepted'}
              >
                Accept Proposition
              </button>
              <button 
                className="btn-reject-proposition"
                onClick={handleRejectProposition}
                disabled={currentSuggestion?.status === 'rejected'}
              >
                Reject Proposition
              </button>
            </div>
          </div>
        ) : (
          <div className="analytics-empty">
            <div className="empty-icon">🤖</div>
            <h2>Select a Model Proposition</h2>
            <p>Choose a proposition from the sidebar to view detailed analysis and manage model improvements</p>
          </div>
        )}
      </div>
    </div>
  )
}


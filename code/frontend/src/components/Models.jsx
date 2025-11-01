import React, { useState } from 'react'

// Static model suggestions/propositions
const MODEL_SUGGESTIONS = [
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
    id: 'lung-smoking',
    title: 'Lung Disease and Smoking',
    description: 'Lung disease status with smoking history',
    status: 'rejected'
  }
]

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
  'lung-smoking': {
    title: 'Lung Disease and Smoking',
    summary: 'Lung disease status combined with smoking history.',
    executiveSummary: 'Underwriters frequently overrode rejections for former smokers who quit 5+ years ago and have no lung disease history. Comments state that risk diminishes significantly after extended cessation periods for individuals without pre-existing lung conditions. Multiple cases show underwriters noting that long-term former smokers without lung disease should be evaluated similarly to never-smokers, as the elevated risk from smoking has subsided.',
    technicalFeatures: {
      condition: 'lung_disease = false AND (smoking_status = "never" OR (smoking_status = "former" AND years_since_quit >= 5))',
      decision: 'ACCEPT',
      reasoning: 'Former smokers without lung disease acceptable after 5+ years quit'
    },
    statistics: [
      { label: 'Expected Sales Decrease', value: '-22.7%', color: 'red' },
      { label: 'Cases Analyzed', value: '856', color: 'blue' },
      { label: 'Confidence Level', value: '94%', color: 'purple' }
    ],
    recommendations: [
      'Train model with counterfactual data where applicants with lung_disease = false AND (smoking_status = "never" OR (smoking_status = "former" AND years_since_quit >= 5)) are labeled as ACCEPT based on past underwriter patterns'
    ]
  }
}

export default function Models() {
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)

  function handleSuggestionClick(suggestionId) {
    setSelectedSuggestion(suggestionId)
  }

  const report = selectedSuggestion ? REPORT_CONTENT[selectedSuggestion] : null

  return (
    <div className="analytics-container">
      <div className="analytics-sidebar">
        <div className="analytics-sidebar-header">
          <h2>Model Propositions</h2>
          <p className="sidebar-subtitle">Top 3 auto-generated proposals from precision evaluation and underwriter overrides</p>
        </div>
        <div className="suggestions-list">
          {MODEL_SUGGESTIONS.map((suggestion) => (
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
              </div>
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


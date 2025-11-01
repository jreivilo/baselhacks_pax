import React, { useState } from 'react'

// Static model suggestions/propositions
const MODEL_SUGGESTIONS = [
  {
    id: 'bmi-sport',
    title: 'BMI and Sport',
    description: 'Analysis of correlation between Body Mass Index and sports activities on risk assessment',
    status: 'accepted'
  },
  {
    id: 'age-occupation',
    title: 'Age and Occupation',
    description: 'Impact of age and patient occupation on insurance risk evaluation',
    status: 'pending'
  },
  {
    id: 'lung-smoking',
    title: 'Lung Disease and Smoking',
    description: 'Relationship between lung disease history and smoking habits in risk modeling',
    status: 'rejected'
  }
]

// Static report content for each suggestion
const REPORT_CONTENT = {
  'bmi-sport': {
    title: 'BMI and Sport Analysis Report',
    summary: 'This analysis examines the correlation between Body Mass Index (BMI) and sports activities in predicting insurance risk.',
    findings: [
      {
        label: 'Key Finding 1',
        value: 'Patients with BMI between 18.5-25 who engage in regular sports activities show 35% lower risk'
      },
      {
        label: 'Key Finding 2',
        value: 'High BMI (>30) combined with no sports activities increases risk by 48%'
      },
      {
        label: 'Key Finding 3',
        value: 'Regular sports participation (3+ times/week) mitigates BMI-related risk factors by 22%'
      }
    ],
    statistics: [
      { label: 'Average Risk Reduction', value: '28%', color: 'green' },
      { label: 'Cases Analyzed', value: '1,247', color: 'blue' },
      { label: 'Confidence Level', value: '87%', color: 'purple' }
    ],
    recommendations: [
      'Consider offering premium discounts for applicants with optimal BMI and active lifestyle',
      'Implement targeted risk assessment for high BMI applicants without sports activities',
      'Regular sports participation should be weighted more heavily in risk models'
    ]
  },
  'age-occupation': {
    title: 'Age and Occupation Analysis Report',
    summary: 'This report analyzes how age and patient occupation interact to influence insurance risk assessment.',
    findings: [
      {
        label: 'Key Finding 1',
        value: 'Occupation risk varies significantly by age group, with peak risk at ages 45-55'
      },
      {
        label: 'Key Finding 2',
        value: 'Manual labor occupations show 42% higher risk for ages 50+ compared to desk jobs'
      },
      {
        label: 'Key Finding 3',
        value: 'Professional occupations (IT, Finance) show stable risk profile across all age groups'
      }
    ],
    statistics: [
      { label: 'Risk Variation by Age', value: '±34%', color: 'orange' },
      { label: 'Cases Analyzed', value: '2,103', color: 'blue' },
      { label: 'Confidence Level', value: '91%', color: 'purple' }
    ],
    recommendations: [
      'Develop age-adjusted occupation risk matrices for more accurate pricing',
      'Consider occupation transitions in mid-career risk assessment models',
      'Special attention needed for high-risk occupations in the 45-55 age bracket'
    ]
  },
  'lung-smoking': {
    title: 'Lung Disease and Smoking Analysis Report',
    summary: 'Comprehensive analysis of the relationship between lung disease history, smoking habits, and their combined impact on risk assessment.',
    findings: [
      {
        label: 'Key Finding 1',
        value: 'Smoking history with prior lung disease increases risk by 67% compared to non-smokers'
      },
      {
        label: 'Key Finding 2',
        value: 'Former smokers with no lung disease history show risk returning to baseline after 5+ years'
      },
      {
        label: 'Key Finding 3',
        value: 'Active smoking with lung disease has the highest risk profile, requiring specialized underwriting'
      }
    ],
    statistics: [
      { label: 'Risk Increase (Smoking + Lung Disease)', value: '67%', color: 'red' },
      { label: 'Cases Analyzed', value: '856', color: 'blue' },
      { label: 'Confidence Level', value: '94%', color: 'purple' }
    ],
    recommendations: [
      'Implement mandatory detailed lung health assessments for smokers with disease history',
      'Consider tiered premium structures based on smoking status and lung disease history',
      'Former smokers may be eligible for standard rates after 5+ years with clean health records'
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
          <p className="sidebar-subtitle">Review and manage AI-generated model improvements</p>
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
              <h2>Key Findings</h2>
              <div className="findings-list">
                {report.findings.map((finding, index) => (
                  <div key={index} className="finding-item">
                    <div className="finding-label">{finding.label}</div>
                    <div className="finding-value">{finding.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-section">
              <h2>Recommendations</h2>
              <ul className="recommendations-list">
                {report.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
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


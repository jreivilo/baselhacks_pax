import React from 'react'

const API_BASE = '/api'

export default function CaseDecision({ documentId, data, onUpdate, onToast, onRunAnalysis, isAnalyzing }){
  
  async function handleHumanPrediction(prediction){
    try{
      const response = await fetch(`${API_BASE}/documents/${documentId}/human-prediction`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ human_prediction: prediction })
      })
      
      if(!response.ok) throw new Error('Update failed')
      
      const result = await response.json()
      onUpdate(result.data)
      
      const message = prediction 
        ? `Human decision: ${prediction}` 
        : 'Human override cleared'
      onToast({ message, type: 'success' })
      
      // Trigger parent refresh to update document list
      window.dispatchEvent(new CustomEvent('documentUpdated'))
    } catch(error){
      console.error('Human prediction error:', error)
      onToast({ message: 'Failed to update decision', type: 'error' })
    }
  }

  if(!data.model_prediction && !data.human_prediction){
    return (
      <div className="case-decision-panel">
        <h3>Case Analysis</h3>
        <div className="no-analysis">
          <p>No analysis available yet</p>
          <p className="hint">Run analysis to get AI prediction</p>
          <button 
            className="btn-run-analysis" 
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Run Analysis'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="case-decision-panel">
      <h3>Case Analysis</h3>
      
      {/* AI Prediction */}
      {data.model_prediction && (
        <div className="decision-section">
          <label className="decision-label">🤖 AI Prediction</label>
          <div className={`decision-badge decision-${data.model_prediction.toLowerCase()}`}>
            {data.model_prediction}
          </div>
        </div>
      )}

      {/* Human Decision */}
      <div className="decision-section">
        <label className="decision-label">👤 Human Decision</label>
        {data.human_prediction ? (
          <div className="human-decision-active">
            <div className={`decision-badge decision-${data.human_prediction.toLowerCase()}`}>
              {data.human_prediction}
            </div>
            <button 
              className="btn-clear-decision"
              onClick={() => handleHumanPrediction(null)}
              title="Clear human decision"
            >
              Clear Override
            </button>
          </div>
        ) : (
          <div className="human-decision-buttons">
            <button 
              className="btn-accept"
              onClick={() => handleHumanPrediction('Accepted')}
            >
              ✓ Accept
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleHumanPrediction('Rejected')}
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>

      {data.human_prediction && (
        <div className="decision-note">
          <strong>Note:</strong> Human decision overrides AI prediction
        </div>
      )}

      {/* Run/Re-run Analysis Button */}
      <button 
        className="btn-run-analysis" 
        onClick={onRunAnalysis}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? '⏳ Analyzing...' : data.model_prediction ? '🔄 Re-run Analysis' : '🔍 Run Analysis'}
      </button>
    </div>
  )
}

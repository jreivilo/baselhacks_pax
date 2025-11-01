import React, { useState, useEffect } from 'react'

const API_BASE = '/api'

// Function to validate a single field
function isFieldValid(field, value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  // Boolean false is a valid value, so don't reject it
  if (typeof value === 'boolean') return true
  // For numbers, NaN is invalid, but 0 might be valid for some fields
  if (typeof value === 'number' && isNaN(value)) return false
  
  // For required numeric fields, 0 is typically invalid (age, height, weight can't be 0)
  // But allow 0 for optional fields like packs_per_week, drug_frequency
  const requiredNumericFields = ['age', 'height_cm', 'weight_kg', 'earning_chf']
  if (requiredNumericFields.includes(field) && typeof value === 'number' && value === 0) {
    return false
  }
  
  return true
}

// Function to check if a document is incomplete (missing required fields)
function isDocumentIncomplete(doc) {
  if (!doc) return true
  
  // BMI is now required (must be filled)
  const requiredFields = [
    'age', 'gender', 'address', 'occupation', 'height_cm', 'weight_kg', 'bmi',
    'medical_conditions', 'sports', 'annual_income', 'birthdate', 
    'marital_status', 'smoking', 'drug_use', 'drug_type', 'staying_abroad',
    'abroad_type', 'dangerous_sports', 'sport_type', 'medical_issue',
    'medical_type', 'doctor_visits', 'visit_type', 'regular_medication',
    'medication_type', 'earning_chf'
  ]
  
  // Check if any required field is invalid
  return requiredFields.some(field => {
    return !isFieldValid(field, doc[field])
  })
}

export default function DocumentList({ documents, selectedId, onSelect, loading, onDelete }){
  const [incompleteDocs, setIncompleteDocs] = useState(new Set())

  // Check which documents are incomplete
  useEffect(() => {
    async function checkIncompleteDocuments() {
      const incompleteSet = new Set()
      
      for (const doc of documents) {
        try {
          const response = await fetch(`${API_BASE}/documents/${doc.id}`)
          if (response.ok) {
            const fullDoc = await response.json()
            if (isDocumentIncomplete(fullDoc)) {
              incompleteSet.add(doc.id)
            }
          }
        } catch (error) {
          console.error(`Failed to check document ${doc.id}:`, error)
        }
      }
      
      setIncompleteDocs(incompleteSet)
    }
    
    if (documents.length > 0) {
      checkIncompleteDocuments()
    }
  }, [documents])
  
  async function handleDelete(docId, event){
    event.stopPropagation() // Prevent selecting the document
    
    if(!confirm('Are you sure you want to delete this case? This action cannot be undone.')){
      return
    }
    
    try{
      const response = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE'
      })
      
      if(!response.ok) throw new Error('Delete failed')
      
      onDelete(docId)
    } catch(error){
      console.error('Delete error:', error)
      alert('Failed to delete case')
    }
  }
  
  if(loading){
    return (
      <aside className="document-list">
        <div className="list-header">
          <h2>Cases</h2>
        </div>
        <div className="loading">Loading...</div>
      </aside>
    )
  }

  if(documents.length === 0){
    return (
      <aside className="document-list">
        <div className="list-header">
          <h2>Cases</h2>
          <p className="count">0 cases</p>
        </div>
        <div className="empty-state">
          <p>No cases yet</p>
          <p className="hint">Click the + button to upload</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="document-list">
      <div className="list-header">
        <h2>Cases</h2>
        <p className="count">{documents.length} case{documents.length !== 1 ? 's' : ''}</p>
      </div>
      
      <ul className="document-items">
        {documents.map((doc) => {
          // Format date - show only month and year
          const formatDate = (dateStr) => {
            if (!dateStr || dateStr === 'Unknown') return 'Unknown';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          };

          const isIncomplete = incompleteDocs.has(doc.id);
          
          // Determine status: incomplete > prediction > complete > pending
          let status = 'pending'
          let statusClass = 'status-pending'
          
          if (isIncomplete) {
            status = 'incomplete'
            statusClass = 'status-incomplete'
          } else if (doc.model_prediction) {
            status = doc.model_prediction.toLowerCase()
            statusClass = `status-${status}`
          } else if (doc.human_prediction) {
            status = doc.human_prediction.toLowerCase()
            statusClass = `status-${status}`
          } else {
            status = 'complete'
            statusClass = 'status-complete'
          }

          return (
            <li 
              key={doc.id}
              className={`document-item ${selectedId === doc.id ? 'active' : ''}`}
              onClick={() => onSelect(doc.id)}
            >
              <div className={`doc-icon ${isIncomplete ? 'doc-icon-incomplete' : ''}`}>
                {isIncomplete ? '⚠️' : '📄'}
              </div>
              <div className="doc-info">
                <h3 className="doc-title">{doc.name || doc.filename}</h3>
                <p className="doc-date">{formatDate(doc.uploaded_at)}</p>
                <span className={`doc-status ${statusClass}`}>
                  STATUS: {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <button 
                className="btn-delete-small"
                onClick={(e) => handleDelete(doc.id, e)}
                title="Delete case"
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  )
}

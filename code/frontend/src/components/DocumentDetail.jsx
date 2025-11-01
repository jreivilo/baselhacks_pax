import React, { useState, useEffect } from 'react'
import AnalysisAnimation from './AnalysisAnimation'
import Toast from './Toast'

const API_BASE = 'http://localhost:8000'

export default function DocumentDetail({ documentId, onUpdate }){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPdf, setShowPdf] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if(documentId){
      loadDocument()
    } else {
      setData(null)
    }
  }, [documentId])

  async function loadDocument(){
    setLoading(true)
    try{
      const response = await fetch(`${API_BASE}/documents/${documentId}`)
      const docData = await response.json()
      setData(docData)
      setFormData(docData)
      setTempName(docData.name || docData.filename)
    } catch(error){
      console.error('Failed to load document:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleNameSave(){
    if(!tempName || tempName === data.name) {
      setIsEditingName(false)
      return
    }
    
    try{
      const response = await fetch(`${API_BASE}/documents/${documentId}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName })
      })
      
      if(!response.ok) throw new Error('Name update failed')
      
      setData(prev => ({ ...prev, name: tempName }))
      setFormData(prev => ({ ...prev, name: tempName }))
      setIsEditingName(false)
      onUpdate()
      setToast({ message: 'Case name updated successfully', type: 'success' })
    } catch(error){
      console.error('Name update error:', error)
      setToast({ message: 'Failed to update case name', type: 'error' })
      setTempName(data.name || data.filename)
      setIsEditingName(false)
    }
  }

  function handleNameKeyPress(e){
    if(e.key === 'Enter'){
      handleNameSave()
    } else if(e.key === 'Escape'){
      setTempName(data.name || data.filename)
      setIsEditingName(false)
    }
  }

  function handleChange(field, value){
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleFieldBlur(field, value){
    // Auto-save field on blur if changed
    if(data[field] === value) return
    
    const updatedData = { ...formData, [field]: value }
    
    try{
      const response = await fetch(`${API_BASE}/save/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      
      if(!response.ok) throw new Error('Save failed')
      
      setData(updatedData)
      onUpdate()
    } catch(error){
      console.error('Save error:', error)
      // Revert on error
      setFormData(data)
    }
  }

  async function handleRunAnalysis(){
    setIsAnalyzing(true)
    try{
      const response = await fetch(`${API_BASE}/documents/${documentId}/analyze`, {
        method: 'POST'
      })
      
      if(!response.ok) throw new Error('Analysis failed')
      
      const result = await response.json()
      setData(result.data)
      setFormData(result.data)
      onUpdate()
      
	const boxStyle = {
		display: 'inline-block',
		padding: '3px 8px',
		borderRadius: 6,
		color: '#fff',
		backgroundColor: result.prediction === 'Accepted' ? '#28a745' : '#dc3545',
		fontWeight: 600,
		marginLeft: 8,
	};

	const message = (
		<span>
			Analysis complete! Status: <span style={boxStyle}>{result.prediction}</span>
		</span>
	);
      
      // Always show green toast for successful analysis completion
      setToast({ 
        message, 
        type: 'success'
      })
    } catch(error){
      console.error('Analysis error:', error)
      setToast({ message: 'Failed to run analysis', type: 'error' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if(!documentId){
    return (
      <div className="document-detail">
        <div className="document-detail-empty">
          <p>Select a life insurance case to view details</p>
        </div>
      </div>
    )
  }

  if(loading){
    return (
      <div className="document-detail">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if(!data){
    return (
      <div className="document-detail">
        <div className="error">Failed to load case</div>
      </div>
    )
  }

  return (
    <div className="document-detail">
      <div className="document-detail-header">
        <div className="header-title-section">
          {isEditingName ? (
            <input 
              type="text" 
              value={tempName} 
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleNameKeyPress}
              onBlur={handleNameSave}
              className="name-edit-input"
              autoFocus
            />
          ) : (
            <h2 onClick={() => setIsEditingName(true)} className="editable-title" title="Click to edit name">
              {data.name || data.filename}
            </h2>
          )}
        </div>
        <div className="document-detail-actions">
          <button 
            className="btn-toggle-pdf" 
            onClick={() => setShowPdf(!showPdf)}
            title={showPdf ? "Hide PDF" : "Show PDF"}
          >
            {showPdf ? "Hide PDF" : "Show PDF"}
          </button>
          <button 
            className="btn-analyze" 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Run Analysis'}
          </button>
        </div>
      </div>

      <div className="detail-split-view">
        {showPdf && (
          <div className="pdf-viewer-container">
            <iframe 
              src={`${API_BASE}/pdf/${documentId}`}
              className="pdf-viewer"
              title="Document PDF"
            />
          </div>
        )}

        <div className="data-section">
          <div className="detail-grid">
        <div className="detail-field">
          <label>Age</label>
          <input 
            type="number" 
            value={formData.age} 
            onChange={(e) => handleChange('age', parseInt(e.target.value))} 
            onBlur={(e) => handleFieldBlur('age', parseInt(e.target.value))}
          />
        </div>

        <div className="detail-field">
          <label>Sex</label>
          <select 
            value={formData.sex} 
            onChange={(e) => {
              handleChange('sex', e.target.value)
              handleFieldBlur('sex', e.target.value)
            }}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className="detail-field full-width">
          <label>Address</label>
          <input 
            type="text" 
            value={formData.address} 
            onChange={(e) => handleChange('address', e.target.value)} 
            onBlur={(e) => handleFieldBlur('address', e.target.value)}
          />
        </div>

        <div className="detail-field">
          <label>Occupation</label>
          <input 
            type="text" 
            value={formData.occupation} 
            onChange={(e) => handleChange('occupation', e.target.value)} 
            onBlur={(e) => handleFieldBlur('occupation', e.target.value)}
          />
        </div>

        <div className="detail-field">
          <label>Smoker</label>
          <select 
            value={formData.smoker} 
            onChange={(e) => {
              handleChange('smoker', e.target.value)
              handleFieldBlur('smoker', e.target.value)
            }}
          >
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div className="detail-field full-width">
          <label>Sports</label>
          <input 
            type="text" 
            value={formData.sports} 
            onChange={(e) => handleChange('sports', e.target.value)} 
            onBlur={(e) => handleFieldBlur('sports', e.target.value)}
          />
        </div>

        <div className="detail-field full-width">
          <label>Medical Conditions</label>
          <input 
            type="text" 
            value={formData.medical_conditions} 
            onChange={(e) => handleChange('medical_conditions', e.target.value)} 
            onBlur={(e) => handleFieldBlur('medical_conditions', e.target.value)}
          />
        </div>

        <div className="detail-field">
          <label>Height (cm)</label>
          <input 
            type="number" 
            value={formData.height_cm} 
            onChange={(e) => handleChange('height_cm', parseInt(e.target.value))} 
            onBlur={(e) => handleFieldBlur('height_cm', parseInt(e.target.value))}
          />
        </div>

        <div className="detail-field">
          <label>Weight (kg)</label>
          <input 
            type="number" 
            value={formData.weight_kg} 
            onChange={(e) => handleChange('weight_kg', parseInt(e.target.value))} 
            onBlur={(e) => handleFieldBlur('weight_kg', parseInt(e.target.value))}
          />
        </div>

        <div className="detail-field full-width">
          <label>Annual Income</label>
          <input 
            type="text" 
            value={formData.annual_income} 
            onChange={(e) => handleChange('annual_income', e.target.value)} 
            onBlur={(e) => handleFieldBlur('annual_income', e.target.value)}
          />
        </div>
      </div>

      {data.uploaded_at && (
        <div className="detail-footer">
          <small>Case ID: {data.id}</small>
        </div>
      )}
        </div>
      </div>

      {isAnalyzing && (
        <div className="modal-overlay">
          <div className="modal-content extraction-modal">
            <AnalysisAnimation />
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

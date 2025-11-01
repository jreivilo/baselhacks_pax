import React, { useState, useEffect } from 'react'
import AnalysisAnimation from './AnalysisAnimation'
import Toast from './Toast'
import CaseDecision from './CaseDecision'

const API_BASE = 'http://localhost:8000'

// Function to validate a single field
function isFieldValid(field, value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  if (typeof value === 'number' && value === 0) return false
  return true
}

// Function to get invalid fields
function getInvalidFields(formData) {
  if (!formData) return new Set()
  
  const requiredFields = ['age', 'sex', 'address', 'occupation', 'height_cm', 'weight_kg', 'medical_conditions', 'sports', 'annual_income']
  const invalid = new Set()
  
  requiredFields.forEach(field => {
    if (!isFieldValid(field, formData[field])) {
      invalid.add(field)
    }
  })
  
  return invalid
}

export default function DocumentDetail({ documentId, onUpdate }){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [toast, setToast] = useState(null)
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [touchedFields, setTouchedFields] = useState(new Set())

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
      // Validate fields on load
      const invalid = getInvalidFields(docData)
      setInvalidFields(invalid)
    } catch(error){
      console.error('Failed to load document:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleDataUpdate(updatedData){
    setData(updatedData)
    setFormData(updatedData)
    onUpdate() // Refresh document list
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
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Validate field in real-time
      const isValid = isFieldValid(field, value)
      setInvalidFields(prevInvalid => {
        const newInvalid = new Set(prevInvalid)
        if (isValid) {
          newInvalid.delete(field)
        } else {
          newInvalid.add(field)
        }
        return newInvalid
      })
      return updated
    })
  }

  function handleFieldFocus(field) {
    setTouchedFields(prev => new Set(prev).add(field))
  }

  function handleFieldKeyPress(e, field, value){
    if(e.key === 'Enter'){
      e.target.blur() // Trigger blur to save
    }
  }

  async function handleFieldBlur(field, value){
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field))
    
    // Auto-save field on blur if changed
    const originalValue = data[field]
    
    // Skip if value hasn't changed
    if(originalValue === value) {
      // Still validate even if unchanged
      const isValid = isFieldValid(field, value)
      setInvalidFields(prevInvalid => {
        const newInvalid = new Set(prevInvalid)
        if (isValid) {
          newInvalid.delete(field)
        } else {
          newInvalid.add(field)
        }
        return newInvalid
      })
      return
    }
    
    // Handle numeric fields - ensure we have valid numbers
    let finalValue = value
    if(field === 'age' || field === 'height_cm' || field === 'weight_kg') {
      finalValue = isNaN(value) || value === null || value === undefined ? originalValue : value
    }
    
    // Create updated data with all fields from formData
    const updatedData = { 
      ...data,  // Start with current data to ensure all fields are present
      ...formData, // Apply any pending changes
      [field]: finalValue  // Apply the specific field change
    }
    
    try{
      console.log('Sending data:', updatedData)
      const response = await fetch(`${API_BASE}/save/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      
      if(!response.ok) {
        const errorText = await response.text()
        console.error('Save failed:', response.status, errorText)
        throw new Error('Save failed')
      }
      
      setData(updatedData)
      setFormData(updatedData)
      // Re-validate all fields after save
      const invalid = getInvalidFields(updatedData)
      setInvalidFields(invalid)
      onUpdate()
      setToast({ message: 'Changes saved', type: 'success' })
    } catch(error){
      console.error('Save error:', error)
      setToast({ message: 'Failed to save changes', type: 'error' })
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
		backgroundColor: result.model_prediction === 'Accepted' ? '#28a745' : '#dc3545',
		fontWeight: 600,
		marginLeft: 8,
	};

	const message = (
		<span>
			Analysis complete! Status: <span style={boxStyle}>{result.model_prediction}</span>
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
      <div
        className="document-detail"
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 10,
          padding: '1rem'
        }}
      >
        <div className="document-detail-empty">
          <p>Select a life insurance case to view details</p>
        </div>
      </div>
    )
  }

  if(loading){
    return (
      <div
        className="document-detail"
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 10,
          padding: '1rem'
        }}
      >
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if(!data){
    return (
      <div
        className="document-detail"
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 10,
          padding: '1rem'
        }}
      >
        <div className="error">Failed to load case</div>
      </div>
    )
  }

  return (
    <div
      className="document-detail"
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        position: 'relative',
        zIndex: 10,
        padding: '1rem'
      }}
    >
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
            {showPdf ? "📄 Hide PDF" : "📄 Show PDF"}
          </button>
          <button 
            className="btn-toggle-analysis" 
            onClick={() => setShowAnalysis(!showAnalysis)}
            title={showAnalysis ? "Hide Analysis" : "Show Analysis"}
          >
            {showAnalysis ? "📊 Hide Analysis" : "📊 Show Analysis"}
          </button>
        </div>
      </div>

      <div className="detail-split-view"
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: "1rem",
          minHeight: 0   // allow children with minHeight:0 to scroll properly
        }}
      >
        {showPdf && (
          <div className="pdf-viewer-container">
            <iframe 
              src={`${API_BASE}/pdf/${documentId}`}
              className="pdf-viewer"
              title="Document PDF"
            />
          </div>
        )}

        <div className="data-section" style={{ flex: 1, minHeight: 0 }}>
          <div className="detail-grid">
        <div className={`detail-field ${invalidFields.has('age') ? 'field-invalid' : ''}`}>
          <label>Age</label>
          <input 
            type="number" 
            value={formData.age || ''} 
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'age', parseInt(e.target.value) || 0)}
            onBlur={(e) => {
              handleFieldFocus('age')
              handleFieldBlur('age', parseInt(e.target.value) || 0)
            }}
            onFocus={() => handleFieldFocus('age')}
            className={invalidFields.has('age') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('sex') ? 'field-invalid' : ''}`}>
          <label>Sex</label>
          <select 
            value={formData.sex || ''} 
            onChange={(e) => {
              handleChange('sex', e.target.value)
              handleFieldBlur('sex', e.target.value)
            }}
            onFocus={() => handleFieldFocus('sex')}
            className={invalidFields.has('sex') ? 'input-invalid' : ''}
          >
            <option value="">Select...</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div className={`detail-field full-width ${invalidFields.has('address') ? 'field-invalid' : ''}`}>
          <label>Address</label>
          <input 
            type="text" 
            value={formData.address || ''} 
            onChange={(e) => handleChange('address', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'address', e.target.value)}
            onBlur={(e) => {
              handleFieldFocus('address')
              handleFieldBlur('address', e.target.value)
            }}
            onFocus={() => handleFieldFocus('address')}
            className={invalidFields.has('address') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('occupation') ? 'field-invalid' : ''}`}>
          <label>Occupation</label>
          <input 
            type="text" 
            value={formData.occupation || ''} 
            onChange={(e) => handleChange('occupation', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'occupation', e.target.value)}
            onBlur={(e) => {
              handleFieldFocus('occupation')
              handleFieldBlur('occupation', e.target.value)
            }}
            onFocus={() => handleFieldFocus('occupation')}
            className={invalidFields.has('occupation') ? 'input-invalid' : ''}
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

        <div className={`detail-field full-width ${invalidFields.has('sports') ? 'field-invalid' : ''}`}>
          <label>Sports</label>
          <input 
            type="text" 
            value={formData.sports || ''} 
            onChange={(e) => handleChange('sports', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'sports', e.target.value)}
            onBlur={(e) => {
              handleFieldFocus('sports')
              handleFieldBlur('sports', e.target.value)
            }}
            onFocus={() => handleFieldFocus('sports')}
            className={invalidFields.has('sports') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field full-width ${invalidFields.has('medical_conditions') ? 'field-invalid' : ''}`}>
          <label>Medical Conditions</label>
          <input 
            type="text" 
            value={formData.medical_conditions || ''} 
            onChange={(e) => handleChange('medical_conditions', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'medical_conditions', e.target.value)}
            onBlur={(e) => {
              handleFieldFocus('medical_conditions')
              handleFieldBlur('medical_conditions', e.target.value)
            }}
            onFocus={() => handleFieldFocus('medical_conditions')}
            className={invalidFields.has('medical_conditions') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('height_cm') ? 'field-invalid' : ''}`}>
          <label>Height (cm)</label>
          <input 
            type="number" 
            value={formData.height_cm || ''} 
            onChange={(e) => handleChange('height_cm', parseInt(e.target.value) || 0)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'height_cm', parseInt(e.target.value) || 0)}
            onBlur={(e) => {
              handleFieldFocus('height_cm')
              handleFieldBlur('height_cm', parseInt(e.target.value) || 0)
            }}
            onFocus={() => handleFieldFocus('height_cm')}
            className={invalidFields.has('height_cm') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('weight_kg') ? 'field-invalid' : ''}`}>
          <label>Weight (kg)</label>
          <input 
            type="number" 
            value={formData.weight_kg || ''} 
            onChange={(e) => handleChange('weight_kg', parseInt(e.target.value) || 0)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'weight_kg', parseInt(e.target.value) || 0)}
            onBlur={(e) => {
              handleFieldFocus('weight_kg')
              handleFieldBlur('weight_kg', parseInt(e.target.value) || 0)
            }}
            onFocus={() => handleFieldFocus('weight_kg')}
            className={invalidFields.has('weight_kg') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field full-width ${invalidFields.has('annual_income') ? 'field-invalid' : ''}`}>
          <label>Annual Income</label>
          <input 
            type="text" 
            value={formData.annual_income || ''} 
            onChange={(e) => handleChange('annual_income', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'annual_income', e.target.value)}
            onBlur={(e) => {
              handleFieldFocus('annual_income')
              handleFieldBlur('annual_income', e.target.value)
            }}
            onFocus={() => handleFieldFocus('annual_income')}
            className={invalidFields.has('annual_income') ? 'input-invalid' : ''}
          />
        </div>
      </div>

      {data.uploaded_at && (
        <div className="detail-footer">
          <small>Case ID: {data.id}</small>
        </div>
      )}
        </div>

        {showAnalysis && (
          <CaseDecision 
            documentId={documentId}
            data={data}
            onUpdate={handleDataUpdate}
            onToast={setToast}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            onBack={() => setShowAnalysis(false)}
          />
        )}
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

import React, { useState, useEffect } from 'react'
import AnalysisAnimation from './AnalysisAnimation'
import Toast from './Toast'
import CaseDecision from './CaseDecision'

const API_BASE = '/api'

// Function to validate a single field
function isFieldValid(field, value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  // Boolean false is a valid value, so don't reject it
  if (typeof value === 'boolean') return true
  // For numbers, NaN is invalid, but 0 might be valid for some fields
  if (typeof value === 'number' && isNaN(value)) return false
  
  // Special validation for BMI (required, accepts any number)
  if (field === 'bmi') {
    if (value === null || value === undefined || value === '') return false // Required, so empty is invalid
    if (typeof value !== 'number' || isNaN(value)) return false
    // BMI accepts any number value (no range restrictions)
    return true
  }
  
  // For required numeric fields, 0 is typically invalid (age, height, weight can't be 0)
  // But allow 0 for BMI, packs_per_week, drug_frequency, sports_activity_h_per_week (these accept 0 as valid)
  const requiredNumericFields = ['age', 'height_cm', 'weight_kg', 'earning_chf']
  if (requiredNumericFields.includes(field) && typeof value === 'number' && value === 0) {
    return false
  }
  
  // BMI, packs_per_week, drug_frequency, and sports_activity_h_per_week accept 0 as a valid value
  const fieldsThatAcceptZero = ['bmi', 'packs_per_week', 'drug_frequency', 'sports_activity_h_per_week']
  if (fieldsThatAcceptZero.includes(field) && typeof value === 'number' && value === 0) {
    return true
  }
  
  return true
}

// Function to check if a field has an invalid value (even if optional)
function isFieldInvalid(field, value) {
  return !isFieldValid(field, value)
}

// Function to get invalid fields
function getInvalidFields(formData) {
  if (!formData) return new Set()
  
  // BMI is now required (must be filled)
  const requiredFields = [
    'age', 'gender', 'address', 'occupation', 'height_cm', 'weight_kg', 'bmi',
    'medical_conditions', 'sports', 'annual_income', 'birthdate', 
    'marital_status', 'smoking', 'drug_use', 'drug_type', 'staying_abroad',
    'abroad_type', 'dangerous_sports', 'sport_type', 'medical_issue',
    'medical_type', 'doctor_visits', 'visit_type', 'regular_medication',
    'medication_type', 'earning_chf', 'packs_per_week', 'drug_frequency',
    'sports_activity_h_per_week'
  ]
  const invalid = new Set()
  
  // Check all required fields including BMI
  requiredFields.forEach(field => {
    if (!isFieldValid(field, formData[field])) {
      invalid.add(field)
    }
  })
  
  return invalid
}

// Function to calculate status based on validation
function calculateStatus(formData, invalidFields) {
  if (!formData) return 'pending'
  
  // If there are invalid fields, status is incomplete
  if (invalidFields.size > 0) {
    return 'incomplete'
  }
  
  // If model has made a prediction, show that
  if (formData.model_prediction) {
    return formData.model_prediction.toLowerCase()
  }
  
  // If human has made a prediction, show that
  if (formData.human_prediction) {
    return formData.human_prediction.toLowerCase()
  }
  
  // All fields are valid but no prediction yet
  return 'complete'
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

  useEffect(() => {
    if (!documentId) {
      const saved = localStorage.getItem("formSessionData")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setFormData(parsed)
        } catch (err) {
          console.error("Failed to parse saved form data:", err)
        }
      }
    }
  }, [documentId])
  
  useEffect(() => {
  if (formData) {
    localStorage.setItem("formSessionData", JSON.stringify(formData))
  }
  }, [formData])

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
      // For optional fields like BMI, check if invalid when provided
      const isInvalid = isFieldInvalid(field, value)
      setInvalidFields(prevInvalid => {
        const newInvalid = new Set(prevInvalid)
        if (isInvalid) {
          newInvalid.add(field)
        } else {
          newInvalid.delete(field)
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

  function isFieldMissing(field){
    const value = formData?.[field]
    // Check if field is null, undefined, empty string, or NaN
    return value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))
  }

  function isFieldUnknown(field){
    const value = formData?.[field]
    return value === 'unknown'
  }

  function getFieldClass(field){
    if(isFieldMissing(field)) return 'field-missing'
    if(isFieldUnknown(field)) return 'field-unknown'
    return ''
  }

  async function handleFieldBlur(field, value){
    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(field))
    
    // Auto-save field on blur if changed
    const originalValue = data[field]
    
    // Skip if value hasn't changed
    if(originalValue === value) {
      // Still validate even if unchanged
      const isInvalid = isFieldInvalid(field, value)
      setInvalidFields(prevInvalid => {
        const newInvalid = new Set(prevInvalid)
        if (isInvalid) {
          newInvalid.add(field)
        } else {
          newInvalid.delete(field)
        }
        return newInvalid
      })
      return
    }
    
    // Handle numeric fields - ensure we have valid numbers or null
    let finalValue = value
    const numericFields = ['age', 'height_cm', 'weight_kg', 'bmi', 'packs_per_week', 
                           'drug_frequency', 'sports_activity_h_per_week', 'earning_chf']
    if(numericFields.includes(field)) {
      // Allow null, but reject NaN (only if it's a number type and NaN)
      if(typeof value === 'number' && isNaN(value)) {
        finalValue = originalValue
      } 
      // Special handling for BMI: accepts any number, but must be filled
      else if(field === 'bmi') {
        if(value !== null && value !== undefined && value !== '') {
          const numValue = typeof value === 'number' ? value : parseFloat(value)
          if(isNaN(numValue)) {
            // Invalid BMI value (not a number), revert to original
            finalValue = originalValue !== null && originalValue !== undefined ? originalValue : null
            setToast({ message: 'BMI must be a valid number', type: 'error' })
          } else {
            finalValue = numValue // Accept any number value
          }
        } else {
          // BMI is required, but allow empty for now (will show as invalid)
          finalValue = null
        }
      }
      else {
        finalValue = value // Can be null, undefined, or a valid number
      }
    }
    
    // Create updated data with all fields from formData
    const updatedData = { 
      ...data,  // Start with current data to ensure all fields are present
      ...formData, // Apply any pending changes
      [field]: finalValue  // Apply the specific field change
    }
    
    // Re-validate all fields before save
    const invalid = getInvalidFields(updatedData)
    setInvalidFields(invalid)
    
    // Calculate status based on validation
    // Only update status if no prediction has been made yet
    if (!updatedData.model_prediction && !updatedData.human_prediction) {
      const newStatus = calculateStatus(updatedData, invalid)
      // Status is stored as 'status' field, but we'll calculate it on frontend
      // The backend doesn't need status field since we calculate it dynamically
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
        {showPdf && !showAnalysis && (
          <div className="pdf-viewer-container">
            <iframe 
              src={`${API_BASE}/pdf/${documentId}`}
              className="pdf-viewer"
              title="Document PDF"
            />
          </div>
        )}

        {!showAnalysis && (
          <div className="data-section" style={{ flex: 1, minHeight: 0 }}>
            <div className="detail-grid">
        {/* Basic Information */}
        <div className={`detail-field ${invalidFields.has('gender') ? 'field-invalid' : ''}`}>
          <label>Gender</label>
          <select 
            value={formData.gender || ''} 
            onChange={(e) => {
              handleChange('gender', e.target.value)
              handleFieldBlur('gender', e.target.value)
            }}
            onFocus={() => handleFieldFocus('gender')}
            className={invalidFields.has('gender') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="m">Male</option>
            <option value="f">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('age') ? 'field-invalid' : ''}`}>
          <label>Age</label>
          <input 
            type="number" 
            value={formData.age ?? ''} 
            onChange={(e) => handleChange('age', e.target.value === '' ? null : parseInt(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'age', e.target.value === '' ? null : parseInt(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('age')
              handleFieldBlur('age', e.target.value === '' ? null : parseInt(e.target.value))
            }}
            onFocus={() => handleFieldFocus('age')}
            className={invalidFields.has('age') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('birthdate') ? 'field-invalid' : ''}`}>
          <label>Birthdate</label>
          <input 
            type="date" 
            value={formData.birthdate || ''} 
            onChange={(e) => handleChange('birthdate', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'birthdate', e.target.value)}
            onBlur={(e) => {
              handleFieldFocus('birthdate')
              handleFieldBlur('birthdate', e.target.value)
            }}
            onFocus={() => handleFieldFocus('birthdate')}
            className={invalidFields.has('birthdate') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('marital_status') ? 'field-invalid' : ''}`}>
          <label>Marital Status</label>
          <select 
            value={formData.marital_status || ''} 
            onChange={(e) => {
              handleChange('marital_status', e.target.value)
              handleFieldBlur('marital_status', e.target.value)
            }}
            onFocus={() => handleFieldFocus('marital_status')}
            className={invalidFields.has('marital_status') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
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

        {/* Physical Attributes */}
        <div className={`detail-field ${invalidFields.has('height_cm') ? 'field-invalid' : ''}`}>
          <label>Height (cm)</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.height_cm ?? ''} 
            onChange={(e) => handleChange('height_cm', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'height_cm', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('height_cm')
              handleFieldBlur('height_cm', e.target.value === '' ? null : parseFloat(e.target.value))
            }}
            onFocus={() => handleFieldFocus('height_cm')}
            className={invalidFields.has('height_cm') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('weight_kg') ? 'field-invalid' : ''}`}>
          <label>Weight (kg)</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.weight_kg ?? ''} 
            onChange={(e) => handleChange('weight_kg', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'weight_kg', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('weight_kg')
              handleFieldBlur('weight_kg', e.target.value === '' ? null : parseFloat(e.target.value))
            }}
            onFocus={() => handleFieldFocus('weight_kg')}
            className={invalidFields.has('weight_kg') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('bmi') ? 'field-invalid' : ''}`}>
          <label>BMI</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.bmi ?? ''} 
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseFloat(e.target.value)
              handleChange('bmi', val)
            }}
            onKeyPress={(e) => handleFieldKeyPress(e, 'bmi', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('bmi')
              const val = e.target.value === '' ? null : parseFloat(e.target.value)
              handleFieldBlur('bmi', val)
            }}
            onFocus={() => handleFieldFocus('bmi')}
            className={invalidFields.has('bmi') ? 'input-invalid' : ''}
          />
        </div>

        {/* Smoking Habits */}
        <div className={`detail-field ${invalidFields.has('smoking') ? 'field-invalid' : ''}`}>
          <label>Smoking</label>
          <select 
            value={formData.smoking === null || formData.smoking === undefined ? '' : formData.smoking.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('smoking', val)
              handleFieldBlur('smoking', val)
            }}
            onFocus={() => handleFieldFocus('smoking')}
            className={invalidFields.has('smoking') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
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

        <div className={`detail-field ${invalidFields.has('packs_per_week') ? 'field-invalid' : ''}`}>
          <label>Packs per Week</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.packs_per_week ?? ''} 
            onChange={(e) => handleChange('packs_per_week', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'packs_per_week', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('packs_per_week')
              handleFieldBlur('packs_per_week', e.target.value === '' ? null : parseFloat(e.target.value))
            }}
            onFocus={() => handleFieldFocus('packs_per_week')}
            className={invalidFields.has('packs_per_week') ? 'input-invalid' : ''}
          />
        </div>

        {/* Drug Use */}
        <div className={`detail-field ${invalidFields.has('drug_use') ? 'field-invalid' : ''}`}>
          <label>Drug Use</label>
          <select 
            value={formData.drug_use === null || formData.drug_use === undefined ? '' : formData.drug_use.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('drug_use', val)
              handleFieldBlur('drug_use', val)
            }}
            onFocus={() => handleFieldFocus('drug_use')}
            className={invalidFields.has('drug_use') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('drug_frequency') ? 'field-invalid' : ''}`}>
          <label>Drug Frequency</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.drug_frequency ?? ''} 
            onChange={(e) => handleChange('drug_frequency', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'drug_frequency', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('drug_frequency')
              handleFieldBlur('drug_frequency', e.target.value === '' ? null : parseFloat(e.target.value))
            }}
            onFocus={() => handleFieldFocus('drug_frequency')}
            className={invalidFields.has('drug_frequency') ? 'input-invalid' : ''}
          />
        </div>

        <div className={`detail-field ${invalidFields.has('drug_type') ? 'field-invalid' : ''}`}>
          <label>Drug Type</label>
          <select 
            value={formData.drug_type || ''} 
            onChange={(e) => {
              handleChange('drug_type', e.target.value)
              handleFieldBlur('drug_type', e.target.value)
            }}
            onFocus={() => handleFieldFocus('drug_type')}
            className={invalidFields.has('drug_type') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Travel */}
        <div className={`detail-field ${invalidFields.has('staying_abroad') ? 'field-invalid' : ''}`}>
          <label>Staying Abroad</label>
          <select 
            value={formData.staying_abroad === null || formData.staying_abroad === undefined ? '' : formData.staying_abroad.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('staying_abroad', val)
              handleFieldBlur('staying_abroad', val)
            }}
            onFocus={() => handleFieldFocus('staying_abroad')}
            className={invalidFields.has('staying_abroad') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('abroad_type') ? 'field-invalid' : ''}`}>
          <label>Abroad Type</label>
          <select 
            value={formData.abroad_type || ''} 
            onChange={(e) => {
              handleChange('abroad_type', e.target.value)
              handleFieldBlur('abroad_type', e.target.value)
            }}
            onFocus={() => handleFieldFocus('abroad_type')}
            className={invalidFields.has('abroad_type') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Sports */}
        <div className={`detail-field ${invalidFields.has('dangerous_sports') ? 'field-invalid' : ''}`}>
          <label>Dangerous Sports</label>
          <select 
            value={formData.dangerous_sports === null || formData.dangerous_sports === undefined ? '' : formData.dangerous_sports.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('dangerous_sports', val)
              handleFieldBlur('dangerous_sports', val)
            }}
            onFocus={() => handleFieldFocus('dangerous_sports')}
            className={invalidFields.has('dangerous_sports') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('sport_type') ? 'field-invalid' : ''}`}>
          <label>Sport Type</label>
          <select 
            value={formData.sport_type || ''} 
            onChange={(e) => {
              handleChange('sport_type', e.target.value)
              handleFieldBlur('sport_type', e.target.value)
            }}
            onFocus={() => handleFieldFocus('sport_type')}
            className={invalidFields.has('sport_type') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('sports_activity_h_per_week') ? 'field-invalid' : ''}`}>
          <label>Sports Activity (h/week)</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.sports_activity_h_per_week ?? ''} 
            onChange={(e) => handleChange('sports_activity_h_per_week', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'sports_activity_h_per_week', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('sports_activity_h_per_week')
              handleFieldBlur('sports_activity_h_per_week', e.target.value === '' ? null : parseFloat(e.target.value))
            }}
            onFocus={() => handleFieldFocus('sports_activity_h_per_week')}
            className={invalidFields.has('sports_activity_h_per_week') ? 'input-invalid' : ''}
          />
        </div>

        {/* Medical */}
        <div className={`detail-field ${invalidFields.has('medical_issue') ? 'field-invalid' : ''}`}>
          <label>Medical Issue</label>
          <select 
            value={formData.medical_issue === null || formData.medical_issue === undefined ? '' : formData.medical_issue.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('medical_issue', val)
              handleFieldBlur('medical_issue', val)
            }}
            onFocus={() => handleFieldFocus('medical_issue')}
            className={invalidFields.has('medical_issue') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('medical_type') ? 'field-invalid' : ''}`}>
          <label>Medical Type</label>
          <select 
            value={formData.medical_type || ''} 
            onChange={(e) => {
              handleChange('medical_type', e.target.value)
              handleFieldBlur('medical_type', e.target.value)
            }}
            onFocus={() => handleFieldFocus('medical_type')}
            className={invalidFields.has('medical_type') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('doctor_visits') ? 'field-invalid' : ''}`}>
          <label>Doctor Visits</label>
          <select 
            value={formData.doctor_visits === null || formData.doctor_visits === undefined ? '' : formData.doctor_visits.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('doctor_visits', val)
              handleFieldBlur('doctor_visits', val)
            }}
            onFocus={() => handleFieldFocus('doctor_visits')}
            className={invalidFields.has('doctor_visits') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('visit_type') ? 'field-invalid' : ''}`}>
          <label>Visit Type</label>
          <select 
            value={formData.visit_type || ''} 
            onChange={(e) => {
              handleChange('visit_type', e.target.value)
              handleFieldBlur('visit_type', e.target.value)
            }}
            onFocus={() => handleFieldFocus('visit_type')}
            className={invalidFields.has('visit_type') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="physician">Physician</option>
            <option value="specialist">Specialist</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>

        {/* Medication */}
        <div className={`detail-field ${invalidFields.has('regular_medication') ? 'field-invalid' : ''}`}>
          <label>Regular Medication</label>
          <select 
            value={formData.regular_medication === null || formData.regular_medication === undefined ? '' : formData.regular_medication.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('regular_medication', val)
              handleFieldBlur('regular_medication', val)
            }}
            onFocus={() => handleFieldFocus('regular_medication')}
            className={invalidFields.has('regular_medication') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className={`detail-field ${invalidFields.has('medication_type') ? 'field-invalid' : ''}`}>
          <label>Medication Type</label>
          <select 
            value={formData.medication_type || ''} 
            onChange={(e) => {
              handleChange('medication_type', e.target.value)
              handleFieldBlur('medication_type', e.target.value)
            }}
            onFocus={() => handleFieldFocus('medication_type')}
            className={invalidFields.has('medication_type') ? 'input-invalid' : ''}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Financial */}
        <div className={`detail-field ${invalidFields.has('earning_chf') ? 'field-invalid' : ''}`}>
          <label>Annual Earning (CHF)</label>
          <input 
            type="number" 
            value={formData.earning_chf ?? ''} 
            onChange={(e) => handleChange('earning_chf', e.target.value === '' ? null : parseInt(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'earning_chf', e.target.value === '' ? null : parseInt(e.target.value))}
            onBlur={(e) => {
              handleFieldFocus('earning_chf')
              handleFieldBlur('earning_chf', e.target.value === '' ? null : parseInt(e.target.value))
            }}
            onFocus={() => handleFieldFocus('earning_chf')}
            className={invalidFields.has('earning_chf') ? 'input-invalid' : ''}
          />
        </div>

        {data.uploaded_at && (
          <div className="detail-footer">
            <small>Case ID: {data.id}</small>
          </div>
        )}
            </div>
          </div>
        )}

        {showAnalysis && (
          <CaseDecision 
            data={formData || data}
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

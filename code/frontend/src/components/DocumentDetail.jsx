import React, { useState, useEffect } from 'react'
import AnalysisAnimation from './AnalysisAnimation'
import Toast from './Toast'
import CaseDecision from './CaseDecision'

const API_BASE = '/api'

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
    setFormData(prev => ({ ...prev, [field]: value }))
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
    // Auto-save field on blur if changed
    const originalValue = data[field]
    
    // Skip if value hasn't changed
    if(originalValue === value) return
    
    // Handle numeric fields - ensure we have valid numbers or null
    let finalValue = value
    const numericFields = ['age', 'height_cm', 'weight_kg', 'bmi', 'packs_per_week', 
                           'drug_frequency', 'sports_activity_h_per_week', 'earning_chf']
    if(numericFields.includes(field)) {
      // Allow null, but reject NaN (only if it's a number type and NaN)
      if(typeof value === 'number' && isNaN(value)) {
        finalValue = originalValue
      } else {
        finalValue = value // Can be null, undefined, or a valid number
      }
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
        {/* Basic Information */}
        <div className="detail-field">
          <label>Gender</label>
          <select 
            value={formData.gender || ''} 
            onChange={(e) => {
              handleChange('gender', e.target.value)
              handleFieldBlur('gender', e.target.value)
            }}
            className={isFieldMissing('gender') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="m">Male</option>
            <option value="f">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Age</label>
          <input 
            type="number" 
            value={formData.age ?? ''} 
            onChange={(e) => handleChange('age', e.target.value === '' ? null : parseInt(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'age', e.target.value === '' ? null : parseInt(e.target.value))}
            onBlur={(e) => handleFieldBlur('age', e.target.value === '' ? null : parseInt(e.target.value))}
            className={isFieldMissing('age') ? 'field-missing' : ''}
          />
        </div>

        <div className="detail-field">
          <label>Birthdate</label>
          <input 
            type="date" 
            value={formData.birthdate || ''} 
            onChange={(e) => handleChange('birthdate', e.target.value)} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'birthdate', e.target.value)}
            onBlur={(e) => handleFieldBlur('birthdate', e.target.value)}
            className={isFieldMissing('birthdate') ? 'field-missing' : ''}
          />
        </div>

        <div className="detail-field">
          <label>Marital Status</label>
          <select 
            value={formData.marital_status || ''} 
            onChange={(e) => {
              handleChange('marital_status', e.target.value)
              handleFieldBlur('marital_status', e.target.value)
            }}
            className={isFieldMissing('marital_status') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        {/* Physical Attributes */}
        <div className="detail-field">
          <label>Height (cm)</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.height_cm ?? ''} 
            onChange={(e) => handleChange('height_cm', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'height_cm', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => handleFieldBlur('height_cm', e.target.value === '' ? null : parseFloat(e.target.value))}
            className={isFieldMissing('height_cm') ? 'field-missing' : ''}
          />
        </div>

        <div className="detail-field">
          <label>Weight (kg)</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.weight_kg ?? ''} 
            onChange={(e) => handleChange('weight_kg', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'weight_kg', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => handleFieldBlur('weight_kg', e.target.value === '' ? null : parseFloat(e.target.value))}
            className={isFieldMissing('weight_kg') ? 'field-missing' : ''}
          />
        </div>

        <div className="detail-field">
          <label>BMI</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.bmi ?? ''} 
            onChange={(e) => handleChange('bmi', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'bmi', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => handleFieldBlur('bmi', e.target.value === '' ? null : parseFloat(e.target.value))}
            className={isFieldMissing('bmi') ? 'field-missing' : ''}
          />
        </div>

        {/* Smoking Habits */}
        <div className="detail-field">
          <label>Smoking</label>
          <select 
            value={formData.smoking === null || formData.smoking === undefined ? '' : formData.smoking.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('smoking', val)
              handleFieldBlur('smoking', val)
            }}
            className={isFieldMissing('smoking') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Packs per Week</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.packs_per_week ?? ''} 
            onChange={(e) => handleChange('packs_per_week', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'packs_per_week', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => handleFieldBlur('packs_per_week', e.target.value === '' ? null : parseFloat(e.target.value))}
            className={isFieldMissing('packs_per_week') ? 'field-missing' : ''}
          />
        </div>

        {/* Drug Use */}
        <div className="detail-field">
          <label>Drug Use</label>
          <select 
            value={formData.drug_use === null || formData.drug_use === undefined ? '' : formData.drug_use.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('drug_use', val)
              handleFieldBlur('drug_use', val)
            }}
            className={isFieldMissing('drug_use') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Drug Frequency</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.drug_frequency ?? ''} 
            onChange={(e) => handleChange('drug_frequency', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'drug_frequency', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => handleFieldBlur('drug_frequency', e.target.value === '' ? null : parseFloat(e.target.value))}
            className={isFieldMissing('drug_frequency') ? 'field-missing' : ''}
          />
        </div>

        <div className="detail-field">
          <label>Drug Type</label>
          <select 
            value={formData.drug_type || ''} 
            onChange={(e) => {
              handleChange('drug_type', e.target.value)
              handleFieldBlur('drug_type', e.target.value)
            }}
            className={getFieldClass('drug_type')}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Travel */}
        <div className="detail-field">
          <label>Staying Abroad</label>
          <select 
            value={formData.staying_abroad === null || formData.staying_abroad === undefined ? '' : formData.staying_abroad.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('staying_abroad', val)
              handleFieldBlur('staying_abroad', val)
            }}
            className={isFieldMissing('staying_abroad') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Abroad Type</label>
          <select 
            value={formData.abroad_type || ''} 
            onChange={(e) => {
              handleChange('abroad_type', e.target.value)
              handleFieldBlur('abroad_type', e.target.value)
            }}
            className={getFieldClass('abroad_type')}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Sports */}
        <div className="detail-field">
          <label>Dangerous Sports</label>
          <select 
            value={formData.dangerous_sports === null || formData.dangerous_sports === undefined ? '' : formData.dangerous_sports.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('dangerous_sports', val)
              handleFieldBlur('dangerous_sports', val)
            }}
            className={isFieldMissing('dangerous_sports') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Sport Type</label>
          <select 
            value={formData.sport_type || ''} 
            onChange={(e) => {
              handleChange('sport_type', e.target.value)
              handleFieldBlur('sport_type', e.target.value)
            }}
            className={getFieldClass('sport_type')}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Sports Activity (h/week)</label>
          <input 
            type="number" 
            step="0.1"
            value={formData.sports_activity_h_per_week ?? ''} 
            onChange={(e) => handleChange('sports_activity_h_per_week', e.target.value === '' ? null : parseFloat(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'sports_activity_h_per_week', e.target.value === '' ? null : parseFloat(e.target.value))}
            onBlur={(e) => handleFieldBlur('sports_activity_h_per_week', e.target.value === '' ? null : parseFloat(e.target.value))}
            className={isFieldMissing('sports_activity_h_per_week') ? 'field-missing' : ''}
          />
        </div>

        {/* Medical */}
        <div className="detail-field">
          <label>Medical Issue</label>
          <select 
            value={formData.medical_issue === null || formData.medical_issue === undefined ? '' : formData.medical_issue.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('medical_issue', val)
              handleFieldBlur('medical_issue', val)
            }}
            className={isFieldMissing('medical_issue') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Medical Type</label>
          <select 
            value={formData.medical_type || ''} 
            onChange={(e) => {
              handleChange('medical_type', e.target.value)
              handleFieldBlur('medical_type', e.target.value)
            }}
            className={getFieldClass('medical_type')}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Doctor Visits</label>
          <select 
            value={formData.doctor_visits === null || formData.doctor_visits === undefined ? '' : formData.doctor_visits.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('doctor_visits', val)
              handleFieldBlur('doctor_visits', val)
            }}
            className={isFieldMissing('doctor_visits') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Visit Type</label>
          <select 
            value={formData.visit_type || ''} 
            onChange={(e) => {
              handleChange('visit_type', e.target.value)
              handleFieldBlur('visit_type', e.target.value)
            }}
            className={isFieldMissing('visit_type') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="physician">Physician</option>
            <option value="specialist">Specialist</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>

        {/* Medication */}
        <div className="detail-field">
          <label>Regular Medication</label>
          <select 
            value={formData.regular_medication === null || formData.regular_medication === undefined ? '' : formData.regular_medication.toString()} 
            onChange={(e) => {
              const val = e.target.value === 'true'
              handleChange('regular_medication', val)
              handleFieldBlur('regular_medication', val)
            }}
            className={isFieldMissing('regular_medication') ? 'field-missing' : ''}
          >
            <option value="">-- Select --</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="detail-field">
          <label>Medication Type</label>
          <select 
            value={formData.medication_type || ''} 
            onChange={(e) => {
              handleChange('medication_type', e.target.value)
              handleFieldBlur('medication_type', e.target.value)
            }}
            className={getFieldClass('medication_type')}
          >
            <option value="">-- Select --</option>
            <option value="safe">Safe</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Financial */}
        <div className="detail-field">
          <label>Annual Earning (CHF)</label>
          <input 
            type="number" 
            value={formData.earning_chf ?? ''} 
            onChange={(e) => handleChange('earning_chf', e.target.value === '' ? null : parseInt(e.target.value))} 
            onKeyPress={(e) => handleFieldKeyPress(e, 'earning_chf', e.target.value === '' ? null : parseInt(e.target.value))}
            onBlur={(e) => handleFieldBlur('earning_chf', e.target.value === '' ? null : parseInt(e.target.value))}
            className={isFieldMissing('earning_chf') ? 'field-missing' : ''}
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
            data={formData}    
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

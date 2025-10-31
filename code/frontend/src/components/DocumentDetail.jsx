import React, { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

export default function DocumentDetail({ documentId, onUpdate }){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(null)

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
    } catch(error){
      console.error('Failed to load document:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field, value){
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(){
    try{
      const response = await fetch(`${API_BASE}/save/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if(!response.ok) throw new Error('Save failed')
      
      setData(formData)
      setIsEditing(false)
      onUpdate()
      alert('Data saved successfully!')
    } catch(error){
      console.error('Save error:', error)
      alert('Failed to save data')
    }
  }

  function handleCancel(){
    setFormData(data)
    setIsEditing(false)
  }

  function handleViewPDF(){
    window.open(`${API_BASE}/pdf/${documentId}`, '_blank')
  }

  if(!documentId){
    return (
      <div className="document-detail-empty">
        <p>Select a document to view details</p>
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
        <div className="error">Failed to load document</div>
      </div>
    )
  }

  return (
    <div className="document-detail">
      <div className="document-detail-header">
        <div>
          <h2>{data.filename}</h2>
          <p className="document-meta">Uploaded: {data.uploaded_at}</p>
        </div>
        <div className="document-detail-actions">
          <button className="btn-view-pdf" onClick={handleViewPDF}>
            📄 View PDF
          </button>
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <>
              <button className="btn-save" onClick={handleSave}>Save</button>
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-field">
          <label>Age</label>
          {isEditing ? (
            <input type="number" value={formData.age} onChange={(e) => handleChange('age', parseInt(e.target.value))} />
          ) : (
            <span>{data.age}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Sex</label>
          {isEditing ? (
            <select value={formData.sex} onChange={(e) => handleChange('sex', e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          ) : (
            <span>{data.sex}</span>
          )}
        </div>

        <div className="detail-field full-width">
          <label>Address</label>
          {isEditing ? (
            <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
          ) : (
            <span>{data.address}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Occupation</label>
          {isEditing ? (
            <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} />
          ) : (
            <span>{data.occupation}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Smoker</label>
          {isEditing ? (
            <select value={formData.smoker} onChange={(e) => handleChange('smoker', e.target.value)}>
              <option>Yes</option>
              <option>No</option>
            </select>
          ) : (
            <span>{data.smoker}</span>
          )}
        </div>

        <div className="detail-field full-width">
          <label>Sports</label>
          {isEditing ? (
            <input type="text" value={formData.sports} onChange={(e) => handleChange('sports', e.target.value)} />
          ) : (
            <span>{data.sports}</span>
          )}
        </div>

        <div className="detail-field full-width">
          <label>Medical Conditions</label>
          {isEditing ? (
            <input type="text" value={formData.medical_conditions} onChange={(e) => handleChange('medical_conditions', e.target.value)} />
          ) : (
            <span>{data.medical_conditions}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Height (cm)</label>
          {isEditing ? (
            <input type="number" value={formData.height_cm} onChange={(e) => handleChange('height_cm', parseInt(e.target.value))} />
          ) : (
            <span>{data.height_cm}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Weight (kg)</label>
          {isEditing ? (
            <input type="number" value={formData.weight_kg} onChange={(e) => handleChange('weight_kg', parseInt(e.target.value))} />
          ) : (
            <span>{data.weight_kg}</span>
          )}
        </div>

        <div className="detail-field full-width">
          <label>Annual Income</label>
          {isEditing ? (
            <input type="text" value={formData.annual_income} onChange={(e) => handleChange('annual_income', e.target.value)} />
          ) : (
            <span>{data.annual_income}</span>
          )}
        </div>
      </div>

      {data.uploaded_at && (
        <div className="detail-footer">
          <small>Document ID: {data.id}</small>
        </div>
      )}
    </div>
  )
}

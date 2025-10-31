import React, { useState } from 'react'

export default function DataRow({ data, onSave }){
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(data)

  function handleChange(field, value){
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleSave(){
    onSave(data.id, formData)
    setIsEditing(false)
  }

  function handleCancel(){
    setFormData(data)
    setIsEditing(false)
  }

  return (
    <div className="data-row">
      <div className="data-row-header">
        <h3>{data.filename}</h3>
        <div className="data-row-actions">
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

      <div className="data-grid">
        <div className="data-field">
          <label>Age</label>
          {isEditing ? (
            <input type="number" value={formData.age} onChange={(e) => handleChange('age', parseInt(e.target.value))} />
          ) : (
            <span>{formData.age}</span>
          )}
        </div>

        <div className="data-field">
          <label>Sex</label>
          {isEditing ? (
            <select value={formData.sex} onChange={(e) => handleChange('sex', e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          ) : (
            <span>{formData.sex}</span>
          )}
        </div>

        <div className="data-field full-width">
          <label>Address</label>
          {isEditing ? (
            <input type="text" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
          ) : (
            <span>{formData.address}</span>
          )}
        </div>

        <div className="data-field">
          <label>Occupation</label>
          {isEditing ? (
            <input type="text" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} />
          ) : (
            <span>{formData.occupation}</span>
          )}
        </div>

        <div className="data-field">
          <label>Smoker</label>
          {isEditing ? (
            <select value={formData.smoker} onChange={(e) => handleChange('smoker', e.target.value)}>
              <option>Yes</option>
              <option>No</option>
            </select>
          ) : (
            <span>{formData.smoker}</span>
          )}
        </div>

        <div className="data-field full-width">
          <label>Sports</label>
          {isEditing ? (
            <input type="text" value={formData.sports} onChange={(e) => handleChange('sports', e.target.value)} />
          ) : (
            <span>{formData.sports}</span>
          )}
        </div>

        <div className="data-field full-width">
          <label>Medical Conditions</label>
          {isEditing ? (
            <input type="text" value={formData.medical_conditions} onChange={(e) => handleChange('medical_conditions', e.target.value)} />
          ) : (
            <span>{formData.medical_conditions}</span>
          )}
        </div>

        <div className="data-field">
          <label>Height (cm)</label>
          {isEditing ? (
            <input type="number" value={formData.height_cm} onChange={(e) => handleChange('height_cm', parseInt(e.target.value))} />
          ) : (
            <span>{formData.height_cm}</span>
          )}
        </div>

        <div className="data-field">
          <label>Weight (kg)</label>
          {isEditing ? (
            <input type="number" value={formData.weight_kg} onChange={(e) => handleChange('weight_kg', parseInt(e.target.value))} />
          ) : (
            <span>{formData.weight_kg}</span>
          )}
        </div>

        <div className="data-field full-width">
          <label>Annual Income</label>
          {isEditing ? (
            <input type="text" value={formData.annual_income} onChange={(e) => handleChange('annual_income', e.target.value)} />
          ) : (
            <span>{formData.annual_income}</span>
          )}
        </div>
      </div>

      <div className="data-row-footer">
        <small>Document ID: {data.id}</small>
      </div>
    </div>
  )
}

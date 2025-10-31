import React, { useState } from 'react'

const API_BASE = 'http://localhost:8000'

export default function UploadModal({ onClose, onSuccess }){
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  function handleDragOver(e){
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave(e){
    e.preventDefault()
    setDragActive(false)
  }

  function handleDrop(e){
    e.preventDefault()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if(droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf'))){
      setFile(droppedFile)
    } else {
      alert('Please upload a PDF file')
    }
  }

  function handleFileInput(e){
    const selectedFile = e.target.files[0]
    if(selectedFile){
      setFile(selectedFile)
    }
  }

  async function handleUpload(){
    if(!file) return

    setUploading(true)
    try{
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      })
      
      if(!response.ok) throw new Error('Upload failed')
      
      await response.json()
      onSuccess()
    } catch(error){
      console.error('Upload error:', error)
      alert('Failed to upload document. Make sure the backend is running.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Document</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div 
          className={`modal-dropzone ${dragActive ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p>Drag & drop PDF here</p>
          <p>or</p>
          <label className="file-input-label">
            <input 
              type="file" 
              onChange={handleFileInput}
              accept=".pdf"
              disabled={uploading}
            />
            Browse Files
          </label>
        </div>

        {file && (
          <div className="selected-file">
            <span>📄 {file.name}</span>
            <button onClick={() => setFile(null)}>×</button>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button 
            className="btn-upload" 
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

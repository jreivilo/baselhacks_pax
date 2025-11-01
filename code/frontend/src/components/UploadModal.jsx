import React, { useState } from 'react'
import ExtractionAnimation from './ExtractionAnimation'
import Toast from './Toast'

const API_BASE = '/api'

export default function UploadModal({ onClose, onSuccess }){
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  const MAX_FILES = 2

  function isValidFileType(file){
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png']
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  }

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
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  function handleFileInput(e){
    const selectedFiles = Array.from(e.target.files)
    addFiles(selectedFiles)
  }

  function addFiles(newFiles){
    const validFiles = newFiles.filter(isValidFileType)
    
    if(validFiles.length === 0){
      setToast({ message: 'Please upload PDF or image files (JPG, PNG)', type: 'error' })
      return
    }

    const totalFiles = files.length + validFiles.length
    if(totalFiles > MAX_FILES){
      setToast({ message: `Maximum ${MAX_FILES} files allowed`, type: 'error' })
      return
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  function removeFile(index){
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleUpload(){
    if(files.length === 0) return

    setUploading(true)
    try{
      const formData = new FormData()
      
      // Append all files
      files.forEach(file => {
        formData.append('files', file)
      })
      
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      })
      
      if(!response.ok) throw new Error('Upload failed')
      
      await response.json()
      onSuccess()
    } catch(error){
      console.error('Upload error:', error)
      setUploading(false)
      setToast({ message: 'Failed to upload case. Make sure the backend is running.', type: 'error' })
    }
  }

  if(uploading){
    return (
      <div className="modal-overlay">
        <div className="modal-content extraction-modal">
          <ExtractionAnimation />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upload-modal-mobile" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Case Documents</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div 
          className={`modal-dropzone ${dragActive ? 'active' : ''} ${files.length >= MAX_FILES ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="dropzone-main-text">Drop documents here</p>
          <p className="dropzone-hint">PDF or Photos (max {MAX_FILES})</p>
          
          <div className="upload-options">
            <label className="file-input-label file-label">
              <input 
                type="file" 
                onChange={handleFileInput}
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                disabled={uploading || files.length >= MAX_FILES}
              />
              📁 Browse Files
            </label>
            
            <label className="file-input-label camera-label">
              <input 
                type="file" 
                onChange={handleFileInput}
                accept="image/*"
                capture="environment"
                multiple
                disabled={uploading || files.length >= MAX_FILES}
              />
              📸 Take Photo
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="selected-files-list">
            <p className="files-list-title">{files.length} file(s) selected:</p>
            {files.map((file, index) => (
              <div key={index} className="selected-file">
                <span className="file-icon">
                  {file.type === 'application/pdf' ? '📄' : '📷'}
                </span>
                <span className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </span>
                <button 
                  className="btn-remove-file" 
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button 
            className="btn-upload" 
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Processing...' : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
          </button>
        </div>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  )
}

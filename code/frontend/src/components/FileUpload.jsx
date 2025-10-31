import React, { useState } from 'react'
import DocumentPreview from './DocumentPreview'
import DataRow from './DataRow'

const API_BASE = 'http://localhost:8000'

export default function FileUpload(){
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedData, setExtractedData] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)

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
    
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  function handleFileInput(e){
    const files = Array.from(e.target.files)
    processFiles(files)
  }

  async function processFiles(files){
    const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    
    if(pdfFiles.length === 0){
      alert('Please upload PDF files only')
      return
    }

    for(const file of pdfFiles){
      // Add to uploaded files list
      const filePreview = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadedAt: new Date().toISOString()
      }
      setUploadedFiles(prev => [...prev, filePreview])

      // Upload to backend
      setProcessing(true)
      try{
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        })
        
        if(!response.ok) throw new Error('Upload failed')
        
        const data = await response.json()
        setExtractedData(prev => [...prev, data])
      } catch(error){
        console.error('Upload error:', error)
        alert('Failed to process document. Make sure the backend is running on http://localhost:8000')
      } finally {
        setProcessing(false)
      }
    }
  }

  function removeFile(id){
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  async function saveData(docId, updatedData){
    try{
      const response = await fetch(`${API_BASE}/save/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      
      if(!response.ok) throw new Error('Save failed')
      
      // Update local state
      setExtractedData(prev => prev.map(d => d.id === docId ? updatedData : d))
      alert('Data saved successfully!')
    } catch(error){
      console.error('Save error:', error)
      alert('Failed to save data')
    }
  }

  return (
    <div className="upload-container">
      <div className={`drop-zone ${dragActive ? 'active' : ''} ${processing ? 'processing' : ''}`}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}>
        <div className="drop-zone-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <h3>{processing ? 'Processing...' : 'Drag & Drop PDF documents here'}</h3>
          <p>or</p>
          <label className="file-input-label">
            <input 
              type="file" 
              multiple 
              onChange={handleFileInput}
              accept=".pdf"
              disabled={processing}
            />
            Browse Files
          </label>
          <p className="file-hint">PDF documents only</p>
        </div>
      </div>

      {extractedData.length > 0 && (
        <div className="data-section">
          <h2>Extracted Data ({extractedData.length})</h2>
          <div className="data-list">
            {extractedData.map(data => (
              <DataRow 
                key={data.id} 
                data={data} 
                onSave={saveData}
              />
            ))}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="documents-section">
          <h2>Uploaded Documents ({uploadedFiles.length})</h2>
          <div className="documents-grid">
            {uploadedFiles.map(file => (
              <DocumentPreview 
                key={file.id} 
                file={file} 
                onRemove={() => removeFile(file.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

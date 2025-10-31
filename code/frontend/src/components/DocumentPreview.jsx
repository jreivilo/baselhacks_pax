import React, { useState, useEffect } from 'react'

export default function DocumentPreview({ file, onRemove }){
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if(file.type.startsWith('image/')){
      const url = URL.createObjectURL(file.file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  function formatFileSize(bytes){
    if(bytes < 1024) return bytes + ' B'
    if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(){
    if(file.type.startsWith('image/')) return '🖼️'
    if(file.type === 'application/pdf') return '📄'
    if(file.type.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div className="document-card">
      <button className="remove-btn" onClick={onRemove} title="Remove">×</button>
      
      <div className="document-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={file.name} />
        ) : (
          <div className="file-icon">{getFileIcon()}</div>
        )}
      </div>

      <div className="document-info">
        <h4 className="document-name" title={file.name}>{file.name}</h4>
        <p className="document-meta">{formatFileSize(file.size)}</p>
      </div>
    </div>
  )
}

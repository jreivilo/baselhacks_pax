import React, { useState, useEffect } from 'react'

const API_BASE = '/api'

// Function to check if a document is empty (missing critical fields)
function isDocumentEmpty(doc) {
  // Check if critical fields are missing or empty
  const requiredFields = ['age', 'sex', 'address', 'occupation'];
  const criticalMissing = requiredFields.some(field => {
    const value = doc[field];
    return value === null || value === undefined || value === '' || value === 0;
  });
  
  // Also check if numeric fields are invalid
  const numericFields = ['height_cm', 'weight_kg'];
  const numericMissing = numericFields.some(field => {
    const value = doc[field];
    return value === null || value === undefined || value === 0;
  });
  
  return criticalMissing || numericMissing;
}

export default function DocumentList({ documents, selectedId, onSelect, loading, onDelete }){
  const [emptyDocs, setEmptyDocs] = useState(new Set())

  // Check which documents are empty
  useEffect(() => {
    async function checkEmptyDocuments() {
      const emptySet = new Set()
      
      for (const doc of documents) {
        try {
          const response = await fetch(`${API_BASE}/documents/${doc.id}`)
          if (response.ok) {
            const fullDoc = await response.json()
            if (isDocumentEmpty(fullDoc)) {
              emptySet.add(doc.id)
            }
          }
        } catch (error) {
          console.error(`Failed to check document ${doc.id}:`, error)
        }
      }
      
      setEmptyDocs(emptySet)
    }
    
    if (documents.length > 0) {
      checkEmptyDocuments()
    }
  }, [documents])
  
  async function handleDelete(docId, event){
    event.stopPropagation() // Prevent selecting the document
    
    if(!confirm('Are you sure you want to delete this case? This action cannot be undone.')){
      return
    }
    
    try{
      const response = await fetch(`${API_BASE}/documents/${docId}`, {
        method: 'DELETE'
      })
      
      if(!response.ok) throw new Error('Delete failed')
      
      onDelete(docId)
    } catch(error){
      console.error('Delete error:', error)
      alert('Failed to delete case')
    }
  }
  
  if(loading){
    return (
      <aside className="document-list">
        <div className="list-header">
          <h2>Cases</h2>
        </div>
        <div className="loading">Loading...</div>
      </aside>
    )
  }

  if(documents.length === 0){
    return (
      <aside className="document-list">
        <div className="list-header">
          <h2>Cases</h2>
          <p className="count">0 cases</p>
        </div>
        <div className="empty-state">
          <p>No cases yet</p>
          <p className="hint">Click the + button to upload</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="document-list">
      <div className="list-header">
        <h2>Cases</h2>
        <p className="count">{documents.length} case{documents.length !== 1 ? 's' : ''}</p>
      </div>
      
      <ul className="document-items">
        {documents.map((doc) => {
          // Format date - show only month and year
          const formatDate = (dateStr) => {
            if (!dateStr || dateStr === 'Unknown') return 'Unknown';
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          };

          const isEmpty = emptyDocs.has(doc.id);

          return (
            <li 
              key={doc.id}
              className={`document-item ${selectedId === doc.id ? 'active' : ''}`}
              onClick={() => onSelect(doc.id)}
            >
              <div className={`doc-icon ${isEmpty ? 'doc-icon-incomplete' : ''}`}>
                {isEmpty ? '⚠️' : '📄'}
              </div>
              <div className="doc-info">
                <h3 className="doc-title">{doc.name || doc.filename}</h3>
                <p className="doc-date">{formatDate(doc.uploaded_at)}</p>
                {doc.prediction && (
                  <span className={`doc-status status-${doc.prediction.toLowerCase()}`}>
                    STATUS: {doc.prediction}
                  </span>
                )}
                {!doc.prediction && (
                  <span className={`doc-status ${isEmpty ? 'status-incomplete' : 'status-pending'}`}>
                    STATUS: {isEmpty ? 'Incomplete' : 'Pending'}
                  </span>
                )}
              </div>
              <button 
                className="btn-delete-small"
                onClick={(e) => handleDelete(doc.id, e)}
                title="Delete case"
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  )
}

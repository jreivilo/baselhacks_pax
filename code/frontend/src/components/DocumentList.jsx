import React from 'react'

export default function DocumentList({ documents, selectedId, onSelect, loading }){
  
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
        {documents.map(doc => (
          <li 
            key={doc.id}
            className={`document-item ${selectedId === doc.id ? 'active' : ''}`}
            onClick={() => onSelect(doc.id)}
          >
            <div className="doc-icon">📄</div>
            <div className="doc-info">
              <h3 className="doc-title">{doc.filename}</h3>
              <p className="doc-date">{doc.uploaded_at}</p>
              <p className="doc-id">ID: {doc.id.slice(0, 8)}...</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

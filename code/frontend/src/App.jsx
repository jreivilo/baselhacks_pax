import React, { useState, useEffect } from 'react'
import DocumentList from './components/DocumentList'
import DocumentDetail from './components/DocumentDetail'
import UploadModal from './components/UploadModal'

const API_BASE = 'http://localhost:8000'

export default function App(){
  const [documents, setDocuments] = useState([])
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments(){
    try{
      const response = await fetch(`${API_BASE}/documents`)
      const data = await response.json()
      setDocuments(data.documents)
    } catch(error){
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleDocumentUploaded(){
    loadDocuments()
    setShowUploadModal(false)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <img src="/pax-logo-hell.svg" alt="PAX Logo" className="logo" />
          <h1>Document Management</h1>
        </div>
        <div className="user-profile">
          <span className="user-icon">👤</span>
          <span className="user-greeting">Hello, Claude</span>
        </div>
      </header>
      
      <main className="main-container">
        <DocumentList 
          documents={documents} 
          selectedId={selectedDocId}
          onSelect={setSelectedDocId}
          loading={loading}
        />
        
        <DocumentDetail 
          documentId={selectedDocId}
          onUpdate={loadDocuments}
        />
      </main>

      <button 
        className="fab-button" 
        onClick={() => setShowUploadModal(true)}
        title="Upload new document"
      >
        +
      </button>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleDocumentUploaded}
        />
      )}

      <footer className="app-footer">Built for BaselHack — Challenge: automate underwriting</footer>
    </div>
  )
}

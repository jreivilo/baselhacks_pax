import React, { useState, useEffect } from 'react'
import DocumentList from './components/DocumentList'
import DocumentDetail from './components/DocumentDetail'
import UploadModal from './components/UploadModal'
import Models from './components/Models'
import Analytics from './components/Analytics'

const API_BASE = '/api'

export default function App(){
  const [currentPage, setCurrentPage] = useState('cases') // 'cases', 'models', or 'analytics'
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

  function handleDocumentDeleted(deletedId){
    // If the deleted document was selected, clear selection
    if(selectedDocId === deletedId){
      setSelectedDocId(null)
    }
    // Reload the document list
    loadDocuments()
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-left">
          <img src="/pax-logo-hell.svg" alt="PAX Logo" className="logo" />
          <h1>Life Insurance Case Management</h1>
        </div>
        <nav className="header-nav">
          <button 
            className={`nav-link ${currentPage === 'cases' ? 'active' : ''}`}
            onClick={() => setCurrentPage('cases')}
          >
            Cases
          </button>
          <button 
            className={`nav-link ${currentPage === 'models' ? 'active' : ''}`}
            onClick={() => setCurrentPage('models')}
          >
            Models
          </button>
          <button 
            className={`nav-link ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            Analytics
          </button>
        </nav>
        <div className="user-profile">
          <span className="user-icon">👤</span>
          <span className="user-greeting">Hello, Claude</span>
        </div>
      </header>
      
      <main className="main-container">
        {currentPage === 'cases' ? (
          <>
            <DocumentList 
              documents={documents} 
              selectedId={selectedDocId}
              onSelect={setSelectedDocId}
              onDelete={handleDocumentDeleted}
              loading={loading}
            />
            
            <DocumentDetail 
              documentId={selectedDocId}
              onUpdate={loadDocuments}
            />
          </>
        ) : currentPage === 'models' ? (
          <Models />
        ) : (
          <Analytics />
        )}
      </main>

      {currentPage === 'cases' && (
        <button 
          className="fab-button" 
          onClick={() => setShowUploadModal(true)}
          title="Upload new document"
        >
          +
        </button>
      )}

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

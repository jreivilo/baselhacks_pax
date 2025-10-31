# BaselHacks PAX — Document Processing System

A full-stack application for automated document processing and underwriting data extraction.

## 🏗️ Architecture

- **Frontend**: React + Vite (drag & drop UI)
- **Backend**: FastAPI (PDF processing & data storage)
- **Data Storage**: JSON files in `backend/data/`

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd code/backend
pip install -e .
python main.py
```

Backend runs on **http://localhost:8000**

### 2. Start the Frontend

```bash
cd code/frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### 3. Use the App

1. Open http://localhost:5173 in your browser
2. Drag & drop a PDF document (or click "Browse Files")
3. Wait 2 seconds for processing
4. View extracted data below the upload zone
5. Click "Edit" to modify any field
6. Click "Save" to persist changes to backend

## 📁 Project Structure

```
baselhacks_pax/
├── code/
│   ├── backend/
│   │   ├── main.py              # FastAPI app
│   │   ├── pyproject.toml       # Python dependencies
│   │   └── data/                # JSON storage
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   │   ├── FileUpload.jsx      # Upload & state management
│       │   │   ├── DataRow.jsx         # Editable data display
│       │   │   └── DocumentPreview.jsx # File preview cards
│       │   └── index.css
│       └── package.json
├── documentation/
└── readme.md
```

## 🔌 API Endpoints

### Backend (http://localhost:8000)

- `POST /upload` - Upload PDF, returns extracted data (mock 2s delay)
- `PUT /save/{doc_id}` - Save/update document data
- `GET /documents` - List all stored documents
- `GET /` - Health check

## 🎯 Features

✅ Drag & drop PDF upload  
✅ Mock data extraction (10 fields: age, sex, address, occupation, sports, medical conditions, smoker, height, weight, income)  
✅ Editable data rows  
✅ Persistent storage (JSON files)  
✅ Real-time frontend ↔ backend communication  

## 📝 Data Fields

Each processed document extracts:
- Age
- Sex
- Address
- Occupation
- Sports (free text)
- Medical Conditions
- Smoker status
- Height (cm)
- Weight (kg)
- Annual Income

## 🔧 Tech Stack

**Frontend**
- React 18
- Vite 5
- Native Fetch API

**Backend**
- FastAPI
- Uvicorn
- Python 3.12+

## 🚧 Future Enhancements

- Real PDF text extraction (PyPDF2, pdfplumber)
- AI/ML-based data extraction
- Document OCR for scanned PDFs
- User authentication
- Database integration (PostgreSQL)
- Export to CSV/Excel

import asyncio
import json
import time
import uuid
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="PAX Document Processing API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data storage directory
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
PDF_DIR = DATA_DIR / "pdfs"
PDF_DIR.mkdir(exist_ok=True)

class DocumentData(BaseModel):
    id: str
    filename: str
    name: str = None  # Display name for the document/case
    age: int
    sex: str
    address: str
    occupation: str
    sports: str
    medical_conditions: str
    smoker: str
    height_cm: int
    weight_kg: int
    annual_income: str
    uploaded_at: str = None
    pdf_path: str = None
    prediction: str = None  # "Accepted" or "Rejected"

class DocumentNameUpdate(BaseModel):
    name: str

@app.get("/")
def read_root():
    return {"message": "PAX Document Processing API", "status": "running"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a PDF document and extract mock data after 2 seconds.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Generate unique ID
    doc_id = str(uuid.uuid4())
    
    # Save PDF file
    pdf_path = PDF_DIR / f"{doc_id}.pdf"
    content = await file.read()
    with open(pdf_path, "wb") as f:
        f.write(content)
    
    # Simulate processing time (5 seconds)
    await asyncio.sleep(5)
    
    # Mock extracted data
    extracted_data = {
        "id": doc_id,
        "filename": file.filename,
        "name": file.filename,  # Default name is the filename
        "age": 35,
        "sex": "Male",
        "address": "123 Basel Street, 4051 Basel, Switzerland",
        "occupation": "Software Engineer",
        "sports": "Running, Swimming, Cycling",
        "medical_conditions": "None reported",
        "smoker": "No",
        "height_cm": 178,
        "weight_kg": 75,
        "annual_income": "CHF 95,000",
        "uploaded_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "pdf_path": f"pdfs/{doc_id}.pdf",
        "prediction": None  # No prediction yet
    }
    
    # Save to JSON file
    data_file = DATA_DIR / f"{doc_id}.json"
    with open(data_file, "w") as f:
        json.dump(extracted_data, f, indent=2)
    
    return extracted_data

@app.put("/save/{doc_id}")
async def save_document(doc_id: str, data: DocumentData) -> Dict[str, Any]:
    """
    Save/update document data by ID.
    """
    if data.id != doc_id:
        raise HTTPException(status_code=400, detail="Document ID mismatch")
    
    data_file = DATA_DIR / f"{doc_id}.json"
    
    # Save updated data
    with open(data_file, "w") as f:
        json.dump(data.dict(), f, indent=2)
    
    return {"status": "success", "message": f"Document {doc_id} saved", "data": data.dict()}

@app.get("/documents")
async def list_documents() -> Dict[str, Any]:
    """
    List all stored documents with summary info.
    """
    documents = []
    for file_path in DATA_DIR.glob("*.json"):
        with open(file_path) as f:
            data = json.load(f)
            # Return only summary fields
            documents.append({
                "id": data.get("id"),
                "filename": data.get("filename"),
                "name": data.get("name", data.get("filename")),  # Use name if available, fallback to filename
                "uploaded_at": data.get("uploaded_at", "Unknown"),
                "prediction": data.get("prediction")  # Include prediction status
            })
    
    # Sort by uploaded_at descending
    documents.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
    
    return {"count": len(documents), "documents": documents}

@app.get("/documents/{doc_id}")
async def get_document(doc_id: str) -> Dict[str, Any]:
    """
    Get full document data by ID.
    """
    data_file = DATA_DIR / f"{doc_id}.json"
    
    if not data_file.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    with open(data_file) as f:
        return json.load(f)

@app.get("/pdf/{doc_id}")
async def get_pdf(doc_id: str):
    """
    Retrieve the original PDF file for a document.
    """
    pdf_file = PDF_DIR / f"{doc_id}.pdf"
    
    if not pdf_file.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )

@app.patch("/documents/{doc_id}/name")
async def update_document_name(doc_id: str, update: DocumentNameUpdate) -> Dict[str, Any]:
    """
    Update the display name of a document.
    """
    data_file = DATA_DIR / f"{doc_id}.json"
    
    if not data_file.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Load existing data
    with open(data_file) as f:
        data = json.load(f)
    
    # Update name
    data["name"] = update.name
    
    # Save updated data
    with open(data_file, "w") as f:
        json.dump(data, f, indent=2)
    
    return {"status": "success", "message": f"Document name updated", "name": update.name}

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str) -> Dict[str, Any]:
    """
    Delete a document and its associated PDF file.
    """
    data_file = DATA_DIR / f"{doc_id}.json"
    pdf_file = PDF_DIR / f"{doc_id}.pdf"
    
    if not data_file.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete JSON file
    data_file.unlink()
    
    # Delete PDF file if it exists
    if pdf_file.exists():
        pdf_file.unlink()
    
    return {"status": "success", "message": f"Document {doc_id} deleted"}

@app.post("/documents/{doc_id}/analyze")
async def run_analysis(doc_id: str) -> Dict[str, Any]:
    """
    Run risk analysis on a document and update prediction.
    Simulates AI analysis with 3 second delay.
    """
    data_file = DATA_DIR / f"{doc_id}.json"
    
    if not data_file.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Load existing data
    with open(data_file) as f:
        data = json.load(f)
    
    # Simulate analysis time
    await asyncio.sleep(3)
    
    # Mock prediction based on simple rules
    import random
    
    # Weighted random: 70% Accepted, 30% Rejected
    prediction = "Accepted" if random.random() < 0.7 else "Rejected"
    
    # Update prediction
    data["prediction"] = prediction
    
    # Save updated data
    with open(data_file, "w") as f:
        json.dump(data, f, indent=2)
    
    return {
        "status": "success",
        "message": "Analysis complete",
        "prediction": prediction,
        "data": data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import asyncio
import base64
import json
import os
import time
import uuid
from pathlib import Path
from typing import Dict, Any, Optional

from openai import AsyncOpenAI
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
import io
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# Load environment variables
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = AsyncOpenAI(api_key=OPENAI_API_KEY)

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

async def process_pdf_with_workflow(pdf_content: bytes) -> Dict[str, Any]:
    """
    Process PDF through OpenAI agent-based extraction workflow.
    Uses vision API to read the PDF, then extraction agent to parse data.
    If OpenAI key is not configured, returns mock data.
    """
    if not OPENAI_API_KEY:
        print("OPENAI_API_KEY not configured - returning mock data")
        # Return mock data following the structure used by the workflow agent
        import random
        
        mock_data = {
            "gender": random.choice(["m", "f"]),
            "age": random.randint(25, 65),
            "birthdate": f"{random.randint(1960, 2000)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            "marital_status": random.choice(["single", "married", "divorced", "widowed"]),
            "height_cm": random.randint(150, 200),
            "weight_kg": random.randint(50, 120),
            "bmi": round(random.uniform(18.5, 32.0), 1),
            "smoking": random.choice([True, False]),
            "packs_per_week": random.randint(0, 5) if random.random() > 0.5 else None,
            "drug_use": random.choice([True, False]),
            "drug_frequency": random.randint(0, 3) if random.random() > 0.7 else None,
            "drug_type": random.choice(["safe", "warning", "danger", "unknown"]) if random.random() > 0.5 else None,
            "staying_abroad": random.choice([True, False]),
            "abroad_type": random.choice(["safe", "warning", "danger", "unknown"]) if random.random() > 0.5 else None,
            "dangerous_sports": random.choice([True, False]),
            "sport_type": random.choice(["safe", "warning", "danger", "unknown"]) if random.random() > 0.5 else None,
            "medical_issue": random.choice([True, False]),
            "medical_type": random.choice(["safe", "warning", "danger", "unknown"]) if random.random() > 0.5 else None,
            "doctor_visits": random.choice([True, False]),
            "visit_type": random.choice(["physician", "specialist", "hospital"]) if random.random() > 0.5 else None,
            "regular_medication": random.choice([True, False]),
            "medication_type": random.choice(["safe", "warning", "danger", "unknown"]) if random.random() > 0.5 else None,
            "sports_activity_h_per_week": random.randint(0, 20),
            "earning_chf": random.randint(40000, 150000),
        }
        
        return mock_data
    
    try:
        # Import the agent workflow
        from workflow_agent import extract_from_pdf_bytes
        
        print(f"Starting agent-based extraction (PDF size: {len(pdf_content)} bytes)")
        
        # Run the agent workflow with raw PDF bytes
        result = await extract_from_pdf_bytes(client, pdf_content)
        
        print(f"Agent extraction complete")
        print(f"Full result: {json.dumps(result, indent=2)}")
        
        return result
        
    except Exception as e:
        print(f"Agent workflow error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent workflow error: {str(e)}")

class DocumentData(BaseModel):
    id: str
    filename: str
    name: Optional[str] = None  # Display name for the document/case
    gender: Optional[str] = None  # "m", "f", "other"
    age: Optional[int] = None
    birthdate: Optional[str] = None  # "YYYY-MM-DD" format
    marital_status: Optional[str] = None  # "single", "married", "divorced", "widowed"
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    smoking: Optional[bool] = None
    packs_per_week: Optional[float] = None
    drug_use: Optional[bool] = None
    drug_frequency: Optional[float] = None
    drug_type: Optional[str] = None  # "safe", "warning", "danger", "unknown"
    staying_abroad: Optional[bool] = None
    abroad_type: Optional[str] = None  # "safe", "warning", "danger", "unknown"
    dangerous_sports: Optional[bool] = None
    sport_type: Optional[str] = None  # "safe", "warning", "danger", "unknown"
    medical_issue: Optional[bool] = None
    medical_type: Optional[str] = None  # "safe", "warning", "danger", "unknown"
    doctor_visits: Optional[bool] = None
    visit_type: Optional[str] = None  # "physician", "specialist", "hospital"
    regular_medication: Optional[bool] = None
    medication_type: Optional[str] = None  # "safe", "warning", "danger", "unknown"
    sports_activity_h_per_week: Optional[float] = None
    earning_chf: Optional[int] = None
    uploaded_at: Optional[str] = None
    pdf_path: Optional[str] = None
    model_prediction: Optional[str] = None  # "Accepted" or "Rejected" - AI model prediction
    human_prediction: Optional[str] = None  # "Accepted" or "Rejected" - Human override

class DocumentNameUpdate(BaseModel):
    name: str

class HumanPredictionUpdate(BaseModel):
    human_prediction: Optional[str] = None  # "Accepted", "Rejected", or None to clear

@app.get("/")
def read_root():
    return {"message": "PAX Document Processing API", "status": "running"}

async def convert_images_to_pdf(image_files: List[bytes]) -> bytes:
    """
    Convert one or more images to a single PDF document.
    Requires PIL/Pillow to be installed.
    """
    if not HAS_PIL:
        raise HTTPException(
            status_code=500, 
            detail="Image processing not available. Install Pillow: pip install Pillow"
        )
    
    try:
        images = []
        for img_bytes in image_files:
            img = Image.open(io.BytesIO(img_bytes))
            # Convert to RGB if necessary (for PNG with transparency, etc.)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            images.append(img)
        
        # Save all images as a single PDF
        pdf_buffer = io.BytesIO()
        if len(images) == 1:
            images[0].save(pdf_buffer, format='PDF')
        else:
            images[0].save(pdf_buffer, format='PDF', save_all=True, append_images=images[1:])
        
        return pdf_buffer.getvalue()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert images to PDF: {str(e)}")

@app.post("/upload")
async def upload_document(files: List[UploadFile] = File(...)) -> Dict[str, Any]:
    """
    Upload one or more files (PDF or images) and extract data using OpenAI workflow.
    Images will be converted to PDF before processing.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided")
    
    if len(files) > 2:
        raise HTTPException(status_code=400, detail="Maximum 2 files allowed")
    
    # Validate file types
    pdf_files = []
    image_files = []
    filenames = []
    
    for file in files:
        filename_lower = file.filename.lower()
        filenames.append(file.filename)
        
        if filename_lower.endswith('.pdf'):
            pdf_files.append(await file.read())
        elif filename_lower.endswith(('.jpg', '.jpeg', '.png')):
            image_files.append(await file.read())
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type: {file.filename}. Only PDF, JPG, and PNG are accepted"
            )
    
    # Generate unique ID
    doc_id = str(uuid.uuid4())
    
    try:
        # Determine the content to process
        if pdf_files and not image_files:
            # Only PDF(s) - use the first one
            content = pdf_files[0]
            main_filename = filenames[0]
        elif image_files and not pdf_files:
            # Only image(s) - convert to PDF
            content = await convert_images_to_pdf(image_files)
            main_filename = " + ".join(filenames)
        else:
            # Mix of PDF and images - convert images to PDF and use first PDF
            content = pdf_files[0]
            main_filename = filenames[0]
        
        # Save PDF file
        pdf_path = PDF_DIR / f"{doc_id}.pdf"
        with open(pdf_path, "wb") as f:
            f.write(content)
        
        # Process PDF through OpenAI workflow
        workflow_result = await process_pdf_with_workflow(content)
        
        # Build extracted data from workflow result
        extracted_data = {
            "id": doc_id,
            "filename": main_filename,
            "name": main_filename,  # Default name is the filename
            "uploaded_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "pdf_path": f"pdfs/{doc_id}.pdf",
            "model_prediction": None,  # No AI prediction yet
            "human_prediction": None   # No human override yet
        }
        
        # Merge workflow result with extracted data (all fields optional)
        if isinstance(workflow_result, dict):
            # Add all fields from workflow, keeping them optional
            for key in ['gender', 'age', 'birthdate', 'marital_status', 'height_cm', 'weight_kg', 
                       'bmi', 'smoking', 'packs_per_week', 'drug_use', 'drug_frequency', 'drug_type',
                       'staying_abroad', 'abroad_type', 'dangerous_sports', 'sport_type', 
                       'medical_issue', 'medical_type', 'doctor_visits', 'visit_type', 
                       'regular_medication', 'medication_type', 'sports_activity_h_per_week', 'earning_chf']:
                extracted_data[key] = workflow_result.get(key)
        
        # Save to JSON file
        data_file = DATA_DIR / f"{doc_id}.json"
        with open(data_file, "w") as f:
            json.dump(extracted_data, f, indent=2)
        
        return extracted_data
        
    except HTTPException:
        # Clean up PDF file on error
        pdf_path = PDF_DIR / f"{doc_id}.pdf"
        if pdf_path.exists():
            pdf_path.unlink()
        raise
    except Exception as e:
        # Clean up PDF file on error
        pdf_path = PDF_DIR / f"{doc_id}.pdf"
        if pdf_path.exists():
            pdf_path.unlink()
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.put("/save/{doc_id}")
async def save_document(doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save/update document data by ID.
    Accept raw dictionary to avoid Pydantic validation issues.
    """
    if data.get("id") != doc_id:
        raise HTTPException(status_code=400, detail="Document ID mismatch")
    
    data_file = DATA_DIR / f"{doc_id}.json"
    
    if not data_file.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Save updated data
    with open(data_file, "w") as f:
        json.dump(data, f, indent=2)
    
    return {"status": "success", "message": f"Document {doc_id} saved", "data": data}

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
                "model_prediction": data.get("model_prediction"),  # AI prediction
                "human_prediction": data.get("human_prediction"),  # Human override
                # For backward compatibility, also send 'prediction' as human_prediction if exists, else model_prediction
                "prediction": data.get("human_prediction") or data.get("model_prediction")
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
    await asyncio.sleep(5)
    
    # Mock prediction based on simple rules
    import random

    # Weighted random: 50% Accepted, 50% Rejected
    model_prediction = "Accepted" if random.random() < 0.5 else "Rejected"
    
    # Update model prediction (don't touch human_prediction)
    data["model_prediction"] = model_prediction
    
    # Save updated data
    with open(data_file, "w") as f:
        json.dump(data, f, indent=2)
    
    return {
        "status": "success",
        "message": "Analysis complete",
        "model_prediction": model_prediction,
        "data": data
    }

@app.patch("/documents/{doc_id}/human-prediction")
async def update_human_prediction(doc_id: str, update: HumanPredictionUpdate) -> Dict[str, Any]:
    """
    Update the human prediction/override for a document.
    Allows humans to accept or reject regardless of AI prediction.
    Set to null to clear the human override.
    """
    data_file = DATA_DIR / f"{doc_id}.json"
    
    if not data_file.exists():
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Validate prediction value (allow null to clear)
    if update.human_prediction is not None and update.human_prediction not in ["Accepted", "Rejected"]:
        raise HTTPException(status_code=400, detail="human_prediction must be 'Accepted', 'Rejected', or null")
    
    # Load existing data
    with open(data_file) as f:
        data = json.load(f)
    
    # Update human prediction
    data["human_prediction"] = update.human_prediction
    
    # Save updated data
    with open(data_file, "w") as f:
        json.dump(data, f, indent=2)
    
    message = f"Human prediction updated to {update.human_prediction}" if update.human_prediction else "Human override cleared"
    
    return {
        "status": "success",
        "message": message,
        "human_prediction": update.human_prediction,
        "data": data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

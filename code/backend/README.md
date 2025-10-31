# PAX Backend

FastAPI backend for document processing and data extraction.

## Setup

```bash
cd code/backend
pip install -e .
```

## Run

```bash
python main.py
```

or

```bash
uv run uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**

## API Endpoints

- `GET /` - Health check
- `POST /upload` - Upload PDF and extract data (mock 2s delay)
- `PUT /save/{doc_id}` - Save/update document data
- `GET /documents` - List all stored documents (summary: id, filename, uploaded_at)
- `GET /documents/{doc_id}` - Get full document data by ID
- `GET /pdf/{doc_id}` - Retrieve original PDF file

## Data Storage

- **JSON metadata**: `data/{doc_id}.json` - Extracted data (10 fields)
- **PDF files**: `data/pdfs/{doc_id}.pdf` - Original uploaded documents

## Extracted Fields

Each document extracts 10 fields:
- `id` - Unique document identifier
- `filename` - Original PDF filename
- `age` - Age (integer)
- `sex` - Sex (Male/Female/Other)
- `address` - Full address
- `occupation` - Job title
- `sports` - Sports activities (free text)
- `medical_conditions` - Medical history
- `smoker` - Yes/No
- `height_cm` - Height in centimeters
- `weight_kg` - Weight in kilograms
- `annual_income` - Annual income with currency
- `uploaded_at` - Upload timestamp
- `pdf_path` - Relative path to PDF file

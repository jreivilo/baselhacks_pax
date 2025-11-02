# PAX Backend

FastAPI backend for insurance form data extraction using OpenAI and XGBoost risk modeling.

## Setup

1. Install uv: https://docs.astral.sh/uv/getting-started/installation/

2. Create `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

3. Install dependencies:
```bash
cd code/backend
uv sync
```

## Run

```bash
uv run uvicorn main:app --reload
```

API at http://localhost:8000

## Main Features

- OpenAI Vision API extracts structured data from PDF insurance forms
- XGBoost model predicts risk categories (Safe/Warning/Danger)
- SHAP values explain model predictions with dependency plots

## API Endpoints

- POST /upload - Upload PDF and get predictions
- GET /documents - List all documents
- GET /documents/{doc_id} - Get document details
- GET /pdf/{doc_id} - Download PDF

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

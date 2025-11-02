# PAX Frontend

React UI for insurance form processing and risk analysis.

## Setup

1. Install dependencies:
```bash
cd code/frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

Open http://localhost:5173

## Main Features

**Document Upload**
- Drag & drop insurance form PDFs or click to browse
- Multiple file support with preview thumbnails

**Data Extraction**
- Automatic form data extraction via OpenAI Vision API
- Parsed applicant info (name, age, health history, lifestyle factors)
- Structured JSON output with all insurance-relevant fields

**Risk Analysis**
- XGBoost model predicts risk category: Safe, Warning, or Danger
- SHAP explainability shows which factors drove the prediction
- Interactive dependency plots visualize feature relationships

**Document Management**
- View all uploaded documents with extraction status
- Review extracted data before saving
- Edit and save document information
- Download original PDFs
- Search and filter documents

## Build

```bash
npm run build
```

Output in `dist/` directory

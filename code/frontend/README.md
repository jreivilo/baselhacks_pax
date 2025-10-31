# BaselHacks PAX — Document Upload

Simple drag & drop document upload interface for the BaselHacks "Automate Underwriting" challenge.

## 🚀 How to Run

```bash
cd code/frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🎯 Features

- **Drag & Drop Upload**: Drag files directly onto the upload zone
- **File Browser**: Click to browse and select files
- **Document Preview**: View uploaded documents with thumbnails (images) or icons
- **No Backend**: Pure frontend (backend integration to be added later)

## 📁 Component Architecture

```
App.jsx
└── FileUpload.jsx         # Upload zone + file state management
    └── DocumentPreview.jsx  # Individual document cards with preview
```

## 🎨 Styling

PAX colors (from pax.ch):
- Primary: `#005f73` (teal)
- Accent: `#ffd166` (warm yellow)

## � Current Scope

✅ Drag & drop file upload  
✅ Document preview grid  
✅ Remove uploaded files  
⏳ Backend integration (to be implemented)  
⏳ Information extraction (to be implemented)  
⏳ Review interface (to be implemented)

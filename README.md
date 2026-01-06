# Procurement System - Frontend

Static frontend untuk GitHub Pages yang terhubung ke Google Apps Script API.

## Struktur File

```
frontend/
├── index.html          # Dashboard - daftar project
├── create.html         # Form buat project baru
├── detail.html         # Detail project + items
├── css/
│   └── style.css       # Semua styling
└── js/
    ├── config.js       # Konfigurasi API URL
    ├── api.js          # Fetch wrapper
    ├── utils.js        # Helper functions
    ├── dashboard.js    # Logic untuk index.html
    ├── create.js       # Logic untuk create.html
    └── detail.js       # Logic untuk detail.html
```

## Setup

### 1. Deploy Backend (Google Apps Script)

Pastikan backend sudah di-deploy sebagai Web App:
- Deploy → New deployment → Web app
- Execute as: Me
- Who has access: Anyone
- Copy URL deployment

### 2. Konfigurasi Frontend

Edit `js/config.js`:

```javascript
var CONFIG = {
  API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

Ganti `YOUR_DEPLOYMENT_ID` dengan ID dari URL deployment.

### 3. Deploy ke GitHub Pages

1. Buat repository baru di GitHub
2. Upload semua file frontend
3. Settings → Pages → Source: main branch
4. Akses via `https://username.github.io/repo-name/`

## API Endpoints

### GET Requests

| Action | Parameters | Description |
|--------|------------|-------------|
| `getProjects` | - | Daftar semua project |
| `getProjectDetail` | `projectId` | Detail satu project |

### POST Requests

| Action | Data | Description |
|--------|------|-------------|
| `createProject` | `{namaProject, unit}` | Buat project baru |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Frontend adalah static HTML/CSS/JS
- Tidak memerlukan build tools
- Tidak memerlukan server
- Semua komunikasi via fetch() ke GAS API
- CORS handled by Google Apps Script

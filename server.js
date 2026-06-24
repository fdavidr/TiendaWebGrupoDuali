const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 10000;
const ROOT_DIR = __dirname;
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');

const ALLOWED_FOLDERS = new Set(['products', 'pdfs']);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeName(name) {
  return String(name || 'file')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

ensureDir(UPLOADS_DIR);
ensureDir(path.join(UPLOADS_DIR, 'products'));
ensureDir(path.join(UPLOADS_DIR, 'pdfs'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = ALLOWED_FOLDERS.has(req.body.folder) ? req.body.folder : 'products';
    const target = path.join(UPLOADS_DIR, folder);
    ensureDir(target);
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = sanitizeName(path.basename(file.originalname || 'file', ext));
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || 'file'}-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const folder = req.body.folder;
    const mimetype = String(file.mimetype || '').toLowerCase();
    if (folder === 'pdfs') {
      if (mimetype === 'application/pdf') return cb(null, true);
      return cb(new Error('Solo se permiten archivos PDF para catálogos'));
    }
    if (mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Solo se permiten imágenes para productos'));
  }
});

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Archivo requerido' });
  }

  const relFromUploads = path.relative(UPLOADS_DIR, req.file.path).replace(/\\/g, '/');
  const publicUrl = `/uploads/${relFromUploads}`;

  return res.json({
    ok: true,
    url: publicUrl,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

// ── Config cache: admin writes this on every branding save ──────────────────
const CONFIG_CACHE_PATH = path.join(ROOT_DIR, 'config.json');
const ALLOWED_CONFIG_KEYS = new Set([
  'themeColors', 'companyName', 'slogan',
  'whatsappUrl', 'socialLinks', 'sectionVisibility'
]);

app.post('/api/config', (req, res) => {
  try {
    const body = req.body || {};
    const safe = {};
    for (const key of ALLOWED_CONFIG_KEYS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) safe[key] = body[key];
    }
    fs.writeFileSync(CONFIG_CACHE_PATH, JSON.stringify(safe), 'utf8');
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo guardar la configuración' });
  }
});

app.use(express.static(ROOT_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    if (filePath.endsWith('config.json')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.use((err, _req, res, _next) => {
  const message = err && err.message ? err.message : 'Error interno del servidor';
  const isMulter = err && (err.name === 'MulterError' || message.includes('Solo se permiten'));
  const status = isMulter ? 400 : 500;
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor activo en puerto ${PORT}`);
});

// ══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DE FIREBASE PARA CIAM
// ══════════════════════════════════════════════════════════════
//
//  REGLAS DE FIRESTORE (Firestore → Reglas → Publicar):
//
//  ⚠️ IMPORTANTE: El logo, el catálogo y las imágenes se guardan en la colección
//  "assets" (con subcolección "chunks"). Si NO incluyes la regla de "assets",
//  al subir el logo aparecerá el error "Missing or insufficient permissions".
//
//  rules_version = '2';
//  service cloud.firestore {
//    match /databases/{database}/documents {
//      // Productos: lectura pública, escritura solo autenticado
//      match /products/{doc} {
//        allow read: if true;
//        allow write: if request.auth != null;
//      }
//      // Config (PDFs, admin): lectura pública, escritura solo autenticado
//      match /config/{doc} {
//        allow read: if true;
//        allow write: if request.auth != null;
//      }
//      // Assets (logo, imágenes, PDFs en chunks): lectura pública, escritura autenticada
//      match /assets/{assetId} {
//        allow read: if true;
//        allow write: if request.auth != null;
//        match /chunks/{chunkId} {
//          allow read: if true;
//          allow write: if request.auth != null;
//        }
//      }
//    }
//  }
//
//  NOTA: Activa también "Email/Contraseña" en Firebase Console:
//        Authentication → Sign-in method → Email/contraseña → Habilitar
// ══════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBPX6Uja1H5Xky4Lh7kCwDVXEc_QqP8beg",
  authDomain:        "grupoduali0001.firebaseapp.com",
  projectId:         "grupoduali0001",
  storageBucket:     "grupoduali0001.firebasestorage.app",
  messagingSenderId: "719537998644",
  appId:             "1:719537998644:web:4836a6f19de5bce56af361",
};

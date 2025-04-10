/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FRONTEND_URL: string;
  // Ajoutez d'autres variables d'environnement selon vos besoins
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 
/**
 * ==============================================================================
 * LifeHub - Backend API Configuration & Connection Hub
 * ==============================================================================
 *
 * This file controls the backend connection for the entire LifeHub frontend.
 * You can connect LifeHub to ANY backend server (Node.js/Express, Python/FastAPI/Django,
 * Go, Java/Spring, Ruby on Rails, PHP/Laravel, or serverless functions).
 *
 * HOW TO CONFIGURE YOUR BACKEND URL:
 * ------------------------------------------------------------------------------
 * METHOD 1 (Environment Variable - Recommended for Deployments):
 *   Create or edit `.env` in the root folder and set:
 *   VITE_API_URL=https://your-api-domain.com
 *   (e.g., VITE_API_URL=http://localhost:5000 or https://api.lifehub.yourdomain.com)
 *
 * METHOD 2 (Directly In This File):
 *   Change the `HARDCODED_BACKEND_URL` constant below from "" to your backend URL:
 *   const HARDCODED_BACKEND_URL = "https://your-custom-backend.com";
 *
 * METHOD 3 (Directly In The Web Page / Browser UI):
 *   You can allot any backend URL right in the UI using the "Backend Connection"
 *   settings. It gets saved to browser localStorage ('lifehub_backend_api_url')
 *   so you can switch between dev, staging, and production instantly without rebuilding!
 *
 * BACKEND REQUIREMENTS & CORS:
 * ------------------------------------------------------------------------------
 * When connecting an external backend URL on a different domain or port:
 * 1. Ensure your backend returns CORS headers:
 *    - Access-Control-Allow-Origin: * (or your frontend origin)
 *    - Access-Control-Allow-Headers: Content-Type, Authorization
 *    - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
 * 2. All authenticated requests send:
 *    - Authorization: Bearer <session_token>
 * 3. Health check route:
 *    - GET /api/health -> returns { status: "ok" }
 * ==============================================================================
 */

/**
 * Custom hardcoded backend URL.
 * Leave as empty string "" to use the default integrated backend or relative proxy.
 * Example: "https://api.mycompany.com" or "http://localhost:5000"
 */
export const HARDCODED_BACKEND_URL = '';

/**
 * Storage key used to persist user-allotted custom backend URLs in the browser.
 */
export const STORAGE_BACKEND_URL_KEY = 'lifehub_backend_api_url';

/**
 * Returns the currently active backend base URL.
 * Precedence order:
 *  1. User-allotted URL in browser localStorage (if set)
 *  2. Environment variable VITE_API_URL (if provided)
 *  3. Hardcoded URL defined in this file (if provided)
 *  4. Empty string "" (uses relative `/api` paths with the local integrated server)
 */
export function getActiveBackendUrl(): string {
  // 1. Check browser page allotment override
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_BACKEND_URL_KEY);
      if (stored && stored.trim()) {
        return cleanUrl(stored.trim());
      }
    }
  } catch {
    // Ignore localStorage access errors (e.g. strict sandboxing)
  }

  // 2. Check Vite environment variable
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) {
    return cleanUrl(envUrl);
  }

  // 3. Check hardcoded configuration
  if (HARDCODED_BACKEND_URL.trim()) {
    return cleanUrl(HARDCODED_BACKEND_URL.trim());
  }

  // 4. Default: empty string (relative origin)
  return '';
}

/**
 * Allot and persist a custom backend URL directly from the page.
 * Pass null or empty string to reset back to the default backend.
 */
export function allotBackendUrl(url: string | null): void {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(STORAGE_BACKEND_URL_KEY);
    } else {
      localStorage.setItem(STORAGE_BACKEND_URL_KEY, cleanUrl(url.trim()));
    }
  } catch (err) {
    console.error('Failed to save backend URL to localStorage:', err);
  }
}

/**
 * Normalizes URLs by removing trailing slashes.
 */
function cleanUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Resolves a given API endpoint path against the active backend URL.
 * Examples:
 *   resolveApiUrl('/api/health')
 *     -> '/api/health' (if active URL is empty)
 *     -> 'https://api.example.com/api/health' (if active URL is 'https://api.example.com')
 */
export function resolveApiUrl(path: string): string {
  const baseUrl = getActiveBackendUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl}${normalizedPath}`;
}

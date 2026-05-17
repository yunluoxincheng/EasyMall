# EasyMall Frontend

EasyMall frontend now runs on Next.js App Router with React, TypeScript, and Tailwind CSS. The app keeps the original storefront and admin route surface while replacing the old Vue/Vite runtime.

## Development

```bash
npm install
npm run dev
```

The local development server runs on `http://localhost:5173`.

By default the app calls `/api/*` and relies on a local Next.js rewrite proxy to forward requests to the backend. Override the backend target with environment variables when needed.

## Environment

Copy `.env.example` and adjust values for your environment.

```bash
NEXT_PUBLIC_API_BASE_URL=
EASYMALL_BACKEND_ORIGIN=http://127.0.0.1:8080
EASYMALL_ENABLE_DEV_PROXY=true
```

- `NEXT_PUBLIC_API_BASE_URL`: optional explicit backend base URL for browser requests. Leave empty to use relative `/api` requests.
- `EASYMALL_BACKEND_ORIGIN`: backend origin used by local Next.js rewrites.
- `EASYMALL_ENABLE_DEV_PROXY`: whether `next dev` should rewrite `/api/*` to the backend origin.

## Verification

```bash
npm run typecheck
npm run build
```

## Notes

- Storefront and admin share one user session.
- `/admin/login` redirects to the unified `/login` flow.
- Mock payment remains executable in local development. Real payment providers render as availability-based options until backend initiation support is added.

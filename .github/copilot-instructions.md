# Copilot instructions for ITSupportFrontend

Quick, actionable guidance for an AI coding agent working in this repository.
Keep answers short and make edits as small, safe, and reversible patches.

## Big picture
- This is a React single-page app (Create React App style) using Tailwind CSS.
- Frontend communicates with a separate backend API. Frontend API base is configured in `src/utils/api/config.js` via `REACT_APP_API_URL` (default `http://localhost:5000/api`).
- Some parts of the app currently use a hard-coded backend host `http://10.1.1.57:3001` (see `src/pages/TicketDetailsPage.js` and `src/services/attachmentService.js`). Prefer replacing those with `API_BASE_URL`.
- Key UI areas: `src/pages/*` for pages, `src/components/*` for reusable components, `src/services/*` for client-side services (toasts, attachments), and `src/utils/*` for helpers.

## Developer workflows & commands
- Install: `npm install`
- Dev server: `npm start` (README indicates default port 3001 for this project)
- Build: `npm run build` → output lives in `build/`
- No automated tests present in the repo; `src/setupTests.js` exists but no tests by default.

## Important files to inspect when editing behavior
- `src/utils/api/config.js` — API_BASE_URL, API_ENDPOINTS and `apiCall` helper (adds Authorization header and strips `Content-Type` for FormData). Use `apiCall(endpoint, options)` for authenticated requests.
- `src/services/attachmentService.js` — attachment download/view helper; uses `http://10.1.1.57:3001/api` as base. Update to use `API_BASE_URL` when modifying.
- `src/pages/TicketDetailsPage.js` — ticket UI and attachment listing logic (attachment URL normalization, download UI). This file contains robust filtering/deduplication for attachments and some hard-coded host logic.
- `src/components/*` — smaller UI building blocks (button/card/input) and `AttachmentDemo.js` (example usage).
- `src/services/toastService.js` — project toast helper used across components.

## Patterns & conventions to follow
- Use `apiCall` from `src/utils/api/config.js` whenever you want consistent auth handling and JSON parsing. It logs requests/responses to console which aids debugging.
- If sending FormData, pass the FormData instance as `body` to `apiCall`; the helper will remove `Content-Type` so the browser sets the correct multipart boundary.
- Auth token lives in `localStorage.authToken`. Frontend attaches it as `Authorization: Bearer <token>` in `apiCall`.
- UI uses Tailwind utility classes—prefer small class patches rather than wholesale refactors.
- When adding or changing an API endpoint, update `API_ENDPOINTS` in `src/utils/api/config.js` and prefer referencing that constant.

## Attachment-specific notes (common task)
- Frontend endpoints observed:
  - download: `/api/tickets/attachments/:attachmentId/download` (used by `attachmentService.downloadAttachment`)
  - view: `/api/attachments/:attachmentId/view` (frontend code previously used a view flow)
- Files and logic to update when changing attachment behavior: `src/services/attachmentService.js`, `src/pages/TicketDetailsPage.js`, and `src/utils/api/config.js`.
- The Ticket details page constructs absolute URLs for string attachments by prefixing `http://10.1.1.57:3001` — change to `${API_BASE_URL.replace(/\/api$/,'')}` or similar if unifying host handling.
- Example frontend download usage:
  - `await attachmentService.downloadAttachment(attachmentId, filename)`
  - Or call `GET ${API_BASE_URL}/attachments/:id/download` with `Authorization` header.

## Backend integration advice (what frontend expects)
- Frontend expects streaming or signed-download URLs. Recommended backend route:
  - `GET /api/attachments/:attachmentId/download` — returns file stream with `Content-Disposition: attachment; filename="..."`.
- Auth: frontend sends JWT in `Authorization` header. Backend middleware should accept `Authorization: Bearer <token>` and/or a temporary `token` query param for new window redirects.

## Debugging tips
- Use browser console logs from `apiCall` — it prints request method, URL, response status and parsed JSON body.
- Search for `10.1.1.57` to find hard-coded backend host usage and replace with `API_BASE_URL` for portability.
- If downloads fail, check `attachmentService.downloadAttachment` and the backend route headers (`Content-Type` / `Content-Disposition`).

## Examples (safe, minimal edits)
- Replace hard-coded base URL in `attachmentService`:
  - From: `baseUrl = 'http://10.1.1.57:3001/api'`
  - To: `baseUrl = process.env.REACT_APP_API_URL || API_BASE_URL` (import `API_BASE_URL` from `src/utils/api/config.js`)

- Add new endpoint constant in `src/utils/api/config.js`:
  - `ATTACHMENTS_DOWNLOAD: '/attachments'` and use `${API_BASE_URL}${API_ENDPOINTS.ATTACHMENTS_DOWNLOAD}/${id}/download`.

## When you are unsure
- Prefer small, testable changes. Run the dev server (`npm start`) and verify UI behavior in browser.
- If making a cross-cutting change (API URL, auth), run a quick grep for the symbol across `src/**`.

If anything above is unclear or you want more examples (e.g., a ready-to-paste Express route for `/attachments/:id/download` tuned to this project), say so and I will add it.
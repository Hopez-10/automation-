hey i did try webscrappin first but its anti bot systems are catching it i didnt know the specific website you gonna search for so this code solves that problem by going to the webpage that you guys gonna use and then wait for it to load and then screenshot it then send it to qwen to read the image 

Briefly turns a public webpage into a short, readable summary. The React + Vite
frontend sends a URL to a FastAPI backend, which renders the page in a
headless Playwright browser, captures a screenshot, and sends it to a
vision-capable Groq model for a 3–5 sentence summary.

## Requirements

- Node.js 18 or newer and npm
- Python 3.10 or newer
- A Groq API key

## Run locally

1. Configure the backend:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   playwright install chromium
   Copy-Item .env.example .env
   ```

2. Edit `backend/.env` and set `GROQ_API_KEY` to your key. Optionally set
   `GROQ_MODEL` and `FRONTEND_ORIGINS` (comma-separated allowed frontend origins).

3. Start the API from the `backend` directory:

   ```powershell
   uvicorn app.main:app --reload
   ```

   Health check: <http://localhost:8000/api/health>

4. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the URL printed by Vite (normally <http://localhost:5173>). Vite proxies
   `/api` requests to the local FastAPI server. Set `VITE_BACKEND_URL` if your
   local backend listens on a different address.

## API

`POST /api/summarize`

```json
{ "url": "https://example.com/article" }
```

Successful response:

```json
{
  "url": "https://example.com/article",
  "summary": "A short summary of the webpage."
}
```

The endpoint accepts public HTTP(S) pages, waits three seconds after the page
loads, then sends a screenshot to Groq. Pages up to 8,000 pixels tall are
captured in full; taller pages are captured at the top. The configured model
must support image input. Only public hosts are allowed, including for
browser-loaded page resources.

## Deploy to the web

Deploy the frontend and backend as separate web services:

1. **Backend:** Deploy the `backend` directory to a Python web host (for example,
   Render). Install `requirements.txt`, use
   `   `pip install -r requirements.txt && playwright install chromium` as the
   build command and `uvicorn app.main:app --host 0.0.0.0 --port $PORT` as the
   start command. Set `GROQ_API_KEY`, `GROQ_MODEL` (default:
   `qwen/qwen3.8-27b`), and `FRONTEND_ORIGINS` to the deployed frontend's exact
   origin. Browser installation increases deployment size and startup resource
   needs.
2. **Frontend:** Deploy the `frontend` directory to a static host (for example,
   Vercel). Set `VITE_API_URL` to the deployed backend origin, without a trailing
   slash, then build with `npm run build` and publish `dist`.

Keep the Groq key only in the backend host's environment variables. Never put it
in frontend code or a `VITE_` variable. Some sites still block automated
browsers, and image summaries cover only what is visible in the captured
screenshot.

import { useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "";

function App() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSummary("");
    setSourceUrl("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const responseText = await response.text();
      let data;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          `The server returned an invalid response (HTTP ${response.status}). Check that the backend is running and the API URL is correct.`,
        );
      }

      if (!response.ok) {
        throw new Error(data?.detail || `The request failed (HTTP ${response.status}).`);
      }
      if (typeof data?.summary !== "string" || !data.summary.trim()) {
        throw new Error("The server response did not include a summary.");
      }
      setSummary(data.summary);
      setSourceUrl(data.url);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Could not reach the summarizer. Check your connection and try again."
          : requestError.message,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <h1>Hey! You can use any URL.</h1>
        <p className="intro">
          I’ll screenshot the webpage and send it to Qwen to summarize.
        </p>

        <form className="url-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="page-url">Webpage URL</label>
          <div className="input-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.6 13.4a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1m-.1 5.2a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
            </svg>
            <input
              id="page-url"
              type="url"
              placeholder="Paste a webpage link..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
              disabled={loading}
            />
            {url && (
              <button
                className="clear-button"
                type="button"
                aria-label="Clear URL"
                onClick={() => setUrl("")}
                disabled={loading}
              >×</button>
            )}
          </div>
          <button className="submit-button" type="submit" disabled={loading || !url.trim()}>
            {loading ? (
              <><span className="spinner" /> Summarizing</>
            ) : (
              <>Summarize <span aria-hidden="true">↗</span></>
            )}
          </button>
        </form>
        {error && (
          <div className="error-card" role="alert">
            <span aria-hidden="true">!</span> {error}
          </div>
        )}

        {summary && (
          <article className="summary-card" aria-live="polite">
            <div className="summary-header">
              <div>
                <h2>Summary</h2>
              </div>
              <span className="sparkle" aria-hidden="true">✳</span>
            </div>
            <p className="summary-text">{summary}</p>
            <a className="source-link" href={sourceUrl} target="_blank" rel="noreferrer">
              <span>Source</span>
              <span className="source-url">{sourceUrl}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        )}
      </section>

    </main>
  );
}

export default App;

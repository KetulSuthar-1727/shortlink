export default function UrlForm({ longUrl, loading, error, canSubmit, onChange, onSubmit }) {
  return (
    <form className="url-form" onSubmit={onSubmit}>
      <label className="input-label" htmlFor="longUrl">
        Paste your long URL here...
      </label>
      <div className="input-wrap">
        <input
          id="longUrl"
          name="longUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck="false"
          placeholder="https://example.com/your/very/long/link"
          value={longUrl}
          onChange={(event) => onChange(event.target.value)}
          className={error ? 'input input-error' : 'input'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'url-form-error' : undefined}
        />
      </div>

      {error ? (
        <p className="form-error" id="url-form-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="form-hint">We only accept complete URLs that begin with http:// or https://.</p>
      )}

      <button className="primary-button" type="submit" disabled={!canSubmit}>
        {loading ? 'Shortening...' : 'Shorten URL'}
      </button>
    </form>
  );
}

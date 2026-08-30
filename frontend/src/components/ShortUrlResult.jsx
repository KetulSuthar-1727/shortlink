import { useEffect, useState } from 'react';

async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!successful) {
    throw new Error('Copy failed');
  }
}

export default function ShortUrlResult({ shortLink, onReset }) {
  const [copyLabel, setCopyLabel] = useState('Copy');
  const hasResult = Boolean(shortLink);

  useEffect(() => {
    setCopyLabel('Copy');
  }, [shortLink]);

  async function handleCopy() {
    if (!shortLink) {
      return;
    }

    try {
      await copyToClipboard(shortLink.shortUrl);
      setCopyLabel('Copied!');
      window.setTimeout(() => setCopyLabel('Copy'), 1800);
    } catch {
      setCopyLabel('Copy failed');
      window.setTimeout(() => setCopyLabel('Copy'), 1800);
    }
  }

  if (!hasResult) {
    return (
      <section className="result-card result-empty" aria-live="polite">
        <p className="result-title">Your shortened URL</p>
        <p className="result-placeholder">Your generated link will appear here once it is ready.</p>
      </section>
    );
  }

  return (
    <section className="result-card" aria-live="polite">
      <p className="result-title">Your shortened URL</p>
      <a className="result-link" href={shortLink.shortUrl} target="_blank" rel="noreferrer">
        {shortLink.shortUrl}
      </a>

      <div className="result-actions">
        <button className="secondary-button" type="button" onClick={handleCopy}>
          {copyLabel}
        </button>
        <a className="secondary-button" href={shortLink.shortUrl} target="_blank" rel="noreferrer">
          Open link
        </a>
        <button className="ghost-button" type="button" onClick={onReset}>
          Clear
        </button>
      </div>
    </section>
  );
}

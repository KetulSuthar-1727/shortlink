import { useMemo, useState } from 'react';
import Header from './components/Header';
import UrlForm from './components/UrlForm';
import ShortUrlResult from './components/ShortUrlResult';
import Footer from './components/Footer';

const API_ENDPOINT = '/api/links';

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildShortUrl(shortCode) {
  return `${window.location.origin}/${shortCode}`;
}

export default function App() {
  const [longUrl, setLongUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shortLink, setShortLink] = useState(null);

  const canSubmit = useMemo(() => {
    const trimmed = longUrl.trim();
    return Boolean(trimmed) && !loading;
  }, [longUrl, loading]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = longUrl.trim();

    if (!trimmed) {
      setError('Please paste a URL before shortening it.');
      return;
    }

    if (!isValidHttpUrl(trimmed)) {
      setError('Please enter a valid URL that starts with http:// or https://.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: trimmed }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.error ||
          (response.status === 429
            ? 'Rate limit exceeded. Please wait a moment and try again.'
            : 'Unable to shorten that URL right now.');
        throw new Error(message);
      }

      if (!data?.shortCode) {
        throw new Error('The server returned an unexpected response.');
      }

      setShortLink({
        shortCode: data.shortCode,
        shortUrl: buildShortUrl(data.shortCode),
        createdAt: data.createdAt || null,
      });
      setLongUrl('');
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong while shortening the URL.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setLongUrl('');
    setShortLink(null);
    setError('');
  }

  return (
    <div className="shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="page">
        <Header />

        <main className="hero">
          <section className="hero-copy">
            <p className="eyebrow">Fast link shortening for modern teams</p>
            <h1>Shorten your URL.</h1>
            <p className="hero-text">Create fast, shareable links in seconds.</p>

            <div className="feature-row" aria-label="Backend architecture indicators">
              <span>Redis Cached</span>
              <span>Rate Limited</span>
              <span>Dockerized</span>
              <span>Load Balanced</span>
            </div>
          </section>

          <section className="card">
            <UrlForm
              longUrl={longUrl}
              loading={loading}
              error={error}
              canSubmit={canSubmit}
              onChange={setLongUrl}
              onSubmit={handleSubmit}
            />

            <ShortUrlResult shortLink={shortLink} onReset={handleReset} />
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

const express = require('express');
const linkRouter = require('../routes/links');
const pool = require('../db/pool');
const app = express();
const redisClient = require('./redis/client');

app.use(express.json());

redisClient
  .connect()
  .then(() => {
    console.log('Redis connected');
  })
  .catch((error) => {
    console.error('Redis connection failed:', error);
  });

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Ok',
    service: 'Shortlink-api',
  });
});

app.use('/api/links', linkRouter);

app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const cacheKey = `link:${shortCode}`;

    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      console.log(`Cache HIT for ${shortCode}`);

      await pool.query(
        `UPDATE links
        SET click_count = click_count + 1
        WHERE short_code = $1`,
        [shortCode]
      );

      return res.redirect(302, cachedUrl);
    }

    console.log(`Cache MISS for ${shortCode}`);

    const result = await pool.query(
      `SELECT id, long_url, click_count, expires_at
      FROM links
      WHERE short_code = $1`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Short link not found',
      });
    }
    const link = result.rows[0];

    await redisClient.setEx(
      cacheKey,
      60 * 60 * 24,
      link.long_url,
    );

    console.log(`Cached ${shortCode} in Redis`);

    if (link.expires_at && new Date(link.expires_at) <= new Date()) {
      return res.status(410).json({
        error: 'Short Link has Expired',
      });
    }

    await pool.query(
      `INSERT INTO link_clicks (link_id)
      VALUES ($1)`,
      [link.id]
    );

    await pool.query(
      `UPDATE links
       SET click_count = click_count + 1
       WHERE id = $1`,
      [link.id]
    );

    return res.redirect(302, link.long_url);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = app;

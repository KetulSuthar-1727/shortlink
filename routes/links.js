const express = require("express");
const pool = require("../db/pool");
const { encodeBase62 } = require("../services/shortCode");
const redisClient = require("../src/redis/client")
const  { checkRateLimit } = require('../services/rateLimiter');
const validator = require("validator");
const router = express.Router();

router.post('/', async(req, res) => {
  try{
    // Rate limiting
    const key = `rate-limit:${req.ip}`;

    const rateLimit = await checkRateLimit(key);

    res.set("X-RateLimit-Limit", rateLimit.limit);
    res.set("X-RateLimit-Remaining", rateLimit.remaining);
    res.set("X-RateLimit-Reset", rateLimit.resetIn);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        limit: rateLimit.limit,
        count: rateLimit.count,
        retryAfter: rateLimit.resetIn,
      });
    }

    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({
        error: "longUrl is required",
      });
    }

    if (!validator.isURL(longUrl, {
      protocols: ["http", "https"],
      require_protocol: true,
    })) {
      return res.status(400).json({
        error: "Invalid URL",
      });
    }

    const sequenceResult = await pool.query(
      "SELECT nextval('public.links_id_seq') AS id"
    );

    const id = sequenceResult.rows[0].id;

    const shortCode = encodeBase62(id);

    const result = await pool.query(
      `INSERT INTO links (id, short_code, long_url)
      VALUES ($1, $2, $3)
      RETURNING id, short_code, long_url, created_at`,
      [id, shortCode, longUrl]
    );

    const link = result.rows[0];

    res.status(201).json({
      shortCode: link.short_code,
      shortUrl: `http://localhost:${process.env.PORT || 3000}/${link.short_code}`,
      longUrl: link.long_url,
      createdAt: link.created_at,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.delete("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await pool.query(
      `DELETE FROM links
       WHERE short_code = $1
       RETURNING short_code`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Short link not found",
      });
    }

    await redisClient.del(`link:${shortCode}`);

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/:shortCode/stats", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const result = await pool.query(
      `SELECT
         l.id,
         l.short_code,
         l.long_url,
         l.click_count,
         l.created_at,
         l.expires_at
       FROM links l
       WHERE l.short_code = $1`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Short link not found",
      });
    }

    const link = result.rows[0];

    return res.status(200).json({
      shortCode: link.short_code,
      longUrl: link.long_url,
      clickCount: link.click_count,
      createdAt: link.created_at,
      expiresAt: link.expires_at,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;
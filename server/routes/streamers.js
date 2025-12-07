const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ========================================
// GET /api/streamers - Get all streamers with their history
// ========================================
router.get('/', async (req, res) => {
  try {
    // Get all streamers
    const streamersResult = await pool.query(
      'SELECT id, name, platform, created_at FROM streamers ORDER BY created_at DESC'
    );

    // Get all subscriber history for all streamers
    const streamers = await Promise.all(
      streamersResult.rows.map(async (streamer) => {
        const historyResult = await pool.query(
          'SELECT count, timestamp FROM subscriber_history WHERE streamer_id = $1 ORDER BY timestamp ASC',
          [streamer.id]
        );

        return {
          id: streamer.id.toString(),
          name: streamer.name,
          platform: streamer.platform,
          history: historyResult.rows.map(h => ({
            count: h.count,
            timestamp: parseInt(h.timestamp)
          }))
        };
      })
    );

    res.json(streamers);
  } catch (error) {
    console.error('Error fetching streamers:', error);
    res.status(500).json({ error: 'Failed to fetch streamers' });
  }
});

// ========================================
// POST /api/streamers - Create a new streamer
// ========================================
router.post('/', async (req, res) => {
  const { name, platform, initialCount } = req.body;

  if (!name || !platform || initialCount === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, platform, initialCount' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert streamer
    const streamerResult = await client.query(
      'INSERT INTO streamers (name, platform) VALUES ($1, $2) RETURNING id, name, platform',
      [name, platform]
    );

    const streamer = streamerResult.rows[0];
    const timestamp = Date.now();

    // Insert initial subscriber count
    await client.query(
      'INSERT INTO subscriber_history (streamer_id, count, timestamp) VALUES ($1, $2, $3)',
      [streamer.id, initialCount, timestamp]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: streamer.id.toString(),
      name: streamer.name,
      platform: streamer.platform,
      history: [
        {
          count: initialCount,
          timestamp: timestamp
        }
      ]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating streamer:', error);
    res.status(500).json({ error: 'Failed to create streamer' });
  } finally {
    client.release();
  }
});

// ========================================
// PUT /api/streamers/:id - Update streamer details
// ========================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, platform } = req.body;

  if (!name || !platform) {
    return res.status(400).json({ error: 'Missing required fields: name, platform' });
  }

  try {
    const result = await pool.query(
      'UPDATE streamers SET name = $1, platform = $2 WHERE id = $3 RETURNING id, name, platform',
      [name, platform, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Streamer not found' });
    }

    const streamer = result.rows[0];
    res.json({
      id: streamer.id.toString(),
      name: streamer.name,
      platform: streamer.platform
    });
  } catch (error) {
    console.error('Error updating streamer:', error);
    res.status(500).json({ error: 'Failed to update streamer' });
  }
});

// ========================================
// DELETE /api/streamers/:id - Delete a streamer
// ========================================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM streamers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Streamer not found' });
    }

    res.json({ success: true, message: 'Streamer deleted successfully' });
  } catch (error) {
    console.error('Error deleting streamer:', error);
    res.status(500).json({ error: 'Failed to delete streamer' });
  }
});

// ========================================
// POST /api/streamers/:id/subscribers - Add a new subscriber count
// ========================================
router.post('/:id/subscribers', async (req, res) => {
  const { id } = req.params;
  const { count, timestamp } = req.body;

  if (count === undefined || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields: count, timestamp' });
  }

  try {
    // Verify streamer exists
    const streamerResult = await pool.query(
      'SELECT id FROM streamers WHERE id = $1',
      [id]
    );

    if (streamerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Streamer not found' });
    }

    // Insert new subscriber count
    const result = await pool.query(
      'INSERT INTO subscriber_history (streamer_id, count, timestamp) VALUES ($1, $2, $3) RETURNING id, streamer_id, count, timestamp',
      [id, count, timestamp]
    );

    const history = result.rows[0];
    res.status(201).json({
      id: history.id,
      streamer_id: history.streamer_id.toString(),
      count: history.count,
      timestamp: parseInt(history.timestamp)
    });
  } catch (error) {
    console.error('Error adding subscriber count:', error);
    res.status(500).json({ error: 'Failed to add subscriber count' });
  }
});

module.exports = router;

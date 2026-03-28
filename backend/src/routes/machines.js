const express = require('express');
const router = express.Router();
const { Machine } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require JWT
router.use(authenticateToken);

// PUT /api/machines/:id — update hostname and ip_address
router.put('/:id', async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    const { hostname, ip_address } = req.body;
    await machine.update({
      ...(hostname   && { hostname }),
      ...(ip_address && { ip_address }),
      updated_at: new Date()
    });

    res.json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/machines/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    await machine.destroy();
    res.json({ success: true, message: 'Machine deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

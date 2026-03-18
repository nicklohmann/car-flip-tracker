const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// POST estimate damage from images
router.post('/estimate', async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ error: 'No image URLs provided' });
    }

    // Build image content blocks for Claude
    const imageContent = imageUrls.map(url => ({
      type: 'image',
      source: {
        type: 'url',
        url: url,
      },
    }));

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `You are an experienced used car repair estimator. Look at these photos of a damaged vehicle and return a JSON array of parts that appear damaged. For each part include: part_name, estimated_cost (in USD as a number), and vendor (suggest where to buy it: eBay, car-part.com, AutoZone, dealer, or body shop). Only return the JSON array, no other text. Example format: [{"part_name": "front bumper cover", "estimated_cost": 350, "vendor": "eBay"}]`
            }
          ]
        }
      ]
    });

    const text = response.content[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parts = JSON.parse(cleaned);
    res.json({ parts });

  } catch (err) {
    console.log('Estimation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
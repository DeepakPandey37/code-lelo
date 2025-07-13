const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEN_API_KEY);

router.get('/help', (req, res) => {
  res.render('query-window', { prompt: null, response: null });
});

router.post('/help', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).send("Prompt is required");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responsetxt = result.response.text();

    res.render('query-window', { prompt, response: responsetxt });
  } catch (error) {
    console.error("Error at", error);
    res.status(500).send("An error occurred while generating the response");
  }
});

// Export the router as middleware so that app.use() receives a function
module.exports = router;

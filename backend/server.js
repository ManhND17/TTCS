require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


app.post("/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that translates text to ${targetLang === "vi" ? "Vietnamese" : targetLang}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translation = chatCompletion.choices[0].message.content;
    res.json({ translation });
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

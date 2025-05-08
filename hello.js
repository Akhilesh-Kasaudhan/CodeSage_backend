// server.js
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyCjFWoRawc8HYfiBsRA71KlHZRAAR-Czg0");

app.post("/generate", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: req.body.prompt }] }],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of result.stream) {
      const text = chunk.text();
      res.write(`data: ${text}\n\n`);
    }

    res.write("event: done\ndata: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating content");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

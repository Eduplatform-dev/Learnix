import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(10000),
    })
  ).min(1).max(50),
});

const SYSTEM_PROMPT = `You are an intelligent AI Study Assistant for Learnix, a Learning Management System.
Your role is to help students with:
- Study plans and learning strategies
- Explaining concepts from their courses (React, Data Structures, Algorithms, Databases, etc.)
- Assignment help and guidance (without doing the work for them)
- Time management and productivity tips
- Exam preparation strategies
- Motivation and overcoming learning challenges

Keep responses concise, friendly, and educational. Use bullet points and structure when helpful.
If asked something unrelated to studying/learning, gently redirect to academic topics.`;

router.post("/chat", authenticateToken, async (req, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    }

    const { messages } = parsed.data;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "AI service not configured" });
    }

    // Set up SSE streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        stream: true,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Forward SSE chunks directly to client
      res.write(chunk);
    }

    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;

import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role:    z.enum(["user", "assistant"]),
        content: z.string().min(1).max(10000),
      })
    )
    .min(1)
    .max(50),
});

const SYSTEM_PROMPT = `You are an intelligent AI Study Assistant for Learnix, a Learning Management System.
Your role is to help students and instructors with:
- Study plans and learning strategies
- Explaining concepts from courses (React, Data Structures, Algorithms, Databases, etc.)
- Assignment help and guidance (without doing the work for them)
- Time management and productivity tips
- Exam preparation strategies
- Motivation and overcoming learning challenges
- For instructors: course design, teaching strategies, content creation tips

Keep responses concise, friendly, and educational. Use bullet points and structure when helpful.
If asked something unrelated to studying/learning, gently redirect to academic topics.`;

/* ================= POST /api/ai/chat ================= */
router.post("/chat", authenticateToken, async (req, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: parsed.error.flatten(),
      });
    }

    const { messages } = parsed.data;

    // Try Anthropic first, then Gemini as fallback
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!anthropicKey && !geminiKey) {
      return res.status(503).json({
        error: "AI service not configured. Add ANTHROPIC_API_KEY or GEMINI_API_KEY to server/.env",
      });
    }

    // If Anthropic key available, use it with streaming
    if (anthropicKey) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system:     SYSTEM_PROMPT,
          stream:     true,
          messages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Anthropic API error:", errText);
        res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
        res.end();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      req.on("close", () => { reader.cancel(); });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }

      res.end();
      return;
    }

    // Gemini fallback — non-streaming (simpler)
    if (geminiKey) {
      // Build Gemini message format
      const geminiMessages = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiMessages,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("Gemini API error:", errText);
        return res.status(502).json({ error: "AI service error. Please try again." });
      }

      const geminiData = await geminiRes.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

      // Simulate SSE streaming for Gemini (send as single event)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      // Emit text in chunks to simulate streaming
      const chunkSize = 30;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        const event = {
          type: "content_block_delta",
          delta: { type: "text_delta", text: chunk },
        };
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        // Tiny delay for streaming feel
        await new Promise((r) => setTimeout(r, 10));
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

  } catch (err) {
    console.error("AI chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      try {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      } catch {
        // Response already ended
      }
    }
  }
});

export default router;
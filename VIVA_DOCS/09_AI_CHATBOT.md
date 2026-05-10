# 09 — AI Chatbot (UrbanPool Assistant)

## What is it?
A floating chat bubble (💬) in the bottom-right corner of every page. Users can type questions about the app, their rides, or general help, and the AI responds like a smart assistant.

## What technology powers it?
**Google Gemini API** — Google's large language model (like ChatGPT but by Google).

## How it works (step by step)
1. User clicks the 💬 chat bubble
2. A chat panel slides up
3. User types a question (e.g., "How do I book a ride?")
4. The message is sent to the backend: `POST /api/chat/ai`
5. Backend sends the message to Google Gemini API with a system prompt:
   > "You are UrbanPool's helpful assistant. Help users with ride booking, payments, and navigation."
6. Gemini AI generates a response
7. Backend returns the response to the frontend
8. Response appears in the chat panel

## What can users ask?
- "How do I cancel my ride?"
- "How does surge pricing work?"
- "How do I add money to my wallet?"
- "What is UrbanPool?"
- Any general question

## System prompt (how we customize the AI)
We give Gemini a **system prompt** telling it to act specifically as UrbanPool's assistant:
- Only answer questions related to rides, payments, the app
- Be friendly and concise
- Don't answer unrelated questions

## Chat history
The chat keeps a history of the conversation so Gemini can answer follow-up questions with context.

## Key file
`src/components/common/ChatWidget/ChatWidget.jsx` — the chat bubble UI
`backend/server.js` → `POST /api/chat/ai` — sends to Gemini API

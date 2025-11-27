# Prep Buddy

A sleek, modern AI chatbot assistant for BITSoM placements, built with Next.js 16 and featuring web search capabilities, vector database integration, and content moderation. Designed with a contemporary glass-morphism UI and optimized for Replit deployment.

## Overview

Prep Buddy is an AI-powered placement assistant that can:

- Answer questions about placements at BITSoM
- Help prepare for company interviews
- Search the web for up-to-date information
- Search a vector database (Pinecone) for stored knowledge
- Moderate content to ensure safe interactions
- Provide citations and sources for its responses

The application features a modern, sleek interface with gradient effects, glass-morphism design, and smooth animations.

## Current Configuration

- **AI Name**: Prep Buddy
- **Owners**: Sadanand & Ayush
- **AI Model**: OpenAI GPT-4.1
- **Domain Focus**: Product Management placements at BITSoM

## Key Files to Customize

### `config.ts` - Application Configuration

This is the **primary file** you'll edit to customize your AI assistant:

- **AI Identity**: `AI_NAME` and `OWNER_NAME`
- **Welcome Message**: `WELCOME_MESSAGE`
- **UI Text**: `CLEAR_CHAT_TEXT`
- **Moderation Messages**: Custom messages for content moderation
- **Model Configuration**: `MODEL` - Currently set to `openai('gpt-4.1')`
- **Vector Database Settings**: `PINECONE_TOP_K` and `PINECONE_INDEX_NAME`

### `prompts.ts` - AI Behavior and Instructions

Controls how your AI assistant behaves and responds:

- **Identity Prompt**: Who the AI is and who created it
- **Tool Calling Prompt**: Instructions for when to search the web or database
- **Tone & Style**: Communication style (friendly, helpful, educational)
- **Guardrails**: What the AI should refuse to discuss
- **Citation Rules**: How to cite sources in responses

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/chat/                 # Chat API endpoint
│   │   ├── route.ts              # Main chat handler
│   │   └── tools/                # AI tools
│   │       ├── web-search.ts     # Exa web search
│   │       └── search-vector-database.ts  # Pinecone search
│   ├── page.tsx                  # Main chat interface (modern UI)
│   ├── parts/                    # UI component parts
│   ├── terms/                    # Terms of Use page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ai-elements/              # AI-specific UI components
│   ├── messages/                 # Message display components
│   └── ui/                       # Reusable UI components (shadcn/ui)
├── lib/                          # Utility libraries
│   ├── moderation.ts             # Content moderation logic
│   ├── pinecone.ts               # Vector database integration
│   ├── sources.ts                # Source/citation handling
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
│   └── logo.png                  # App logo
├── config.ts                     # Main configuration file
├── prompts.ts                    # AI behavior configuration
├── next.config.ts                # Next.js configuration
└── package.json                  # Dependencies and scripts
```

## UI Features

The application features a modern, sleek design:

- **Glass-morphism Hero Card**: Semi-transparent card with backdrop blur and gradient shadows
- **Gradient Background**: Subtle blue-to-white gradient for depth
- **Modern Header**: Sticky header with logo glow effect on hover
- **Starter Prompt Buttons**: Three quick-action buttons with hover animations
  - Pink gradient: "Prep for a company"
  - White bordered: "Who was selected at..."
  - Purple accent: "General chat"
- **Refined Input Bar**: Focus glow effect, layered shadows, rounded design
- **Smooth Transitions**: 200-300ms animations throughout
- **AI Badge**: "AI-Powered Assistant" pill with sparkle icon

## Environment Setup

### For Replit

The application is pre-configured to run on Replit:
- Runs on port 5000 with host 0.0.0.0
- CORS headers configured for Replit proxy
- Server actions allowed from all origins

Set environment variables in the Replit Secrets panel:

- `OPENAI_API_KEY` - **Required** for AI model and moderation
- `EXA_API_KEY` - Optional, enables web search functionality
- `PINECONE_API_KEY` - Optional, enables vector database search
- `FIREWORKS_API_KEY` - Optional, alternative AI provider

### For Vercel/Other Platforms

Configure environment variables in your platform's settings.

**Where to get API keys:**

- **OpenAI**: https://platform.openai.com/api-keys (required)
- **Exa**: https://dashboard.exa.ai/ (optional)
- **Pinecone**: https://app.pinecone.io/ (optional)

## Development

### Running Locally

```bash
npm install
npm run dev
```

The application will start on http://localhost:5000

### Scripts

- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm run start` - Start production server (port 5000)
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Runtime**: Node.js
- **Language**: TypeScript
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI (shadcn/ui)
- **AI SDK**: Vercel AI SDK with multiple providers
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: CSS transitions and transforms

## Architecture

The application follows a streaming request-response flow:

1. **User sends message** → `app/page.tsx`
2. **Message sent to API** → `app/api/chat/route.ts`
3. **Content moderation check** → `lib/moderation.ts`
4. **AI processes with tools** → Web search and/or vector search
5. **Response streamed back** → Real-time display with SSE

### Key Features

- **Persistent Chat History**: Messages stored in localStorage
- **Streaming Responses**: Real-time AI responses via Server-Sent Events
- **Tool Integration**: AI can search web and vector databases
- **Content Moderation**: OpenAI moderation API for safety
- **Responsive Design**: Works on desktop and mobile

## Customization Guide

### Changing the AI's Name and Identity

1. Edit `config.ts`:
   ```typescript
   export const AI_NAME = "Your Assistant Name";
   export const OWNER_NAME = "Your Name";
   ```

2. Update `WELCOME_MESSAGE` if desired

### Adjusting AI Behavior

Edit `prompts.ts` to modify:
- `TONE_STYLE_PROMPT` - Communication style
- `GUARDRAILS_PROMPT` - Safety rules
- `TOOL_CALLING_PROMPT` - When to use tools
- `CITATIONS_PROMPT` - Citation format

### Customizing the UI

The main UI is in `app/page.tsx`. Key customizable elements:
- Color palette (uses Tailwind classes)
- Gradient effects
- Button styles and animations
- Hero card content
- Starter prompts

### Adding or Removing Tools

Tools are in `app/api/chat/tools/`:
1. Create a new file for your tool
2. Import and add to `app/api/chat/route.ts` in the `tools` object
3. Add UI display logic in `components/messages/tool-call.tsx`

## Troubleshooting

### AI not responding
- Verify `OPENAI_API_KEY` is set correctly
- Check browser console for errors
- Ensure API key has sufficient credits

### Web search not working
- Verify `EXA_API_KEY` is set
- Check Exa API dashboard for usage limits

### Vector search not working
- Verify `PINECONE_API_KEY` is set
- Check `PINECONE_INDEX_NAME` in `config.ts` matches your index
- Ensure your Pinecone index exists and has data

### UI not displaying correctly
- Clear browser cache and hard refresh
- Check for console errors
- Ensure all dependencies are installed

## License

See LICENSE file for details.

---

**Quick Start**: Edit `config.ts` and `prompts.ts` to customize your AI assistant!

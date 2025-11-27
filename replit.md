# MyAI3 - Replit Setup

## Overview

This is an AI-powered chatbot assistant built with Next.js 16, featuring web search capabilities, vector database integration, and content moderation. The application has been configured to run in the Replit environment.

## Project Information

- **Framework**: Next.js 16.0.0 with TypeScript
- **Runtime**: Node.js
- **Package Manager**: npm
- **UI Library**: React 19.2.0 with Radix UI components
- **Styling**: Tailwind CSS 4
- **AI Integration**: Vercel AI SDK with multiple provider support (OpenAI, Fireworks, Groq, DeepSeek, xAI)
- **Vector Database**: Pinecone
- **Web Search**: Exa API

## Project Structure

```
myAI3/
├── app/                          # Next.js App Router
│   ├── api/chat/                 # Chat API endpoint
│   │   ├── route.ts              # Main chat handler
│   │   └── tools/                # AI tools (web search, vector search)
│   ├── page.tsx                  # Main chat interface
│   ├── parts/                    # UI components
│   └── terms/                    # Terms of Use page
├── components/                   # React components
│   ├── ai-elements/             # AI-specific UI components
│   ├── messages/                # Message display components
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility libraries
│   ├── moderation.ts            # Content moderation logic
│   ├── pinecone.ts              # Vector database integration
│   └── sources.ts               # Source/citation handling
├── config.ts                    # Main configuration file
├── prompts.ts                   # AI behavior configuration
└── package.json                 # Dependencies and scripts
```

## Configuration

### Replit Environment Setup

The application has been configured for Replit with the following settings:

1. **Port Configuration**: Runs on port 5000 (required for Replit webview)
2. **Host Configuration**: Binds to 0.0.0.0 to allow external access
3. **Next.js Config**: Configured to allow all origins for server actions (required for Replit proxy)

### Environment Variables

The following environment variables are required for full functionality:

- `OPENAI_API_KEY` - **Required** for AI model and content moderation
- `EXA_API_KEY` - Optional, enables web search functionality
- `PINECONE_API_KEY` - Optional, enables vector database search
- `FIREWORKS_API_KEY` - Optional, alternative AI provider

You can set these in the Replit Secrets panel or in the `.env.local` file.

## Development Workflow

The application runs via the "Start application" workflow which executes:
```bash
npm run dev
```

This starts the Next.js development server on http://0.0.0.0:5000

## Customization

The application is designed to be easily customizable:

### Main Configuration (`config.ts`)
- AI name and owner information
- Welcome message
- Moderation messages
- AI model selection
- Pinecone settings

### AI Behavior (`prompts.ts`)
- System prompts
- Tone and style
- Tool calling instructions
- Citation format
- Guardrails

## Key Features

1. **AI Chat Interface**: Real-time streaming responses with markdown support
2. **Web Search**: Integrated Exa API for up-to-date information
3. **Vector Database**: Pinecone integration for knowledge base search
4. **Content Moderation**: OpenAI moderation API for safe interactions
5. **Citations**: Automatic source attribution for search results
6. **Responsive UI**: Modern, accessible interface with Radix UI components

## Recent Changes

- **2024-11-27**: Front-end UI redesign
  - Centered logo with icon + "prep buddy" text in bold dark navy
  - Light-blue rounded hero card with heading and subtitle
  - Three starter prompt pill buttons (Prep for a company, Who was selected at..., General chat)
  - Beta disclaimer text below buttons
  - Redesigned chat input bar with rounded container and circular send button
  - Updated footer with copyright, Terms of Use, and Ringel.AI attribution
  - Conditional UI: hero section shown for new users, message wall for active conversations

- **2024-11-27**: Initial Replit environment setup
  - Configured Next.js to run on port 5000 with host 0.0.0.0
  - Added allowed origins configuration for Replit proxy
  - Set up development workflow
  - Created environment variables template

## Architecture Notes

This is a full-stack Next.js application with:
- **Frontend**: React components served at the root route
- **Backend**: API routes handling chat requests, AI processing, and tool execution
- **No separate backend server**: Everything runs within Next.js

The application uses Server-Sent Events (SSE) for streaming AI responses to the client.

## Dependencies

Key dependencies include:
- Next.js 16.0.0
- React 19.2.0
- Vercel AI SDK (multiple providers)
- OpenAI SDK
- Pinecone client
- Exa search API
- Radix UI components
- Tailwind CSS 4

## User Preferences

None documented yet. Will be updated as user preferences are expressed.

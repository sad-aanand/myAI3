"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square, Sparkles } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

const STORAGE_KEY = 'chat-messages';

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };

    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

const STARTER_PROMPTS = {
  prep: "Help me prepare for a company interview",
  selected: "Who was selected at ",
  general: "I have a general question about placements",
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== 'undefined' ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const welcomeMessage: UIMessage = {
      id: `welcome-${Date.now()}`,
      role: "assistant",
      parts: [
        {
          type: "text",
          text: WELCOME_MESSAGE,
        },
      ],
    };
    const newMessages: UIMessage[] = [welcomeMessage];
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  function fillPrompt(prompt: string) {
    form.setValue("message", prompt);
  }

  const hasConversation = messages.length > 1 || (messages.length === 1 && messages[0].role === "user");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans antialiased">
      <header className="w-full py-5 px-6 flex justify-between items-center backdrop-blur-sm bg-white/70 sticky top-0 z-40 border-b border-slate-100/50">
        <div className="flex-1" />
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
            <Image src="/logo.png" alt="Prep Buddy Logo" width={34} height={34} className="relative rounded-xl shadow-sm" />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent lowercase tracking-tight">
            prep buddy
          </span>
        </div>
        <div className="flex-1 flex justify-end">
          {hasConversation && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-200"
            >
              <Plus className="size-4" />
              {CLEAR_CHAT_TEXT}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        {!hasConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-52">
            <div className="relative mb-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-2xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[1.75rem] shadow-xl shadow-slate-200/50 border border-white/60 p-10 md:p-12 max-w-md w-full text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full text-xs font-medium text-indigo-600 mb-6 border border-indigo-100/50">
                  <Sparkles className="size-3.5" />
                  AI-Powered Assistant
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-4 leading-tight">
                  Hello! I'm Prep Buddy,
                </h1>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed font-light">
                  your AI assistant for anything related<br />to placements at BITSoM
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-md justify-center">
              <button
                onClick={() => fillPrompt(STARTER_PROMPTS.prep)}
                className="group px-5 py-3 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-medium rounded-2xl transition-all duration-300 text-sm shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 hover:-translate-y-0.5"
              >
                Prep for a company
              </button>
              <button
                onClick={() => fillPrompt(STARTER_PROMPTS.selected)}
                className="group px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-300 text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Who was selected at...
              </button>
              <button
                onClick={() => fillPrompt(STARTER_PROMPTS.general)}
                className="group px-5 py-3 bg-white hover:bg-violet-50 text-violet-600 font-medium rounded-2xl border border-slate-200 hover:border-violet-200 transition-all duration-300 text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                General chat
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center max-w-sm leading-relaxed">
              Product in beta – please verify responses, currently limited to Product Management domain.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-52">
            <div className="flex flex-col items-center justify-end min-h-full">
              {isClient ? (
                <>
                  <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                  {status === "submitted" && (
                    <div className="flex justify-start max-w-3xl w-full">
                      <Loader2 className="size-4 animate-spin text-slate-400" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center max-w-2xl w-full">
                  <Loader2 className="size-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-2">
          <div className="w-full px-5 pb-2 flex justify-center">
            <div className="max-w-2xl w-full">
              <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="chat-form-message" className="sr-only">
                          Message
                        </FieldLabel>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                          <div className="relative">
                            <Input
                              {...field}
                              id="chat-form-message"
                              className="h-14 pr-14 pl-5 bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/50 text-slate-700 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-300 transition-all duration-200"
                              placeholder="Type your message here..."
                              disabled={status === "streaming"}
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  form.handleSubmit(onSubmit)();
                                }
                              }}
                            />
                            {(status == "ready" || status == "error") && (
                              <button
                                type="submit"
                                disabled={!field.value.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group"
                              >
                                <ArrowUp className="size-5 text-white group-disabled:text-slate-400" />
                              </button>
                            )}
                            {(status == "streaming" || status == "submitted") && (
                              <button
                                type="button"
                                onClick={() => stop()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                              >
                                <Square className="size-4 text-white" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>
          <footer className="w-full px-5 py-3 flex justify-center">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              © {new Date().getFullYear()} {OWNER_NAME}
              <span className="text-slate-300">·</span>
              <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Use</Link>
              <span className="text-slate-300">·</span>
              <span>Powered by</span>
              <Link href="https://ringel.ai/" className="hover:text-slate-600 transition-colors font-medium">Ringel.AI</Link>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

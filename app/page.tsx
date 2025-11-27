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
import { ArrowUp, Loader2, Plus, Square } from "lucide-react";
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
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <header className="w-full py-6 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Prep Buddy Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-bold text-[#1e3a5f] lowercase tracking-tight">prep buddy</span>
        </div>
        {hasConversation && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-5 cursor-pointer"
            onClick={clearChat}
          >
            <Plus className="size-4" />
            {CLEAR_CHAT_TEXT}
          </Button>
        )}
      </header>

      <main className="flex-1 flex flex-col relative">
        {!hasConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 pb-48">
            <div className="bg-[#e8f4fc] rounded-3xl shadow-lg p-8 md:p-10 max-w-lg w-full text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold text-[#1e3a5f] mb-3">
                Hello! I'm Prep Buddy,
              </h1>
              <p className="text-[#4a6b8a] text-base md:text-lg leading-relaxed">
                your AI assistant for anything related<br />to placements at BITSoM
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-lg justify-center">
              <button
                onClick={() => fillPrompt(STARTER_PROMPTS.prep)}
                className="px-6 py-3 bg-[#e8a4b8] hover:bg-[#dda0a8] text-[#1e3a5f] font-medium rounded-full transition-colors text-sm md:text-base shadow-sm"
              >
                Prep for a company
              </button>
              <button
                onClick={() => fillPrompt(STARTER_PROMPTS.selected)}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-[#1e3a5f] font-medium rounded-full border border-[#d1d5db] transition-colors text-sm md:text-base shadow-sm"
              >
                Who was selected at...
              </button>
              <button
                onClick={() => fillPrompt(STARTER_PROMPTS.general)}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-[#7c3aed] font-medium rounded-full border border-[#d1d5db] transition-colors text-sm md:text-base shadow-sm"
              >
                General chat
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center max-w-md">
              Product in beta – please verify responses, currently limited to Product Management domain.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 pb-48">
            <div className="flex flex-col items-center justify-end min-h-full">
              {isClient ? (
                <>
                  <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                  {status === "submitted" && (
                    <div className="flex justify-start max-w-3xl w-full">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center max-w-2xl w-full">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white to-transparent pt-6">
          <div className="w-full px-5 pb-3 flex justify-center">
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
                        <div className="relative">
                          <Input
                            {...field}
                            id="chat-form-message"
                            className="h-14 pr-14 pl-5 bg-[#f3f4f6] rounded-full border-0 shadow-sm text-gray-700 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/20"
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
                            <Button
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#1e3a5f] hover:bg-[#2d4a6f] size-10"
                              type="submit"
                              disabled={!field.value.trim()}
                              size="icon"
                            >
                              <ArrowUp className="size-5 text-white" />
                            </Button>
                          )}
                          {(status == "streaming" || status == "submitted") && (
                            <Button
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#1e3a5f] hover:bg-[#2d4a6f] size-10"
                              size="icon"
                              onClick={() => {
                                stop();
                              }}
                            >
                              <Square className="size-4 text-white" />
                            </Button>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>
            </div>
          </div>
          <footer className="w-full px-5 py-4 flex justify-center text-xs text-gray-400">
            <span>
              © {new Date().getFullYear()} {OWNER_NAME} · <Link href="/terms" className="hover:underline">Terms of Use</Link> · Powered by <Link href="https://ringel.ai/" className="hover:underline">Ringel.AI</Link>
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

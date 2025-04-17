import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai" | "other";
  timestamp: Date;
};

interface ChatBoxProps {
  recipient?: string;
  avatarUrl?: string;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => void;
  className?: string;
  phoneNumber?: string; // Optional phone number for WhatsApp integration
  useWhatsApp?: boolean; // Whether to use WhatsApp integration
  useAI?: boolean; // Whether to use AI for responses
}

export default function ChatBox({
  recipient = "Support",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
  initialMessages = [],
  onSendMessage,
  className = "",
  phoneNumber,
  useWhatsApp = false,
  useAI = true,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  // Subscribe to chat_logs table for real-time updates if using WhatsApp
  useEffect(() => {
    if (!useWhatsApp || !phoneNumber) return;

    // Subscribe to changes in the chat_logs table
    const subscription = supabase
      .channel("chat_logs_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_logs" },
        (payload) => {
          const newRecord = payload.new as any;

          // Only process messages related to this phone number
          if (
            newRecord.sender === phoneNumber ||
            newRecord.in_response_to === phoneNumber
          ) {
            const newMsg: Message = {
              id: newRecord.id,
              text: newRecord.message_text,
              sender: newRecord.is_ai_response
                ? "ai"
                : newRecord.sender === phoneNumber
                  ? "user"
                  : "other",
              timestamp: new Date(newRecord.timestamp),
            };

            setMessages((prev) => [...prev, newMsg]);
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [useWhatsApp, phoneNumber]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    try {
      if (onSendMessage) {
        onSendMessage(newMessage);
      }

      // If using WhatsApp, log the message to Supabase
      if (useWhatsApp && phoneNumber) {
        await supabase.from("chat_logs").insert({
          sender: phoneNumber,
          message_text: newMessage,
          timestamp: new Date().toISOString(),
          is_group: false,
        });

        // The AI response will be handled by the webhook
        // and will appear via the subscription
      } else {
        // For regular chat (not WhatsApp), simulate or get an AI response
        setTimeout(() => {
          const responseText = useAI
            ? "Thanks for your message. Our AI is processing your request."
            : "Thanks for your message. This is an automated response.";

          const responseMessage: Message = {
            id: crypto.randomUUID(),
            text: responseText,
            sender: useAI ? "ai" : "other",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, responseMessage]);
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className={`flex flex-col h-[500px] ${className}`}>
      {/* Chat header */}
      <div className="p-3 border-b flex items-center gap-3 bg-primary/5">
        <Avatar>
          <img src={avatarUrl} alt={recipient} />
        </Avatar>
        <div>
          <h3 className="font-medium">{recipient}</h3>
          <p className="text-xs text-muted-foreground">
            {useWhatsApp ? "WhatsApp" : "Online"}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start a conversation!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.sender === "ai"
                        ? "bg-secondary/80 text-secondary-foreground"
                        : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-3 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
          <Send size={18} />
        </Button>
      </div>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface WebhookMessage {
  device: string;
  sender: string;
  message: string;
  pushName: string;
  timestamp: number;
  isGroup: boolean;
  groupName?: string;
}

export default function WhatsappWebhook() {
  const [status, setStatus] = useState<string>("Waiting for webhook...");
  const [messages, setMessages] = useState<WebhookMessage[]>([]);

  async function handleWebhook(data: WebhookMessage) {
    try {
      // Log the incoming message to Supabase
      const { error } = await supabase.from("chat_logs").insert({
        sender: data.sender,
        message_text: data.message,
        timestamp: new Date(data.timestamp).toISOString(),
        is_group: data.isGroup,
        group_name: data.groupName || null,
        push_name: data.pushName,
        device: data.device,
      });

      if (error) {
        console.error("Error logging message to Supabase:", error);
        setStatus(`Error: ${error.message}`);
        return;
      }

      // Process the message with AI (to be implemented)
      const aiResponse = await processMessageWithAI(data.message);

      // Log the AI response
      await supabase.from("chat_logs").insert({
        sender: "AI",
        message_text: aiResponse,
        timestamp: new Date().toISOString(),
        is_group: data.isGroup,
        group_name: data.groupName || null,
        in_response_to: data.sender,
      });

      // Update the UI
      setMessages((prev) => [...prev, data]);
      setStatus("Webhook received and processed successfully");
    } catch (error) {
      console.error("Error processing webhook:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // This is a placeholder for the AI processing function
  // Will be implemented with OpenAI integration
  async function processMessageWithAI(message: string): Promise<string> {
    // For now, return a simple response
    return "Thank you for your message. Our AI is processing your request.";
  }

  // This component is for testing purposes only
  // In production, this would be an API endpoint
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Webhook Tester</h1>
      <div className="bg-yellow-100 p-4 rounded mb-6">
        <p className="text-yellow-800">
          Note: This is a test UI. In production, this would be an API endpoint
          that receives webhook requests from Fonnte.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <div className="bg-gray-100 p-4 rounded">{status}</div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Test Webhook</h2>
        <button
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() => {
            const testMessage: WebhookMessage = {
              device: "test-device",
              sender: "628123456789",
              message: "Saya ingin booking mobil untuk besok",
              pushName: "Test User",
              timestamp: Date.now(),
              isGroup: false,
            };
            handleWebhook(testMessage);
          }}
        >
          Simulate Webhook
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Received Messages</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages received yet</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded">
                <p>
                  <strong>From:</strong> {msg.pushName} ({msg.sender})
                </p>
                <p>
                  <strong>Message:</strong> {msg.message}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// Initialize Supabase client
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
interface WhatsAppMessage {
  id: string;
  phone: string;
  name: string;
  message: string;
  timestamp: string;
  isGroup: boolean;
  group?: {
    id: string;
    name: string;
  };
}

interface WebhookResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ✅ Log incoming message
export async function processWhatsAppWebhook(
  data: any,
): Promise<WebhookResponse> {
  try {
    if (!data || !data.phone || !data.message) {
      return { success: false, message: "Invalid webhook data" };
    }

    const messageData: WhatsAppMessage = {
      id: data.id || `msg_${Date.now()}`,
      phone: data.phone,
      name: data.name || "Unknown",
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
      isGroup: !!data.isGroup,
      ...(data.isGroup && data.group ? { group: data.group } : {}),
    };

    const { error } = await supabase.from("chat_logs").insert([
      {
        message_id: messageData.id,
        sender_phone: messageData.phone,
        sender_name: messageData.name,
        message_content: messageData.message,
        is_group: messageData.isGroup,
        group_id: messageData.group?.id,
        group_name: messageData.group?.name,
        created_at: messageData.timestamp,
        direction: "incoming",
      },
    ]);

    if (error) {
      console.error("Error logging to Supabase:", error);
      return { success: false, message: "Failed to log message" };
    }

    return {
      success: true,
      message: "Webhook processed successfully",
      data: messageData,
    };
  } catch (error) {
    console.error("Error processing webhook:", error);
    return { success: false, message: "Internal server error" };
  }
}

// ✅ Kirim balasan ke WhatsApp
export async function sendWhatsAppMessage(
  phone: string,
  message: string,
  apiKey: string,
): Promise<any> {
  try {
    const response = await axios.post(
      "https://api.fonnte.com/send",
      { target: phone, message },
      { headers: { Authorization: apiKey } },
    );

    await supabase.from("chat_logs").insert([
      {
        message_id: `outgoing_${Date.now()}`,
        sender_phone: "system",
        sender_name: "System",
        recipient_phone: phone,
        message_content: message,
        is_group: false,
        created_at: new Date().toISOString(),
        direction: "outgoing",
      },
    ]);

    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}

// ✅ Handler API
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.FONNTE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !openaiKey) {
    return res.status(500).json({ error: "API keys not set in environment" });
  }

  const { phone, message } = req.body;
  const result = await processWhatsAppWebhook(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }

  // 💬 Balasan dari AI (OpenAI GPT)
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah asisten rental mobil yang ramah. Jawablah pertanyaan pelanggan dengan sopan dan jelas.",
        },
        { role: "user", content: message },
      ],
    }),
  });

  const aiData = await openaiRes.json();
  const reply =
    aiData.choices?.[0]?.message?.content ||
    "Maaf, saya tidak bisa menjawab saat ini.";

  // Kirim ke WhatsApp via Fonnte
  const sendResult = await sendWhatsAppMessage(phone, reply, apiKey);

  return res.status(200).json({
    success: true,
    data: result.data,
    reply,
    fonnte: sendResult,
  });
}

import axios from "axios";

interface SendMessageParams {
  target: string; // Phone number in format 628xxxxxxxxxx
  message: string;
  delay?: number; // Delay in seconds
  countryCode?: string; // Default: 62
}

interface FonnteResponse {
  status: boolean;
  reason?: string;
  id?: string;
}

class FonnteService {
  private apiKey: string;
  private baseUrl: string = "https://api.fonnte.com/send";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Send a WhatsApp message using Fonnte API
   */
  async sendMessage(params: SendMessageParams): Promise<FonnteResponse> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          target: params.target,
          message: params.message,
          delay: params.delay || 0,
          countryCode: params.countryCode || "62",
        },
        {
          headers: {
            Authorization: this.apiKey,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error sending message via Fonnte:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: false,
          reason: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
        };
      }
      return {
        status: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Set up a webhook URL for receiving messages
   * Note: This is typically done through the Fonnte dashboard
   * but provided here for documentation purposes
   */
  getWebhookSetupInstructions(): string {
    return `
      To set up the Fonnte webhook:
      1. Log in to your Fonnte dashboard
      2. Go to Settings > Webhook
      3. Enter your webhook URL: https://your-domain.com/api/whatsapp-webhook
      4. Save the settings
    `;
  }
}

// Create a singleton instance
let fonnteService: FonnteService | null = null;

/**
 * Get the Fonnte service instance
 * @param apiKey Optional API key (will use env variable if not provided)
 */
export function getFonnteService(apiKey?: string): FonnteService {
  if (!fonnteService) {
    const key = apiKey || import.meta.env.VITE_FONNTE_API_KEY;
    if (!key) {
      throw new Error("Fonnte API key is not defined");
    }
    fonnteService = new FonnteService(key);
  }
  return fonnteService;
}

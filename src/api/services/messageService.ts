import { env } from '../../config/env';
import { type CommunicationMessage } from '../../components/CommunicationPanel';
import { AuthUtils } from '../../utils/authUtils';

export interface MessageResponse {
  error: boolean;
  data: any[];
  message?: string;
}

class MessageService {
  private getAuthToken(): string {
    return AuthUtils.getAuthToken();
  }

  private convertTimestamp(timestamp: string): Date {
    if (!timestamp) {
      return new Date();
    }

    const apiTime = new Date(timestamp);

    // Check if the timestamp is valid
    if (isNaN(apiTime.getTime())) {
      console.warn("⚠️ Invalid timestamp from API:", timestamp);
      return new Date(); // fallback to current time
    }

    const localOffset = 60 * 60 * 1000; // 1 hour in milliseconds
    const adjustedTimestamp = new Date(apiTime.getTime() + localOffset);

    return adjustedTimestamp;
  }

  async getMessages(webSeqId: number): Promise<CommunicationMessage[]> {
    try {
      console.log("💬 Loading messages for webSeqId:", webSeqId);

      const response = await fetch(
        `${env.jagotaApi.baseUrl}/v1/es/eshipping/message?webSeqId=${webSeqId}`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthToken(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.error && data.data) {
        // Convert API data to CommunicationMessage format
        const convertedMessages: CommunicationMessage[] = data.data.map(
          (msg: any) => {
            const timestamp = this.convertTimestamp(msg.createdOn);

            return {
              // API Properties (จากข้อมูลจริง)
              seqId: msg.seqId,
              source: msg.source as "WEB" | "JAGOTA",
              message: msg.message,
              createdBy: msg.createdBy,
              createdOn: msg.createdOn,
              readFlag: msg.readFlag as "Y" | "N",

              // UI Properties (สำหรับแสดงผล)
              id: msg.seqId.toString(),
              content: msg.message,
              sender: (msg.source === "WEB" ? "shipping" : "jagota") as
                | "shipping"
                | "jagota",
              senderName: msg.createdBy,
              timestamp: timestamp,
              read: msg.readFlag === "Y",
              type: "general" as const,
            };
          }
        );

        // Sort messages by timestamp (newest first)
        convertedMessages.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        console.log("✅ Messages loaded successfully:", convertedMessages.length, "messages");
        return convertedMessages;
      } else {
        console.log("ℹ️ No messages found for webSeqId:", webSeqId);
        return [];
      }
    } catch (error) {
      console.error("❌ Failed to load messages:", error);
      return [];
    }
  }

  async sendMessage(webSeqId: number, message: string): Promise<boolean> {
    try {
      console.log("📤 Sending message for webSeqId:", webSeqId);

      const response = await fetch(
        `${env.jagotaApi.baseUrl}/v1/es/eshipping/message`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthToken(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            webSeqId: webSeqId,
            message: message.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Message sent successfully:", result);
      return true;
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      return false;
    }
  }
}

export const messageService = new MessageService();

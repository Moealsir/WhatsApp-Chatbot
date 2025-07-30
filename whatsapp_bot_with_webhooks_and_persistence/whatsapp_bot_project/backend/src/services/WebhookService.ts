import axios from 'axios';
import { logger } from '../utils/logger';

export interface WebhookPayload {
  sessionId: string;
  message: string;
  from: string;
  to: string;
  messageDetails: any;
}

export interface WebhookDeliveryLog {
  id: string;
  timestamp: Date;
  url: string;
  payload: WebhookPayload;
  success: boolean;
  error?: string;
  responseTime?: number;
}

export class WebhookService {
  private static instance: WebhookService;
  private deliveryLogs: WebhookDeliveryLog[] = [];
  private maxLogEntries = 100;

  private constructor() {}

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  async sendWebhook(payload: WebhookPayload, webhookUrls: string[]): Promise<void> {
    if (!webhookUrls || webhookUrls.length === 0) {
      logger.info('No webhook URLs configured, skipping webhook delivery');
      return;
    }

    // Send webhooks to all configured URLs in parallel
    const promises = webhookUrls.map(url => this.sendToSingleWebhook(payload, url));
    await Promise.allSettled(promises);
  }

  private async sendToSingleWebhook(payload: WebhookPayload, url: string): Promise<void> {
    const logEntry: WebhookDeliveryLog = {
      id: this.generateId(),
      timestamp: new Date(),
      url,
      payload,
      success: false
    };

    const startTime = Date.now();

    try {
      logger.info(`Sending webhook to ${url} for session ${payload.sessionId}`);
      
      const response = await axios.post(url, payload, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp-Bot-Webhook/1.0'
        }
      });

      logEntry.success = true;
      logEntry.responseTime = Date.now() - startTime;
      
      logger.info(`Webhook delivered successfully to ${url} (${logEntry.responseTime}ms)`);
    } catch (error) {
      logEntry.success = false;
      logEntry.responseTime = Date.now() - startTime;
      logEntry.error = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Failed to deliver webhook to ${url}: ${logEntry.error}`);
    }

    this.addToLog(logEntry);
  }

  async testWebhook(url: string): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const testPayload: WebhookPayload = {
      sessionId: 'test_session',
      message: 'This is a test message from WhatsApp Bot',
      from: '1234567890@c.us',
      to: 'test_bot@c.us',
      messageDetails: {
        id: 'test_message_id',
        type: 'chat',
        timestamp: Date.now(),
        body: 'This is a test message from WhatsApp Bot'
      }
    };

    const startTime = Date.now();

    try {
      const response = await axios.post(url, testPayload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WhatsApp-Bot-Webhook-Test/1.0'
        }
      });

      return {
        success: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  }

  getDeliveryLogs(): WebhookDeliveryLog[] {
    return [...this.deliveryLogs].reverse(); // Return newest first
  }

  clearDeliveryLogs(): void {
    this.deliveryLogs = [];
    logger.info('Webhook delivery logs cleared');
  }

  private addToLog(entry: WebhookDeliveryLog): void {
    this.deliveryLogs.push(entry);
    
    // Keep only the last maxLogEntries
    if (this.deliveryLogs.length > this.maxLogEntries) {
      this.deliveryLogs = this.deliveryLogs.slice(-this.maxLogEntries);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}


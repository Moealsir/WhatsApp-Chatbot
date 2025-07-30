import { Request, Response } from 'express';
import { WebhookService } from '../services/WebhookService';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

export class WebhookController {
  private webhookService: WebhookService;
  private configFilePath: string;

  constructor() {
    this.webhookService = WebhookService.getInstance();
    this.configFilePath = path.join(process.cwd(), '.env');
  }

  /**
   * @swagger
   * /api/webhook/settings:
   *   get:
   *     summary: Get current webhook settings
   *     tags: [Webhook]
   *     responses:
   *       200:
   *         description: Current webhook settings
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     webhookUrls:
   *                       type: array
   *                       items:
   *                         type: string
   */
  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        data: {
          webhookUrls: config.webhookUrls
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * @swagger
   * /api/webhook/settings:
   *   post:
   *     summary: Update webhook settings
   *     tags: [Webhook]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               webhookUrls:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of webhook URLs
   *     responses:
   *       200:
   *         description: Settings updated successfully
   *       400:
   *         description: Invalid request data
   */
  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { webhookUrls } = req.body;

      if (!Array.isArray(webhookUrls)) {
        res.status(400).json({
          success: false,
          error: 'webhookUrls must be an array'
        });
        return;
      }

      // Validate URLs
      const validUrls = webhookUrls.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      if (validUrls.length !== webhookUrls.length) {
        res.status(400).json({
          success: false,
          error: 'All webhook URLs must be valid URLs'
        });
        return;
      }

      // Update config
      config.webhookUrls = validUrls;

      // Update .env file
      await this.updateEnvFile('WEBHOOK_URLS', validUrls.join(','));

      res.json({
        success: true,
        message: 'Webhook settings updated successfully',
        data: {
          webhookUrls: config.webhookUrls
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * @swagger
   * /api/webhook/test:
   *   post:
   *     summary: Test webhook delivery
   *     tags: [Webhook]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               url:
   *                 type: string
   *                 description: Webhook URL to test
   *     responses:
   *       200:
   *         description: Test result
   *       400:
   *         description: Invalid URL
   */
  testWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: 'URL is required'
        });
        return;
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        res.status(400).json({
          success: false,
          error: 'Invalid URL format'
        });
        return;
      }

      const result = await this.webhookService.testWebhook(url);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * @swagger
   * /api/webhook/logs:
   *   get:
   *     summary: Get webhook delivery logs
   *     tags: [Webhook]
   *     responses:
   *       200:
   *         description: Webhook delivery logs
   */
  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = this.webhookService.getDeliveryLogs();
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * @swagger
   * /api/webhook/logs:
   *   delete:
   *     summary: Clear webhook delivery logs
   *     tags: [Webhook]
   *     responses:
   *       200:
   *         description: Logs cleared successfully
   */
  clearLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      this.webhookService.clearDeliveryLogs();
      
      res.json({
        success: true,
        message: 'Webhook delivery logs cleared'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  private async updateEnvFile(key: string, value: string): Promise<void> {
    try {
      let envContent = '';
      
      // Read existing .env file if it exists
      if (fs.existsSync(this.configFilePath)) {
        envContent = fs.readFileSync(this.configFilePath, 'utf8');
      }

      const lines = envContent.split('\n');
      const keyIndex = lines.findIndex(line => line.startsWith(`${key}=`));

      if (keyIndex >= 0) {
        // Update existing key
        lines[keyIndex] = `${key}=${value}`;
      } else {
        // Add new key
        lines.push(`${key}=${value}`);
      }

      // Write back to file
      fs.writeFileSync(this.configFilePath, lines.join('\n'));
    } catch (error) {
      console.error('Error updating .env file:', error);
      throw new Error('Failed to update configuration file');
    }
  }
}


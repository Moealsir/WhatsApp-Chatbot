import { Router } from "express";
import { WhatsAppController } from "../controllers/WhatsAppController";
import { WebhookController } from "../controllers/WebhookController";
import { upload } from "../middlewares/upload";

const router = Router();
const whatsappController = new WhatsAppController();
const webhookController = new WebhookController();

// Session routes
router.post("/sessions", whatsappController.createSession);
router.get("/sessions", whatsappController.getAllSessions);
router.get("/sessions/:sessionId", whatsappController.getSessionStatus);
router.post("/sessions/:sessionId/logout", whatsappController.logout);
router.delete("/sessions/:sessionId", whatsappController.destroySession);

// Message routes
router.post(
  "/sessions/:sessionId/send-text",
  whatsappController.sendTextMessage
);
router.post(
  "/sessions/:sessionId/send-media",
  upload.single("file"),
  whatsappController.sendMediaMessage
);

// Webhook routes
router.get("/webhook/settings", webhookController.getSettings);
router.post("/webhook/settings", webhookController.updateSettings);
router.post("/webhook/test", webhookController.testWebhook);
router.get("/webhook/logs", webhookController.getLogs);
router.delete("/webhook/logs", webhookController.clearLogs);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "WhatsApp API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;

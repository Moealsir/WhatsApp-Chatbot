import { Router } from "express";
import { WhatsAppController } from "../controllers/WhatsAppController";
import { upload } from "../middlewares/upload";
import { authenticate } from "../middlewares/auth";

const router = Router();
const whatsappController = new WhatsAppController();

// Session routes
router.post("/sessions", whatsappController.createSession);
router.get("/sessions", whatsappController.getAllSessions);
router.get("/sessions/:sessionId", whatsappController.getSessionStatus);
router.post("/sessions/:sessionId/logout", whatsappController.logout);
router.delete("/sessions/:sessionId", whatsappController.destroySession);

// Message routes
router.post(
  "/sessions/:sessionId/send-text",
  authenticate,
  whatsappController.sendTextMessage
);
router.post(
  "/sessions/:sessionId/send-media",
  authenticate,
  upload.single("file"),
  whatsappController.sendMediaMessage
);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "WhatsApp API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;

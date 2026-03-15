import { Router } from "express";
import {
  isGoogleCalendarConnected,
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  disconnectGoogleCalendar,
} from "../services/google-calendar";

const router = Router();

router.get("/google-calendar/status", (_req, res) => {
  res.json({ connected: isGoogleCalendarConnected() });
});

router.get("/google-calendar/auth-url", (_req, res) => {
  const url = getGoogleAuthUrl();
  res.json({ url });
});

router.get("/google-calendar/callback", async (req, res): Promise<void> => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }
  try {
    await exchangeCodeForTokens(code);
    res.send(`
      <html>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f8f9fa;">
          <div style="text-align:center;">
            <h2 style="color:#16a34a;">Google Calendar Connected!</h2>
            <p>You can close this window and return to the app.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`
      <html>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f8f9fa;">
          <div style="text-align:center;">
            <h2 style="color:#dc2626;">Connection Failed</h2>
            <p>Could not connect Google Calendar. Please try again.</p>
          </div>
        </body>
      </html>
    `);
  }
});

router.post("/google-calendar/disconnect", (_req, res) => {
  disconnectGoogleCalendar();
  res.json({ connected: false });
});

export default router;

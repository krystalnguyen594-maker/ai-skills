import http from "node:http";
import { EvalDatabase } from "./db/database.ts";
import { generatePeriodicReport } from "./services/report-generator.ts";
import { sendReportEmail } from "./services/mailer.ts";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3456;
const db = new EvalDatabase();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const method = req.method || "GET";

  // Helper to send JSON
  const sendJson = (status: number, data: any) => {
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end(JSON.stringify(data));
  };

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  // Helper to parse JSON body
  const parseBody = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(e);
        }
      });
      req.on("error", reject);
    });
  };

  try {
    // 1. Healthcheck
    if (url.pathname === "/health" || url.pathname === "/") {
      return sendJson(200, {
        status: "ok",
        service: "AI Skill Evaluation Central Ingestion Server",
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Ingestion API: POST /api/v1/events
    if (url.pathname === "/api/v1/events" && method === "POST") {
      const body = await parseBody();

      // Basic schema validation
      if (!body.event_id || !body.skill_id || !body.result || !body.task_type) {
        return sendJson(400, {
          error: "Invalid Event Payload: Thiếu các trường bắt buộc (event_id, skill_id, result, task_type)",
        });
      }

      const saveResult = db.saveEvent({
        event_id: body.event_id,
        task_id: body.task_id || "anonymous-task",
        skill_id: body.skill_id,
        skill_version: body.skill_version || "1.0.0",
        task_type: body.task_type,
        timestamp: body.timestamp || new Date().toISOString(),
        evaluation_status: body.evaluation_status || "evaluated",
        result: body.result,
        score: typeof body.score === "number" ? body.score : 0,
        evaluation_method: body.evaluation_method || "hybrid",
        rework_required: Boolean(body.rework_required),
        feedback: body.feedback || null,
        issues: Array.isArray(body.issues) ? body.issues : [],
        client_info: body.client_info,
      });

      if (saveResult.isDuplicate) {
        return sendJson(200, {
          status: "ignored_duplicate",
          message: `Event ID ${body.event_id} đã tồn tại trong database (Idempotent skip).`,
        });
      }

      return sendJson(201, {
        status: "created",
        message: `Đã tiếp nhận thành công event ${body.event_id}`,
        eventId: body.event_id,
      });
    }

    // 3. Query Events: GET /api/v1/events
    if (url.pathname === "/api/v1/events" && method === "GET") {
      const events = db.getEvents(50);
      return sendJson(200, { total: events.length, events });
    }

    // 4. Metrics: GET /api/v1/metrics
    if (url.pathname === "/api/v1/metrics" && method === "GET") {
      const metrics = db.getMetricsSummary();
      return sendJson(200, metrics);
    }

    // 5. Trigger Report: POST /api/v1/reports/generate
    if (url.pathname === "/api/v1/reports/generate" && method === "POST") {
      const report = generatePeriodicReport(db);
      const emailResult = await sendReportEmail(report);
      return sendJson(200, {
        status: "generated",
        reportId: report.id,
        markdownPath: report.markdownPath,
        htmlPath: report.htmlPath,
        emailDelivery: emailResult,
      });
    }

    // 404 Not Found
    return sendJson(404, { error: "Endpoint not found" });
  } catch (error: any) {
    console.error("Server Error:", error);
    return sendJson(500, { error: error.message || "Internal Server Error" });
  }
});

server.listen(PORT, () => {
  console.log(`\n\x1b[32m✔ Central Ingestion Server đang chạy tại http://localhost:${PORT}\x1b[0m`);
  console.log(`- Health Check:      http://localhost:${PORT}/health`);
  console.log(`- Ingestion API:     POST http://localhost:${PORT}/api/v1/events`);
  console.log(`- Metrics Summary:   GET http://localhost:${PORT}/api/v1/metrics`);
  console.log(`- Tạo Báo Cáo Ngay:  POST http://localhost:${PORT}/api/v1/reports/generate\n`);

  // Start background weekly interval (Simulated scheduler)
  // Check every 24h or run on schedule
  setInterval(() => {
    console.log("[Scheduler] Kích hoạt kiểm tra chu kỳ báo cáo tự động...");
  }, 24 * 60 * 60 * 1000);
});

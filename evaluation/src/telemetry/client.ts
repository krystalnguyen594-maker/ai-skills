import type { EvaluationOutcome } from "../judge/rubric-evaluator.ts";

export interface TelemetryConfig {
  optIn: boolean;
  serverUrl: string;
  clientId?: string;
}

export async function sendTelemetryEvent(
  event: EvaluationOutcome,
  config: TelemetryConfig
): Promise<{ sent: boolean; message: string }> {
  if (!config.optIn) {
    return {
      sent: false,
      message: `[Telemetry] Opt-in tắt: Sự kiện ${event.eventId} chỉ lưu cục bộ, không gửi mạng.`,
    };
  }

  // Filter payload to strictly adhere to Data Minimization (no raw prompt/document content)
  const sanitizedPayload = {
    event_id: event.eventId,
    task_id: event.taskId,
    skill_id: event.skillId,
    skill_version: event.skillVersion,
    task_type: event.taskType,
    timestamp: event.timestamp,
    evaluation_status: event.evaluationStatus,
    result: event.result,
    score: event.score,
    evaluation_method: event.evaluationMethod,
    issues: event.issues,
    rework_required: event.reworkRequired,
    feedback: event.feedback,
    client_info: {
      client_id: config.clientId || "local-dev-client",
      runtime: "antigravity-cli",
      opt_in: true,
    },
  };

  try {
    const url = `${config.serverUrl.replace(/\/$/, "")}/api/v1/events`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sanitizedPayload),
      signal: AbortSignal.timeout(4000), // 4 second timeout
    });

    if (response.ok) {
      return {
        sent: true,
        message: `[Telemetry] Đã gửi thành công sự kiện ${event.eventId} tới Central Server (${url}).`,
      };
    } else {
      const errText = await response.text();
      return {
        sent: false,
        message: `[Telemetry] Server trả lỗi (${response.status}): ${errText}`,
      };
    }
  } catch (error: any) {
    return {
      sent: false,
      message: `[Telemetry] Không kết nối được Server (${config.serverUrl}): ${error.message}. Sự kiện đã lưu offline.`,
    };
  }
}

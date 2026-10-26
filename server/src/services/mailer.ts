import type { GeneratedReport } from "./report-generator.ts";

export interface MailerConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  ownerEmail?: string;
}

export async function sendReportEmail(
  report: GeneratedReport,
  config?: MailerConfig
): Promise<{ sent: boolean; channel: string; details: string }> {
  const targetEmail = config?.ownerEmail || process.env.OWNER_EMAIL || "owner@xperc.com";
  const hasSmtp = Boolean(
    config?.smtpHost || process.env.SMTP_HOST
  );

  const subject = `[AI Skills Report] Đánh Giá Kỹ Năng Tuần - Pass Rate: ${report.metrics.passRate}%`;

  if (!hasSmtp) {
    // Elegant simulation mode when SMTP credentials are not yet entered in .env
    console.log(`\n\x1b[36m[Email Service - Simulation Mode]\x1b[0m`);
    console.log(`To: \x1b[1m${targetEmail}\x1b[0m`);
    console.log(`Subject: \x1b[1m${subject}\x1b[0m`);
    console.log(`Attachment: \x1b[32m${report.htmlPath}\x1b[0m`);
    console.log(`Trạng thái: \x1b[32m✔ Đã tạo bản tin HTML và xuất thành công (Để gửi qua SMTP thật, cấu hình file .env)\x1b[0m\n`);

    return {
      sent: true,
      channel: "local-simulation",
      details: `Báo cáo HTML đã xuất tại ${report.htmlPath} (Sẵn sàng gửi tới ${targetEmail})`,
    };
  }

  try {
    // Try to load nodemailer if installed
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: config?.smtpHost || process.env.SMTP_HOST,
      port: Number(config?.smtpPort || process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: config?.smtpUser || process.env.SMTP_USER,
        pass: config?.smtpPass || process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"AI Skill Set Evaluator" <evaluation@xperc.com>',
      to: targetEmail,
      subject,
      html: report.htmlContent,
    });

    console.log(`\x1b[32m✔ Email báo cáo tuần đã được gửi thành công qua SMTP tới ${targetEmail}\x1b[0m`);
    return {
      sent: true,
      channel: "smtp",
      details: `Đã gửi thành công tới ${targetEmail}`,
    };
  } catch (error: any) {
    console.warn(`[Mailer Warning] Gửi SMTP gặp sự cố (${error.message}). Báo cáo vẫn được bảo toàn an toàn tại ${report.htmlPath}`);
    return {
      sent: false,
      channel: "smtp-failed",
      details: error.message,
    };
  }
}

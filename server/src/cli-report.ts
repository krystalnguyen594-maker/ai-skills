import { EvalDatabase } from "./db/database.ts";
import { generatePeriodicReport } from "./services/report-generator.ts";
import { sendReportEmail } from "./services/mailer.ts";

async function main() {
  console.log("\n\x1b[1m\x1b[34m[Report Engine] Đang tổng hợp dữ liệu từ SQLite Database...\x1b[0m");
  const db = new EvalDatabase();
  const report = generatePeriodicReport(db);

  console.log(`\x1b[32m✔ Đã tạo báo cáo Markdown tại: \x1b[1m${report.markdownPath}\x1b[0m`);
  console.log(`\x1b[32m✔ Đã tạo báo cáo HTML tại:     \x1b[1m${report.htmlPath}\x1b[0m`);

  console.log("\n\x1b[1m\x1b[34m[Email Dispatcher] Đang tiến hành phân phối báo cáo...\x1b[0m");
  await sendReportEmail(report);
}

main().catch((err) => {
  console.error("Lỗi tạo báo cáo:", err);
  process.exit(1);
});

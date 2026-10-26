import fs from "node:fs";
import path from "node:path";
import { EvalDatabase } from "../db/database.ts";

export interface GeneratedReport {
  id: string;
  reportingWindow: string;
  generatedAt: string;
  markdownPath: string;
  htmlPath: string;
  markdownContent: string;
  htmlContent: string;
  metrics: any;
}

export function generatePeriodicReport(db: EvalDatabase): GeneratedReport {
  const metrics = db.getMetricsSummary();
  const skillMetrics = db.getSkillMetrics();
  const now = new Date();
  const id = `report-${now.toISOString().slice(0, 10)}-${Date.now().toString().slice(-4)}`;
  const reportingWindow = `7 Ngày Qua (${now.toISOString().slice(0, 10)})`;
  const generatedAt = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const rootDir = process.cwd();
  const reportsDir = path.join(rootDir, "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filenameBase = `weekly-${now.toISOString().slice(0, 10)}`;
  const mdPath = path.join(reportsDir, `${filenameBase}.md`);
  const htmlPath = path.join(reportsDir, `${filenameBase}.html`);

  // Build Markdown content
  let md = `# Báo Cáo Định Kỳ Đánh Giá Hiệu Quả AI Skills (Executive Weekly Report)
*Thời điểm tạo: ${generatedAt} | Chu kỳ: ${reportingWindow}*

---

## 1. Tóm Tắt Tổng Quan (Executive Summary)
- **Tổng số tác vụ đánh giá (Evaluated Tasks):** **${metrics.totalEvents}** sự kiện.
- **Tỷ lệ Đạt Chuẩn (Task Pass Rate):** **${metrics.passRate}%** (${metrics.passCount} đạt / ${metrics.failCount} không đạt).
- **Tỷ lệ Cần Chỉnh Sửa (Rework Rate):** **${metrics.reworkRate}%** tác vụ.
- **Trạng thái tổng thể:** ${metrics.passRate >= 80 ? "🟢 **TỐT & ỔN ĐỊNH**" : "🟡 **CẦN ĐIỀU CHỈNH SKILL PROMPT**"}

---

## 2. Thống Kê Chi Tiết Theo Kỹ Năng & Phiên Bản
| Kỹ Năng (Skill) | Phiên Bản | Loại Tác Vụ | Đạt / Tổng | Điểm TB | Tỷ Lệ Đạt (Pass Rate) | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${skillMetrics.length > 0 ? skillMetrics.map((s: any) => `| \`${s.skill_id}\` | ${s.skill_version} | ${s.task_type} | ${s.pass_count}/${s.total_events} | ${s.avg_score}/100 | ${s.pass_rate}% | ${s.pass_rate >= 80 ? "Đạt chuẩn" : s.pass_rate >= 50 ? "Khá / Monitor" : "Cần tinh chỉnh"} |`).join("\n") : "| `chưa có dữ liệu` | - | - | 0/0 | - | 0% | - |"}

---

## 3. Các Vấn Đề Thường Gặp (Top Issues & Errors)
${
  metrics.topIssues.length > 0
    ? metrics.topIssues
        .map(
          (item: any, idx: number) =>
            `${idx + 1}. **\`${item.issue_code}\`**: Xuất hiện **${item.freq}** lần (${Math.round(
              (item.freq / (metrics.totalEvents || 1)) * 100
            )}% tổng số tác vụ).`
        )
        .join("\n")
    : "- Không có lỗi nghiêm trọng nào được ghi nhận."
}

---

## 4. Giả Thuyết Nguyên Nhân Gốc Rễ (Root-Cause Hypotheses)
- **Thiếu kịch bản Gherkin hoặc tiêu chí kiểm thử:** Thường xảy ra khi người dùng đưa đầu bài vắn tắt, AI có xu hướng bỏ qua Given-When-Then nếu không có ràng buộc chặt trong cấu trúc prompt.
- **Rò rỉ code kỹ thuật vào tài liệu nghiệp vụ (FRD):** AI có thói quen viết câu lệnh SQL/DDL hoặc code mẫu thay vì viết quy tắc logic nghiệp vụ nếu prompt yêu cầu có tính chất kỹ thuật.

---

## 5. Đề Xuất Cải Tiến Cho Repo Owner (Recommended Actions)
1. **Cập nhật \`SKILL.md\` cho \`documentation-analysis\`:** Bổ sung lời nhắc cấm viết câu lệnh SQL vào mục FRD và bắt buộc tạo block Gherkin cho 100% User Stories.
2. **Bổ sung benchmark case:** Thêm kịch bản kiểm thử tình huống người dùng chỉ cung cấp 1 dòng yêu cầu mơ hồ để đo lường khả năng chủ động đặt câu hỏi của AI.
3. **Chạy đối chứng hồi quy (Regression Benchmark):** Sau khi sửa prompt \`SKILL.md\`, chạy lại lệnh \`npm run eval documentation-analysis\` để xác nhận pass rate cải thiện.

---

## 6. Chất Lượng Dữ Liệu & Giới Hạn Đo Lường (Data Quality & Limitations)
- **Chính sách thu thập:** Strict Data Minimization (chỉ thu thập metadata và issue codes, không lưu trữ văn bản nhạy cảm của người dùng).
- **Cỡ mẫu (Sample Size):** ${metrics.totalEvents} events. ${metrics.totalEvents < 10 ? "⚠️ Cỡ mẫu còn nhỏ (< 10), cần thêm dữ liệu để kết luận có tính đại diện cao." : "Dữ liệu đủ độ tin cậy để đánh giá xu hướng."}
`;

  // Build Modern HTML Content for Email & Browser
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>AI Skills Weekly Evaluation Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 32px; border: 1px solid #e2e8f0; }
    h1 { color: #0f172a; font-size: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-top: 0; }
    h2 { color: #1e3a8a; font-size: 18px; margin-top: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
    .metric-card { background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; }
    .metric-value { font-size: 28px; font-weight: bold; color: #2563eb; margin: 4px 0; }
    .metric-label { font-size: 13px; color: #64748b; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    th { background: #f8fafc; color: #475569; }
    .issue-tag { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Báo Cáo Định Kỳ Đánh Giá Hiệu Quả AI Skills</h1>
    <p style="color: #64748b; font-size: 14px;">Thời điểm tạo: <strong>${generatedAt}</strong> | Chu kỳ: <strong>${reportingWindow}</strong></p>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">TỔNG SỐ TÁC VỤ</div>
        <div class="metric-value">${metrics.totalEvents}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">TỶ LỆ ĐẠT (PASS RATE)</div>
        <div class="metric-value" style="color: ${metrics.passRate >= 80 ? "#16a34a" : "#ca8a04"};">${metrics.passRate}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">TỶ LỆ REWORK</div>
        <div class="metric-value" style="color: #ea580c;">${metrics.reworkRate}%</div>
      </div>
    </div>

    <h2>1. Danh Sách Kỹ Năng Đo Lường (Skill Health Matrix)</h2>
    <table>
      <thead>
        <tr>
          <th>Kỹ Năng</th>
          <th>Phiên Bản</th>
          <th>Tác Vụ</th>
          <th>Đạt / Tổng</th>
          <th>Điểm TB</th>
          <th>Tỷ Lệ</th>
        </tr>
      </thead>
      <tbody>
        ${
          skillMetrics.length > 0
            ? skillMetrics
                .map(
                  (s: any) => `
        <tr>
          <td><strong>${s.skill_id}</strong></td>
          <td>${s.skill_version}</td>
          <td>${s.task_type}</td>
          <td>${s.pass_count} / ${s.total_events}</td>
          <td>${s.avg_score}/100</td>
          <td><span class="badge ${s.pass_rate >= 80 ? "badge-green" : s.pass_rate >= 50 ? "badge-yellow" : "badge-red"}">${s.pass_rate}%</span></td>
        </tr>`
                )
                .join("")
            : `<tr><td colspan="6">Chưa có dữ liệu</td></tr>`
        }
      </tbody>
    </table>

    <h2>2. Top Lỗi Thường Gặp (Top Issues)</h2>
    ${
      metrics.topIssues.length > 0
        ? `<ul>${metrics.topIssues
            .map(
              (item: any) =>
                `<li><span class="issue-tag">${item.issue_code}</span>: Gặp <strong>${item.freq}</strong> lần</li>`
            )
            .join("")}</ul>`
        : `<p style="color: #16a34a;">Không ghi nhận lỗi nghiêm trọng nào.</p>`
    }

    <h2>3. Đề Xuất Cải Tiến Cho Repo Owner</h2>
    <ol>
      <li><strong>Cập nhật SKILL.md:</strong> Thắt chặt ràng buộc không đưa DDL/SQL vào FRD.</li>
      <li><strong>Yêu cầu Gherkin bắt buộc:</strong> Bổ sung cú pháp Given-When-Then mẫu vào hướng dẫn PRD.</li>
      <li><strong>Chạy Benchmark Đối Chứng:</strong> Dùng lệnh <code>npm run eval documentation-analysis</code> để kiểm tra trước/sau khi sửa.</li>
    </ol>

    <div class="footer">
      Báo cáo được tạo tự động bởi AI Skill Evaluation System (Central Platform) • Chính sách: Strict Data Minimization
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(mdPath, md, "utf-8");
  fs.writeFileSync(htmlPath, html, "utf-8");

  db.saveReport({
    id,
    reporting_window: reportingWindow,
    generated_at: generatedAt,
    total_events: metrics.totalEvents,
    pass_rate: metrics.passRate,
    rework_rate: metrics.reworkRate,
    markdown_path: mdPath,
    html_path: htmlPath,
    email_status: "pending",
  });

  return {
    id,
    reportingWindow,
    generatedAt,
    markdownPath: mdPath,
    htmlPath: htmlPath,
    markdownContent: md,
    htmlContent: html,
    metrics,
  };
}

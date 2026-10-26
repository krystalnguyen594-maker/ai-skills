import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

interface SkillDef {
  id: string;
  title: string;
  description: string;
  taskType: string;
  taskName: string;
  requiredSections: { pattern: string; name: string; severity: "critical" | "major" | "minor" }[];
  prohibitedPatterns: { pattern: string; issue_code: string; description: string; severity: "critical" | "major" | "minor" }[];
  benchmark: {
    name: string;
    prompt: string;
    goodOutput: string;
    flawedOutput: string;
  };
}

const skillsConfig: Record<string, SkillDef> = {
  "bug-reporting": {
    id: "bug-reporting",
    title: "Bug Reporting Quality Rubric",
    description: "Evaluates bug reports for actionable reproduction steps, environment details, expected vs actual behavior, and severity ranking.",
    taskType: "bug_report",
    taskName: "Defect & Bug Report",
    requiredSections: [
      { pattern: "SEV-\\d|severity|mức độ", name: "Severity Header", severity: "critical" },
      { pattern: "environment|môi trường", name: "Environment Details", severity: "major" },
      { pattern: "steps to reproduce|các bước tái hiện", name: "Steps to Reproduce", severity: "critical" },
      { pattern: "expected|kết quả mong đợi", name: "Expected Behavior", severity: "critical" },
      { pattern: "actual|thực tế", name: "Actual Behavior", severity: "critical" },
      { pattern: "evidence|bằng chứng", name: "Evidence / Logs / Screenshots", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "không chạy|bị lỗi|hỏng|doesn't work|not working", issue_code: "vague_defect_description", description: "Báo cáo lỗi không được chỉ ghi mơ hồ không chạy mà phải có chi tiết.", severity: "critical" },
    ],
    benchmark: {
      name: "Cart Total Mismatch Bug Report",
      prompt: "Viết báo cáo lỗi khi tổng tiền giỏ hàng hiển thị sai sau khi xóa 1 sản phẩm.",
      goodOutput: "### [SEV-2] Tổng tiền giỏ hàng không tự động cập nhật sau khi xóa sản phẩm\n\n**Environment:** Chrome 124, macOS Sonoma, Staging build #482, User: Normal Buyer\n\n**Steps to reproduce:**\n1. Đăng nhập và thêm 2 sản phẩm (Sản phẩm A 100k, Sản phẩm B 200k) vào giỏ hàng.\n2. Vào trang Giỏ hàng (/cart), quan sát tổng tiền hiển thị là 300.000đ.\n3. Bấm icon Thùng rác để xóa Sản phẩm A.\n4. Xác nhận modal 'Bạn có chắc muốn xóa?'.\n\n**Expected:** Sản phẩm A biến mất, tổng tiền giỏ hàng tự động trừ đi 100k và hiển thị 200.000đ.\n**Actual:** Sản phẩm A biến mất nhưng tổng tiền vẫn giữ nguyên là 300.000đ cho đến khi F5 lại trang.\n\n**Evidence:** Console log: `Uncaught TypeError: updateSubtotal is not a function at cart.js:142`.\n**Frequency:** Luôn luôn xảy ra (5/5 lần thử).\n**Scope:** Ảnh hưởng toàn bộ người dùng Desktop Web trên trang giỏ hàng.",
      flawedOutput: "# Lỗi web giỏ hàng\nNó bị lỗi không chạy được, tính sai tiền. Sửa gấp dùm.",
    },
  },
  "technical-design": {
    id: "technical-design",
    title: "Technical Design & Architecture Document Rubric",
    description: "Evaluates technical architecture proposals, ADRs, trade-off matrices, and non-functional requirements.",
    taskType: "tech_design",
    taskName: "Technical Architecture & Design",
    requiredSections: [
      { pattern: "problem|vấn đề", name: "Problem Definition", severity: "critical" },
      { pattern: "constraints|ràng buộc", name: "Constraints", severity: "major" },
      { pattern: "non-functional|phi chức năng", name: "Non-Functional Requirements", severity: "major" },
      { pattern: "options|phương án|trade-off", name: "Trade-off Matrix & Options", severity: "critical" },
      { pattern: "decision|quyết định", name: "Selected Decision & Rationale", severity: "critical" },
      { pattern: "rollout|rollback|kế hoạch triển khai", name: "Rollout & Rollback Plan", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "chỉ có 1 cách|không có lựa chọn khác|only option", issue_code: "missing_trade_off_analysis", description: "Bắt buộc phải so sánh ít nhất 2 phương án kỹ thuật.", severity: "major" },
    ],
    benchmark: {
      name: "High Throughput Notification Queue Design",
      prompt: "Thiết kế kỹ thuật cho hệ thống gửi thông báo Push Notification 10.000 req/s.",
      goodOutput: "# Design: High-Throughput Notification Queue Service\n\n## Problem\nHệ thống hiện tại gửi thông báo đồng bộ qua REST API khiến thread pool bị nghẽn khi có flash sale.\n\n## Constraints\nNgân sách hạ tầng cố định, độ trễ gửi thông báo < 2 giây, thời gian hoàn thành 2 tuần.\n\n## Non-functional requirements\nThroughput >= 10,000 msg/sec, 99.9% delivery SLA, Zero message loss on server restart.\n\n## Options considered\n| Tiêu chí | Phương án A (RabbitMQ) | Phương án B (Redis Streams) |\n| :--- | :--- | :--- |\n| Throughput | 25,000 msg/s | 50,000 msg/s |\n| Độ phức tạp | Cần cụm cluster riêng | Dùng chung Redis có sẵn |\n\n## Decision\nChọn Phương án B (Redis Streams) do tận dụng được hạ tầng Redis có sẵn và đáp ứng dư thừa throughput.\n\n## Design\nProducer đẩy message vào Stream `notif_events`. Worker pool gồm 8 consumers đọc theo consumer group.\n\n## Rollout & Rollback\nCanary deploy 10% traffic ngày 1. Rollback bằng cách tắt feature flag `use_redis_queue`.",
      flawedOutput: "# Thiết kế hệ thống\nCài Redis rồi bắn message qua là xong.",
    },
  },
  "pm-questioning": {
    id: "pm-questioning",
    title: "PM Critical Questioning & Risk Assessment Rubric",
    description: "Evaluates PM critical thinking, root-cause 5 Whys, Pre-Mortem analysis, and constructive pushback.",
    taskType: "pm_critique",
    taskName: "PM Risk Assessment & Critical Critique",
    requiredSections: [
      { pattern: "first principles|nguyên lý đầu tiên|cốt lõi", name: "First Principles Deconstruction", severity: "critical" },
      { pattern: "pre-mortem|tiền tử|giả định thất bại", name: "Pre-Mortem Failure Analysis", severity: "critical" },
      { pattern: "5 whys|tại sao|root cause", name: "5 Whys Deep Dive", severity: "major" },
      { pattern: "second-order|hệ quả cấp hai", name: "Second-Order Consequences", severity: "major" },
      { pattern: "pushback|đề xuất thay thế|trade-off", name: "Constructive Pushback & Alternative", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "đồng ý hoàn toàn|làm luôn không cần hỏi|cứ thế mà làm", issue_code: "lack_of_critical_questioning", description: "PM không được gật đầu mù quáng mà phải phản biện rủi ro.", severity: "critical" },
    ],
    benchmark: {
      name: "Feature Proposal Critique: AI Chatbot in Checkout",
      prompt: "Phản biện đề xuất đưa AI Chatbot tư vấn trực tiếp vào trang thanh toán checkout.",
      goodOutput: "# PM Critical Analysis: Đề Xuất Tích Hợp AI Chatbot Trong Trang Checkout\n\n## 1. First Principles Deconstruction\nMục tiêu tối thượng của trang Checkout là tối thiểu hóa sự phân tâm để người dùng hoàn tất thanh toán nhanh nhất. Việc thêm chatbot làm phân tán chú ý và tăng thời gian dừng (friction).\n\n## 2. 5 Whys Deep Dive\nTại sao cần chatbot ở checkout? -> Khách hỏi phí ship. Tại sao khách hỏi phí ship? -> Vì trang checkout không hiển thị bảng tính phí ship tự động. Gốc rễ: Cần hiển thị rõ phí ship, không phải cần chatbot.\n\n## 3. Pre-Mortem Failure Simulation\nGiả định 6 tháng nữa tính năng này thất bại thảm hại: Tỷ lệ bỏ giỏ hàng tăng 15% vì khách mải chat với bot hoặc bot hallucinate đưa ra mã giảm giá sai khiến khách khiếu nại.\n\n## 4. Second-Order Consequences\nPhát sinh chi phí token LLM cho mỗi lượt thanh toán, tăng tải server và phát sinh rủi ro bảo mật lộ thông tin đơn hàng.\n\n## 5. Constructive Pushback & Simpler Alternative\nKhông nên nhúng bot vào checkout. Thay vào đó, thiết kế widget FAQ thu gọn và tự động hiển thị phí ship + chính sách đổi trả minh bạch.",
      flawedOutput: "# Đồng ý\nTính năng này hay, bắt trend AI. Cứ làm luôn đi.",
    },
  },
  "ai-agile-evaluator": {
    id: "ai-agile-evaluator",
    title: "Agile Competency Evaluation Rubric",
    description: "Evaluates Agile competency scenarios, rubric-based grading for BA/QC candidates, and anti-theory testing.",
    taskType: "agile_evaluation",
    taskName: "Agile Scenario & Competency Assessment",
    requiredSections: [
      { pattern: "candidate|level|fresher|junior|middle|senior", name: "Target Candidate Role & Level", severity: "critical" },
      { pattern: "scenario|tình huống thực tế", name: "Realistic Dilemma Scenario", severity: "critical" },
      { pattern: "scorecard|rubric|thang điểm", name: "Structured Scorecard & Rubric Breakdown", severity: "critical" },
      { pattern: "actionable feedback|nhận xét cụ thể", name: "Actionable Feedback", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "invest là gì|user story là gì|định nghĩa scrum", issue_code: "theoretical_copy_paste_question", description: "Cấm hỏi định nghĩa lý thuyết suông, bắt buộc dùng tình huống thực chiến.", severity: "critical" },
    ],
    benchmark: {
      name: "Senior BA Agile Scenario Interview",
      prompt: "Đánh giá năng lực giải quyết tình huống của Senior BA khi đối mặt với rủi ro đa tenant.",
      goodOutput: "# Đánh Giá Năng Lực Agile: Senior BA\n\n## 1. Target Role & Level\nỨng viên: Senior Business Analyst (Mức độ phức tạp: Rất cao - Kiến trúc đa tổ chức Multi-tenant).\n\n## 2. Realistic Dilemma Scenario\nTech Lead thông báo: 'Sprint tới chúng ta nâng cấp sang hạ tầng multi-tenant. Nếu BA lấy yêu cầu sai, dữ liệu công ty A sẽ rò rỉ sang công ty B'. Bạn xử lý thế nào?\n\n## 3. Structured Scorecard & Rubric Breakdown\n| Tiêu chí | Điểm (1-5) | Bằng chứng |\n| :--- | :--- | :--- |\n| Tư duy First Principles | 4/5 | Đã bóc tách rõ ranh giới tenant logic và tenant vật lý |\n| Nhận diện rủi ro bảo mật | 5/5 | Thiết lập quy tắc dữ liệu WORM và ma trận phân quyền RBAC |\n| Chuẩn Gherkin AC | 4/5 | Viết chi tiết Given-When-Then cho tình huống truy cập chéo space |\n\n## 4. Actionable Feedback\nỨng viên thể hiện tư duy kiến trúc xuất sắc, điểm tổng 13/15 (Đạt chuẩn Senior BA).",
      flawedOutput: "# Phỏng vấn BA\nHỏi: Mô hình INVEST là gì? Em hãy đọc thuộc lòng định nghĩa.",
    },
  },
  "doc-writing-process": {
    id: "doc-writing-process",
    title: "Document Writing 2-Tier Sub-agent Process Rubric",
    description: "Evaluates the document writing phase discovery, drafting, sub-agent peer critique, and sign-off gate.",
    taskType: "doc_process",
    taskName: "Phased Document Drafting & Review Process",
    requiredSections: [
      { pattern: "phase|giai đoạn", name: "Phased Workflow Definition", severity: "critical" },
      { pattern: "discovery|thu thập", name: "Discovery & Input Gate", severity: "major" },
      { pattern: "peer review|critique|phản biện", name: "Sub-agent Peer Review", severity: "critical" },
      { pattern: "sign-off|duyệt|acceptance gate", name: "Sign-off & Quality Gate", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "viết 1 lèo xong luôn|không cần review", issue_code: "skip_review_gate", description: "Bắt buộc phải có cổng phản biện sub-agent.", severity: "critical" },
    ],
    benchmark: {
      name: "SOP Document Writing Pipeline",
      prompt: "Quy trình soạn thảo tài liệu 3 bước có cổng duyệt chất lượng.",
      goodOutput: "# Quy Trình Soạn Thảo Tài Liệu Kỹ Thuật (Doc Writing Pipeline)\n\n## Phase 1: Discovery & Cognitive Baseline\nXác định rõ đối tượng độc giả (Executive hay Dev) và neo nhận thức (Minto Pyramid).\n\n## Phase 2: Drafting & Structured Content\nSoạn thảo sườn chính, tách bạch yêu cầu chức năng và yêu cầu phi chức năng.\n\n## Phase 3: Sub-agent Peer Review & Red Teaming\nChuyển bản thảo cho Sub-agent đóng vai QC/Lead Dev để bới lông tìm vết, bắt các điểm mơ hồ.\n\n## Phase 4: Sign-off & Final Acceptance Gate\nKiểm tra lại toàn bộ Traceability Matrix trước khi chính thức bàn giao.",
      flawedOutput: "# Viết tài liệu\nCứ ngồi gõ 1 lèo cho xong rồi nộp luôn.",
    },
  },
  "testing-quality": {
    id: "testing-quality",
    title: "Quality Engineering & Test Automation Rubric",
    description: "Evaluates automated API/UI test suites, Playwright/Cypress patterns, test fixtures, and teardown cleanup.",
    taskType: "test_automation",
    taskName: "Test Automation Spec & Quality Gates",
    requiredSections: [
      { pattern: "test case|kịch bản", name: "Structured Test Cases", severity: "critical" },
      { pattern: "assertion|expect|kiểm tra kết quả", name: "Deterministic Assertions", severity: "critical" },
      { pattern: "fixture|setup|data seed", name: "Test Fixture & Dynamic Data Seed", severity: "major" },
      { pattern: "teardown|cleanup|dọn dẹp", name: "Teardown & Cleanup Mechanism", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "hardcode id|sleep\\(10000\\)|chờ bừa", issue_code: "flaky_test_pattern", description: "Cấm hardcode ID tĩnh và sleep vô tội vạ gây flaky test.", severity: "critical" },
    ],
    benchmark: {
      name: "Playwright API Automation Spec for User Creation",
      prompt: "Viết kịch bản tự động hóa kiểm thử API Tạo User bằng Playwright có teardown.",
      goodOutput: "# Test Spec: API Create User Automation\n\n## 1. Test Setup & Fixtures\nSử dụng `@faker-js/faker` để sinh email ngẫu nhiên `test_${Date.now()}@example.com`.\n\n## 2. Test Execution & Assertions\n```typescript\ntest('TC-01: Create user with valid payload returns 201', async ({ request }) => {\n  const res = await request.post('/api/v1/users', { data: payload });\n  expect(res.status()).toBe(201);\n  const body = await res.json();\n  expect(body.user.email).toBe(payload.email);\n});\n```\n\n## 3. Teardown & Cleanup\nSau mỗi test run, lưu lại `createdUserId` và gọi `DELETE /api/v1/users/:id` để dọn dẹp sạch database.",
      flawedOutput: "# Test script\nChạy API thấy trả về ok là được. Không cần xóa dữ liệu rác.",
    },
  },
  "debugging-rca": {
    id: "debugging-rca",
    title: "Root Cause Analysis (RCA) & Debugging Rubric",
    description: "Evaluates incident debugging, 5 Whys analysis, timeline reconstruction, and preventative action items.",
    taskType: "rca_analysis",
    taskName: "Incident Root Cause Analysis",
    requiredSections: [
      { pattern: "timeline|dòng thời gian|diễn biến", name: "Incident Timeline", severity: "major" },
      { pattern: "symptom vs cause|triệu chứng|nguyên nhân", name: "Symptom vs Cause Separation", severity: "critical" },
      { pattern: "5 whys|tại sao", name: "5 Whys Analysis", severity: "critical" },
      { pattern: "action items|phòng ngừa|remedy", name: "Preventative Action Items (CAPA)", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "do người dùng dùng sai|lỗi do sơ suất cá nhân", issue_code: "blaming_individual_anti_pattern", description: "RCA phải phân tích lỗi hệ thống, không đổ lỗi cá nhân.", severity: "major" },
    ],
    benchmark: {
      name: "Payment Gateway Timeout Incident RCA",
      prompt: "Viết báo cáo RCA cho sự cố nghẽn cổng thanh toán giờ cao điểm.",
      goodOutput: "# RCA: Sự Cố Nghẽn Cổng Thanh Toán Ngày 15/10\n\n## 1. Incident Timeline\n- 11:45: Lưu lượng checkout tăng gấp 4 lần.\n- 11:50: Tỷ lệ timeout tăng lên 35%.\n- 12:15: Tăng pool kết nối database, hệ thống ổn định trở lại.\n\n## 2. Symptom vs. Cause\n- Triệu chứng: Người dùng nhận mã lỗi 504 Gateway Timeout.\n- Nguyên nhân gốc: Connection pool của database bị cạn kiệt do query đối soát thiếu index.\n\n## 3. 5 Whys Analysis\nTại sao timeout? -> Cạn pool DB. Tại sao cạn? -> Query chạy mất 8s. Tại sao mất 8s? -> Full table scan. Tại sao full table scan? -> Thiếu index cột `order_status`.\n\n## 4. Preventative Action Items\n1. Tạo index `idx_orders_status` (Hoàn thành ngay).\n2. Thiết lập alert Prometheus khi pool đạt ngưỡng 80%.",
      flawedOutput: "# Báo cáo lỗi\nHôm qua web bị chậm. Chắc do mạng lag thôi.",
    },
  },
  "work-breakdown": {
    id: "work-breakdown",
    title: "Work Breakdown Structure (WBS) & Story Slicing Rubric",
    description: "Evaluates Epic deconstruction, vertical story slicing, dependency mapping, and acceptance criteria.",
    taskType: "wbs_planning",
    taskName: "Work Breakdown & Story Slicing",
    requiredSections: [
      { pattern: "epic|tổng quan dự án", name: "Epic Scope Definition", severity: "major" },
      { pattern: "user stories|story slicing|phân rã", name: "Vertical User Story Slicing", severity: "critical" },
      { pattern: "dependencies|phụ thuộc", name: "Cross-team Dependencies", severity: "critical" },
      { pattern: "estimate|độ phức tạp|story points", name: "Complexity / Sizing Estimates", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "cắt theo tầng|story chỉ làm fe|story chỉ làm be", issue_code: "horizontal_slicing_anti_pattern", description: "Bắt buộc cắt Story theo chiều dọc (Vertical Slice) mang lại giá trị độc lập.", severity: "critical" },
    ],
    benchmark: {
      name: "User Onboarding Epic Breakdown",
      prompt: "Phân rã Epic Đăng ký và Xác thực người dùng mới thành các User Story triển khai được.",
      goodOutput: "# WBS: Epic User Registration & Verification\n\n## 1. Epic Definition\nCung cấp luồng đăng ký tài khoản tự phục vụ và xác thực email trong vòng 2 phút.\n\n## 2. Vertical Sliced Stories\n- **Story 1 (P0): Đăng ký bằng Email & Mật khẩu cơ bản** (Trọn gói UI + API + Lưu DB).\n- **Story 2 (P1): Gửi mã OTP kích hoạt qua Email** (Tích hợp SendGrid + Validate OTP).\n- **Story 3 (P2): Đăng ký nhanh qua Google OAuth**.\n\n## 3. Dependencies & Risks\nPhụ thuộc tài khoản dịch vụ SendGrid đã duyệt SPF/DKIM.\n\n## 4. Estimates & Milestones\nTổng dung lượng: 13 Story Points, bàn giao trong Sprint 24.",
      flawedOutput: "# Chia task\nTask 1: Dev làm database. Task 2: Dev làm backend. Task 3: Làm frontend.",
    },
  },
  "ui-ux-design": {
    id: "ui-ux-design",
    title: "Modern UI/UX Design System Rubric",
    description: "Evaluates modern aesthetics, design tokens, color harmony, typography, and interactive micro-animations.",
    taskType: "ui_ux_spec",
    taskName: "UI/UX Design Specification",
    requiredSections: [
      { pattern: "design tokens|color palette|bảng màu", name: "Curated Design Tokens & Palette", severity: "critical" },
      { pattern: "typography|phông chữ|font", name: "Typography Scale (Google Fonts)", severity: "major" },
      { pattern: "glassmorphism|gradient|visual hierarchy", name: "Rich Visual Aesthetics & Depth", severity: "major" },
      { pattern: "micro-animation|transition|hover effect", name: "Dynamic Micro-animations & States", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "màu đỏ cờ|màu xanh lá tươi|plain red|plain blue", issue_code: "generic_color_anti_pattern", description: "Cấm dùng màu mặc định nguyên thủy, phải dùng curated HSL palette.", severity: "major" },
    ],
    benchmark: {
      name: "SaaS Analytics Dashboard UI Tokens",
      prompt: "Thiết kế hệ thống Design Tokens và bảng màu cao cấp cho SaaS Analytics Dashboard.",
      goodOutput: "# UI/UX Design Spec: SaaS Analytics Dashboard\n\n## 1. Curated Color Palette (Dark Mode First)\n- **Background Primary:** `hsl(222, 47%, 11%)` (Deep Slate)\n- **Card Surface:** `rgba(30, 41, 59, 0.7)` kèm `backdrop-filter: blur(12px)` (Glassmorphism)\n- **Primary Accent:** `hsl(217, 91%, 60%)` gradient sang `hsl(270, 95%, 65%)` (Electric Violet)\n\n## 2. Typography Scale\nFont: Inter (Google Fonts), scale rõ ràng từ 12px (Caption) đến 32px (Header Display).\n\n## 3. Micro-animations & Interactions\nHover card: `transform: translateY(-2px)`, transition `cubic-bezier(0.4, 0, 0.2, 1) 200ms`.\nLoading skeleton: Shimmer gradient mượt mà.",
      flawedOutput: "# Thiết kế giao diện\nDùng màu đỏ và xanh lá cây. Nền trắng chữ đen cơ bản.",
    },
  },
  "feynman-explainer": {
    id: "feynman-explainer",
    title: "Feynman Technique Explanation Rubric",
    description: "Evaluates clear, jargon-free explanations using vivid analogies and simple everyday language.",
    taskType: "feynman_explanation",
    taskName: "Feynman Technique Explanation",
    requiredSections: [
      { pattern: "ngôn ngữ bình dân|plain language|khái niệm", name: "Jargon-free Core Concept", severity: "critical" },
      { pattern: "ví von|ẩn dụ|analogy", name: "Real-world Relatable Analogy", severity: "critical" },
      { pattern: "gỡ rối|lỗ hổng|misconception", name: "Addressing Common Misconceptions", severity: "major" },
      { pattern: "tóm tắt 1 câu|takeaway", name: "One-sentence Simple Takeaway", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "dùng thuật ngữ khó hiểu mà không giải thích", issue_code: "unexplained_academic_jargon", description: "Cấm ném thuật ngữ học thuật phức tạp mà không cắt nghĩa bình dân.", severity: "critical" },
    ],
    benchmark: {
      name: "Explain Database Indexing to a 10-year-old",
      prompt: "Giải thích cơ chế Index trong cơ sở dữ liệu theo kỹ thuật Feynman.",
      goodOutput: "# Giải Thích Cơ Chế Database Index Theo Kỹ Thuật Feynman\n\n## 1. Khái Niệm Bình Dân\nIndex trong cơ sở dữ liệu giống hệt như **Mục Lục ở cuối cuốn từ điển dày 1000 trang**.\n\n## 2. Ẩn Dụ Trực Quan\nNếu không có mục lục, muốn tìm từ 'Mèo', bạn phải lật từng trang từ trang 1 đến trang 1000 (gọi là Full Table Scan). Nhờ có mục lục xếp theo chữ cái A-Z, bạn chỉ cần 3 giây để biết từ 'Mèo' nằm ở trang 450.\n\n## 3. Gỡ Rối Nhầm Lẫn\nTại sao không đánh index cho tất cả các cột? Vì mỗi lần bạn thêm 1 từ mới vào sách, bạn phải viết lại mục lục. Quá nhiều mục lục sẽ làm chậm việc ghi sách (tốn bộ nhớ và chậm lệnh Insert/Update).\n\n## 4. Tóm Tắt 1 Câu\nIndex là chiếc bản đồ phím tắt giúp tìm dữ liệu trong chớp mắt mà không phải lật từng trang.",
      flawedOutput: "# Database Index\nIndex là cấu trúc dữ liệu B-Tree lưu trữ các con trỏ trỏ tới khối dữ liệu vật lý trên ổ đĩa SSD.",
    },
  },
};

// Generic generator for other skills that don't have hardcoded custom rules yet
function generateGenericSkill(skillId: string): SkillDef {
  return {
    id: skillId,
    title: `${skillId.replace(/-/g, " ").toUpperCase()} Quality Rubric`,
    description: `Standardized rubric and quality criteria for auditing and executing the ${skillId} skill.`,
    taskType: `${skillId.replace(/-/g, "_")}_task`,
    taskName: `${skillId.replace(/-/g, " ")} execution`,
    requiredSections: [
      { pattern: "overview|tổng quan|bối cảnh", name: "Context & Objectives", severity: "major" },
      { pattern: "guidelines|nguyên tắc|quy tắc", name: "Core Principles & Guidelines", severity: "critical" },
      { pattern: "step|quy trình|thực hiện", name: "Step-by-step Execution", severity: "critical" },
      { pattern: "output|kết quả|deliverable", name: "Standard Deliverable Output", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "làm qua loa|không rõ ràng|tùy ý", issue_code: "vague_execution", description: "Bắt buộc phải có hướng dẫn và kết quả cụ thể.", severity: "major" },
    ],
    benchmark: {
      name: `Baseline Test for ${skillId}`,
      prompt: `Thực hiện một kịch bản chuẩn cho kỹ năng ${skillId}.`,
      goodOutput: `# Kế Hoạch Thực Thi Kỹ Năng: ${skillId}\n\n## 1. Bối Cảnh & Mục Tiêu\nXác định rõ ràng phạm vi bài toán và tiêu chí thành công.\n\n## 2. Nguyên Tắc Cốt Lõi\nTuân thủ nghiêm ngặt các hướng dẫn và rào cản chất lượng.\n\n## 3. Quy Trình Các Bước Thực Hiện\n1. Bước 1: Tiếp nhận và phân tích thông tin đầu vào.\n2. Bước 2: Thực thi theo khung tiêu chuẩn.\n3. Bước 3: Rà soát kiểm tra chất lượng trước khi bàn giao.\n\n## 4. Kết Quả Bàn Giao Hoàn Chỉnh\nĐầy đủ bằng chứng, dữ liệu và tài liệu bàn giao cụ thể.`,
      flawedOutput: `# Làm việc\nCứ làm đại khái là được.`,
    },
  };
}

async function main() {
  const rootSkillsDir = path.join(process.cwd(), "skills");
  const allSkills = fs.readdirSync(rootSkillsDir).filter((f) => fs.statSync(path.join(rootSkillsDir, f)).isDirectory());

  console.log(`Bắt đầu thiết lập hệ thống Evaluation cho ${allSkills.length} skills...`);

  let createdCount = 0;

  for (const skill of allSkills) {
    const skillDir = path.join(rootSkillsDir, skill);
    const evalYamlPath = path.join(skillDir, "evaluation.yaml");
    const benchmarksDir = path.join(skillDir, "benchmarks");

    // Skip documentation-analysis as it already has bespoke rubrics and benchmarks
    if (skill === "documentation-analysis") {
      console.log(`- [SKIP] ${skill} (Đã có sẵn rubric và benchmarks hoàn chỉnh)`);
      continue;
    }

    const config = skillsConfig[skill] || generateGenericSkill(skill);

    // 1. Create evaluation.yaml
    const yamlData = {
      skill_id: config.id,
      skill_version: "1.0.0",
      title: config.title,
      description: config.description,
      task_types: [
        {
          id: config.taskType,
          name: config.taskName,
          required_sections: config.requiredSections,
        },
      ],
      prohibited_patterns: {
        [config.taskType]: config.prohibitedPatterns,
      },
      rubric_dimensions: [
        { dimension: "completeness", name: "Độ Đầy Đủ (Completeness)", weight: 0.3 },
        { dimension: "soundness", name: "Tính Chặt Chẽ & Đúng Đắn (Soundness)", weight: 0.35 },
        { dimension: "actionability", name: "Tính Khả Thi & Hành Động (Actionability)", weight: 0.2 },
        { dimension: "clarity", name: "Định Dạng & Rõ Ràng (Clarity)", weight: 0.15 },
      ],
      scoring: {
        pass_threshold: 80,
        scale: 100,
        critical_issue_behavior: "instant_fail",
      },
    };

    fs.writeFileSync(evalYamlPath, yaml.stringify(yamlData), "utf-8");

    // 2. Create benchmarks directory & tc-01-baseline.json
    if (!fs.existsSync(benchmarksDir)) {
      fs.mkdirSync(benchmarksDir, { recursive: true });
    }

    const benchmarkData = {
      id: "tc-01",
      name: config.benchmark.name,
      task_type: config.taskType,
      prompt: config.benchmark.prompt,
      expected_sections: config.requiredSections.map((s) => s.name),
      sample_good_output: config.benchmark.goodOutput,
      sample_flawed_output: config.benchmark.flawedOutput,
    };

    fs.writeFileSync(
      path.join(benchmarksDir, "tc-01-baseline.json"),
      JSON.stringify(benchmarkData, null, 2),
      "utf-8"
    );

    createdCount++;
    console.log(`✔ [CREATED] ${skill} (evaluation.yaml + tc-01-baseline.json)`);
  }

  console.log(`\nHoàn thành! Đã thiết lập evaluation thành công cho ${createdCount} skills còn lại.`);
}

main().catch(console.error);

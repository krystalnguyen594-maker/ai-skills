import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

interface BenchmarkCaseDef {
  name: string;
  prompt: string;
  goodOutput: string;
  flawedOutput: string;
}

interface SkillDef {
  id: string;
  title: string;
  description: string;
  taskType: string;
  taskName: string;
  requiredSections: { pattern: string; name: string; severity: "critical" | "major" | "minor" }[];
  prohibitedPatterns: { pattern: string; issue_code: string; description: string; severity: "critical" | "major" | "minor" }[];
  benchmarkBaseline: BenchmarkCaseDef;
  benchmarkRealistic: BenchmarkCaseDef;
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
    benchmarkBaseline: {
      name: "Cart Total Mismatch Bug Report",
      prompt: "Viết báo cáo lỗi khi tổng tiền giỏ hàng hiển thị sai sau khi xóa 1 sản phẩm.",
      goodOutput: "### [SEV-2] Tổng tiền giỏ hàng không tự động cập nhật sau khi xóa sản phẩm\n\n**Environment:** Chrome 124, macOS Sonoma, Staging build #482, User: Normal Buyer\n\n**Steps to reproduce:**\n1. Đăng nhập và thêm 2 sản phẩm (Sản phẩm A 100k, Sản phẩm B 200k) vào giỏ hàng.\n2. Vào trang Giỏ hàng (/cart), quan sát tổng tiền hiển thị là 300.000đ.\n3. Bấm icon Thùng rác để xóa Sản phẩm A.\n4. Xác nhận modal 'Bạn có chắc muốn xóa?'.\n\n**Expected:** Sản phẩm A biến mất, tổng tiền giỏ hàng tự động trừ đi 100k và hiển thị 200.000đ.\n**Actual:** Sản phẩm A biến mất nhưng tổng tiền vẫn giữ nguyên là 300.000đ cho đến khi F5 lại trang.\n\n**Evidence:** Console log: `Uncaught TypeError: updateSubtotal is not a function at cart.js:142`.\n**Frequency:** Luôn luôn xảy ra (5/5 lần thử).\n**Scope:** Ảnh hưởng toàn bộ người dùng Desktop Web trên trang giỏ hàng.",
      flawedOutput: "# Lỗi web giỏ hàng\nNó bị lỗi không chạy được, tính sai tiền. Sửa gấp dùm.",
    },
    benchmarkRealistic: {
      name: "Payment 3D-Secure Webhook Race Condition Bug Report",
      prompt: "Báo cáo lỗi race condition giữa webhook ngân hàng và redirect URL khiến trạng thái đơn hàng bị kẹt 'Pending Payment'.",
      goodOutput: "### [SEV-1] Race Condition giữa Webhook VNPay và Return URL dẫn đến kẹt trạng thái đơn hàng 'Pending'\n\n**Environment:** Production K8s cluster, iOS Safari 17.4 & Chrome 124, Gateway: VNPay Sandbox/Live v2.1\n\n**Steps to reproduce:**\n1. Tạo đơn hàng giá trị 1.500.000đ với phương thức thanh toán VNPay QR.\n2. Quét mã QR trên app ngân hàng và xác thực OTP 3D-Secure thành công.\n3. Ngay khi app ngân hàng báo thành công, nhấn lập tức nút 'Quay lại Merchant' trước khi IPN webhook kịp gửi tới server (độ trễ mạng ~800ms).\n4. Kiểm tra trang Lịch sử đơn hàng `/orders/me`.\n\n**Expected:** Đơn hàng hiển thị trạng thái `PAID` và kích hoạt luồng xuất kho tự động.\n**Actual:** Giao diện hiển thị đơn hàng `PENDING_PAYMENT`, khách hàng bị trừ tiền trong tài khoản ngân hàng nhưng hệ thống không ghi nhận giao dịch thành công.\n\n**Evidence:** Log server: `DB deadlock on Order #94821: Transaction rolled back while executing updateOrderStatus(PAID)`. Trả về HTTP 500 cho Webhook retry.\n**Scope:** Tần suất ~4.2% các giao dịch thanh toán QR giờ cao điểm.",
      flawedOutput: "# Lỗi thanh toán\nKhách bảo bị trừ tiền mà đơn không nhận. Hệ thống bị lỗi không chạy đúng.",
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
    benchmarkBaseline: {
      name: "High Throughput Notification Queue Design",
      prompt: "Thiết kế kỹ thuật cho hệ thống gửi thông báo Push Notification 10.000 req/s.",
      goodOutput: "# Design: High-Throughput Notification Queue Service\n\n## Problem\nHệ thống hiện tại gửi thông báo đồng bộ qua REST API khiến thread pool bị nghẽn khi có flash sale.\n\n## Constraints\nNgân sách hạ tầng cố định, độ trễ gửi thông báo < 2 giây, thời gian hoàn thành 2 tuần.\n\n## Non-functional requirements\nThroughput >= 10,000 msg/sec, 99.9% delivery SLA, Zero message loss on server restart.\n\n## Options considered\n| Tiêu chí | Phương án A (RabbitMQ) | Phương án B (Redis Streams) |\n| :--- | :--- | :--- |\n| Throughput | 25,000 msg/s | 50,000 msg/s |\n| Độ phức tạp | Cần cụm cluster riêng | Dùng chung Redis có sẵn |\n\n## Decision\nChọn Phương án B (Redis Streams) do tận dụng được hạ tầng Redis có sẵn và đáp ứng dư thừa throughput.\n\n## Design\nProducer đẩy message vào Stream `notif_events`. Worker pool gồm 8 consumers đọc theo consumer group.\n\n## Rollout & Rollback\nCanary deploy 10% traffic ngày 1. Rollback bằng cách tắt feature flag `use_redis_queue`.",
      flawedOutput: "# Thiết kế hệ thống\nCài Redis rồi bắn message qua là xong.",
    },
    benchmarkRealistic: {
      name: "Multi-Region Distributed Database Replication ADR",
      prompt: "Thiết kế kiến trúc sao chép dữ liệu đa vùng (Multi-Region) đảm bảo RPO < 1s và RTO < 30s.",
      goodOutput: "# Architecture Decision Record (ADR): Multi-Region Active-Passive Database Failover\n\n## Problem\nCụm PostgreSQL chính đặt tại Singapore (ap-southeast-1) gặp rủi ro đứt cáp quang biển hoặc outage vùng, cần cơ chế failover sang Tokyo (ap-northeast-1) tự động.\n\n## Constraints\n- Ngân sách hạ tầng dưới $5,000/tháng.\n- Tuân thủ quy định bảo mật dữ liệu tài chính (Zero Plaintext Cross-border Transfer).\n\n## Non-functional Requirements\n- **RPO (Recovery Point Objective):** < 1 giây.\n- **RTO (Recovery Time Objective):** < 30 giây.\n- **Data Consistency:** Read-after-write consistency cho session người dùng.\n\n## Options Considered & Trade-off Matrix\n| Tiêu chí | Phương án 1: CockroachDB Distributed SQL | Phương án 2: Aurora Global Database (PostgreSQL) |\n| :--- | :--- | :--- |\n| Độ trễ ghi | Cao (Consensus Raft roundtrip ~65ms) | Thấp (Replication vật lý bất đồng bộ < 1s) |\n| Chi phí di chuyển | Viết lại schema và ORM | Tương thích 100% PostgreSQL hiện tại |\n| RTO failover | Tự động tức thì (< 3s) | Chuyển vùng qua Route53 DNS switch (~25s) |\n\n## Decision\nLựa chọn **Phương án 2: Aurora Global Database**. Đáp ứng trọn vẹn SLA RPO < 1s và RTO < 30s trong khi không phải viết lại tầng Data Access Layer.\n\n## Rollout & Rollback Plan\n1. Bước 1: Thiết lập cụm Replica tại Tokyo, đồng bộ dữ liệu ngầm.\n2. Bước 2: Diễn tập Disaster Recovery GameDay vào cuối tuần.\n3. Rollback: Nếu quá trình promote replica thất bại, giữ nguyên master Singapore và phục hồi từ Snapshot PITR.",
      flawedOutput: "# Kiến trúc đa vùng\nChỉ có 1 cách duy nhất là dùng CockroachDB thôi, không có lựa chọn nào khác.",
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
    benchmarkBaseline: {
      name: "Feature Proposal Critique: AI Chatbot in Checkout",
      prompt: "Phản biện đề xuất đưa AI Chatbot tư vấn trực tiếp vào trang thanh toán checkout.",
      goodOutput: "# PM Critical Analysis: Đề Xuất Tích Hợp AI Chatbot Trong Trang Checkout\n\n## 1. First Principles Deconstruction\nMục tiêu tối thượng của trang Checkout là tối thiểu hóa sự phân tâm để người dùng hoàn tất thanh toán nhanh nhất. Việc thêm chatbot làm phân tán chú ý và tăng thời gian dừng (friction).\n\n## 2. 5 Whys Deep Dive\nTại sao cần chatbot ở checkout? -> Khách hỏi phí ship. Tại sao khách hỏi phí ship? -> Vì trang checkout không hiển thị bảng tính phí ship tự động. Gốc rễ: Cần hiển thị rõ phí ship, không phải cần chatbot.\n\n## 3. Pre-Mortem Failure Simulation\nGiả định 6 tháng nữa tính năng này thất bại thảm hại: Tỷ lệ bỏ giỏ hàng tăng 15% vì khách mải chat với bot hoặc bot hallucinate đưa ra mã giảm giá sai khiến khách khiếu nại.\n\n## 4. Second-Order Consequences\nPhát sinh chi phí token LLM cho mỗi lượt thanh toán, tăng tải server và phát sinh rủi ro bảo mật lộ thông tin đơn hàng.\n\n## 5. Constructive Pushback & Simpler Alternative\nKhông nên nhúng bot vào checkout. Thay vào đó, thiết kế widget FAQ thu gọn và tự động hiển thị phí ship + chính sách đổi trả minh bạch.",
      flawedOutput: "# Đồng ý\nTính năng này hay, bắt trend AI. Cứ làm luôn đi.",
    },
    benchmarkRealistic: {
      name: "Critical Review on Removing SMS OTP for In-App Biometrics",
      prompt: "Phản biện đề xuất của Ban Giám đốc về việc loại bỏ hoàn toàn mã SMS OTP và chỉ dùng FaceID/Vân tay để tiết kiệm chi phí viễn thông.",
      goodOutput: "# PM Critical Pushback: Đề Xuất Bỏ Hoàn Toàn SMS OTP Để Cắt Giảm Chi Phí\n\n## 1. First Principles Deconstruction\nBản chất của xác thực giao dịch tài chính là nguyên lý 'Something you have' và 'Something you are'. Biometrics chỉ chứng minh chủ thiết bị đang cầm máy, không chứng minh được sự đồng thuận giao dịch nếu thiết bị bị root/jailbreak.\n\n## 2. 5 Whys Root Cause Analysis\n- Tại sao muốn bỏ SMS OTP? -> Tiết kiệm 400 triệu đồng tiền tin nhắn viễn thông mỗi tháng.\n- Tại sao chi phí viễn thông cao? -> Gửi OTP cho mọi giao dịch kể cả dưới 50.000đ.\n- Gốc rễ: Do chiến lược phân tầng rủi ro (Risk-based Authentication) chưa có, chứ không phải do bản thân kênh SMS.\n\n## 3. Pre-Mortem Analysis (Kịch bản thất bại sau 3 tháng)\nNếu bỏ hẳn SMS OTP: Khách hàng lớn tuổi dùng điện thoại không hỗ trợ FaceID sẽ không thể chuyển tiền; tài khoản bị tấn công Session Hijacking sẽ mất trắng tiền mà không hề nhận được cảnh báo ngoại vi (out-of-band notification).\n\n## 4. Second-Order Consequences\nTỷ lệ churn khách hàng phân khúc trên 45 tuổi tăng 22%; chi phí xử lý khiếu nại của tổng đài CSKH tăng gấp 3 lần số tiền tiết kiệm viễn thông.\n\n## 5. Constructive Pushback & Strategic Alternative\nÁp dụng xác thực phân tầng (Risk-based): Miễn xác thực cho giao dịch < 200k với thiết bị tin cậy; dùng Push Notification App Approval cho giao dịch trung bình; chỉ kích hoạt SMS OTP cho giao dịch giá trị cao (> 10 triệu) hoặc thay đổi mật khẩu.",
      flawedOutput: "# Phê duyệt\nSếp bảo tiết kiệm tiền là đúng rồi. Đồng ý hoàn toàn làm luôn không cần hỏi gì thêm.",
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
    benchmarkBaseline: {
      name: "Senior BA Agile Scenario Interview",
      prompt: "Đánh giá năng lực giải quyết tình huống của Senior BA khi đối mặt với rủi ro đa tenant.",
      goodOutput: "# Đánh Giá Năng Lực Agile: Senior BA\n\n## 1. Target Role & Level\nỨng viên: Senior Business Analyst (Mức độ phức tạp: Rất cao - Kiến trúc đa tổ chức Multi-tenant).\n\n## 2. Realistic Dilemma Scenario\nTech Lead thông báo: 'Sprint tới chúng ta nâng cấp sang hạ tầng multi-tenant. Nếu BA lấy yêu cầu sai, dữ liệu công ty A sẽ rò rỉ sang công ty B'. Bạn xử lý thế nào?\n\n## 3. Structured Scorecard & Rubric Breakdown\n| Tiêu chí | Điểm (1-5) | Bằng chứng |\n| :--- | :--- | :--- |\n| Tư duy First Principles | 4/5 | Đã bóc tách rõ ranh giới tenant logic và tenant vật lý |\n| Nhận diện rủi ro bảo mật | 5/5 | Thiết lập quy tắc dữ liệu WORM và ma trận phân quyền RBAC |\n| Chuẩn Gherkin AC | 4/5 | Viết chi tiết Given-When-Then cho tình huống truy cập chéo space |\n\n## 4. Actionable Feedback\nỨng viên thể hiện tư duy kiến trúc xuất sắc, điểm tổng 13/15 (Đạt chuẩn Senior BA).",
      flawedOutput: "# Phỏng vấn BA\nHỏi: Mô hình INVEST là gì? Em hãy đọc thuộc lòng định nghĩa.",
    },
    benchmarkRealistic: {
      name: "Lead QC Chaos Dilemma & Shift-Left Assessment",
      prompt: "Đánh giá năng lực thực chiến của Lead QC trong tình huống Product Owner ép ra mắt tính năng dù tỷ lệ pass automation chỉ đạt 75%.",
      goodOutput: "# Đánh Giá Năng Lực Ứng Viên: Lead QC Engineer\n\n## 1. Target Candidate Role & Level\nVị trí: Lead Quality Control / Quality Assurance Architect (Senior/Lead Level).\n\n## 2. Realistic Dilemma Scenario\nChỉ còn 4 giờ trước đợt Release Black Friday, PO yêu cầu bỏ qua 15 test case bị fail trong bộ hồi quy tự động (Pass rate 75%) vì cho rằng đây là 'lỗi giao diện nhỏ', trong khi QC phát hiện 1 trong số đó là race condition khi áp mã giảm giá đồng thời. Bạn xử lý thế nào giữa áp lực kinh doanh và kỷ luật chất lượng?\n\n## 3. Structured Scorecard & Rubric Breakdown\n| Năng lực then chốt | Điểm (1-5) | Bằng chứng quan sát |\n| :--- | :--- | :--- |\n| Quản trị Rủi ro (Risk-based QA) | 5/5 | Không nói 'Không' cảm tính; lập tức cô lập rủi ro tài chính thành ma trận thiệt hại ước tính ($30,000 thất thoát nếu bị exploit mã voucher) |\n| Kỹ năng Đàm phán Agile | 4/5 | Đề xuất giải pháp dung hòa: Release tính năng với Feature Flag tắt tạm thời voucher code đó để kịp tiến độ marketing |\n| Khả năng Root Cause Tracing | 4/5 | Truy vết ngay log Playwright và chỉ ra nguyên nhân deadlock tại microservice voucher |\n\n## 4. Actionable Feedback & Recommendation\nĐạt yêu cầu xuất sắc (Tổng điểm 13/15). Ứng viên sở hữu bản lĩnh nghề nghiệp vững vàng, không gật đầu mù quáng trước áp lực thời gian.",
      flawedOutput: "# Phỏng vấn QC\nHỏi: Em hãy cho biết định nghĩa Scrum là gì và User Story là gì?",
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
    benchmarkBaseline: {
      name: "SOP Document Writing Pipeline",
      prompt: "Quy trình soạn thảo tài liệu 3 bước có cổng duyệt chất lượng.",
      goodOutput: "# Quy Trình Soạn Thảo Tài Liệu Kỹ Thuật (Doc Writing Pipeline)\n\n## Phase 1: Discovery & Cognitive Baseline\nXác định rõ đối tượng độc giả (Executive hay Dev) và neo nhận thức (Minto Pyramid).\n\n## Phase 2: Drafting & Structured Content\nSoạn thảo sườn chính, tách bạch yêu cầu chức năng và yêu cầu phi chức năng.\n\n## Phase 3: Sub-agent Peer Review & Red Teaming\nChuyển bản thảo cho Sub-agent đóng vai QC/Lead Dev để bới lông tìm vết, bắt các điểm mơ hồ.\n\n## Phase 4: Sign-off & Final Acceptance Gate\nKiểm tra lại toàn bộ Traceability Matrix trước khi chính thức bàn giao.",
      flawedOutput: "# Viết tài liệu\nCứ ngồi gõ 1 lèo cho xong rồi nộp luôn.",
    },
    benchmarkRealistic: {
      name: "Enterprise Architecture Specification Multi-Tier Review Pipeline",
      prompt: "Thiết lập quy trình chuẩn 4 giai đoạn soạn thảo tài liệu kiến trúc hệ thống Core Banking với cổng duyệt phản biện Sub-agent.",
      goodOutput: "# Quy Trình Soạn Thảo Tài Liệu Kiến Trúc Chuẩn Enterprise (Architecture Spec Pipeline)\n\n## Phase 1: Input Discovery & Stakeholder Baselines\nThu thập ràng buộc từ Ngân hàng Nhà nước, SLA thời gian thực (p99 < 50ms), và phỏng vấn C-Level để xác định Business Drivers.\n\n## Phase 2: Structured Architecture Drafting\nSoạn thảo tài liệu theo mô hình C4 (Context, Container, Component, Code), tích hợp đầy đủ ma trận ADR và phân tích chi phí TCO.\n\n## Phase 3: Sub-agent Multi-Role Peer Review & Stress Testing\nTriển khai 2 Sub-agent chuyên biệt:\n- Sub-agent 1 (Security Red Team): Soát lỗ hổng dữ liệu PII và tuân thủ PCI-DSS 4.0.\n- Sub-agent 2 (DevOps Lead): Phản biện tính khả thi triển khai trên Kubernetes và chi phí tài nguyên mạng.\n\n## Phase 4: Sign-off & Quality Gate Thresholds\nĐiều kiện bàn giao: Scorecard đạt tối thiểu 90/100, zero critical findings, có chữ ký điện tử của Lead Architect và Head of Security.",
      flawedOutput: "# Viết tài liệu ngân hàng\nCứ ngồi viết 1 lèo xong luôn rồi gửi sếp ký, không cần review làm gì cho mất thời gian.",
    },
  },

  "testing-quality": {
    id: "testing-quality",
    title: "Quality Engineering & Test Automation Rubric",
    description: "Evaluates automated API/UI test suites, Playwright/Cypress patterns, test fixtures, and teardown cleanup.",
    taskType: "test_automation",
    taskName: "Test Automation Spec & Quality Gates",
    requiredSections: [
      { pattern: "test case|test execution|kịch bản", name: "Structured Test Cases", severity: "critical" },
      { pattern: "assertion|expect|kiểm tra kết quả", name: "Deterministic Assertions", severity: "critical" },
      { pattern: "fixture|setup|data seed", name: "Test Fixture & Dynamic Data Seed", severity: "major" },
      { pattern: "teardown|cleanup|dọn dẹp", name: "Teardown & Cleanup Mechanism", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "hardcode id|sleep\\(10000\\)|chờ bừa", issue_code: "flaky_test_pattern", description: "Cấm hardcode ID tĩnh và sleep vô tội vạ gây flaky test.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "Playwright API Automation Spec for User Creation",
      prompt: "Viết kịch bản tự động hóa kiểm thử API Tạo User bằng Playwright có teardown.",
      goodOutput: "# Test Spec: API Create User Automation\n\n## 1. Test Setup & Fixtures\nSử dụng `@faker-js/faker` để sinh email ngẫu nhiên `test_${Date.now()}@example.com`.\n\n## 2. Test Execution & Assertions\n```typescript\ntest('TC-01: Create user with valid payload returns 201', async ({ request }) => {\n  const res = await request.post('/api/v1/users', { data: payload });\n  expect(res.status()).toBe(201);\n  const body = await res.json();\n  expect(body.user.email).toBe(payload.email);\n});\n```\n\n## 3. Teardown & Cleanup\nSau mỗi test run, lưu lại `createdUserId` và gọi `DELETE /api/v1/users/:id` để dọn dẹp sạch database.",
      flawedOutput: "# Test script\nChạy API thấy trả về ok là được. Không cần xóa dữ liệu rác.",
    },
    benchmarkRealistic: {
      name: "Playwright E2E Idempotent Checkout Automation with Mocked Payment",
      prompt: "Thiết kế bộ kiểm thử tự động hóa E2E cho quy trình Thanh toán đơn hàng có cơ chế dọn dẹp dữ liệu và chống flaky.",
      goodOutput: "# Playwright Automation Spec: Idempotent E2E Checkout Flow\n\n## 1. Test Setup & Dynamic Data Seed Fixtures\nKhởi tạo test runner với tài khoản khách hàng cô lập thông qua fixture API:\n```typescript\ntest.beforeEach(async ({ request, context }) => {\n  const user = await createTestCustomer(request, { balance: 500000 });\n  const item = await seedInventoryItem(request, { stock: 10 });\n  context.setExtraHTTPHeaders({ Authorization: `Bearer ${user.token}` });\n});\n```\n\n## 2. Structured Test Cases & Deterministic Assertions\n```typescript\ntest('TC-E2E-01: Hoàn tất đơn hàng với thẻ tín dụng sandbox', async ({ page }) => {\n  await page.goto('/checkout');\n  await page.getByRole('button', { name: 'Thanh toán' }).click();\n  await expect(page.getByTestId('order-success-badge')).toBeVisible({ timeout: 5000 });\n  await expect(page.getByTestId('order-status')).toHaveText('ĐÃ THANH TOÁN');\n});\n```\n\n## 3. Teardown & Idempotent Cleanup\n```typescript\ntest.afterEach(async ({ request }) => {\n  if (testOrderId) {\n    await request.post(`/api/test/cleanup/orders/${testOrderId}`);\n  }\n});\n```",
      flawedOutput: "# Script test thanh toán\nChạy qua màn hình checkout rồi sleep(10000) chờ bừa xem nó có hiện chữ thành công không. Hardcode id tài khoản 99999.",
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
    benchmarkBaseline: {
      name: "Payment Gateway Timeout Incident RCA",
      prompt: "Viết báo cáo RCA cho sự cố nghẽn cổng thanh toán giờ cao điểm.",
      goodOutput: "# RCA: Sự Cố Nghẽn Cổng Thanh Toán Ngày 15/10\n\n## 1. Incident Timeline\n- 11:45: Lưu lượng checkout tăng gấp 4 lần.\n- 11:50: Tỷ lệ timeout tăng lên 35%.\n- 12:15: Tăng pool kết nối database, hệ thống ổn định trở lại.\n\n## 2. Symptom vs. Cause\n- Triệu chứng: Người dùng nhận mã lỗi 504 Gateway Timeout.\n- Nguyên nhân gốc: Connection pool của database bị cạn kiệt do query đối soát thiếu index.\n\n## 3. 5 Whys Analysis\nTại sao timeout? -> Cạn pool DB. Tại sao cạn? -> Query chạy mất 8s. Tại sao mất 8s? -> Full table scan. Tại sao full table scan? -> Thiếu index cột `order_status`.\n\n## 4. Preventative Action Items\n1. Tạo index `idx_orders_status` (Hoàn thành ngay).\n2. Thiết lập alert Prometheus khi pool đạt ngưỡng 80%.",
      flawedOutput: "# Báo cáo lỗi\nHôm qua web bị chậm. Chắc do mạng lag thôi.",
    },
    benchmarkRealistic: {
      name: "Production Redis Cluster OOM Cascade Incident RCA",
      prompt: "Phân tích nguyên nhân gốc rễ (RCA) cho sự cố cụm Redis Production bị tràn bộ nhớ gây sập hệ thống xác thực người dùng.",
      goodOutput: "# Root Cause Analysis (RCA): Cụm Redis Session Cluster Bị OOM Sập Đồng Loạt\n\n## 1. Incident Timeline\n- 08:30: Bắt đầu chiến dịch Push Notif tặng quà cho 2 triệu user.\n- 08:32: Redis Memory vọt từ 65% lên 98% trong vòng 120 giây.\n- 08:34: Master node kích hoạt cơ chế `maxmemory-policy: noeviction`, từ chối toàn bộ lệnh ghi `OOM command not allowed`.\n- 08:45: Thay đổi cấu hình sang `allkeys-lru` khẩn cấp và flush key tạm, hệ thống phục hồi hoàn toàn.\n\n## 2. Symptom vs. Root Cause\n- **Triệu chứng bên ngoài:** Người dùng mở app bị văng ra màn hình đăng nhập (Session Invalid).\n- **Nguyên nhân gốc rễ:** Tính năng lưu lịch sử đọc thông báo mới deploy tuần trước quên thiết lập TTL (Time To Live), khiến mỗi key tồn tại vĩnh viễn trong RAM.\n\n## 3. 5 Whys Deep Dive\n1. Tại sao Redis bị OOM? -> Số lượng key session tăng đột biến 15 triệu key.\n2. Tại sao key không tự giải phóng? -> Key không được gắn TTL.\n3. Tại sao không có TTL? -> Code `setSessionCache()` chỉ truyền key và value, bỏ quên tham số EX.\n4. Tại sao unit test không phát hiện? -> Mock Redis trong CI test không kiểm tra thuộc tính TTL.\n5. Tại sao không có cảnh báo trước? -> Ngưỡng alert bộ nhớ đặt ở mức 95% là quá muộn khi traffic tăng nhanh.\n\n## 4. Corrective & Preventative Action Items (CAPA)\n1. Bắt buộc mọi lệnh set Redis phải qua wrapper class có default TTL 24h (P0 - Done).\n2. Hạ ngưỡng cảnh báo RAM xuống 75% trên Datadog (P0 - Done).\n3. Thêm linter rule cấm gọi trực tiếp `redis.set()` trần mà không có expire (P1 - Sprint 26).",
      flawedOutput: "# Báo cáo sự cố\nSự cố do sơ suất cá nhân của bạn dev mới vào làm, do người dùng dùng sai bấm thông báo nhiều quá.",
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
      { pattern: "sliced stories|user stories|story slicing|phân rã", name: "Vertical User Story Slicing", severity: "critical" },
      { pattern: "dependencies|phụ thuộc", name: "Cross-team Dependencies", severity: "critical" },
      { pattern: "estimate|độ phức tạp|story points", name: "Complexity / Sizing Estimates", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "cắt theo tầng|story chỉ làm fe|story chỉ làm be", issue_code: "horizontal_slicing_anti_pattern", description: "Bắt buộc cắt Story theo chiều dọc (Vertical Slice) mang lại giá trị độc lập.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "User Onboarding Epic Breakdown",
      prompt: "Phân rã Epic Đăng ký và Xác thực người dùng mới thành các User Story triển khai được.",
      goodOutput: "# WBS: Epic User Registration & Verification\n\n## 1. Epic Definition\nCung cấp luồng đăng ký tài khoản tự phục vụ và xác thực email trong vòng 2 phút.\n\n## 2. Vertical Sliced Stories\n- **Story 1 (P0): Đăng ký bằng Email & Mật khẩu cơ bản** (Trọn gói UI + API + Lưu DB).\n- **Story 2 (P1): Gửi mã OTP kích hoạt qua Email** (Tích hợp SendGrid + Validate OTP).\n- **Story 3 (P2): Đăng ký nhanh qua Google OAuth**.\n\n## 3. Dependencies & Risks\nPhụ thuộc tài khoản dịch vụ SendGrid đã duyệt SPF/DKIM.\n\n## 4. Estimates & Milestones\nTổng dung lượng: 13 Story Points, bàn giao trong Sprint 24.",
      flawedOutput: "# Chia task\nTask 1: Dev làm database. Task 2: Dev làm backend. Task 3: Làm frontend.",
    },
    benchmarkRealistic: {
      name: "Omnichannel Loyalty Points Engine Epic Vertical Slicing",
      prompt: "Phân rã Epic Tích điểm đổi quà đa kênh (Omnichannel Loyalty Points) theo phương pháp Vertical Slicing.",
      goodOutput: "# WBS: Epic Omnichannel Loyalty Points Engine\n\n## 1. Epic Scope Definition\nCho phép 500.000 khách hàng tích điểm khi mua hàng tại cả POS cửa hàng vật lý và ứng dụng thương mại điện tử, tự động quy đổi thành voucher giảm giá.\n\n## 2. Vertical Sliced User Stories\n- **Story 1 (P0 - Thin Slice): Tích điểm tự động khi mua online** (UI giỏ hàng hiển thị số điểm nhận được, API tính điểm theo tỷ lệ 10.000đ = 1 điểm, ghi sổ Ledger DB).\n- **Story 2 (P0): Tra cứu số dư điểm và lịch sử biến động** (Trang Profile hiển thị realtime, webhook đồng bộ với hệ thống POS cửa hàng).\n- **Story 3 (P1): Dùng điểm giảm giá trực tiếp khi thanh toán** (Validate hạn mức tối đa 50% giá trị đơn, rollback điểm nếu hủy giao dịch).\n\n## 3. Cross-team Dependencies & Blockers\n- Phụ thuộc team POS cung cấp API đối soát ca bán hàng trước ngày 15/11.\n- Phụ thuộc team Tài chính phê duyệt tỷ lệ trích lập quỹ dự phòng điểm thưởng.\n\n## 4. Estimates & Release Milestones\n- Story 1: 5 SP | Story 2: 3 SP | Story 3: 8 SP -> Tổng: 16 Story Points (Triển khai gói gọn trong 2 Sprint).",
      flawedOutput: "# Kế hoạch phân rã\nCắt theo tầng kỹ thuật: Story chỉ làm FE dựng form tích điểm, Story chỉ làm BE viết API database.",
    },
  },

  "ui-ux-design": {
    id: "ui-ux-design",
    title: "Modern UI/UX Design System Rubric",
    description: "Evaluates modern aesthetics, design tokens, color harmony, typography, and interactive micro-animations.",
    taskType: "ui_ux_spec",
    taskName: "UI/UX Design Specification",
    requiredSections: [
      { pattern: "color token|design token|color palette|bảng màu", name: "Curated Design Tokens & Palette", severity: "critical" },
      { pattern: "typography|phông chữ|font", name: "Typography Scale (Google Fonts)", severity: "major" },
      { pattern: "glassmorphism|gradient|visual hierarchy", name: "Rich Visual Aesthetics & Depth", severity: "major" },
      { pattern: "micro-animation|transition|hover effect", name: "Dynamic Micro-animations & States", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "màu đỏ cờ|màu xanh lá tươi|plain red|plain blue", issue_code: "generic_color_anti_pattern", description: "Cấm dùng màu mặc định nguyên thủy, phải dùng curated HSL palette.", severity: "major" },
    ],
    benchmarkBaseline: {
      name: "SaaS Analytics Dashboard UI Tokens",
      prompt: "Thiết kế hệ thống Design Tokens và bảng màu cao cấp cho SaaS Analytics Dashboard.",
      goodOutput: "# UI/UX Design Spec: SaaS Analytics Dashboard\n\n## 1. Curated Color Palette (Dark Mode First)\n- **Background Primary:** `hsl(222, 47%, 11%)` (Deep Slate)\n- **Card Surface:** `rgba(30, 41, 59, 0.7)` kèm `backdrop-filter: blur(12px)` (Glassmorphism)\n- **Primary Accent:** `hsl(217, 91%, 60%)` gradient sang `hsl(270, 95%, 65%)` (Electric Violet)\n\n## 2. Typography Scale\nFont: Inter (Google Fonts), scale rõ ràng từ 12px (Caption) đến 32px (Header Display).\n\n## 3. Micro-animations & Interactions\nHover card: `transform: translateY(-2px)`, transition `cubic-bezier(0.4, 0, 0.2, 1) 200ms`.\nLoading skeleton: Shimmer gradient mượt mà.",
      flawedOutput: "# Thiết kế giao diện\nDùng màu đỏ và xanh lá cây. Nền trắng chữ đen cơ bản.",
    },
    benchmarkRealistic: {
      name: "Dark-Mode FinTech Crypto Trading Workspace Design Tokens",
      prompt: "Thiết kế hệ thống token thị giác cho ứng dụng giao dịch tài chính tốc độ cao với phong cách Dark Mode Glassmorphism.",
      goodOutput: "# UI/UX Specification: FinTech High-Frequency Trading Terminal\n\n## 1. Curated Color Tokens (Ultra Dark Mode)\n- **Background Base:** `hsl(224, 71%, 4%)` (Deep Obsidian Void)\n- **Panel Surface:** `hsla(222, 47%, 11%, 0.65)` kết hợp `backdrop-filter: blur(16px)` và border viền `hsla(217, 33%, 24%, 0.4)` (Glassmorphism)\n- **Bullish Green Accent:** `hsl(158, 64%, 52%)` (Emerald Neon Glow)\n- **Bearish Red Accent:** `hsl(350, 89%, 60%)` (Crimson Pulse)\n\n## 2. Typography Hierarchy (Outfit & JetBrains Mono)\n- Headings & Metrics: Font `Outfit`, weights 600-700.\n- Ticker Prices & Orderbook Data: Font `JetBrains Mono`, `font-variant-numeric: tabular-nums` chống giật số.\n\n## 3. Visual Depth & Glow Gradients\nHiệu ứng radial gradient tinh tế tại góc biểu đồ nến `radial-gradient(ellipse at top, hsla(217, 91%, 60%, 0.15), transparent 70%)` tạo độ sâu không gian phòng tối.\n\n## 4. Micro-animations & Dynamic State Feedback\n- Giá biến động: nhấp nháy nền `animation: pricePulse 300ms ease-out`.\n- Nút Buy/Sell: hiệu ứng sóng ripple `transform: scale(0.98)` khi click và đổ bóng glow `box-shadow: 0 0 15px hsla(158, 64%, 52%, 0.4)`.",
      flawedOutput: "# Giao diện sàn giao dịch\nDùng màu đỏ cờ với màu xanh lá tươi plain red plain blue, không cần hiệu ứng gì hết.",
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
    benchmarkBaseline: {
      name: "Explain Database Indexing to a 10-year-old",
      prompt: "Giải thích cơ chế Index trong cơ sở dữ liệu theo kỹ thuật Feynman.",
      goodOutput: "# Giải Thích Cơ Chế Database Index Theo Kỹ Thuật Feynman\n\n## 1. Khái Niệm Bình Dân\nIndex trong cơ sở dữ liệu giống hệt như **Mục Lục ở cuối cuốn từ điển dày 1000 trang**.\n\n## 2. Ẩn Dụ Trực Quan\nNếu không có mục lục, muốn tìm từ 'Mèo', bạn phải lật từng trang từ trang 1 đến trang 1000 (gọi là Full Table Scan). Nhờ có mục lục xếp theo chữ cái A-Z, bạn chỉ cần 3 giây để biết từ 'Mèo' nằm ở trang 450.\n\n## 3. Gỡ Rối Nhầm Lẫn\nTại sao không đánh index cho tất cả các cột? Vì mỗi lần bạn thêm 1 từ mới vào sách, bạn phải viết lại mục lục. Quá nhiều mục lục sẽ làm chậm việc ghi sách (tốn bộ nhớ và chậm lệnh Insert/Update).\n\n## 4. Tóm Tắt 1 Câu\nIndex là chiếc bản đồ phím tắt giúp tìm dữ liệu trong chớp mắt mà không phải lật từng trang.",
      flawedOutput: "# Database Index\nIndex là cấu trúc dữ liệu B-Tree lưu trữ các con trỏ trỏ tới khối dữ liệu vật lý trên ổ đĩa SSD.",
    },
    benchmarkRealistic: {
      name: "Explain Zero-Knowledge Proofs (ZKP) to Non-Technical Executives",
      prompt: "Giải thích công nghệ Zero-Knowledge Proof (ZKP) bằng phương pháp Feynman cho Giám đốc kinh doanh.",
      goodOutput: "# Giải Thích Công Nghệ Zero-Knowledge Proofs (Bằng Chứng Không Tri Thức)\n\n## 1. Khái Niệm Bình Dân Không Thuật Ngữ\nZKP là cách bạn **chứng minh cho người khác biết bạn có chìa khóa mở kho báu, mà không cần cho họ nhìn thấy chiếc chìa khóa hay bất kỳ thứ gì bên trong kho báu**.\n\n## 2. Ẩn Dụ Trực Quan: Hai Quả Táo và Người Bạn Mù Màu\nHãy tưởng tượng bạn có 2 quả táo: 1 quả đỏ và 1 quả xanh, nhưng người bạn của bạn bị mù màu và nghĩ chúng giống hệt nhau.\n- Bạn bảo: 'Hai quả màu khác nhau đấy!'. Bạn ấy giấu 2 quả sau lưng, tráo đổi hoặc giữ nguyên rồi đưa ra hỏi: 'Tôi có vừa tráo quả không?'.\n- Bạn luôn trả lời đúng 100% sau 20 lần thử.\n- Bạn của bạn hoàn toàn bị thuyết phục rằng 2 quả táo khác màu thật, dù bạn ấy vẫn **không hề biết quả nào là màu đỏ, quả nào là màu xanh**.\n\n## 3. Gỡ Rối Điểm Hiểu Lầm Phổ Biến\nMọi người thường nghĩ muốn bảo mật thì phải mã hóa mật khẩu rồi gửi cho server giải mã. ZKP chứng minh server không cần biết mật khẩu của bạn là gì nhưng vẫn chứng thực được bạn là chủ tài khoản.\n\n## 4. Tóm Tắt Trong 1 Câu Đắt Giá\nZKP là chiếc thẻ căn cước thông minh chứng minh bạn đủ 18 tuổi để vào rạp chiếu phim mà không để lộ ngày sinh hay địa chỉ nhà.",
      flawedOutput: "# Zero-Knowledge Proof\nZKP dùng thuật ngữ khó hiểu mà không giải thích: zk-SNARKs dựa trên đa thức elliptic curve và hệ thống cam kết mật mã học phi tương tác.",
    },
  },

  "agent-handoff-contract": {
    id: "agent-handoff-contract",
    title: "Agent Handoff Contract Rubric",
    description: "Evaluates multi-agent handoff packets, context transfer, input/output contracts, risk escalation, and assumption logs.",
    taskType: "agent_handoff",
    taskName: "Multi-Agent Handoff Packet",
    requiredSections: [
      { pattern: "context|bối cảnh|mục tiêu", name: "Handoff Context & Objective", severity: "critical" },
      { pattern: "contract|deliverable|kết quả bàn giao", name: "Deliverable Artifacts & Contract", severity: "critical" },
      { pattern: "assumptions|giả định|rủi ro", name: "Assumptions & Known Risks", severity: "major" },
      { pattern: "escalation|chuyển giao|người nhận", name: "Next Owner & Escalation Trigger", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "tự suy đoán|tự đoán|chắc là|xong rồi đấy", issue_code: "unverified_assumption_leak", description: "Cấm đoán mò yêu cầu mà không ghi log giả định rõ ràng.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "BA to Developer Handoff Packet for Checkout API",
      prompt: "Soạn gói bàn giao Handoff Packet từ BA sang Dev cho tính năng Áp mã giảm giá.",
      goodOutput: "# Agent Handoff Packet: Feature Apply Discount Voucher\n\n## 1. Handoff Context & Objective\nChuyển giao thông số nghiệp vụ từ BA Agent sang Backend Lead Agent để lập trình endpoint `/api/v1/cart/apply-voucher`.\n\n## 2. Deliverable Artifacts & Contract\n- Tài liệu PRD: [PRD-Voucher-v2.md](file:///docs/PRD-Voucher.md)\n- Schema JSON Input: `{ voucherCode: string, cartTotal: number }`\n- Expected Response: `{ valid: boolean, discountAmount: number, finalTotal: number }`\n\n## 3. Assumptions & Known Risks\n- Giả định: Tỷ giá tiền tệ luôn cố định là VND, không xử lý ngoại tệ trong phase 1.\n- Rủi ro: Khách hàng mở nhiều tab browser áp cùng 1 voucher mã dùng 1 lần (cần khóa Redis distributed lock).\n\n## 4. Next Owner & Escalation Trigger\n- Người nhận: Backend Dev Agent.\n- Cổng leo thang: Nếu service Voucher phản hồi > 500ms trong quá trình stress test, kích hoạt escalation lại cho Kiến trúc sư.",
      flawedOutput: "# Bàn giao task\nXong rồi đấy, chắc là dev tự hiểu mà làm tiếp đi.",
    },
    benchmarkRealistic: {
      name: "Architecture Agent to DevOps Agent Infrastructure Handoff",
      prompt: "Bàn giao gói đặc tả hạ tầng Kubernetes cụm thanh toán đa vùng từ Architecture Agent sang DevOps Agent.",
      goodOutput: "# Agent Handoff Contract: Multi-Region Payment Cluster Deployment\n\n## 1. Handoff Context & Objective\nBàn giao kiến trúc cụm hạ tầng từ Solution Architect sang DevOps Lead Agent để kích hoạt script Terraform triển khai cụm EKS tại Tokyo và Singapore.\n\n## 2. Deliverable Artifacts & Contract Requirements\n- File thiết kế chi tiết: [Payment-Arch-v3.md](file:///docs/arch/Payment-Arch-v3.md)\n- Bộ mẫu Terraform: `infra/terraform/modules/eks-cluster`\n- SLA Yêu cầu: Pod startup time < 15 giây, Cluster Autoscaler phản ứng trong vòng 45 giây.\n\n## 3. Assumptions & Known Risks\n- Giả định: AWS Account đã được nâng hạn mức Service Quota cho m5.2xlarge instances.\n- Rủi ro tồn đọng: Kết nối Direct Connect giữa 2 vùng có thể tăng latency trong đợt bảo trì cáp quang biển APG.\n\n## 4. Next Owner & Escalation Trigger Matrix\n- Người tiếp nhận: Senior DevOps Automation Agent.\n- Escalation Gate: Nếu chi phí dự toán vượt $4,500/tháng hoặc latency ping chéo vùng > 80ms, lập tức dừng pipeline và thông báo cho CPO.",
      flawedOutput: "# Handoff hạ tầng\nTự suy đoán thông số rồi cài bừa lên AWS đi, xong rồi đấy.",
    },
  },

  "ai-curriculum-designer": {
    id: "ai-curriculum-designer",
    title: "AI Curriculum Designer Rubric",
    description: "Evaluates active learning study plans, Bloom's taxonomy objectives, talk-show format agendas, and practical exercises.",
    taskType: "curriculum_design",
    taskName: "Active Learning Curriculum & Study Guide",
    requiredSections: [
      { pattern: "persona|đối tượng|tiền đề|prerequisite", name: "Target Persona & Prerequisites", severity: "critical" },
      { pattern: "mục tiêu đào tạo|learning objectives|bloom", name: "Learning Objectives & Competencies", severity: "critical" },
      { pattern: "lộ trình|syllabus|talk show|chủ đề", name: "Active Learning Syllabus & Modules", severity: "critical" },
      { pattern: "thực hành|bài tập|đánh giá|criteria", name: "Hands-on Exercises & Assessment Rubric", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "chỉ nghe thuyết trình|không có thực hành|học vẹt", issue_code: "passive_learning_anti_pattern", description: "Cấm tổ chức đào tạo chỉ đọc chép thụ động, bắt buộc có bài tập thực chiến.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "4-Week Agile Testing Study Plan for Junior QC",
      prompt: "Thiết kế giáo trình học tập 4 tuần về Kỹ năng Kiểm thử Hồi quy cho QC mới vào nghề.",
      goodOutput: "# Lộ Trình Đào Tạo Thực Chiến: Agile Quality Engineering Cho Junior QC\n\n## 1. Target Persona & Prerequisites\n- Đối tượng: Junior QC (kinh nghiệm < 1 năm), đã nắm khái niệm kiểm thử đen/trắng.\n- Yêu cầu tiền đề: Đã cài đặt Node.js và Git cơ bản.\n\n## 2. Learning Objectives & Competencies (Bloom's Taxonomy)\n- Hiểu sâu nguyên lý Test Pyramid và Shift-Left Testing.\n- Áp dụng kỹ thuật phân vùng tương đương và phân tích giá trị biên vào tài liệu thực tế.\n- Độc lập viết được kịch bản Playwright cơ bản.\n\n## 3. Active Learning Syllabus (Format Talk Show & Coding Dojo)\n- **Tuần 1:** Bóc tách yêu cầu từ PRD mơ hồ (Talk Show phản biện BA).\n- **Tuần 2:** Thiết kế ma trận Test Cases tối giản không thừa thãi.\n- **Tuần 3:** Tự động hóa API testing với Postman & Newman.\n- **Tuần 4:** Báo cáo Defect chuẩn quốc tế SEV-1 đến SEV-4.\n\n## 4. Hands-on Exercises & Assessment Rubric\n- Bài tập: Tìm 5 bug nghiệp vụ trong ứng dụng E-commerce mẫu.\n- Thang điểm: Đánh giá dựa trên độ chi tiết của Steps to Reproduce và bằng chứng đính kèm.",
      flawedOutput: "# Khóa học QC\nHọc viên chỉ nghe thuyết trình lý thuyết và học vẹt định nghĩa, không có thực hành.",
    },
    benchmarkRealistic: {
      name: "Enterprise Event-Storming Masterclass for Senior BA & Leads",
      prompt: "Thiết kế khóa huấn luyện 3 ngày về Kỹ thuật Event-Storming và Phân rã Domain-Driven Design cho Senior BA và Tech Leads.",
      goodOutput: "# Khóa Huấn Luyện Chuyên Sâu: Event-Storming & Domain-Driven Design Thực Chiến\n\n## 1. Target Persona & Prerequisites\n- Đối tượng: Senior Business Analysts, Solution Architects, Tech Leads.\n- Tiền đề: Đã có kinh nghiệm tham gia triển khai hệ thống phân tán tối thiểu 2 năm.\n\n## 2. Learning Objectives & Competencies (Bloom: Analyze & Create)\n- Phân rã nghiệp vụ phức tạp thành các Bounded Contexts độc lập.\n- Nhận diện sự kiện Domain Events, Commands và Read Models trên bề mặt canvas.\n- Phát hiện ranh giới tranh chấp dữ liệu giữa các phòng ban chức năng.\n\n## 3. Active Learning Syllabus & Workshop Schedule\n- **Ngày 1 (Big Picture Event Storming):** Dán thẻ Domain Events màu cam tái hiện toàn bộ chuỗi giá trị khách hàng.\n- **Ngày 2 (Design-Level Storming):** Gắn Command, Aggregate, và Policy để khoanh vùng Subdomains (Core vs Supporting).\n- **Ngày 3 (Context Mapping & Handoff):** Xây dựng hợp đồng giao tiếp giữa các đội nhóm (Upstream/Downstream, Customer-Supplier).\n\n## 4. Hands-on Exercises & Assessment Rubric\n- Thực hành: Tái cấu trúc phân rã hệ thống Logistics đa chặng tại Việt Nam.\n- Tiêu chí đánh giá: Ma trận Bounded Context sạch, không có quan hệ vòng tròn (Circular Dependency), định nghĩa rõ ràng Aggregate Root.",
      flawedOutput: "# Đào tạo Event Storming\nGiảng viên chiếu slide 3 ngày, chỉ nghe thuyết trình lý thuyết suông không có thực hành trên bảng.",
    },
  },

  "cognitive-scaffolding": {
    id: "cognitive-scaffolding",
    title: "Cognitive Scaffolding & Progressive Explanation Rubric",
    description: "Evaluates cognitive bridges, the Anchor-Bridge-Target model, Minto Pyramid progression, and curse-of-knowledge elimination.",
    taskType: "cognitive_explanation",
    taskName: "Progressive Explanation & Cognitive Scaffolding",
    requiredSections: [
      { pattern: "anchor|neo nhận thức|điểm tựa", name: "Cognitive Anchor & Reader Pain Point", severity: "critical" },
      { pattern: "bridge|bắc cầu|minto|dẫn dắt", name: "Progressive Reasoning Bridge & Analogy", severity: "critical" },
      { pattern: "target concept|khái niệm đích|bản chất", name: "Target Concept Mastery & Mental Model", severity: "critical" },
      { pattern: "verification|kiểm chứng|câu hỏi hiểu bài", name: "Check for Understanding & Practical Takeaway", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "nhảy ngay vào thuật ngữ|ném một đống từ khó|không giải thích bối cảnh", issue_code: "curse_of_knowledge_violation", description: "Cấm nhảy xổ vào thuật ngữ phức tạp khi chưa neo nhận thức người đọc.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "Explaining Event-Driven Architecture to Non-Tech Stakeholders",
      prompt: "Bắc cầu nhận thức để giải thích kiến trúc hướng sự kiện (EDA) cho Giám đốc kinh doanh.",
      goodOutput: "# Dẫn Dắt Nhận Thức: Kiến Trúc Hướng Sự Kiện (Event-Driven Architecture)\n\n## 1. Cognitive Anchor & Điểm Tựa Thân Thuộc\nBạn hãy tưởng tượng bạn đi ăn tại quán phở truyền thống. Người phục vụ đứng chờ bạn ăn xong rồi mới ghi giấy mang vào bếp, làm mọi người phải xếp hàng chờ đợi.\n\n## 2. Progressive Reasoning Bridge (Cầu Nối Nhận Thức)\nNếu đổi sang mô hình hiện đại: Khi bạn gọi món, lễ tân in 1 phiếu giấy (đây là 'Sự Kiện - Event') rồi đưa cho bạn số bàn. Lễ tân lập tức đón khách tiếp theo. Bếp nhìn phiếu giấy tự nấu, quầy nước nhìn phiếu tự pha.\n\n## 3. Target Concept: Bản Chất Kiến Trúc EDA\nHệ thống phần mềm cũng vậy. Thay vì Module Đặt hàng phải đứng chờ Module Kho và Module Giao hàng trả lời (Đồng bộ), nó chỉ cần phát ra 1 Sự Kiện `OrderPlaced`. Mọi bộ phận khác tự động bắt sự kiện và xử lý độc lập.\n\n## 4. Check for Understanding & Giá Trị Nghiệp Vụ\nNếu website có đợt siêu sale 100.000 người vào cùng lúc: Quán phở của chúng ta không bao giờ bị nghẽn vì lễ tân chỉ phát phiếu rồi phục vụ người tiếp theo.",
      flawedOutput: "# Event Driven Architecture\nNhảy ngay vào thuật ngữ: EDA là decoupling producer consumer qua Kafka cluster pub-sub message broker serialization Avro.",
    },
    benchmarkRealistic: {
      name: "Scaffolding Kubernetes Pod Networking for Junior Web Developers",
      prompt: "Thiết lập khung giải thích bắc cầu nhận thức về cơ chế Networking của Pod trong Kubernetes cho lập trình viên quen dùng Docker đơn lẻ.",
      goodOutput: "# Bắc Cầu Nhận Thức: Bản Chất Kubernetes Pod Networking\n\n## 1. Cognitive Anchor: Neo Nhận Thức Trên Nền Docker Có Sẵn\nBạn đã quá quen với việc chạy `docker run -p 8080:80 nginx`. Mỗi container là một hòn đảo riêng, có địa chỉ IP riêng và muốn nói chuyện với nhau phải qua Docker Bridge Network.\n\n## 2. Progressive Reasoning Bridge: Ẩn Dụ Căn Hộ Chung Cư\nHãy tưởng tượng một Căn hộ 2 phòng ngủ (gọi là Pod):\n- Hai người bạn sống chung trong căn hộ này (hai containers: ví dụ 1 Web App và 1 Logging Sidecar).\n- Căn hộ chỉ có **1 địa chỉ hòm thư duy nhất** (1 IP duy nhất cho toàn bộ Pod).\n- Ở trong nhà, hai người bạn nói chuyện với nhau trực tiếp qua hành lang mà không cần gửi thư bưu điện (giao tiếp qua `localhost:PORT`).\n\n## 3. Target Concept: Kubernetes Network Model\nBản chất trong Linux, Pod là một tập hợp các container chia sẻ chung một **Network Namespace** (nhờ container phụ `pause`). Do đó: Tất cả containers trong cùng 1 Pod thấy chung 1 IP, dùng chung cổng port, và chia sẻ cùng loopback adapter.\n\n## 4. Check for Understanding & Cạm Bẫy Thực Tế\nNếu Container A mở port 8080, Container B trong cùng Pod có mở được port 8080 không? -> Không, vì sẽ bị lỗi `Port already in use` giống hệt 2 ứng dụng chạy trên cùng 1 máy tính bàn.",
      flawedOutput: "# K8s Network\nNém một đống từ khó: CNI plugin cấu hình iptables và veth pair gắn vào OVS bridge overlay VXLAN encapsulation không giải thích bối cảnh.",
    },
  },

  "customer-acceptance": {
    id: "customer-acceptance",
    title: "Customer Acceptance & UAT Rubric",
    description: "Evaluates user acceptance testing reviews, persona discipline, accept/reject verdicts, and objective criteria-based evaluation.",
    taskType: "uat_acceptance",
    taskName: "Customer Acceptance & UAT Verdict",
    requiredSections: [
      { pattern: "persona|vai trò người dùng|bối cảnh nghiệp vụ", name: "Customer Persona & Real-world Context", severity: "critical" },
      { pattern: "acceptance criteria|criteria-based|tiêu chí chấp nhận|kịch bản kiểm tra", name: "Criteria-based Checklist", severity: "critical" },
      { pattern: "evidence|bằng chứng|kết quả kiểm thử", name: "Objective Evidence & Defect Log", severity: "critical" },
      { pattern: "verdict|quyết định|chấp thuận|từ chối", name: "Formal Verdict & Business Impact", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "tôi không thích|nhìn ngứa mắt|cảm tính cá nhân", issue_code: "subjective_taste_anti_pattern", description: "Đánh giá UAT phải căn cứ tiêu chí nghiệm thu, cấm chê bai cảm tính.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "UAT Sign-off on Order Cancellation Flow",
      prompt: "Thực hiện biên bản nghiệm thu UAT cho tính năng Hủy đơn hàng tự động.",
      goodOutput: "# Biên Bản Nghiệm Thu UAT: Tính Năng Hủy Đơn Hàng Tự Phục Vụ\n\n## 1. Customer Persona & Real-world Context\nNgười thẩm định: Nguyễn Văn A (Đại diện Khách hàng Doanh nghiệp mua sỉ B2B).\n\n## 2. Acceptance Criteria Checklist\n- [x] AC-01: Cho phép hủy đơn trong vòng 15 phút nếu đơn chưa sang trạng thái 'Đang đóng gói'.\n- [x] AC-02: Tự động hoàn tiền vào ví trong vòng 3 phút.\n- [ ] AC-03: Gửi email xác nhận kèm mã số giao dịch hoàn tiền (Chưa đạt: email gửi chậm 45 phút).\n\n## 3. Objective Evidence & Defect Log\nĐã thử nghiệm 10 đơn hàng hủy. 10/10 đơn hoàn tiền chuẩn xác. Phát hiện lỗi SEV-3: Template email gửi thiếu thông tin lý do hủy đơn.\n\n## 4. Formal Verdict & Business Impact\n**Verdict: CONDITIONAL ACCEPTANCE (Chấp thuận có điều kiện)**. Cho phép release ra thị trường sau khi hotfix template email hoàn tiền.",
      flawedOutput: "# Nghiệm thu\nTôi không thích cái màu nút bấm này, nhìn ngứa mắt cảm tính cá nhân nên từ chối.",
    },
    benchmarkRealistic: {
      name: "Enterprise B2B Automated Tax Invoice Reconciliation UAT Sign-off",
      prompt: "Đánh giá nghiệm thu UAT tính năng Xuất hóa đơn điện tử tự động và đối soát thuế cuối tháng cho khách hàng Doanh nghiệp.",
      goodOutput: "# Biên Bản Đánh Giá Nghiệm Thu Khách Hàng (UAT Sign-Off): Xuất Hóa Đơn Điện Tử Tự Động\n\n## 1. Customer Persona & Business Operational Context\n- Đại diện nghiệm thu: Kế toán trưởng Tập đoàn Bán lẻ F&B (Quản lý 120 chuỗi nhà hàng).\n- Khối lượng vận hành: 40.000 hóa đơn GTGT/tháng, kết nối trực tiếp cổng Tổng cục Thuế.\n\n## 2. Criteria-Based Acceptance Matrix\n| Mã Tiêu Chí | Nội Dung Cam Kết Nghiệp Vụ | Trạng Thái Thẩm Định |\n| :--- | :--- | :--- |\n| AC-INV-01 | Tự động gom đơn hàng cùng mã số thuế trong ngày thành 1 hóa đơn tổng | **PASS** (Đã thử nghiệm 500 đơn) |\n| AC-INV-02 | Ký số HSM tập trung với tốc độ >= 20 hóa đơn/giây | **PASS** (Đạt 32 hóa đơn/s) |\n| AC-INV-03 | Tự động sinh mã CQT và gửi email link tra cứu cho khách hàng | **FAIL** (Mã tra cứu bị cắt mất 2 ký tự cuối trên mobile) |\n\n## 3. Objective Evidence & Defect Log\n- Test run #429: File XML hóa đơn xuất ra chuẩn định dạng Thông tư 78/2021/TT-BTC.\n- Defect DEF-881 (SEV-2): Link tra cứu trong SMS bị bẻ đôi khi tên khách hàng có dấu tiếng Việt UTF-8.\n\n## 4. Formal Business Verdict & Release Recommendation\n**Quyết định: REJECT (Từ chối nghiệm thu đợt 1)**.\nLý do: Lỗi DEF-881 vi phạm điều kiện pháp lý về tính hợp lệ của đường dẫn tra cứu hóa đơn. Yêu cầu bàn giao bản vá trước ngày 28/10.",
      flawedOutput: "# Biên bản nghiệm thu\nPhần mềm nhìn xấu quá, tôi không thích nhìn ngứa mắt cảm tính cá nhân, bảo dev sửa lại cho đẹp mắt hơn.",
    },
  },

  "dont-make-me-think-ux": {
    id: "dont-make-me-think-ux",
    title: "Don't Make Me Think UX Architecture Rubric",
    description: "Evaluates cognitive load reduction, 3-second scanability, visual hierarchy, F-pattern layout, and frictionless error prevention.",
    taskType: "ux_architecture",
    taskName: "Cognitive Usability & UX Architecture Spec",
    requiredSections: [
      { pattern: "3-second scan|quét mắt 3 giây|visual hierarchy", name: "3-Second Scanability & Visual Hierarchy", severity: "critical" },
      { pattern: "noise|redundancy|cognitive load|giảm tải nhận thức|loại bỏ rác", name: "Noise & Redundancy Reduction", severity: "critical" },
      { pattern: "primary action|hành động chính|f-pattern", name: "Unambiguous Primary Action", severity: "critical" },
      { pattern: "frictionless|phòng ngừa lỗi|hướng dẫn", name: "Error Prevention & Frictionless Flow", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "quá tải thông tin|nhồi nhét|nhãn nút mơ hồ|bấm vào đây", issue_code: "cognitive_overload_anti_pattern", description: "Cấm nhồi nhét thông tin dày đặc hoặc đặt tên nút bấm mơ hồ vô nghĩa.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "B2B Order Management DataGrid Refactoring",
      prompt: "Tái cấu trúc giao diện Bảng quản lý đơn hàng theo triết lý Don't Make Me Think.",
      goodOutput: "# Tái Cấu Trúc Bố Cục UX: Bảng Đơn Hàng B2B Tinh Gọn\n\n## 1. 3-Second Scanability & Visual Hierarchy\nNgười vận hành kho chỉ mất 3 giây để nhận biết đơn nào cần xử lý ngay nhờ màu sắc trạng thái chuẩn hóa (Xanh lá: Đã thanh toán, Vàng cam: Chờ đóng gói, Xám: Đã hoàn tất).\n\n## 2. Noise & Redundancy Reduction\nẨn 12 cột phụ (như mã bưu điện, tọa độ GPS) vào menu 'Xem chi tiết' dạng drawer trượt, giảm 60% mật độ chữ trên màn hình chính.\n\n## 3. Unambiguous Primary Action (F-Pattern)\nNút hành động chính 'In Phiếu Giao Hàng' luôn nổi bật ở góc trên bên phải, nút phụ có độ tương phản thấp hơn để tránh nhầm lẫn.\n\n## 4. Error Prevention & Frictionless Safeguards\nKhi bấm nút 'Hủy toàn bộ đơn đã chọn', modal xác nhận hiển thị số tiền chính xác sẽ bị hủy và yêu cầu gõ chữ XACNHAN để phòng ngừa bấm nhầm.",
      flawedOutput: "# Thiết kế bảng\nQuá tải thông tin: nhồi nhét 40 cột lên màn hình, đặt tên nút là bấm vào đây.",
    },
    benchmarkRealistic: {
      name: "High-Stakes Financial Risk Monitoring Dashboard Layout",
      prompt: "Thiết kế kiến trúc trải nghiệm cho màn hình giám sát rủi ro gian lận giao dịch thẻ theo nguyên tắc giảm tải nhận thức tối đa.",
      goodOutput: "# UX Architecture Spec: Fraud Risk Monitoring Command Center\n\n## 1. 3-Second Scanability & Visual Hierarchy\n- Tầng 1 (Eye-level Top): Thanh đồng hồ đo mức độ rủi ro hệ thống (Threat Gauge) chuyển từ Xanh sang Đỏ.\n- Tầng 2 (Trung tâm): Danh sách các giao dịch bất thường được nhóm theo mức độ đe dọa (Critical Anomaly) với chữ số tiền lớn, phông Tabular Nums.\n\n## 2. Noise Reduction & Cognitive Load Stripping\n- Loại bỏ toàn bộ viền bảng (borders) không cần thiết, thay bằng khoảng trống Whitespace 16px tạo nhịp thở thị giác.\n- Thu gọn các chuỗi JSON payload kỹ thuật vào accordion thu nhỏ, chỉ hiển thị tóm tắt: 'IP đổi vị trí từ VN sang Nga sau 4 phút'.\n\n## 3. Unambiguous Primary Action Hierarchy\n- Nút khẩn cấp P0: `[KHÓA THẺ TỨC THÌ]` màu đỏ đậm có icon ổ khóa rõ ràng.\n- Nút P1: `[Bỏ qua cảnh báo]` dạng ghost button viền mờ, triệt tiêu nguy cơ chọn nhầm trong trạng thái hoảng loạn.\n\n## 4. Frictionless Error Prevention & Reversible Actions\nMọi hành động khóa thẻ đều cho phép 'Hoàn tác trong 10 giây' (Undo Toast) ở góc dưới màn hình giúp nhân viên an tâm xử lý nhanh mà không sợ thao tác nhầm.",
      flawedOutput: "# Màn hình rủi ro\nNhồi nhét tất cả biểu đồ lên một chỗ gây quá tải thông tin, gắn 20 nút giống hệt nhau ghi bấm vào đây.",
    },
  },

  "pdf-creator": {
    id: "pdf-creator",
    title: "Adaptive PDF Creator Specification Rubric",
    description: "Evaluates document profiling, page-break avoidance, print layout budgets, Vietnamese typography, and running headers/footers.",
    taskType: "pdf_spec",
    taskName: "Adaptive PDF Creator Layout Specification",
    requiredSections: [
      { pattern: "profiling|khảo sát tài liệu|page budget", name: "Document Profiling & Page Budget", severity: "critical" },
      { pattern: "page break|chống gãy trang|break-inside", name: "Page Break & Flow Control", severity: "critical" },
      { pattern: "typography|phông chữ|spacing", name: "Professional Typography & Layout Tokens", severity: "major" },
      { pattern: "header|footer|số trang|vietnamese", name: "Print Header/Footer & Vietnamese Font Setup", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "hardcode height px|để mặc định|cắt đôi bảng", issue_code: "broken_pdf_layout_anti_pattern", description: "Cấm hardcode chiều cao tĩnh gây tràn trang hoặc để bảng bị cắt đôi ngang thân.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "A4 Technical Proposal Document PDF Spec",
      prompt: "Lập thông số kỹ thuật layout xuất bản tài liệu Đề xuất Kỹ thuật khổ A4 chống gãy trang.",
      goodOutput: "# Đặc Tả Kỹ Thuật Layout PDF: Đề Xuất Kỹ Thuật Khổ A4\n\n## 1. Document Profiling & Page Budget\n- Dung lượng mục tiêu: Chính xác 4 trang A4 (không thừa trang trắng cuối cùng).\n- Thành phần: Chứa 2 biểu đồ kiến trúc và 3 bảng so sánh kỹ thuật.\n\n## 2. Page Break & Flow Control Strategy\n- Thiết lập CSS: `.card, .table-container, pre { break-inside: avoid; }`.\n- Tiêu đề mục: `h2, h3 { break-after: avoid; }` đảm bảo không bao giờ có tiêu đề mồ côi ở cuối trang.\n\n## 3. Professional Typography & Layout Tokens\n- Font chữ: Inter và Roboto (Google Fonts) hỗ trợ 100% tiếng Việt có dấu không bị lỗi chân chữ.\n- Thước đo: Margin 15mm chuẩn in ấn văn phòng phẩm.\n\n## 4. Running Header/Footer & Vietnamese Setup\n- Header cố định: Tên dự án và logo công ty.\n- Footer chuẩn: Đánh số trang động dạng `Trang X / Y` với script đo lường Puppeteer.",
      flawedOutput: "# Xuất PDF\nCứ để mặc định in đại ra, cắt đôi bảng giữa trang cũng kệ nó.",
    },
    benchmarkRealistic: {
      name: "5-Page Executive Board Business Intelligence Report PDF Spec",
      prompt: "Thiết kế bộ thông số layout PDF chuyên nghiệp cho Báo cáo Tài chính Quý 5 trang gửi Hội đồng Quản trị.",
      goodOutput: "# PDF Layout Specification: Q3 Executive Board Financial Performance Report\n\n## 1. Document Profiling & Strict Page Budgeting\n- Ngân sách trang in: Cố định 5 trang A4 dọc (Portrait), độ dài mỗi phần được kiểm soát dung lượng từ trước.\n- Thành phần rủi ro: Biểu đồ SVG Mermaid và bảng cân đối kế toán 8 cột.\n\n## 2. Page Break Defense Architecture\n- Chống gãy bảng: Toàn bộ thẻ `tr` được bọc `break-inside: avoid; page-break-inside: avoid;`.\n- Phân trang chủ động: Ép ngắt trang sạch sẽ tại ranh giới giữa các chương bằng class `.page-break { break-before: page; }`.\n\n## 3. Executive Typography & Color Tokens\n- Bảng màu: Deep Navy (`#0f172a`) kết hợp Slate Gray (`#475569`) và Accent Blue (`#2563eb`), không dùng màu loè loẹt.\n- Dàn trang: Bảng số liệu sử dụng `font-variant-numeric: tabular-nums` và `padding: 8px 12px`.\n\n## 4. Running Header/Footer & Vietnamese Diacritics Compatibility\n- Nhúng font trực tiếp `@font-face` từ Google Fonts nạp sẵn bộ ký tự Latin-Extended chống lỗi vỡ ký tự tiếng Việt.\n- Dynamic Footer: Hiển thị dòng bảo mật 'TÀI LIỆU MẬT - LƯU HÀNH NỘI BỘ' bên trái và số trang 'Trang 3/5' bên phải.",
      flawedOutput: "# In báo cáo\nHardcode height px cố định các ô bảng, làm bảng bị cắt đôi qua 2 trang lung tung.",
    },
  },

  "test-strategy": {
    id: "test-strategy",
    title: "Test Strategy & Quality Engineering Rubric",
    description: "Evaluates risk-based scoping, test pyramid layer distribution, entry/exit criteria, and regression release gates.",
    taskType: "test_strategy",
    taskName: "Test Strategy & Quality Engineering Spec",
    requiredSections: [
      { pattern: "risk|scoping|đánh giá rủi ro|phạm vi", name: "Risk-based Scoping & Impact Matrix", severity: "critical" },
      { pattern: "test pyramid|layer|phân tầng kiểm thử", name: "Test Layer Distribution & Coverage Allocation", severity: "critical" },
      { pattern: "quality gates|tiêu chí vào ra|entry exit", name: "Entry & Exit Quality Gates", severity: "critical" },
      { pattern: "regression scope|hồi quy|môi trường", name: "Regression & Environment Strategy", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "test tay 100%|không phân loại rủi ro|bỏ qua kiểm thử tự động", issue_code: "unprioritized_test_strategy_anti_pattern", description: "Cấm lên chiến lược chỉ test thủ công toàn bộ mà không phân tầng rủi ro.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "Core Banking Migration Test Strategy",
      prompt: "Lập chiến lược kiểm thử cho dự án chuyển đổi hệ thống Core Banking sang Microservices.",
      goodOutput: "# Chiến Lược Kiểm Thử (Test Strategy): Dự Án Chuyển Đổi Core Banking\n\n## 1. Risk-based Scoping & Impact Matrix\nPhân loại rủi ro thành 3 cấp: P0 (Giao dịch tiền tệ, hạch toán sổ cái), P1 (Xác thực sinh trắc học), P2 (Thông báo biến động số dư).\n\n## 2. Test Layer Distribution (Test Pyramid)\n- Tầng Unit Test (70%): Đảm bảo 100% logic tính lãi và đối soát số dư được bao phủ bằng unit test.\n- Tầng Integration/API Test (20%): Kiểm thử luồng gọi chéo giữa Payment Service và Account Service.\n- Tầng E2E/UI Test (10%): Kịch bản nạp/rút tiền end-to-end trên app di động.\n\n## 3. Entry & Exit Quality Gates\n- Entry Gate: Code coverage đạt >= 80%, không có lỗi sonar blocker.\n- Exit Gate: 100% test case P0 pass, 0 bug SEV-1 và SEV-2 còn mở.\n\n## 4. Regression & Environment Strategy\nChạy bộ regression tự động trên môi trường Staging có dữ liệu ẩn danh (Sanitized Production Data).",
      flawedOutput: "# Kế hoạch test\nTest tay 100% toàn bộ màn hình, không phân loại rủi ro gì cả.",
    },
    benchmarkRealistic: {
      name: "High-Frequency Crypto Trading Engine Microservices Test Strategy",
      prompt: "Thiết kế chiến lược đảm bảo chất lượng cho sàn giao dịch khớp lệnh microsecond với các cổng kiểm soát chất lượng tự động.",
      goodOutput: "# Enterprise Test Strategy: High-Frequency Crypto Order Matching Engine\n\n## 1. Risk-Based Scoping & Impact Probability Matrix\n- Rủi ro thảm họa (Severity 1): Race condition gây khớp lệnh 2 lần (Double Spending) hoặc sai lệch sổ lệnh (Orderbook Drift).\n- Rủi ro nghiêm trọng (Severity 2): Độ trễ khớp lệnh (P99 latency) vượt ngưỡng 5 miligiây.\n\n## 2. Test Layer Distribution & Coverage Allocation\n- Unit & Property-Based Testing (65%): Dùng `fast-check` sinh 100.000 kịch bản ngẫu nhiên kiểm tra tính giao hoán và kết hợp của hàm khớp lệnh.\n- Chaos & Concurrency Testing (20%): Kích hoạt mạng chậm và ngắt đột ngột node replica trong khi bơm 50.000 lệnh/giây.\n- E2E Automation Testing (15%): Kịch bản nạp tiền, đặt lệnh limit/market, và rút coin qua RPC node.\n\n## 3. Strict Entry & Exit Quality Gates\n- Entry Gate: 100% code mới có Unit Test, memory leak profiling không phát hiện rò rỉ RAM.\n- Exit Gate: Hệ thống chịu tải liên tục 4 giờ với 100.000 req/s mà không có bất kỳ sai lệch nào trên tài khoản Ledger.\n\n## 4. Regression Scope & Shadow Traffic Replay\nTriển khai cơ chế Shadow Replay: Nhân bản 10% traffic thực từ Production đổ vào cụm Staging để kiểm thử hồi quy ngầm trước khi release chính thức.",
      flawedOutput: "# Chiến lược kiểm thử sàn\nBỏ qua kiểm thử tự động, gom 5 bạn QC vào bấm tay test tay 100% cho nhanh.",
    },
  },

  "ui-screenshot-annotator": {
    id: "ui-screenshot-annotator",
    title: "UI Screenshot Annotation & SOP Packaging Rubric",
    description: "Evaluates coordinate accuracy, non-overlapping badge placement, directional callouts, and step-by-step SOP instructions.",
    taskType: "screenshot_annotation",
    taskName: "UI Screenshot Annotation Specification",
    requiredSections: [
      { pattern: "viewport|ngữ cảnh ảnh chụp|màn hình", name: "Screenshot Context & Viewport Bounds", severity: "critical" },
      { pattern: "bounding box|tọa độ|callout", name: "Coordinate-Accurate Callouts & Badges", severity: "critical" },
      { pattern: "visual flow|mũi tên|thứ tự", name: "Sequential Visual Flow & Directional Arrows", severity: "major" },
      { pattern: "sop|hướng dẫn thao tác|chú thích|operational guidance", name: "Step-by-Step SOP Operational Guidance", severity: "critical" },
    ],
    prohibitedPatterns: [
      { pattern: "badge đè lên chữ|che khuất nút|không đánh số", issue_code: "obscuring_annotation_anti_pattern", description: "Cấm đặt badge đè che mất chữ trên nút bấm hoặc gắn callout lộn xộn không số thứ tự.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "User Onboarding SOP Screenshot Annotations",
      prompt: "Lập đặc tả gắn chú thích ảnh chụp màn hình cho quy trình Tạo tài khoản nhân viên mới.",
      goodOutput: "# Hướng Dẫn Chú Thích Ảnh Chụp Màn Hình: Tạo Mới Nhân Viên\n\n## 1. Screenshot Context & Viewport Bounds\n- Tên màn hình: Quản Lý Nhân Sự -> Thêm Mới (/hr/employees/new).\n- Kích thước ảnh chuẩn: 1920x1080 (Desktop Full HD).\n\n## 2. Coordinate-Accurate Callouts & Badges\n- Badge [1]: Tọa độ `top: 140px, left: 320px` (Đặt phía trên nhãn 'Họ và tên', không đè chữ).\n- Badge [2]: Tọa độ `top: 220px, left: 320px` (Ngay cạnh ô chọn 'Phòng ban').\n- Badge [3]: Tọa độ `bottom: 80px, right: 120px` (Trỏ vào nút 'Lưu thông tin').\n\n## 3. Sequential Visual Flow & Directional Arrows\nMũi tên màu xanh Cyan `#06b6d4` nối từ Badge [1] -> [2] -> [3] theo luồng thao tác từ trên xuống dưới.\n\n## 4. Step-by-Step SOP Operational Guidance\n- Bước 1: Nhập họ tên đầy đủ theo giấy tờ tùy thân.\n- Bước 2: Chọn phòng ban trực thuộc từ menu thả xuống.\n- Bước 3: Nhấn nút Lưu và kiểm tra email kích hoạt tài khoản.",
      flawedOutput: "# Gắn hình\nBadge đè lên chữ che khuất nút bấm, gắn callout lung tung không đánh số thứ tự.",
    },
    benchmarkRealistic: {
      name: "Enterprise Multi-Factor Authentication Troubleshooting SOP Annotation Guide",
      prompt: "Thiết kế tài liệu chú thích ảnh màn hình hướng dẫn nhân viên IT Helpdesk xử lý sự cố thiết bị Token MFA bị mất đồng bộ.",
      goodOutput: "# Enterprise SOP: Khắc Phục Sự Cố Lệch Thời Gian Hardware Token MFA\n\n## 1. Screenshot Context & Viewport Bounds\n- Viewport: Bảng điều khiển quản trị viên Identity Provider (/admin/security/tokens).\n- Độ phân giải gốc: 2560x1440 Retina, tỷ lệ hiển thị co giãn chuẩn 100%.\n\n## 2. Coordinate-Accurate Callouts & Safe-Zone Offsets\n- **Callout [1] (Search Bar):** Bounding Box `x: 240, y: 88, w: 420, h: 42`. Thẻ Badge tròn số 1 màu xanh đặt tại `x: 215, y: 88` (Vùng an toàn bên ngoài mép trái input).\n- **Callout [2] (Drift Offset Status):** Bounding Box viền đỏ `rgba(239, 68, 68, 0.8)` quanh ô hiển thị '+120s Time Drift'.\n- **Callout [3] (Sync Button):** Khung viền nét đứt màu vàng Amber quanh nút `[Re-synchronize Token]`.\n\n## 3. Sequential Visual Flow & Focus Isolation\nLàm mờ nhẹ 30% các khu vực thông tin cá nhân xung quanh (Privacy Masking) để hướng sự tập trung của nhân viên Helpdesk vào chuỗi thao tác [1] -> [2] -> [3].\n\n## 4. Step-by-Step SOP Operational Guidance\n1. Bước 1: Tìm kiếm theo mã nhân viên hoặc Serial Number in trên mặt sau thiết bị phần cứng.\n2. Bước 2: Đối chiếu thông số Time Drift trên màn hình với đồng hồ nguyên tử chuẩn NTP.\n3. Bước 3: Nhấn nút 'Re-synchronize', yêu cầu nhân viên đọc 2 mã OTP liên tiếp để hoàn tất tái kích hoạt.",
      flawedOutput: "# Chú thích ảnh helpdesk\nGắn hình chụp vào, badge đè lên chữ che mất Serial Number và không đánh số thứ tự thao tác.",
    },
  },

  "web-prototyping": {
    id: "web-prototyping",
    title: "Web Prototyping Best Practices Rubric",
    description: "Evaluates modern frontend architecture (Vite/React/HTML), component hierarchy, responsive tokens, and micro-interactions.",
    taskType: "web_prototype_spec",
    taskName: "Web Prototype Architecture Specification",
    requiredSections: [
      { pattern: "tech stack|kiến trúc|framework", name: "Modern Tech Stack Architecture", severity: "critical" },
      { pattern: "component hierarchy|cấu trúc component|state", name: "Component Breakdown & State Management", severity: "critical" },
      { pattern: "responsive layout|design tokens|bảng màu", name: "Responsive Layout & Tailored Tokens", severity: "critical" },
      { pattern: "interactive states|micro-interactions|hover", name: "Interactive States & Micro-animations", severity: "major" },
    ],
    prohibitedPatterns: [
      { pattern: "nhét toàn bộ vào 1 file|monolith 5000 dòng|không có tương tác", issue_code: "monolithic_prototype_anti_pattern", description: "Cấm nhét mã nguồn nguyên khối vào 1 file duy nhất hoặc thiếu tương tác người dùng.", severity: "critical" },
    ],
    benchmarkBaseline: {
      name: "Interactive Kanban Task Board Prototype",
      prompt: "Lập đặc tả kiến trúc cho Prototype Bảng Kanban kéo thả bằng React và Tailwind/CSS.",
      goodOutput: "# Kiến Trúc Web Prototype: Bảng Quản Lý Công Việc Kanban Tương Tác\n\n## 1. Modern Tech Stack Architecture\n- Framework: React 18 + Vite giúp khởi động nhanh dưới 300ms.\n- Thư viện kéo thả: `@hello-pangea/dnd` mượt mà không giật khung hình.\n\n## 2. Component Breakdown & State Management\n- Cấu trúc: `KanbanBoard -> ColumnList -> KanbanCard -> TaskDetailModal`.\n- Quản lý trạng thái: Zustand lưu trữ danh sách tasks trong LocalStorage.\n\n## 3. Responsive Layout & Tailored Design Tokens\n- Bố cục: CSS Grid 3 cột trên Desktop, chuyển sang Horizontal Carousel vuốt tay trên Mobile.\n- Màu sắc: Nền Slate Dark `hsl(222, 47%, 11%)` kết hợp viền mờ Glassmorphism.\n\n## 4. Interactive States & Micro-animations\n- Kéo thả: Card phóng to nhẹ 1.02x kèm đổ bóng `box-shadow: 0 10px 25px rgba(0,0,0,0.3)`.\n- Hover nút: Chuyển màu mượt mà trong 200ms `transition: all 0.2s ease`.",
      flawedOutput: "# Làm web\nNhét toàn bộ vào 1 file code monolith 5000 dòng, không có tương tác gì hết.",
    },
    benchmarkRealistic: {
      name: "AI Agent Orchestration Flow Visualizer Interactive Workspace",
      prompt: "Thiết kế kiến trúc Web Prototype cho ứng dụng Trực quan hóa luồng phối hợp Đa Agent (Multi-Agent Workflow Designer).",
      goodOutput: "# Web Prototype Spec: Enterprise AI Agent Workflow Canvas\n\n## 1. Modern Tech Stack & Tooling Architecture\n- Core Runtime: React 19 + Vite + TypeScript với Strict Mode kích hoạt.\n- Canvas Engine: `@xyflow/react` (React Flow) hỗ trợ đồ thị node vô cực và minimap.\n- Styling: Vanilla CSS kết hợp CSS Modules và Custom Design Tokens chống đụng độ class.\n\n## 2. Component Hierarchy & Unidirectional State Flow\n- `WorkspaceRoot`: Quản lý top navbar và telemetry session.\n- `CanvasArea`: Chứa các node AgentNode, DecisionNode, và RouterEdge.\n- `InspectorSidebar`: Hiển thị thuộc tính node được chọn với JSON schema editor.\n- State Store: Redux Toolkit hoặc Zustand với cơ chế Undo/Redo (Time-travel debugging).\n\n## 3. Responsive Layout & Tailored Visual Tokens\n- Layout: CSS Flexbox 3 phân vùng (Left Palette 240px, Center Canvas auto, Right Panel 320px).\n- Dark Mode Glassmorphism Tokens: `rgba(15, 23, 42, 0.8)` kết hợp `backdrop-filter: blur(12px)`.\n\n## 4. Interactive States & Dynamic Micro-Interactions\n- Kết nối Node: Đường nối cáp phát sáng (Animated SVG Dasharray stroke) khi luồng dữ liệu đang chạy.\n- Trạng thái Agent: Vòng tròn Pulse tỏa sáng xung quanh avatar Agent khi đang suy nghĩ (Thinking state).",
      flawedOutput: "# Web app prototype\nViết đại nhét toàn bộ vào 1 file HTML duy nhất không có tương tác, không tách component.",
    },
  },
};

async function main() {
  const rootSkillsDir = path.join(process.cwd(), "skills");
  const allSkills = fs.readdirSync(rootSkillsDir).filter((f) => fs.statSync(path.join(rootSkillsDir, f)).isDirectory());

  console.log(`Bắt đầu thiết lập hệ thống Evaluation & Benchmarks cho toàn bộ ${allSkills.length} skills...`);

  let updatedCount = 0;

  for (const skill of allSkills) {
    const skillDir = path.join(rootSkillsDir, skill);
    const evalYamlPath = path.join(skillDir, "evaluation.yaml");
    const benchmarksDir = path.join(skillDir, "benchmarks");

    // Skip documentation-analysis as it already has bespoke rubrics and 3 full benchmarks
    if (skill === "documentation-analysis") {
      console.log(`- [SKIP] ${skill} (Đã có sẵn rubric và benchmarks hoàn chỉnh)`);
      continue;
    }

    const config = skillsConfig[skill];
    if (!config) {
      console.warn(`[WARN] Chưa có cấu hình bespoke cho skill: ${skill}`);
      continue;
    }

    // 1. Create / Update evaluation.yaml
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

    // 2. Create benchmarks directory & write tc-01-baseline.json + tc-02-realistic.json
    if (!fs.existsSync(benchmarksDir)) {
      fs.mkdirSync(benchmarksDir, { recursive: true });
    }

    // Benchmark 1: Baseline
    const tc01Data = {
      id: "tc-01",
      name: config.benchmarkBaseline.name,
      task_type: config.taskType,
      prompt: config.benchmarkBaseline.prompt,
      expected_sections: config.requiredSections.map((s) => s.name),
      sample_good_output: config.benchmarkBaseline.goodOutput,
      sample_flawed_output: config.benchmarkBaseline.flawedOutput,
    };
    fs.writeFileSync(
      path.join(benchmarksDir, "tc-01-baseline.json"),
      JSON.stringify(tc01Data, null, 2),
      "utf-8"
    );

    // Benchmark 2: Realistic Enterprise Scenario
    const tc02Data = {
      id: "tc-02",
      name: config.benchmarkRealistic.name,
      task_type: config.taskType,
      prompt: config.benchmarkRealistic.prompt,
      expected_sections: config.requiredSections.map((s) => s.name),
      sample_good_output: config.benchmarkRealistic.goodOutput,
      sample_flawed_output: config.benchmarkRealistic.flawedOutput,
    };
    fs.writeFileSync(
      path.join(benchmarksDir, "tc-02-realistic.json"),
      JSON.stringify(tc02Data, null, 2),
      "utf-8"
    );

    updatedCount++;
    console.log(`✔ [CONFIGURED] ${skill} -> evaluation.yaml + tc-01-baseline.json + tc-02-realistic.json`);
  }

  console.log(`\nHoàn thành! Đã cập nhật thành công ${updatedCount} skills với rubric và 2 bộ test case chuẩn.`);
}

main().catch(console.error);

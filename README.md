# AI Skills Collection

Kho lưu trữ và quản lý tập trung các kỹ năng chuyên biệt (**Skills**) dành cho Trợ lý Trí tuệ Nhân tạo (AI Agent - Google Antigravity). Hệ thống được chuẩn hóa theo năng lực cốt lõi, quy trình phát triển sản phẩm (SDLC) và sẵn sàng mở rộng cho nhiều đội ngũ cùng đóng góp.

---

## 🌟 Danh mục Kỹ năng (Skills Catalog)

### 1. 🎯 Product Strategy & Specification (Chiến lược & Đặc tả Nghiệp vụ)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`pm-questioning`](./skills/pm-questioning/) | 1.0.0 | Khung tư duy phản biện chiến lược của PM, bóc tách rủi ro ngầm qua First Principles, Pre-Mortem, Second-Order Thinking. | Antigravity & DuyHo |
| [`documentation-analysis`](./skills/documentation-analysis/) | 1.0.0 | Bộ khung mẫu phân tích yêu cầu (BRD, PRD, FRD), ma trận truy vết và chuẩn hóa format đẩy dữ liệu Notion. | Antigravity & DuyHo |
| [`doc-writing-process`](./skills/doc-writing-process/) | 1.0.0 | Quy trình soạn thảo tài liệu theo từng phase có kiểm soát, cơ chế tự phản biện đa tác tử và cổng duyệt (sign-off gate). | Antigravity & DuyHo |

### 2. 🎨 UX & Interactive Prototyping (Thiết kế & Nguyên mẫu Tương tác)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`ui-ux-design`](./skills/ui-ux-design/) | 1.0.0 | Tiêu chuẩn thiết kế giao diện hiện đại: Design tokens, bảng màu, glassmorphism, micro-animations mượt mà. | Antigravity & DuyHo |
| [`web-prototyping`](./skills/web-prototyping/) | 1.0.0 | Dựng nhanh web prototype tương tác (React, HTML/CSS, Angular) phục vụ Proof of Concept (PoC). | Antigravity & DuyHo |

### 3. 🛡️ Quality Engineering & Testing (Kiểm thử & Đảm bảo Chất lượng)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`testing-quality`](./skills/testing-quality/) | 1.0.0 | Thiết kế chiến lược kiểm thử, kịch bản tự động hóa API và UI E2E test với Playwright / Cypress. | Antigravity & DuyHo |

### 4. 🧠 Cognitive Science & People Development (Khoa học Nhận thức & Đào tạo)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`cognitive-scaffolding`](./skills/cognitive-scaffolding/) | 1.0.0 | Khung bắc cầu nhận thức, cấu trúc bài viết và giải pháp theo Minto Pyramid, Golden Circle, Causal Value Chains. | Antigravity & DuyHo |
| [`feynman-explainer`](./skills/feynman-explainer/) | 1.0.0 | Giải thích mọi khái niệm kỹ thuật phức tạp theo kỹ thuật Feynman (ngôn ngữ bình dân, ví von trực quan). | Antigravity & DuyHo |
| [`ai-curriculum-designer`](./skills/ai-curriculum-designer/) | 1.0.0 | Thiết kế lộ trình học tập chủ động và giáo trình đào tạo chuyên sâu (dựa theo format Xperc Talk Show). | Antigravity & DuyHo |
| [`ai-agile-evaluator`](./skills/ai-agile-evaluator/) | 1.0.0 | Khung đánh giá năng lực thực chiến Agile và phỏng vấn tình huống cho BA/QC theo thang điểm Rubric. | Antigravity & DuyHo |

### 5. ⚙️ Document Engine & Tooling (Công cụ Tự động hóa & Xuất bản)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`pdf-creator`](./skills/pdf-creator/) | 1.0.0 | Engine biên dịch Markdown/HTML/DOCX sang PDF A4 chuẩn in ấn, hỗ trợ tiếng Việt, Mermaid, KaTeX, chống gãy trang. | Antigravity & DuyHo |

---

## 📂 Cấu trúc Thư mục

```text
ai-skills-collection/
├── README.md                      # Bảng mục lục, hướng dẫn sử dụng và tra cứu
├── CONTRIBUTING.md                # Quy định và quy chuẩn đóng góp skill mới
├── registry.json                  # Metadata tổng hợp toàn bộ skills (JSON schema)
├── .agents/
│   └── skills.json                # Tự động nạp toàn bộ skills vào Antigravity Agent
├── plugin.json                    # Antigravity Plugin manifest (pm-engineering-suite)
├── skills/                        # Flat Antigravity Skills directory
│   ├── pm-questioning/            # Phản biện rủi ro PM
│   ├── documentation-analysis/    # Khung phân tích BRD/PRD/FRD
│   ├── doc-writing-process/       # Quy trình soạn thảo 2-tier sub-agent review
│   ├── ui-ux-design/              # Design tokens, aesthetics
│   ├── web-prototyping/           # Rapid web prototyping
│   ├── testing-quality/           # Automated testing & quality gates
│   ├── cognitive-scaffolding/     # Khung bắc cầu nhận thức
│   ├── feynman-explainer/         # Kỹ thuật giải thích Feynman
│   ├── ai-agile-evaluator/        # Đánh giá năng lực Agile BA/QC
│   ├── ai-curriculum-designer/    # Thiết kế giáo trình Talk Show
│   └── pdf-creator/               # Engine xuất PDF A4 chuyên nghiệp
└── templates/
    └── skill-template/            # Mẫu chuẩn khởi tạo skill mới
```

---

## 🚀 Cách sử dụng trong Antigravity

Repository đã cấu hình sẵn file [`.agents/skills.json`](./.agents/skills.json). Khi bạn mở workspace này trong Antigravity, toàn bộ các skills trong 5 domain trên sẽ được nạp tự động vào phiên làm việc.

Nếu muốn kế thừa kho skill này vào một project khác, bạn chỉ cần thêm đường dẫn repo vào cấu hình `.agents/skills.json` của project đó:
```json
{
  "inherits": [
    {
      "path": "/path/to/ai-skills-collection/.agents/skills.json"
    }
  ]
}
```

---

## 📊 Hệ thống Đánh giá & Báo cáo Tự động (AI Skills Evaluation System)

Dự án tích hợp sẵn hệ thống đo lường chất lượng thực tế cho **toàn bộ 20 AI Skills** dựa trên bằng chứng (Evidence-based):
* **Local Evaluator (CLI):** Chạy kiểm thử tự động kịch bản mẫu cho 1 skill (`npm run eval`) hoặc **chạy toàn bộ 20 skills** (`npm run eval:all`).
* **Telemetry & Ingestion Server:** Máy chủ thu thập dữ liệu tối thiểu hóa (Strict Data Minimization) với cơ chế Opt-in minh bạch (`npm run eval:all:send`).
* **Báo cáo định kỳ:** Tự động tổng hợp Pass rate ma trận 20 skills, Top lỗi thường gặp và gửi email báo cáo tuần: `npm run report`.

👉 **Xem hướng dẫn chi tiết và cách bàn giao tại:** [`docs/evaluation-guide.md`](./docs/evaluation-guide.md)

---

## 🤝 Đóng góp Kỹ năng mới
Xem hướng dẫn chi tiết tại [CONTRIBUTING.md](./CONTRIBUTING.md).


# AI Skills Collection

Kho lưu trữ và quản lý tập trung các kỹ năng chuyên biệt (**Skills**) dành cho Trợ lý Trí tuệ Nhân tạo (AI Agent - Google Antigravity). Hệ thống được chuẩn hóa theo năng lực cốt lõi, quy trình phát triển sản phẩm (SDLC) và sẵn sàng mở rộng cho nhiều đội ngũ cùng đóng góp.

---

## 🌟 Danh mục Kỹ năng (Skills Catalog)

### 1. 🎯 Product Strategy & Specification (Chiến lược & Đặc tả Nghiệp vụ)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`pm-questioning`](./skills/product-strategy/pm-questioning/) | 1.0.0 | Khung tư duy phản biện chiến lược của PM, bóc tách rủi ro ngầm qua First Principles, Pre-Mortem, Second-Order Thinking. | Antigravity & DuyHo |
| [`documentation-analysis`](./skills/product-strategy/documentation-analysis/) | 1.0.0 | Bộ khung mẫu phân tích yêu cầu (BRD, PRD, FRD), ma trận truy vết và chuẩn hóa format đẩy dữ liệu Notion. | Antigravity & DuyHo |
| [`doc-writing-process`](./skills/product-strategy/doc-writing-process/) | 1.0.0 | Quy trình soạn thảo tài liệu theo từng phase có kiểm soát, cơ chế tự phản biện đa tác tử và cổng duyệt (sign-off gate). | Antigravity & DuyHo |

### 2. 🎨 UX & Interactive Prototyping (Thiết kế & Nguyên mẫu Tương tác)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`ui-ux-design`](./skills/design-prototyping/ui-ux-design/) | 1.0.0 | Tiêu chuẩn thiết kế giao diện hiện đại: Design tokens, bảng màu, glassmorphism, micro-animations mượt mà. | Antigravity & DuyHo |
| [`web-prototyping`](./skills/design-prototyping/web-prototyping/) | 1.0.0 | Dựng nhanh web prototype tương tác (React, HTML/CSS, Angular) phục vụ Proof of Concept (PoC). | Antigravity & DuyHo |

### 3. 🛡️ Quality Engineering & Testing (Kiểm thử & Đảm bảo Chất lượng)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`testing-quality`](./skills/quality-engineering/testing-quality/) | 1.0.0 | Thiết kế chiến lược kiểm thử, kịch bản tự động hóa API và UI E2E test với Playwright / Cypress. | Antigravity & DuyHo |

### 4. 🧠 Cognitive Science & People Development (Khoa học Nhận thức & Đào tạo)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`cognitive-scaffolding`](./skills/cognitive-learning/cognitive-scaffolding/) | 1.0.0 | Khung bắc cầu nhận thức, cấu trúc bài viết và giải pháp theo Minto Pyramid, Golden Circle, Causal Value Chains. | Antigravity & DuyHo |
| [`feynman-explainer`](./skills/cognitive-learning/feynman-explainer/) | 1.0.0 | Giải thích mọi khái niệm kỹ thuật phức tạp theo kỹ thuật Feynman (ngôn ngữ bình dân, ví von trực quan). | Antigravity & DuyHo |
| [`ai-curriculum-designer`](./skills/cognitive-learning/ai-curriculum-designer/) | 1.0.0 | Thiết kế lộ trình học tập chủ động và giáo trình đào tạo chuyên sâu (dựa theo format Xperc Talk Show). | Antigravity & DuyHo |
| [`ai-agile-evaluator`](./skills/cognitive-learning/ai-agile-evaluator/) | 1.0.0 | Khung đánh giá năng lực thực chiến Agile và phỏng vấn tình huống cho BA/QC theo thang điểm Rubric. | Antigravity & DuyHo |

### 5. ⚙️ Document Engine & Tooling (Công cụ Tự động hóa & Xuất bản)
| Kỹ năng | Phiên bản | Mô tả tóm tắt | Tác giả |
| :--- | :--- | :--- | :--- |
| [`pdf-creator`](./skills/tooling-automation/pdf-creator/) | 1.0.0 | Engine biên dịch Markdown/HTML/DOCX sang PDF A4 chuẩn in ấn, hỗ trợ tiếng Việt, Mermaid, KaTeX, chống gãy trang. | Antigravity & DuyHo |

---

## 📂 Cấu trúc Thư mục

```text
ai-skills-collection/
├── README.md                      # Bảng mục lục, hướng dẫn sử dụng và tra cứu
├── CONTRIBUTING.md                # Quy định và quy chuẩn đóng góp skill mới
├── registry.json                  # Metadata tổng hợp toàn bộ skills (JSON schema)
├── .agents/
│   └── skills.json                # Tự động nạp toàn bộ skills vào Antigravity Agent
├── skills/
│   ├── product-strategy/          # Domain 1: Chiến lược & Đặc tả
│   ├── design-prototyping/        # Domain 2: Thiết kế UI & Prototyping
│   ├── quality-engineering/       # Domain 3: Kiểm thử & Đảm bảo Chất lượng
│   ├── cognitive-learning/        # Domain 4: Khoa học Nhận thức & Đào tạo
│   └── tooling-automation/        # Domain 5: Công cụ & Xuất bản
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

## 🤝 Đóng góp Kỹ năng mới
Xem hướng dẫn chi tiết tại [CONTRIBUTING.md](./CONTRIBUTING.md).

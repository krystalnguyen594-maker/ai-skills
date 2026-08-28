# Contributing to AI Skills Collection

Cảm ơn bạn đã quan tâm đóng góp kỹ năng (Skills) vào kho lưu trữ chung `ai-skills-collection`. Tài liệu này hướng dẫn quy chuẩn và quy trình đóng góp để đảm bảo chất lượng và tính tương thích trên hệ thống AI Agent (Antigravity).

---

## 1. Nguyên tắc cốt lõi khi tạo Skill
1. **Single Responsibility**: Mỗi skill chỉ giải quyết một bài toán hoặc quy trình cụ thể, không ôm đồm nhiều lĩnh vực khác nhau.
2. **Progressive Disclosure**: Giữ file `SKILL.md` súc tích, tinh gọn. Các tài liệu hướng dẫn dài, mẫu ví dụ hoặc cẩm nang chi tiết nên được đặt trong thư mục con `references/` hoặc `examples/` để tiết kiệm context window của mô hình.
3. **Actionable Procedures**: Cung cấp các bước thực thi rõ ràng (Step 1, Step 2, Step 3...), checklist kiểm tra tính đúng đắn (Verification) và tiêu chuẩn nghiệm thu đầu ra.
4. **Third-Person Description**: Phần `description` trong YAML frontmatter phải viết ở ngôi thứ ba, chỉ rõ **khi nào** AI nên kích hoạt skill này (Trigger conditions).

---

## 2. Cấu trúc một Skill chuẩn

Mỗi skill bắt buộc phải là một thư mục riêng biệt nằm trong đúng Domain tương ứng:

```text
skills/<domain-name>/<skill-name>/
├── SKILL.md          # [Bắt buộc] File hướng dẫn chính kèm YAML frontmatter
├── scripts/          # [Tùy chọn] Các script tự động hóa (Python, Bash, JS)
├── examples/         # [Tùy chọn] File ví dụ mẫu, test case tham chiếu
├── resources/        # [Tùy chọn] Assets, templates tĩnh
└── references/       # [Tùy chọn] Hướng dẫn chuyên sâu, cẩm nang nghiệp vụ
```

Bạn có thể copy template mẫu tại [`templates/skill-template/`](./templates/skill-template/) để bắt đầu.

---

## 3. Quy chuẩn YAML Frontmatter trong `SKILL.md`

```yaml
---
name: your-skill-name
description: >-
  Mô tả rõ ràng chức năng của skill và ĐIỀU KIỆN KÍCH HOẠT (Triggers).
  Viết theo ngôi thứ ba.
metadata:
  author: "Tên Tác Giả / Đội Ngũ"
  team: "Đơn vị (ví dụ: Xperc, QC Team, BA Team, Community)"
  version: "1.0.0"
  domain: "product-strategy | design-prototyping | quality-engineering | cognitive-learning | tooling-automation"
  license: "MIT"
---
```

---

## 4. Các bước gửi đóng góp (Pull Request)

1. **Chọn đúng Domain**:
   - `skills/product-strategy/`: Chiến lược, phân tích yêu cầu, tài liệu BRD/PRD.
   - `skills/design-prototyping/`: Thiết kế UI/UX, tokens, prototype web.
   - `skills/quality-engineering/`: Kiểm thử tự động API/E2E, tiêu chuẩn chất lượng.
   - `skills/cognitive-learning/`: Khung nhận thức, giải thích khái niệm, đào tạo & đánh giá năng lực.
   - `skills/tooling-automation/`: Tool xuất bản, scripts biên dịch, tự động hóa dữ liệu.
2. **Khởi tạo skill** theo template tại `templates/skill-template/`.
3. **Cập nhật `registry.json`**: Thêm thông tin skill mới vào mảng `"skills"` trong file `registry.json`.
4. **Cập nhật `README.md`**: Bổ sung skill vào bảng mục lục tra cứu.
5. **Tự kiểm tra (Self-Check)**:
   - File `SKILL.md` có đầy đủ YAML frontmatter hợp lệ không?
   - Không chứa thông tin nhạy cảm (API keys, credentials, secret token).
   - Đã test thử nghiệm prompt kích hoạt với Antigravity chưa?
6. **Tạo Git Commit & Pull Request**:
   - Commit message rõ ràng: `feat(skill): add <skill-name> to <domain>`

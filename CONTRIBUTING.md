# Contributing to AI Skills Collection

Cảm ơn bạn đã quan tâm đóng góp kỹ năng (Skills) vào kho lưu trữ chung `ai-skills-collection`. Tài liệu này hướng dẫn quy chuẩn và quy trình đóng góp để đảm bảo chất lượng và tính tương thích trên hệ thống AI Agent (Antigravity).

---

## 1. Nguyên tắc cốt lõi khi tạo Skill
1. **Single Responsibility**: Mỗi skill chỉ giải quyết một bài toán hoặc quy trình cụ thể, không ôm đồm nhiều lĩnh vực khác nhau.
2. **Progressive Disclosure**: Giữ file `SKILL.md` súc tích, tinh gọn. Các tài liệu hướng dẫn dài, mẫu ví dụ hoặc cẩm nang chi tiết nên được đặt trong thư mục con `references/` hoặc `examples/` để tiết kiệm context window của mô hình.
3. **Actionable Procedures**: Cung cấp các bước thực thi rõ ràng (Step 1, Step 2, Step 3...), checklist kiểm tra tính đúng đắn (Verification) và tiêu chuẩn nghiệm thu đầu ra.
4. **Third-Person Description**: Phần `description` trong YAML frontmatter phải viết ở ngôi thứ ba, chỉ rõ **khi nào** AI nên kích hoạt skill này (Trigger conditions).

---

## 2. Cấu trúc một Skill chuẩn (Standard Skill Structure)

Mỗi skill bắt buộc phải là một thư mục riêng biệt nằm trong `skills/<skill-name>/` và tích hợp sẵn bộ kiểm thử:

```text
skills/<skill-name>/
├── SKILL.md             # [Bắt buộc] File hướng dẫn chính kèm YAML frontmatter
├── evaluation.yaml      # [Bắt buộc] Bộ tiêu chí thẩm định chất lượng tự động (Rubric & Quality Gates)
├── benchmarks/          # [Bắt buộc] Bộ kịch bản kiểm thử đối chứng hồi quy
│   └── tc-01-baseline.json  # Tối thiểu 1 case gồm cả sample_good_output và sample_flawed_output
├── scripts/             # [Tùy chọn] Các script tự động hóa (Python, Bash, JS)
├── examples/            # [Tùy chọn] File ví dụ mẫu, test case tham chiếu
└── references/          # [Tùy chọn] Hướng dẫn chuyên sâu, cẩm nang nghiệp vụ
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

## 4. Tiêu chuẩn Thẩm định Tự động (`evaluation.yaml` & `benchmarks/`)

Từ phiên bản hiện tại, mọi skill mới nộp vào kho lưu trữ đều phải đi kèm bộ đánh giá tự động:
1. **File `evaluation.yaml`**: Định nghĩa các mục bắt buộc (`required_sections`), các phản mẫu bị cấm (`prohibited_patterns`), thang điểm Rubric và ngưỡng đạt chuẩn `pass_threshold: 80`.
2. **File `benchmarks/tc-01-baseline.json`**: Chứa ít nhất 1 kịch bản kiểm thử gồm:
   - `sample_good_output`: Đầu ra mẫu chuẩn chỉ (phải đạt điểm $\ge 80$).
   - `sample_flawed_output`: Đầu ra mẫu cố tình vi phạm (phải bị đánh rớt $< 80$ và phát hiện đúng mã lỗi).

---

## 5. Các bước gửi đóng góp (Pull Request Checklist)

1. **Khởi tạo thư mục skill**: Tạo tại `skills/<skill-name>/`.
2. **Soạn thảo `SKILL.md`**: Viết hướng dẫn chuẩn xác, actionable, tuân thủ nguyên tắc độc lập theo nhu cầu (*Independent On-demand*).
3. **Tạo `evaluation.yaml` & `benchmarks/`**: Thiết lập bộ rubric và bài test mẫu.
4. **Tự kiểm tra (Self-Check qua CLI)**:
   ```bash
   # Chạy thẩm định cục bộ cho skill mới của bạn:
   npm run eval <skill-name>
   ```
   *Yêu cầu nghiệm thu:* Mẫu Good phải đạt `PASS` ($\ge 80$), mẫu Flawed phải đạt `FAIL` ($< 80$) với lỗi được phát hiện rõ ràng.
5. **Cập nhật `README.md` & `registry.json`**: Bổ sung skill vào bảng mục lục tra cứu.
6. **Tạo Git Commit & Pull Request**:
   - Commit message: `feat(skill): add <skill-name> with automated evaluation rubric`

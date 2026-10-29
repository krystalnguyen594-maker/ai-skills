# Quy Trình Kiểm Định Chất Lượng & Phản Hồi Bắt Buộc (Mandatory Evaluation & Quality Gate Workflow)

> **Phạm vi áp dụng:** Áp dụng cho TOÀN BỘ các phiên làm việc khi Agent sử dụng bất kỳ kỹ năng nào trong kho 20 skills (`skills/*`) hoặc khi tạo lập các tài liệu nghiệp vụ, thiết kế kỹ thuật, kế hoạch dự án và kiểm thử phần mềm.

---

## 1. NGUYÊN TẮC VẬN HÀNH 3 CHẶNG (3-TIER OPERATIONAL PIPELINE)

Mọi phản hồi tạo lập tài liệu từ kỹ năng PHẢI tuân thủ đầy đủ và không được bỏ sót bất kỳ chặng nào trong 3 chặng sau:

```
[ Chặng 1: Soạn Thảo Chuyên Môn ] ➔ [ Chặng 2: Thẻ Kiểm Định Chất Lượng ] ➔ [ Chặng 3: Khung Phản Hồi Tương Tác ]
```

---

## 2. CHI TIẾT TỪNG CHẶNG THỰC THI

### Chặng 1: Soạn Thảo Chuyên Môn Theo `SKILL.md`
* Nạp và tuân thủ nghiêm ngặt các quy tắc chuyên môn (Hard Rules), cấu trúc đầu ra, và chuẩn mực nghiệp vụ được định nghĩa trong file `skills/<tên-skill>/SKILL.md`.
* Ưu tiên tính chuẩn mực, tính thực chiến, không viết lý thuyết chung chung.

---

### Chặng 2: Tự Động Thẩm Định & Gắn Thẻ Điểm (AI Quality Scorecard)
Ngay sau khi kết thúc nội dung tài liệu của Chặng 1, Agent **BẮT BUỘC** phải đọc file `skills/<tên-skill>/evaluation.yaml` tương ứng để tự chấm điểm đối soát khách quan và in khối Thẻ Điểm chuẩn:

```markdown
---

### BẢNG THẺ KIỂM ĐỊNH CHẤT LƯỢNG (AI QUALITY SCORECARD)

┌────────────────────────────────────────────────────────────────────────┐
│  KHO AI SKILLS — KẾT QUẢ KIỂM ĐỊNH TỰ ĐỘNG (QUALITY GATE)               │
├────────────────────────────────────────────────────────────────────────┤
│  Kỹ năng áp dụng:  <tên-skill> (Phiên bản: 1.0.0)                       │
│  Tác vụ thẩm định: <task_type trong evaluation.yaml>                   │
│  Thời gian quét:   <ISO 8601 Timestamp>                                │
├────────────────────────────────────────────────────────────────────────┤
│  KẾT QUẢ CHUNG:    PASS (≥ 80đ) hoặc FAIL (< 80đ / Vi phạm cấm kỵ)     │
│  ĐIỂM TỔNG HỢP:    <Điểm số> / 100 ĐIỂM                                │
│  CỜ LÀM LẠI:       reworkRequired = <true / false>                     │
└────────────────────────────────────────────────────────────────────────┘

#### Chi tiết điểm số theo các chiều chất lượng (Rubric Breakdown):
| Chiều chất lượng (Dimension) | Trọng số (Weight) | Điểm số | Trạng thái | Đánh giá đối soát chi tiết |
| :--- | :---: | :---: | :---: | :--- |
| **Độ đầy đủ (Completeness)** | ...% | .../100 | ĐẠT/CHƯA ĐẠT | Đối soát các required_sections trong YAML |
| **Tính chặt chẽ (Soundness)** | ...% | .../100 | ĐẠT/CHƯA ĐẠT | Quét lỗi cấm prohibited_patterns |
| **Tính khả thi (Actionability)** | ...% | .../100 | ĐẠT/CHƯA ĐẠT | Đánh giá tính ứng dụng, bước thực hiện |
| **Định dạng & rõ ràng (Clarity)** | ...% | .../100 | ĐẠT/CHƯA ĐẠT | Đánh giá Markdown, cấu trúc tiêu đề |

* **Danh mục lỗi vi phạm:** <Liệt kê mã lỗi hoặc "None">
* **Nhận xét của máy chấm:** <Nhận xét khách quan dựa trên tiêu chuẩn rubric>
```

---

### Chặng 3: Khung Tiếp Nhận Phản Hồi Tương Tác 1-Chạm (Interactive Feedback Modal qua Tool `ask_question`)

Ngay sau khi in xong Thẻ Điểm, Agent **BẮT BUỘC PHẢI GỌI TOOL `ask_question`** để mở hộp thoại tương tác đồ họa (Interactive Modal Popup) với các nút bấm chọn 1-chạm trực tiếp trên IDE, **tuyệt đối không bắt người dùng phải gõ chữ/số thủ công vào ô chat**:

1. **Cấu trúc gọi Tool `ask_question` bắt buộc:**
   * **`question`:** "Bạn đánh giá thế nào về sản phẩm <tên-tài-liệu> vừa được tạo?"
   * **`is_multi_select`:** `false`
   * **`options`:**
     * `(Recommended) [1] Rất hài lòng (Dùng được ngay, không cần sửa đổi)`
     * `[2] Cần chi tiết hóa thêm (Thêm sâu vào kỹ thuật, API, Schema)`
     * `[3] Cần điều chỉnh phạm vi (Thay đổi bài toán, bổ sung ca biên)`
     *(Lưu ý: Tool `ask_question` đã tự động tích hợp sẵn ô "Other" write-in để người dùng nhập ý kiến tùy biến)*

2. **Tự động đồng bộ Telemetry vào `server/data/eval.db`:**
   * Ngay khi người dùng nhấn nút Submit trên giao diện Modal:
     * Nếu chọn `[1] Rất hài lòng` ➔ Ghi nhận sự kiện `rework_required = 0` (Thành công 100%).
     * Nếu chọn `[2]`, `[3]` hoặc nhập ý kiến riêng ➔ Ghi nhận `rework_required = 1` và lập tức cập nhật lại văn bản theo đúng phản hồi của người dùng.

---

## 3. CÁC QUY TẮC CẤM KỴ (PROHIBITED BEHAVIORS)
* **CẤM** chỉ trả về nội dung tài liệu mà bỏ qua Thẻ Điểm hoặc bỏ qua việc gọi tool `ask_question`.
* **CẤM** chỉ in text danh sách `[1], [2], [3]` trong câu trả lời bắt người dùng gõ số, khi môi trường Antigravity IDE có sẵn công cụ đồ họa `ask_question`.
* **CẤM** tự ý chấm điểm 100/100 nếu tài liệu thực tế còn thiếu các mục bắt buộc trong `evaluation.yaml`.
* **CẤM** gật đầu đồng ý bài viết đạt `PASS` nếu dính bất kỳ mã lỗi nghiêm trọng nào thuộc `prohibited_patterns` (bắt buộc kích hoạt cơ chế `instant_fail` và đánh `FAIL`).

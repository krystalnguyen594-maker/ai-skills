# TÀI LIỆU CHUYỂN GIAO KỸ THUẬT CHO KHÁCH HÀNG (CLIENT TRANSFER GUIDE)
## HỆ THỐNG ĐÁNH GIÁ CHẤT LƯỢNG KỸ NĂNG AI (AI SKILLS EVALUATION SYSTEM)

> **Mục tiêu chuyển giao:** Cung cấp tài liệu vận hành chính thức cho đối tác/khách hàng. Tài liệu giải thích chi tiết cơ chế đối soát tài liệu tự động (Quality Gate) ngay tại phiên chat, hướng dẫn người dùng khai thác kỹ năng đạt chuẩn, và bàn giao quy trình quản trị kho kỹ năng định lượng cho đội ngũ kỹ thuật của khách hàng.

---

## 1. SO SÁNH TOÀN DIỆN: TRƯỚC VÀ SAU KHI CÓ HỆ THỐNG EVALUATION

| Tiêu chí | Trước đây (Mô hình Prompt tĩnh) | Hiện tại (Tích hợp Hệ Thống Evaluation) |
| :--- | :--- | :--- |
| **Cơ chế tạo tài liệu** | AI sinh văn bản theo cảm tính dựa vào hướng dẫn tĩnh (`SKILL.md`), hoàn toàn không có khâu tự kiểm duyệt. | AI tạo văn bản và **tự động đối soát ngay lập tức** với Bộ tiêu chuẩn chất lượng (`evaluation.yaml`) trước khi trả kết quả. |
| **Độ đồng đều đầu ra** | Chất lượng thất thường; thường xuyên thiếu kịch bản kiểm thử (Gherkin) hoặc ma trận truy vết yêu cầu (Traceability Matrix). | **Cam kết bởi Cổng Chất Lượng (Quality Gate)**: Chỉ xác nhận ĐẠT (`PASS`) khi đủ 100% mục bắt buộc và đạt từ 80/100 điểm. |
| **Phát hiện lỗi rò rỉ** | Người đọc phải tự soi từng dòng xem AI có viết nhầm mã code hoặc SQL kỹ thuật vào tài liệu nghiệp vụ (PRD/FRD) không. | **Quét mã cấm tức thời**: Tự động phát hiện lỗi cấm kỵ (như rò rỉ SQL vào FRD) và kích hoạt cơ chế đánh trượt ngay (*Instant Fail*). |
| **Đo lường & Phản hồi** | Mù số liệu: Không có dữ liệu đo lường chất lượng, người dùng gặp lỗi chỉ biết tự sửa tay trong âm thầm. | **Minh bạch 100%**: Tự động ghi nhận tỷ lệ Đạt chuẩn (Pass Rate), tỷ lệ phải làm lại (Rework Rate) và danh mục lỗi thường gặp. |
| **Quy trình bảo trì** | Quản trị viên sửa prompt theo phán đoán chủ quan, không đo lường được hiệu quả can thiệp. | **Tối ưu hóa dựa trên số liệu thực chứng**: Dựa vào Báo Cáo Tuần để xác định chính xác câu chữ prompt cần hiệu chỉnh. |

---

## 2. GIÁ TRỊ CỐT LÕI MANG LẠI CHO KHÁCH HÀNG

### 1. Cho Đội Ngũ Sản Phẩm (PM, BA, QC, Developers)
* **Tiết kiệm thời gian rà soát:** Loại bỏ việc phải đọc lại để kiểm tra các mục hình thức bắt buộc.
* **Đầu ra sẵn sàng sử dụng:** Mọi tài liệu (PRD, BRD, WBS, Test Specs) đồng nhất và đạt chuẩn nghiệm thu.
* **Góp ý tức thời:** Tương tác trực tiếp qua nút Feedback để phản ánh chất lượng cho quản trị viên.

### 2. Cho Bộ Phận Kỹ Thuật (Tech Lead, Repo Owner, Admins)
* **Quản trị dựa trên dữ liệu:** Báo cáo tuần định lượng chính xác hiệu năng của từng kỹ năng trong kho 20 skills.
* **Can thiệp trúng đích:** Bảng lỗi chỉ rõ nguyên nhân cụ thể để sửa đúng câu chữ trong prompt.
* **An toàn khi phát hành:** Bộ Benchmark kiểm tra đối chứng trước tại máy, chống phát sinh lỗi cũ.

### 3. Cho Tổ Chức & Dự Án
* **Chuẩn hóa toàn diện SDLC:** Toàn bộ tài liệu nghiệp vụ và kỹ thuật tuân thủ ngôn ngữ chung.
* **Bảo mật tối đa:** Nguyên tắc *Strict Data Minimization* đảm bảo không gửi dữ liệu dự án mật ra ngoài.
* **Chống suy giảm chất lượng:** Duy trì chất lượng AI ổn định và cải tiến liên tục theo thời gian.

---

## 3. BỘ 4 THƯỚC ĐO ĐỊNH LƯỢNG CHẤT LƯỢNG KỸ NĂNG

Thay thế hoàn toàn nhận định cảm tính bằng **4 chỉ số định lượng khách quan**:

1. **Thước đo 1: Điểm số bài làm tức thì (≥ 80 / 100 điểm)**
   * Mỗi tài liệu sinh ra đều được chấm theo thang điểm 100 và quét lỗi cấm kỵ.
   * Nếu ≥ 80 điểm và 0 lỗi cấm ➔ **ĐẠT (PASS)**: Sản phẩm đạt chuẩn chuyên nghiệp ngay tại phiên chat.
2. **Thước đo 2: Tỷ lệ Đạt Chuẩn Tuần (Weekly Pass Rate ≥ 80%)**
   * Theo dõi trong Báo Cáo Tuần:
     * **Pass Rate ≥ 80%** ➔ Hoạt động xuất sắc & Ổn định.
     * **Pass Rate 50% - 79%** ➔ Tạm ổn / Cần quan sát thêm.
     * **Pass Rate < 50%** ➔ Chưa đạt chuẩn: Đa số người dùng chạy đều bị thiếu mục hoặc lỗi.
3. **Thước đo 3: Tỷ lệ Phải Chỉnh Sửa (Rework Rate < 20%)**
   * Đo lường sự hài lòng thực tế của người dùng:
     * **Rework Rate thấp (< 15 - 20%):** Đa số người dùng chọn *"Rất hài lòng, dùng được ngay"* ➔ Skill đáp ứng đúng nhu cầu.
     * **Rework Rate cao (> 40%):** Người dùng liên tục bấm *"Cần bổ sung/sửa đổi"* ➔ Prompt của skill đang thiếu ý, cần cập nhật.
4. **Thước đo 4: Kiểm Thử Đối Chứng (Benchmark Regression Test)**
   * Mỗi khi cập nhật `SKILL.md`, chỉ cần gõ `npm run eval <tên-skill>`:
   * Nếu bài mẫu chuẩn (`Good`) đạt ≥ 80 điểm và bài viết ẩu (`Flawed`) bị máy chỉ ra đúng lỗi ➔ Bộ quy chuẩn của skill đang kiểm soát chất lượng cực kỳ chặt chẽ.

> **Cơ chế định danh lỗi chính xác:**  
> Hệ thống không chỉ dừng lại ở việc kết luận *"Tốt hay Chưa tốt"*, mà nếu chưa tốt, nó **chỉ đích danh mã lỗi kỹ thuật** (ví dụ: `missing_gherkin_scenarios` hoặc `missing_traceability_matrix`) để Quản trị viên **biết chính xác câu nào cần sửa trong `SKILL.md`!**

---

## 4. KIẾN TRÚC BỘ MÁY CHẤM ĐIỂM ĐỘNG (CONFIG-DRIVEN UNIVERSAL EVALUATION ENGINE) & BENCHMARKS

Để đảm bảo tính khách quan và khả năng mở rộng không giới hạn cho toàn bộ 20 kỹ năng trong kho AI Skills, hệ thống áp dụng kiến trúc **Config-Driven Universal Evaluator**:

### 4.1. Một Engine Chấm Điểm Dùng Chung (`rubric-evaluator.ts`) — Không Hardcode Nghiệp Vụ
* **Nguyên lý thiết kế:** Bộ máy đánh giá ([evaluation/src/judge/rubric-evaluator.ts](file:///Users/krystalnguyen/Documents/ai-skills/ai-skills/evaluation/src/judge/rubric-evaluator.ts)) hoạt động như một Engine độc lập, **hoàn toàn không chứa bất kỳ logic hoặc trọng số cố định nào** của riêng một kỹ năng.
* **Cơ chế nạp cấu hình động:** Khi chạy thẩm định cho bất kỳ kỹ năng nào, Engine sẽ tự động nạp tệp cấu hình [evaluation.yaml](file:///Users/krystalnguyen/Documents/ai-skills/ai-skills/skills/cognitive-scaffolding/evaluation.yaml) nằm trong chính thư mục của kỹ năng đó.

### 4.2. Bản Đặc Tả Tiêu Chuẩn Riêng Biệt (`evaluation.yaml`)
Mỗi kỹ năng sở hữu một tệp [evaluation.yaml](file:///Users/krystalnguyen/Documents/ai-skills/ai-skills/skills/cognitive-scaffolding/evaluation.yaml) độc lập định nghĩa 4 thành phần cốt lõi:
1. **`task_types`:** Định danh loại tác vụ và danh sách mục bắt buộc (`required_sections`) kèm cấp độ nghiêm trọng (`critical`, `major`, `minor`).
2. **`prohibited_patterns`:** Danh mục các cụm từ hoặc cấu trúc cấm kỵ (ví dụ: cấm giải thích bằng thuật ngữ khó hiểu trong kỹ năng Feynman, cấm rò rỉ mã SQL vào PRD).
3. **`rubric_dimensions`:** Danh mục các chiều chất lượng và trọng số `weight` riêng biệt (Độ đầy đủ `completeness`, Tính chặt chẽ `soundness`, Tính khả thi `actionability`, Định dạng rõ ràng `clarity`).
4. **`scoring`:** Thang điểm 100, ngưỡng đạt chuẩn `pass_threshold: 80`, và quy tắc xử lý lỗi nghiêm trọng `instant_fail`.

### 4.3. Bản Chất & Cấu Trúc Thư Mục `benchmarks/`
Nằm trong từng thư mục kỹ năng, thư mục `benchmarks/` chứa các bộ đề kiểm thử chuẩn (file `.json`) gồm:
* **`tc-01-baseline.json`:** Bài toán nền tảng kiểm tra cấu trúc cơ sở.
* **`tc-02-realistic.json`:** Tình huống nghiệp vụ thực chiến chuyên sâu mô phỏng áp lực thực tế của dự án.

> **Làm rõ nguồn gốc bộ đề Benchmark:**  
> Các bài mẫu `Good` và `Flawed` **KHÔNG ĐƯỢC TỰ ĐỘNG SINH TỪ SKILL.MD**. Đây là các kịch bản đối chứng chuẩn mực (*Ground Truth / Gold Standard*) do các chuyên gia nghiệp vụ và kỹ sư AI thiết kế độc lập nhằm kiểm tra xem bộ máy chấm điểm có bị quá khắt khe hay quá lỏng lẻo hay không.

* **Cặp bài mẫu đối chứng đối xứng:**
  * **`sample_good_output` (Mẫu chuẩn chỉ):** Bài viết mẫu xuất sắc thỏa mãn 100% tiêu chí. Kiểm chứng máy chấm không bị quá khắt khe đánh trượt oan. Kỳ vọng: **PASS (≥ 80/100 điểm)**.
  * **`sample_flawed_output` (Mẫu làm ẩu/vi phạm):** Bài viết cố tình thiếu mục bắt buộc hoặc chứa mã cấm. Kiểm chứng máy chấm không bị lỏng lẻo bỏ lọt lỗi. Kỳ vọng: **FAIL (< 80/100 điểm)** và chỉ đích danh mã lỗi.

### 4.4. Hai giá trị chiến lược cho đội ngũ
1. **Chống thoái hóa kỹ năng (Anti-Regression):** Khi quản trị viên sửa prompt để fix một lỗi mới, gõ `npm run eval <skill>` để đảm bảo mọi bài kiểm thử cũ vẫn ĐẠT `PASS` 100%, không bị tác dụng phụ.
2. **Tài liệu tham chiếu sống (Living Specifications):** Nhân sự mới vào team (BA/PM/QC mới) chỉ cần mở `sample_good_output` là thấy ngay tiêu chuẩn viết tài liệu thực tế của công ty.
3. **Bảo chứng chất lượng toàn diện:** Toàn bộ 20 Skills đều được trang bị đầy đủ bộ đôi Benchmark, đạt độ phủ kiểm thử **100% Evaluation Coverage (82 bài kiểm thử tự động)**.

---

## 5. QUY TRÌNH TƯƠNG TÁC CHO NGƯỜI DÙNG (END-USER WORKFLOW)

Thành viên trong team (PM, BA, QC, Devs) hoàn toàn giữ nguyên thói quen làm việc hàng ngày:

```
[ Bước 1: Nhập yêu cầu tự nhiên ] ➔ [ Bước 2: Nhận tài liệu & Thẻ Điểm ] ➔ [ Bước 3: Tương tác phản hồi nhanh ]
```

1. **Bước 1: Ra đề bài tự nhiên:** Chat với Agent như bình thường (*Ví dụ: "Viết PRD cho tính năng Đổi mật khẩu"*).
2. **Bước 2: Nhận văn bản kèm Thẻ Chất Lượng (Quality Badge):**
   * **PASS (92/100 Điểm):** 100% mục bắt buộc đạt chuẩn.
   * **FAIL:** Nếu tài liệu bị thiếu mục hoặc dính lỗi cấm kèm lý do rõ ràng.
3. **Bước 3: Chọn phản hồi nhanh 1-chạm (Interactive Modal Popup UI):**
   * Agent tự động kích hoạt hộp thoại tương tác đồ họa (Interactive Modal) ngay trên giao diện IDE.
   * Người dùng chỉ cần click chuột 1-chạm vào các nút bấm lựa chọn (*Rất hài lòng*, *Cần bổ sung/chỉnh sửa*, *Điều chỉnh phạm vi* hoặc nhập phản hồi riêng vào ô Write-in), hoàn toàn không cần phải gõ số hay chữ thủ công vào ô chat.
   * Dữ liệu phản hồi lập tức được đồng bộ tức thì vào SQLite Database.

> **Làm rõ luồng dữ liệu Feedback của người dùng:**  
> Khi người dùng bấm gửi phản hồi, dữ liệu feedback **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG GIT PUSH LÊN REPOSITORY**. Dữ liệu chỉ được gửi qua HTTP REST API (`POST /api/v1/events`) về Ingestion Server và lưu vào cơ sở dữ liệu SQLite cục bộ (`server/data/eval.db`). Toàn bộ mã nguồn và branch của repo hoàn toàn không bị can thiệp.

---

## 6. QUY TRÌNH VẬN HÀNH CỦA BỘ PHẬN QUẢN TRỊ (REPO OWNER PIPELINE)

Bộ phận kỹ thuật phía khách hàng (Repo Owner / Tech Lead) tiếp nhận feedback và tối ưu định kỳ theo chu trình 5 chặng khép kín:

```
[ 1. Báo Cáo Tuần ] ➔ [ 2. Bóc Tách Top Lỗi ] ➔ [ 3. Cập Nhật SKILL.md ] ➔ [ 4. Chạy Benchmark Test ] ➔ [ 5. Release Bản Mới ]
```

1. **Bước 1: Tiếp nhận phản hồi & Mở Báo Cáo Tuần:**
   * Quản trị viên chạy lệnh `npm run report` để tổng hợp dữ liệu từ SQLite DB.
   * Báo cáo được tự động xuất tại `reports/weekly-YYYY-MM-DD.html` (Dashboard trực quan) và `reports/weekly-YYYY-MM-DD.md`.
2. **Bước 2: Bóc tách lỗi từ danh mục Top Issues:**
   * **Nguồn gốc danh mục Top Issues:** Được trích xuất trực tiếp từ bảng `event_issues` trong SQLite DB, tổng hợp từ các lần rubric quét phát hiện thiếu mục hoặc dính lỗi cấm kỵ (ví dụ: `missing_traceability_matrix`).
3. **Bước 3: Hiệu chỉnh Prompt trong `SKILL.md`:**
   * Mở file hướng dẫn kỹ năng tương ứng, thêm 1 câu nhắc nhở mang tính bắt buộc:
     > *"BẮT BUỘC: Luôn luôn tạo bảng Ma trận truy vết yêu cầu (Traceability Matrix) ở cuối tài liệu."*
4. **Bước 4: Kiểm tra lại và Release:**
   * Gõ lệnh test nhanh tại chỗ: `npm run eval <tên-skill>`.
   * Thấy điểm số tăng lên ≥ 80 và sạch cảnh báo lỗi ➔ Tiến hành Commit code phiên bản mới.

---

## 7. BẢNG TRA CỨU CÂU LỆNH VẬN HÀNH & THỜI ĐIỂM SỬ DỤNG

| Tác vụ & Mục đích | Cú pháp câu lệnh (CLI) | Thời điểm & Tần suất sử dụng | Vai trò thực hiện |
| :--- | :--- | :--- | :--- |
| **Kiểm tra 1 kỹ năng** | `npm run eval <tên-skill>` | Chạy ngay khi vừa chỉnh sửa prompt trong `SKILL.md` để test nhanh tại chỗ. | Dev / Contributor |
| **Kiểm tra toàn bộ 20 kỹ năng** | `npm run eval:all` | Chạy định kỳ hoặc trước khi bàn giao để quét chất lượng tổng thể kho skills. | Repo Owner |
| **Khởi động máy chủ Ingestion** | `npm run server` | Bật chạy nền liên tục (daemon / CI server / cổng 3456) trước khi team làm việc để đón nhận telemetry. | DevOps / Admin |
| **Đồng bộ kết quả lên Database** | `npm run eval:all:send` | Chạy định kỳ hàng tuần trước khi xuất báo cáo hoặc tích hợp vào pipeline CI/CD trước release. | Automation / CI |
| **Xuất Báo Cáo Tuần mới** | `npm run report` | Chạy định kỳ cuối tuần (thứ Sáu / thứ Hai) hoặc sau đợt test để tổng hợp file MD & HTML. | Weekly Audit |
| **Xem Dashboard trên trình duyệt** | `open reports/weekly-YYYY-MM-DD.html` | Mở xem giao diện báo cáo trực quan có biểu đồ, phục vụ họp báo cáo ban giám đốc. | Management |

---

## 8. NGUYÊN TẮC BẢO MẬT & QUẢN TRỊ DỮ LIỆU KHÁCH HÀNG

1. **Thu Thập Dữ Liệu Tối Thiểu (Strict Minimization):**  
   Hệ thống telemetry chỉ lưu trữ metadata kỹ thuật: *tên kỹ năng, điểm số tổng, mã lỗi kỹ thuật và trạng thái Pass/Fail*. Tuyệt đối **KHÔNG** lưu trữ, không truyền tải nội dung prompt, thông tin dự án mật hay mã nguồn khách hàng ra bên ngoài.
2. **Thực Thi Cục Bộ Hoàn Toàn (100% On-Premise):**  
   Bộ máy đánh giá Rubric chạy trực tiếp tại máy trạm thông qua Node.js nội bộ, không phụ thuộc bất kỳ API bên thứ ba nào. Dữ liệu telemetry được lưu trữ an toàn trong tệp tin SQLite cục bộ tại `server/data/eval.db` thuộc hạ tầng của khách hàng.

---

> **Thông điệp cốt lõi khi chuyển giao hệ thống:**  
> *"Hệ thống Evaluation không làm tăng thêm bất kỳ gánh nặng quy trình nào cho người dùng, mà đóng vai trò như một người trợ lý kiểm duyệt vô hình, bảo đảm mọi tài liệu bàn giao từ AI luôn đạt chuẩn chuyên nghiệp cao nhất ngay từ lần đầu tiên!"*

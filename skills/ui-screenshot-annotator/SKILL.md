---
name: ui-screenshot-annotator
description: |
  Hệ thống tiêu chuẩn thiết kế, chú thích ảnh màn hình (Screenshot Annotation) và đóng gói tài liệu hướng dẫn vận hành / User Journey / SOP chuẩn Enterprise Pixel-Perfect.
  Giúp tự động hóa việc chụp, định vị tọa độ, vẽ bounding boxes, callout cards, và mũi tên chỉ dẫn không bị đè chữ, không lệch tầng Z-Index, và không cắt xén bộ lọc.

  Trigger ngay lập tức khi:
  - Cần chụp, gắn chú thích (callouts, arrows, boxes, badges) lên ảnh chụp màn hình UI cho tài liệu SOP, User Journey, User Manual, hoặc BRD/PRD.
  - Cần rà soát, căn chỉnh lại tọa độ bounding box hoặc vị trí thẻ callout bị lệch, đè chữ, cắt đôi nút lọc hoặc trỏ nhầm nút ở nền mờ.
  - Xuất tài liệu PDF có lồng ghép ảnh minh họa giao diện phần mềm.
  - Yêu cầu "chú thích ảnh", "annotate screenshots", "vẽ khung hướng dẫn trên hình", "sửa tọa độ callout", "kiểm tra hình chụp màn hình".
---

# UI Screenshot Annotation & Enterprise SOP Packaging Guide

Tài liệu hướng dẫn quy chuẩn toàn diện về kỹ thuật chụp ảnh màn hình, tính toán tọa độ chú thích đồ họa (Callout Cards, Bounding Boxes, Directional Arrows), xử lý xung đột thị giác và đóng gói tài liệu SOP/User Journey đạt độ chính xác tuyệt đối (Pixel-Perfect).

---

## 1. Triết lý & Bộ 6 Định luật Chú thích Giao diện (The 6 Laws of UI Annotation)

Khi đưa ảnh chụp màn hình vào tài liệu hướng dẫn vận hành, mục tiêu tối thượng là **Giảm tải nhận thức cho người đọc xuống mức tối thiểu (Cognitive Load -> min)**. Một ảnh chú thích cẩu thả (lệch khung, che chữ, trỏ sai lớp, hoặc sửa một ảnh làm hỏng hàng loạt ảnh khác) gây thiệt hại nghiêm trọng đến uy tín chuyên môn và tính chuyên nghiệp của sản phẩm.

Hệ thống tuân thủ nghiêm ngặt 6 định luật:

```
+----------------------------------------------------------------------------------------+
| ĐỊNH LUẬT 1: Z-INDEX & FOCAL POINT (Tiền cảnh vs. Hậu cảnh)                            |
| Khi Popup/Modal mở ra, Background bị tối (dimmed) & vô hiệu hóa (disabled).            |
| -> Tuyệt đối KHÔNG BAO GIỜ trỏ vào nền mờ. Mọi hành động chính phải nằm trên Modal.   |
+----------------------------------------------------------------------------------------+
| ĐỊNH LUẬT 2: NEGATIVE SPACE MANAGEMENT (Khoảng thở An toàn)                            |
| Thẻ chú thích (Callout Card) không được đè lên bất kỳ bộ lọc, tiêu đề, hay số liệu nào. |
| -> Luôn định vị thẻ vào "khoảng không gian chết" (khoảng trống bên phải thanh lọc/dưới).|
+----------------------------------------------------------------------------------------+
| ĐỊNH LUẬT 3: HOLISTIC COMPONENT BOUNDING (Khung bao Trọn vẹn)                          |
| Khung viền (Bounding Box) của thanh công cụ/bộ lọc/thẻ phải ôm trọn 100% các phần tử. |
| -> Cấm cắt đôi phần tử (vd: nút lọc, số tiền). Luôn đo đạc và có padding an toàn.       |
+----------------------------------------------------------------------------------------+
| ĐỊNH LUẬT 4: SYSTEMIC PATTERN AUDITING (Kiểm toán Cụm — Chống Whack-a-Mole)           |
| Khi phát hiện 1 lỗi giao diện trên một màn hình, lập tức quét toàn bộ các màn hình     |
| có cùng UI Pattern trong hệ thống để chuẩn hóa đồng loạt, không chờ nhắc từng ảnh.    |
+----------------------------------------------------------------------------------------+
| ĐỊNH LUẬT 5: DECOUPLED INDIVIDUAL CONFIGURATION (Cô lập Cấu hình Tuyệt đối)             |
| Tuyệt đối KHÔNG dùng chung hàm helper mẫu (generic helper) để gán tọa độ cho các màn   |
| hình khác nhau (vd: Step 4 của các vai trò). Mỗi ảnh là một cấu hình độc lập 100%.     |
| -> Sửa tọa độ của một ảnh KHÔNG BAO GIỜ được phép làm thay đổi bất kỳ ảnh nào khác!   |
+----------------------------------------------------------------------------------------+
| ĐỊNH LUẬT 6: CONTACT SHEET VISUAL QA GATE (Kiểm toán Thị giác qua Bảng ghép)           |
| Khi render hàng loạt (từ 5 ảnh trở lên), BẮT BUỘC phải ghép ảnh thành Contact Sheet    |
| (lưới 2x2 hoặc 2x3) theo từng vai trò/module và dùng công cụ xem ảnh trực tiếp để soi  |
| toàn diện trước khi đưa vào PDF hoặc bàn giao. CẤM xuất file khi chưa qua mắt soi!     |
+----------------------------------------------------------------------------------------+
```

---

## 2. Quy tắc "Không Sinh Bước Ma" (No Phantom Steps Rule)

Trong tài liệu User Journey / SOP chi tiết:
* **Tỷ lệ 1-1 Tuyệt đối:** Số bước tác nghiệp có đính kèm ảnh chụp (`Step 1`, `Step 2`, ...) BẮT BUỘC phải khớp 1-1 với ảnh chụp màn hình thực tế từ phần mềm/prototype.
* **Cấm kỵ:** Tuyệt đối không được "vẽ thêm bước" (vd: tạo ra Bước 4 mượn lại ảnh của Bước 3 rồi đặt tên gượng ép là "Chỉ báo cảnh báo tự động"). Hành vi này làm người đọc mất phương hướng, không tìm thấy màn hình tương ứng khi thao tác thực tế và đánh mất niềm tin vào tài liệu.
* **Xử lý khi thiếu ảnh:** Nếu prototype chỉ có 3 màn hình thực tế, hãy chuẩn hóa luồng thành đúng 3 bước tác nghiệp hoàn chỉnh. Nếu một bước có nhiều khối chức năng trên cùng 1 màn hình, hãy sử dụng kỹ thuật crop chi tiết hoặc đánh số 2 Callouts trên cùng màn hình đó.

---

## 3. Thư viện UI Patterns & Tọa độ Tiêu chuẩn (Resolution: 1920x1080)

Hầu hết các màn hình ứng dụng doanh nghiệp (B2B SaaS / ERP / Dashboard) đều rơi vào các UI Patterns chuẩn sau:

### Pattern A: Approval Modal Dialog (Popup Ký duyệt & Đính kèm)
* **Đặc điểm:** Một cửa sổ popup màu trắng nổi lên ở trung tâm, nền phía sau bị phủ lớp tối `rgba(0, 0, 0, 0.45)`.
* **Bộ tọa độ chuẩn xác định qua đo đạc OpenCV:**
  ```python
  # Khung bao trọn vẹn toàn bộ Modal (ôm sát viền trắng, không trôi lơ lửng ngoài nền tối)
  modal_box = {"x": 460, "y": 25, "w": 1000, "h": 501}

  # Khung bao khối tệp đính kèm (Attachment) bên trong modal:
  # Phải ôm trọn từ tiêu đề "Attachment(s):", thẻ icon file đến hết capsule tên file
  # Tuyệt đối không để mép trên lấn lên text "Approval Status" hay "Waiting for your decision"
  attachment_box = {"x": 476, "y": 312, "w": 138, "h": 145}

  # Nút bấm hành động tại góc dưới phải của Modal
  approve_btn = {"x": 1362, "y": 471, "w": 79, "h": 36}
  reject_btn  = {"x": 1296, "y": 473, "w": 61, "h": 32}

  # Thẻ chú thích bên phải Modal:
  callout_modal = {
      "num": 1,
      "title": "Ký duyệt hiện trường (Approve)",
      "desc": "Bấm 'Approve' trên popup để xác nhận đạt chuẩn, chuyển dữ liệu sang luồng tiếp theo.",
      "top": 440, "left": 1475, "width": 360,
      "arrow_start": (1475, 489), "arrow_end": (1443, 489)  # Trỏ ngang vào tâm nút Approve
  }
  ```

---

### Pattern B: Multi-Level Header Filter Bar (Thanh Bộ lọc Đa chiều)
* **Đặc điểm:** Thanh công cụ gồm 2–4 nút bấm lọc (pills) xếp ngang phía trên bảng/biểu đồ, thường nằm từ `x = 246` đến `x = 768`, `y = 120..160`.
* **Cạm bẫy:** Đặt thẻ Callout ở vùng `x = 450..650` hoặc vẽ khung viền có chiều rộng `w = 350` sẽ cắt đứt nút lọc số 3 và đè kín chữ.
* **Bộ tọa độ chuẩn:**
  ```python
  # Khung bao trọn vẹn 3 nút lọc (Dự án, Đơn vị thi công, Tháng phát sinh):
  filter_box = {"x": 246, "y": 120, "w": 522, "h": 40}

  # Thẻ Callout BẮT BUỘC đặt ở khoảng trống bên phải (left >= 780), bắn mũi tên sang trái:
  filter_callout = {
      "num": 1,
      "title": "Bộ lọc Dự án, Đơn vị thi công & Kỳ phát sinh",
      "desc": "Lọc nhanh phạm vi số liệu theo từng công trình và kỳ phát sinh để kiểm soát chuyên sâu.",
      "top": 90, "left": 800, "width": 440,
      "arrow_start": (800, 140), "arrow_end": (770, 140)
  }
  ```

---

### Pattern C: Space Navigation Tabs Bar & Active Underline (Thanh Tab Nghiệp vụ)
* **Đặc điểm:** Dải tab điều hướng phân hệ nghiệp vụ (vd: tab "Thi công & Khối lượng") nằm trên dải header trắng (`y = 50..95`), có thanh gạch xanh active underline bên dưới.
* **Cạm bẫy:** Mép trái của khung bo bị kéo về `x < 240` sẽ đè lên icon thu phóng sidebar (`<`), còn mép dưới quá cao sẽ cắt ngang chữ của tab.
* **Bộ tọa độ chuẩn:**
  ```python
  # Khung bao tab ôm trọn text và đường gạch underline, cách xa nút toggle sidebar:
  tab_box = {"x": 260, "y": 64, "w": 150, "h": 30}

  # Callout đặt bên phải tab trên dải trắng thoáng đãng:
  tab_callout = {
      "num": 1,
      "title": "Không gian Space 1: Quản trị Thi công & Khối lượng",
      "desc": "Truy cập trực tiếp số liệu kỹ thuật sạch, không dính đơn giá thương mại.",
      "top": 40, "left": 435, "width": 440,
      "arrow_start": (435, 78), "arrow_end": (412, 78)
  }
  ```

---

### Pattern D: Summary KPI Cards Container (Khối Thẻ Tóm tắt Số liệu)
* **Đặc điểm:** Màn hình kết quả nạp dữ liệu (Import Step 4) chứa các thẻ tóm tắt số liệu (Summary Cards), phía trên là dải Metadata nạp file, phía dưới là Tiêu đề bảng chi tiết.
* **Phân loại cấu trúc (BẮT BUỘC TÁCH BIỆT — KHÔNG DÙNG HELPER CHUNG):**
  1. **Loại 1 hàng thẻ (3 thẻ — vd: Tender):**
     * Thẻ chỉ cao `71px` (`y: 361..432`).
     * Khung bao: `{"x": 255, "y": 356, "w": 1650, "h": 80}` (kết thúc tại `y=436`, cách xa header bảng phía dưới ở `y=465`).
  2. **Loại 2 hàng thẻ (5–6 thẻ — vd: GS, Planning, Warehouse):**
     * Thẻ cao `148px` (`y: 361..509`).
     * Tiêu đề bảng bên dưới bắt đầu tại `y=522`.
     * Khung bao: `{"x": 255, "y": 356, "w": 1650, "h": 155}` (kết thúc tại `y=511`, nằm gọn trong khoảng hở 13px, **tuyệt đối không chạm vào tiêu đề bảng bên dưới**).
  3. **Loại 2 hàng thẻ có độ lệch baseline (vd: CCM):**
     * Thẻ bắt đầu tại `y=382`, kết thúc tại `y=530`.
     * Khung bao: `{"x": 255, "y": 378, "w": 1650, "h": 158}`.
* **Vị trí Callout an toàn cho Step 4:**
  * **Callout 1 (Badge Completed):** Đặt tại `top: 45, left: 1240, width: 360`, mũi tên trỏ sang phải vào badge `Completed` (`x=1658, y=86`).
  * **Callout 2 (Summary Cards):** Đặt tại `top: 245, left: 350, width: 450` (nằm trọn trong khoảng trống giữa dải metadata và đỉnh các thẻ tóm tắt), mũi tên trỏ xuống thẻ đầu tiên `(450, 320) -> (450, 354)`. Tuyệt đối không đặt Callout ở `top < 235` (sẽ đè vào metadata) và không đặt ở `top: 450..550` (sẽ đè vào số liệu).

---

### Pattern E: Approval Request List Table (Bảng Danh sách Phiếu Chờ Duyệt)
* **Đặc điểm:** Màn hình danh sách phiếu chờ duyệt (Step 1 của Approver), phía trên có ô `Search` và dropdown `Filter by`, phía dưới có các dòng phiếu và phân trang.
* **Cạm bẫy:** Vẽ khung bao trùm từ `y=115` sẽ ôm sát sạt mép ô Search và Filter by, tạo cảm giác đè lấn và ngột ngạt.
* **Quy tắc:**
  * Chỉ đóng khung các dòng phiếu cần xử lý (Row 1 & Row 2: `y: 155..267`).
  * Khung bao nút hành động (Approve / Reject) ôm riêng cụm nút của dòng đầu tiên (`x: 1705, y: 165, w: 190, h: 36`).
  * Đặt 2 thẻ Callout ở khoảng trống thênh thang bên dưới bảng (`top: 330`), bắn mũi tên ngược lên trên. Điều này giải phóng 100% không gian thoáng đãng cho thanh tìm kiếm và bộ lọc phía trên!
* **Bộ tọa độ chuẩn:**
  ```python
  elements = [
      {"x": 260, "y": 155, "w": 1630, "h": 112},      # Ôm gọn 2 dòng phiếu chờ duyệt
      {"x": 1705, "y": 165, "w": 190, "h": 36}        # Nút Approve / Reject
  ]
  callouts = [
      {
          "num": 1,
          "title": "Danh sách phiếu chờ duyệt (Approval Request)",
          "desc": "Hệ thống tự động tiếp nhận phiếu trình nghiệm thu khối lượng từ Kỹ sư giám sát.",
          "top": 330, "left": 270, "width": 440,
          "arrow_start": (420, 330), "arrow_end": (420, 270)  # Bắn ngược lên đáy khung phiếu
      },
      {
          "num": 2,
          "title": "Nút Duyệt / Từ chối trực tiếp",
          "desc": "Cho phép Chỉ huy trưởng xem xét duyệt nhanh hoặc từ chối phiếu trình khối lượng.",
          "top": 330, "left": 1420, "width": 400,
          "arrow_start": (1680, 330), "arrow_end": (1750, 205) # Bắn ngược lên nút Approve
      }
  ]
  ```

---

### Pattern F: User Identity & Zero-Leak Navigation (StartScreen)
* **Đặc điểm:** Màn hình trang chủ khởi đầu phiên làm việc, thể hiện phân quyền bảo mật (RBAC): Menu nào được mở, menu nào bị ẩn hoàn toàn (Zero-Leak).
* **Bộ tọa độ chuẩn:**
  ```python
  # 1. Menu Profile Avatar góc trên phải
  avatar_menu = {"x": 1621, "y": 53, "w": 286, "h": 498}

  # 2. Thanh điều hướng Sidebar bên trái (chiều cao co giãn theo số lượng menu được phân quyền)
  sidebar_nav = {"x": 6, "y": 55, "w": 230, "h": sidebar_h}  # sidebar_h: 185px (1 menu) đến 365px (đủ menu)
  ```

---

## 4. Quy trình 6 Bước Thực thi Chuẩn (6-Step Pipeline)

```
+--------------+     +--------------+     +--------------+     +--------------+     +--------------+     +--------------+
|   BƯỚC 1     | --> |   BƯỚC 2     | --> |   BƯỚC 3     | --> |   BƯỚC 4     | --> |   BƯỚC 5     | --> |   BƯỚC 6     |
| Raw Inventory|     | Decoupled    |     | Chrome Headless|   | Contact Sheet|     | Visual Eye   |     | PDF Document |
| & 1-1 Audit  |     | Measurements |     | SVG Rendering|     | Generation   |     | Inspection   |     | Compilation  |
+--------------+     +--------------+     +--------------+     +--------------+     +--------------+     +--------------+
```

### Bước 1: Khảo sát Ảnh Raw & Kiểm toán 1-1 (Inventory & 1-1 Audit)
* Đọc toàn bộ file trong `screenshots/raw/`. Đếm chính xác số lượng ảnh của từng vai trò.
* Đối chiếu với dàn ý User Journey: **Đảm bảo số bước tài liệu = số ảnh raw thực tế**. Nếu thiếu ảnh, chuẩn hóa luồng tài liệu; tuyệt đối không sinh bước ma.

### Bước 2: Đo đạc Tọa độ Độc lập (Decoupled Measurements)
* Dùng script Python + OpenCV quét ngưỡng pixel để xác định tọa độ biên thực tế của các component (Modal, Card, Tab, Button, Filter).
* Khai báo từng ảnh thành một dictionary riêng trong `ALL_CONFIGS`. **Cấm dùng chung helper function cho các bước có giao diện khác nhau**.

### Bước 3: Biên dịch Ảnh Chú thích qua Chrome Headless
* Chạy script Python tạo file HTML/SVG overlay tạm và gọi Chrome Headless render ảnh độ phân giải 1920x1080.
* Lưu ảnh thành phẩm vào `screenshots/annotated/`. Giữ nguyên thư mục `screenshots/raw/` nguyên bản.

### Bước 4: Tự động Tạo Bảng Ghép Thị giác (Contact Sheets Generation)
* Viết script tự động ghép các ảnh annotated theo từng nhóm vai trò thành file contact sheet lưới 2x2 hoặc 2x3 (`sheet_<RoleName>.png`).

### Bước 5: Cổng Soi Thị giác Bắt buộc (Visual Eye Inspection Gate)
* Dùng công cụ `view_file` xem trực tiếp từng file `sheet_<RoleName>.png`:
  1. Viền nét đứt có cắt đôi chữ hay số liệu nào không?
  2. Mép dưới khung thẻ có chạm vào tiêu đề bảng bên dưới không?
  3. Thẻ Callout có nằm đè lên thanh lọc, metadata hay ô tìm kiếm không?
  4. Mũi tên có nối mượt mà từ thẻ đến đúng phần tử mục tiêu không?
* Nếu phát hiện bất kỳ điểm lệch nào, quay lại Bước 2 chỉnh sửa cục bộ cho ảnh đó và render lại.

### Bước 6: Lồng ghép vào Tài liệu & Biên dịch PDF
* Cập nhật đường dẫn ảnh và nội dung tương ứng trong file Markdown/HTML.
* Biên dịch tài liệu sang PDF chuẩn in ấn. Trích xuất trang PDF ngẫu nhiên để kiểm tra layout lần cuối.

---

## 5. Script Mẫu Tạo Contact Sheet Kiểm Toán Trực Quan

Script mẫu bằng Python + OpenCV để ghép ảnh thành Contact Sheet, giúp AI kiểm toán 50 ảnh chỉ qua 10 lượt xem:

```python
import os
import cv2
import numpy as np

def generate_contact_sheet(image_paths, output_path, cols=2, thumb_w=480, thumb_h=270):
    thumbs = []
    for p in image_paths:
        if os.path.exists(p):
            im = cv2.imread(p)
            t = cv2.resize(im, (thumb_w, thumb_h))
            # Thêm thanh tiêu đề chứa tên file trên đầu thumbnail
            bar = np.zeros((28, thumb_w, 3), dtype=np.uint8) + 45
            fname = os.path.basename(p)
            cv2.putText(bar, fname, (8, 19), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
            t = np.vstack([bar, t])
            thumbs.append(t)
            
    n = len(thumbs)
    rows = (n + cols - 1) // cols
    grid_rows = []
    for r in range(rows):
        row_imgs = []
        for c in range(cols):
            idx = r * cols + c
            if idx < n:
                row_imgs.append(thumbs[idx])
            else:
                row_imgs.append(np.zeros_like(thumbs[0]))
        grid_rows.append(np.hstack(row_imgs))
        
    sheet = np.vstack(grid_rows)
    cv2.imwrite(output_path, sheet)
    print(f"Contact sheet saved: {output_path}")
```

---

## 6. Bảng Checklist Nghiệm thu Đồ họa (Annotation QA Checklist)

Trước khi bàn giao kết quả tài liệu cho khách hàng hoặc người dùng, đối chiếu từng mục trong checklist sau:

| STT | Tiêu chí Kiểm toán Trực quan | Yêu cầu Đạt (Pass Criteria) | Trạng thái |
| :---: | :--- | :--- | :---: |
| 1 | **Decoupled Architecture** | Từng ảnh có block cấu hình độc lập; sửa ảnh này không ảnh hưởng ảnh khác. | [ ] |
| 2 | **No Phantom Steps** | Số bước tác nghiệp trong tài liệu khớp 1-1 với số ảnh raw chụp từ prototype. | [ ] |
| 3 | **Z-Index Layering** | Khi có Modal, 100% tiêu điểm nằm trên Modal; không có mũi tên nào trỏ vào nền mờ. | [ ] |
| 4 | **Filter & Search Clearance** | Thanh `Filter by`, ô `Search`, và Tiêu đề bảng hoàn toàn thoáng đãng, không bị đè. | [ ] |
| 5 | **Card Bottom Safety Gap** | Đáy khung bo thẻ tóm tắt cách tiêu đề bảng bên dưới tối thiểu 8–12px, không chạm đè. | [ ] |
| 6 | **Bounding Box Integrity** | Khung bao không cắt ngang dòng số liệu (vd: 150 tỷ), không lấn sang icon sidebar. | [ ] |
| 7 | **Arrow Alignment** | Mũi tên thẳng hàng hoặc cong tự nhiên, đầu mũi tên cách mép đối tượng 3–8px. | [ ] |
| 8 | **Contact Sheet Verification** | Đã tạo và xem trực quan toàn bộ các contact sheet trước khi build PDF. | [ ] |
| 9 | **PDF Page-Break Safety** | Ảnh không bị cắt đôi giữa 2 trang PDF; chú thích đi liền với ảnh tương ứng. | [ ] |

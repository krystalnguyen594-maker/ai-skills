---
name: pdf-creator
description: >
  Hệ thống chuyển đổi và tạo tài liệu PDF chuyên nghiệp từ mọi nguồn (Markdown, HTML,
  DOCX/XLSX/PPTX, Text), tự động nhận diện đặc tính tài liệu (Mermaid, Math, Bảng rộng,
  Độ dài) để tối ưu layout A4, font tiếng Việt và chống gãy trang. Trigger khi: xuất PDF,
  tạo PDF, convert sang PDF, in báo cáo/tài liệu, "làm cái PDF".
---

# Quy trình PDF Creator Thích Ứng Toàn Diện (Adaptive Universal Engine)

## 1. Khảo Sát Tài Liệu Trước Khi Render (Mandatory Profiling)
Trước khi xuất PDF, AI PHẢI quét nhanh 3 đặc tính của file nguồn:
1. **Có thành phần Dynamic / JS không?**
   - Quét tìm: ````mermaid````, `<script>`, `<canvas>`, `$$`, `\sum` (LaTeX/MathJax).
   - 👉 **Có**: BẮT BUỘC dùng **Chrome Headless** (nhúng CDN Mermaid/KaTeX + `--virtual-time-budget=5000`).
   - 👉 **Không**: Dùng **WeasyPrint** (nhanh, nhẹ, hỗ trợ chuẩn in CSS paged media).
2. **Có bảng rộng (> 6 cột) không?**
   - 👉 **Có**: Đặt khổ ngang `@page { size: A4 landscape; }` HOẶC chia tỷ lệ `<colgroup>` rõ ràng + `table-layout: fixed`.
   - 👉 **Không**: Giữ nguyên khổ dọc `@page { size: A4 portrait; }`.
3. **Tránh 3 lỗi hiển thị kinh điển của Pandoc:**
   - **Lỗi 1 (Lệch trái, rỗng bên phải):** Pandoc mặc định đặt `body { max-width: 36em; }`. Bắt buộc phải ghi đè: `html, body { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }`.
   - **Lỗi 2 (Tiêu đề kép):** Cấm dùng `--metadata title=...` nếu file MD đã có `# Tiêu đề`. Luôn thêm CSS: `#title-block-header { display: none !important; }`.
   - **Lỗi 3 (Chữ Alert/Callout thô):** Khi Markdown dùng `> [!IMPORTANT]`, `> [!NOTE]`, `> [!WARNING]`, Pandoc tạo ra `<div class="title"><p>Important</p></div>` làm xuất hiện chữ "Important/Note" trần trụi rất xấu. Bắt buộc phải ẩn `.title` và style lại khung Alert Box sang trọng.

---

## 2. Tuyến Đường Kỹ Thuật Chuẩn Cho Từng Loại Nguồn

| Loại Nguồn & Đặc tính | Công nghệ chuyển đổi | Lệnh & Tham số cốt lõi |
|---|---|---|
| **Markdown thuần (không JS/Mermaid)** | `pandoc` → HTML5 → **WeasyPrint** | `pandoc in.md -f gfm -t html5 -s -H style.html -o /tmp/doc.html`<br>`weasyprint /tmp/doc.html out.pdf` |
| **Markdown có Mermaid / KaTeX / JS** | `pandoc` (inject JS) → **Chrome Headless** | `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=5000 --no-pdf-header-footer --print-to-pdf="out.pdf" "file:///tmp/doc.html"` |
| **Bảng tính XLSX / File DOCX / PPTX** | **LibreOffice Headless** | `(which soffice > /dev/null && soffice || "/Applications/LibreOffice.app/Contents/MacOS/soffice") --headless --convert-to pdf --outdir <dir> <file>` |

---

## 3. Bộ Quy Tắc CSS In Ấn Bất Biến & Xử Lý Format Markdown Chuyên Nghiệp

```css
/* 1. Reset các bẫy hiển thị của Pandoc */
#title-block-header, header.title-block-header { display: none !important; }

/* 2. Tràn viền 100% khổ A4 (Triệt tiêu khoảng trắng rỗng bên phải) */
html, body {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 8.2pt;
  line-height: 1.46;
  color: #1e293b;
  background: #ffffff;
}

/* 3. Cấu hình trang & Header/Footer */
@page {
  size: A4 portrait;
  margin: 10mm 12mm 10mm 12mm;
  @top-left { content: "TÊN DỰ ÁN / TỔNG THẦU"; font-size: 7pt; font-weight: 600; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  @top-right { content: "TÀI LIỆU DỰ ÁN"; font-size: 7pt; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  @bottom-left { content: "Người nhận / Đơn vị thực hiện"; font-size: 7pt; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  @bottom-right { content: "Trang " counter(page) " / " counter(pages); font-size: 7.5pt; font-weight: 500; color: #475569; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
}

/* 4. Typography & Khoảng thở thị giác (Vertical Rhythm & Breathing Room) */
h1, h2, h3, h4 { color: #0f3d6e; page-break-after: avoid; }
h1 { font-size: 12pt; font-weight: 800; border-bottom: 1.5px solid #0f3d6e; padding-bottom: 3px; margin-top: 0; margin-bottom: 6px; text-transform: uppercase; }
h2 { font-size: 9.8pt; font-weight: 700; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-top: 12px; margin-bottom: 5px; }
h3 { font-size: 8.8pt; font-weight: 700; color: #1e3a8a; margin-top: 9px; margin-bottom: 3px; }
h4 { font-size: 8.2pt; font-weight: 700; color: #2563eb; margin-top: 7px; margin-bottom: 2px; }

/* Đoạn văn và danh sách có khoảng cách rõ ràng, chống dính chùm */
p { font-size: 8pt; color: #334155; margin-top: 0; margin-bottom: 5px; orphans: 3; widows: 3; }
ul, ol { margin-top: 2px; margin-bottom: 6px; padding-left: 18px; }
li { font-size: 8pt; color: #334155; margin-bottom: 2.5px; }
strong { color: #0f172a; font-weight: 600; }

/* 5. Khối Metadata Đầu Trang (Executive Header Card) */
body > p:first-of-type {
  font-size: 7.8pt;
  color: #475569;
  line-height: 1.42;
  margin-bottom: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 6px 9px;
}

/* 6. Hệ thống Callout / Alert Boxes Chuyên nghiệp (Xử lý triệt để GitHub Alerts) */
div.important, div.note, div.tip, div.warning, div.caution, blockquote {
  border-radius: 4px !important;
  padding: 6px 9px !important;
  margin: 6px 0 8px 0 !important;
  page-break-inside: avoid !important;
}

/* Ẩn tiêu đề thô tự sinh của Pandoc */
div.important .title, div.note .title, div.tip .title, div.warning .title, div.caution .title, blockquote .title {
  display: none !important;
}

/* 6.1. Important & Default Blockquote (Xanh dương) */
div.important, blockquote {
  background: #eff6ff !important;
  border: 1px solid #bfdbfe !important;
  border-left: 3.5px solid #2563eb !important;
}
div.important p, blockquote p { color: #1e3a8a !important; font-size: 7.8pt !important; line-height: 1.4 !important; margin: 0 !important; }
div.important p strong:first-child, blockquote p strong:first-child { color: #1d4ed8 !important; font-weight: 700 !important; }

/* 6.2. Note (Xám xanh trung tính) */
div.note { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; border-left: 3.5px solid #64748b !important; }
div.note p { color: #334155 !important; font-size: 7.8pt !important; line-height: 1.4 !important; margin: 0 !important; }
div.note p strong:first-child { color: #0f172a !important; font-weight: 700 !important; }

/* 6.3. Tip (Xanh lá thành công) */
div.tip { background: #f0fdf4 !important; border: 1px solid #bbf7d0 !important; border-left: 3.5px solid #16a34a !important; }
div.tip p { color: #166534 !important; font-size: 7.8pt !important; line-height: 1.4 !important; margin: 0 !important; }
div.tip p strong:first-child { color: #15803d !important; font-weight: 700 !important; }

/* 6.4. Warning (Vàng cam cảnh báo) */
div.warning { background: #fffbeb !important; border: 1px solid #fde68a !important; border-left: 3.5px solid #d97706 !important; }
div.warning p { color: #92400e !important; font-size: 7.8pt !important; line-height: 1.4 !important; margin: 0 !important; }
div.warning p strong:first-child { color: #b45309 !important; font-weight: 700 !important; }

/* 6.5. Caution (Đỏ nguy cấp) */
div.caution { background: #fef2f2 !important; border: 1px solid #fecaca !important; border-left: 3.5px solid #dc2626 !important; }
div.caution p { color: #991b1b !important; font-size: 7.8pt !important; line-height: 1.4 !important; margin: 0 !important; }
div.caution p strong:first-child { color: #b91c1c !important; font-weight: 700 !important; }

/* 7. Bảng biểu linh hoạt & lặp lại Header khi sang trang */
table {
  border-collapse: collapse;
  width: 100% !important;
  max-width: 100% !important;
  table-layout: fixed !important;
  font-size: 7.4pt;
  line-height: 1.34;
  margin: 6px 0 10px 0;
  page-break-inside: auto;
}
thead { display: table-header-group; }
tr { page-break-inside: avoid; }
th, td { border: 1px solid #cbd5e1; padding: 4.2px 6px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
th { background-color: #0f3d6e; color: #ffffff; font-weight: 600; text-align: left; font-size: 7.6pt; }
tbody tr:nth-child(even) { background-color: #f8fafc; }

/* Tỷ lệ cột chuẩn mẫu cho bảng danh mục/tiến độ */
table th:first-child, table td:first-child { text-align: center; }
```

---

## 4. Xử Lý Mermaid & LaTeX Động (Dynamic Assets Pipeline)
Khi Markdown chứa ````mermaid````:
1. Chuyển khối code ````mermaid ... ```` thành `<div class="mermaid">...</div>` bọc trong `.diagram-card`.
2. **Quy tắc dàn layout sơ đồ:**
   - Tránh dùng `flowchart LR` khi sơ đồ có nhiều node dài (dễ bị co hẹp thành 1 dải ngang tí hon, chữ li ti).
   - Ưu tiên `flowchart TB`, bọc ngắt dòng `<br/>` trong nhãn node, hoặc dùng `direction TB` bên trong các `subgraph` để tối ưu chiều dọc trang in.
3. Nhúng thư viện:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
   <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
   ```
4. Xuất PDF bằng **Chrome Headless** với cờ `--virtual-time-budget=5000`.

---

## 5. BƯỚC BẮT BUỘC: Soi Trực Quan PDF Trước Khi Bàn Giao (Visual Inspection Gate)

> [!CRITICAL]
> **AI KHÔNG ĐƯỢC PHÉP báo hoàn thành chỉ dựa trên lệnh chạy hay byte `b'%PDF'`.**  
> **AI BẮT BUỘC phải gọi tool `view_file` mở trực tiếp file `.pdf` vừa tạo để "soi mắt" toàn bộ trang:**

1. **Chiều rộng trang (Full-Width Check):** Nội dung có bị bóp hẹp sang trái và để lại mảng trắng rỗng bên phải không? (Đảm bảo đã xóa `max-width: 36em`).
2. **Trang 1 (Header & Alert Check):** 
   - Khối metadata đầu trang có được đóng khung gọn gàng không?
   - Các khối Alert (`Important`, `Note`, `Warning`...) có bị lộ chữ `.title` thô không? Viền và màu nền có sang trọng, dịu mắt không?
3. **Sơ đồ / Chart (Mermaid & Font Readability Check):** Sơ đồ có sắc nét không? Chữ trong node có đủ to và dễ đọc không?
4. **Bảng biểu (Table Check):** Có bị dồn chữ, tràn lề phải, hay mất cột nào không? Header cột có lặp lại khi sang trang không?
5. **Phân bổ trang (Page Balance Check):** Trang cuối cùng có bị "mồ côi" 2–3 dòng không? Nếu có, phải điều chỉnh lề `@page` (từ `14mm` xuống `10mm`) và font-size (từ `8.8pt` xuống `8pt`) để gom trang cân đối.

Chỉ khi AI tự kiểm tra qua `view_file` và thấy file thực sự đẹp, chuyên nghiệp thì mới gửi link cho user.

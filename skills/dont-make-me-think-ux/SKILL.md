---
name: dont-make-me-think-ux
description: |
  Hệ thống thiết kế kiến trúc trải nghiệm người dùng (UX Architecture) và giảm tải nhận thức (Cognitive Load Reduction) theo triết lý Steve Krug ("Don't Make Me Think").
  Giúp chuyển đổi các yêu cầu dày đặc từ PRD/BRD thành bố cục màn hình tinh gọn, trực quan, dễ quét mắt (Scanability), triệt tiêu hoàn toàn hiện tượng quá tải thông tin (Information Overload).

  Trigger ngay lập tức khi:
  - Nhận được PRD, BRD hoặc User Stories và cần thiết kế cấu trúc bố cục (Layout), phân tầng thông tin, hoặc wireframe cho màn hình mới.
  - Thiết kế hoặc tái cấu trúc: Trang chi tiết thực thể (Detail View), Bảng dữ liệu nghiệp vụ (DataGrid), hoặc Bảng điều khiển giám sát (Dashboard).
  - Giao diện bị phản ánh là "quá tải thông tin", "rối mắt", "quá nhiều chi tiết", "quá nhiều nút", "không biết nhìn vào đâu".
  - Cần tinh giản giao diện theo triết lý Steve Krug: lướt mắt 3 giây, cắt tỉa từ ngữ thừa, và thiết lập cấp bậc thị giác rõ ràng.
---

# UX Architecture & Cognitive Usability Guide (Don't Make Me Think)

## 1. Triết lý Cốt lõi: Đừng Bắt Người Dùng Phải Suy Nghĩ (Steve Krug)

Một màn hình xuất sắc không phải là màn hình nhồi nhét đủ 100% các trường dữ liệu từ PRD lên giao diện, mà là màn hình giúp người dùng hoàn thành công việc với **ít nỗ lực tư duy nhất ($Cognitive\ Friction \to \min$)**.

Hệ thống tuân thủ 4 định luật nền tảng của Steve Krug:
1. **Krug's First Law**: *"Don't make me think!"* — Giao diện phải tự nó giải thích (self-evident). Người dùng không bao giờ phải dừng lại dịch nghĩa biểu tượng, tự hỏi cái gì bấm được, hay nút này dẫn đi đâu.
2. **Krug's Reality of Scanning**:
   - *Người dùng không đọc, họ quét mắt*: Mắt người lướt qua màn hình để tìm các điểm neo thị giác (visual anchors). Phải thiết kế theo đường quét tự nhiên (F-pattern, Z-pattern) và luật Gestalt (nhóm các phần tử liên quan lại gần nhau).
   - *Người dùng chọn phương án đầu tiên trông có vẻ hợp lý (Satisficing)*: Người dùng không phân tích mọi lựa chọn; họ sẽ bấm vào nút nổi bật nhất.
   - *Người dùng mò mẫm thử nghiệm (Muddling through)*: Nếu không có phân cấp rõ ràng, họ sẽ bấm bừa.
3. **Krug's Third Law (Omit Needless Words & Clutter)**: Cắt bỏ 50% lượng chữ và chi tiết thừa trên trang. Sau đó, cắt tiếp 50% của phần còn lại. Bỏ các nhãn trường lặp lại máy móc (`Họ và tên:`, `Loại:`), thay bằng Typography tự thân (chữ to đậm = Tiêu đề, màu sắc = Trạng thái).
4. **The Trunk Test (Bài test Cốp xe)**: Bị bịt mắt thả vào bất kỳ màn hình nào cũng phải biết ngay: *Tôi đang ở đâu? Trang này tên gì? Lựa chọn ở đây là gì? Làm sao để quay lại?*

> [!NOTE]
> **Quy tắc An toàn cho Hệ thống Điều hành / Giám sát Chuyên sâu**:
> Trong các hệ thống giám sát thời gian thực (IoT, tài chính, an toàn), sự tối giản của Steve Krug **không được phép che giấu trạng thái lỗi hoặc sự cố của tín hiệu**. Nếu kết nối chập chờn hoặc dữ liệu bị trễ, giao diện phải hiển thị cảnh báo suy hao ngay tại tầm mắt.

---

## 2. Phương pháp Phân tầng Thông tin 3 Cấp ($L_0 - L_1 - L_2$)

Để triệt tiêu hiện tượng "Requirement Dumping" (PRD có 20 trường thông tin thì UI ném cả 20 trường lên cùng một mặt thẻ), mọi dữ liệu trên màn hình phải được phân bổ nghiêm ngặt vào đúng 1 trong 3 tầng:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG L0: GLANCEABLE HEADER (Liếc nhìn trong 1–2 giây)                                  │
│ • Giới hạn: Tối đa 3–4 thông tin cốt lõi nhất                                          │
│ • Nội dung: Trạng thái (Tốt/Xấu) + Tên thực thể chính + Cảnh báo khẩn (nếu có)         │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼ (Tập trung chú ý / Mở rộng)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG L1: CONTEXTUAL EVIDENCE (Ngữ cảnh Ra quyết định 5 giây)                           │
│ • Giới hạn: 5–7 thông tin hỗ trợ trực tiếp cho hành động chính                         │
│ • Nội dung: Bằng chứng trực quan (ảnh, biểu đồ xu hướng), thời gian/SLA, người phụ trách│
│ • Thao tác: DUY NHẤT 01 Nút Primary Action to rõ, các nút phụ làm mờ (ghost/outline)   │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼ (Người dùng chủ động click xem thêm)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG L2: FORENSIC & DEEP DETAILS (Khám nghiệm Chuyên sâu & Tra cứu)                    │
│ • CẤM HIỆN Ở MÀN HÌNH CHÍNH. Giấu vào Drawer trượt, Modal, hoặc Tabs phụ có mục lục.  │
│ • Nội dung: Nhật ký kiểm toán chi tiết, thông số kỹ thuật, cấu hình sâu, raw JSON      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Bốn Bố cục Màn hình Tiêu chuẩn (Screen Layout Patterns)

Khi nhận yêu cầu thiết kế, xác định ngay màn hình thuộc bố cục nào để tổ chức không gian:

| Bố cục Màn hình | Mục đích Sử dụng | Nguyên tắc Bố trí Không gian & Thao tác |
|---|---|---|
| **1. Detail View / Card** *(Xem Chi tiết Thực thể)* | Xem chi tiết 1 sự cố, 1 hồ sơ khách hàng, 1 đơn hàng | • Áp dụng phân tầng $L_0/L_1/L_2$.<br>• $L_0$ ở Header thẻ.<br>• $L_1$ ở Body kèm ảnh/biểu đồ.<br>• $L_2$ giấu vào Tab phụ hoặc Drawer trượt.<br>• 1 Primary CTA duy nhất. |
| **2. Enterprise DataGrid** *(Bảng Dữ liệu Nghiệp vụ)* | Danh sách đơn hàng, nhật ký sự cố, danh mục đối soát | • Thanh lọc tối giản phía trên (Search + 2-3 bộ lọc chính).<br>• Cho phép cuộn mượt (Virtualized Scroll) kèm cố định tiêu đề cột (Sticky Header).<br>• Click vào dòng $\to$ Mở Drawer xem chi tiết từ cạnh phải, không làm mất bối cảnh bảng. |
| **3. Live Monitoring** *(Bảng Giám sát Trực tiếp)* | Màn hình camera CCTV, nhịp tim y tế, giá chứng khoán | • Lưới đa khung (Multi-pane), dải sóng thời gian thực.<br>• Neo chỉ số tín hiệu sống (Signal Health) cạnh từng luồng.<br>• Thao tác đối xứng nếu có hành động 2 chiều (Vd: BẬT vs TẮT, MUA vs BÁN). |
| **4. Composite Dashboard** *(Màn hình Điều hành Phức hợp)* | Trung tâm chỉ huy tích hợp cả Live Stream, Bảng sự cố và Khung chi tiết | • Chia khu vực rành mạch (Phần trên/trái: Stream; Dưới: Bảng sự cố; Phải: Khung chi tiết).<br>• **Liên kết tương tác**: Click 1 dòng ở bảng $\to$ Tự động chuyển camera tương ứng và nạp thông tin vào khung chi tiết. |

---

## 4. Tinh giản Thao tác: Định luật Hick (Hick's Law Action Triage)

Thời gian người dùng ra quyết định tỷ lệ thuận với số lượng nút bấm trước mắt họ. Để giao diện không gây hoảng loạn:

1. **Quy tắc 1 Primary CTA**:
   * Mỗi khung nhìn chi tiết chỉ được phép có **DUY NHẤT 01 nút bấm chính** (kích thước lớn nhất, màu ngữ nghĩa nổi bật, nhãn dứt khoát: `XÁC NHẬN`, `TIẾP NHẬN`, `LƯU THAY ĐỔI`).
   * *Ngoại lệ*: Các màn hình có tính chất đối ngẫu 2 chiều (như MUA và BÁN trong giao dịch, hoặc BẬT và TẮT thiết bị) thì được phép có 2 nút đối xứng có cùng trọng số thị giác.
2. **Secondary Actions**:
   * Các thao tác phụ (Xem lịch sử, Đánh dấu, Báo động giả) phải dùng nút Outline hoặc Ghost button với màu trung tính (`slate-500` hoặc viền mờ), không tranh chấp độ nổi bật với nút chính.
3. **Thao tác Nguy hiểm (Destructive Actions)**:
   * Xóa dữ liệu, dừng hệ thống, bỏ qua cảnh báo: Tách biệt vị trí và yêu cầu xác nhận 2 bước (Two-step confirmation dialog hoặc nhấn giữ).
4. **Công cụ Demo / Quản trị nâng cao**:
   * Tuyệt đối không bày ra thanh công cụ chính. Gom gọn vào menu ba chấm `...` góc trên.

---

## 5. Bảng Kiểm Tra Nhanh Tính Trực Quan (Krug Usability Quick-Check)

Trước khi chuyển giao thiết kế sang khâu viết code, người thiết kế tự đối chiếu 6 câu hỏi:

```
[BẢNG KIỂM TRA TÍNH TRỰC QUAN - DONT MAKE ME THINK CHECKLIST]

[ ] 1. BÀI TEST QUÉT MẮT 3 GIÂY (Scanability):
       Nhìn lướt qua màn hình trong 3 giây, mắt có bám ngay vào đối tượng quan trọng nhất không?
       Có phần tử nào đang vô cớ "gào thét" (nhấp nháy, đổi màu loạn xạ) cản trở việc quét mắt không?

[ ] 2. PHÂN TẦNG L0 / L1 / L2 ĐÃ TRIỆT ĐỂ CHƯA?
       Các thông số kỹ thuật sâu (ID cơ sở dữ liệu, nhật ký thuật toán, bitrate, hash) đã được giấu
       vào Tab phụ/Drawer L2 chưa, hay vẫn đang bày bừa ra màn hình chính?

[ ] 3. ĐÃ CẮT TỈA TỪ NGỮ THỪA (Needless Words) CHƯA?
       Có còn các nhãn trường lặp đi lặp lại máy móc ("Họ và tên:", "Trạng thái:", "Loại:") không?
       Đã chuyển đổi sang Typography tự thân (chữ đậm, màu ngữ nghĩa, icon) chưa?

[ ] 4. ĐỊNH LUẬT HICK VỀ NÚT BẤM (Hick's Law):
       Có đúng 01 nút Primary CTA nổi bật nhất không? Người dùng có bị bối rối vì 4-5 nút cùng màu cạnh nhau không?

[ ] 5. BÀI TEST CỐP XE (Trunk Test):
       Người dùng có biết mình đang ở đâu, thuộc phân hệ nào, và có đường quay lại màn hình trước trong 1 click không?

[ ] 6. BẢO TOÀN TÍN HIỆU SỐNG (Dành cho hệ thống Giám sát/Realtime):
       Nếu dữ liệu bị trễ hoặc mất kết nối, hệ thống có báo ngay cho người dùng biết không,
       hay đang giấu lỗi sau một lớp giao diện "bình yên giả tạo"?
```

---

## 6. Khế ước Cấu trúc Bàn giao Giao diện (Generic Component Schema)

Khi chuyển giao cấu trúc cho kỹ sư frontend lập trình (`web-prototyping`), xuất đặc tả dạng khung dữ liệu tổng quát:

```typescript
// Cấu trúc Dữ liệu Giao diện Phân tầng (Domain-Agnostic)
export interface ScreenLayoutSchema<TGlanceable, TContextual, TForensic> {
  // L0: Header liếc nhìn (Tối đa 3-4 thông tin sống còn)
  glanceableHeader: {
    statusBadge: { label: string; semanticColor: 'red' | 'amber' | 'emerald' | 'slate'; isPulsing?: boolean };
    title: string;
    subtitle?: string;
    signalHealth?: { isLive: boolean; note?: string };
    extraPayload?: TGlanceable;
  };

  // L1: Body ngữ cảnh (Bằng chứng + 1 Primary CTA)
  contextualBody: {
    visualEvidence?: { type: 'IMAGE' | 'CHART'; source: unknown };
    keyMetrics: Array<{ label: string; value: string | number }>;
    primaryAction: { label: string; onExecute: () => void; isUrgent?: boolean };
    secondaryActions?: Array<{ label: string; onExecute: () => void }>;
    extraPayload?: TContextual;
  };

  // L2: Chi tiết sâu (Giấu vào Drawer/Modal)
  forensicInspector?: {
    tabs: Array<{ tabTitle: string; contentPayload: TForensic }>;
  };
}
```

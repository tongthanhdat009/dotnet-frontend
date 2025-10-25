import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// Đảm bảo bạn đã có file robotoRegularBase64 này
import { robotoRegularBase64 } from "./robotoRegularBase64";

export function generateInvoicePDF(order) {
  if (!order) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // 🔹 Thêm font tiếng Việt
  doc.addFileToVFS("Roboto-Regular.ttf", robotoRegularBase64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFont("Roboto-Regular.ttf", "Roboto", "bold");
  doc.setFont("Roboto");

  // --- 1. Header (Thông tin cửa hàng & Thông tin hóa đơn) ---
  // (Giữ nguyên)
  doc.setFont("Roboto", "bold");
  doc.setFontSize(16);
  doc.text("TÊN CỬA HÀNG CỦA BẠN", margin, y);
  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);
  y += 6;
  doc.text("123 Đường ABC, Phường X, Quận Y, TP. Z", margin, y);
  y += 5;
  doc.text("Điện thoại: (028) 3812 3456", margin, y);
  y += 5;
  doc.text("Website: www.ten-cua-hang.com", margin, y);

  let rightColY = 20;
  doc.setFont("Roboto", "bold");
  doc.setFontSize(20);
  doc.text("HOÁ ĐƠN BÁN HÀNG", pageWidth - margin, rightColY, { align: "right" });
  rightColY += 9;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);
  doc.text(`Mã đơn: #${order.OrderId}`, pageWidth - margin, rightColY, { align: "right" });
  rightColY += 5;
  doc.text(`Ngày lập: ${new Date(order.OrderDate).toLocaleString()}`, pageWidth - margin, rightColY, { align: "right" });
  rightColY += 5;
  doc.text(`Người lập: ${order.User?.FullName || "—"}`, pageWidth - margin, rightColY, { align: "right" });

  y = Math.max(y, rightColY) + 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // --- 2. Thông tin chung (2 CỘT) ---
  let yLeft = y;
  let yRight = y;
  const rightColX = 120; // Vị trí bắt đầu của cột phải

  // --- Cột trái: Khách hàng ---
  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.text("THÔNG TIN KHÁCH HÀNG", margin, yLeft);
  yLeft += 6;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);

  doc.text(`Tên khách hàng: ${order.Customer?.Name || "—"}`, margin, yLeft);
  yLeft += 5;

  // Xử lý địa chỉ dài tự động xuống dòng
  const customerAddress = doc.splitTextToSize(
    `Địa chỉ: ${order.Customer?.Address || "—"}`,
    (rightColX - margin - 5) // Giới hạn chiều rộng của cột trái
  );
  doc.text(customerAddress, margin, yLeft);
  yLeft += (customerAddress.length * 5); // Tăng y dựa trên số dòng địa chỉ

  doc.text(`Điện thoại: ${order.Customer?.Phone || "—"}`, margin, yLeft);
  
  // --- Cột phải: Đơn hàng (ĐÃ THÊM) ---
  doc.setFont("Roboto", "bold");
  doc.setFontSize(12);
  doc.text("THÔNG TIN ĐƠN HÀNG", rightColX, yRight);
  yRight += 6;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);

  // Phương thức thanh toán
  const paymentMethods = (order.Payments || [])
    .map(p => p.PaymentMethod)
    .join(", ");
  
  doc.text("Phương thức TT:", rightColX, yRight);
  doc.setFont("Roboto", "bold");
  doc.text(paymentMethods || "—", rightColX + 35, yRight);
  yRight += 6;

  // Trạng thái (ĐÃ DI CHUYỂN LÊN)
  doc.setFont("Roboto", "normal");
  doc.text("Trạng thái:", rightColX, yRight);
  doc.setFont("Roboto", "bold");
  doc.text(order.Status || "—", rightColX + 35, yRight);

  // Cập nhật y chung
  y = Math.max(yLeft, yRight) + 15; // Lấy y của cột cao hơn + 15px đệm

  // --- 3. Bảng sản phẩm ---
  // (Giữ nguyên)
  const items = order.OrderItems?.map((item, i) => [
    i + 1,
    item.Product?.ProductName || "",
    item.Quantity,
    item.Price.toLocaleString("vi-VN"),
    item.Subtotal.toLocaleString("vi-VN"),
  ]) || [];

  autoTable(doc, {
    startY: y,
    head: [["STT", "Sản phẩm", "Số lượng", "Đơn giá (₫)", "Thành tiền (₫)"]],
    body: items,
    theme: 'grid',
    styles: { 
      font: "Roboto", 
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 11
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  // --- 4. Tổng tiền (ĐÃ SỬA LỖI ĐÈ NHAU) ---
  // Đặt vị trí cố định cho Nhãn và căn lề phải cho Giá trị
  const rightAlignX = pageWidth - margin; // Vị trí căn lề phải (VD: 195)
  const labelX = 140; // Vị trí cố định cho nhãn (VD: 140)
  
  doc.setFont("Roboto", "normal");
  doc.setFontSize(11);
  
  doc.text("Tổng cộng:", labelX, finalY);
  doc.text(`${order.TotalAmount.toLocaleString("vi-VN")} ₫`, rightAlignX, finalY, { align: "right" });
  finalY += 7;

  doc.text("Giảm giá:", labelX, finalY);
  doc.text(`${order.DiscountAmount.toLocaleString("vi-VN")} ₫`, rightAlignX, finalY, { align: "right" });
  finalY += 7;
  
  // Vẽ đường kẻ ngay trên Thành tiền
  doc.line(labelX, finalY, rightAlignX, finalY);
  finalY += 7;
  
  doc.setFont("Roboto", "bold");
  doc.setFontSize(13);
  doc.text("Thành tiền:", labelX, finalY);
  doc.text(`${(order.TotalAmount - order.DiscountAmount).toLocaleString("vi-VN")} ₫`, rightAlignX, finalY, { align: "right" });

  // --- 5. Phần chân (Footer) ---
  // (ĐÃ XÓA PT THANH TOÁN VÀ TRẠNG THÁI)
  finalY += 20; // Tăng khoảng cách trước khi kẻ
  doc.line(margin, finalY, pageWidth - margin, finalY);
  finalY += 10;

  const footerRightX = pageWidth - margin - 60; // Vị trí cột chữ ký
  
  // Cột phải: Chữ ký
  let footerRightY = finalY;
  doc.setFont("Roboto", "bold");
  doc.setFontSize(11);
  doc.text("Người lập hóa đơn", footerRightX, footerRightY, { align: 'center', maxWidth: 60 });
  footerRightY += 6;
  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);
  doc.text("(Ký và ghi rõ họ tên)", footerRightX, footerRightY, { align: 'center', maxWidth: 60 });

  // --- Lời cảm ơn (Dưới cùng) ---
  finalY = footerRightY + 30; // Lấy y của chữ ký + 30
  doc.setFontSize(11);
  doc.setFont("Roboto", "normal");
  doc.text("Cảm ơn quý khách và hẹn gặp lại!", pageWidth / 2, finalY, { align: "center" });

  // --- Hiển thị PDF ---
  window.open(doc.output("bloburl"), "_blank");
}
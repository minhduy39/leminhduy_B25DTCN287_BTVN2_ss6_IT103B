const readline = require("readline-sync");

// Biểu phí cố định (VNĐ)
const PACKAGE_RATES = {
  STANDARD: 500000,
  VIP: 800000,
};
const PT_RATE_PER_SESSION = 300000;

// Các biến duy trì trạng thái ca trực
const registeredMembers = [];
let totalRevenue = 0;
let checkInCount = 0;

// Hàm định dạng tiền tệ VNĐ
function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN") + " VND";
}

// Hàm chuẩn hóa Tên hội viên (Title Case)
function normalizeName(name) {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

let choice = 0;

do {
  console.log("\n==================================================");
  console.log("   HE THONG QUAN LY HOI VIEN & CA TRUC GYM   ");
  console.log("==================================================");
  console.log("1. Dang ky va chuan hoa ho so hoi vien moi");
  console.log("2. Tinh tien goi tap va ap dung chiet khau");
  console.log("3. Quet ma the check-in tai cua quay");
  console.log("4. Xuat bao cao thong ke ca truc va Thoat");
  console.log("==================================================");

  choice = parseInt(readline.question("Chon chuc nang (1-4): "));

  switch (choice) {
    case 1: {
      console.log("\n--- CHUC NANG 1: DANG KY HOI VIEN MOI ---");
      const rawName = readline.question("Nhap ho ten hoi vien: ");
      if (!rawName.trim()) {
        console.log(" Lỗi: Ho ten khong duoc de rong!");
        break;
      }

      const cleanName = normalizeName(rawName);

      console.log("Chon goi tap: 1. STANDARD (500k/thang) | 2. VIP (800k/thang)");
      const pkgChoice = readline.question("Lua chon (1-2): ");
      const pkgType = pkgChoice === "2" ? "VIP" : "STANDARD";

      // Tạo hồ sơ hội viên mới
      const newMember = {
        id: registeredMembers.length + 1,
        name: cleanName,
        package: pkgType,
        isBilled: false,
      };

      registeredMembers.push(newMember);
      console.log(` Dang ky thanh cong! ID: ${newMember.id} | Hoi vien: "${cleanName}" | Goi: ${pkgType}`);
      break;
    }

    case 2: {
      console.log("\n--- CHUC NANG 2: TINH TIEN GOI TAP & CHIET KHAU ---");

      // Chặn tính tiền nếu chưa có hội viên đăng ký
      if (registeredMembers.length === 0) {
        console.log(" Lỗi: Chua co hoi vien nao trong he thong! Vui long thuc hien Chuc nang 1 truoc.");
        break;
      }

      // Lấy hội viên chưa tính tiền gần nhất
      const unbilledMember = registeredMembers.find(m => !m.isBilled);
      if (!unbilledMember) {
        console.log(" Tat ca hoi vien da duoc thanh toan hoa don!");
        break;
      }

      console.log(`Dang tinh tien cho Hoi vien: ${unbilledMember.name} (Goi: ${unbilledMember.package})`);

      const months = parseInt(readline.question("Nhap so thang dang ky (VD: 1, 6, 12): ")) || 1;
      const ptSessions = parseInt(readline.question("Nhap so buoi thue PT (300k/buoi, nhap 0 neu khong thue): ")) || 0;

      // 1. Tính giá gốc
      const basePackageCost = PACKAGE_RATES[unbilledMember.package] * months;
      const ptCost = ptSessions * PT_RATE_PER_SESSION;

      // 2. Tính chiết khấu thời hạn
      let discountRate = 0;
      if (months >= 12) {
        discountRate = 0.25; // Giảm 25%
      } else if (months >= 6) {
        discountRate = 0.15; // Giảm 15%
      }

      const packageDiscount = basePackageCost * discountRate;
      const finalPackageCost = basePackageCost - packageDiscount;
      const totalAmount = finalPackageCost + ptCost;

      // Cập nhật trạng thái
      unbilledMember.isBilled = true;
      totalRevenue += totalAmount;

      // In hóa đơn
      console.log("\n--------------------------------------------------");
      console.log("               HOA DON THANH TOAN                 ");
      console.log("--------------------------------------------------");
      console.log(`Hoi vien       : ${unbilledMember.name}`);
      console.log(`Goi tap        : ${unbilledMember.package} (${months} thang)`);
      console.log(`Tien goi goc   : ${formatCurrency(basePackageCost)}`);
      if (discountRate > 0) {
        console.log(`Chiet khau     : -${formatCurrency(packageDiscount)} (${discountRate * 100}%)`);
      }
      console.log(`Thue PT (${ptSessions} buoi): ${formatCurrency(ptCost)}`);
      console.log("--------------------------------------------------");
      console.log(`TONG THANH TOAN: ${formatCurrency(totalAmount)}`);
      console.log("--------------------------------------------------");
      console.log(" Thanh toan thanh cong! Doanh thu ca truc da duoc cap nhat.");
      break;
    }

    case 3: {
      console.log("\n--- CHUC NANG 3: QUET MA THE CHECK-IN TAI CUA QUAY ---");
      const rawCardCode = readline.question("Nhap/Quet ma the (VD: GYM-VIP-2026): ");
      const cleanCardCode = rawCardCode.trim().toUpperCase();

      const currentYear = new Date().getFullYear().toString(); // Lấy năm hiện tại (2026)

      // Quy tắc: Bắt đầu bằng "GYM-" và kết thúc bằng Năm hiện tại
      const isValidPrefix = cleanCardCode.startsWith("GYM-");
      const isValidSuffix = cleanCardCode.endsWith(currentYear);

      if (isValidPrefix && isValidSuffix) {
        checkInCount++;
        console.log(` CHECK-IN THANH CONG! [Thẻ: ${cleanCardCode}]`);
        console.log(` Cửa quay mở. Cho phép hội viên vào tập.`);
      } else {
        console.log(` CHECK-IN THAT BAI! Ma the "${cleanCardCode}" khong hop le.`);
        console.log(` Quy tắc: Phai bat dau bang 'GYM-' va ket thuc bang nam hien tai (${currentYear}).`);
      }
      break;
    }

    case 4: {
      console.log("\n==================================================");
      console.log("          BAO CAO THONG KE CA TRUC PHONG GYM      ");
      console.log("==================================================");
      console.log(` Tong so hoi vien dang ky moi : ${registeredMembers.length} nguoi`);
      console.log(` Tong so luot check-in cua    : ${checkInCount} luot`);
      console.log(` TONG DOANH THU CA TRUC       : ${formatCurrency(totalRevenue)}`);
      console.log("==================================================");
      console.log("Ca truc da ket thuc. Chuc ban mot ngay tot lang!");
      break;
    }

    default:
      console.log(" Lua chon khong hop le! Vui long chon tu 1 den 4.");
      break;
  }
} while (choice !== 4);
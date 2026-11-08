export interface VietnamCityInfo {
  name: string;
  region: 'Miền Bắc' | 'Miền Trung & Tây Nguyên' | 'Miền Nam' | 'Quốc Tế';
  longitude: number;
  utcOffsetMinutes: number; // 420 cho Việt Nam (UTC+7 -> kinh tuyến chuẩn 105°E)
}

export const VIETNAM_CITIES: VietnamCityInfo[] = [
  // ─── MIỀN BẮC ───
  { name: 'Hà Nội', region: 'Miền Bắc', longitude: 105.85, utcOffsetMinutes: 420 },
  { name: 'Hải Phòng', region: 'Miền Bắc', longitude: 106.68, utcOffsetMinutes: 420 },
  { name: 'Quảng Ninh (Hạ Long)', region: 'Miền Bắc', longitude: 107.08, utcOffsetMinutes: 420 },
  { name: 'Bắc Ninh', region: 'Miền Bắc', longitude: 106.07, utcOffsetMinutes: 420 },
  { name: 'Bắc Giang', region: 'Miền Bắc', longitude: 106.19, utcOffsetMinutes: 420 },
  { name: 'Hải Dương', region: 'Miền Bắc', longitude: 106.33, utcOffsetMinutes: 420 },
  { name: 'Hưng Yên', region: 'Miền Bắc', longitude: 106.05, utcOffsetMinutes: 420 },
  { name: 'Vĩnh Phúc', region: 'Miền Bắc', longitude: 105.60, utcOffsetMinutes: 420 },
  { name: 'Thái Nguyên', region: 'Miền Bắc', longitude: 105.84, utcOffsetMinutes: 420 },
  { name: 'Phú Thọ (Việt Trì)', region: 'Miền Bắc', longitude: 105.40, utcOffsetMinutes: 420 },
  { name: 'Nam Định', region: 'Miền Bắc', longitude: 106.17, utcOffsetMinutes: 420 },
  { name: 'Thái Bình', region: 'Miền Bắc', longitude: 106.34, utcOffsetMinutes: 420 },
  { name: 'Ninh Bình', region: 'Miền Bắc', longitude: 105.97, utcOffsetMinutes: 420 },
  { name: 'Hà Nam (Phủ Lý)', region: 'Miền Bắc', longitude: 105.91, utcOffsetMinutes: 420 },
  { name: 'Hòa Bình', region: 'Miền Bắc', longitude: 105.34, utcOffsetMinutes: 420 },
  { name: 'Sơn La', region: 'Miền Bắc', longitude: 103.91, utcOffsetMinutes: 420 },
  { name: 'Điện Biên', region: 'Miền Bắc', longitude: 103.02, utcOffsetMinutes: 420 },
  { name: 'Lai Châu', region: 'Miền Bắc', longitude: 103.46, utcOffsetMinutes: 420 },
  { name: 'Lào Cai', region: 'Miền Bắc', longitude: 103.97, utcOffsetMinutes: 420 },
  { name: 'Yên Bái', region: 'Miền Bắc', longitude: 104.87, utcOffsetMinutes: 420 },
  { name: 'Tuyên Quang', region: 'Miền Bắc', longitude: 105.21, utcOffsetMinutes: 420 },
  { name: 'Hà Giang', region: 'Miền Bắc', longitude: 104.98, utcOffsetMinutes: 420 },
  { name: 'Cao Bằng', region: 'Miền Bắc', longitude: 106.26, utcOffsetMinutes: 420 },
  { name: 'Bắc Kạn', region: 'Miền Bắc', longitude: 105.83, utcOffsetMinutes: 420 },
  { name: 'Lạng Sơn', region: 'Miền Bắc', longitude: 106.76, utcOffsetMinutes: 420 },

  // ─── MIỀN TRUNG & TÂY NGUYÊN ───
  { name: 'Đà Nẵng', region: 'Miền Trung & Tây Nguyên', longitude: 108.20, utcOffsetMinutes: 420 },
  { name: 'Thanh Hóa', region: 'Miền Trung & Tây Nguyên', longitude: 105.78, utcOffsetMinutes: 420 },
  { name: 'Nghệ An (Vinh)', region: 'Miền Trung & Tây Nguyên', longitude: 105.68, utcOffsetMinutes: 420 },
  { name: 'Hà Tĩnh', region: 'Miền Trung & Tây Nguyên', longitude: 105.90, utcOffsetMinutes: 420 },
  { name: 'Quảng Bình (Đồng Hới)', region: 'Miền Trung & Tây Nguyên', longitude: 106.62, utcOffsetMinutes: 420 },
  { name: 'Quảng Trị (Đông Hà)', region: 'Miền Trung & Tây Nguyên', longitude: 107.10, utcOffsetMinutes: 420 },
  { name: 'Thừa Thiên Huế', region: 'Miền Trung & Tây Nguyên', longitude: 107.59, utcOffsetMinutes: 420 },
  { name: 'Quảng Nam (Tam Kỳ / Hội An)', region: 'Miền Trung & Tây Nguyên', longitude: 108.47, utcOffsetMinutes: 420 },
  { name: 'Quảng Ngãi', region: 'Miền Trung & Tây Nguyên', longitude: 108.80, utcOffsetMinutes: 420 },
  { name: 'Bình Định (Quy Nhơn)', region: 'Miền Trung & Tây Nguyên', longitude: 109.22, utcOffsetMinutes: 420 },
  { name: 'Phú Yên (Tuy Hòa)', region: 'Miền Trung & Tây Nguyên', longitude: 109.30, utcOffsetMinutes: 420 },
  { name: 'Khánh Hòa (Nha Trang)', region: 'Miền Trung & Tây Nguyên', longitude: 109.19, utcOffsetMinutes: 420 },
  { name: 'Ninh Thuận (Phan Rang)', region: 'Miền Trung & Tây Nguyên', longitude: 108.99, utcOffsetMinutes: 420 },
  { name: 'Bình Thuận (Phan Thiết)', region: 'Miền Trung & Tây Nguyên', longitude: 108.10, utcOffsetMinutes: 420 },
  { name: 'Lâm Đồng (Đà Lạt)', region: 'Miền Trung & Tây Nguyên', longitude: 108.44, utcOffsetMinutes: 420 },
  { name: 'Đắk Lắk (Buôn Ma Thuột)', region: 'Miền Trung & Tây Nguyên', longitude: 108.04, utcOffsetMinutes: 420 },
  { name: 'Đắk Nông (Gia Nghĩa)', region: 'Miền Trung & Tây Nguyên', longitude: 107.69, utcOffsetMinutes: 420 },
  { name: 'Gia Lai (Pleiku)', region: 'Miền Trung & Tây Nguyên', longitude: 108.00, utcOffsetMinutes: 420 },
  { name: 'Kon Tum', region: 'Miền Trung & Tây Nguyên', longitude: 108.00, utcOffsetMinutes: 420 },

  // ─── MIỀN NAM ───
  { name: 'TP. Hồ Chí Minh', region: 'Miền Nam', longitude: 106.66, utcOffsetMinutes: 420 },
  { name: 'Cần Thơ', region: 'Miền Nam', longitude: 105.78, utcOffsetMinutes: 420 },
  { name: 'Bình Dương (Thủ Dầu Một)', region: 'Miền Nam', longitude: 106.65, utcOffsetMinutes: 420 },
  { name: 'Đồng Nai (Biên Hòa)', region: 'Miền Nam', longitude: 106.82, utcOffsetMinutes: 420 },
  { name: 'Bà Rịa - Vũng Tàu', region: 'Miền Nam', longitude: 107.08, utcOffsetMinutes: 420 },
  { name: 'Tây Ninh', region: 'Miền Nam', longitude: 106.10, utcOffsetMinutes: 420 },
  { name: 'Bình Phước (Đồng Xoài)', region: 'Miền Nam', longitude: 106.89, utcOffsetMinutes: 420 },
  { name: 'Long An (Tân An)', region: 'Miền Nam', longitude: 106.41, utcOffsetMinutes: 420 },
  { name: 'Tiền Giang (Mỹ Tho)', region: 'Miền Nam', longitude: 106.36, utcOffsetMinutes: 420 },
  { name: 'Bến Tre', region: 'Miền Nam', longitude: 106.38, utcOffsetMinutes: 420 },
  { name: 'Trà Vinh', region: 'Miền Nam', longitude: 106.34, utcOffsetMinutes: 420 },
  { name: 'Vĩnh Long', region: 'Miền Nam', longitude: 105.97, utcOffsetMinutes: 420 },
  { name: 'Đồng Tháp (Cao Lãnh)', region: 'Miền Nam', longitude: 105.63, utcOffsetMinutes: 420 },
  { name: 'An Giang (Long Xuyên)', region: 'Miền Nam', longitude: 105.43, utcOffsetMinutes: 420 },
  { name: 'Kiên Giang (Rạch Giá / Phú Quốc)', region: 'Miền Nam', longitude: 105.08, utcOffsetMinutes: 420 },
  { name: 'Hậu Giang (Vị Thanh)', region: 'Miền Nam', longitude: 105.47, utcOffsetMinutes: 420 },
  { name: 'Sóc Trăng', region: 'Miền Nam', longitude: 105.97, utcOffsetMinutes: 420 },
  { name: 'Bạc Liêu', region: 'Miền Nam', longitude: 105.72, utcOffsetMinutes: 420 },
  { name: 'Cà Mau', region: 'Miền Nam', longitude: 105.15, utcOffsetMinutes: 420 },

  // ─── QUỐC TẾ PHỔ BIẾN ───
  { name: 'Đài Bắc (Đài Loan)', region: 'Quốc Tế', longitude: 121.56, utcOffsetMinutes: 480 },
  { name: 'Bắc Kinh (Trung Quốc)', region: 'Quốc Tế', longitude: 116.40, utcOffsetMinutes: 480 },
  { name: 'Thượng Hải (Trung Quốc)', region: 'Quốc Tế', longitude: 121.47, utcOffsetMinutes: 480 },
  { name: 'Tokyo (Nhật Bản)', region: 'Quốc Tế', longitude: 139.69, utcOffsetMinutes: 540 },
  { name: 'Seoul (Hàn Quốc)', region: 'Quốc Tế', longitude: 126.98, utcOffsetMinutes: 540 },
  { name: 'Singapore', region: 'Quốc Tế', longitude: 103.82, utcOffsetMinutes: 480 },
];

export const VIETNAM_REGIONS: VietnamCityInfo['region'][] = [
  'Miền Bắc',
  'Miền Trung & Tây Nguyên',
  'Miền Nam',
  'Quốc Tế',
];

export function findCityByName(name: string): VietnamCityInfo | undefined {
  return VIETNAM_CITIES.find((c) => c.name === name);
}


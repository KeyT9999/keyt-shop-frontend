export interface FamousChartPresetVi {
  id: string;
  nameVi: string;
  nameCn: string;
  categoryVi: 'Doanh nhân' | 'Công nghệ' | 'Nghệ thuật' | 'Thể thao';
  roleVi: string;
  year: number;
  month: number;
  day: number;
  hourBranch: number; // 0=Tý ... 11=Hợi
  clockHour: number;
  gender: 'male' | 'female';
  highlightVi: string;
}

export const FAMOUS_CHART_PRESETS_VI: FamousChartPresetVi[] = [
  {
    id: 'steve-jobs',
    nameVi: 'Steve Jobs',
    nameCn: '乔布斯',
    categoryVi: 'Công nghệ',
    roleVi: 'Đồng sáng lập Apple • Biểu tượng cách mạng công nghệ',
    year: 1955,
    month: 2,
    day: 24,
    hourBranch: 6, // Giờ Ngọ
    clockHour: 12,
    gender: 'male',
    highlightVi:
      'Phá Quân thủ Mệnh — hình mẫu điển hình của cách cục "Tiên phá hậu lập": dám đập bỏ lối mòn để kiến tạo đế chế công nghệ hoàn toàn mới.',
  },
  {
    id: 'elon-musk',
    nameVi: 'Elon Musk',
    nameCn: '马斯克',
    categoryVi: 'Công nghệ',
    roleVi: 'Sáng lập SpaceX & CEO Tesla',
    year: 1971,
    month: 6,
    day: 28,
    hourBranch: 4, // Giờ Thìn (07:30)
    clockHour: 7,
    gender: 'male',
    highlightVi:
      'Cách cục Sát Phá Tham cực mạnh hội cùng Thiên Mã — khát vọng chinh phục không gian và liên tục mở rộng biên giới tương lai nhân loại.',
  },
  {
    id: 'jack-ma',
    nameVi: 'Mã Vân (Jack Ma)',
    nameCn: '马云',
    categoryVi: 'Doanh nhân',
    roleVi: 'Nhà sáng lập Tập đoàn Alibaba',
    year: 1964,
    month: 9,
    day: 10,
    hourBranch: 5, // Giờ Tỵ
    clockHour: 10,
    gender: 'male',
    highlightVi:
      'Cung Quan Lộc và Tài Bạch hội chiếu mạnh mẽ, thể hiện tài hùng biện thuyết phục và năng lực xây dựng hệ sinh thái thương mại điện tử.',
  },
  {
    id: 'li-ka-shing',
    nameVi: 'Lý Gia Thành (Li Ka-shing)',
    nameCn: '李嘉诚',
    categoryVi: 'Doanh nhân',
    roleVi: 'Tỷ phú Hồng Kông • Sáng lập CK Hutchison',
    year: 1928,
    month: 7,
    day: 29,
    hourBranch: 3, // Giờ Mão
    clockHour: 6,
    gender: 'male',
    highlightVi:
      'Lộc Tồn thủ Tài, Tứ Hóa liên kết chặt chẽ với cung Điền Trạch — lá số kinh điển về khả năng tích lũy tài sản và bất động sản bền vững.',
  },
  {
    id: 'ren-zhengfei',
    nameVi: 'Nhậm Chính Phi',
    nameCn: '任正非',
    categoryVi: 'Doanh nhân',
    roleVi: 'Nhà sáng lập Tập đoàn Huawei',
    year: 1944,
    month: 10,
    day: 25,
    hourBranch: 3, // Giờ Mão
    clockHour: 6,
    gender: 'male',
    highlightVi:
      'Thất Sát nhập Mệnh — bản lĩnh tướng soái, càng đối mặt với nghịch cảnh và sức ép lớn càng phát huy nội lực phi thường.',
  },
  {
    id: 'jay-chou',
    nameVi: 'Châu Kiệt Luân (Jay Chou)',
    nameCn: '周杰伦',
    categoryVi: 'Nghệ thuật',
    roleVi: 'Thiên vương âm nhạc Hoa ngữ',
    year: 1979,
    month: 1,
    day: 18,
    hourBranch: 1, // Giờ Sửu
    clockHour: 2,
    gender: 'male',
    highlightVi:
      'Văn Khúc hội cùng Tham Lang — thiên phú nghệ thuật bẩm sinh, kết hợp nhuần nhuyễn giữa cổ điển phương Đông và âm nhạc hiện đại.',
  },
  {
    id: 'faye-wong',
    nameVi: 'Vương Phi (Faye Wong)',
    nameCn: '王菲',
    categoryVi: 'Nghệ thuật',
    roleVi: 'Danh ca huyền thoại làng nhạc Hoa ngữ',
    year: 1969,
    month: 8,
    day: 8,
    hourBranch: 4, // Giờ Thìn
    clockHour: 8,
    gender: 'female',
    highlightVi:
      'Khí chất thanh cao độc lập của cung Mệnh và Phúc Đức phản ánh trọn vẹn phong cách nghệ thuật tự tại cùng đường tình duyên đặc sắc.',
  },
  {
    id: 'lin-chi-ling',
    nameVi: 'Lâm Chí Linh',
    nameCn: '林志玲',
    categoryVi: 'Nghệ thuật',
    roleVi: 'Siêu mẫu & Diễn viên Đài Loan',
    year: 1974,
    month: 11,
    day: 29,
    hourBranch: 5, // Giờ Tỵ
    clockHour: 10,
    gender: 'female',
    highlightVi:
      'Thái Âm thủ Mệnh điển hình — minh chứng sống động cho nhận định trong《Thiên Kỷ》về vẻ đẹp nhu mì, trí tuệ và duyên dáng của sao Thái Âm.',
  },
];


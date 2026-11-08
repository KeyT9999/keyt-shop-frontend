import type { ZiweiChart, Palace, Star } from '../engine/types';
import type { Pattern } from '../engine/patterns';

// ─── 1. THIÊN CAN & ĐỊA CHI ────────────────────────────────────────────────
export const STEMS_VI: Record<string, string> = {
  甲: 'Giáp',
  乙: 'Ất',
  丙: 'Bính',
  丁: 'Đinh',
  戊: 'Mậu',
  己: 'Kỷ',
  庚: 'Canh',
  辛: 'Tân',
  壬: 'Nhâm',
  癸: 'Quý',
};

export const BRANCHES_VI: Record<string, string> = {
  子: 'Tý',
  丑: 'Sửu',
  寅: 'Dần',
  卯: 'Mão',
  辰: 'Thìn',
  巳: 'Tỵ',
  午: 'Ngọ',
  未: 'Mùi',
  申: 'Thân',
  酉: 'Dậu',
  戌: 'Tuất',
  亥: 'Hợi',
};

export const HOUR_BRANCH_LABELS_VI: { branch: number; nameVi: string; nameCn: string; range: string }[] = [
  { branch: 0, nameVi: 'Giờ Tý', nameCn: '子时', range: '23:00 - 01:00' },
  { branch: 1, nameVi: 'Giờ Sửu', nameCn: '丑时', range: '01:00 - 03:00' },
  { branch: 2, nameVi: 'Giờ Dần', nameCn: '寅时', range: '03:00 - 05:00' },
  { branch: 3, nameVi: 'Giờ Mão', nameCn: '卯时', range: '05:00 - 07:00' },
  { branch: 4, nameVi: 'Giờ Thìn', nameCn: '辰时', range: '07:00 - 09:00' },
  { branch: 5, nameVi: 'Giờ Tỵ', nameCn: '巳时', range: '09:00 - 11:00' },
  { branch: 6, nameVi: 'Giờ Ngọ', nameCn: '午时', range: '11:00 - 13:00' },
  { branch: 7, nameVi: 'Giờ Mùi', nameCn: '未时', range: '13:00 - 15:00' },
  { branch: 8, nameVi: 'Giờ Thân', nameCn: '申时', range: '15:00 - 17:00' },
  { branch: 9, nameVi: 'Giờ Dậu', nameCn: '酉时', range: '17:00 - 19:00' },
  { branch: 10, nameVi: 'Giờ Tuất', nameCn: '戌时', range: '19:00 - 21:00' },
  { branch: 11, nameVi: 'Giờ Hợi', nameCn: '亥时', range: '21:00 - 23:00' },
];

// ─── 2. MƯỜI HAI CUNG (12 PALACES) ─────────────────────────────────────────
export const PALACE_NAME_VI: Record<string, string> = {
  命宫: 'Mệnh',
  兄弟宫: 'Huynh Đệ',
  兄弟: 'Huynh Đệ',
  夫妻宫: 'Phu Thê',
  夫妻: 'Phu Thê',
  子女宫: 'Tử Nữ',
  子女: 'Tử Nữ',
  财帛宫: 'Tài Bạch',
  财帛: 'Tài Bạch',
  疾厄宫: 'Tật Ách',
  疾厄: 'Tật Ách',
  迁移宫: 'Thiên Di',
  迁移: 'Thiên Di',
  交友宫: 'Nô Bộc',
  交友: 'Nô Bộc',
  仆役宫: 'Nô Bộc',
  仆役: 'Nô Bộc',
  官禄宫: 'Quan Lộc',
  官禄: 'Quan Lộc',
  事业宫: 'Quan Lộc',
  田宅宫: 'Điền Trạch',
  田宅: 'Điền Trạch',
  福德宫: 'Phúc Đức',
  福德: 'Phúc Đức',
  父母宫: 'Phụ Mẫu',
  父母: 'Phụ Mẫu',
  身宫: 'Thân',
};

export const PALACE_ROLE_VI: Record<string, string> = {
  命宫: 'Bản mệnh, tính cách cốt lõi, khí chất và tổng cách cuộc đời',
  兄弟宫: 'Anh chị em, bằng hữu thân thiết, đối tác làm ăn chung',
  兄弟: 'Anh chị em, bằng hữu thân thiết, đối tác làm ăn chung',
  夫妻宫: 'Tình duyên, hôn nhân, hình mẫu người phối ngẫu',
  夫妻: 'Tình duyên, hôn nhân, hình mẫu người phối ngẫu',
  子女宫: 'Con cái, hậu vận, học trò, cấp dưới và năng lực sáng tạo',
  子女: 'Con cái, hậu vận, học trò, cấp dưới và năng lực sáng tạo',
  财帛宫: 'Phương thức kiếm tiền, dòng tiền, năng lực quản lý tài chính',
  财帛: 'Phương thức kiếm tiền, dòng tiền, năng lực quản lý tài chính',
  疾厄宫: 'Thể질 sức khỏe, cơ quan tạng phủ cần lưu ý và tai ách tiềm ẩn',
  疾厄: 'Thể chất sức khỏe, cơ quan tạng phủ cần lưu ý và tai ách tiềm ẩn',
  迁移宫: 'Xuất ngoại, môi trường xã hội bên ngoài, quý nhân phương xa',
  迁移: 'Xuất ngoại, môi trường xã hội bên ngoài, quý nhân phương xa',
  交友宫: 'Bạn bè xã giao, cộng sự, thuộc cấp, nhân duyên đám đông',
  交友: 'Bạn bè xã giao, cộng sự, thuộc cấp, nhân duyên đám đông',
  仆役: 'Bạn bè xã giao, cộng sự, thuộc cấp, nhân duyên đám đông',
  官禄宫: 'Con đường sự nghiệp, công danh, học vấn và vị thế xã hội',
  官禄: 'Con đường sự nghiệp, công danh, học vấn và vị thế xã hội',
  田宅宫: 'Điền sản, nhà cửa, kho tiền tích lũy và gia phong',
  田宅: 'Điền sản, nhà cửa, kho tiền tích lũy và gia phong',
  福德宫: 'Đời sống tinh thần, phúc ấm tổ tiên, hậu vận và thọ nguyên',
  福德: 'Đời sống tinh thần, phúc ấm tổ tiên, hậu vận và thọ nguyên',
  父母宫: 'Cha mẹ, bề trên, thầy cô, giấy tờ pháp lý và học hành',
  父母: 'Cha mẹ, bề trên, thầy cô, giấy tờ pháp lý và học hành',
};

// ─── 3. NGŨ HÀNH CỤC, ÂM DƯƠNG, ĐỘ SÁNG, TỨ HÓA ────────────────────────────
export const WUXING_JU_VI: Record<string, string> = {
  水二局: 'Thủy Nhị Cục (2)',
  木三局: 'Mộc Tam Cục (3)',
  金四局: 'Kim Tứ Cục (4)',
  土五局: 'Thổ Ngũ Cục (5)',
  火六局: 'Hỏa Lục Cục (6)',
};

export const YIN_YANG_GENDER_VI: Record<string, string> = {
  阳男: 'Dương Nam',
  阴男: 'Âm Nam',
  阳女: 'Dương Nữ',
  阴女: 'Âm Nữ',
};

export const BRIGHTNESS_VI: Record<string, string> = {
  庙: 'Miếu',
  旺: 'Vượng',
  得: 'Đắc',
  利: 'Lợi',
  平: 'Bình',
  不: 'Bất',
  闲: 'Nhàn',
  陷: 'Hãm',
  地: 'Địa',
};

export const SIHUA_VI: Record<string, string> = {
  禄: 'Lộc',
  权: 'Quyền',
  科: 'Khoa',
  忌: 'Kỵ',
};

export const SIHUA_FULL_VI: Record<string, string> = {
  禄: 'Hóa Lộc',
  权: 'Hóa Quyền',
  科: 'Hóa Khoa',
  忌: 'Hóa Kỵ',
};

// ─── 4. TỪ ĐIỂN TÊN SAO HÁN – VIỆT (108+ SAO & THẦN SÁT) ──────────────────
export const STAR_NAME_VI: Record<string, string> = {
  // 14 Chính Tinh
  紫微: 'Tử Vi',
  天机: 'Thiên Cơ',
  太阳: 'Thái Dương',
  武曲: 'Vũ Khúc',
  天同: 'Thiên Đồng',
  廉贞: 'Liêm Trinh',
  天府: 'Thiên Phủ',
  太阴: 'Thái Âm',
  贪狼: 'Tham Lang',
  巨门: 'Cự Môn',
  天相: 'Thiên Tướng',
  天梁: 'Thiên Lương',
  七杀: 'Thất Sát',
  破军: 'Phá Quân',

  // Lục Cát Tinh + Lộc Mã
  左辅: 'Tả Phù',
  右弼: 'Hữu Bật',
  文昌: 'Văn Xương',
  文曲: 'Văn Khúc',
  天魁: 'Thiên Khôi',
  天钺: 'Thiên Việt',
  禄存: 'Lộc Tồn',
  天马: 'Thiên Mã',

  // Lục Sát Tinh
  擎羊: 'Kình Dương',
  陀罗: 'Đà La',
  火星: 'Hỏa Tinh',
  铃星: 'Linh Tinh',
  地空: 'Địa Không',
  地劫: 'Địa Kiếp',

  // Tạp Diệu & Phụ Tinh
  红鸾: 'Hồng Loan',
  天喜: 'Thiên Hỷ',
  天姚: 'Thiên Diêu',
  咸池: 'Hàm Trì',
  天刑: 'Thiên Hình',
  阴煞: 'Âm Sát',
  天哭: 'Thiên Khốc',
  天虚: 'Thiên Hư',
  孤辰: 'Cô Thần',
  寡宿: 'Quả Tú',
  龙池: 'Long Trì',
  凤阁: 'Phượng Các',
  三台: 'Tam Đài',
  八座: 'Bát Tọa',
  恩光: 'Ân Quang',
  天贵: 'Thiên Quý',
  台辅: 'Đài Phụ',
  封诰: 'Phong Cáo',
  天官: 'Thiên Quan',
  天福: 'Thiên Phúc',
  天才: 'Thiên Tài',
  天寿: 'Thiên Thọ',
  天巫: 'Thiên Vu',
  天月: 'Thiên Nguyệt',
  解神: 'Giải Thần',
  年解: 'Niên Giải',
  破碎: 'Phá Toái',
  蜚廉: 'Phi Liêm',
  飞廉: 'Phi Liêm',
  旬空: 'Tuần Không',
  副旬: 'Phó Tuần',
  截空: 'Triệt Không',
  副截: 'Phó Triệt',
  截路: 'Triệt Lộ',
  空亡: 'Không Vong',
  天空: 'Thiên Không',
  天伤: 'Thiên Thương',
  天使: 'Thiên Sứ',
  天厨: 'Thiên Trù',
  华盖: 'Hoa Cái',
  天德: 'Thiên Đức',
  月德: 'Nguyệt Đức',
  龙德: 'Long Đức',

  // Vòng Bác Sĩ 12 Thần
  博士: 'Bác Sĩ',
  力士: 'Lực Sĩ',
  青龙: 'Thanh Long',
  小耗: 'Tiểu Hao',
  将军: 'Tướng Quân',
  奏书: 'Tấu Thư',
  喜神: 'Hỷ Thần',
  堂符: 'Đường Phù',
  病符: 'Bệnh Phù',
  大耗: 'Đại Hao',
  伏兵: 'Phục Binh',
  官符: 'Quan Phù',

  // Vòng Thái Tuế / Tuế Tiền 12 Thần
  岁建: 'Tuế Kiến (Thái Tuế)',
  晦气: 'Hối Khí',
  丧门: 'Tang Môn',
  贯索: 'Quán Sách',
  岁破: 'Tuế Phá',
  白虎: 'Bạch Hổ',
  吊客: 'Điếu Khách',

  // Vòng Tướng Tiền 12 Thần
  将星: 'Tướng Tinh',
  攀鞍: 'Phan Án',
  岁驿: 'Tuế Dịch',
  息神: 'Tức Thần',
  劫煞: 'Kiếp Sát',
  灾煞: 'Tai Sát',
  天煞: 'Thiên Sát',
  指背: 'Chỉ Bối',
  月煞: 'Nguyệt Sát',
  亡神: 'Vong Thần',

  // Vòng Tràng Sinh 12 Thần
  长生: 'Tràng Sinh',
  沐浴: 'Mộc Dục',
  冠带: 'Quan Đới',
  临官: 'Lâm Quan',
  帝旺: 'Đế Vượng',
  衰: 'Suy',
  病: 'Bệnh',
  死: 'Tử',
  墓: 'Mộ',
  绝: 'Tuyệt',
  胎: 'Thai',
  养: 'Dưỡng',
};

// ─── 5. TRI THỨC CHI TIẾT SAO (NGHÊ HẢI HẠ 《THIÊN KỶ》 & TOÀN THƯ) ─────────
export interface StarDetailInfoVi {
  nameCn: string;
  nameVi: string;
  elementVi: string;
  natureVi: string;
  keywordsVi: string[];
  summaryVi: string;
  niHaixiaQuoteVi: string;
  classicQuoteVi: string;
}

export const STAR_DETAILS_VI: Record<string, StarDetailInfoVi> = {
  紫微: {
    nameCn: '紫微',
    nameVi: 'Tử Vi',
    elementVi: 'Âm Thổ (Đế Tinh)',
    natureVi: 'Chính tinh Đế Vương • Chủ Quan Lộc & Uy Quyền',
    keywordsVi: ['Đế vương', 'Tôn quý', 'Lãnh đạo', 'Độc lập', 'Hóa giải tai ách'],
    summaryVi:
      'Tử Vi là Bắc Đẩu Đế Tinh, đứng đầu các sao trong Tử Vi Đẩu Số. Đóng ở Mệnh chủ người có khí chất lãnh đạo, tự trọng cao, có khả năng thống lĩnh và giải trừ tai ương khi hội đủ Tả Phù, Hữu Bật.',
    niHaixiaQuoteVi:
      'Thầy Nghê Hải Hạ giảng trong《Thiên Kỷ》: "Tử Vi là vua, vua thì cần quần thần (Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Khôi Việt) vây quanh mới thành cách Quân Thần Khánh Hội. Nếu Tử Vi độc tọa mà không có phụ bật chẳng khác nào cô quân."',
    classicQuoteVi:
      '《Tử Vi Đẩu Số Toàn Thư》: "Tử Vi thuộc Thổ,乃 trung thiên chi tôn tinh, vi Đế tọa, chủ chưởng tạo hóa chi xu cơ, nhân sinh chi chủ tể."',
  },
  天机: {
    nameCn: '天机',
    nameVi: 'Thiên Cơ',
    elementVi: 'Ất Mộc (Thiện Tinh)',
    natureVi: 'Trí Tuệ Tinh • Chủ Mưu Lược, Biến Hóa & Huynh Đệ',
    keywordsVi: ['Mưu lược', 'Trí tuệ', 'Nhạy bén', 'Linh hoạt', 'Tham mưu'],
    summaryVi:
      'Thiên Cơ là sao của trí tuệ, sự vận động không ngừng và khả năng phân tích sắc bén. Người có Thiên Cơ thủ Mệnh tư duy nhanh nhạy, giỏi hoạch định chiến lược, hợp làm quân sư, kỹ thuật, nghiên cứu.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Thiên Cơ chủ về trí khôn và sự cơ biến. Đi cùng Thiên Lương, Thái Âm, Thiên Đồng gọi là cách Cơ Nguyệt Đồng Lương – chuyên làm công chức, tham mưu, hoạch định xuất sắc."',
    classicQuoteVi:
      '《Toàn Thư》: "Thiên Cơ thuộc Mộc, Nam Đẩu đệ tam tinh, hóa khí viết Thiện, vi Huynh Đệ chủ."',
  },
  太阳: {
    nameCn: '太阳',
    nameVi: 'Thái Dương',
    elementVi: 'Bính Hỏa (Quý Tinh)',
    natureVi: 'Nhật Tinh • Chủ Quan Quý, Quang Minh & Nam Quyền',
    keywordsVi: ['Quang minh', 'Hào sảng', 'Quan quý', 'Cho đi', 'Danh tiếng'],
    summaryVi:
      'Thái Dương tượng trưng cho Mặt Trời chiếu sáng vạn vật, đại diện cho người cha, chồng, con trai. Thái Dương miếu vượng (sinh ban ngày từ Dần đến Ngọ) chủ người hào phóng, chính trực, danh tiếng vang xa.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Xem Thái Dương quan trọng nhất là Miếu hay Hãm: Thái Dương ở Mão – Ngọ như mặt trời giữa trưa, đại quý; ngược lại Thái Dương ở Hợi – Tý là mặt trời lúc nửa đêm (Nhật trầm thủy để), vất vả bôn ba nhưng nội tâm vẫn giữ ánh sáng."',
    classicQuoteVi:
      '《Toàn Thư》: "Thái Dương thuộc Hỏa, nhật chi tinh, hóa khí viết Quý, vi Quan Lộc chủ."',
  },
  武曲: {
    nameCn: '武曲',
    nameVi: 'Vũ Khúc',
    elementVi: 'Tân Kim (Tài Tinh)',
    natureVi: 'Chính Tài Tinh • Chủ Tiền Tài, Cương Nghị & Thực Thi',
    keywordsVi: ['Tài bạch', 'Quả đoán', 'Cương nghị', 'Thực tế', 'Kinh doanh'],
    summaryVi:
      'Vũ Khúc là Bắc Đẩu Chính Tài Tinh, đại diện cho hành động thực tế, sự quyết đoán và năng lực tạo dựng tiền bạc. Hợp với người làm tài chính, kinh doanh, quân đội, kỹ thuật thực chiến.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Vũ Khúc là sao tài tinh nhưng mang tính Kim cương nghị. Nam mệnh Vũ Khúc rất giỏi lập nghiệp; nữ mệnh Vũ Khúc nhập Mệnh thì tính cách mạnh mẽ như nam giới, nên kết hôn muộn hoặc chọn chồng biết nhường nhịn."',
    classicQuoteVi:
      '《Toàn Thư》: "Vũ Khúc thuộc Kim, Bắc Đẩu đệ lục tinh, hóa khí vi Tài, vi Tài Bạch chủ."',
  },
  天同: {
    nameCn: '天同',
    nameVi: 'Thiên Đồng',
    elementVi: 'Nhâm Thủy (Phúc Tinh)',
    natureVi: 'Phúc Đức Tinh • Chủ Hưởng Thụ, Ôn Hòa & Giải Ách',
    keywordsVi: ['Phúc hậu', 'Ôn hòa', 'Tri túc', 'Nhân duyên', 'Nghệ thuật'],
    summaryVi:
      'Thiên Đồng là sao Phúc Tinh, tính tình ôn hòa, khiêm nhường, không thích tranh đoạt, có duyên với mọi người và khả năng hóa giải hung sát.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Thiên Đồng là sao tri túc thường lạc (biết đủ là vui). Nam mệnh Thiên Đồng cần có chút sát tinh kích phát mới không rơi vào an phận thủ thường; nữ mệnh Thiên Đồng phúc hậu, hiền hòa."',
    classicQuoteVi:
      '《Toàn Thư》: "Thiên Đồng thuộc Thủy, Nam Đẩu đệ tứ tinh, hóa khí vi Phúc, vi Phúc Đức chủ."',
  },
  廉贞: {
    nameCn: '廉贞',
    nameVi: 'Liêm Trinh',
    elementVi: 'Đinh Hỏa (Tù Tinh / Thứ Đào Hoa)',
    natureVi: 'Chính Tà Lưỡng Phân • Chủ Quan Lộc, Kỷ Luật & Đào Hoa',
    keywordsVi: ['Nguyên tắc', 'Đào hoa thứ', 'Tài nghệ', 'Thanh liêm', 'Góc cạnh'],
    summaryVi:
      'Liêm Trinh vừa là sao Quan Lộc (thanh liêm, kỷ luật), vừa là Thứ Đào Hoa (duyên ngầm, nghệ thuật). Khi đi cùng Thiên Phủ, Thiên Tướng thì cực kỳ đắc lực; khi gặp Sát tinh dễ gặp thị phi pháp lý.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Liêm Trinh gặp Thiên Phủ, Thiên Tướng là người có tài cai quản, hành chính xuất sắc. Nhưng Liêm Trinh tối kỵ đi cùng Tham Lang, Phá Quân, Thất Sát kèm Hóa Kỵ ở cung Phu Thê hoặc Thiên Di, cần đặc biệt cẩn trọng."',
    classicQuoteVi:
      '《Toàn Thư》: "Liêm Trinh thuộc Hỏa, Bắc Đẩu đệ ngũ tinh, hóa khí vi Tù, tại Quan Lộc vi Quan Lộc chủ, tại Thân Mệnh vi Thứ Đào Hoa."',
  },
  天府: {
    nameCn: '天府',
    nameVi: 'Thiên Phủ',
    elementVi: 'Mậu Thổ (Nam Đẩu Đế Tinh)',
    natureVi: 'Lộc Khố Tinh • Chủ Kho Tài Sản, Ổn Trọng & Bao Dung',
    keywordsVi: ['Kho tiền', 'Ổn trọng', 'Khoan hậu', 'Quản trị', 'Bền vững'],
    summaryVi:
      'Thiên Phủ là Nam Đẩu Đế Tinh, cai quản kho tàng (Lộc khố). Người có Thiên Phủ thủ Mệnh điềm đạm, thực tế, giỏi giữ tiền và quản lý tổ chức ổn định lâu dài.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Tử Vi là vua mở cõi, Thiên Phủ là vương giữ kho. Thiên Phủ rất cần gặp Lộc Tồn hoặc Hóa Lộc để kho đầy ắp; nếu gặp Địa Không, Địa Kiếp gọi là Không Khố, Lộ Khố – kho rỗng thì chớ nên đầu tư mạo hiểm."',
    classicQuoteVi:
      '《Toàn Thư》: "Thiên Phủ thuộc Thổ, Nam Đẩu đệ nhất tinh, vi Tài Bạch, Điền Trạch chủ, nãi duyên thọ giải ách chi tinh."',
  },
  太阴: {
    nameCn: '太阴',
    nameVi: 'Thái Âm',
    elementVi: 'Quý Thủy (Phú Tinh)',
    natureVi: 'Nguyệt Tinh • Chủ Điền Trạch, Tài Phú & Nữ Mệnh',
    keywordsVi: ['Tinh tế', 'Điền sản', 'Tích lũy', 'Dịu dàng', 'Nội tâm'],
    summaryVi:
      'Thái Âm tượng trưng cho Mặt Trăng, đại diện cho người mẹ, vợ, con gái, sự tĩnh lặng và tài sản tích lũy (Điền Trạch). Thái Âm sáng từ Dậu đến Sửu (sinh ban đêm) là thượng cách.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Thái Âm miếu vượng thủ Mệnh thì nữ giới dung mạo thanh tú, dịu dàng, vượng phu ích tử; nam giới nho nhã, tinh tế. Lưu ý nam mệnh sợ nhất Thái Âm Hóa Kỵ vì dễ bất hòa giữa mẹ và vợ hoặc hao tài vì phụ nữ."',
    classicQuoteVi:
      '《Toàn Thư》: "Thái Âm thuộc Thủy, nguyệt chi tinh, hóa khí viết Phú, vi Tài Bạch, Điền Trạch chủ."',
  },
  贪狼: {
    nameCn: '贪狼',
    nameVi: 'Tham Lang',
    elementVi: 'Giáp Mộc & Quý Thủy',
    natureVi: 'Chính Đào Hoa Tinh • Chủ Đa Tài, Giao Tiếp & Khát Vọng',
    keywordsVi: ['Đa tài', 'Giao tế', 'Đào hoa', 'Khát vọng', 'Huyền học'],
    summaryVi:
      'Tham Lang là sao của khát vọng, tài năng đa dạng, giỏi ngoại giao ứng biến và có duyên với nghệ thuật, tâm linh, huyền học. Khi gặp Hỏa Tinh, Linh Tinh tạo thành cách Hỏa Tham / Linh Tham bộc phát rực rỡ.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Tham Lang gặp Vũ Khúc gọi là Vũ Tham cách – tiền bần hậu phú, ngoài 30 tuổi mới phát đạt lớn. Tham Lang gặp Hỏa Tinh hoặc Linh Tinh đồng cung là quý cách võ chức hoặc横 phát tài lộc."',
    classicQuoteVi:
      '《Toàn Thư》: "Tham Lang thuộc Thủy, bổn thuộc Mộc, Bắc Đẩu đệ nhất tinh, hóa khí vi Đào Hoa, chủ họa phúc."',
  },
  巨门: {
    nameCn: '巨门',
    nameVi: 'Cự Môn',
    elementVi: 'Quý Thủy (Ám Tinh)',
    natureVi: 'Ngôn Ngữ Tinh • Chủ Khẩu Tài, Nghiên Cứu & Phản Biện',
    keywordsVi: ['Hùng biện', 'Sâu sắc', 'Chuyên môn', 'Thị phi', 'Pháp lý'],
    summaryVi:
      'Cự Môn chủ về ngôn từ, khả năng diễn thuyết, lập luận và đào sâu nghiên cứu. Khi miếu vượng hoặc gặp Thái Dương (Cự Nhật), Hóa Quyền, Hóa Lộc thì cực hợp nghề luật sư, giảng viên, ngoại giao, truyền thông.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Cự Môn có cái miệng sắc bén: nếu Hóa Quyền, Hóa Lộc thì lời nói có trọng lượng, thuyết phục thiên hạ; nếu lạc hãm lại gặp Hóa Kỵ thì dễ vướng thị phi khẩu thiệt. Đặc biệt Cự Môn ở cung Nô Bộc thì không nên hùn hạp làm ăn với bạn bè."',
    classicQuoteVi:
      '《Toàn Thư》: "Cự Môn thuộc Thủy Kim, Bắc Đẩu đệ nhị tinh, hóa khí viết Ám, chủ thị phi."',
  },
  天相: {
    nameCn: '天相',
    nameVi: 'Thiên Tướng',
    elementVi: 'Nhâm Thủy (Ấn Tinh)',
    natureVi: 'Chưởng Ấn Tinh • Chủ Phò Tá, Công Bằng & Trọng Tín',
    keywordsVi: ['Ấn tín', 'Phò tá', 'Chu đáo', 'Đáng tin', 'Điều phối'],
    summaryVi:
      'Thiên Tướng là sao giữ ấn tín của nhà vua, tính cách đĩnh đạc, trọng chữ tín, giỏi điều phối, quản trị nhân sự và hỗ trợ lãnh đạo.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Thiên Tướng là tể tướng cầm ấn, rất giỏi phò tá và làm quản lý cấp cao. Thiên Tướng luôn đi thành bộ Phủ Tướng Triều Viên (Thiên Phủ – Thiên Tướng chiếu hợp), chủ về衣 thực phong túc, công việc ổn định."',
    classicQuoteVi:
      '《Toàn Thư》: "Thiên Tướng thuộc Thủy, Nam Đẩu đệ ngũ tinh, hóa khí viết Ấn, vi Quan Lộc chủ."',
  },
  天梁: {
    nameCn: '天梁',
    nameVi: 'Thiên Lương',
    elementVi: 'Mậu Thổ (Ấm Tinh)',
    natureVi: 'Thọ Tinh & Thanh Quý Tinh • Chủ Che Chở, Y Dược & Bề Trên',
    keywordsVi: ['Che chở', 'Thọ tinh', 'Y dược', 'Thanh cao', 'Giáo dục'],
    summaryVi:
      'Thiên Lương là sao Ấm Tinh (phúc ấm che chở) và Thọ Tinh, đại diện cho bậc trưởng thượng, y bác sĩ, nhà giáo, giám찰. Có khả năng phùng hung hóa cát, vượt qua nghịch cảnh.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Thiên Lương là sao che chở, thanh quý nhưng không phải tài tinh, nên hợp làm y dược, giáo dục, pháp luật, thanh tra hơn là buôn bán đầu cơ. Đi với Thái Dương, Văn Xương, Lộc Tồn thành cách Dương Lương Xương Lộc – thi cử đỗ đạt đầu bảng."',
    classicQuoteVi:
      '《Toàn Thư》: "Thiên Lương thuộc Thổ, Nam Đẩu đệ nhị tinh, hóa khí viết Ấm, vi Phụ Mẫu chủ, chủ thọ tinh."',
  },
  七杀: {
    nameCn: '七杀',
    nameVi: 'Thất Sát',
    elementVi: 'Canh Kim & Đinh Hỏa',
    natureVi: 'Tướng Tinh • Chủ Uy Dũng, Quyết Đoán & Độc Lập Mở Đường',
    keywordsVi: ['Tướng soái', 'Quyết liệt', 'Mở đường', 'Độc lập', 'Bản lĩnh'],
    summaryVi:
      'Thất Sát là vị tướng ngoài biên ải, tính cách cương liệt, dám nghĩ dám làm, càng gặp áp lực nghịch cảnh càng bộc lộ bản lĩnh phi thường.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Thất Sát nhập Mệnh miếu vượng (Thất Sát Triều Đẩu / Ngưỡng Đẩu) là bậc đại tướng cầm quân, uy quyền hiển hách. Nhưng nữ mệnh Thất Sát thủ Mệnh hoặc Phu Thê thì tính quá刚 cường, trong hôn nhân cần học sự mềm mỏng."',
    classicQuoteVi:
      '《Toàn Thư》: "Thất Sát thuộc Hỏa Kim, Nam Đẩu đệ lục tinh, nãi tướng tinh, ngộ Tử Vi tắc hóa uy vi quyền."',
  },
  破军: {
    nameCn: '破军',
    nameVi: 'Phá Quân',
    elementVi: 'Quý Thủy (Hao Tinh)',
    natureVi: 'Tiên Phong Tinh • Chủ Đột Phá, Cải Cách & Phá Cũ Lập Mới',
    keywordsVi: ['Tiên phong', 'Đột phá', 'Sáng tạo', 'Biến động', 'Không ngại khó'],
    summaryVi:
      'Phá Quân là đội quân tiên phong phá vỡ khuôn mẫu cũ để kiến tạo trật tự mới. Cuộc đời người có Phá Quân thủ Mệnh nhiều bước ngoặt lớn, hợp khởi nghiệp, đổi mới sáng tạo.',
    niHaixiaQuoteVi:
      '《Thiên Kỷ》: "Phá Quân là phá cũ lập mới (tiên phá hậu thành). Phá Quân gặp Tử Vi hoặc Hóa Lộc, Hóa Quyền thì sau biến động lớn sẽ dựng nên cơ nghiệp phi thường."',
    classicQuoteVi:
      '《Toàn Thư》: "Phá Quân thuộc Thủy, Bắc Đẩu đệ thất tinh, hóa khí viết Hao, vi Phu Thê, Tử Nữ, Nô Bộc chủ."',
  },
};

// ─── 6. BẢN DỊCH 40+ CÁCH CỤC CỔ ĐIỂN (PATTERNS) ──────────────────────────
export interface PatternTranslationVi {
  nameVi: string;
  descriptionVi: string;
}

export const PATTERN_TRANSLATIONS_VI: Record<string, PatternTranslationVi> = {
  君臣庆会: {
    nameVi: 'Quân Thần Khánh Hội',
    descriptionVi:
      'Tử Vi thủ Mệnh hội họp đầy đủ Tả Phù, Hữu Bật, Văn Xương, Văn Khúc, Thiên Khôi, Thiên Việt — vua tôi đồng lòng, tài lãnh đạo xuất chúng, danh vọng và địa vị cao quý.',
  },
  紫府同宫: {
    nameVi: 'Tử Phủ Đồng Cung',
    descriptionVi:
      'Bắc Đẩu Đế Tinh (Tử Vi) và Nam Đẩu Đế Tinh (Thiên Phủ) đồng cung tại Dần hoặc Thân — phúc lộc song toàn, suốt đời衣 thực sung túc, có uy tín và vị thế vững chắc.',
  },
  府相朝垣: {
    nameVi: 'Phủ Tướng Triều Viên',
    descriptionVi:
      'Thiên Phủ và Thiên Tướng hội chiếu Tam Phương Tứ Chính của cung Mệnh — công việc ổn định, tài lộc dồi dào, đắc nhân tâm và có quý nhân phò trợ lâu dài.',
  },
  阳梁昌禄: {
    nameVi: 'Dương Lương Xương Lộc',
    descriptionVi:
      'Thái Dương, Thiên Lương hội cùng Văn Xương và Lộc Tồn (hoặc Hóa Lộc) — đại cát cách về học thuật, khoa bảng, thi cử đỗ đạt cao và danh tiếng thanh cao.',
  },
  武贪格: {
    nameVi: 'Vũ Tham Đồng Hành (Tiền Bần Hậu Phú)',
    descriptionVi:
      'Vũ Khúc và Tham Lang đồng cung tại Sửu hoặc Mùi — tuổi trẻ rèn luyện vất vả, từ sau 30 tuổi vận thế bùng nổ mạnh mẽ, phát đạt lớn về thương mại và tài sản.',
  },
  杀破狼: {
    nameVi: 'Sát Phá Tham (Trúc La Tam Hạn)',
    descriptionVi:
      'Thất Sát, Phá Quân, Tham Lang hội hợp trong Tam Phương (Mệnh – Tài – Quan) — cuộc đời giàu tính hành động, dám đột phá mở đường và lập nghiệp lớn trong biến động.',
  },
  机月同梁: {
    nameVi: 'Cơ Nguyệt Đồng Lương (Tác Lại Nhân)',
    descriptionVi:
      'Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương hội đủ trong Tam Phương Tứ Chính — mưu lược sắc sảo, làm việc có hệ thống, cực hợp quản lý, chuyên gia, hành chính hoặc tập đoàn lớn.',
  },
  机月同梁三星会: {
    nameVi: 'Cơ Nguyệt Đồng Lương (Hội 3 Sao)',
    descriptionVi:
      'Ba trong bốn sao Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương hội chiếu cung Mệnh — tư duy điềm tĩnh, giỏi kế hoạch, hợp công việc chuyên môn và tham mưu.',
  },
  廉贞天相格: {
    nameVi: 'Liêm Tướng Đồng Cung (Hình Tù Giáp Ấn)',
    descriptionVi:
      'Liêm Trinh và Thiên Tướng đồng cung tại Tý hoặc Ngọ — vừa có nguyên tắc kỷ luật (Liêm Trinh) vừa có ấn tín bao dung (Thiên Tướng), giỏi điều hành và giữ trọng trách.',
  },
  武曲七杀: {
    nameVi: 'Vũ Sát Đồng Cung',
    descriptionVi:
      'Vũ Khúc và Thất Sát đồng cung tại Mão hoặc Dậu — quyết đoán, dũng mãnh, giỏi thực thi những dự án khó, cần lưu ý giữ an toàn và tránh nóng vội.',
  },
  天同天梁格: {
    nameVi: 'Đồng Lương Đồng Cung (Ấm Phúc Tụ Hội)',
    descriptionVi:
      'Thiên Đồng (Phúc tinh) và Thiên Lương (Ấm tinh) đồng cung tại Dần hoặc Thân — suốt đời nhiều phúc ấm, phùng hung hóa cát, có quý nhân che chở.',
  },
  日月同宫: {
    nameVi: 'Nhật Nguyệt Đồng Cung',
    descriptionVi:
      'Thái Dương và Thái Âm đồng cung tại Sửu hoặc Mùi — tính cách dung hòa giữa cương và nhu, linh hoạt thích ứng cao, hậu vận thanh nhàn.',
  },
  日月夹命: {
    nameVi: 'Nhật Nguyệt Giáp Mệnh',
    descriptionVi:
      'Thái Dương và Thái Âm ở hai cung liền kề kẹp bảo vệ cung Mệnh — quý cách hiếm gặp, được cả bề trên lẫn gia đình hậu thuẫn, tài quan song mỹ.',
  },
  巨日同宫: {
    nameVi: 'Cự Nhật Đồng Cung',
    descriptionVi:
      'Cự Môn và Thái Dương đồng cung tại Dần hoặc Thân — ánh sáng Thái Dương xua tan cái ám của Cự Môn, chủ tài hùng biện, ngoại giao và danh tiếng vượt trội.',
  },
  石中隐玉: {
    nameVi: 'Thạch Trung Ẩn Ngọc',
    descriptionVi:
      'Cự Môn tọa Mệnh tại Tý hoặc Ngọ gặp Hóa Lộc, Hóa Quyền, Hóa Khoa — như ngọc quý ẩn trong đá, càng trải qua mài giũa càng tỏa sáng rực rỡ.',
  },
  明珠出海: {
    nameVi: 'Minh Châu Xuất Hải',
    descriptionVi:
      'Mệnh tại Mùi, Thái Dương sáng ở Mão và Thái Âm sáng ở Hợi hội chiếu — như ngọc trai sáng giữa biển khơi, tài hoa lỗi lạc, công danh rộng mở.',
  },
  紫微入命: {
    nameVi: 'Tử Vi Độc Tọa Nhập Mệnh',
    descriptionVi:
      'Đế tinh Tử Vi tọa thủ cung Mệnh ở thế Miếu/Vượng — khí chất tôn quý, tự chủ cao, có năng lực dẫn dắt tập thể.',
  },
  辅弼夹命: {
    nameVi: 'Tả Phù Hữu Bật Giáp Mệnh',
    descriptionVi:
      'Tả Phù và Hữu Bật ở hai cung liền kề kẹp cung Mệnh — đi đâu cũng có người giúp sức, nhân duyên tốt đẹp, sự nghiệp thuận lợi.',
  },
  昌曲夹命: {
    nameVi: 'Văn Xương Văn Khúc Giáp Mệnh',
    descriptionVi:
      'Văn Xương và Văn Khúc kẹp cung Mệnh — thông minh hiếu học, có tài văn chương nghệ thuật và học vấn sâu rộng.',
  },
  魁钺夹命: {
    nameVi: 'Thiên Khôi Thiên Việt Giáp Mệnh',
    descriptionVi:
      'Thiên Khôi và Thiên Việt kẹp cung Mệnh — quý nhân luôn xuất hiện đúng lúc khó khăn, dễ được cấp trên và bậc trưởng bối nâng đỡ.',
  },
  双禄朝垣: {
    nameVi: 'Song Lộc Triều Viên',
    descriptionVi:
      'Lộc Tồn và Hóa Lộc cùng hội chiếu cung Mệnh trong Tam Phương Tứ Chính — nguồn tài lộc dồi dào, kinh doanh đầu tư hanh thông.',
  },
  三奇加会: {
    nameVi: 'Tam Kỳ Gia Hội (Khoa Quyền Lộc Hội)',
    descriptionVi:
      'Hóa Lộc, Hóa Quyền, Hóa Khoa cùng hội họp tại Tam Phương Tứ Chính của cung Mệnh — đại quý cách, tài lộc – quyền uy – danh tiếng cùng hội tụ.',
  },
  羊陀夹忌: {
    nameVi: 'Dương Đà Giáp Kỵ',
    descriptionVi:
      'Lộc Tồn gặp Hóa Kỵ bị Kình Dương và Đà La kẹp hai bên — cần đề phòng tiểu nhân đố kỵ, hao tài hoặc trở ngại bất ngờ, nên hành sự thận trọng.',
  },
  火铃夹命: {
    nameVi: 'Hỏa Linh Giáp Mệnh',
    descriptionVi:
      'Hỏa Tinh và Linh Tinh kẹp cung Mệnh — cuộc sống nhiều nhịp độ gấp gáp, cần rèn luyện sự bình tĩnh và kiên nhẫn trước các quyết định lớn.',
  },
  空劫夹命: {
    nameVi: 'Không Kiếp Giáp Mệnh',
    descriptionVi:
      'Địa Không và Địa Kiếp kẹp cung Mệnh — tư duy độc đáo khác người nhưng dễ gặp biến động tài chính, nên ưu tiên tích lũy bền vững và học thuật.',
  },
  廉杀羊: {
    nameVi: 'Liêm Sát Kình Dương (Lộ Thượng Mai Thi)',
    descriptionVi:
      'Liêm Trinh, Thất Sát đi cùng Kình Dương — cần đặc biệt chú ý an toàn đi lại, sức khỏe và giữ hòa khí trong các cuộc tranh chấp.',
  },
  巨火羊: {
    nameVi: 'Cự Hỏa Kình Dương',
    descriptionVi:
      'Cự Môn hội cùng Hỏa Tinh và Kình Dương — dễ xảy ra tranh cãi gay gắt hoặc áp lực tinh thần lớn, cần giữ lời ăn tiếng nói ôn hòa.',
  },
  铃昌陀武: {
    nameVi: 'Linh Xương Đà Vũ',
    descriptionVi:
      'Linh Tinh, Văn Xương, Đà La, Vũ Khúc hội tụ — cần cẩn trọng trong hợp đồng tài chính, tránh đầu cơ mạo hiểm khi vận hạn bất lợi.',
  },
  马头带箭: {
    nameVi: 'Mã Đầu Đới Tiễn',
    descriptionVi:
      'Cung Mệnh tại Ngọ có Kình Dương đồng độ — thuở thiếu thời nhiều thử thách rèn giũa, càng đi xa lập nghiệp hoặc làm việc kỹ thuật/quân sự càng thành công.',
  },
  禄存守命: {
    nameVi: 'Lộc Tồn Thủ Mệnh',
    descriptionVi:
      'Lộc Tồn tọa thủ cung Mệnh hoặc Thân — tính cách cẩn trọng, biết tích lũy tài sản bền vững, suốt đời không lo thiếu thốn.',
  },
  天马入命: {
    nameVi: 'Thiên Mã Nhập Mệnh',
    descriptionVi:
      'Thiên Mã tọa thủ cung Mệnh — năng động, nhạy bén với cơ hội phương xa, càng di chuyển hoặc mở rộng thị trường càng phát triển.',
  },
  化禄入财: {
    nameVi: 'Hóa Lộc Nhập Tài Bạch',
    descriptionVi:
      'Sao Hóa Lộc rơi vào cung Tài Bạch — dòng tiền thuận lợi, có duyên buôn bán kinh doanh và thu hút nguồn lực tài chính.',
  },
  化权入官: {
    nameVi: 'Hóa Quyền Nhập Quan Lộc',
    descriptionVi:
      'Sao Hóa Quyền rơi vào cung Quan Lộc — năng lực thực thi mạnh mẽ, có uy tín chuyên môn và dễ nắm giữ vị trí quản lý trong sự nghiệp.',
  },
  化科入命身: {
    nameVi: 'Hóa Khoa Nhập Mệnh Thân',
    descriptionVi:
      'Sao Hóa Khoa tọa thủ cung Mệnh hoặc Thân — thông tuệ, có danh tiếng tốt, học hành thi cử thuận lợi và được quý nhân giải nguy.',
  },
  昌曲同会: {
    nameVi: 'Xương Khúc Đồng Hội',
    descriptionVi:
      'Văn Xương và Văn Khúc cùng hội chiếu cung Mệnh — tư chất thông minh, có khiếu ăn nói, viết lách, học thuật và nghệ thuật.',
  },
  辅弼同会: {
    nameVi: 'Tả Hữu Đồng Hội',
    descriptionVi:
      'Tả Phù và Hữu Bật cùng hội chiếu cung Mệnh — có đội ngũ cộng sự đắc lực, làm việc lớn luôn có người đồng hành hỗ trợ.',
  },
  魁钺同会: {
    nameVi: 'Khôi Việt Đồng Hội (Tọa Quý Hướng Quý)',
    descriptionVi:
      'Thiên Khôi và Thiên Việt cùng hội chiếu cung Mệnh — mệnh có quý nhân âm dương phò trợ, gặp việc khó đều có cơ hội chuyển mình.',
  },
  科权双会: {
    nameVi: 'Khoa Quyền Song Hội',
    descriptionVi:
      'Hóa Khoa và Hóa Quyền cùng hội chiếu Tam Phương Tứ Chính — vừa có danh tiếng uy tín (Khoa) vừa có thực quyền chuyên môn (Quyền).',
  },
};

// ─── 7. CÁC HÀM DỊCH THUẬT TIỆN ÍCH ────────────────────────────────────────
export function translateStem(stem: string): string {
  return STEMS_VI[stem] || stem;
}

export function translateBranch(branch: string): string {
  return BRANCHES_VI[branch] || branch;
}

export function translateGanZhi(gz: string): string {
  if (!gz) return '';
  if (gz.length === 2) {
    const s = STEMS_VI[gz[0]] || gz[0];
    const b = BRANCHES_VI[gz[1]] || gz[1];
    return `${s} ${b}`;
  }
  return gz
    .split('')
    .map((ch) => STEMS_VI[ch] || BRANCHES_VI[ch] || ch)
    .join(' ');
}

export function translatePalaceName(nameCn: string, bilingual = false): string {
  const vi = PALACE_NAME_VI[nameCn] || nameCn.replace(/宫$/, '');
  return bilingual ? `${vi} (${nameCn})` : vi;
}

export function translateStarName(nameCn: string, bilingual = false): string {
  const vi = STAR_NAME_VI[nameCn] || nameCn;
  return bilingual && vi !== nameCn ? `${vi} (${nameCn})` : vi;
}

export function translateBrightness(raw?: string): string {
  if (!raw) return '';
  return BRIGHTNESS_VI[raw] || raw;
}

export function translateSiHua(sihua?: string): string {
  if (!sihua) return '';
  return SIHUA_VI[sihua] || sihua;
}

export function translateWuxingJu(juCn: string): string {
  return WUXING_JU_VI[juCn] || juCn;
}

export function translateYinYangGender(val?: string): string {
  if (!val) return '';
  return YIN_YANG_GENDER_VI[val] || val;
}

/**
 * Dịch tự động một chuỗi câu tiếng Trung ngắn (tên Cách Cục động, điều kiện, cổ tịch) sang tiếng Việt
 */
export function translateChineseAstrologyText(text: string): string {
  if (!text) return '';
  let out = text;

  // Dynamic patterns: e.g. "紫微化禄入命", "太阳化忌入迁"
  const luMatch = out.match(/^(.+)化禄入命$/);
  if (luMatch) {
    return `${translateStarName(luMatch[1])} Hóa Lộc Nhập Mệnh`;
  }
  const jiMatch = out.match(/^(.+)化忌入(命|迁)$/);
  if (jiMatch) {
    const target = jiMatch[2] === '命' ? 'Mệnh' : 'Thiên Di';
    return `${translateStarName(jiMatch[1])} Hóa Kỵ Nhập ${target}`;
  }

  // Replace multi-char terms first
  const phraseReplacements: [string, string][] = [
    ['《紫微斗数全书》', '《Tử Vi Đẩu Số Toàn Thư》'],
    ['《紫微斗数全集》', '《Tử Vi Đẩu Số Toàn Tập》'],
    ['《骨髓赋》', '《Cốt Tủy Phú》'],
    ['倪师《天纪》', 'Nghê Hải Hạ《Thiên Kỷ》'],
    ['三方四正', 'Tam phương tứ chính'],
    ['三方会照', 'Tam phương hội chiếu'],
    ['命宫', 'Cung Mệnh'],
    ['身宫', 'Cung Thân'],
    ['夫妻宫', 'Cung Phu Thê'],
    ['财帛宫', 'Cung Tài Bạch'],
    ['官禄宫', 'Cung Quan Lộc'],
    ['迁移宫', 'Cung Thiên Di'],
    ['福德宫', 'Cung Phúc Đức'],
    ['田宅宫', 'Cung Điền Trạch'],
    ['疾厄宫', 'Cung Tật Ách'],
    ['子女宫', 'Cung Tử Nữ'],
    ['兄弟宫', 'Cung Huynh Đệ'],
    ['父母宫', 'Cung Phụ Mẫu'],
    ['交友宫', 'Cung Nô Bộc'],
    ['仆役宫', 'Cung Nô Bộc'],
    ['同宫', ' đồng cung '],
    ['守命', ' thủ Mệnh '],
    ['入命', ' nhập Mệnh '],
    ['庙旺', ' Miếu/Vượng '],
    ['落陷', ' lạc Hãm '],
    ['化禄', ' Hóa Lộc '],
    ['化权', ' Hóa Quyền '],
    ['化科', ' Hóa Khoa '],
    ['化忌', ' Hóa Kỵ '],
    ['四煞', ' Tứ Sát '],
    ['空劫', ' Không Kiếp '],
    ['会照', ' hội chiếu '],
  ];

  for (const [cn, vi] of phraseReplacements) {
    out = out.split(cn).join(vi);
  }

  for (const [cn, vi] of Object.entries(STAR_NAME_VI)) {
    if (out.includes(cn)) {
      out = out.split(cn).join(vi);
    }
  }

  for (const [cn, vi] of Object.entries(PALACE_NAME_VI)) {
    if (out.includes(cn)) {
      out = out.split(cn).join(vi);
    }
  }

  return out.replace(/\s+/g, ' ').trim();
}

export interface LocalizedPattern {
  originalName: string;
  nameVi: string;
  level: Pattern['level'];
  levelLabelVi: string;
  descriptionVi: string;
  palacesVi: string[];
  sourceVi?: string;
  conditionsVi?: {
    required: string[];
    bonus?: string[];
    breaking?: string[];
  };
}

export function localizePattern(pattern: Pattern): LocalizedPattern {
  const mapped = PATTERN_TRANSLATIONS_VI[pattern.name];
  const levelMap: Record<Pattern['level'], string> = {
    excellent: 'Thượng Cách (Đại Cát)',
    good: 'Cát Cách (Tốt)',
    neutral: 'Trung Tính (Cần Rèn Luyện)',
    caution: 'Cách Cần Lưu Ý (Cẩn Trọng)',
  };

  let descriptionVi = mapped?.descriptionVi || '';
  if (!descriptionVi) {
    if (pattern.name.endsWith('化禄入命')) {
      const star = translateStarName(pattern.name.replace('化禄入命', ''));
      descriptionVi = `Sao ${star} mang Hóa Lộc tọa thủ ngay cung Mệnh — nhân duyên tốt, tài lộc tự tìm đến và tính cách lạc quan cởi mở.`;
    } else if (pattern.name.includes('化忌入')) {
      descriptionVi = `${translateChineseAstrologyText(pattern.name)} — cần chú ý rèn luyện nội tâm, tránh quyết định nóng vội và giữ gìn uy tín cá nhân.`;
    } else {
      descriptionVi = translateChineseAstrologyText(pattern.description);
    }
  }

  return {
    originalName: pattern.name,
    nameVi: mapped?.nameVi || translateChineseAstrologyText(pattern.name),
    level: pattern.level,
    levelLabelVi: levelMap[pattern.level] || 'Cách Cục',
    descriptionVi,
    palacesVi: pattern.palaces.map((p) => translatePalaceName(p)),
    sourceVi: pattern.source ? translateChineseAstrologyText(pattern.source) : undefined,
    conditionsVi: pattern.conditions
      ? {
          required: pattern.conditions.required.map(translateChineseAstrologyText),
          bonus: pattern.conditions.bonus?.map(translateChineseAstrologyText),
          breaking: pattern.conditions.breaking?.map(translateChineseAstrologyText),
        }
      : undefined,
  };
}

function formatStarVi(star: Star): string {
  const name = translateStarName(star.name);
  const bright = star.brightnessRaw ? ` (${translateBrightness(star.brightnessRaw)})` : '';
  const sihua = star.siHua ? ` [Hóa ${translateSiHua(star.siHua)}]` : '';
  return `${name}${bright}${sihua}`;
}

export function formatPalaceStarsSummaryVi(palace: Palace): {
  majorText: string;
  luckyText: string;
  shaText: string;
  minorText: string;
} {
  const majors = palace.stars.filter((s) => s.type === 'major');
  const luckies = palace.stars.filter((s) => s.type === 'lucky');
  const shas = palace.stars.filter((s) => s.type === 'sha');
  const minors = palace.stars.filter((s) => s.type === 'minor');

  const majorText =
    majors.length > 0
      ? majors.map(formatStarVi).join(', ')
      : palace.borrowedStars && palace.borrowedStars.length > 0
      ? `Vô Chính Diệu (Mượn đối cung ${translatePalaceName(palace.borrowedFromName || '')}: ${palace.borrowedStars
          .map((s) => translateStarName(s))
          .join(', ')})`
      : 'Vô Chính Diệu';

  return {
    majorText,
    luckyText: luckies.map(formatStarVi).join(', '),
    shaText: shas.map(formatStarVi).join(', '),
    minorText: minors.map(formatStarVi).join(', '),
  };
}

/**
 * Tạo bản tóm tắt toàn diện lá số Tử Vi bằng tiếng Việt để gửi lên Backend AI (/api/ziwei/interpret & /api/ziwei/heming)
 */
export function buildVietnameseChartSummaryText(
  chart: ZiweiChart,
  patterns: Pattern[] = []
): string {
  const { birthInfo, lunarInfo } = chart;
  const stemCn = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][lunarInfo.yearStem] || '';
  const branchCn = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][lunarInfo.yearBranch] || '';
  const yearGanZhiVi = `${translateStem(stemCn)} ${translateBranch(branchCn)}`;
  const hourVi = HOUR_BRANCH_LABELS_VI[birthInfo.hour]?.nameVi || `Giờ chi ${birthInfo.hour}`;
  const fourPillarsVi = lunarInfo.fourPillars
    ? lunarInfo.fourPillars.map(translateGanZhi).join(' • ')
    : 'Chưa xác định';

  const currentDx =
    chart.currentDaXianIndex >= 0 && chart.daXians[chart.currentDaXianIndex]
      ? chart.daXians[chart.currentDaXianIndex]
      : null;

  const palaceLines = chart.palaces.map((p) => {
    const pStem = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][p.stem] || '';
    const pBranch = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][p.branch] || '';
    const ganZhi = `${translateStem(pStem)} ${translateBranch(pBranch)}`;
    const { majorText, luckyText, shaText } = formatPalaceStarsSummaryVi(p);
    const flags = [
      p.isMingGong ? '★Cung Mệnh' : '',
      p.isShenGong ? '★Cung Thân' : '',
      p.isCurrentDaXian ? '★Đại Hạn Hiện Tại' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const dxRange = p.daXianAge ? `Đại hạn: ${p.daXianAge[0]}–${p.daXianAge[1]} tuổi` : '';
    return `- Cung ${translatePalaceName(p.name)} (Tại ${ganZhi}) ${flags} [${dxRange}]: Chính tinh: ${majorText}${
      luckyText ? ` | Cát tinh: ${luckyText}` : ''
    }${shaText ? ` | Sát tinh: ${shaText}` : ''}`;
  });

  const localizedPatterns = patterns.map(localizePattern);
  const patternLines =
    localizedPatterns.length > 0
      ? localizedPatterns.map(
          (pt) => `- ${pt.nameVi} (${pt.originalName}) [${pt.levelLabelVi}]: ${pt.descriptionVi}`
        )
      : ['- Lá số bình hòa, xét trọng tâm theo Chính tinh và Tam Phương Tứ Chính.'];

  return [
    `=== THÔNG TIN ĐƯƠNG SỐ ===`,
    `- Họ tên: ${birthInfo.name || 'Đương số'}`,
    `- Giới tính: ${birthInfo.gender === 'male' ? 'Nam' : 'Nữ'} (${translateYinYangGender(chart.yinYangGender)})`,
    `- Ngày sinh Dương lịch: ${birthInfo.day}/${birthInfo.month}/${birthInfo.year} (${hourVi})`,
    `- Ngày sinh Âm lịch: Ngày ${lunarInfo.lunarDay} tháng ${Math.abs(lunarInfo.lunarMonth)}${
      lunarInfo.isLeapMonth ? ' (Nhuận)' : ''
    } năm ${yearGanZhiVi} (${lunarInfo.lunarYear})`,
    `- Nơi sinh: ${birthInfo.city || birthInfo.province || 'Việt Nam'} ${
      birthInfo.longitude ? `(Kinh độ ${birthInfo.longitude}°E)` : ''
    }`,
    `- Tứ Trụ Bát Tự: ${fourPillarsVi}`,
    `- Ngũ Hành Cục: ${translateWuxingJu(chart.wuxingJuName)}`,
    `- Mệnh Chủ: ${translateStarName(chart.mingZhu || '')} | Thân Chủ: ${translateStarName(chart.shenZhu || '')}`,
    `- Tuổi âm lịch hiện tại: ${chart.currentAge} tuổi`,
    currentDx
      ? `- Đại hạn hiện tại: ${currentDx.startAge}–${currentDx.endAge} tuổi đi vào cung ${translatePalaceName(
          currentDx.palaceName
        )} (${BRANCHES_VI[['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][currentDx.palaceBranch]]})`
      : '',
    ``,
    `=== MƯỜI HAI CUNG TRÊN LÁ SỐ ===`,
    ...palaceLines,
    ``,
    `=== CÁC CÁCH CỤC NHẬN DIỆN ĐƯỢC ===`,
    ...patternLines,
  ]
    .filter(Boolean)
    .join('\n');
}


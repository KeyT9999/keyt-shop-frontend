export interface ClassicKnowledgeSection {
  id: string;
  category: 'Thiên Kỷ Nghê Hải Hạ' | 'Tử Vi Đẩu Số Toàn Thư' | 'Cốt Tủy Phú' | 'Khẩu Quyết Hợp Hôn';
  titleVi: string;
  titleCn: string;
  summaryVi: string;
  quotes: {
    originalCn: string;
    translationVi: string;
    applicationVi: string;
    sourceRef: string;
  }[];
}

export const CLASSICS_KNOWLEDGE_VI: ClassicKnowledgeSection[] = [
  {
    id: 'tianji-core',
    category: 'Thiên Kỷ Nghê Hải Hạ',
    titleVi: 'Nguyên Lý Cốt Lõi: Mệnh Cung Vi Bản, Tam Phương Vi Dụng',
    titleCn: '倪海厦《天纪》核心法则：命宫为本，三方为用',
    summaryVi:
      'Phương pháp luận đoán thực chiến của thầy Nghê Hải Hạ (1954–2012): Đại đạo chí giản, không sa đà vào phi tinh phức tạp mà nhìn thẳng vào thực lực cung Mệnh và sự tương tác của Tam Phương Tứ Chính (Mệnh – Tài – Quan – Di).',
    quotes: [
      {
        originalCn: '算命就是一个讨论果的哲学；人事努力加地理调整大于先天命运（三分之二大于三分之一）。',
        translationVi:
          'Mệnh lý là triết học bàn về chữ Quả để biết trước mà sửa Nhân. Nỗ lực nhân sự (1/3) cộng với điều chỉnh phong thủy địa lý (1/3) lớn hơn mệnh số tiên thiên (1/3) — tức 2/3 thắng 1/3.',
        applicationVi:
          'Khi thấy đại hạn hoặc lưu niên có Hóa Kỵ hay Sát tinh, không phải để bi quan sợ hãi mà để chủ động phòng ngừa, giữ tâm sáng và điều chỉnh hành động.',
        sourceRef: 'Nghê Hải Hạ《Thiên Kỷ》• Tập 1 (Khái luận Thiên Cơ Đạo)',
      },
      {
        originalCn: '看婚姻，光看夫妻宫，大错特错，一定要同时看福德宫。',
        translationVi:
          'Xem hôn nhân mà chỉ nhìn mỗi cung Phu Thê là sai lầm lớn; bắt buộc phải xem đồng thời cả cung Phúc Đức.',
        applicationVi:
          'Cung Phu Thê là hình mẫu người phối ngẫu và hoàn cảnh hôn nhân, còn cung Phúc Đức quyết định nội tâm có an vui, bao dung và giữ được hạnh phúc lâu dài hay không.',
        sourceRef: 'Nghê Hải Hạ《Thiên Kỷ》• Bài giảng Luận Hôn Nhân & Hợp Bàn',
      },
      {
        originalCn: '命宫无主星，借对宫迁移宫之星曜来看，但须知借来之星力道减半，且早年奔波、宜出外发展。',
        translationVi:
          'Mệnh Vô Chính Diệu thì mượn chính tinh của đối cung (Thiên Di) để luận, nhưng lực của sao mượn giảm một nửa; đương số hợp đi xa lập nghiệp và trưởng thành qua va chạm thực tế.',
        applicationVi:
          'Các cung Vô Chính Diệu (Mệnh, Tài, Quan, Phu Thê) đều tự động đối chiếu chính tinh của cung xung chiếu trong hệ thống KeyT Tử Vi.',
        sourceRef: 'Nghê Hải Hạ《Thiên Kỷ》• Quy tắc Mượn Sao Đối Cung',
      },
      {
        originalCn: '巨门在朋友宫（交友/仆役宫），代表跟朋友合伙会朋友变仇人，宜独立经营或契约分明。',
        translationVi:
          'Cự Môn đóng ở cung Nô Bộc (Giao Hữu) báo hiệu nếu hùn hạp làm ăn chung với bạn bè rất dễ xảy ra bất đồng khẩu thiệt khiến bạn thành thù.',
        applicationVi:
          'Nếu cung Nô Bộc hoặc Huynh Đệ có Cự Môn gặp Kỵ/Sát, nên làm chuyên môn độc lập hoặc minh bạch hóa toàn bộ cổ phần, hợp đồng bằng văn bản pháp lý.',
        sourceRef: 'Nghê Hải Hạ《Thiên Kỷ》• Luận Hợp Tác Kinh Doanh',
      },
    ],
  },
  {
    id: 'quanshu-stars',
    category: 'Tử Vi Đẩu Số Toàn Thư',
    titleVi: 'Tinh Hoa Chư Tinh Vấn Đáp Luận (Tử Vi Đẩu Số Toàn Thư)',
    titleCn: '《紫微斗数全书·诸星问答论》精要',
    summaryVi:
      'Trích lục nguyên典 Minh đại do La Hồng Tiên biên soạn về bản chất của Bắc Đẩu – Nam Đẩu chính tinh và quy luật Miếu Vượng Đắc Hãm.',
    quotes: [
      {
        originalCn: '紫微乃中天之尊星，为帝座，主掌造化之枢机，人生之主宰。喜辅弼为之相佐，天相昌曲为之从侍。',
        translationVi:
          'Tử Vi là ngôi sao tôn quý bậc nhất giữa bầu trời (Trung Thiên Đế Tọa), nắm giữ trục xoay của tạo hóa. Rất ưa Tả Phù, Hữu Bật làm tể tướng phò tá, Thiên Tướng, Văn Xương, Văn Khúc làm thị tùng.',
        applicationVi:
          'Đánh giá Tử Vi trên lá số cần kiểm tra ngay xem Tam Phương Tứ Chính có hội được Lục Cát (Phù, Bật, Xương, Khúc, Khôi, Việt) hay không.',
        sourceRef: '《Tử Vi Đẩu Số Toàn Thư》• Quyển 1 – Chư Tinh Vấn Đáp',
      },
      {
        originalCn: '天府属土，南斗第一星也，为财帛、田宅主，乃延寿解厄之星。在命身主为人厚重，衣食丰足。',
        translationVi:
          'Thiên Phủ thuộc Thổ, đứng đầu chòm Nam Đẩu, làm chủ Tài Bạch và Điền Trạch, là sao tăng tuổi thọ và hóa giải tai ương. Nhập Mệnh Thân chủ người điềm đạm hậu phác, suốt đời cơm áo sung túc.',
        applicationVi:
          'Thiên Phủ ưa nhất gặp Lộc Tồn hoặc Hóa Lộc (Đắc Lộc), kỵ nhất gặp Địa Không, Địa Kiếp (Không Khố / Lộ Khố).',
        sourceRef: '《Tử Vi Đẩu Số Toàn Thư》• Quyển 1 – Thiên Phủ Luận',
      },
      {
        originalCn: '太阴属水，月之精也，化气曰富，为财帛、田宅主。以酉戌亥子丑为得垣，以卯辰巳午未为陷地。',
        translationVi:
          'Thái Âm thuộc Thủy, tinh hoa của Mặt Trăng, hóa khí là Phú (giàu có), làm chủ Tài Bạch và Điền Trạch. Đóng ở Dậu, Tuất, Hợi, Tý, Sửu là đắc địa sáng sủa; đóng ở Mão, Thìn, Tỵ, Ngọ, Mùi là hãm địa.',
        applicationVi:
          'Người sinh ban đêm mà có Thái Âm tọa thủ từ Dậu đến Sửu là Nhật Nguyệt đắc cách, phúc lộc và điền sản rất vượng.',
        sourceRef: '《Tử Vi Đẩu Số Toàn Thư》• Quyển 1 – Thái Âm Luận',
      },
    ],
  },
  {
    id: 'gusuifu-patterns',
    category: 'Cốt Tủy Phú',
    titleVi: 'Thái Vi Phú & Cốt Tủy Phú — Khẩu Quyết Cách Cục',
    titleCn: '《太微赋》与《骨髓赋》经典格言',
    summaryVi:
      'Những câu phú kinh điển của Tổ sư Trần Đoàn (Hi Di) đúc kết các cách cục đại phú đại quý và các thế sát tinh cần hóa giải.',
    quotes: [
      {
        originalCn: '紫府同宫，终身福厚；日月并明，佐九重于尧殿。',
        translationVi:
          'Tử Vi Thiên Phủ đồng cung, trọn đời phúc hậu; Thái Dương Thái Âm cùng sáng (Nhật Nguyệt Tịnh Minh), tài năng xứng bậc lương đống phò tá triều đình.',
        applicationVi:
          'Hai thượng cách đứng đầu trong bảng nhận diện Cách Cục tự động của hệ thống.',
        sourceRef: '《Cốt Tủy Phú》• Trần Đoàn Tổ Sư',
      },
      {
        originalCn: '禄马最喜交驰，科权禄合富贵双全。',
        translationVi:
          'Lộc Tồn (hoặc Hóa Lộc) rất mừng gặp Thiên Mã đồng cung hoặc hội chiếu (Lộc Mã Giao Trì); Hóa Khoa, Hóa Quyền, Hóa Lộc cùng hội chiếu (Tam Kỳ Gia Hội) thì phú quý song toàn.',
        applicationVi:
          'Khi Đại hạn hoặc Lưu niên đi vào cung có Lộc Mã Giao Trì, đó là thời điểm vàng để mở rộng kinh doanh, xuất ngoại hoặc chuyển dịch công việc.',
        sourceRef: '《Thái Vi Phú》• Tử Vi Đẩu Số Toàn Tập',
      },
    ],
  },
  {
    id: 'heming-rules',
    category: 'Khẩu Quyết Hợp Hôn',
    titleVi: 'Phép Xem Hợp Hôn & Hợp Tác Đôi (Tử Vi Hợp Bàn)',
    titleCn: '紫微合盘核心断法（婚姻·事业合伙）',
    summaryVi:
      'Quy tắc đối chiếu 2 lá số Nam – Nữ hoặc 2 đối tác kinh doanh theo học phái Nghê Hải Hạ.',
    quotes: [
      {
        originalCn: '夫妻合盘三层法：一看双方命宫与福德宫是否同气互补；二看夫妻宫主星是否对应对方命盘；三看四化是否互禄互科而非化忌互冲。',
        translationVi:
          'Ba tầng chấm lá số Hợp Hôn: (1) Xem Mệnh cung & Phúc Đức cung của hai người có đồng thanh tương ứng hay bù trừ âm dương không; (2) Xem chính tinh cung Phu Thê người này có khớp với Mệnh/Thân người kia không; (3) Xem Tứ Hóa có Hóa Lộc/Hóa Khoa tương trợ hay Hóa Kỵ xung khắc.',
        applicationVi:
          'Ví dụ: Một người thuộc nhóm Sát Phá Tham (mạnh mẽ mở đường) kết hợp với người có Thiên Tướng hoặc Cơ Nguyệt Đồng Lương (điềm tĩnh giữ hậu phương) sẽ bù trừ rất tốt nếu cung Phúc Đức hòa hợp.',
        sourceRef: 'Hệ thống Hợp Bàn Thiên Kỷ (`heming-knowledge.ts`)',
      },
    ],
  },
];


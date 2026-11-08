type StarProfile = {
  about: string;
  strength: string;
  caution: string;
};

export const STAR_READING_PROFILES: Record<string, StarProfile> = {
  紫微: {
    about: 'Tử Vi tượng trưng cho người đứng đầu, có trách nhiệm tổ chức và giữ trật tự. Khi có sao trợ lực, ý lãnh đạo dễ thể hiện qua khả năng quy tụ người khác.',
    strength: 'Bạn dễ phát huy khi được giao một việc có mục tiêu rõ và có quyền phân công. Điểm mạnh là nhìn tổng thể rồi sắp xếp người và việc.',
    caution: 'Khi ôm quyền quyết định, người khác có thể ngại góp ý. Thử hỏi nhóm xem họ đang vướng ở đâu trước khi chốt cách làm.',
  },
  天机: {
    about: 'Thiên Cơ tượng trưng cho trí óc linh hoạt, khả năng tính toán và cách xoay xở khi điều kiện thay đổi.',
    strength: 'Bạn có thể nhận ra nhiều cách giải cho cùng một vấn đề. Điểm này hữu ích khi cần lập kế hoạch hoặc điều chỉnh một quy trình.',
    caution: 'Có nhiều phương án dễ khiến bạn đổi ý liên tục. Chọn một mốc để thử cách đang có trước khi chuyển sang cách mới.',
  },
  太阳: {
    about: 'Thái Dương gắn với sự chủ động, việc làm công khai và tinh thần giúp đỡ. Độ sáng và các sao đi cùng ảnh hưởng cách biểu hiện.',
    strength: 'Bạn có thể tạo uy tín bằng cách giải thích rõ và đứng ra hỗ trợ khi cần. Điểm mạnh thường dễ thấy hơn trong việc có trách nhiệm với tập thể.',
    caution: 'Dễ nhận thêm việc vì ngại từ chối hoặc muốn làm gương. Nói rõ phần mình có thể đảm nhận để tránh quá sức.',
  },
  武曲: {
    about: 'Vũ Khúc thường được gọi là tài tinh, nhấn mạnh khả năng quản lý nguồn lực, tính thực tế và kỷ luật.',
    strength: 'Bạn dễ phát huy khi có con số, ngân sách hoặc mục tiêu rõ ràng. Việc theo dõi kết quả đều đặn có thể giúp bạn làm chắc tay hơn.',
    caution: 'Cách nói quá thẳng hoặc chỉ nhìn hiệu quả trước mắt có thể khiến người khác thấy khó gần. Chừa chỗ cho những điều khó đo bằng số.',
  },
  天同: {
    about: 'Thiên Đồng là sao thiên về sự hòa nhã, dễ chịu và khả năng giữ bầu không khí êm dịu.',
    strength: 'Bạn có thể làm người khác thấy được lắng nghe và hòa nhập. Đây là điểm mạnh khi chăm sóc người khác hoặc làm việc trong nhóm.',
    caution: 'Đôi khi bạn trì hoãn việc khó để giữ cảm giác dễ chịu. Chia việc thành bước nhỏ và hẹn thời điểm xử lý cụ thể.',
  },
  廉贞: {
    about: 'Liêm Trinh thường được đọc qua hai mặt là ranh giới, nguyên tắc và sức hút trong giao tiếp.',
    strength: 'Bạn có thể nhận ra khi một việc đi quá giới hạn và diễn đạt lập trường khá rõ. Khi dùng khéo, điều đó giúp bạn giữ nguyên tắc mà vẫn làm việc được với nhiều người.',
    caution: 'Khi bị thách thức, dễ chuyển từ bảo vệ nguyên tắc sang tranh đúng sai. Tách vấn đề cần xử lý khỏi cảm xúc với người đối diện.',
  },
  天府: {
    about: 'Thiên Phủ được ví như kho chứa, nhấn mạnh việc giữ gìn, quản lý và tích lũy nguồn lực.',
    strength: 'Bạn dễ phát huy khi xây hệ thống ổn định, có dự phòng và duy trì được việc tốt đã bắt đầu.',
    caution: 'Muốn chắc chắn quá có thể làm chậm một thay đổi cần thiết. Thử ở quy mô nhỏ trước khi quyết định có mở rộng hay không.',
  },
  太阴: {
    about: 'Thái Âm gắn với sự quan sát, đời sống bên trong và cách tích lũy từng bước. Độ sáng là một phần khi đọc sao này.',
    strength: 'Bạn có thể để ý những chi tiết người khác bỏ qua. Kiểu làm việc chuẩn bị kỹ thường giúp bạn thấy an tâm hơn.',
    caution: 'Suy nghĩ lâu có thể khiến bạn giữ lo lắng một mình. Chia sẻ điều còn băn khoăn trước khi phải tự đi đến quyết định.',
  },
  贪狼: {
    about: 'Tham Lang tượng trưng cho sự ham tìm hiểu, sức hút trong giao tiếp và khả năng thử nhiều hướng.',
    strength: 'Bạn dễ bắt nhịp với môi trường mới và tìm cơ hội nhờ kết nối. Khi có mục tiêu rõ, sự tò mò giúp bạn học nhanh từ trải nghiệm.',
    caution: 'Dễ bị cuốn vào nhiều thú vui hoặc dự định cùng lúc. Đặt giới hạn thời gian và tiền cho mỗi việc trước khi bắt đầu.',
  },
  巨门: {
    about: 'Cự Môn gắn với lời nói, thắc mắc và việc xem xét những điều còn mập mờ.',
    strength: 'Bạn có thể đặt câu hỏi sắc và nhận ra điểm chưa hợp lý. Điều này có ích khi giải thích, tư vấn hoặc kiểm tra thông tin.',
    caution: 'Lời nói dễ bị nghe thành bắt bẻ. Nêu điều quan sát được, rồi hỏi người kia hiểu tình huống thế nào trước khi kết luận.',
  },
  天相: {
    about: 'Thiên Tướng được ví với ấn tín, nhấn mạnh vai trò điều phối, giữ quy tắc và cân bằng lợi ích.',
    strength: 'Bạn có thể giúp mọi người thống nhất cách làm và để ý ai đang cần hỗ trợ. Điểm mạnh nằm ở sự công bằng và nhất quán.',
    caution: 'Giữ hòa khí quá mức dễ làm chậm một quyết định khó. Nêu rõ điều có thể thương lượng và điều cần giữ.',
  },
  天梁: {
    about: 'Thiên Lương thuộc Nam Đẩu, thường gọi là Ấm tinh và Thọ tinh. Hình tượng chính là người có kinh nghiệm biết che chở, chỉ dẫn và đứng ra bảo vệ điều mình cho là đúng.',
    strength: 'Bạn dễ để ý khi người khác gặp khó và thường muốn đứng ra giúp. Khi biết đặt giới hạn, sự tử tế này có thể trở thành thế mạnh trong việc hướng dẫn hoặc bảo vệ quyền lợi.',
    caution: 'Dễ lo hộ, làm hộ hoặc góp ý quá nhiều. Hỏi người kia cần được lắng nghe hay cần giúp giải quyết trước khi can thiệp.',
  },
  七杀: {
    about: 'Thất Sát gắn với sự dứt khoát, tinh thần tự lập và khả năng xoay xở trong việc khó.',
    strength: 'Bạn có thể nhanh chóng nhận trách nhiệm khi việc đang bế tắc. Điểm mạnh dễ phát huy khi mục tiêu và quyền quyết định đã rõ.',
    caution: 'Tốc độ có thể khiến bạn bỏ qua ý kiến khác hoặc đánh giá thiếu rủi ro. Chốt điểm kiểm tra trước mỗi quyết định khó đảo ngược.',
  },
  破军: {
    about: 'Phá Quân tượng trưng cho việc bỏ cách cũ để làm lại. Ý đổi mới đi kèm chi phí, công sức và một giai đoạn thử sai.',
    strength: 'Bạn có thể dám sửa những điều mọi người đã quen chịu đựng. Điểm mạnh là nhìn ra phần đang cản trở và thử cách khác.',
    caution: 'Thay đổi quá nhiều cùng lúc dễ làm mất phần vẫn còn hữu ích. Xác định trước việc cần sửa, việc nên giữ và phương án quay lại.',
  },
  堂符: {
    about: 'Đường Phù là phụ tinh an theo can năm, thường được liên hệ với phong thái đàng hoàng, lễ nghi và nơi ở có nền nếp.',
    strength: 'Bạn có thể tạo ấn tượng chỉn chu qua cách ăn nói, trình bày và sắp xếp việc. Trong học tập hoặc công việc, tác phong đó giúp người khác dễ tin tưởng giao trách nhiệm.',
    caution: 'Dễ chú trọng vẻ bề ngoài hoặc mong công việc thuận lợi hơn thực tế. Giữ sự chỉn chu nhưng vẫn cần thời gian luyện năng lực và làm việc đều đặn.',
  },
  喜神: {
    about: 'Hỷ Thần là sao thứ tám trong vòng Bác Sĩ. Sao gợi không khí vui vẻ, thuận hòa và những dịp dễ kết nối với người khác.',
    strength: 'Bạn dễ giúp cuộc trò chuyện bớt căng thẳng và kéo mọi người lại gần. Khi dùng tốt khả năng này, việc học hỏi hoặc nhờ người góp ý có thể thuận hơn.',
    caution: 'Lúc hào hứng, bạn có thể đồng ý quá nhanh. Hãy kiểm tra việc mình nhận lời và thời gian có thể dành cho nó.',
  },
  禄存: {
    about: 'Lộc Tồn gợi việc giữ và tích lũy những nguồn lực đã có, từ tiền bạc đến sự hỗ trợ của người khác.',
    strength: 'Bạn có thể phát huy ở việc xây quỹ dự phòng, giữ nguồn thu ổn định hoặc duy trì một thói quen tốt lâu dài.',
    caution: 'Giữ quá chặt dễ bỏ qua cơ hội đáng thử. Phân biệt khoản cần bảo toàn và khoản có thể dùng để học hoặc thử nghiệm.',
  },
  文昌: {
    about: 'Văn Xương thường được gắn với học hành, ghi chép và trình bày có hệ thống.',
    strength: 'Bạn có thể phát huy khi cần sắp xếp ý, giải thích điều phức tạp hoặc chuẩn bị bài bản.',
    caution: 'Đừng để việc trau chuốt làm chậm bước thực hành. Thử đưa bản nháp cho người khác đọc rồi chỉnh tiếp.',
  },
  文曲: {
    about: 'Văn Khúc gắn với khả năng diễn đạt linh hoạt, cảm thụ và cách truyền tải có sắc thái.',
    strength: 'Bạn dễ tìm cách diễn đạt hợp người nghe hoặc nhận ra sắc thái tinh tế trong tình huống.',
    caution: 'Khi việc cần chính xác, kiểm tra lại chi tiết để cách trình bày hấp dẫn vẫn đi cùng nội dung rõ ràng.',
  },
  左辅: {
    about: 'Tả Phù là sao trợ lực, thường được đọc qua sự cộng tác và khả năng có người cùng gánh việc.',
    strength: 'Bạn có thể tiến nhanh hơn khi tìm đúng người có thế mạnh bổ sung cho mình.',
    caution: 'Nói rõ trách nhiệm khi nhờ hỗ trợ để sự cộng tác không trở thành phụ thuộc.',
  },
  右弼: {
    about: 'Hữu Bật là sao hỗ trợ, gợi việc có người phối hợp hoặc được giúp đúng lúc.',
    strength: 'Bạn có thể tận dụng tốt lời góp ý và những mối quan hệ biết hỗ trợ qua lại.',
    caution: 'Kiểm tra người hỗ trợ có hiểu mục tiêu của mình không trước khi giao phần việc quan trọng.',
  },
  天魁: {
    about: 'Thiên Khôi thường được đọc như dấu có người hướng dẫn hoặc có cơ hội được giới thiệu.',
    strength: 'Bạn có thể hưởng lợi khi chủ động hỏi người có kinh nghiệm và chuẩn bị kỹ lúc cơ hội đến.',
    caution: 'Một lời giới thiệu chỉ mở cửa ban đầu. Kết quả còn tùy khả năng chuẩn bị và theo đuổi việc sau đó.',
  },
  天钺: {
    about: 'Thiên Việt là một sao trợ lực, thường đi cùng ý có người chỉ dẫn hoặc hỗ trợ qua quan hệ.',
    strength: 'Bạn có thể gặp hướng giải quyết tốt hơn khi biết chia sẻ đúng vấn đề với đúng người.',
    caution: 'So sánh lời khuyên với hoàn cảnh của mình trước khi làm theo.',
  },
  天马: {
    about: 'Thiên Mã tượng trưng cho di chuyển, thay đổi môi trường và nhịp sống ít đứng yên.',
    strength: 'Bạn có thể học nhanh khi tiếp xúc môi trường hoặc cách làm khác với nơi quen thuộc.',
    caution: 'Đổi quá nhanh dễ làm gián đoạn việc đang xây dựng. Tính trước chi phí và thời gian thích nghi.',
  },
  擎羊: {
    about: 'Kình Dương gợi sự mạnh, sắc và va chạm. Khi đặt trong cung, sao làm rõ chỗ dễ phải đối diện trực tiếp với vấn đề.',
    strength: 'Sự thẳng thắn có ích khi cần nói rõ giới hạn hoặc xử lý việc đã trì hoãn lâu.',
    caution: 'Nếu phản ứng ngay lúc bực, dễ đẩy bất đồng đi xa. Tách điều muốn nói khỏi cách nói khi đang nóng.',
  },
  陀罗: {
    about: 'Đà La thường gợi sự kéo dài, vướng mắc hoặc một việc phải quay lại xử lý nhiều lần.',
    strength: 'Khi cần bền bỉ, bạn có thể tiến từng bước và hoàn thành việc mà người khác dễ bỏ dở.',
    caution: 'Kiểm tra việc đang chậm vì cần thêm thời gian hay vì cách làm chưa đúng, rồi chỉnh ở điểm cụ thể.',
  },
  火星: {
    about: 'Hỏa Tinh gợi tốc độ, cường độ và sự bộc phát trong cách phản ứng.',
    strength: 'Năng lượng này có ích khi cần xử lý một việc cấp bách hoặc tạo đà khởi động.',
    caution: 'Giữ một khoảng dừng trước khi quyết định lúc đang hưng phấn hoặc bực bội.',
  },
  铃星: {
    about: 'Linh Tinh thường gợi sự căng kéo, phản ứng mạnh hoặc áp lực khó bỏ qua.',
    strength: 'Bạn có thể nhanh chóng nhận ra chỗ cần chú ý khi tình huống thay đổi.',
    caution: 'Thay vì chịu căng thẳng liên tục, chia việc thành từng mốc và kiểm tra dấu hiệu quá tải.',
  },
  地空: {
    about: 'Địa Không gợi khoảng trống, điều dễ thay đổi hoặc khoảng cách giữa kỳ vọng và thực tế.',
    strength: 'Bạn có thể nhìn ra giới hạn của một kế hoạch và nghĩ được cách làm khác.',
    caution: 'Kiểm tra nguồn lực thật trước khi tin vào một dự định còn thiếu căn cứ.',
  },
  地劫: {
    about: 'Địa Kiếp thường được đọc như dấu có sự gián đoạn hoặc mất công làm lại.',
    strength: 'Ý nghĩa thực tế có thể là nhắc bạn chuẩn bị phương án dự phòng và không đặt tất cả vào một hướng.',
    caution: 'Tránh quyết định lớn khi chưa biết mình có thể chịu được bao nhiêu chi phí nếu kế hoạch đổi.',
  },
};

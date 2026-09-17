import type { SurvivalKit } from '../types/speaking';

export const defaultSurvivalKitData: SurvivalKit = {
  manners: [
    {
      situation: "Khi bước vào phòng thi",
      japanese: "失礼します。",
      romaji: "Shitsurei shimasu.",
      vietnamese: "Em xin phép vào phòng.",
      tip: "Gõ cửa 2-3 tiếng nhẹ, mở cửa cúi chào 15-30 độ rồi bước vào ghế ngồi."
    },
    {
      situation: "Trước khi bắt đầu bài thi",
      japanese: "はじめまして、[Tên] です。よろしくお願いします。",
      romaji: "Hajimemashite, [Tên] desu. Yoroshiku onegaishimasu.",
      vietnamese: "Rất vui được gặp thầy cô. Em là [Tên], mong thầy cô giúp đỡ ạ.",
      tip: "Nói to, rõ ràng, mắt nhìn thẳng vào giảng viên tạo thiện cảm tác phong."
    },
    {
      situation: "Khi không nghe kịp câu hỏi của giám thị (CÂU CỨU MẠNG)",
      japanese: "すみません、もう一度お願いします。",
      romaji: "Sumimasen, mou ichido onegaishimasu.",
      vietnamese: "Xin lỗi thầy cô nhắc lại một lần nữa giúp em được không ạ?",
      tip: "Được xin hỏi lại tối đa 3 lần/câu mà KHÔNG bị trừ điểm! Tuyệt đối không đoán bừa khi chưa rõ từ để hỏi."
    },
    {
      situation: "Khi cần vài giây định thần suy nghĩ",
      japanese: "ええと… すこし 待ってください。",
      romaji: "Eeto... sukoshi matte kudasai.",
      vietnamese: "Dạ... xin đợi em một chút ạ.",
      tip: "Tránh im lặng tuyệt đối quá 10s. Dùng từ đệm ええと giúp giữ nhịp và chứng minh bạn đang phản xạ."
    },
    {
      situation: "Khi kết thúc bài thi",
      japanese: "どうも ありがとうございました。失礼します。",
      romaji: "Doumo arigatou gozaimashita. Shitsurei shimasu.",
      vietnamese: "Em xin cảm ơn thầy cô nhiều ạ. Em xin phép.",
      tip: "Đứng dậy, đẩy ghế ngay ngắn, cúi chào lịch sự trước khi bước ra khỏi phòng để ăn trọn 10 điểm tác phong!"
    }
  ],
  rubricSummary: [
    {
      section: "1. Đọc đoạn văn (READING)",
      maxScore: 45,
      criteria: "Độ dài 140 - 150 chữ. Gồm: 5-7 chữ Hán (15đ), 2-4 từ Katakana (10đ), 115-125 chữ Hiragana (20đ). Mỗi chữ Hiragana đọc sai trừ 0.2đ; chữ Hán sai trừ 2-3đ/từ. Chuẩn bị 20 giây."
    },
    {
      section: "2. Vấn đáp (Q&A)",
      maxScore: 45,
      criteria: "3 câu hỏi x 15đ/câu (1 câu có tranh + 2 câu không tranh). Sai ngữ pháp hoàn toàn trừ 10đ/câu; sai từ vựng trừ 5-7đ; trả lời lệch tranh trừ 5đ; lỗi đuôi câu/trợ từ trừ 2-3đ/lỗi. Suy nghĩ không quá 10 giây/câu."
    },
    {
      section: "3. Tác phong & Phản xạ",
      maxScore: 10,
      criteria: "Chào hỏi lúc vào và ra (2đ). Độ lưu loát, phát âm, phản xạ tự nhiên không ngập ngừng quá 10s (8đ)."
    }
  ],
  questionWordsSystem: [
    {
      word: "どう",
      furigana: "どう",
      meaning: "Thế nào",
      responseGuide: "Trả lời bằng Tính từ (きれいです, あついです...)",
      exampleQ: "ベトナムは どうですか。",
      exampleA: "きれいです。／あついです。"
    },
    {
      word: "どんな + N",
      furigana: "どんな + N",
      meaning: "N như thế nào",
      responseGuide: "Tính từ + Danh từ + です (bắt buộc phải có danh từ phía sau)",
      exampleQ: "FPT大学は どんな大学ですか。",
      exampleA: "きれいな大学です。／大きいところです。"
    },
    {
      word: "どこ",
      furigana: "どこ",
      meaning: "Ở đâu",
      responseGuide: "Địa điểm + にあります (vật) ／ にいます (người, động vật)",
      exampleQ: "本は どこに ありますか。",
      exampleA: "机の上に あります。"
    },
    {
      word: "どこか",
      furigana: "どこか",
      meaning: "Có đi đâu không",
      responseGuide: "はい、[N]へ 行きました。 ／ いいえ、どこへも 行きませんでした。",
      exampleQ: "きのう、どこかへ 行きましたか。",
      exampleA: "いいえ、どこへも行きませんでした。"
    },
    {
      word: "なに／なん",
      furigana: "なに／なん",
      meaning: "Cái gì / Làm gì",
      responseGuide: "Danh từ hoặc Hành động cụ thể",
      exampleQ: "きのう、何を しましたか。",
      exampleA: "日本語を 勉強しました。"
    },
    {
      word: "どのくらい",
      furigana: "どのくらい",
      meaning: "Bao lâu / Khoảng cách",
      responseGuide: "～分／～時間 くらいです (hoặc かかります)",
      exampleQ: "家から 大学まで どのくらいですか。",
      exampleA: "バイクで ３０分くらいです。"
    },
    {
      word: "だれ",
      furigana: "だれ",
      meaning: "Ai",
      responseGuide: "Người (Tên người + さん)",
      exampleQ: "あの人は だれですか。",
      exampleA: "ホアンさんです。"
    },
    {
      word: "だれと",
      furigana: "だれと",
      meaning: "Cùng với ai",
      responseGuide: "Tên người + と … (nếu một mình: ひとりで)",
      exampleQ: "だれと 勉強しましたか。",
      exampleA: "Lanさんと 勉強しました。／ひとりで 勉強しました。"
    },
    {
      word: "だれが",
      furigana: "だれが",
      meaning: "Ai là người thực hiện (Chủ ngữ)",
      responseGuide: "Tên người + が [Vています/Aです] (Hỏi が đáp が)",
      exampleQ: "だれが 話していますか。",
      exampleA: "Hoaさんが 話しています。"
    },
    {
      word: "どうして",
      furigana: "どうして",
      meaning: "Tại sao",
      responseGuide: "Bắt buộc có [Lý do] + からです ／ から",
      exampleQ: "どうして 学校へ 行きませんでしたか。",
      exampleA: "かぜを ひきましたから。"
    },
    {
      word: "どちら",
      furigana: "どちら",
      meaning: "Cái nào trong hai cái",
      responseGuide: "[N] のほうが [Tính từ] です (hoặc どちらも～)",
      exampleQ: "春と夏と どちらが好きですか。",
      exampleA: "春のほうが 好きです。"
    },
    {
      word: "何月",
      furigana: "なんがつ",
      meaning: "Tháng mấy",
      responseGuide: "[Số] 月です (hoặc [Số] 月がいちばん～)",
      exampleQ: "ベトナムで 何月がいちばん あついですか。",
      exampleA: "６月が いちばん あついです。"
    },
    {
      word: "何で",
      furigana: "なんで",
      meaning: "Bằng cái gì / Phương tiện gì",
      responseGuide: "[Phương tiện/Dụng cụ] で Vます",
      exampleQ: "ベトナム人は 何で ご飯を食べますか。",
      exampleA: "お箸で 食べます。"
    },
    {
      word: "何を",
      furigana: "なにを",
      meaning: "Làm gì / Cái gì",
      responseGuide: "N を Vます (Tân ngữ chịu tác động)",
      exampleQ: "あした、何を 買いに行きますか。",
      exampleA: "本を 買いに行きます。"
    },
    {
      word: "どこで",
      furigana: "どこで",
      meaning: "Làm ở đâu / Xảy ra ở đâu",
      responseGuide: "Địa điểm + で + Vます ／ が あります",
      exampleQ: "FPT大学で 何が ありますか。",
      exampleA: "コンサートが あります。"
    }
  ],
  reflexList20: [
    {
      id: 1,
      question: "どのくらいですか。",
      reflex: "～分／時間くらいです。",
      lesson: "Lesson 4",
      explanation: "Hỏi mất bao lâu → trả lời khoảng thời gian + くらいです."
    },
    {
      id: 2,
      question: "どんなところですか。",
      reflex: "きれいなところです。",
      lesson: "Lesson 4",
      explanation: "Hỏi là nơi thế nào → Tính từ + ところです (phải có danh từ)."
    },
    {
      id: 3,
      question: "どうですか。",
      reflex: "きれいです。／あついです。",
      lesson: "Lesson 4",
      explanation: "Hỏi cảm nhận thế nào → Trả lời trực tiếp bằng Tính từ + です."
    },
    {
      id: 4,
      question: "～ですか。(Tính từ Yes/No)",
      reflex: "はい、～です。／いいえ、～じゃありません・くないです。",
      lesson: "Lesson 4",
      explanation: "Câu hỏi Yes/No với tính từ な hoặc い."
    },
    {
      id: 5,
      question: "何をしましたか。",
      reflex: "～をしました。／～を Vました。",
      lesson: "Lesson 5",
      explanation: "Quá khứ làm gì → Bắt buộc chia động từ đuôi ました."
    },
    {
      id: 6,
      question: "どこかへ行きましたか。",
      reflex: "はい、～へ行きました。／いいえ、どこへも行きませんでした。",
      lesson: "Lesson 5",
      explanation: "Cặp phản xạ: どこか (đâu đó) → Phủ định là どこへも + 行きませんでした."
    },
    {
      id: 7,
      question: "だれと～ましたか。",
      reflex: "～さんと～ました。／ひとりで～ました。",
      lesson: "Lesson 5",
      explanation: "Hỏi đi/làm với ai → Tên + と (với), nếu một mình nói ひとりで."
    },
    {
      id: 8,
      question: "どうして～ませんでしたか。",
      reflex: "～からです。",
      lesson: "Lesson 5",
      explanation: "Hỏi lý do tại sao không làm → Bắt buộc kết thúc bằng ～からです."
    },
    {
      id: 9,
      question: "何がいちばんほしいですか。",
      reflex: "～がいちばんほしいです。／何もほしくないです。",
      lesson: "Lesson 5",
      explanation: "Muốn vật gì nhất → Danh từ + が ほしいです."
    },
    {
      id: 10,
      question: "何がいちばんすきですか。",
      reflex: "～がいちばんすきです。",
      lesson: "Lesson 5",
      explanation: "Thích cái gì nhất → Danh từ + が すきです."
    },
    {
      id: 11,
      question: "何をしたいですか。",
      reflex: "～たいです。 (Vます bỏ ます + たいです)",
      lesson: "Lesson 5",
      explanation: "Muốn làm hành động gì → Động từ thể たい."
    },
    {
      id: 12,
      question: "～ませんか。(Rủ rê)",
      reflex: "いいですね。いっしょに行きましょう。",
      lesson: "Lesson 6",
      explanation: "Đồng ý lời rủ rê: いいですね。いっしょに行きましょう. Từ chối: こんばんはちょっと…."
    },
    {
      id: 13,
      question: "～で何がいちばん A ですか。(So sánh nhất)",
      reflex: "～がいちばん A です。",
      lesson: "Lesson 6",
      explanation: "Trong phạm vi N cái gì là nhất → [Đối tượng] が いちばん A です."
    },
    {
      id: 14,
      question: "AとBと どちらが A ですか。(So sánh 2 thứ)",
      reflex: "Aのほうが A です。／どちらも A です。",
      lesson: "Lesson 6",
      explanation: "So sánh 2 bên → [Bên chọn] のほうが [Tính từ] です."
    },
    {
      id: 15,
      question: "もう～Vましたか。",
      reflex: "はい、もう～ました。／いいえ、まだです。",
      lesson: "Lesson 6",
      explanation: "Đã làm gì chưa → Phản xạ ngay: いいえ、まだです (Chưa, vẫn chưa)."
    },
    {
      id: 16,
      question: "～はどこにありますか。(Đồ vật)",
      reflex: "～の上に／下に あります。",
      lesson: "Lesson 7",
      explanation: "Hỏi vị trí đồ vật vô tri → Dùng あります."
    },
    {
      id: 17,
      question: "～はどこにいますか。(Người/Động vật)",
      reflex: "～の前に／下に います。",
      lesson: "Lesson 7",
      explanation: "Hỏi vị trí sinh vật sống (người, chó mèo) → Dùng います."
    },
    {
      id: 18,
      question: "近くに何がありますか。",
      reflex: "～や～があります。",
      lesson: "Lesson 7",
      explanation: "Gần đó có gì → Liệt kê: スーパーや 公園が あります."
    },
    {
      id: 19,
      question: "何で～ますか。(Dụng cụ)",
      reflex: "～で～ます。 (お箸で／ナイフで／ペンで)",
      lesson: "Lesson 7",
      explanation: "Làm bằng dụng cụ gì → Dụng cụ + で + Vます."
    },
    {
      id: 20,
      question: "何をしていますか。(Đang làm gì)",
      reflex: "～ています。 (Vて + います)",
      lesson: "Lesson 7",
      explanation: "Hành động đang diễn ra → Động từ thể ています."
    },
    {
      id: 21,
      question: "だれが～ていますか。(Ai đang làm)",
      reflex: "～さんが～ています。 (Hỏi が đáp が)",
      lesson: "Lesson 7",
      explanation: "Chủ ngữ chưa biết dùng だれが → Câu trả lời cũng dùng が (Hoaさんが...)."
    }
  ],
  grammarTables: {
    verbs: [
      { form: "Hiện tại / Tương lai", pattern: "Vます", example: "勉強します (Học)" },
      { form: "Quá khứ", pattern: "Vました", example: "勉強しました (Đã học)" },
      { form: "Quá khứ phủ định", pattern: "Vませんでした", example: "勉強しませんでした (Đã không học)" },
      { form: "Muốn làm", pattern: "Vます bỏ ます + たいです", example: "行きたいです (Muốn đi)" },
      { form: "Đang diễn ra", pattern: "Vて + います", example: "聞いています (Đang nghe)" }
    ],
    iAdjectives: [
      { form: "Hiện tại khẳng định", pattern: "Aいです", example: "あついです (Nóng)" },
      { form: "Hiện tại phủ định", pattern: "Aくないです", example: "あつくないです (Không nóng)" },
      { form: "Quá khứ khẳng định", pattern: "Aかったです", example: "あつかったです (Đã nóng)" },
      { form: "Quá khứ phủ định", pattern: "Aくなかったです", example: "あつくなかったです (Đã không nóng)" }
    ],
    naAdjectives: [
      { form: "Hiện tại khẳng định", pattern: "Aです", example: "にぎやかです (Náo nhiệt)" },
      { form: "Hiện tại phủ định", pattern: "Aじゃありません", example: "にぎやかじゃありません (Không náo nhiệt)" },
      { form: "Quá khứ khẳng định", pattern: "Aでした", example: "にぎやかでした (Đã náo nhiệt)" },
      { form: "Quá khứ phủ định", pattern: "Aじゃありませんでした", example: "にぎやかじゃありませんでした (Đã không náo nhiệt)" },
      { form: "Đứng trước Danh từ", pattern: "Aな + Danh từ", example: "きれいなところ (Nơi đẹp)" }
    ],
    subGrammar: [
      { pattern: "Vてください", meaning: "Hãy làm gì đó...", example: "名前を 書いてください。(Hãy viết tên bạn)" },
      { pattern: "Vましょうか", meaning: "Để tôi / chúng ta làm nhé?", example: "手伝いましょうか。(Để tôi giúp bạn nhé?)" },
      { pattern: "Vます + かた", meaning: "Cách làm một việc gì đó", example: "料理の つくりかた (Cách nấu ăn)" },
      { pattern: "まだ ／ もう", meaning: "Vẫn / Đã", example: "まだ あります (Vẫn còn) / もう ありません (Đã hết)" },
      { pattern: "どの + N / どれ", meaning: "Cái nào (trong nhiều cái)", example: "どのお皿ですか。(Chiếc đĩa nào?) / 塩は どれですか。(Muối là lọ nào?)" }
    ],
    eventVsExistence: {
      locationDe: {
        pattern: "Địa điểm + で + あります",
        meaning: "Sự kiện diễn ra ở đâu",
        example: "FPT大学で サッカーの試合が あります。(Ở FPT có trận đấu bóng đá)"
      },
      locationNi: {
        pattern: "Địa điểm + に + あります/います",
        meaning: "Vật/Người tồn tại ở đâu",
        example: "FPT大学の近くに スーパーが あります。(Gần FPT có siêu thị)"
      }
    }
  },
  particlesCheatSheet: [
    {
      particle: "で (de)",
      meanings: [
        { role: "Phương tiện di chuyển", example: "バスで 行きます。(Đi bằng xe buýt)" },
        { role: "Dụng cụ / Công cụ thực hiện", example: "はしで 食べます。(Ăn bằng đũa) / ナイフで 切ります。(Cắt bằng dao)" },
        { role: "Địa điểm diễn ra hành động/sự kiện", example: "図書館で 勉強します。(Học ở thư viện) / 学校で 試合が あります。(Ở trường có trận đấu)" },
        { role: "Phạm vi so sánh nhất", example: "スポーツの中で サッカーが いちばん 好きです。(Trong thể thao, thích bóng đá nhất)" }
      ]
    },
    {
      particle: "に (ni)",
      meanings: [
        { role: "Thời điểm cụ thể (có con số)", example: "７時に 起きます。(Thức dậy lúc 7 giờ)" },
        { role: "Địa điểm tồn tại (あります/います)", example: "机の上に 本が あります。(Trên bàn có sách) / 部屋に 猫が います。(Trong phòng có mèo)" },
        { role: "Mục đích di chuyển (Vに 行きます)", example: "映画を 見に 行きます。(Đi để xem phim)" },
        { role: "Đối tượng tiếp nhận hành động", example: "友達に 会います。(Gặp bạn bè)" }
      ]
    },
    {
      particle: "が (ga)",
      meanings: [
        { role: "Chủ ngữ đối tượng tồn tại", example: "山が あります。(Có núi) / 犬が います。(Có chó)" },
        { role: "Tính từ thích/muốn/giỏi", example: "車が ほしいです。(Muốn có ô tô) / 肉が 好きです。(Thích thịt)" },
        { role: "Chủ ngữ nghi vấn (hỏi が đáp が)", example: "だれが 話していますか。(Ai đang nói?) → Hoaさんが 話しています。(Bạn Hoa đang nói)" },
        { role: "Liên từ nối tương phản (Nhưng...)", example: "大きくないですが、いいところです。(Tuy không lớn nhưng là nơi tốt)" }
      ]
    },
    {
      particle: "と (to)",
      meanings: [
        { role: "Liệt kê danh từ (Và)", example: "パンと 卵を 買いました。(Đã mua bánh mì và trứng)" },
        { role: "Cùng với ai đó", example: "友達と 旅行に 行きます。(Đi du lịch cùng bạn bè)" },
        { role: "So sánh 2 đối tượng (N1 と N2 と)", example: "春と 夏と どちらが 好きですか。(Mùa xuân và mùa hè, thích mùa nào hơn?)" }
      ]
    },
    {
      particle: "へ (e)",
      meanings: [
        { role: "Hướng di chuyển (Đến đâu)", example: "学校へ 行きます。(Đi đến trường) / ベトナムへ 来ました。(Đã đến Việt Nam)" }
      ]
    },
    {
      particle: "を (o)",
      meanings: [
        { role: "Tân ngữ trực tiếp của hành động", example: "ご飯を 食べます。(Ăn cơm) / 日本語を 勉強します。(Học tiếng Nhật)" }
      ]
    },
    {
      particle: "から (kara)",
      meanings: [
        { role: "Điểm xuất phát (Từ đâu / Từ mấy giờ)", example: "家から 大学まで。(Từ nhà đến trường) / ８時から 始まります。(Bắt đầu từ 8 giờ)" },
        { role: "Nguyên nhân, lý do (Vì...)", example: "かぜを ひきましたから。(Vì tôi bị cảm)" }
      ]
    },
    {
      particle: "まで (made)",
      meanings: [
        { role: "Điểm kết thúc (Đến đâu / Đến mấy giờ)", example: "大学まで ３０分です。(Đến trường mất 30 phút) / ５時まで 勉強しました。(Học đến 5 giờ)" }
      ]
    },
    {
      particle: "より (yori)",
      meanings: [
        { role: "Hơn (So sánh hơn)", example: "飛行機は 新幹線より 速いです。(Máy bay nhanh hơn tàu Shinkansen)" }
      ]
    },
    {
      particle: "の (no)",
      meanings: [
        { role: "Sở hữu / Liên kết thuộc tính", example: "私の 本。(Sách của tôi) / 日本語の 先生。(Giáo viên tiếng Nhật)" },
        { role: "Xác định vị trí tương đối", example: "机の 上。(Trên bàn) / テーブルの 下。(Dưới gầm bàn)" }
      ]
    }
  ],
  threeStepMethod: [
    {
      step: 1,
      title: "Nghe từ khóa hỏi (Từ để hỏi)",
      desc: "Chỉ tập trung bắt từ để hỏi: どこ (nơi chốn), なに (cái gì), だれ (người), どうして (lý do), どのくらい (thời gian), どちら (chọn 1 trong 2), 何で (công cụ/phương tiện)."
    },
    {
      step: 2,
      title: "Nghe chủ đề & thì câu hỏi",
      desc: "Ví dụ: きのう + だれと + 勉強しましたか → Nhận diện ngay: Hôm qua làm với ai (quá khứ). Không cần dịch từng chữ trong đầu!"
    },
    {
      step: 3,
      title: "Lấy đúng khuôn đáp đơn giản",
      desc: "Nói 1 câu duy nhất đúng cấu trúc: Lanさんと 勉強しました。(hoặc ひとりで 勉強しました). Tuyệt đối nói ngắn mà đúng ngữ pháp/trợ từ, không cố nói dài dễ bị trừ điểm oan."
    }
  ],
  imageStrategy: {
    title: "Chiến thuật câu 1 có tranh (15 điểm) - Tránh bẫy sai dữ liệu",
    rule: "Câu 1 trong phần Q&A bắt buộc dựa vào dữ liệu trong hình. Nếu nói đúng ngữ pháp nhưng sai dữ liệu tranh sẽ bị trừ 5 điểm!",
    demoFpt: "Tranh Demo FPT: Hà Nội ✈️ 2時間半 📍 TP. Hồ Chí Minh",
    demoQuestion: "ハノイから ホーチミンまで ひこうきで どのくらいですか。",
    demoAnswer: "ハノイから ホーチミンまで、ひこうきで ２時間半くらいです。",
    tip: "Phải nói đúng 'ひこうきで' (phương tiện) và '２時間半' (số giờ trong tranh). Không tự bịa số giờ khác!"
  },
  readingTips: {
    title: "Kỹ thuật lấy trọn 45 điểm Reading",
    structure: "Đoạn văn 140 - 150 chữ: gồm 5-7 Kanji (15đ), 2-4 Katakana (10đ), 115-125 Hiragana (20đ). Mỗi chữ Hiragana sai trừ 0.2đ.",
    goldenRule: "Đọc theo cụm nghĩa (スラッシュ・リーディング), không đọc rời từng chữ.",
    exampleBefore: "わ・た・し・は / こ・と・し・の… (Sai - vấp, trừ điểm lưu loát)",
    exampleAfter: "わたしは / 今年の8月に / ベトナムへ行きました。(Đúng - tự nhiên, đạt 45đ)",
    stallAdvice: "Khi gặp chữ Kanji không nhớ cách đọc: KHÔNG ĐỨNG IM QUÁ 3 GIÂY. Hãy đọc lướt qua hoặc đọc âm gần đúng rồi tiếp tục đoạn văn. Đứng im sẽ bị trừ điểm ngập ngừng toàn bài."
  }
};

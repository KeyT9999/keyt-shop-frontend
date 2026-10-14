import type { SpeakingQuestion, QALessonOverview } from '../types/speaking';

export const QA_LESSON_OVERVIEWS: QALessonOverview[] = [
  {
    "lesson": 4,
    "title": "Bài 4 - Thành phố, phương tiện, thời tiết và món ăn",
    "subtitle": "まち／こうつう／てんき／りょうり",
    "description": "Sau Bài 4, sinh viên có thể hỏi và trả lời về vị trí thành phố/quốc gia, thời gian di chuyển, phương tiện đi lại, miêu tả thành phố hoặc địa điểm, nói nơi đó có gì, nói về thời tiết và cảm nhận món ăn bằng tiếng Nhật sơ cấp.",
    "canDo": [
      "Giới thiệu vị trí quốc gia, thành phố của mình, thời gian đến Nhật mất bao lâu.",
      "Giới thiệu về đất nước, thành phố của mình như thế nào; hỏi đất nước, thành phố của đối phương có gì.",
      "Nói chuyện hoặc hỏi đối phương về thời tiết, món ăn của thành phố/đất nước."
    ],
    "grammarFocus": [
      "Nは Nの どこですか。",
      "Nから Nまで どのくらいですか。",
      "Nで いきます。 / あるいて いきます。",
      "Nは Aいです。 / Aくないです。",
      "Nは Aです。 / Aじゃありません。",
      "AいN / AなN",
      "Nに Nが あります。",
      "Nは どうですか。"
    ],
    "tips": "Khi thi vấn đáp Bài 4, sinh viên cần nghe đúng từ khóa: どこ hỏi vị trí, どのくらい hỏi thời gian, なんで hỏi phương tiện, どんな hỏi đặc điểm, なにがありますか hỏi có gì, どうですか hỏi tình trạng/cảm nhận. Trả lời ngắn bằng mẫu câu + です là đủ.",
    "nonImageCount": 18,
    "imageCount": 8,
    "readingSentenceCount": 11,
    "slots": [
      {
        "slot": 1,
        "part": 1,
        "canDo": "Giới thiệu vị trí quốc gia, thành phố của mình, thời gian đến Nhật mất bao lâu. Hỏi đáp với bạn về những nội dung trên.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "私の まちは ダナンです。（私は ダナンから きました。）",
            "furigana": "わたしの まちは ダナンです。（わたしは ダナンから きました。）",
            "romaji": "Watashi no machi wa Danan desu. (Watashi wa Danan kara kimashita.)",
            "vietnamese": "Thành phố của tôi là Đà Nẵng. (Tôi đến từ Đà Nẵng.)"
          },
          {
            "index": 2,
            "japanese": "東京は 日本の まんなかです。",
            "furigana": "とうきょうは にほんの まんなかです。",
            "romaji": "Toukyou wa Nihon no mannaka desu.",
            "vietnamese": "Tokyo nằm ở trung tâm của Nhật Bản."
          },
          {
            "index": 3,
            "japanese": "ソウルから デグまで 三時間半くらいです。",
            "furigana": "ソウルから デグまで さんじかんはんくらいです。",
            "romaji": "Souru kara Degu made sanjikanhan kurai desu.",
            "vietnamese": "Từ Seoul đến Daegu mất khoảng 3 tiếng rưỡi."
          },
          {
            "index": 4,
            "japanese": "バンコクから アユタヤまで バスで 一時間半くらいです。",
            "furigana": "バンコクから アユタヤまで バスで いちじかんはんくらいです。",
            "romaji": "Bankoku kara Ayutaya made basu de ichijikanhan kurai desu.",
            "vietnamese": "Từ Bangkok đến Ayutthaya đi bằng xe buýt mất khoảng 1 tiếng rưỡi."
          }
        ]
      },
      {
        "slot": 2,
        "part": 2,
        "canDo": "Giới thiệu về đất nước, thành phố của mình như thế nào. Hỏi đất nước, thành phố của đối phương như thế nào, có gì.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "さくら大学は ゆうめいです。",
            "furigana": "さくらだいがくは ゆうめいです。",
            "romaji": "Sakura daigaku wa yuumei desu.",
            "vietnamese": "Trường đại học Sakura rất nổi tiếng."
          },
          {
            "index": 2,
            "japanese": "私の 国は おおきくないです。",
            "furigana": "わたしの くには おおきくないです。",
            "romaji": "Watashi no kuni wa ookikunai desu.",
            "vietnamese": "Đất nước của tôi không lớn."
          },
          {
            "index": 3,
            "japanese": "サントスさんの うちは きれいなうちです。そして、おおきいうちです。",
            "furigana": "サントスさんの うちは きれいなうちです。そして、おおきいうちです。",
            "romaji": "Santosu-san no uchi wa kirei na uchi desu. Soshite, ookii uchi desu.",
            "vietnamese": "Nhà của anh Santos là một ngôi nhà đẹp. Và là một ngôi nhà to lớn."
          },
          {
            "index": 4,
            "japanese": "あそこに レストランが あります。",
            "furigana": "あそこに レストランが あります。",
            "romaji": "Asoko ni resutoran ga arimasu.",
            "vietnamese": "Ở đằng kia có một nhà hàng."
          }
        ]
      },
      {
        "slot": 3,
        "part": 3,
        "canDo": "Có thể nói chuyện hoặc hỏi đối phương về thời tiết, món ăn của thành phố/đất nước.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "イギリスは いまあついです。",
            "furigana": "イギリスは いまあついです。",
            "romaji": "Igirisu wa ima atsui desu.",
            "vietnamese": "Nước Anh bây giờ đang nóng."
          },
          {
            "index": 2,
            "japanese": "日本の たべものは とてもたかいです。",
            "furigana": "にほんの たべものは とてもたかいです。",
            "romaji": "Nihon no tabemono wa totemo takai desu.",
            "vietnamese": "Đồ ăn Nhật Bản rất đắt đỏ."
          },
          {
            "index": 3,
            "japanese": "このレストランは 一二時から 一時まで とてもにぎやかです。",
            "furigana": "このレストランは じゅうにじから いちじまで とてもにぎやかです。",
            "romaji": "Kono resutoran wa juuniji kara ichiji made totemo nigiyaka desu.",
            "vietnamese": "Nhà hàng này từ 12 giờ đến 1 giờ rất là nhộn nhịp."
          }
        ]
      }
    ]
  },
  {
    "lesson": 5,
    "title": "Bài 5 - Quá khứ, cảm nhận, sở thích và mong muốn",
    "subtitle": "かこ／かんそう／すき／ほしい／たい",
    "description": "Sau Bài 5, sinh viên có thể hỏi và trả lời về việc đã làm trong quá khứ, cảm nhận về sự việc trong quá khứ, sở thích, mong muốn có gì, muốn làm gì và kế hoạch cho ngày nghỉ.",
    "canDo": [
      "Hỏi đáp về những việc đã làm vào ngày nghỉ.",
      "Hỏi đáp về cảm nhận về ngày nghỉ.",
      "Diễn đạt được trạng thái của bản thân (thích gì, ghét gì, muốn có gì, muốn làm gì).",
      "Hỏi đáp về những việc sẽ làm vào ngày nghỉ."
    ],
    "grammarFocus": [
      "Vました／Vませんでした",
      "Nで Vました / Nへ いきました / Nと Vました",
      "どこかへ いきましたか / どこへも いきませんでした",
      "い-adj かったです／くなかったです",
      "な-adj／N でした／じゃありませんでした",
      "Nが すきです／すきじゃありません",
      "Nが ほしいです／なにも ほしくないです",
      "Vたいです / Nへ Vに いきます"
    ],
    "tips": "Nếu câu hỏi có しましたか thì trả lời bằng しました／しませんでした. Nếu hỏi どうでしたか thì trả lời cảm nhận như たのしかったです, おもしろかったです, たいへんでした. Nếu có ほしい thì trả lời đồ muốn có + がほしいです. Nếu có たい thì trả lời động từ bỏ ます + たいです.",
    "nonImageCount": 24,
    "imageCount": 11,
    "readingSentenceCount": 23,
    "slots": [
      {
        "slot": 6,
        "part": 1,
        "canDo": "Hỏi đáp về những việc đã làm vào ngày nghỉ.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "日曜日、こうえんへ 行きました。こうえんで バーベキューをしました。",
            "furigana": "にちようび、こうえんへ いきました。こうえんで バーベキューをしました。",
            "romaji": "Nichiyoubi, kouen e ikimashita. Kouen de baabekyuu o shimashita.",
            "vietnamese": "Chủ nhật, tôi đã đi công viên. Tôi đã nướng thịt BBQ ở công viên."
          },
          {
            "index": 2,
            "japanese": "わたしはともだちと 買い物をしました。それから、レストランで 食事をしました。",
            "furigana": "わたしはともだちと かいものをしました。それから、レストランで しょくじをしました。",
            "romaji": "Watashi wa tomodachi to kaimono o shimashita. Sorekara, resutoran de shokuji o shimashita.",
            "vietnamese": "Tôi đã đi mua sắm cùng bạn bè. Sau đó, chúng tôi dùng bữa ở nhà hàng."
          },
          {
            "index": 3,
            "japanese": "しゅうまつ(に)、どこへも 行きませんでした。うちでインターネットをしました。",
            "furigana": "しゅうまつ(に)、どこへも いきませんでした。うちでインターネットをしました。",
            "romaji": "Shuumatsu (ni), doko e mo ikimasen deshita. Uchi de intaanetto o shimashita.",
            "vietnamese": "Vào cuối tuần, tôi đã không đi đâu cả. Tôi dùng internet ở nhà."
          },
          {
            "index": 4,
            "japanese": "きのう、てんきが よかったですから、こうえんへ 行きました。",
            "furigana": "きのう、てんきが よかったですから、こうえんへ いきました。",
            "romaji": "Kinou, tenki ga yokatta desu kara, kouen e ikimashita.",
            "vietnamese": "Hôm qua vì thời tiết đẹp nên tôi đã đến công viên."
          }
        ]
      },
      {
        "slot": 7,
        "part": 2,
        "canDo": "Hỏi đáp về cảm nhận về ngày nghỉ.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "土曜日のあさ、としょかんで べんきょうしました。",
            "furigana": "どようびのあさ、としょかんで べんきょうしました。",
            "romaji": "Doyoubi no asa, toshokan de benkyou shimashita.",
            "vietnamese": "Sáng thứ Bảy tôi đã học bài ở thư viện."
          },
          {
            "index": 2,
            "japanese": "きのうのばん、ルームメイトと 食事をしました。",
            "furigana": "きのうのばん、ルームメイトと しょくじをしました。",
            "romaji": "Kinou no ban, ruumumeito to shokuji o shimashita.",
            "vietnamese": "Tối hôm qua tôi đã ăn cơm cùng bạn cùng phòng."
          },
          {
            "index": 3,
            "japanese": "この本は たかかったです。",
            "furigana": "このほんは たかかったです。",
            "romaji": "Kono hon wa takakatta desu.",
            "vietnamese": "Cuốn sách này đã rất đắt."
          },
          {
            "index": 4,
            "japanese": "きのうは あつかったです。",
            "furigana": "きのうは あつかったです。",
            "romaji": "Kinou wa atsukatta desu.",
            "vietnamese": "Hôm qua trời đã rất nóng."
          },
          {
            "index": 5,
            "japanese": "アルバイトは たいへんでした。",
            "furigana": "アルバイトは たいへんでした。",
            "romaji": "Arubaito wa taihen deshita.",
            "vietnamese": "Công việc làm thêm đã rất vất vả."
          },
          {
            "index": 6,
            "japanese": "おとといは ひまでした。",
            "furigana": "おとといは ひまでした。",
            "romaji": "Ototoi wa hima deshita.",
            "vietnamese": "Hôm kia tôi đã rảnh rỗi."
          },
          {
            "index": 7,
            "japanese": "きょうは しごとでした。",
            "furigana": "きょうは しごとでした。",
            "romaji": "Kyou wa shigoto deshita.",
            "vietnamese": "Hôm nay tôi đã đi làm."
          },
          {
            "index": 8,
            "japanese": "きのう、としょかんは やすみじゃありませんでした。",
            "furigana": "きのう、としょかんは やすみじゃありませんでした。",
            "romaji": "Kinou, toshokan wa yasumi ja arimasen deshita.",
            "vietnamese": "Hôm qua thư viện đã không nghỉ."
          },
          {
            "index": 9,
            "japanese": "先週は てんきが よくなかったです。",
            "furigana": "せんしゅうは てんきが よくなかったです。",
            "romaji": "Senshuu wa tenki ga yokunakatta desu.",
            "vietnamese": "Tuần trước thời tiết đã không tốt."
          }
        ]
      },
      {
        "slot": 8,
        "part": 3,
        "canDo": "Diễn đạt được trạng thái của bản thân (thích gì, ghét gì, muốn có gì, muốn làm gì).",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "わたしは じてんしゃが ほしいです。",
            "furigana": "わたしは じてんしゃが ほしいです。",
            "romaji": "Watashi wa jitensha ga hoshii desu.",
            "vietnamese": "Tôi muốn có một chiếc xe đạp."
          },
          {
            "index": 2,
            "japanese": "わたしは くつが ほしいです。",
            "furigana": "わたしは くつが ほしいです。",
            "romaji": "Watashi wa kutsu ga hoshii desu.",
            "vietnamese": "Tôi muốn có một đôi giày."
          },
          {
            "index": 3,
            "japanese": "わたしは 何も ほしくないです。",
            "furigana": "わたしは なにも ほしくないです。",
            "romaji": "Watashi wa nanimo hoshikunai desu.",
            "vietnamese": "Tôi không muốn có thứ gì cả."
          },
          {
            "index": 4,
            "japanese": "わたしは インターネットが すきです。",
            "furigana": "わたしは インターネットが すきです。",
            "romaji": "Watashi wa intaanetto ga suki desu.",
            "vietnamese": "Tôi thích internet."
          },
          {
            "index": 5,
            "japanese": "わたしは スポーツが あまり すきじゃありません。",
            "furigana": "わたしは スポーツが あまり すきじゃありません。",
            "romaji": "Watashi wa supootsu ga amari sukija arimasen.",
            "vietnamese": "Tôi không thích thể thao cho lắm."
          },
          {
            "index": 6,
            "japanese": "ふじさんに のぼりたいです。",
            "furigana": "ふじさんに のぼりたいです。",
            "romaji": "Fujisan ni noboritai desu.",
            "vietnamese": "Tôi muốn leo núi Phú Sĩ."
          },
          {
            "index": 7,
            "japanese": "国の ともだちに 会いたいです。",
            "furigana": "くにの ともだちに あいたいです。",
            "romaji": "Kuni no tomodachi ni aitai desu.",
            "vietnamese": "Tôi muốn gặp bạn bè ở quê nhà."
          },
          {
            "index": 8,
            "japanese": "きれいな けしきの しゃしんを とりたいです。",
            "furigana": "きれいな けしきの しゃしんを とりたいです。",
            "romaji": "Kirei na keshiki no shashin o toritai desu.",
            "vietnamese": "Tôi muốn chụp những bức ảnh phong cảnh đẹp."
          }
        ]
      },
      {
        "slot": 9,
        "part": 4,
        "canDo": "Hỏi đáp về những việc sẽ làm vào ngày nghỉ.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "A: こんどの 休みに 何をしますか。\nB: 私は カメラが ほしいですから、ニコニコショッピングビルへ 行きます。",
            "furigana": "A: こんどの やすみに なにをしますか。\nB: わたしは カメラが ほしいですから、ニコニコショッピングビルへ いきます。",
            "romaji": "A: Kondo no yasumi ni nani o shimasu ka.\nB: Watashi wa kamera ga hoshii desu kara, Nikoniko shoppingu biru e ikimasu.",
            "vietnamese": "A: Kỳ nghỉ tới bạn sẽ làm gì?\nB: Vì tôi muốn có một chiếc máy ảnh nên tôi sẽ đến tòa nhà mua sắm Nikoniko."
          },
          {
            "index": 2,
            "japanese": "A: Bさん、こんどの 休みに どこかへ 行きますか。\nB: はい、うえのへ えを 見に 行きます。",
            "furigana": "A: Bさん、こんどの やすみに どこかへ いきますか。\nB: はい、うえのへ えを みに いきます。",
            "romaji": "A: B-san, kondo no yasumi ni dokoka e ikimasu ka.\nB: Hai, Ueno e e o mi ni ikimasu.",
            "vietnamese": "A: Bạn B, kỳ nghỉ tới bạn có đi đâu không?\nB: Có, tôi sẽ đến Ueno để xem tranh."
          }
        ]
      }
    ]
  },
  {
    "lesson": 6,
    "title": "Bài 6 - Rủ rê, so sánh và sắp xếp cuộc hẹn",
    "subtitle": "さそう／くらべる／やくそく",
    "description": "Sau Bài 6, sinh viên có thể rủ bạn tham gia hoạt động, nhận hoặc từ chối lời mời, so sánh hơn/nhất và chốt lại cuộc hẹn về thời gian, địa điểm gặp mặt.",
    "canDo": [
      "Rủ bạn tham gia 1 hoạt động; nhận lời hoặc từ chối lời mời của bạn.",
      "Hỏi, so sánh và thảo luận để thống nhất các thông tin cuộc hẹn (so sánh nhất & hơn).",
      "Chốt lại cuộc hẹn với các thông tin về địa điểm, thời gian gặp mặt."
    ],
    "grammarFocus": [
      "Vませんか / Vましょう",
      "Nで Nが いちばん Aいです／Aです",
      "N1と N2と どちらが Aい／Aですか",
      "N1は N2より Aいです／Aです",
      "もう Vましたか / はい、もう Vました / いいえ、まだです",
      "〜ですよ"
    ],
    "tips": "Khi rủ rê, dùng 〜ませんか. Khi đồng ý nói いいですね、いきましょう. Khi từ chối khéo léo nói すみません、ちょっと... (hoặc 〜ですから). Khi hỏi so sánh nhất dùng 何がいちばん好きですか hoặc どこがいちばん好きですか.",
    "nonImageCount": 16,
    "imageCount": 5,
    "readingSentenceCount": 16,
    "slots": [
      {
        "slot": 11,
        "part": 1,
        "canDo": "Rủ bạn tham gia 1 hoạt động. Nhận lời / từ chối lời mời của bạn.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "今週の 金曜日、アルバイトが あります。",
            "furigana": "こんしゅうの きんようび、アルバイトが あります。",
            "romaji": "Konshuu no kin'youbi, arubaito ga arimasu.",
            "vietnamese": "Thứ Sáu tuần này tôi có ca làm thêm."
          },
          {
            "index": 2,
            "japanese": "来月、ニコニコショッピングビルで セールがあります。",
            "furigana": "らいげつ、ニコニコショッピングビルで セールがあります。",
            "romaji": "Raigetsu, Nikoniko shoppingu biru de seeru ga arimasu.",
            "vietnamese": "Tháng sau, ở trung tâm mua sắm Nikoniko có đợt giảm giá."
          },
          {
            "index": 3,
            "japanese": "チケットが 二まい あります。",
            "furigana": "チケットが にまい あります。",
            "romaji": "Chiketto ga nimai arimasu.",
            "vietnamese": "Tôi có hai chiếc vé."
          },
          {
            "index": 4,
            "japanese": "時間が ありません。",
            "furigana": "じかんが ありません。",
            "romaji": "Jikan ga arimasen.",
            "vietnamese": "Tôi không có thời gian."
          },
          {
            "index": 5,
            "japanese": "今月の 20日は ちょっと …やくそくが ありますから。",
            "furigana": "こんげつの はつかは ちょっと …やくそくが ありますから。",
            "romaji": "Kongetsu no hatsuka wa chotto... yakusoku ga arimasu kara.",
            "vietnamese": "Ngày 20 tháng này thì hơi kẹt... vì tôi có hẹn rồi."
          },
          {
            "index": 6,
            "japanese": "来週の 日曜日、カラオケへ 行きましょう。",
            "furigana": "らいしゅうの にちようび、カラオケへ いきましょう。",
            "romaji": "Raishuu no nichiyoubi, karaoke e ikimashou.",
            "vietnamese": "Chủ nhật tuần sau, chúng ta cùng đi karaoke nhé."
          }
        ]
      },
      {
        "slot": 12,
        "part": 2,
        "canDo": "Hỏi, so sánh và thảo luận để thống nhất các thông tin cuộc hẹn (so sánh nhất & hơn).",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "スポーツで やきゅうが いちばん すきです。",
            "furigana": "スポーツで やきゅうが いちばん すきです。",
            "romaji": "Supootsu de yakyuu ga ichiban suki desu.",
            "vietnamese": "Trong các môn thể thao, tôi thích bóng chày nhất."
          },
          {
            "index": 2,
            "japanese": "1年で 1月が いちばん さむいです。",
            "furigana": "いちねんで いちがつが いちばん さむいです。",
            "romaji": "Ichinen de ichigatsu ga ichiban samui desu.",
            "vietnamese": "Trong một năm, tháng 1 là lạnh nhất."
          },
          {
            "index": 3,
            "japanese": "日本で 東京が いちばん きれいです。",
            "furigana": "にほんで とうきょうが いちばん きれいです。",
            "romaji": "Nihon de Toukyou ga ichiban kirei desu.",
            "vietnamese": "Ở Nhật Bản, Tokyo là đẹp nhất."
          },
          {
            "index": 4,
            "japanese": "日曜日は 土曜日より 人が おおいです。",
            "furigana": "にちようびは どようびより ひとが おおいです。",
            "romaji": "Nichiyoubi wa doyoubi yori hito ga ooi desu.",
            "vietnamese": "Chủ nhật đông người hơn thứ Bảy."
          },
          {
            "index": 5,
            "japanese": "タイの カレーは 日本の カレーより からいです。",
            "furigana": "タイの カレーは にほんの カレーより からいです。",
            "romaji": "Tai no karee wa Nihon no karee yori karai desu.",
            "vietnamese": "Cà ri Thái Lan cay hơn cà ri Nhật Bản."
          },
          {
            "index": 6,
            "japanese": "ハッピースーパーは ニコニコマートより とおいです。",
            "furigana": "ハッピースーパーは ニコニコマートより とおいです。",
            "romaji": "Happii suupaa wa Nikoniko maato yori tooi desu.",
            "vietnamese": "Siêu thị Happy xa hơn siêu thị Nikoniko Mart."
          },
          {
            "index": 7,
            "japanese": "ひこうきは しんかんせんより はやいです。",
            "furigana": "ひこうきは しんかんせんより はやいです。",
            "romaji": "Hikouki wa shinkansen yori hayai desu.",
            "vietnamese": "Máy bay nhanh hơn tàu Shinkansen."
          }
        ]
      },
      {
        "slot": 14,
        "part": 3,
        "canDo": "Chốt lại cuộc hẹn với các thông tin về địa điểm, thời gian gặp vv.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "ふじまるランドは おもしろいですよ。",
            "furigana": "ふじまるランドは おもしろいですよ。",
            "romaji": "Fujimaru rando wa omoshiroi desu yo.",
            "vietnamese": "Công viên Fujimaru Land thú vị lắm đấy!"
          },
          {
            "index": 2,
            "japanese": "ディズニーランドは たのしいですよ。",
            "furigana": "ディズニーランドは たのしいですよ。",
            "romaji": "Dizuniirando wa tanoshii desu yo.",
            "vietnamese": "Disneyland vui lắm đấy nhé!"
          },
          {
            "index": 3,
            "japanese": "わかばこうえんの さくらは きれいですよ。",
            "furigana": "わかばこうえんの さくらは きれいですよ。",
            "romaji": "Wakaba kouen no sakura wa kirei desu yo.",
            "vietnamese": "Hoa anh đào ở công viên Wakaba đẹp lắm đấy!"
          }
        ]
      }
    ]
  },
  {
    "lesson": 7,
    "title": "Bài 7 - Vị trí, chỉ đường, tiệc tùng và đang làm gì",
    "subtitle": "いち／ばしょ／パーティー／て-form",
    "description": "Sau Bài 7, sinh viên có thể chỉ dẫn vị trí khi bị lạc, hỏi nhờ vả trong bữa tiệc và miêu tả hành động đang diễn ra bằng thể ています.",
    "canDo": [
      "Hỏi chỉ dẫn khi bị lạc, nói cho người khác biết vị trí của mình.",
      "Nhờ hoặc đưa ra yêu cầu trong khi chuẩn bị bữa tiệc.",
      "Miêu tả hành động đang diễn ra; đưa ra đề nghị giúp đỡ người khác."
    ],
    "grammarFocus": [
      "N1の まえ／うしろ／となり／あいだ／ちかくに N2が あります／います",
      "Nで Vます (phương tiện / dụng cụ)",
      "Vてください / Vましょうか",
      "Vています (hành động đang diễn ra)"
    ],
    "tips": "Phân biệt vị trí: まえ (trước), うしろ (sau), となり (bên cạnh), あいだ (ở giữa), なか (bên trong), そと (bên ngoài), ちかく (gần). Khi hỏi hành động đang diễn ra: だれが 〜ていますか hoặc 〜さんは 何を していますか, trả lời bằng Vています.",
    "nonImageCount": 10,
    "imageCount": 28,
    "readingSentenceCount": 12,
    "slots": [
      {
        "slot": 17,
        "part": 1,
        "canDo": "Hỏi chỉ dẫn khi bị lạc, nói cho người khác biết vị trí của mình.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "ちゅうごくの 料理の レストランは 本やの となりに あります。",
            "furigana": "ちゅうごくの りょうりの レストランは ほんやの となりに あります。",
            "romaji": "Chuugoku no ryouri no resutoran wa hon'ya no tonari ni arimasu.",
            "vietnamese": "Nhà hàng món Trung Quốc nằm ở bên cạnh hiệu sách."
          },
          {
            "index": 2,
            "japanese": "さくら大学は ケーキやと ゆうびんきょくの あいだに あります。",
            "furigana": "さくらだいがくは ケーキやと ゆうびんきょくの あいだに あります。",
            "romaji": "Sakura daigaku wa keekiya to yuubinkyoku no aida ni arimasu.",
            "vietnamese": "Trường đại học Sakura nằm ở giữa tiệm bánh kem và bưu điện."
          },
          {
            "index": 3,
            "japanese": "私は 午前 九時半から 午後 三時まで としょかんの なかに います。",
            "furigana": "わたしは ごぜん くじはんから ごご さんじまで としょかんの なかに います。",
            "romaji": "Watashi wa gozen kujihan kara gogo sanji made toshokan no naka ni imasu.",
            "vietnamese": "Tôi ở trong thư viện từ 9 giờ rưỡi sáng đến 3 giờ chiều."
          },
          {
            "index": 4,
            "japanese": "この小学校の そとに 学生と 先生が います。",
            "furigana": "このしょうがっこうの そとに がくせいと せんせいが います。",
            "romaji": "Kono shougakkou no soto ni gakusei to sensei ga imasu.",
            "vietnamese": "Ở bên ngoài trường tiểu học này có học sinh và thầy cô giáo."
          },
          {
            "index": 5,
            "japanese": "あの お寺の ちかくに 大きい木が たくさんあります。",
            "furigana": "あの おてらの ちかくに おおきいきが たくさんあります。",
            "romaji": "Ano otera no chikaku ni ookii ki ga takusan arimasu.",
            "vietnamese": "Ở gần ngôi chùa đằng kia có rất nhiều cây lớn."
          }
        ]
      },
      {
        "slot": 18,
        "part": 2,
        "canDo": "Nhờ hoặc đưa ra yêu cầu trong khi chuẩn bị bữa tiệc.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "ペンで 名前を 書きます。",
            "furigana": "ペンで なまえを かきます。",
            "romaji": "Pen de namae o kakimasu.",
            "vietnamese": "Tôi viết tên bằng bút mực."
          },
          {
            "index": 2,
            "japanese": "この料理の 食べかたが 分かりません。",
            "furigana": "このりょうりの たべかたが わかりません。",
            "romaji": "Kono ryouri no tabekata ga wakarimasen.",
            "vietnamese": "Tôi không biết cách ăn món ăn này."
          },
          {
            "index": 3,
            "japanese": "野菜の きりかたを おしえてください。",
            "furigana": "やさいの きりかたを おしえてください。",
            "romaji": "Yasai no kirikata o oshiete kudasai.",
            "vietnamese": "Xin hãy chỉ cho tôi cách cắt gọt rau củ."
          },
          {
            "index": 4,
            "japanese": "この料理を テーブルに もって 行ってください。",
            "furigana": "このりょうりを テーブルに もって いってください。",
            "romaji": "Kono ryouri o teeburu ni motte itte kudasai.",
            "vietnamese": "Xin hãy mang món ăn này ra bàn giúp tôi."
          }
        ]
      },
      {
        "slot": 19,
        "part": 3,
        "canDo": "Miêu tả hành động đang diễn ra. Đưa ra đề nghị giúp đỡ người khác.",
        "readingSentences": [
          {
            "index": 1,
            "japanese": "A: ジュースは まだありますか。\nB1: はい、まだ すこしあります。\nB2: もう ありません。",
            "furigana": "A: ジュースは まだありますか。\nB1: はい、まだ すこしあります。\nB2: もう ありません。",
            "romaji": "A: Juusu wa mada arimasu ka.\nB1: Hai, mada sukoshi arimasu.\nB2: Mou arimasen.",
            "vietnamese": "A: Nước trái cây còn không?\nB1: Vâng, vẫn còn một chút.\nB2: Hết mất rồi."
          },
          {
            "index": 2,
            "japanese": "ダニエルさんは ともだちと 話しています。",
            "furigana": "ダニエルさんは ともだちと はなしています。",
            "romaji": "Danieru-san wa tomodachi to hanashite imasu.",
            "vietnamese": "Anh Daniel đang nói chuyện với bạn bè."
          },
          {
            "index": 3,
            "japanese": "グップタさん、料理を とりましょうか。",
            "furigana": "グップタさん、りょうりを とりましょうか。",
            "romaji": "Gupputa-san, ryouri o torimashou ka.",
            "vietnamese": "Anh Gupta ơi, để tôi lấy giúp món ăn cho nhé?"
          }
        ]
      }
    ]
  }
];

export const ALL_QA_QUESTIONS: SpeakingQuestion[] = [
  {
    "id": "QA-L4-P1-01",
    "lesson": 4,
    "part": 1,
    "partTitle": "Phần 1: Thành phố / Vị trí / Thời gian di chuyển",
    "hasImage": false,
    "questionJapanese": "Bさんの まちは どちらですか。（または どこですか。）",
    "questionFurigana": "Bさんの まちは どちらですか。（または どこですか。）",
    "questionVietnamese": "Thành phố / quê của bạn ở đâu?",
    "grammarPattern": "私のまちは Nです。 / Nから きました。",
    "keywords": [
      "まち",
      "ダナン",
      "ハノイ",
      "ホーチミン",
      "どちら",
      "どこ"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ダナンです。",
        "reading": "ダナンです。",
        "vietnamese": "Là Đà Nẵng."
      },
      "level2_polite": {
        "japanese": "私の まちは ダナンです。",
        "reading": "わたしの まちは ダナンです。",
        "vietnamese": "Thành phố của tôi là Đà Nẵng."
      },
      "level3_expanded": {
        "japanese": "私の まちは ダナンです。ベトナムの まんなかです。きれいな まちです。",
        "reading": "わたしの まちは ダナンです。ベトナムの まんなかです。きれいな まちです。",
        "vietnamese": "Thành phố của tôi là Đà Nẵng. Nó nằm ở miền Trung Việt Nam và là một thành phố rất đẹp."
      }
    }
  },
  {
    "id": "QA-L4-P1-02",
    "lesson": 4,
    "part": 1,
    "partTitle": "Phần 1: Thành phố / Vị trí / Thời gian di chuyển",
    "hasImage": false,
    "questionJapanese": "ホーチミンは ベトナムの どこですか。",
    "questionFurigana": "ホーチミンは ベトナムの どこですか。",
    "questionVietnamese": "Thành phố Hồ Chí Minh nằm ở đâu của Việt Nam?",
    "grammarPattern": "Nは Nの [みなみ／きた／まんなか] です。",
    "keywords": [
      "ホーチミン",
      "ベトナム",
      "みなみ",
      "どこ"
    ],
    "answers": {
      "level1_short": {
        "japanese": "みなみです。",
        "reading": "みなみです。",
        "vietnamese": "Ở miền Nam."
      },
      "level2_polite": {
        "japanese": "ホーチミンは ベトナムの みなみです。",
        "reading": "ホーチミンは ベトナムの みなみです。",
        "vietnamese": "TP.HCM nằm ở phía nam của Việt Nam."
      },
      "level3_expanded": {
        "japanese": "ベトナムの みなみです。とても おおきくて、にぎやかな まちです。",
        "reading": "ベトナムの みなみです。とても おおきくて、にぎやかな まちです。",
        "vietnamese": "Nằm ở miền nam Việt Nam. Đó là một thành phố rất lớn và sầm uất."
      }
    }
  },
  {
    "id": "QA-L4-P1-03",
    "lesson": 4,
    "part": 1,
    "partTitle": "Phần 1: Thành phố / Vị trí / Thời gian di chuyển",
    "hasImage": false,
    "questionJapanese": "ハノイは ベトナムの どこですか。",
    "questionFurigana": "ハノイは ベトナムの どこですか。",
    "questionVietnamese": "Hà Nội nằm ở đâu của Việt Nam?",
    "grammarPattern": "Nは Nの [きた／みなみ／まんなか] です。",
    "keywords": [
      "ハノイ",
      "ベトナム",
      "きた",
      "どこ"
    ],
    "answers": {
      "level1_short": {
        "japanese": "きたです。",
        "reading": "きたです。",
        "vietnamese": "Ở miền Bắc."
      },
      "level2_polite": {
        "japanese": "ハノイは ベトナムの きたです。",
        "reading": "ハノイは ベトナムの きたです。",
        "vietnamese": "Hà Nội nằm ở phía bắc Việt Nam."
      },
      "level3_expanded": {
        "japanese": "ベトナムの きたです。ベトナムの しゅとで、ふるい まちです。",
        "reading": "ベトナムの きたです。ベトナムの しゅとで、ふるい まちです。",
        "vietnamese": "Ở miền bắc Việt Nam. Đó là thủ đô của Việt Nam và là thành phố cổ kính."
      }
    }
  },
  {
    "id": "QA-L4-P1-04",
    "lesson": 4,
    "part": 1,
    "partTitle": "Phần 1: Thành phố / Vị trí / Thời gian di chuyển",
    "hasImage": false,
    "questionJapanese": "ハノイから ホーチミンまで どのくらいですか。",
    "questionFurigana": "ハノイから ホーチミンまで どのくらいですか。",
    "questionVietnamese": "Từ Hà Nội đến TP.HCM mất khoảng bao lâu?",
    "grammarPattern": "Nから Nまで [Phương tiện]で [Thời gian]くらいです。",
    "keywords": [
      "ハノイ",
      "ホーチミン",
      "ひこうき",
      "にじかん",
      "どのくらい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ひこうきで 二時間くらいです。",
        "reading": "ひこうきで にじかんくらいです。",
        "vietnamese": "Bằng máy bay khoảng 2 tiếng."
      },
      "level2_polite": {
        "japanese": "ハノイから ホーチミンまで ひこうきで 二時間くらいです。",
        "reading": "ハノイから ホーチミンまで ひこうきで にじかんくらいです。",
        "vietnamese": "Từ Hà Nội đến TP.HCM đi máy bay mất khoảng 2 tiếng."
      },
      "level3_expanded": {
        "japanese": "ひこうきで 二時間くらいです。でんしゃなら いちにちはんくらい かかります。",
        "reading": "ひこうきで にじかんくらいです。でんしゃなら いちにちはんくらい かかります。",
        "vietnamese": "Đi máy bay mất khoảng 2 tiếng. Nếu đi tàu hỏa thì mất khoảng một ngày rưỡi."
      }
    }
  },
  {
    "id": "QA-L4-P1-05",
    "lesson": 4,
    "part": 1,
    "partTitle": "Phần 1: Thành phố / Vị trí / Thời gian di chuyển",
    "hasImage": false,
    "questionJapanese": "うちから 大学まで どのくらいですか。",
    "questionFurigana": "うちから だいがくまで どのくらいですか。",
    "questionVietnamese": "Từ nhà bạn đến trường đại học mất khoảng bao lâu?",
    "grammarPattern": "[Phương tiện]で [Thời gian]くらいです。",
    "keywords": [
      "うち",
      "だいがく",
      "どのくらい",
      "ぷん",
      "じかん"
    ],
    "answers": {
      "level1_short": {
        "japanese": "三十分くらいです。",
        "reading": "さんじゅっぷんくらいです。",
        "vietnamese": "Khoảng 30 phút."
      },
      "level2_polite": {
        "japanese": "うちから 大学まで バイクで 三十分くらいです。",
        "reading": "うちから だいがくまで バイクで さんじゅっぷんくらいです。",
        "vietnamese": "Từ nhà đến trường đại học đi xe máy mất khoảng 30 phút."
      },
      "level3_expanded": {
        "japanese": "バイクで 二十分くらいです。ちかいですから、とても べんりです。",
        "reading": "バイクで にじゅっぷんくらいです。ちかいですから、とても べんりです。",
        "vietnamese": "Đi xe máy mất khoảng 20 phút. Vì gần nên rất tiện lợi."
      }
    }
  },
  {
    "id": "QA-L4-P1-06",
    "lesson": 4,
    "part": 1,
    "partTitle": "Phần 1: Thành phố / Vị trí / Thời gian di chuyển",
    "hasImage": false,
    "questionJapanese": "うちから 大学まで なんで いきますか。",
    "questionFurigana": "うちから だいがくまで なんで いきますか。",
    "questionVietnamese": "Từ nhà đến trường đại học bạn đi bằng phương tiện gì?",
    "grammarPattern": "[Phương tiện]で いきます。 / あるいて いきます。",
    "keywords": [
      "バイク",
      "バス",
      "じてんしゃ",
      "あるいて",
      "なんで"
    ],
    "answers": {
      "level1_short": {
        "japanese": "バイクで いきます。",
        "reading": "バイクで いきます。",
        "vietnamese": "Đi bằng xe máy."
      },
      "level2_polite": {
        "japanese": "うちから 大学まで バイクで 行きます。",
        "reading": "うちから だいがくまで バイクで いきます。",
        "vietnamese": "Từ nhà đến trường đại học tôi đi bằng xe máy."
      },
      "level3_expanded": {
        "japanese": "まいにち バイクで いきます。ときどき バスでも いきます。",
        "reading": "まいにち バイクで いきます。ときどき バスでも いきます。",
        "vietnamese": "Mỗi ngày tôi đi bằng xe máy. Thỉnh thoảng cũng đi bằng xe buýt nữa."
      }
    }
  },
  {
    "id": "QA-L4-P2-01",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "FPT大学は おおきいですか。",
    "questionFurigana": "FPTだいがくは おおきいですか。",
    "questionVietnamese": "Trường Đại học FPT có lớn không?",
    "grammarPattern": "はい、おおきいです。 / いいえ、おおきくないです。",
    "keywords": [
      "FPT",
      "だいがく",
      "おおきい",
      "きれい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、大きいです。",
        "reading": "はい、おおきいです。",
        "vietnamese": "Vâng, lớn ạ."
      },
      "level2_polite": {
        "japanese": "はい、FPT大学は とても 大きいです。",
        "reading": "はい、FPTだいがくは とても おおきいです。",
        "vietnamese": "Vâng, Đại học FPT rất là lớn."
      },
      "level3_expanded": {
        "japanese": "はい、とても 大きいです。そして、みどりも おおくて きれいです。",
        "reading": "はい、とても おおきいです。そして、みどりも おおくて きれいです。",
        "vietnamese": "Vâng, rất lớn. Hơn nữa có nhiều cây xanh và rất đẹp."
      }
    }
  },
  {
    "id": "QA-L4-P2-02",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "Bさんの まちは みどりが おおいですか。",
    "questionFurigana": "Bさんの まちは みどりが おおいですか。",
    "questionVietnamese": "Thành phố của bạn có nhiều cây xanh không?",
    "grammarPattern": "はい、おおいです。 / いいえ、すくないです。",
    "keywords": [
      "まち",
      "みどり",
      "おおい",
      "すくない"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、多いです。",
        "reading": "はい、おおいです。",
        "vietnamese": "Vâng, nhiều lắm ạ."
      },
      "level2_polite": {
        "japanese": "はい、私の まちは 緑が 多いです。",
        "reading": "はい、わたしの まちは みどりが おおいです。",
        "vietnamese": "Vâng, thành phố của tôi có nhiều cây xanh."
      },
      "level3_expanded": {
        "japanese": "はい、緑が 多いです。こうえんも たくさん ありますから、きもちが いいです。",
        "reading": "はい、みどりが おおいです。こうえんも たくさん ありますから、きもちが いいです。",
        "vietnamese": "Vâng, có rất nhiều cây xanh. Lại có nhiều công viên nên không khí rất dễ chịu."
      }
    }
  },
  {
    "id": "QA-L4-P2-03",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "Bさんの まちは にぎやかですか。",
    "questionFurigana": "Bさんの まちは にぎやかですか。",
    "questionVietnamese": "Thành phố của bạn có nhộn nhịp, sầm uất không?",
    "grammarPattern": "はい、にぎやかです。 / いいえ、しずかです。",
    "keywords": [
      "まち",
      "にぎやか",
      "しずか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、にぎやかです。",
        "reading": "はい、にぎやかです。",
        "vietnamese": "Vâng, nhộn nhịp lắm."
      },
      "level2_polite": {
        "japanese": "はい、私の まちは とても にぎやかです。",
        "reading": "はい、わたしの まちは とても にぎやかです。",
        "vietnamese": "Vâng, thành phố của tôi rất nhộn nhịp."
      },
      "level3_expanded": {
        "japanese": "はい、ひとが おおくて にぎやかです。でも、すこし うるさいです。",
        "reading": "はい、ひとが おおくて にぎやかです。でも、すこし うるさいです。",
        "vietnamese": "Vâng, đông người nên nhộn nhịp. Nhưng hơi ồn ào một chút."
      }
    }
  },
  {
    "id": "QA-L4-P2-04",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "Bさんの まちは どんなところ／どんなまちですか。",
    "questionFurigana": "Bさんの まちは どんなところ／どんなまちですか。",
    "questionVietnamese": "Thành phố của bạn là một nơi / thành phố như thế nào?",
    "grammarPattern": "[Aい / Aな] ところ／まちです。",
    "keywords": [
      "どんなところ",
      "どんなまち",
      "きれい",
      "にぎやか",
      "しずか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "きれいな まちです。",
        "reading": "きれいな まちです。",
        "vietnamese": "Là một thành phố đẹp."
      },
      "level2_polite": {
        "japanese": "うみが きれいで、しずかな まちです。",
        "reading": "うみが きれいで、しずかな まちです。",
        "vietnamese": "Biển đẹp và là thành phố yên bình."
      },
      "level3_expanded": {
        "japanese": "きれいな まちです。食べ物も おいしくて、ひとが とても 親切です。",
        "reading": "きれいな まちです。たべものも おいしくて、ひとが とても しんせつです。",
        "vietnamese": "Là một thành phố đẹp. Đồ ăn lại ngon và con người rất thân thiện."
      }
    }
  },
  {
    "id": "QA-L4-P2-05",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "フォーは どんなりょうりですか。",
    "questionFurigana": "フォーは どんなりょうりですか。",
    "questionVietnamese": "Phở là món ăn như thế nào?",
    "grammarPattern": "Nの りょうりです。 / Aいです。",
    "keywords": [
      "フォー",
      "ベトナム",
      "おいしい",
      "ゆうめい",
      "りょうり"
    ],
    "answers": {
      "level1_short": {
        "japanese": "おいしい 料理です。",
        "reading": "おいしい りょうりです。",
        "vietnamese": "Món ăn ngon."
      },
      "level2_polite": {
        "japanese": "フォーは ベトナムの ゆうめいな 料理です。",
        "reading": "フォーは ベトナムの ゆうめいな りょうりです。",
        "vietnamese": "Phở là món ăn nổi tiếng của Việt Nam."
      },
      "level3_expanded": {
        "japanese": "スープが おいしくて、からだに いい 料理です。とても 人気があります。",
        "reading": "スープが おいしくて、からだに いい りょうりです。とても にんきがあります。",
        "vietnamese": "Nước dùng ngon và là món ăn tốt cho sức khỏe. Món này rất được ưa chuộng."
      }
    }
  },
  {
    "id": "QA-L4-P2-06",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "FPTは どんなだいがくですか。",
    "questionFurigana": "FPTは どんなだいがくですか。",
    "questionVietnamese": "FPT là trường đại học như thế nào?",
    "grammarPattern": "[Aい / Aな] 大学です。",
    "keywords": [
      "FPT",
      "だいがく",
      "おおきい",
      "あたらしい",
      "ゆうめい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "大きい 大学です。",
        "reading": "おおきい だいがくです。",
        "vietnamese": "Trường đại học lớn."
      },
      "level2_polite": {
        "japanese": "FPTは 新しくて、きれいな 大学です。",
        "reading": "FPTは あたらしくて、きれいな だいがくです。",
        "vietnamese": "FPT là trường đại học mới và đẹp."
      },
      "level3_expanded": {
        "japanese": "テクノロジーが ゆうめいで、学生が たくさん いる 大学です。",
        "reading": "テクノロジーが ゆうめいで、がくせいが たくさん いる だいがくです。",
        "vietnamese": "Là trường nổi tiếng về công nghệ và có rất đông sinh viên."
      }
    }
  },
  {
    "id": "QA-L4-P2-07",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "Bさんの まちに なにが ありますか。",
    "questionFurigana": "Bさんの まちに なにが ありますか。",
    "questionVietnamese": "Ở thành phố của bạn có cái gì?",
    "grammarPattern": "Nや Nなどが あります。",
    "keywords": [
      "まち",
      "うみ",
      "やま",
      "おてら",
      "あります"
    ],
    "answers": {
      "level1_short": {
        "japanese": "海が あります。",
        "reading": "うみが あります。",
        "vietnamese": "Có biển."
      },
      "level2_polite": {
        "japanese": "海や 山が あります。",
        "reading": "うみや やまが あります。",
        "vietnamese": "Có biển và núi."
      },
      "level3_expanded": {
        "japanese": "きれいな 海や 有名な お寺が あります。観光客も たくさん 来ます。",
        "reading": "きれいな うみや ゆうめいな おてらが あります。かんこうきゃくも たくさん きます。",
        "vietnamese": "Có bãi biển đẹp và những ngôi chùa nổi tiếng. Khách du lịch cũng đến rất đông."
      }
    }
  },
  {
    "id": "QA-L4-P2-08",
    "lesson": 4,
    "part": 2,
    "partTitle": "Phần 2: Miêu tả thành phố & Nơi đó có gì",
    "hasImage": false,
    "questionJapanese": "Bさんの まちに おてらが ありますか。",
    "questionFurigana": "Bさんの まちに おてらが ありますか。",
    "questionVietnamese": "Ở thành phố của bạn có chùa không?",
    "grammarPattern": "はい、あります。 / いいえ、ありません。",
    "keywords": [
      "まち",
      "おてら",
      "あります",
      "ありません"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、あります。",
        "reading": "はい、あります。",
        "vietnamese": "Vâng, có ạ."
      },
      "level2_polite": {
        "japanese": "はい、有名な お寺が あります。",
        "reading": "はい、ゆうめいな おてらが あります。",
        "vietnamese": "Vâng, có ngôi chùa nổi tiếng."
      },
      "level3_expanded": {
        "japanese": "はい、古い お寺が たくさん あります。とても 静かで きれいです。",
        "reading": "はい、ふるい おてらが たくさん あります。とても しずかで きれいです。",
        "vietnamese": "Vâng, có nhiều ngôi chùa cổ. Nơi đó rất yên tĩnh và thanh tịnh."
      }
    }
  },
  {
    "id": "QA-L4-P3-01",
    "lesson": 4,
    "part": 3,
    "partTitle": "Phần 3: Thời tiết & Cảm nhận món ăn",
    "hasImage": false,
    "questionJapanese": "Bさんのくには ８月、あついですか。",
    "questionFurigana": "Bさんのくには はちがつ、あついですか。",
    "questionVietnamese": "Đất nước của bạn vào tháng 8 có nóng không?",
    "grammarPattern": "はい、あついです。 / いいえ、あつくないです。",
    "keywords": [
      "くに",
      "はちがつ",
      "あつい",
      "すずしい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、暑いです。",
        "reading": "はい、あついです。",
        "vietnamese": "Vâng, nóng ạ."
      },
      "level2_polite": {
        "japanese": "はい、8月は とても 暑いです。",
        "reading": "はい、はちがつは とても あついです。",
        "vietnamese": "Vâng, tháng 8 rất là nóng."
      },
      "level3_expanded": {
        "japanese": "はい、毎日 とても 暑いです。雨も よく 降ります。",
        "reading": "はい、まいにち とても あついです。あめも よく ふります。",
        "vietnamese": "Vâng, ngày nào cũng rất nóng. Trời cũng hay mưa nữa."
      }
    }
  },
  {
    "id": "QA-L4-P3-02",
    "lesson": 4,
    "part": 3,
    "partTitle": "Phần 3: Thời tiết & Cảm nhận món ăn",
    "hasImage": false,
    "questionJapanese": "ベトナムは １２月、どうですか。",
    "questionFurigana": "ベトナムは じゅうにがつ、どうですか。",
    "questionVietnamese": "Việt Nam vào tháng 12 thì thế nào?",
    "grammarPattern": "すずしいです。 / さむいです。 / あたたかいです。",
    "keywords": [
      "ベトナム",
      "じゅうにがつ",
      "どうですか",
      "すずしい",
      "さむい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "涼しいです。",
        "reading": "すずしいです。",
        "vietnamese": "Mát mẻ ạ."
      },
      "level2_polite": {
        "japanese": "ベトナムの 12月は 涼しいです。",
        "reading": "ベトナムの じゅうにがつは すずしいです。",
        "vietnamese": "Tháng 12 ở Việt Nam thời tiết mát mẻ."
      },
      "level3_expanded": {
        "japanese": "きたは 寒いです。でも、みなみは あたたかいです。",
        "reading": "きたは さむいです。でも、みなみは あたたかいです。",
        "vietnamese": "Miền Bắc thì lạnh. Nhưng miền Nam thì ấm áp."
      }
    }
  },
  {
    "id": "QA-L4-P3-03",
    "lesson": 4,
    "part": 3,
    "partTitle": "Phần 3: Thời tiết & Cảm nhận món ăn",
    "hasImage": false,
    "questionJapanese": "日本は ふゆ、どうですか。",
    "questionFurigana": "にほんは ふゆ、どうですか。",
    "questionVietnamese": "Nhật Bản vào mùa đông thì thế nào?",
    "grammarPattern": "とても さむいです。 / ゆきが ふります。",
    "keywords": [
      "にほん",
      "ふゆ",
      "さむい",
      "ゆき",
      "どうですか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "寒いです。",
        "reading": "さむいです。",
        "vietnamese": "Lạnh ạ."
      },
      "level2_polite": {
        "japanese": "日本の 冬は とても 寒いです。",
        "reading": "にほんの ふゆは とても さむいです。",
        "vietnamese": "Mùa đông ở Nhật Bản rất lạnh."
      },
      "level3_expanded": {
        "japanese": "とても 寒いです。雪が 降って、きれいです。",
        "reading": "とても さむいです。ゆきが ふって、きれいです。",
        "vietnamese": "Rất lạnh. Có tuyết rơi nhìn rất đẹp."
      }
    }
  },
  {
    "id": "QA-L4-P3-04",
    "lesson": 4,
    "part": 3,
    "partTitle": "Phần 3: Thời tiết & Cảm nhận món ăn",
    "hasImage": false,
    "questionJapanese": "日本のりょうりは どうですか。",
    "questionFurigana": "にほんのりょうりは どうですか。",
    "questionVietnamese": "Món ăn Nhật Bản thì thế nào?",
    "grammarPattern": "おいしいですが、たかいです。 / すきです。",
    "keywords": [
      "にほん",
      "りょうり",
      "おいしい",
      "たかい",
      "すき"
    ],
    "answers": {
      "level1_short": {
        "japanese": "おいしいです。",
        "reading": "おいしいです。",
        "vietnamese": "Ngon ạ."
      },
      "level2_polite": {
        "japanese": "日本の 料理は おいしいですが、少し 高いです。",
        "reading": "にほんの りょうりは おいしいですが、すこし たかいです。",
        "vietnamese": "Món ăn Nhật ngon nhưng hơi đắt một chút."
      },
      "level3_expanded": {
        "japanese": "とても おいしいです。私は ラーメンや すしが 大好きです。",
        "reading": "とても おいしいです。わたしは ラーメンや すしが だいすきです。",
        "vietnamese": "Rất ngon miệng. Tôi thích nhất là món mì ramen và sushi."
      }
    }
  },
  {
    "id": "QA-IMG-L4-01",
    "lesson": 4,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bản đồ Tokyo - Seoul",
    "hasImage": true,
    "imageType": "map",
    "imageDescription": "Bản đồ tuyến bay Tokyo ✈️ Seoul (thời gian bay 2 tiếng rưỡi)",
    "questionJapanese": "東京から ソウルまで 何でいきますか。",
    "questionFurigana": "とうきょうから ソウルまで なんでいきますか。",
    "questionVietnamese": "Từ Tokyo đến Seoul đi bằng phương tiện gì?",
    "grammarPattern": "ひこうきで いきます。",
    "keywords": [
      "ひこうき",
      "いきます"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ひこうきです。",
        "reading": "ひこうきです。",
        "vietnamese": "Bằng máy bay."
      },
      "level2_polite": {
        "japanese": "ひこうきで 行きます。",
        "reading": "ひこうきで いきます。",
        "vietnamese": "Đi bằng máy bay."
      },
      "level3_expanded": {
        "japanese": "東京から ソウルまで ひこうきで 行きます。とても はやいです。",
        "reading": "とうきょうから ソウルまで ひこうきで いきます。とても はやいです。",
        "vietnamese": "Từ Tokyo đến Seoul đi bằng máy bay. Rất là nhanh."
      }
    }
  },
  {
    "id": "QA-IMG-L4-02",
    "lesson": 4,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bản đồ Tokyo - Seoul",
    "hasImage": true,
    "imageType": "map",
    "imageDescription": "Bản đồ tuyến bay Tokyo ✈️ Seoul (thời gian bay 2 tiếng rưỡi)",
    "questionJapanese": "東京から ソウルまで どのくらいですか。",
    "questionFurigana": "とうきょうから ソウルまで どのくらいですか。",
    "questionVietnamese": "Từ Tokyo đến Seoul mất khoảng bao lâu?",
    "grammarPattern": "二時間半くらいです。",
    "keywords": [
      "にじかんはん",
      "くらい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "二時間半くらいです。",
        "reading": "にじかんはんくらいです。",
        "vietnamese": "Khoảng 2 tiếng rưỡi."
      },
      "level2_polite": {
        "japanese": "東京から ソウルまで ひこうきで 二時間半くらいです。",
        "reading": "とうきょうから ソウルまで ひこうきで にじかんはんくらいです。",
        "vietnamese": "Từ Tokyo đến Seoul đi máy bay mất khoảng 2 tiếng rưỡi."
      },
      "level3_expanded": {
        "japanese": "ひこうきで 二時間半くらいです。あまり とおいところでは ありません。",
        "reading": "ひこうきで にじかんはんくらいです。あまり とおいところでは ありません。",
        "vietnamese": "Đi máy bay khoảng 2 tiếng rưỡi. Không phải là nơi quá xa."
      }
    }
  },
  {
    "id": "QA-IMG-L4-03",
    "lesson": 4,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bản đồ Seoul - Daegu",
    "hasImage": true,
    "imageType": "map",
    "imageDescription": "Bản đồ tuyến tàu điện Seoul 🚆 Daegu (mất 1 tiếng 40 phút / 3 tiếng rưỡi xe khách)",
    "questionJapanese": "ソウルから デグまで でんしゃで どのくらいですか。",
    "questionFurigana": "ソウルから デグまで でんしゃで どのくらいですか。",
    "questionVietnamese": "Từ Seoul đến Daegu đi bằng tàu điện mất khoảng bao lâu?",
    "grammarPattern": "一時間四十分／三時間半くらいです。",
    "keywords": [
      "でんしゃ",
      "いちじかん",
      "さんじかんはん"
    ],
    "answers": {
      "level1_short": {
        "japanese": "一時間四十分くらいです。",
        "reading": "いちじかんよんじゅっぷんくらいです。",
        "vietnamese": "Khoảng 1 tiếng 40 phút."
      },
      "level2_polite": {
        "japanese": "ソウルから デグまで 電車で 一時間四十分くらいです。",
        "reading": "ソウルから デグまで でんしゃで いちじかんよんじゅっぷんくらいです。",
        "vietnamese": "Từ Seoul đến Daegu đi tàu điện mất khoảng 1 tiếng 40 phút."
      },
      "level3_expanded": {
        "japanese": "電車で 一時間四十分くらいです。バスなら 三時間半くらい かかります。",
        "reading": "でんしゃで いちじかんよんじゅっぷんくらいです。バスなら さんじかんはんくらい かかります。",
        "vietnamese": "Đi tàu điện mất 1 tiếng 40 phút. Nếu đi xe buýt thì mất khoảng 3 tiếng rưỡi."
      }
    }
  },
  {
    "id": "QA-IMG-L4-04",
    "lesson": 4,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bản đồ Đà Nẵng - TP.HCM",
    "hasImage": true,
    "imageType": "map",
    "imageDescription": "Bản đồ tuyến đường Đà Nẵng đến TP.HCM (xe buýt hoặc máy bay)",
    "questionJapanese": "ダナンから ホーチミンまで なんで いきますか。",
    "questionFurigana": "ダナンから ホーチミンまで なんで いきますか。",
    "questionVietnamese": "Từ Đà Nẵng đến TP.HCM bạn đi bằng phương tiện gì?",
    "grammarPattern": "ひこうき／バスで いきます。",
    "keywords": [
      "ひこうき",
      "バス",
      "いきます"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ひこうきで 行きます。",
        "reading": "ひこうきで いきます。",
        "vietnamese": "Đi máy bay."
      },
      "level2_polite": {
        "japanese": "ダナンから ホーチミンまで ひこうきで 行きます。",
        "reading": "ダナンから ホーチミンまで ひこうきで いきます。",
        "vietnamese": "Từ Đà Nẵng đến TP.HCM tôi đi bằng máy bay."
      },
      "level3_expanded": {
        "japanese": "ひこうきで いきます。バスでも いけますが、じかんが かかります。",
        "reading": "ひこうきで いきます。バスでも いけますが、じかんが かかります。",
        "vietnamese": "Tôi đi bằng máy bay. Đi xe khách cũng được nhưng tốn nhiều thời gian."
      }
    }
  },
  {
    "id": "QA-IMG-L4-05",
    "lesson": 4,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bản đồ Đà Nẵng - TP.HCM",
    "hasImage": true,
    "imageType": "map",
    "imageDescription": "Bản đồ xe buýt đường dài Đà Nẵng - TP.HCM (khoảng 20 tiếng)",
    "questionJapanese": "ダナンから ホーチミンまで バスで どのくらいですか。",
    "questionFurigana": "ダナンから ホーチミンまで バスで どのくらいですか。",
    "questionVietnamese": "Từ Đà Nẵng đến TP.HCM đi xe buýt mất khoảng bao lâu?",
    "grammarPattern": "二十時間くらいです。",
    "keywords": [
      "にじゅうじかん",
      "くらい",
      "バス"
    ],
    "answers": {
      "level1_short": {
        "japanese": "二十時間くらいです。",
        "reading": "にじゅうじかんくらいです。",
        "vietnamese": "Khoảng 20 tiếng."
      },
      "level2_polite": {
        "japanese": "ダナンから ホーチミンまで バスで 二十時間くらいです。",
        "reading": "ダナンから ホーチミンまで バスで にじゅうじかんくらいです。",
        "vietnamese": "Từ Đà Nẵng đến TP.HCM đi xe buýt mất khoảng 20 tiếng."
      },
      "level3_expanded": {
        "japanese": "バスで 二十時間くらい かかります。とても ながいですから、たいへんです。",
        "reading": "バスで にじゅうじかんくらい かかります。とても ながいですから、たいへんです。",
        "vietnamese": "Đi xe khách mất khoảng 20 tiếng. Quãng đường rất dài nên khá mệt."
      }
    }
  },
  {
    "id": "QA-IMG-L4-06",
    "lesson": 4,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Căn nhà / Phòng khách",
    "hasImage": true,
    "imageType": "room",
    "imageDescription": "Tranh căn phòng khách có bàn (つくえ), ghế (いす), tivi (テレビ), mèo (ねこ)",
    "questionJapanese": "いえに 何が ありますか。",
    "questionFurigana": "いえに なにが ありますか。",
    "questionVietnamese": "Trong nhà có những đồ vật gì?",
    "grammarPattern": "テレビや つくえなどが あります。",
    "keywords": [
      "テレビ",
      "つくえ",
      "いす",
      "あります"
    ],
    "answers": {
      "level1_short": {
        "japanese": "テレビが あります。",
        "reading": "テレビが あります。",
        "vietnamese": "Có tivi."
      },
      "level2_polite": {
        "japanese": "家に テレビや 机が あります。",
        "reading": "いえに テレビや つくえが あります。",
        "vietnamese": "Trong nhà có tivi và bàn."
      },
      "level3_expanded": {
        "japanese": "大きい テレビや テーブルが あります。ねこも います。",
        "reading": "おおきい テレビや テーブルが あります。ねこも います。",
        "vietnamese": "Có tivi lớn và bàn ăn. Còn có cả chú mèo nữa."
      }
    }
  },
  {
    "id": "QA-IMG-L4-07",
    "lesson": 4,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Thời tiết tháng 12",
    "hasImage": true,
    "imageType": "weather",
    "imageDescription": "Tranh phong cảnh mùa đông tuyết rơi vào tháng 12",
    "questionJapanese": "ここは １２月、どうですか。",
    "questionFurigana": "ここは じゅうにがつ、どうですか。",
    "questionVietnamese": "Nơi này vào tháng 12 thì như thế nào?",
    "grammarPattern": "とても さむいです。 / ゆきが ふります。",
    "keywords": [
      "さむい",
      "ゆき",
      "じゅうにがつ"
    ],
    "answers": {
      "level1_short": {
        "japanese": "寒いです。",
        "reading": "さむいです。",
        "vietnamese": "Lạnh ạ."
      },
      "level2_polite": {
        "japanese": "ここは 12月、とても 寒いです。",
        "reading": "ここは じゅうにがつ、とても さむいです。",
        "vietnamese": "Nơi này vào tháng 12 rất lạnh."
      },
      "level3_expanded": {
        "japanese": "とても 寒いです。雪が たくさん 降りますから、しろいです。",
        "reading": "とても さむいです。ゆきが たくさん ふりますから、しろいです。",
        "vietnamese": "Rất lạnh. Vì tuyết rơi nhiều nên khắp nơi trắng xóa."
      }
    }
  },
  {
    "id": "QA-IMG-L4-08",
    "lesson": 4,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Món ăn",
    "hasImage": true,
    "imageType": "food",
    "imageDescription": "Tranh tô phở bò nghi ngút khói thơm ngon",
    "questionJapanese": "このりょうりは どうですか。",
    "questionFurigana": "このりょうりは どうですか。",
    "questionVietnamese": "Món ăn này thì thế nào?",
    "grammarPattern": "とても おいしいです。 / すこし からいです。",
    "keywords": [
      "おいしい",
      "からい",
      "あつい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "おいしいです。",
        "reading": "おいしいです。",
        "vietnamese": "Ngon ạ."
      },
      "level2_polite": {
        "japanese": "この 料理は とても おいしいです。",
        "reading": "この りょうりは とても おいしいです。",
        "vietnamese": "Món ăn này rất ngon."
      },
      "level3_expanded": {
        "japanese": "あつくて、とても おいしいです。すこし からいですが、すきです。",
        "reading": "あつくて、とても おいしいです。すこし からいですが、すきです。",
        "vietnamese": "Nóng hổi và rất ngon. Hơi cay một chút nhưng tôi rất thích."
      }
    }
  },
  {
    "id": "QA-L5-P1-01",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "日曜日、なにを しましたか。",
    "questionFurigana": "にちようび、なにを しましたか。",
    "questionVietnamese": "Chủ nhật bạn đã làm gì?",
    "grammarPattern": "〜ました / 〜へ いきました",
    "keywords": [
      "にちようび",
      "なに",
      "しました"
    ],
    "answers": {
      "level1_short": {
        "japanese": "買い物を しました。",
        "reading": "かいものを しました。",
        "vietnamese": "Đã đi mua sắm."
      },
      "level2_polite": {
        "japanese": "日曜日、友達と 買い物を しました。",
        "reading": "にちようび、ともだちと かいものを しました。",
        "vietnamese": "Chủ nhật tôi đã đi mua sắm cùng bạn."
      },
      "level3_expanded": {
        "japanese": "友達と スーパーへ 行って、買い物を しました。とても 楽しかったです。",
        "reading": "ともだちと スーパーへ いって、かいものを しました。とても たのしかったです。",
        "vietnamese": "Tôi đã đi siêu thị cùng bạn và mua sắm. Rất vui vẻ."
      }
    }
  },
  {
    "id": "QA-L5-P1-02",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "スーパーで なにを しましたか。",
    "questionFurigana": "スーパーで なにを しましたか。",
    "questionVietnamese": "Ở siêu thị bạn đã làm gì?",
    "grammarPattern": "[Đồ vật]を かいました。",
    "keywords": [
      "スーパー",
      "なに",
      "かいました"
    ],
    "answers": {
      "level1_short": {
        "japanese": "食べ物を 買いました。",
        "reading": "たべものを かいました。",
        "vietnamese": "Đã mua đồ ăn."
      },
      "level2_polite": {
        "japanese": "スーパーで 野菜や 肉を 買いました。",
        "reading": "スーパーで やさいや にくを かいました。",
        "vietnamese": "Tôi đã mua rau và thịt ở siêu thị."
      },
      "level3_expanded": {
        "japanese": "晩ごはんの 材料を 買いました。パンや ジュースも 買いました。",
        "reading": "ばんごはんの ざいりょうを かいました。パンや ジュースも かいました。",
        "vietnamese": "Tôi đã mua nguyên liệu làm bữa tối. Cả bánh mì và nước trái cây nữa."
      }
    }
  },
  {
    "id": "QA-L5-P1-03",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "きのう、どこで べんきょうしましたか。",
    "questionFurigana": "きのう、どこで べんきょうしましたか。",
    "questionVietnamese": "Hôm qua bạn đã học bài ở đâu?",
    "grammarPattern": "[Địa điểm]で べんきょうしました。",
    "keywords": [
      "きのう",
      "どこで",
      "としょかん",
      "うち"
    ],
    "answers": {
      "level1_short": {
        "japanese": "うちで しました。",
        "reading": "うちで しました。",
        "vietnamese": "Ở nhà ạ."
      },
      "level2_polite": {
        "japanese": "きのう、図書館で 勉強しました。",
        "reading": "きのう、としょかんで べんきょうしました。",
        "vietnamese": "Hôm qua tôi đã học ở thư viện."
      },
      "level3_expanded": {
        "japanese": "大学の 図書館で 勉強しました。静かで、集中できました。",
        "reading": "だいがくの としょかんで べんきょうしました。しずかで、しゅうちゅうできました。",
        "vietnamese": "Tôi học ở thư viện trường đại học. Rất yên tĩnh và tập trung."
      }
    }
  },
  {
    "id": "QA-L5-P1-04",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "せんしゅう、だれと たべましたか。",
    "questionFurigana": "せんしゅう、だれと たべましたか。",
    "questionVietnamese": "Tuần trước bạn đã đi ăn với ai?",
    "grammarPattern": "[Người]と たべました。",
    "keywords": [
      "せんしゅう",
      "だれと",
      "ともだち",
      "かぞく"
    ],
    "answers": {
      "level1_short": {
        "japanese": "友達と 食べました。",
        "reading": "ともだちと たべました。",
        "vietnamese": "Ăn cùng bạn bè."
      },
      "level2_polite": {
        "japanese": "先週、大学の 友達と 食べました。",
        "reading": "せんしゅう、だいがくの ともだちと たべました。",
        "vietnamese": "Tuần trước tôi đã ăn cùng bạn đại học."
      },
      "level3_expanded": {
        "japanese": "ルームメイトと レストランで 食べました。とても おいしかったです。",
        "reading": "ルームメイトと レストランで たべました。とても おいしかったです。",
        "vietnamese": "Tôi đã ăn ở nhà hàng cùng bạn cùng phòng. Món ăn rất ngon."
      }
    }
  },
  {
    "id": "QA-L5-P1-05",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "きのう、どこへ いきましたか。",
    "questionFurigana": "きのう、どこへ いきましたか。",
    "questionVietnamese": "Hôm qua bạn đã đi đâu?",
    "grammarPattern": "[Địa điểm]へ いきました。 / どこへも いきませんでした。",
    "keywords": [
      "きのう",
      "どこへ",
      "いきました"
    ],
    "answers": {
      "level1_short": {
        "japanese": "学校へ 行きました。",
        "reading": "がっこうへ いきました。",
        "vietnamese": "Đã đi học."
      },
      "level2_polite": {
        "japanese": "きのう、公園へ 行きました。",
        "reading": "きのう、こうえんへ いきました。",
        "vietnamese": "Hôm qua tôi đã đến công viên."
      },
      "level3_expanded": {
        "japanese": "どこへも 行きませんでした。家で ゆっくり 休みました。",
        "reading": "どこへも いきませんでした。いえで ゆっくり やすみました。",
        "vietnamese": "Tôi không đi đâu cả. Tôi nghỉ ngơi thong thả ở nhà."
      }
    }
  },
  {
    "id": "QA-L5-P1-06",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "きのう、どこか へ いきましたか。",
    "questionFurigana": "きのう、どこか へ いきましたか。",
    "questionVietnamese": "Hôm qua bạn có đi đâu đó không?",
    "grammarPattern": "はい、〜へ いきました。 / いいえ、どこへも いきませんでした。",
    "keywords": [
      "どこかへ",
      "いきましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、行きました。",
        "reading": "はい、いきました。",
        "vietnamese": "Có, tôi có đi."
      },
      "level2_polite": {
        "japanese": "はい、スーパーへ 行きました。",
        "reading": "はい、スーパーへ いきました。",
        "vietnamese": "Có, tôi đã đi siêu thị."
      },
      "level3_expanded": {
        "japanese": "いいえ、どこへも 行きませんでした。家で インターネットを しました。",
        "reading": "いいえ、どこへも いきませんでした。いえで インターネットを しました。",
        "vietnamese": "Không, tôi không đi đâu cả. Tôi lướt mạng ở nhà."
      }
    }
  },
  {
    "id": "QA-L5-P1-07",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "きのうの ばん、べんきょうしましたか。",
    "questionFurigana": "きのうの ばん、べんきょうしましたか。",
    "questionVietnamese": "Tối hôm qua bạn có học bài không?",
    "grammarPattern": "はい、べんきょうしました。 / いいえ、しませんでした。",
    "keywords": [
      "きのうのばん",
      "べんきょうしましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、しました。",
        "reading": "はい、しました。",
        "vietnamese": "Vâng, có ạ."
      },
      "level2_polite": {
        "japanese": "はい、日本語を 勉強しました。",
        "reading": "はい、にほんごを べんきょうしました。",
        "vietnamese": "Vâng, tôi đã học tiếng Nhật."
      },
      "level3_expanded": {
        "japanese": "はい、二時間くらい 勉強しました。来週 テストが ありますから。",
        "reading": "はい、にじかんくらい べんきょうしました。らいしゅう テストが ありますから。",
        "vietnamese": "Vâng, tôi học khoảng 2 tiếng vì tuần sau có bài kiểm tra."
      }
    }
  },
  {
    "id": "QA-L5-P1-08",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "しゅうまつ、うちで おんがくを ききましたか。",
    "questionFurigana": "しゅうまつ、うちで おんがくを ききましたか。",
    "questionVietnamese": "Cuối tuần bạn có nghe nhạc ở nhà không?",
    "grammarPattern": "はい、ききました。 / いいえ、ききませんでした。",
    "keywords": [
      "しゅうまつ",
      "おんがく",
      "ききましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、聞きました。",
        "reading": "はい、ききました。",
        "vietnamese": "Có ạ."
      },
      "level2_polite": {
        "japanese": "はい、うちで 音楽を 聞きました。",
        "reading": "はい、うちで おんがくを ききました。",
        "vietnamese": "Có, tôi đã nghe nhạc ở nhà."
      },
      "level3_expanded": {
        "japanese": "はい、日本の 音楽を たくさん 聞きました。とても リラックスできました。",
        "reading": "はい、にほんの おんがくを たくさん ききました。とても リラックスできました。",
        "vietnamese": "Có, tôi nghe rất nhiều nhạc Nhật Bản. Rất thư giãn."
      }
    }
  },
  {
    "id": "QA-L5-P1-09",
    "lesson": 5,
    "part": 1,
    "partTitle": "Phần 1: Những việc đã làm vào ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "おととい、ともだちと サッカーを しましたか。",
    "questionFurigana": "おととい、ともだちと サッカーを しましたか。",
    "questionVietnamese": "Hôm kia bạn có đá bóng với bạn không?",
    "grammarPattern": "はい、しました。 / いいえ、しませんでした。",
    "keywords": [
      "おととい",
      "サッカー",
      "しましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、しました。",
        "reading": "はい、しました。",
        "vietnamese": "Có ạ."
      },
      "level2_polite": {
        "japanese": "いいえ、サッカーは しませんでした。",
        "reading": "いいえ、サッカーは しませんでした。",
        "vietnamese": "Không, tôi không đá bóng."
      },
      "level3_expanded": {
        "japanese": "はい、学校の グラウンドで サッカーを しました。疲れましたが、楽しかったです。",
        "reading": "はい、がっこうの グラウンドで サッカーを しました。つかれましたが、たのしかったです。",
        "vietnamese": "Có, chúng tôi đá bóng ở sân trường. Dù mệt nhưng rất vui."
      }
    }
  },
  {
    "id": "QA-L5-P2-01",
    "lesson": 5,
    "part": 2,
    "partTitle": "Phần 2: Cảm nhận về ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "テスト／りょこう／日本りょうりは どうでしたか。",
    "questionFurigana": "テスト／りょこう／にほんりょうりは どうでしたか。",
    "questionVietnamese": "Bài thi / Chuyến du lịch / Món ăn Nhật thì như thế nào (trong quá khứ)?",
    "grammarPattern": "〜かったです / 〜でした",
    "keywords": [
      "どうでしたか",
      "たのしかった",
      "たいへん",
      "おいしかった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "楽しかったです。",
        "reading": "たのしかったです。",
        "vietnamese": "Rất vui."
      },
      "level2_polite": {
        "japanese": "旅行は とても 楽しかったです。",
        "reading": "りょこうは とても たのしかったです。",
        "vietnamese": "Chuyến du lịch đã rất là vui."
      },
      "level3_expanded": {
        "japanese": "テストは 少し 難しかったですが、おもしろかったです。",
        "reading": "テストは すこし むずかしかったですが、おもしろかったです。",
        "vietnamese": "Bài thi hơi khó một chút nhưng rất thú vị."
      }
    }
  },
  {
    "id": "QA-L5-P2-02",
    "lesson": 5,
    "part": 2,
    "partTitle": "Phần 2: Cảm nhận về ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "えいがは おもしろかったですか。",
    "questionFurigana": "えいがは おもしろかったですか。",
    "questionVietnamese": "Bộ phim có hay / thú vị không?",
    "grammarPattern": "はい、おもしろかったです。 / いいえ、おもしろくなかったです。",
    "keywords": [
      "えいが",
      "おもしろかった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、面白かったです。",
        "reading": "はい、おもしろかったです。",
        "vietnamese": "Vâng, hay lắm."
      },
      "level2_polite": {
        "japanese": "はい、とても 面白かったです。",
        "reading": "はい、とても おもしろかったです。",
        "vietnamese": "Vâng, rất thú vị."
      },
      "level3_expanded": {
        "japanese": "はい、とても 面白かったです。また 見たいと 思います。",
        "reading": "はい、とても おもしろかったです。また みたいと おもいます。",
        "vietnamese": "Vâng, rất hay. Tôi nghĩ mình muốn xem lại lần nữa."
      }
    }
  },
  {
    "id": "QA-L5-P2-03",
    "lesson": 5,
    "part": 2,
    "partTitle": "Phần 2: Cảm nhận về ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "きのうは いそがしかったですか。",
    "questionFurigana": "きのうは いそがしかったですか。",
    "questionVietnamese": "Hôm qua bạn có bận rộn không?",
    "grammarPattern": "はい、いそがしかったです。 / いいえ、ひまでした。",
    "keywords": [
      "きのう",
      "いそがしかった",
      "ひま"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、忙しかったです。",
        "reading": "はい、いそがしかったです。",
        "vietnamese": "Vâng, bận lắm."
      },
      "level2_polite": {
        "japanese": "いいえ、暇でした。",
        "reading": "いいえ、ひまでした。",
        "vietnamese": "Không, tôi rảnh rỗi."
      },
      "level3_expanded": {
        "japanese": "はい、アルバイトが ありましたから、とても 忙しかったです。",
        "reading": "はい、アルバイトが ありましたから、とても いそがしかったです。",
        "vietnamese": "Vâng, vì có ca làm thêm nên tôi rất bận rộn."
      }
    }
  },
  {
    "id": "QA-L5-P2-04",
    "lesson": 5,
    "part": 2,
    "partTitle": "Phần 2: Cảm nhận về ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "アルバイトは たいへんでしたか。",
    "questionFurigana": "アルバイトは たいへんでしたか。",
    "questionVietnamese": "Công việc làm thêm có vất vả không?",
    "grammarPattern": "はい、たいへんでした。 / いいえ、たいへんじゃありませんでした。",
    "keywords": [
      "アルバイト",
      "たいへん"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、大変でした。",
        "reading": "はい、たいへんでした。",
        "vietnamese": "Vâng, vất vả ạ."
      },
      "level2_polite": {
        "japanese": "はい、少し 大変でした。",
        "reading": "はい、すこし たいへんでした。",
        "vietnamese": "Vâng, hơi vất vả một chút."
      },
      "level3_expanded": {
        "japanese": "大変でしたが、みんな 親切で 楽しかったです。",
        "reading": "たいへんでしたが、みんな しんせつで たのしかったです。",
        "vietnamese": "Tuy vất vả nhưng mọi người đều tốt bụng và rất vui."
      }
    }
  },
  {
    "id": "QA-L5-P2-05",
    "lesson": 5,
    "part": 2,
    "partTitle": "Phần 2: Cảm nhận về ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "せんしゅうの パーティーは たのしかったですか。",
    "questionFurigana": "せんしゅうの パーティーは たのしかったですか。",
    "questionVietnamese": "Bữa tiệc tuần trước có vui không?",
    "grammarPattern": "はい、たのしかったです。 / いいえ、たのしくなかったです。",
    "keywords": [
      "せんしゅう",
      "パーティー",
      "たのしかった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、楽しかったです。",
        "reading": "はい、たのしかったです。",
        "vietnamese": "Vâng, vui lắm ạ."
      },
      "level2_polite": {
        "japanese": "はい、パーティーは とても 楽しかったです。",
        "reading": "はい、パーティーは とても たのしかったです。",
        "vietnamese": "Vâng, bữa tiệc đã rất vui vẻ."
      },
      "level3_expanded": {
        "japanese": "はい、人が 多くて にぎやかで、とても 楽しかったです。",
        "reading": "はい、ひとが おおくて にぎやかで、とても たのしかったです。",
        "vietnamese": "Vâng, rất đông người và nhộn nhịp, thật sự rất vui."
      }
    }
  },
  {
    "id": "QA-L5-P3-01",
    "lesson": 5,
    "part": 3,
    "partTitle": "Phần 3: Sở thích & Mong muốn",
    "hasImage": false,
    "questionJapanese": "Bさんは なにが ほしいですか。",
    "questionFurigana": "Bさんは なにが ほしいですか。",
    "questionVietnamese": "Bạn muốn có cái gì?",
    "grammarPattern": "〜が ほしいです。",
    "keywords": [
      "なに",
      "ほしい",
      "くるま",
      "パソコン",
      "おかね"
    ],
    "answers": {
      "level1_short": {
        "japanese": "カメラが ほしいです。",
        "reading": "カメラが ほしいです。",
        "vietnamese": "Muốn có máy ảnh."
      },
      "level2_polite": {
        "japanese": "新しい パソコンが 欲しいです。",
        "reading": "あたらしい パソコンが ほしいです。",
        "vietnamese": "Tôi muốn có chiếc máy tính mới."
      },
      "level3_expanded": {
        "japanese": "車が 欲しいです。旅行に 行きたいですから。",
        "reading": "くるまが ほしいです。りょこうに いきたいですから。",
        "vietnamese": "Tôi muốn có ô tô, vì tôi muốn đi du lịch."
      }
    }
  },
  {
    "id": "QA-L5-P3-02",
    "lesson": 5,
    "part": 3,
    "partTitle": "Phần 3: Sở thích & Mong muốn",
    "hasImage": false,
    "questionJapanese": "Bさんは どこへ 行きたいですか。",
    "questionFurigana": "Bさんは どこへ いきたいですか。",
    "questionVietnamese": "Bạn muốn đi đâu?",
    "grammarPattern": "〜へ いきたいです。",
    "keywords": [
      "どこへ",
      "いきたい",
      "にほん",
      "とうきょう"
    ],
    "answers": {
      "level1_short": {
        "japanese": "日本へ 行きたいです。",
        "reading": "にほんへ いきたいです。",
        "vietnamese": "Muốn đi Nhật."
      },
      "level2_polite": {
        "japanese": "私は 日本の 東京へ 行きたいです。",
        "reading": "わたしは にほんの とうきょうへ いきたいです。",
        "vietnamese": "Tôi muốn đến Tokyo, Nhật Bản."
      },
      "level3_expanded": {
        "japanese": "富士山へ 行きたいです。山に のぼりたいですから。",
        "reading": "ふじさんへ いきたいです。やまに のぼりたいですから。",
        "vietnamese": "Tôi muốn đến núi Phú Sĩ, vì tôi muốn leo núi."
      }
    }
  },
  {
    "id": "QA-L5-P3-03",
    "lesson": 5,
    "part": 3,
    "partTitle": "Phần 3: Sở thích & Mong muốn",
    "hasImage": false,
    "questionJapanese": "だれに あいたいですか。",
    "questionFurigana": "だれに あいたいですか。",
    "questionVietnamese": "Bạn muốn gặp ai?",
    "grammarPattern": "〜に あいたいです。",
    "keywords": [
      "だれに",
      "あいたい",
      "かぞく",
      "ともだち"
    ],
    "answers": {
      "level1_short": {
        "japanese": "家族に 会いたいです。",
        "reading": "かぞくに あいたいです。",
        "vietnamese": "Muốn gặp gia đình."
      },
      "level2_polite": {
        "japanese": "国の 友達に 会いたいです。",
        "reading": "くにの ともだちに あいたいです。",
        "vietnamese": "Tôi muốn gặp bạn bè ở quê."
      },
      "level3_expanded": {
        "japanese": "両親に 会いたいです。長い間 会っていませんから。",
        "reading": "りょうしんに あいたいです。ながいあいだ あっていませんから。",
        "vietnamese": "Tôi muốn gặp bố mẹ vì đã lâu rồi chưa gặp."
      }
    }
  },
  {
    "id": "QA-L5-P3-04",
    "lesson": 5,
    "part": 3,
    "partTitle": "Phần 3: Sở thích & Mong muốn",
    "hasImage": false,
    "questionJapanese": "いま なにを したいですか。",
    "questionFurigana": "いま なにを したいですか。",
    "questionVietnamese": "Bây giờ bạn muốn làm gì?",
    "grammarPattern": "Vたいです。",
    "keywords": [
      "いま",
      "なにをしたい",
      "ねたい",
      "たべたい",
      "やすみたい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "休みたいです。",
        "reading": "やすみたいです。",
        "vietnamese": "Muốn nghỉ ngơi."
      },
      "level2_polite": {
        "japanese": "コーヒーを 飲みたいです。",
        "reading": "コーヒーを のみたいです。",
        "vietnamese": "Tôi muốn uống cà phê."
      },
      "level3_expanded": {
        "japanese": "少し 疲れたので、家へ 帰って 寝たいです。",
        "reading": "すこし つかれたので、いえへ かえって ねたいです。",
        "vietnamese": "Vì hơi mệt nên tôi muốn về nhà ngủ."
      }
    }
  },
  {
    "id": "QA-L5-P3-05",
    "lesson": 5,
    "part": 3,
    "partTitle": "Phần 3: Sở thích & Mong muốn",
    "hasImage": false,
    "questionJapanese": "いま なにが ほしいですか。",
    "questionFurigana": "いま なにが ほしいですか。",
    "questionVietnamese": "Bây giờ bạn muốn có cái gì?",
    "grammarPattern": "〜が ほしいです。 / なにも ほしくないです。",
    "keywords": [
      "いま",
      "なにがほしい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "時間が ほしいです。",
        "reading": "じかんが ほしいです。",
        "vietnamese": "Muốn có thời gian."
      },
      "level2_polite": {
        "japanese": "今は 何も 欲しくないです。",
        "reading": "いまは なにも ほしくないです。",
        "vietnamese": "Bây giờ tôi không muốn có thứ gì cả."
      },
      "level3_expanded": {
        "japanese": "自由な 時間が 欲しいです。ゆっくり 旅行したいですから。",
        "reading": "じゆうな じかんが ほしいです。ゆっくり りょこうしたいですから。",
        "vietnamese": "Tôi muốn có thời gian rảnh rỗi để có thể đi du lịch thong thả."
      }
    }
  },
  {
    "id": "QA-L5-P3-06",
    "lesson": 5,
    "part": 3,
    "partTitle": "Phần 3: Sở thích & Mong muốn",
    "hasImage": false,
    "questionJapanese": "さかなが すきですか。",
    "questionFurigana": "さかなが すきですか。",
    "questionVietnamese": "Bạn có thích cá không?",
    "grammarPattern": "はい、すきです。 / いいえ、すきじゃありません。",
    "keywords": [
      "さかな",
      "すき",
      "きらい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、好きです。",
        "reading": "はい、すきです。",
        "vietnamese": "Có thích ạ."
      },
      "level2_polite": {
        "japanese": "はい、魚が 大好きです。",
        "reading": "はい、さかなが だいすきです。",
        "vietnamese": "Vâng, tôi rất thích cá."
      },
      "level3_expanded": {
        "japanese": "いいえ、あまり 好きじゃありません。肉の ほうが 好きです。",
        "reading": "いいえ、あまり すきじゃありません。にくの ほうが すきです。",
        "vietnamese": "Không, tôi không thích lắm. Tôi thích thịt hơn."
      }
    }
  },
  {
    "id": "QA-L5-P4-01",
    "lesson": 5,
    "part": 4,
    "partTitle": "Phần 4: Kế hoạch cho ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "しゅうまつ、なにを しに しますか。（なにを しますか。）",
    "questionFurigana": "しゅうまつ、なにを しますか。",
    "questionVietnamese": "Cuối tuần bạn sẽ làm gì?",
    "grammarPattern": "〜へ Vに いきます。 / 〜を します。",
    "keywords": [
      "しゅうまつ",
      "なにをしますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "買い物を します。",
        "reading": "かいものを します。",
        "vietnamese": "Đi mua sắm."
      },
      "level2_polite": {
        "japanese": "友達と 映画を 見に 行きます。",
        "reading": "ともだちと えいがを みに いきます。",
        "vietnamese": "Tôi sẽ đi xem phim cùng bạn."
      },
      "level3_expanded": {
        "japanese": "服を 買いに デパートへ 行きます。そのあと、カフェで 休みます。",
        "reading": "ふくを かいに デパートへ いきます。そのあと、カフェで やすみます。",
        "vietnamese": "Tôi đi trung tâm thương mại mua quần áo, sau đó nghỉ ngơi ở quán cà phê."
      }
    }
  },
  {
    "id": "QA-L5-P4-02",
    "lesson": 5,
    "part": 4,
    "partTitle": "Phần 4: Kế hoạch cho ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "なつやすみ なにを しますか。",
    "questionFurigana": "なつやすみ なにを しますか。",
    "questionVietnamese": "Kỳ nghỉ hè bạn sẽ làm gì?",
    "grammarPattern": "〜へ いきます / 〜します",
    "keywords": [
      "なつやすみ",
      "くにへかえる",
      "りょこう"
    ],
    "answers": {
      "level1_short": {
        "japanese": "旅行します。",
        "reading": "りょこうします。",
        "vietnamese": "Đi du lịch."
      },
      "level2_polite": {
        "japanese": "国へ 帰ります。",
        "reading": "くにへ かえります。",
        "vietnamese": "Tôi sẽ về nước / về quê."
      },
      "level3_expanded": {
        "japanese": "家族と ダナンへ 旅行に 行きます。海で 泳ぎたいです。",
        "reading": "かぞくと ダナンへ りょこうに いきます。うみで およぎたいです。",
        "vietnamese": "Tôi đi du lịch Đà Nẵng cùng gia đình. Tôi muốn bơi ở biển."
      }
    }
  },
  {
    "id": "QA-L5-P4-03",
    "lesson": 5,
    "part": 4,
    "partTitle": "Phần 4: Kế hoạch cho ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "こんどの ふゆやすみ くにへ かえりますか。",
    "questionFurigana": "こんどの ふゆやすみ くにへ かえりますか。",
    "questionVietnamese": "Kỳ nghỉ đông tới bạn có về nước / về quê không?",
    "grammarPattern": "はい、かえります。 / いいえ、かえりません。",
    "keywords": [
      "ふゆやすみ",
      "くにへかえりますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、帰ります。",
        "reading": "はい、かえります。",
        "vietnamese": "Có về ạ."
      },
      "level2_polite": {
        "japanese": "はい、家族に 会いに 帰ります。",
        "reading": "はい、かぞくに あいに かえります。",
        "vietnamese": "Có, tôi về thăm gia đình."
      },
      "level3_expanded": {
        "japanese": "いいえ、帰りません。アルバイトを しますから。",
        "reading": "いいえ、かえりません。アルバイトを しますから。",
        "vietnamese": "Không, tôi không về vì phải làm thêm."
      }
    }
  },
  {
    "id": "QA-L5-P4-04",
    "lesson": 5,
    "part": 4,
    "partTitle": "Phần 4: Kế hoạch cho ngày nghỉ",
    "hasImage": false,
    "questionJapanese": "こんどの どようび えいがを みに いきますか。",
    "questionFurigana": "こんどの どようび えいがを みに いきますか。",
    "questionVietnamese": "Thứ Bảy tới bạn có đi xem phim không?",
    "grammarPattern": "はい、いきます。 / いいえ、いきません。",
    "keywords": [
      "どようび",
      "えいがをみにいきますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、行きます。",
        "reading": "はい、いきます。",
        "vietnamese": "Có đi ạ."
      },
      "level2_polite": {
        "japanese": "はい、友達と 見に 行きます。",
        "reading": "はい、ともだちと みに いきます。",
        "vietnamese": "Có, tôi đi xem cùng bạn."
      },
      "level3_expanded": {
        "japanese": "いいえ、行きません。家で 勉強します。",
        "reading": "いいえ、いきません。いえで べんきょうします。",
        "vietnamese": "Không, tôi không đi. Tôi học bài ở nhà."
      }
    }
  },
  {
    "id": "QA-IMG-L5-01",
    "lesson": 5,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Cuối tuần",
    "hasImage": true,
    "imageType": "weekend",
    "imageDescription": "Tranh bạn bè đi công viên và tổ chức tiệc nướng BBQ cuối tuần",
    "questionJapanese": "しゅうまつ、何を しましたか。",
    "questionFurigana": "しゅうまつ、なにを しましたか。",
    "questionVietnamese": "Cuối tuần bạn đã làm gì (theo tranh)?",
    "grammarPattern": "こうえんで バーベキューを しました。",
    "keywords": [
      "こうえん",
      "バーベキュー",
      "しました"
    ],
    "answers": {
      "level1_short": {
        "japanese": "バーベキューを しました。",
        "reading": "バーベキューを しました。",
        "vietnamese": "Đã nướng BBQ."
      },
      "level2_polite": {
        "japanese": "公園で バーベキューを しました。",
        "reading": "こうえんで バーベキューを しました。",
        "vietnamese": "Tôi đã làm tiệc nướng BBQ ở công viên."
      },
      "level3_expanded": {
        "japanese": "友達と 公園へ 行って、バーベキューを しました。とても おいしかったです。",
        "reading": "ともだちと こうえんへ いって、バーベキューを しました。とても おいしかったです。",
        "vietnamese": "Tôi đã cùng bạn đến công viên và nướng BBQ. Món ăn rất ngon."
      }
    }
  },
  {
    "id": "QA-IMG-L5-02",
    "lesson": 5,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Chuyến đi tuần trước",
    "hasImage": true,
    "imageType": "travel",
    "imageDescription": "Tranh phong cảnh bãi biển du lịch tuần trước",
    "questionJapanese": "せんしゅうは どこへ いきましたか。",
    "questionFurigana": "せんしゅうは どこへ いきましたか。",
    "questionVietnamese": "Tuần trước bạn đã đi đâu (theo tranh)?",
    "grammarPattern": "うみへ いきました。",
    "keywords": [
      "うみ",
      "いきました"
    ],
    "answers": {
      "level1_short": {
        "japanese": "海へ 行きました。",
        "reading": "うみへ いきました。",
        "vietnamese": "Đã đi biển."
      },
      "level2_polite": {
        "japanese": "先週、海へ 行きました。",
        "reading": "せんしゅう、うみへ いきました。",
        "vietnamese": "Tuần trước tôi đã đi biển."
      },
      "level3_expanded": {
        "japanese": "先週、友達と ダナンの 海へ 行きました。",
        "reading": "せんしゅう、ともだちと ダナンの うみへ いきました。",
        "vietnamese": "Tuần trước tôi đã cùng bạn đến bãi biển Đà Nẵng."
      }
    }
  },
  {
    "id": "QA-IMG-L5-03",
    "lesson": 5,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Chuyến đi tuần trước",
    "hasImage": true,
    "imageType": "travel",
    "imageDescription": "Tranh nụ cười vui vẻ sau chuyến du lịch biển",
    "questionJapanese": "どうでしたか。",
    "questionFurigana": "どうでしたか。",
    "questionVietnamese": "Chuyến đi đó như thế nào?",
    "grammarPattern": "とても たのしかったです。",
    "keywords": [
      "たのしかった",
      "きれいだった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "楽しかったです。",
        "reading": "たのしかったです。",
        "vietnamese": "Rất vui."
      },
      "level2_polite": {
        "japanese": "とても 楽しかったです。",
        "reading": "とても たのしかったです。",
        "vietnamese": "Đã rất là vui vẻ."
      },
      "level3_expanded": {
        "japanese": "海が きれいで、とても 楽しかったです。食べ物も おいしかったです。",
        "reading": "うみが きれいで、とても たのしかったです。たべものも おいしかったです。",
        "vietnamese": "Biển đẹp và rất vui. Đồ ăn cũng rất ngon."
      }
    }
  },
  {
    "id": "QA-IMG-L5-04",
    "lesson": 5,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Xe BMW Đức",
    "hasImage": true,
    "imageType": "car",
    "imageDescription": "Tranh chiếc ô tô thể thao BMW sang trọng của Đức",
    "questionJapanese": "何が すきですか。",
    "questionFurigana": "なにが すきですか。",
    "questionVietnamese": "Bạn thích cái gì (trong tranh)?",
    "grammarPattern": "車／BMWが すきです。",
    "keywords": [
      "くるま",
      "BMW",
      "すき"
    ],
    "answers": {
      "level1_short": {
        "japanese": "車が 好きです。",
        "reading": "くるまが すきです。",
        "vietnamese": "Thích ô tô."
      },
      "level2_polite": {
        "japanese": "私は 車が 好きです。",
        "reading": "わたしは くるまが すきです。",
        "vietnamese": "Tôi thích xe hơi."
      },
      "level3_expanded": {
        "japanese": "ドイツの 車が 好きです。特に BMWが 大好きです。",
        "reading": "ドイツの くるまが すきです。とくに BMWが だいすきです。",
        "vietnamese": "Tôi thích xe hơi của Đức. Đặc biệt là rất thích BMW."
      }
    }
  },
  {
    "id": "QA-IMG-L5-05",
    "lesson": 5,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Xe BMW Đức",
    "hasImage": true,
    "imageType": "car",
    "imageDescription": "Tranh người mơ ước sở hữu chiếc xe ô tô BMW",
    "questionJapanese": "なにが ほしいですか。",
    "questionFurigana": "なにが ほしいですか。",
    "questionVietnamese": "Bạn muốn có cái gì (theo tranh)?",
    "grammarPattern": "くるま／BMWが ほしいです。",
    "keywords": [
      "くるま",
      "ほしい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "車が 欲しいです。",
        "reading": "くるまが ほしいです。",
        "vietnamese": "Muốn có ô tô."
      },
      "level2_polite": {
        "japanese": "BMWの 車が 欲しいです。",
        "reading": "BMWの くるまが ほしいです。",
        "vietnamese": "Tôi muốn có chiếc xe hơi BMW."
      },
      "level3_expanded": {
        "japanese": "かっこいい ドイツの 車が 欲しいです。",
        "reading": "かっこいい ドイツの くるまが ほしいです。",
        "vietnamese": "Tôi muốn có một chiếc ô tô Đức thật ngầu."
      }
    }
  },
  {
    "id": "QA-IMG-L5-06",
    "lesson": 5,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Xe BMW Đức",
    "hasImage": true,
    "imageType": "car",
    "imageDescription": "Tranh người đang lựa chọn mua loại ô tô",
    "questionJapanese": "どんな くるまを／が 買いたいですか。",
    "questionFurigana": "どんな くるまを／が かいたいですか。",
    "questionVietnamese": "Bạn muốn mua loại xe ô tô như thế nào?",
    "grammarPattern": "[Aい/Aな] くるまを かいたいです。",
    "keywords": [
      "かっこいい",
      "はやい",
      "あおい",
      "かいたい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "かっこいい 車です。",
        "reading": "かっこいい くるまです。",
        "vietnamese": "Xe ngầu."
      },
      "level2_polite": {
        "japanese": "かっこいい 車を 買いたいです。",
        "reading": "かっこいい くるまを かいたいです。",
        "vietnamese": "Tôi muốn mua một chiếc xe thật ngầu."
      },
      "level3_expanded": {
        "japanese": "速くて、安全な ドイツの 車を 買いたいです。",
        "reading": "はやくて、あんぜんな ドイツの くるまを かいたいです。",
        "vietnamese": "Tôi muốn mua một chiếc xe Đức vừa nhanh vừa an toàn."
      }
    }
  },
  {
    "id": "QA-IMG-L5-07",
    "lesson": 5,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Suối nước nóng Onsen",
    "hasImage": true,
    "imageType": "onsen",
    "imageDescription": "Tranh suối nước nóng Onsen truyền thống ngoài trời ở Nhật Bản",
    "questionJapanese": "日曜日、どこかへ 行きましたか。",
    "questionFurigana": "にちようび、どこかへ いきましたか。",
    "questionVietnamese": "Chủ nhật bạn có đi đâu không (theo tranh)?",
    "grammarPattern": "はい、おんせんへ いきました。",
    "keywords": [
      "おんせん",
      "いきました"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、行きました。",
        "reading": "はい、いきました。",
        "vietnamese": "Có đi ạ."
      },
      "level2_polite": {
        "japanese": "はい、温泉へ 行きました。",
        "reading": "はい、おんせんへ いきました。",
        "vietnamese": "Có, tôi đã đi suối nước nóng Onsen."
      },
      "level3_expanded": {
        "japanese": "はい、家族と 温泉へ 行きました。とても 気持ちよかったです。",
        "reading": "はい、かぞくと おんせんへ いきました。とても きもちよかったです。",
        "vietnamese": "Có, tôi đi Onsen cùng gia đình. Cảm giác vô cùng dễ chịu."
      }
    }
  },
  {
    "id": "QA-IMG-L5-08",
    "lesson": 5,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Suối nước nóng Onsen",
    "hasImage": true,
    "imageType": "onsen",
    "imageDescription": "Tranh người đang ngâm mình thoải mái trong làn nước ấm Onsen",
    "questionJapanese": "おんせんは どうでしたか。",
    "questionFurigana": "おんせんは どうでしたか。",
    "questionVietnamese": "Suối nước nóng Onsen đã thế nào?",
    "grammarPattern": "とても きもちよかったです。 / あたたかかったです。",
    "keywords": [
      "きもちよかった",
      "あたたかかった",
      "よかった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "良かったです。",
        "reading": "よかったです。",
        "vietnamese": "Rất tuyệt."
      },
      "level2_polite": {
        "japanese": "温泉は とても 気持ちよかったです。",
        "reading": "おんせんは とても きもちよかったです。",
        "vietnamese": "Onsen rất là dễ chịu."
      },
      "level3_expanded": {
        "japanese": "お湯が 温かくて、景色も きれいで、最高でした。",
        "reading": "おゆが あたたかくて、けしきも きれいで、さいこうでした。",
        "vietnamese": "Nước ấm và phong cảnh cũng đẹp, thật là tuyệt đỉnh."
      }
    }
  },
  {
    "id": "QA-IMG-L5-09",
    "lesson": 5,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Thời tiết hôm qua",
    "hasImage": true,
    "imageType": "weather",
    "imageDescription": "Tranh trời mưa to sấm chớp vào ngày hôm qua",
    "questionJapanese": "きのうのてんきは どうでしたか。",
    "questionFurigana": "きのうのてんきは どうでしたか。",
    "questionVietnamese": "Thời tiết hôm qua thế nào (theo tranh)?",
    "grammarPattern": "あめでした。 / わるかったです。",
    "keywords": [
      "あめでした",
      "わるかった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "雨でした。",
        "reading": "あめでした。",
        "vietnamese": "Trời mưa."
      },
      "level2_polite": {
        "japanese": "きのうは 雨で、寒かったです。",
        "reading": "きのうは あめで、さむかったです。",
        "vietnamese": "Hôm qua trời mưa và lạnh."
      },
      "level3_expanded": {
        "japanese": "天気が 良くなかったです。大雨でしたから、家を 出ませんでした。",
        "reading": "てんきが よくなかったです。おおあめでしたから、いえを でませんでした。",
        "vietnamese": "Thời tiết không tốt. Vì mưa to nên tôi không ra khỏi nhà."
      }
    }
  },
  {
    "id": "QA-IMG-L5-10",
    "lesson": 5,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Bài thi",
    "hasImage": true,
    "imageType": "exam",
    "imageDescription": "Tranh bài thi đạt điểm 100 tuyệt đối",
    "questionJapanese": "テストは どうでしたか。",
    "questionFurigana": "テストは どうでしたか。",
    "questionVietnamese": "Bài thi kiểm tra đã thế nào (theo tranh)?",
    "grammarPattern": "かんたんでした。 / よかったです。",
    "keywords": [
      "よかった",
      "かんたん",
      "むずかしかった"
    ],
    "answers": {
      "level1_short": {
        "japanese": "良かったです。",
        "reading": "よかったです。",
        "vietnamese": "Tốt ạ."
      },
      "level2_polite": {
        "japanese": "テストは 簡単で、良かったです。",
        "reading": "テストは かんたんで、よかったです。",
        "vietnamese": "Bài thi dễ và kết quả tốt."
      },
      "level3_expanded": {
        "japanese": "勉強しましたから、難しくなかったです。いい 点数を とりました。",
        "reading": "べんきょうしましたから、むずかしくなかったです。いい てんすうを とりました。",
        "vietnamese": "Vì tôi đã ôn tập nên không khó lắm. Tôi đạt điểm rất cao."
      }
    }
  },
  {
    "id": "QA-IMG-L5-11",
    "lesson": 5,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Yoshida uống rượu",
    "hasImage": true,
    "imageType": "izakaya",
    "imageDescription": "Tranh anh Yoshida ngồi uống rượu sake cùng đồng nghiệp công ty",
    "questionJapanese": "きのう、よしださんは だれと おさけを のみましたか。",
    "questionFurigana": "きのう、よしださんは だれと おさけを のみましたか。",
    "questionVietnamese": "Hôm qua anh Yoshida đã uống rượu cùng ai?",
    "grammarPattern": "かいしゃの ひと／ともだちと のみました。",
    "keywords": [
      "よしださん",
      "だれと",
      "かいしゃのひと",
      "ともだち"
    ],
    "answers": {
      "level1_short": {
        "japanese": "同僚と 飲みました。",
        "reading": "どうりょうと のみました。",
        "vietnamese": "Cùng đồng nghiệp."
      },
      "level2_polite": {
        "japanese": "会社の 人と お酒を 飲みました。",
        "reading": "かいしゃの ひとと おさけを のみました。",
        "vietnamese": "Anh ấy đã uống rượu cùng người trong công ty."
      },
      "level3_expanded": {
        "japanese": "仕事のあとで、会社の 友達と 居酒屋で 飲みました。",
        "reading": "しごとのあとで、かいしゃの ともだちと いざかやで のみました。",
        "vietnamese": "Sau giờ làm, anh ấy đã uống ở quán rượu Izakaya cùng đồng nghiệp."
      }
    }
  },
  {
    "id": "QA-L6-P1-01",
    "lesson": 6,
    "part": 1,
    "partTitle": "Phần 1: Rủ rê và Nhận/Từ chối lời mời",
    "hasImage": false,
    "questionJapanese": "来週の 日曜日（に）、いっしょに サッカーを しませんか。",
    "questionFurigana": "らいしゅうの にちようび（に）、いっしょに サッカーを しませんか。",
    "questionVietnamese": "Chủ nhật tuần sau cùng đi đá bóng không?",
    "grammarPattern": "〜ませんか / いいですね、〜ましょう / すみません、ちょっと…",
    "keywords": [
      "らいしゅう",
      "にちようび",
      "サッカー",
      "しませんか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "いいですね、しましょう。",
        "reading": "いいですね、しましょう。",
        "vietnamese": "Được đấy, cùng chơi nhé."
      },
      "level2_polite": {
        "japanese": "はい、ぜひ いっしょに サッカーを しましょう。",
        "reading": "はい、ぜひ いっしょに サッカーを しましょう。",
        "vietnamese": "Vâng, nhất định rồi, chúng ta cùng đá bóng nhé."
      },
      "level3_expanded": {
        "japanese": "いいですね！何時に どこで 会いましょうか。楽しみにしています。",
        "reading": "いいですね！なんじに どこで あいましょうか。たのしみにしています。",
        "vietnamese": "Hay quá! Chúng ta gặp nhau lúc mấy giờ ở đâu nhỉ? Tôi rất mong đợi."
      }
    }
  },
  {
    "id": "QA-L6-P1-02",
    "lesson": 6,
    "part": 1,
    "partTitle": "Phần 1: Rủ rê và Nhận/Từ chối lời mời",
    "hasImage": false,
    "questionJapanese": "今月の 20日（に）、いっしょに コンサートに 行きませんか。",
    "questionFurigana": "こんげつの はつか（に）、いっしょに コンサートに いきませんか。",
    "questionVietnamese": "Ngày 20 tháng này, cùng đi xem ca nhạc không?",
    "grammarPattern": "〜ませんか / すみません、20日は ちょっと… やくそくが ありますから。",
    "keywords": [
      "こんげつ",
      "はつか",
      "コンサート",
      "いきませんか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "いいですね、行きましょう。",
        "reading": "いいですね、いきましょう。",
        "vietnamese": "Được đấy, đi nào."
      },
      "level2_polite": {
        "japanese": "はい、ぜひ 行きたいです。チケットが ありますか。",
        "reading": "はい、ぜひ いきたいです。チケットが ありますか。",
        "vietnamese": "Vâng, tôi rất muốn đi. Bạn có vé chưa?"
      },
      "level3_expanded": {
        "japanese": "すみません、20日は ちょっと… 友達と 約束が ありますから。",
        "reading": "すみません、はつかは ちょっと… ともだちと やくそくが ありますから。",
        "vietnamese": "Xin lỗi, ngày 20 thì hơi kẹt... vì tôi có hẹn với bạn mất rồi."
      }
    }
  },
  {
    "id": "QA-L6-P1-03",
    "lesson": 6,
    "part": 1,
    "partTitle": "Phần 1: Rủ rê và Nhận/Từ chối lời mời",
    "hasImage": false,
    "questionJapanese": "こんばん、いっしょに ばんごはんを たべませんか。",
    "questionFurigana": "こんばん、いっしょに ばんごはんを たべませんか。",
    "questionVietnamese": "Tối nay cùng ăn tối không?",
    "grammarPattern": "いいですね、たべましょう / 〜へ いきましょう",
    "keywords": [
      "こんばん",
      "ばんごはん",
      "たべませんか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "いいですね、食べましょう。",
        "reading": "いいですね、たべましょう。",
        "vietnamese": "Được đấy, cùng ăn nhé."
      },
      "level2_polite": {
        "japanese": "はい、いっしょに 晩ごはんを 食べましょう。何が いいですか。",
        "reading": "はい、いっしょに ばんごはんを たべましょう。なにが いいですか。",
        "vietnamese": "Vâng, cùng ăn tối nhé. Bạn muốn ăn món gì?"
      },
      "level3_expanded": {
        "japanese": "ぜひ！近くに おいしい 日本料理の レストランが ありますよ。行きましょう。",
        "reading": "ぜひ！ちかくに おいしい にほんりょうりの レストランが ありますよ。いきましょう。",
        "vietnamese": "Nhất trí luôn! Ở gần đây có nhà hàng Nhật Bản ngon lắm. Đi thôi nào."
      }
    }
  },
  {
    "id": "QA-L6-P1-04",
    "lesson": 6,
    "part": 1,
    "partTitle": "Phần 1: Rủ rê và Nhận/Từ chối lời mời",
    "hasImage": false,
    "questionJapanese": "ダナンで なにが ありますか。",
    "questionFurigana": "ダナンで なにが ありますか。",
    "questionVietnamese": "Ở Đà Nẵng có sự kiện / hoạt động gì thế?",
    "grammarPattern": "[Địa điểm]で [Sự kiện]が あります。",
    "keywords": [
      "ダナン",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "フェスティバルが あります。",
        "reading": "フェスティバルが あります。",
        "vietnamese": "Có lễ hội."
      },
      "level2_polite": {
        "japanese": "ダナンで 花火大会が あります。",
        "reading": "ダナンで はなびたいかいが あります。",
        "vietnamese": "Ở Đà Nẵng có lễ hội pháo hoa quốc tế."
      },
      "level3_expanded": {
        "japanese": "今週末、ドラゴン橋の 近くで 音楽フェスティバルが ありますよ。",
        "reading": "こんしゅうまつ、ドラゴンばしの ちかくで おんがくフェスティバルが ありますよ。",
        "vietnamese": "Cuối tuần này ở gần Cầu Rồng có lễ hội âm nhạc đấy."
      }
    }
  },
  {
    "id": "QA-L6-P2-01",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "日本の 食べ物で 何が いちばんすきですか。",
    "questionFurigana": "にほんの たべもので なにが いちばんすきですか。",
    "questionVietnamese": "Trong các món ăn Nhật Bản, bạn thích món nào nhất?",
    "grammarPattern": "[Phạm vi]で [Đối tượng]が いちばん すきです。",
    "keywords": [
      "にほんのたべもの",
      "なにが",
      "いちばんすき"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ラーメンです。",
        "reading": "ラーメンです。",
        "vietnamese": "Là ramen."
      },
      "level2_polite": {
        "japanese": "日本の 食べ物で ラーメンが いちばん 好きです。",
        "reading": "にほんの たべもので ラーメンが いちばん すきです。",
        "vietnamese": "Trong đồ ăn Nhật, tôi thích ramen nhất."
      },
      "level3_expanded": {
        "japanese": "お寿司が いちばん 好きです。新鮮で、とても おいしいですから。",
        "reading": "おすしが いちばん すきです。しんせんで、とても おいしいですから。",
        "vietnamese": "Tôi thích sushi nhất. Vì cá rất tươi và ngon."
      }
    }
  },
  {
    "id": "QA-L6-P2-02",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "ベトナムで どこが いちばん おもしろいですか。",
    "questionFurigana": "ベトナムで どこが いちばん おもしろいですか。",
    "questionVietnamese": "Ở Việt Nam, nơi nào thú vị nhất?",
    "grammarPattern": "ベトナムで [Địa điểm]が いちばん おもしろいです。",
    "keywords": [
      "ベトナムで",
      "どこが",
      "いちばん",
      "おもしろい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ダナンです。",
        "reading": "ダナンです。",
        "vietnamese": "Là Đà Nẵng."
      },
      "level2_polite": {
        "japanese": "ベトナムで ダナンが いちばん 面白いです。",
        "reading": "ベトナムで ダナンが いちばん おもしろいです。",
        "vietnamese": "Ở Việt Nam thì Đà Nẵng thú vị nhất."
      },
      "level3_expanded": {
        "japanese": "ダナンが いちばん 面白いです。海が きれいで、食べ物も 安くて おいしいです。",
        "reading": "ダナンが いちばん おもしろいです。うみが きれいで、たべものも やすくて おいしいです。",
        "vietnamese": "Đà Nẵng thú vị nhất. Biển đẹp và đồ ăn vừa rẻ vừa ngon."
      }
    }
  },
  {
    "id": "QA-L6-P2-03",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "かしゅで だれが いちばん すきですか。",
    "questionFurigana": "かしゅで だれが いちばん すきですか。",
    "questionVietnamese": "Trong các ca sĩ, bạn thích ai nhất?",
    "grammarPattern": "かしゅで [Tên]が いちばん すきです。",
    "keywords": [
      "かしゅで",
      "だれが",
      "いちばんすき"
    ],
    "answers": {
      "level1_short": {
        "japanese": "Sơn Tùngです。",
        "reading": "ソントゥンです。",
        "vietnamese": "Là Sơn Tùng."
      },
      "level2_polite": {
        "japanese": "歌手で 米津玄師が いちばん 好きです。",
        "reading": "かしゅで よねづけんしが いちばん すきです。",
        "vietnamese": "Trong giới ca sĩ, tôi thích Kenshi Yonezu nhất."
      },
      "level3_expanded": {
        "japanese": "Sơn Tùng M-TPが いちばん 好きです。歌が 上手で、とても かっこいいですから。",
        "reading": "ソントゥン エムティーピーが いちばん すきです。うたが じょうずで、とても かっこいいですから。",
        "vietnamese": "Tôi thích Sơn Tùng M-TP nhất. Vì hát hay và rất phong cách."
      }
    }
  },
  {
    "id": "QA-L6-P2-04",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "でんしゃと バスと どちらが いいですか。",
    "questionFurigana": "でんしゃと バスと どちらが いいですか。",
    "questionVietnamese": "Tàu điện và xe buýt thì phương tiện nào tốt hơn?",
    "grammarPattern": "[N1]の ほうが いいです。[Lý do]ですから。",
    "keywords": [
      "でんしゃ",
      "バス",
      "どちらが",
      "いいですか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "電車が いいです。",
        "reading": "でんしゃが いいです。",
        "vietnamese": "Tàu điện tốt hơn."
      },
      "level2_polite": {
        "japanese": "電車の ほうが いいです。早いですから。",
        "reading": "でんしゃの ほうが いいです。はやいですから。",
        "vietnamese": "Tàu điện tốt hơn vì nhanh hơn."
      },
      "level3_expanded": {
        "japanese": "電車の ほうが いいです。バスより 時間が 正確で、便利ですから。",
        "reading": "でんしゃの ほうが いいです。バスより じかんが せいかくで、べんりですから。",
        "vietnamese": "Tàu điện tốt hơn. Vì đúng giờ hơn xe buýt và tiện lợi hơn."
      }
    }
  },
  {
    "id": "QA-L6-P2-05",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "一年で 何月が いちばん あついですか。",
    "questionFurigana": "いちねんで なんがつが いちばん あついですか。",
    "questionVietnamese": "Trong một năm, tháng mấy nóng nhất?",
    "grammarPattern": "いちねんで [Tháng]が いちばん あついです。",
    "keywords": [
      "いちねんで",
      "なんがつが",
      "いちばんあつい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "6月です。",
        "reading": "ろくがつです。",
        "vietnamese": "Tháng 6."
      },
      "level2_polite": {
        "japanese": "1年で 6月が いちばん 暑いです。",
        "reading": "いちねんで ろくがつが いちばん あついです。",
        "vietnamese": "Trong năm thì tháng 6 nóng nhất."
      },
      "level3_expanded": {
        "japanese": "7月が いちばん 暑いです。気温が 38度くらいに なります。",
        "reading": "しちがつが いちばん あついです。きおんが さんじゅうはちどくらいに なります。",
        "vietnamese": "Tháng 7 nóng nhất. Nhiệt độ lên tới khoảng 38 độ C."
      }
    }
  },
  {
    "id": "QA-L6-P2-06",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "ベトナムは いちねんで いつ あついですか。",
    "questionFurigana": "ベトナムは いちねんで いつ あついですか。",
    "questionVietnamese": "Việt Nam trong một năm thì khi nào trời nóng?",
    "grammarPattern": "ベトナムは [Mùa / Khoảng thời gian]が あついです。",
    "keywords": [
      "ベトナムは",
      "いちねんで",
      "いつ",
      "あつい"
    ],
    "answers": {
      "level1_short": {
        "japanese": "夏です。",
        "reading": "なつです。",
        "vietnamese": "Mùa hè."
      },
      "level2_polite": {
        "japanese": "ベトナムは 5月から 8月までが 暑いです。",
        "reading": "ベトナムは ごがつから はちがつまでが あついです。",
        "vietnamese": "Ở Việt Nam từ tháng 5 đến tháng 8 là nóng."
      },
      "level3_expanded": {
        "japanese": "夏が いちばん 暑いです。特に 6月と 7月は 日差しが とても 強いです。",
        "reading": "なつが いちばん あついです。とくに ろくがつと しちがつは ひざしが とても つよいです。",
        "vietnamese": "Mùa hè là nóng nhất. Đặc biệt tháng 6 và 7 nắng rất gắt."
      }
    }
  },
  {
    "id": "QA-L6-P2-07",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "もう インドの カレーを 食べましたか。",
    "questionFurigana": "もう インドの カレーを たべましたか。",
    "questionVietnamese": "Bạn đã ăn món cà ri Ấn Độ bao giờ chưa (đã ăn chưa)?",
    "grammarPattern": "はい、もう たべました。 / いいえ、まだです。",
    "keywords": [
      "もう",
      "インドのカレー",
      "たべましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、食べました。",
        "reading": "はい、たべました。",
        "vietnamese": "Rồi, tôi ăn rồi."
      },
      "level2_polite": {
        "japanese": "はい、もう 食べました。とても 辛かったです。",
        "reading": "はい、もう たべました。とても からかったです。",
        "vietnamese": "Vâng, tôi ăn rồi. Đã rất cay."
      },
      "level3_expanded": {
        "japanese": "いいえ、まだです。辛い物が 好きですから、一度 食べてみたいです。",
        "reading": "いいえ、まだです。からいものが すきですから、いちど たべてみたいです。",
        "vietnamese": "Chưa, tôi chưa ăn. Vì thích đồ cay nên tôi muốn ăn thử một lần."
      }
    }
  },
  {
    "id": "QA-L6-P2-08",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "もう オーストラリアへ 行きましたか。",
    "questionFurigana": "もう オーストラリアへ いきましたか。",
    "questionVietnamese": "Bạn đã đi Úc bao giờ chưa?",
    "grammarPattern": "いいえ、まだです。 / いつか いきたいです。",
    "keywords": [
      "もう",
      "オーストラリア",
      "いきましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "いいえ、まだです。",
        "reading": "いいえ、まだです。",
        "vietnamese": "Chưa, tôi chưa đi."
      },
      "level2_polite": {
        "japanese": "いいえ、まだ 行っていません。いつか 行きたいです。",
        "reading": "いいえ、まだ いっていません。いつか いきたいです。",
        "vietnamese": "Chưa, tôi chưa đi. Lúc nào đó tôi muốn đi."
      },
      "level3_expanded": {
        "japanese": "いいえ、まだです。コアラや カンガルーを 見たいですから、卒業したら 行きたいです。",
        "reading": "いいえ、まだです。コアラや カンガルーを みたいですから、そつぎょうしたら いきたいです。",
        "vietnamese": "Chưa ạ. Tôi muốn ngắm gấu túi và chuột túi nên sau khi tốt nghiệp muốn đến đó."
      }
    }
  },
  {
    "id": "QA-L6-P2-09",
    "lesson": 6,
    "part": 2,
    "partTitle": "Phần 2: So sánh nhất, so sánh hơn & Trải nghiệm",
    "hasImage": false,
    "questionJapanese": "もう「キングマン」を 見ましたか。",
    "questionFurigana": "もう「キングマン」を みましたか。",
    "questionVietnamese": "Bạn đã xem phim 'Kingsman' chưa?",
    "grammarPattern": "はい、もう みました。 / いいえ、まだです。",
    "keywords": [
      "もう",
      "キングマン",
      "みましたか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、見ました。",
        "reading": "はい、みました。",
        "vietnamese": "Có, tôi xem rồi."
      },
      "level2_polite": {
        "japanese": "はい、もう 見ました。とても 面白かったです。",
        "reading": "はい、もう みました。とても おもしろかったです。",
        "vietnamese": "Vâng, tôi đã xem rồi. Rất hay."
      },
      "level3_expanded": {
        "japanese": "はい、先週 友達と 映画館で 見ました。アクションが すごかったです。",
        "reading": "はい、せんしゅう ともだちと えいがかんで みました。アクションが すごかったです。",
        "vietnamese": "Vâng, tuần trước tôi xem cùng bạn ở rạp chiếu phim. Cảnh hành động cực đỉnh."
      }
    }
  },
  {
    "id": "QA-L6-P3-01",
    "lesson": 6,
    "part": 3,
    "partTitle": "Phần 3: Chốt cuộc hẹn (địa điểm, thời gian)",
    "hasImage": false,
    "questionJapanese": "何時に 会いましょうか。",
    "questionFurigana": "なんじに あいましょうか。",
    "questionVietnamese": "Chúng ta gặp nhau lúc mấy giờ nhỉ?",
    "grammarPattern": "[Giờ]に あいましょう。",
    "keywords": [
      "なんじに",
      "あいましょうか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "10時です。",
        "reading": "じゅうじです。",
        "vietnamese": "10 giờ nhé."
      },
      "level2_polite": {
        "japanese": "午前 10時に 会いましょう。",
        "reading": "ごぜん じゅうじに あいましょう。",
        "vietnamese": "Gặp nhau lúc 10 giờ sáng nhé."
      },
      "level3_expanded": {
        "japanese": "10時は どうですか。駅の 改札の前で 待ち合わせしましょう。",
        "reading": "じゅうじは どうですか。えきの かいさつのまえで まちあわせしましょう。",
        "vietnamese": "10 giờ thì sao? Chúng mình hẹn nhau trước cửa soát vé nhà ga nhé."
      }
    }
  },
  {
    "id": "QA-L6-P3-02",
    "lesson": 6,
    "part": 3,
    "partTitle": "Phần 3: Chốt cuộc hẹn (địa điểm, thời gian)",
    "hasImage": false,
    "questionJapanese": "4時は どうですか。",
    "questionFurigana": "よじは どうですか。",
    "questionVietnamese": "4 giờ thì sao (có tiện cho bạn không)?",
    "grammarPattern": "はい、いいですね。 / だいじょうぶです。",
    "keywords": [
      "よじ",
      "どうですか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "いいですね。",
        "reading": "いいですね。",
        "vietnamese": "Được đấy."
      },
      "level2_polite": {
        "japanese": "はい、4時で 大丈夫です。",
        "reading": "はい、よじで だいじょうぶです。",
        "vietnamese": "Vâng, 4 giờ thì được ạ."
      },
      "level3_expanded": {
        "japanese": "4時ですね、分かりました。その時間なら ちょうど 空いています。",
        "reading": "よじですね、わかりました。そのじかんなら ちょうど あいています。",
        "vietnamese": "4 giờ nhé, tôi rõ rồi. Tầm giờ đó tôi vừa vặn đang rảnh."
      }
    }
  },
  {
    "id": "QA-L6-P3-03",
    "lesson": 6,
    "part": 3,
    "partTitle": "Phần 3: Chốt cuộc hẹn (địa điểm, thời gian)",
    "hasImage": false,
    "questionJapanese": "どこで 会いましょうか。",
    "questionFurigana": "どこで あいましょうか。",
    "questionVietnamese": "Chúng ta hẹn gặp nhau ở đâu nhỉ?",
    "grammarPattern": "[Địa điểm]で あいましょう。",
    "keywords": [
      "どこで",
      "あいましょうか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "駅の前です。",
        "reading": "えきのまえです。",
        "vietnamese": "Trước nhà ga."
      },
      "level2_polite": {
        "japanese": "駅の 前で 会いましょう。",
        "reading": "えきの まえで あいましょう。",
        "vietnamese": "Gặp nhau ở trước nhà ga nhé."
      },
      "level3_expanded": {
        "japanese": "ニコニコショッピングビルの 1階の カフェで 会いましょう。分かりやすいですから。",
        "reading": "ニコニコショッピングビルの いっかいの カフェで あいましょう。わかりやすいですから。",
        "vietnamese": "Gặp nhau ở quán cà phê tầng 1 tòa nhà Nikoniko nhé. Chỗ đó rất dễ tìm."
      }
    }
  },
  {
    "id": "QA-IMG-L6-01",
    "lesson": 6,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Sự kiện ở Yokohama",
    "hasImage": true,
    "imageType": "event",
    "imageDescription": "Tranh thông báo lễ hội / sự kiện văn hóa sôi động tổ chức ở thành phố Yokohama",
    "questionJapanese": "よこはまで 何がありますか。",
    "questionFurigana": "よこはまで なにがありますか。",
    "questionVietnamese": "Ở Yokohama có sự kiện gì (theo tranh)?",
    "grammarPattern": "よこはまで [Sự kiện]が あります。",
    "keywords": [
      "よこはまで",
      "なにがありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "フェスティバルです。",
        "reading": "フェスティバルです。",
        "vietnamese": "Có lễ hội."
      },
      "level2_polite": {
        "japanese": "横浜で 花火大会が あります。",
        "reading": "よこはまで はなびたいかいが あります。",
        "vietnamese": "Ở Yokohama có lễ hội bắn pháo hoa."
      },
      "level3_expanded": {
        "japanese": "横浜の みなとみらいで 大きな 国際フェスティバルが あります。",
        "reading": "よこはまの みなとみらいで おおきな こくさいフェスティバルが あります。",
        "vietnamese": "Tại Minato Mirai ở Yokohama có đại lễ hội quốc tế lớn."
      }
    }
  },
  {
    "id": "QA-IMG-L6-02",
    "lesson": 6,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Yokohama Dome",
    "hasImage": true,
    "imageType": "stadium",
    "imageDescription": "Tranh sân vận động mái vòm Yokohama Dome đông đúc người xem",
    "questionJapanese": "よこはまドームで 何がありますか。",
    "questionFurigana": "よこはまドームで なにがありますか。",
    "questionVietnamese": "Ở Yokohama Dome có sự kiện gì (theo tranh)?",
    "grammarPattern": "よこはまドームで [Sự kiện]が あります。",
    "keywords": [
      "よこはまドーム",
      "なにがありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "コンサートです。",
        "reading": "コンサートです。",
        "vietnamese": "Buổi hòa nhạc."
      },
      "level2_polite": {
        "japanese": "横浜ドームで 野球の 試合が あります。",
        "reading": "よこはまドームで やきゅうの しあいが あります。",
        "vietnamese": "Ở Yokohama Dome có trận thi đấu bóng chày."
      },
      "level3_expanded": {
        "japanese": "有名歌手の コンサートが あります。チケットは もう 売り切れました。",
        "reading": "ゆうめいかしゅの コンサートが あります。チケットは もう うりきれました。",
        "vietnamese": "Có buổi hòa nhạc của ca sĩ nổi tiếng. Vé đã bán hết rồi."
      }
    }
  },
  {
    "id": "QA-IMG-L6-03",
    "lesson": 6,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Đồ uống yêu thích của anh Wang",
    "hasImage": true,
    "imageType": "drinks",
    "imageDescription": "Tranh anh Wang đứng cạnh menu các loại đồ uống và đang chỉ tay vào ly nước cam",
    "questionJapanese": "ワンさんは 飲み物で 何が いちばん すきですか。",
    "questionFurigana": "ワンさんは のみもので なにが いちばん すきですか。",
    "questionVietnamese": "Anh Wang thích đồ uống nào nhất (theo tranh)?",
    "grammarPattern": "ワンさんは [Đồ uống]が いちばん すきです。",
    "keywords": [
      "ワンさん",
      "のみもので",
      "なにが",
      "いちばんすき"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ジュースです。",
        "reading": "ジュースです。",
        "vietnamese": "Nước cam ép."
      },
      "level2_polite": {
        "japanese": "ワンさんは オレンジジュースが いちばん 好きです。",
        "reading": "ワンさんは オレンジジュースが いちばん すきです。",
        "vietnamese": "Anh Wang thích nước cam nhất."
      },
      "level3_expanded": {
        "japanese": "ワンさんは 冷たい オレンジジュースが いちばん 好きです。甘くて おいしいですから。",
        "reading": "ワンさんは つめたい オレンジジュースが いちばん すきです。あまくて おいしいですから。",
        "vietnamese": "Anh Wang thích nước cam mát lạnh nhất. Vì nó ngọt mát và ngon."
      }
    }
  },
  {
    "id": "QA-IMG-L6-04",
    "lesson": 6,
    "part": 2,
    "partTitle": "Vấn đáp có tranh: Thịt và Cá",
    "hasImage": true,
    "imageType": "food_compare",
    "imageDescription": "Tranh hai đĩa đồ ăn đặt cạnh nhau: Một đĩa bít tết thịt bò và một đĩa cá hồi nướng",
    "questionJapanese": "肉と さかなと どちらが すきですか。",
    "questionFurigana": "にくと さかなと どちらが すきですか。",
    "questionVietnamese": "Thịt và cá thì bạn thích món nào hơn (theo tranh)?",
    "grammarPattern": "[N]の ほうが すきです。",
    "keywords": [
      "にくと",
      "さかなと",
      "どちらが",
      "すきですか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "肉が 好きです。",
        "reading": "にくが すきです。",
        "vietnamese": "Tôi thích thịt."
      },
      "level2_polite": {
        "japanese": "肉の ほうが 好きです。",
        "reading": "にくの ほうが すきです。",
        "vietnamese": "Tôi thích thịt hơn."
      },
      "level3_expanded": {
        "japanese": "魚より 肉の ほうが 好きです。ステーキが 大好物ですから。",
        "reading": "さかなより にくの ほうが すきです。ステーキが だいこうぶつですから。",
        "vietnamese": "So với cá thì tôi thích thịt hơn. Vì món bò bít tết là món khoái khẩu của tôi."
      }
    }
  },
  {
    "id": "QA-IMG-L6-05",
    "lesson": 6,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Đếm số lượng vé",
    "hasImage": true,
    "imageType": "tickets",
    "imageDescription": "Tranh trên bàn có 2 tấm vé vào cửa xem ca nhạc",
    "questionJapanese": "なんまい ありますか。",
    "questionFurigana": "なんまい ありますか。",
    "questionVietnamese": "Có bao nhiêu tấm vé (theo tranh)?",
    "grammarPattern": "[Số lượng]まい あります。",
    "keywords": [
      "なんまい",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "2枚です。",
        "reading": "にまいです。",
        "vietnamese": "2 vé."
      },
      "level2_polite": {
        "japanese": "チケットが 2枚 あります。",
        "reading": "チケットが にまい あります。",
        "vietnamese": "Có 2 chiếc vé."
      },
      "level3_expanded": {
        "japanese": "チケットが 2枚 ありますから、いっしょに 行きましょう。",
        "reading": "チケットが にまい ありますから、いっしょに いきましょう。",
        "vietnamese": "Tôi có 2 chiếc vé nên chúng ta hãy cùng đi nhé."
      }
    }
  },
  {
    "id": "QA-L7-P1-01",
    "lesson": 7,
    "part": 1,
    "partTitle": "Phần 1: Chỉ dẫn vị trí và địa điểm xung quanh",
    "hasImage": false,
    "questionJapanese": "あなたの いえの ちかくに なにが ありますか。",
    "questionFurigana": "あなたの いえの ちかくに なにが ありますか。",
    "questionVietnamese": "Gần nhà bạn có những gì?",
    "grammarPattern": "私の いえの ちかくに [N]が あります。",
    "keywords": [
      "いえのちかく",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "スーパーが あります。",
        "reading": "スーパーが あります。",
        "vietnamese": "Có siêu thị."
      },
      "level2_polite": {
        "japanese": "私の 家の 近くに スーパーや 公園が あります。",
        "reading": "わたしの いえの ちかくに スーパーや こうえんが あります。",
        "vietnamese": "Gần nhà tôi có siêu thị và công viên."
      },
      "level3_expanded": {
        "japanese": "家の 近くに 大きい スーパーと コンビニが あります。とても 便利です。",
        "reading": "いえの ちかくに おおきい スーパーと コンビニが あります。とても べんりです。",
        "vietnamese": "Gần nhà tôi có một siêu thị lớn và cửa hàng tiện lợi. Rất tiện."
      }
    }
  },
  {
    "id": "QA-L7-P1-02",
    "lesson": 7,
    "part": 1,
    "partTitle": "Phần 1: Chỉ dẫn vị trí và địa điểm xung quanh",
    "hasImage": false,
    "questionJapanese": "FPT大学の ちかくに なにが ありますか。",
    "questionFurigana": "FPTだいがくの ちかくに なにが ありますか。",
    "questionVietnamese": "Gần trường đại học FPT có những gì?",
    "grammarPattern": "FPTだいがくの ちかくに [N]が あります。",
    "keywords": [
      "FPTだいがく",
      "ちかくに",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "カフェが あります。",
        "reading": "カフェが あります。",
        "vietnamese": "Có quán cà phê."
      },
      "level2_polite": {
        "japanese": "FPT大学の 近くに カフェや レストランが たくさん あります。",
        "reading": "FPTだいがくの ちかくに カフェや レストランが たくさん あります。",
        "vietnamese": "Gần đại học FPT có nhiều quán cà phê và quán ăn."
      },
      "level3_expanded": {
        "japanese": "大学の 近くに 学生向けの 安い 食堂や 寮が あります。",
        "reading": "だいがくの ちかくに がくせいむけの やすい しょくどうや りょうが あります。",
        "vietnamese": "Gần trường đại học có các nhà ăn sinh viên giá rẻ và khu ký túc xá."
      }
    }
  },
  {
    "id": "QA-L7-P1-03",
    "lesson": 7,
    "part": 1,
    "partTitle": "Phần 1: Chỉ dẫn vị trí và địa điểm xung quanh",
    "hasImage": false,
    "questionJapanese": "FPT大学は どこに ありますか。",
    "questionFurigana": "FPTだいがくは どこに ありますか。",
    "questionVietnamese": "Đại học FPT nằm ở đâu?",
    "grammarPattern": "FPTだいがくは [Địa điểm]に あります。",
    "keywords": [
      "FPTだいがく",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ハノイ／ダナンに あります。",
        "reading": "ハノイ／ダナンに あります。",
        "vietnamese": "Ở Hà Nội / Đà Nẵng."
      },
      "level2_polite": {
        "japanese": "FPT大学は ダナン市の 南に あります。",
        "reading": "FPTだいがくは ダナンしの みなみに あります。",
        "vietnamese": "Đại học FPT nằm ở phía nam thành phố Đà Nẵng."
      },
      "level3_expanded": {
        "japanese": "FPT大学は ハノイの ホアラックに あります。緑が 多くて きれいな キャンパスです。",
        "reading": "FPTだいがくは ハノイの ホアラックに あります。みどりが おおくて きれいな キャンパスです。",
        "vietnamese": "Đại học FPT nằm ở Hòa Lạc, Hà Nội. Khuôn viên nhiều cây xanh và rất đẹp."
      }
    }
  },
  {
    "id": "QA-L7-P1-04",
    "lesson": 7,
    "part": 1,
    "partTitle": "Phần 1: Chỉ dẫn vị trí và địa điểm xung quanh",
    "hasImage": false,
    "questionJapanese": "Bさんの うちは どこに ありますか。",
    "questionFurigana": "Bさんの うちは どこに ありますか。",
    "questionVietnamese": "Nhà của bạn ở đâu?",
    "grammarPattern": "私の うちは [Địa điểm]に あります。",
    "keywords": [
      "うちは",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ダナンです。",
        "reading": "ダナンです。",
        "vietnamese": "Ở Đà Nẵng."
      },
      "level2_polite": {
        "japanese": "私の 家は ダナン市の 中心に あります。",
        "reading": "わたしの いえは ダナンしの ちゅうしんに あります。",
        "vietnamese": "Nhà tôi nằm ở trung tâm thành phố Đà Nẵng."
      },
      "level3_expanded": {
        "japanese": "私の 家は ハノイの 近くに あります。大学からは バスで 30分くらいです。",
        "reading": "わたしの いえは ハノイの ちかくに あります。だいがくからは バスで さんじゅっぷんくらいです。",
        "vietnamese": "Nhà tôi ở gần Hà Nội. Đi xe buýt từ trường đại học về mất khoảng 30 phút."
      }
    }
  },
  {
    "id": "QA-L7-P1-05",
    "lesson": 7,
    "part": 1,
    "partTitle": "Phần 1: Chỉ dẫn vị trí và địa điểm xung quanh",
    "hasImage": false,
    "questionJapanese": "Bさんの うちの ちかくに スーパーが ありますか。",
    "questionFurigana": "Bさんの うちの ちかくに スーパーが ありますか。",
    "questionVietnamese": "Gần nhà bạn có siêu thị không?",
    "grammarPattern": "はい、あります。 / いいえ、ありません。",
    "keywords": [
      "うちのちかく",
      "スーパー",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、あります。",
        "reading": "はい、あります。",
        "vietnamese": "Có ạ."
      },
      "level2_polite": {
        "japanese": "はい、歩いて 5分の ところに あります。",
        "reading": "はい、あるいて ごふんの ところに あります。",
        "vietnamese": "Có, nằm ở chỗ đi bộ 5 phút."
      },
      "level3_expanded": {
        "japanese": "はい、大きい スーパーが あります。いつも そこで 晩ごはんの 材料を 買います。",
        "reading": "はい、おおきい スーパーが あります。いつも そこで ばんごはんの ざいりょうを かいます。",
        "vietnamese": "Có một siêu thị lớn. Tôi luôn mua nguyên liệu nấu bữa tối ở đó."
      }
    }
  },
  {
    "id": "QA-L7-P1-06",
    "lesson": 7,
    "part": 1,
    "partTitle": "Phần 1: Chỉ dẫn vị trí và địa điểm xung quanh",
    "hasImage": false,
    "questionJapanese": "Bさんの うちの ちかくに こうえんが ありますか。",
    "questionFurigana": "Bさんの うちの ちかくに こうえんが ありますか。",
    "questionVietnamese": "Gần nhà bạn có công viên không?",
    "grammarPattern": "はい、あります。 / いいえ、ありません。",
    "keywords": [
      "うちのちかく",
      "こうえん",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はい、あります。",
        "reading": "はい、あります。",
        "vietnamese": "Có ạ."
      },
      "level2_polite": {
        "japanese": "はい、きれいな 公園が あります。",
        "reading": "はい、きれいな こうえんが あります。",
        "vietnamese": "Có, có một công viên rất đẹp."
      },
      "level3_expanded": {
        "japanese": "はい、緑が 多い 公園が あります。毎朝 そこで 散歩を します。",
        "reading": "はい、みどりが おおい こうえんが あります。まいあさ そこで さんぽを します。",
        "vietnamese": "Có công viên nhiều cây xanh. Mỗi sáng tôi đều đi dạo ở đó."
      }
    }
  },
  {
    "id": "QA-L7-P2-01",
    "lesson": 7,
    "part": 2,
    "partTitle": "Phần 2: Chuẩn bị tiệc và Cách làm",
    "hasImage": false,
    "questionJapanese": "なに／なんで パンを きりますか。",
    "questionFurigana": "なに／なんで パンを きりますか。",
    "questionVietnamese": "Cắt bánh mì bằng cái gì?",
    "grammarPattern": "[Dụng cụ]で パンを きります。",
    "keywords": [
      "なんで",
      "パンを",
      "きりますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ナイフで 切ります。",
        "reading": "ナイフで きります。",
        "vietnamese": "Bằng dao."
      },
      "level2_polite": {
        "japanese": "ナイフで パンを 切ります。",
        "reading": "ナイフで パンを きります。",
        "vietnamese": "Tôi cắt bánh mì bằng dao."
      },
      "level3_expanded": {
        "japanese": "パン切りナイフで 切ります。きれいに 切れますよ。",
        "reading": "パンきりナイフで きります。きれいに きれますよ。",
        "vietnamese": "Cắt bằng dao chuyên dụng cắt bánh mì. Cắt rất đẹp."
      }
    }
  },
  {
    "id": "QA-L7-P2-02",
    "lesson": 7,
    "part": 2,
    "partTitle": "Phần 2: Chuẩn bị tiệc và Cách làm",
    "hasImage": false,
    "questionJapanese": "ベトナム人は なに／なんで 食べますか。",
    "questionFurigana": "ベトナムじんは なに／なんで たべますか。",
    "questionVietnamese": "Người Việt Nam ăn bằng dụng cụ gì?",
    "grammarPattern": "ベトナムじんは [Dụng cụ]で たべます。",
    "keywords": [
      "ベトナムじん",
      "なんで",
      "たべますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "はしで 食べます。",
        "reading": "はしで たべます。",
        "vietnamese": "Bằng đũa."
      },
      "level2_polite": {
        "japanese": "ベトナム人は はしや スプーンで 食べます。",
        "reading": "ベトナムじんは はしや スプーンで たべます。",
        "vietnamese": "Người Việt ăn bằng đũa hoặc thìa."
      },
      "level3_expanded": {
        "japanese": "ベトナム人は 主に はしで 食べます。スープは スプーンで 飲みます。",
        "reading": "ベトナムじんは おもに はしで たべます。スープは スプーンで のみます。",
        "vietnamese": "Người Việt chủ yếu ăn bằng đũa. Khi dùng canh thì dùng thìa."
      }
    }
  },
  {
    "id": "QA-L7-P2-03",
    "lesson": 7,
    "part": 2,
    "partTitle": "Phần 2: Chuẩn bị tiệc và Cách làm",
    "hasImage": false,
    "questionJapanese": "なに／なんで カレーを 食べますか。",
    "questionFurigana": "なに／なんで カレーを たべますか。",
    "questionVietnamese": "Ăn món cà ri bằng cái gì?",
    "grammarPattern": "[Dụng cụ]で カレーを たべます。",
    "keywords": [
      "なんで",
      "カレーを",
      "たべますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "スプーンです。",
        "reading": "スプーンです。",
        "vietnamese": "Bằng thìa."
      },
      "level2_polite": {
        "japanese": "スプーンで カレーを 食べます。",
        "reading": "スプーンで カレーを たべます。",
        "vietnamese": "Ăn cà ri bằng thìa."
      },
      "level3_expanded": {
        "japanese": "スプーンを 使って 食べます。フォークは あまり 使いません。",
        "reading": "スプーンを つかって たべます。フォークは あまり つかいません。",
        "vietnamese": "Dùng thìa để ăn. Hầu như không dùng dĩa."
      }
    }
  },
  {
    "id": "QA-L7-P2-04",
    "lesson": 7,
    "part": 2,
    "partTitle": "Phần 2: Chuẩn bị tiệc và Cách làm",
    "hasImage": false,
    "questionJapanese": "にほんご／えいごが わかりますか。",
    "questionFurigana": "にほんご／えいごが わかりますか。",
    "questionVietnamese": "Bạn có hiểu tiếng Nhật / tiếng Anh không?",
    "grammarPattern": "はい、すこし わかります。 / よく わかります。",
    "keywords": [
      "にほんご",
      "えいご",
      "わかりますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "少し 分かります。",
        "reading": "すこし わかります。",
        "vietnamese": "Hiểu một chút."
      },
      "level2_polite": {
        "japanese": "はい、日本語が 少し 分かります。",
        "reading": "はい、にほんごが すこし わかります。",
        "vietnamese": "Vâng, tôi hiểu một chút tiếng Nhật."
      },
      "level3_expanded": {
        "japanese": "英語は よく 分かりますが、日本語は まだ 勉強中ですから 少しだけです。",
        "reading": "えいごは よく わかりますが、にほんごは まだ べんきょうちゅうですから すこしだけです。",
        "vietnamese": "Tiếng Anh thì tôi hiểu rõ, còn tiếng Nhật đang học nên chỉ biết một ít thôi."
      }
    }
  },
  {
    "id": "QA-IMG-L7-01",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Vị trí đồn cảnh sát (Koban)",
    "hasImage": true,
    "imageType": "map_koban",
    "imageDescription": "Bản đồ khu phố: Đồn cảnh sát (交番) nằm ở phía trước nhà ga, bên cạnh bưu điện",
    "questionJapanese": "こうばんは どこに ありますか。",
    "questionFurigana": "こうばんは どこに ありますか。",
    "questionVietnamese": "Đồn cảnh sát nằm ở đâu (theo tranh)?",
    "grammarPattern": "こうばんは [Địa điểm]の [Vị trí]に あります。",
    "keywords": [
      "こうばん",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "駅の 前です。",
        "reading": "えきの まえです。",
        "vietnamese": "Trước ga."
      },
      "level2_polite": {
        "japanese": "交番は 駅の 前に あります。",
        "reading": "こうばんは えきの まえに あります。",
        "vietnamese": "Đồn cảnh sát nằm ở phía trước nhà ga."
      },
      "level3_expanded": {
        "japanese": "交番は 郵便局の 隣で、駅の 正面に あります。",
        "reading": "こうばんは ゆうびんきょくの となりで、えきの しょうめんに あります。",
        "vietnamese": "Đồn cảnh sát ở bên cạnh bưu điện và đối diện trước cửa ga."
      }
    }
  },
  {
    "id": "QA-IMG-L7-02",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bên cạnh đồn cảnh sát",
    "hasImage": true,
    "imageType": "map_koban",
    "imageDescription": "Bản đồ khu phố: Nhìn sang bên cạnh đồn cảnh sát thấy có bưu điện và tiệm hoa",
    "questionJapanese": "こうばんの となりに 何が ありますか。",
    "questionFurigana": "こうばんの となりに なにが ありますか。",
    "questionVietnamese": "Bên cạnh đồn cảnh sát có cái gì (theo tranh)?",
    "grammarPattern": "こうばんの となりに [N]が あります。",
    "keywords": [
      "こうばんのとなり",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "郵便局です。",
        "reading": "ゆうびんきょくです。",
        "vietnamese": "Bưu điện."
      },
      "level2_polite": {
        "japanese": "交番の 隣に 郵便局が あります。",
        "reading": "こうばんの となりに ゆうびんきょくが あります。",
        "vietnamese": "Bên cạnh đồn cảnh sát có bưu điện."
      },
      "level3_expanded": {
        "japanese": "交番の 右隣に 郵便局が あります。ポストも ありますよ。",
        "reading": "こうばんの みぎとなりに ゆうびんきょくが あります。ポストも ありますよ。",
        "vietnamese": "Bên phải đồn cảnh sát có bưu điện. Cả thùng thư nữa."
      }
    }
  },
  {
    "id": "QA-IMG-L7-03",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Vị trí tiệm hoa (Hanaya)",
    "hasImage": true,
    "imageType": "map_flower",
    "imageDescription": "Bản đồ khu phố: Tiệm hoa (花屋) rực rỡ nằm giữa hiệu sách và tiệm bánh kem",
    "questionJapanese": "はなやは どこに ありますか。",
    "questionFurigana": "はなやは どこに ありますか。",
    "questionVietnamese": "Tiệm hoa nằm ở đâu (theo tranh)?",
    "grammarPattern": "はなやは [N1]と [N2]の あいだに あります。",
    "keywords": [
      "はなや",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "本屋の 隣です。",
        "reading": "ほんやの となりです。",
        "vietnamese": "Cạnh hiệu sách."
      },
      "level2_polite": {
        "japanese": "花屋は 本屋と ケーキ屋の 間に あります。",
        "reading": "はなやは ほんやと ケーキやの あいだに あります。",
        "vietnamese": "Tiệm hoa nằm ở giữa hiệu sách và tiệm bánh kem."
      },
      "level3_expanded": {
        "japanese": "花屋は 駅の 通りに あって、本屋の すぐ 隣です。",
        "reading": "はなやは えきの とおりに あって、ほんやの すぐ となりです。",
        "vietnamese": "Tiệm hoa nằm trên phố ga, ngay cạnh hiệu sách."
      }
    }
  },
  {
    "id": "QA-IMG-L7-04",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Bên cạnh tiệm hoa",
    "hasImage": true,
    "imageType": "map_flower",
    "imageDescription": "Bản đồ khu phố: Bên cạnh tiệm hoa là tiệm bánh kem ngọt ngào",
    "questionJapanese": "はなやの となりに 何が ありますか。",
    "questionFurigana": "はなやの となりに なにが ありますか。",
    "questionVietnamese": "Bên cạnh tiệm hoa có cái gì (theo tranh)?",
    "grammarPattern": "はなやの となりに [N]が あります。",
    "keywords": [
      "はなやのとなり",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ケーキ屋です。",
        "reading": "ケーキやです。",
        "vietnamese": "Tiệm bánh ngọt."
      },
      "level2_polite": {
        "japanese": "花屋の 隣に ケーキ屋が あります。",
        "reading": "はなやの となりに ケーキやが あります。",
        "vietnamese": "Bên cạnh tiệm hoa có tiệm bánh kem."
      },
      "level3_expanded": {
        "japanese": "花屋の 隣に 本屋と かわいい ケーキ屋が あります。",
        "reading": "はなやの となりに ほんやと かわいい ケーキやが あります。",
        "vietnamese": "Bên cạnh tiệm hoa có hiệu sách và một tiệm bánh kem dễ thương."
      }
    }
  },
  {
    "id": "QA-IMG-L7-05",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Vị trí hiệu sách (Honya)",
    "hasImage": true,
    "imageType": "map_bookstore",
    "imageDescription": "Bản đồ khu phố: Hiệu sách (本屋) nằm phía sau nhà hàng Trung Hoa",
    "questionJapanese": "本やは どこに ありますか。",
    "questionFurigana": "ほんやは どこに ありますか。",
    "questionVietnamese": "Hiệu sách nằm ở đâu (theo tranh)?",
    "grammarPattern": "ほんやは [N]の [となりに／うしろに] あります。",
    "keywords": [
      "ほんやは",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "レストランの後ろです。",
        "reading": "レストランのうしろです。",
        "vietnamese": "Sau nhà hàng."
      },
      "level2_polite": {
        "japanese": "本屋は レストランの 後ろに あります。",
        "reading": "ほんやは レストランの うしろに あります。",
        "vietnamese": "Hiệu sách nằm ở phía sau nhà hàng."
      },
      "level3_expanded": {
        "japanese": "本屋は 花屋の 隣で、レストランの 後ろに あります。",
        "reading": "ほんやは はなやの となりで、レストランの うしろに あります。",
        "vietnamese": "Hiệu sách ở cạnh tiệm hoa và nằm phía sau nhà hàng."
      }
    }
  },
  {
    "id": "QA-IMG-L7-06",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Phía sau hiệu sách",
    "hasImage": true,
    "imageType": "map_bookstore",
    "imageDescription": "Bản đồ khu phố: Phía sau hiệu sách có một công viên cây xanh rộng lớn",
    "questionJapanese": "本やの うしろに 何が ありますか。",
    "questionFurigana": "ほんやの うしろに なにが ありますか。",
    "questionVietnamese": "Phía sau hiệu sách có cái gì (theo tranh)?",
    "grammarPattern": "ほんやの うしろに [N]が あります。",
    "keywords": [
      "ほんやのうしろ",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "公園です。",
        "reading": "こうえんです。",
        "vietnamese": "Công viên."
      },
      "level2_polite": {
        "japanese": "本屋の 後ろに 公園が あります。",
        "reading": "ほんやの うしろに こうえんが あります。",
        "vietnamese": "Phía sau hiệu sách có một công viên."
      },
      "level3_expanded": {
        "japanese": "本屋の 後ろに 緑の 多い 広い 公園が あります。",
        "reading": "ほんやの うしろに みどりの おおい ひろい こうえんが あります。",
        "vietnamese": "Phía sau hiệu sách có công viên rộng lớn nhiều cây xanh."
      }
    }
  },
  {
    "id": "QA-IMG-L7-07",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Vị trí nhà hàng (Resutoran)",
    "hasImage": true,
    "imageType": "map_restaurant",
    "imageDescription": "Bản đồ khu phố: Nhà hàng (レストラン) nằm trước hiệu sách và đối diện siêu thị",
    "questionJapanese": "レストランは どこに ありますか。",
    "questionFurigana": "レストランは どこに ありますか。",
    "questionVietnamese": "Nhà hàng nằm ở đâu (theo tranh)?",
    "grammarPattern": "レストランは [N]の まえに あります。",
    "keywords": [
      "レストランは",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "本屋の前です。",
        "reading": "ほんやのまえです。",
        "vietnamese": "Trước hiệu sách."
      },
      "level2_polite": {
        "japanese": "レストランは 本屋の 前に あります。",
        "reading": "レストランは ほんやの まえに あります。",
        "vietnamese": "Nhà hàng nằm ở phía trước hiệu sách."
      },
      "level3_expanded": {
        "japanese": "レストランは 本屋の 前で、スーパーの 向かい側に あります。",
        "reading": "レストランは ほんやの まえで、スーパーの むかいがわに あります。",
        "vietnamese": "Nhà hàng ở trước hiệu sách, đối diện với siêu thị."
      }
    }
  },
  {
    "id": "QA-IMG-L7-08",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Phía trước nhà hàng",
    "hasImage": true,
    "imageType": "map_restaurant",
    "imageDescription": "Bản đồ khu phố: Phía trước nhà hàng có biển trạm xe buýt và bãi đỗ xe",
    "questionJapanese": "レストランの 前に 何が ありますか。",
    "questionFurigana": "レストランの まえに なにが ありますか。",
    "questionVietnamese": "Phía trước nhà hàng có cái gì (theo tranh)?",
    "grammarPattern": "レストランの まえに [N]が あります。",
    "keywords": [
      "レストランのまえ",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "バス停です。",
        "reading": "バスていです。",
        "vietnamese": "Trạm xe buýt."
      },
      "level2_polite": {
        "japanese": "レストランの 前に バス停が あります。",
        "reading": "レストランの まえに バスていが あります。",
        "vietnamese": "Phía trước nhà hàng có trạm xe buýt."
      },
      "level3_expanded": {
        "japanese": "レストランの 前に バス停と 駐車場が あります。",
        "reading": "レストランの まえに バスていと ちゅうしゃじょうが あります。",
        "vietnamese": "Phía trước nhà hàng có trạm xe buýt và bãi đỗ xe."
      }
    }
  },
  {
    "id": "QA-IMG-L7-09",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Vị trí trạm xe buýt và Siêu thị",
    "hasImage": true,
    "imageType": "map_bus",
    "imageDescription": "Bản đồ khu phố: Trạm dừng xe buýt (バスてい) nằm ngay trước cửa siêu thị lớn",
    "questionJapanese": "バスてい / スーパーは どこに ありますか。",
    "questionFurigana": "バスてい / スーパーは どこに ありますか。",
    "questionVietnamese": "Trạm xe buýt / Siêu thị nằm ở đâu (theo tranh)?",
    "grammarPattern": "バスていは スーパーの まえに あります。",
    "keywords": [
      "バスてい",
      "スーパー",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "スーパーの前です。",
        "reading": "スーパーのまえです。",
        "vietnamese": "Trước siêu thị."
      },
      "level2_polite": {
        "japanese": "バス停は スーパーの 前に あります。",
        "reading": "バスていは スーパーの まえに あります。",
        "vietnamese": "Trạm xe buýt nằm ở trước siêu thị."
      },
      "level3_expanded": {
        "japanese": "スーパーは 病院の 近くに あって、バス停はその 前に あります。",
        "reading": "スーパーは びょういんの ちかくに あって、バスていはその まえに あります。",
        "vietnamese": "Siêu thị ở gần bệnh viện, và trạm xe buýt thì ở ngay trước siêu thị."
      }
    }
  },
  {
    "id": "QA-IMG-L7-10",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Phía sau trạm xe buýt",
    "hasImage": true,
    "imageType": "map_bus",
    "imageDescription": "Bản đồ khu phố: Đứng ở trạm xe buýt nhìn ra sau là siêu thị to đùng",
    "questionJapanese": "バスていのうしろに 何が ありますか。",
    "questionFurigana": "バスていのうしろに なにが ありますか。",
    "questionVietnamese": "Phía sau trạm xe buýt có cái gì (theo tranh)?",
    "grammarPattern": "バスていの うしろに [N]が あります。",
    "keywords": [
      "バスていのうしろ",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "スーパーです。",
        "reading": "スーパーです。",
        "vietnamese": "Siêu thị."
      },
      "level2_polite": {
        "japanese": "バス停の 後ろに スーパーが あります。",
        "reading": "バスていの うしろに スーパーが あります。",
        "vietnamese": "Phía sau trạm xe buýt có siêu thị."
      },
      "level3_expanded": {
        "japanese": "バス停の すぐ 後ろに 大きな スーパーが あります。",
        "reading": "バスていの すぐ うしろに おおきな スーパーが あります。",
        "vietnamese": "Ngay phía sau trạm xe buýt có một siêu thị lớn."
      }
    }
  },
  {
    "id": "QA-IMG-L7-11",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Phía trước siêu thị",
    "hasImage": true,
    "imageType": "map_supermarket",
    "imageDescription": "Bản đồ khu phố: Phía trước siêu thị có trạm đón xe buýt",
    "questionJapanese": "スーパーの 前に 何が ありますか。",
    "questionFurigana": "スーパーの まえに なにが ありますか。",
    "questionVietnamese": "Phía trước siêu thị có cái gì (theo tranh)?",
    "grammarPattern": "スーパーの まえに [N]が あります。",
    "keywords": [
      "スーパーのまえ",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "バス停です。",
        "reading": "バスていです。",
        "vietnamese": "Trạm xe buýt."
      },
      "level2_polite": {
        "japanese": "スーパーの 前に バス停が あります。",
        "reading": "スーパーの まえに バスていが あります。",
        "vietnamese": "Phía trước siêu thị có trạm xe buýt."
      },
      "level3_expanded": {
        "japanese": "スーパーの 前に バス停が あって、ベンチも あります。",
        "reading": "スーパーの まえに バスていが あって、ベンチも あります。",
        "vietnamese": "Trước siêu thị có trạm xe buýt và ghế ngồi chờ."
      }
    }
  },
  {
    "id": "QA-IMG-L7-12",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Người đàn ông ở đâu",
    "hasImage": true,
    "imageType": "map_hospital",
    "imageDescription": "Bản đồ khu phố: Một người đàn ông đứng trước cổng bệnh viện",
    "questionJapanese": "おとこの ひとは どこに いますか。",
    "questionFurigana": "おとこの ひとは どこに いますか。",
    "questionVietnamese": "Người đàn ông đang ở đâu (theo tranh)?",
    "grammarPattern": "おとこのひとは [Địa điểm]の まえに います。",
    "keywords": [
      "おとこのひと",
      "どこに",
      "いますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "病院の前です。",
        "reading": "びょういんのまえです。",
        "vietnamese": "Trước bệnh viện."
      },
      "level2_polite": {
        "japanese": "男の 人は 病院の 前に います。",
        "reading": "おとこの ひとは びょういんの まえに います。",
        "vietnamese": "Người đàn ông đang ở phía trước bệnh viện."
      },
      "level3_expanded": {
        "japanese": "男の 人は 病院の 玄関の 前に います。電話を かけています。",
        "reading": "おとこの ひとは びょういんの げんかんの まえに います。でんわを かけています。",
        "vietnamese": "Người đàn ông ở trước cổng bệnh viện, đang gọi điện thoại."
      }
    }
  },
  {
    "id": "QA-IMG-L7-13",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Ai ở trước bệnh viện",
    "hasImage": true,
    "imageType": "map_hospital",
    "imageDescription": "Bản đồ khu phố: Phía trước bệnh viện có một người đàn ông",
    "questionJapanese": "びょういんの まえに だれが いますか。",
    "questionFurigana": "びょういんの まえに だれが いますか。",
    "questionVietnamese": "Phía trước bệnh viện có ai (theo tranh)?",
    "grammarPattern": "びょういんの まえに [Người]が います。",
    "keywords": [
      "びょういんのまえ",
      "だれが",
      "いますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "男の人です。",
        "reading": "おとこのひとです。",
        "vietnamese": "Người đàn ông."
      },
      "level2_polite": {
        "japanese": "病院の 前に 男の 人が います。",
        "reading": "びょういんの まえに おとこの ひとは います。",
        "vietnamese": "Có một người đàn ông ở phía trước bệnh viện."
      },
      "level3_expanded": {
        "japanese": "病院の 前に スーツを 着た 男の 人が います。",
        "reading": "びょういんの まえに スーツを きた おとこの ひとは います。",
        "vietnamese": "Trước bệnh viện có người đàn ông mặc âu phục."
      }
    }
  },
  {
    "id": "QA-IMG-L7-14",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Vị trí bệnh viện",
    "hasImage": true,
    "imageType": "map_hospital",
    "imageDescription": "Bản đồ khu phố: Tòa nhà bệnh viện (病院) nằm cạnh trường học và công viên",
    "questionJapanese": "びょういんは どこに ありますか。",
    "questionFurigana": "びょういんは どこに ありますか。",
    "questionVietnamese": "Bệnh viện nằm ở đâu (theo tranh)?",
    "grammarPattern": "びょういんは [N]の となりに あります。",
    "keywords": [
      "びょういん",
      "どこに",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "学校の隣です。",
        "reading": "がっこうのとなりです。",
        "vietnamese": "Bên cạnh trường học."
      },
      "level2_polite": {
        "japanese": "病院は 学校の 隣に あります。",
        "reading": "びょういんは がっこうの となりに あります。",
        "vietnamese": "Bệnh viện nằm ở bên cạnh trường học."
      },
      "level3_expanded": {
        "japanese": "病院は スーパーの 近くで、公園の 向かい側に あります。",
        "reading": "びょういんは スーパーの ちかくで、こうえんの むかいがわに あります。",
        "vietnamese": "Bệnh viện ở gần siêu thị, đối diện công viên."
      }
    }
  },
  {
    "id": "QA-IMG-L7-15",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Phía sau người đàn ông",
    "hasImage": true,
    "imageType": "map_hospital",
    "imageDescription": "Bản đồ khu phố: Phía sau người đàn ông là tòa nhà bệnh viện",
    "questionJapanese": "おとこのひとの うしろに 何が ありますか。",
    "questionFurigana": "おとこのひとの うしろに なにが ありますか。",
    "questionVietnamese": "Phía sau người đàn ông có cái gì (theo tranh)?",
    "grammarPattern": "おとこのひとの うしろに [N]が あります。",
    "keywords": [
      "おとこのひとのうしろ",
      "なにが",
      "ありますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "病院です。",
        "reading": "びょういんです。",
        "vietnamese": "Bệnh viện."
      },
      "level2_polite": {
        "japanese": "男の 人の 後ろに 病院が あります。",
        "reading": "おとこの ひとの うしろに びょういんが あります。",
        "vietnamese": "Phía sau người đàn ông có bệnh viện."
      },
      "level3_expanded": {
        "japanese": "男の 人の 後ろに 大きな 白い 病院が あります。",
        "reading": "おとこの ひとの うしろに おおきな しろい びょういんが あります。",
        "vietnamese": "Phía sau người đàn ông là bệnh viện lớn màu trắng."
      }
    }
  },
  {
    "id": "QA-IMG-L7-16",
    "lesson": 7,
    "part": 1,
    "partTitle": "Vấn đáp có tranh: Chú chó ở đâu",
    "hasImage": true,
    "imageType": "map_dog",
    "imageDescription": "Bản đồ khu phố: Một chú cún cưng dễ thương đang nằm ngủ dưới gốc cây lớn trong công viên",
    "questionJapanese": "いぬは どこに いますか。",
    "questionFurigana": "いぬは どこに いますか。",
    "questionVietnamese": "Con chó đang ở đâu (theo tranh)?",
    "grammarPattern": "いぬは [N]の [した／ちかく]に います。",
    "keywords": [
      "いぬは",
      "どこに",
      "いますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "木の下です。",
        "reading": "きのしたです。",
        "vietnamese": "Dưới gốc cây."
      },
      "level2_polite": {
        "japanese": "犬は 木の 下に います。",
        "reading": "いぬは きの したに います。",
        "vietnamese": "Con chó đang ở dưới gốc cây."
      },
      "level3_expanded": {
        "japanese": "犬は 公園の 大きい 木の 下で 寝ています。",
        "reading": "いぬは こうえんの おおきい きの したで ねています。",
        "vietnamese": "Chú chó đang nằm ngủ dưới gốc cây to trong công viên."
      }
    }
  },
  {
    "id": "QA-IMG-L7-17",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Nataphon hát",
    "hasImage": true,
    "imageType": "party_singing",
    "imageDescription": "Tranh bữa tiệc: Anh Nataphon cầm micro đang say sưa hát một bài hát tiếng Nhật",
    "questionJapanese": "だれが うたを うたっていますか。",
    "questionFurigana": "だれが うたを うたっていますか。",
    "questionVietnamese": "Ai đang hát thế (theo tranh)?",
    "grammarPattern": "[Người]が うたを うたっています。",
    "keywords": [
      "だれが",
      "うたを",
      "うたっていますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ナタポンさんです。",
        "reading": "ナタポンさんです。",
        "vietnamese": "Anh Nataphon."
      },
      "level2_polite": {
        "japanese": "ナタポンさんが 歌を 歌っています。",
        "reading": "ナタポンさんが うたを うたっています。",
        "vietnamese": "Anh Nataphon đang hát bài hát."
      },
      "level3_expanded": {
        "japanese": "ナタポンさんが マイクを 持って 歌を 歌っています。とても 上手です。",
        "reading": "ナタポンさんが マイクを もって うたを うたっています。とても じょうずです。",
        "vietnamese": "Anh Nataphon đang cầm mic hát. Anh ấy hát rất hay."
      }
    }
  },
  {
    "id": "QA-IMG-L7-18",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Hoạt động của Nataphon",
    "hasImage": true,
    "imageType": "party_singing",
    "imageDescription": "Tranh bữa tiệc: Anh Nataphon cầm micro vui vẻ hát trước mọi người",
    "questionJapanese": "ナタポンさんは なにを していますか。",
    "questionFurigana": "ナタポンさんは なにを していますか。",
    "questionVietnamese": "Anh Nataphon đang làm gì (theo tranh)?",
    "grammarPattern": "ナタポンさんは うたを うたっています。",
    "keywords": [
      "ナタポンさん",
      "なにを",
      "していますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "歌を 歌っています。",
        "reading": "うたを うたっています。",
        "vietnamese": "Đang hát."
      },
      "level2_polite": {
        "japanese": "ナタポンさんは 歌を 歌っています。",
        "reading": "ナタポンさんは うたを うたっています。",
        "vietnamese": "Anh Nataphon đang hát."
      },
      "level3_expanded": {
        "japanese": "ナタポンさんは みんなの 前で 楽しそうに 歌を 歌っています。",
        "reading": "ナタポンさんは みんなの まえで たのしそうに うたを うたっています。",
        "vietnamese": "Anh Nataphon đang vui vẻ hát trước mặt mọi người."
      }
    }
  },
  {
    "id": "QA-IMG-L7-19",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Santos xem TV",
    "hasImage": true,
    "imageType": "party_tv",
    "imageDescription": "Tranh bữa tiệc: Anh Santos ngồi trên ghế sofa đang chăm chú xem TV",
    "questionJapanese": "だれが テレビを みていますか。",
    "questionFurigana": "だれが テレビを みていますか。",
    "questionVietnamese": "Ai đang xem tivi thế (theo tranh)?",
    "grammarPattern": "[Người]が テレビを みています。",
    "keywords": [
      "だれが",
      "テレビを",
      "みていますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "サントスさんです。",
        "reading": "サントスさんです。",
        "vietnamese": "Anh Santos."
      },
      "level2_polite": {
        "japanese": "サントスさんが テレビを 見ています。",
        "reading": "サントスさんが テレビを みています。",
        "vietnamese": "Anh Santos đang xem tivi."
      },
      "level3_expanded": {
        "japanese": "サントスさんが ソファに 座って テレビを 見ています。",
        "reading": "サントスさんが ソファに すわって テレビを みています。",
        "vietnamese": "Anh Santos đang ngồi trên ghế sofa và xem tivi."
      }
    }
  },
  {
    "id": "QA-IMG-L7-20",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Hoạt động của Santos",
    "hasImage": true,
    "imageType": "party_tv",
    "imageDescription": "Tranh bữa tiệc: Anh Santos đang theo dõi chương trình trên TV",
    "questionJapanese": "サントスさんは なにを していますか。",
    "questionFurigana": "サントスさんは なにを していますか。",
    "questionVietnamese": "Anh Santos đang làm gì (theo tranh)?",
    "grammarPattern": "サントスさんは テレビを みています。",
    "keywords": [
      "サントスさん",
      "なにを",
      "していますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "テレビを 見ています。",
        "reading": "テレビを みています。",
        "vietnamese": "Đang xem tivi."
      },
      "level2_polite": {
        "japanese": "サントスさんは テレビを 見ています。",
        "reading": "サントスさんは テレビを みています。",
        "vietnamese": "Anh Santos đang xem tivi."
      },
      "level3_expanded": {
        "japanese": "サントスさんは サッカーの 試合の テレビを 見ています。",
        "reading": "サントスさんは サッカーの しあいの テレビを みています。",
        "vietnamese": "Anh Santos đang xem trận thi đấu bóng đá trên tivi."
      }
    }
  },
  {
    "id": "QA-IMG-L7-21",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Miller đọc sách",
    "hasImage": true,
    "imageType": "party_reading",
    "imageDescription": "Tranh bữa tiệc: Anh Miller (ミレー) ngồi góc phòng đang lật từng trang sách đọc",
    "questionJapanese": "だれが 本を よんでいますか。",
    "questionFurigana": "だれが ほんを よんでいますか。",
    "questionVietnamese": "Ai đang đọc sách thế (theo tranh)?",
    "grammarPattern": "[Người]が ほんを よんでいます。",
    "keywords": [
      "だれが",
      "ほんを",
      "よんでいますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ミレーさんです。",
        "reading": "ミレーさんです。",
        "vietnamese": "Anh Miller."
      },
      "level2_polite": {
        "japanese": "ミレーさんが 本を 読んでいます。",
        "reading": "ミレーさんが ほんを よんでいます。",
        "vietnamese": "Anh Miller đang đọc sách."
      },
      "level3_expanded": {
        "japanese": "ミレーさんが 窓の 近くで 静かに 本を 読んでいます。",
        "reading": "ミレーさんが まどの ちかくで しずかに ほんを よんでいます。",
        "vietnamese": "Anh Miller đang lặng lẽ đọc sách gần cửa sổ."
      }
    }
  },
  {
    "id": "QA-IMG-L7-22",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Hoạt động của Miller",
    "hasImage": true,
    "imageType": "party_reading",
    "imageDescription": "Tranh bữa tiệc: Anh Miller đang say sưa đọc cuốn sách",
    "questionJapanese": "ミレーさんは なにを していますか。",
    "questionFurigana": "ミレーさんは なにを していますか。",
    "questionVietnamese": "Anh Miller đang làm gì (theo tranh)?",
    "grammarPattern": "ミレーさんは ほんを よんでいます。",
    "keywords": [
      "ミレーさん",
      "なにを",
      "していますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "本を 読んでいます。",
        "reading": "ほんを よんでいます。",
        "vietnamese": "Đang đọc sách."
      },
      "level2_polite": {
        "japanese": "ミレーさんは 本を 読んでいます。",
        "reading": "ミレーさんは ほんを よんでいます。",
        "vietnamese": "Anh Miller đang đọc sách."
      },
      "level3_expanded": {
        "japanese": "ミレーさんは 日本語の 本を 熱心に 読んでいます。",
        "reading": "ミレーさんは にほんごの ほんを ねっしんに よんでいます。",
        "vietnamese": "Anh Miller đang chăm chú đọc một cuốn sách tiếng Nhật."
      }
    }
  },
  {
    "id": "QA-IMG-L7-23",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Carlos chơi guitar",
    "hasImage": true,
    "imageType": "party_guitar",
    "imageDescription": "Tranh bữa tiệc: Anh Carlos đang ôm cây đàn guitar và gảy những nốt nhạc vui tươi",
    "questionJapanese": "だれが ギターを ひいていますか。",
    "questionFurigana": "だれが ギターを ひいていますか。",
    "questionVietnamese": "Ai đang chơi đàn guitar thế (theo tranh)?",
    "grammarPattern": "[Người]が ギターを ひいています。",
    "keywords": [
      "だれが",
      "ギターを",
      "ひいていますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "カルロスさんです。",
        "reading": "カルロスさんです。",
        "vietnamese": "Anh Carlos."
      },
      "level2_polite": {
        "japanese": "カルロスさんが ギターを 弾いています。",
        "reading": "カルロスさんが ギターを ひいています。",
        "vietnamese": "Anh Carlos đang chơi guitar."
      },
      "level3_expanded": {
        "japanese": "カルロスさんが 笑顔で ギターを 弾いています。とても 上手です。",
        "reading": "カルロスさんが えがおで ギターを ひいています。とても じょうずです。",
        "vietnamese": "Anh Carlos đang tươi cười đánh đàn guitar. Anh đánh rất hay."
      }
    }
  },
  {
    "id": "QA-IMG-L7-24",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Hoạt động của Carlos",
    "hasImage": true,
    "imageType": "party_guitar",
    "imageDescription": "Tranh bữa tiệc: Anh Carlos đang gảy đàn guitar đệm nhạc",
    "questionJapanese": "カルロスさんは なにを していますか。",
    "questionFurigana": "カルロスさんは なにを していますか。",
    "questionVietnamese": "Anh Carlos đang làm gì (theo tranh)?",
    "grammarPattern": "カルロスさんは ギターを ひいています。",
    "keywords": [
      "カルロスさん",
      "なにを",
      "していますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "ギターを 弾いています。",
        "reading": "ギターを ひいています。",
        "vietnamese": "Đang chơi đàn guitar."
      },
      "level2_polite": {
        "japanese": "カルロスさんは ギターを 弾いています。",
        "reading": "カルロスさんは ギターを ひいています。",
        "vietnamese": "Anh Carlos đang gảy đàn guitar."
      },
      "level3_expanded": {
        "japanese": "カルロスさんは ナタポンさんの 歌に 合わせて ギターを 弾いています。",
        "reading": "カルロスさんは ナタポンさんの うたに あわせて ギターを ひいています。",
        "vietnamese": "Anh Carlos đang đệm đàn guitar hòa theo giọng hát của anh Nataphon."
      }
    }
  },
  {
    "id": "QA-IMG-L7-25",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Mary uống cà phê",
    "hasImage": true,
    "imageType": "party_coffee",
    "imageDescription": "Tranh bữa tiệc: Cô Mary đang cầm tách cà phê nóng thơm phức trên tay và thưởng thức",
    "questionJapanese": "だれが コーヒーを のんでいますか。",
    "questionFurigana": "だれが コーヒーを のんでいますか。",
    "questionVietnamese": "Ai đang uống cà phê thế (theo tranh)?",
    "grammarPattern": "[Người]が コーヒーを のんでいます。",
    "keywords": [
      "だれが",
      "コーヒーを",
      "のんでいますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "メアリーさんです。",
        "reading": "メアリーさんです。",
        "vietnamese": "Cô Mary."
      },
      "level2_polite": {
        "japanese": "メアリーさんが コーヒーを 飲んでいます。",
        "reading": "メアリーさんが コーヒーを のんでいます。",
        "vietnamese": "Cô Mary đang uống cà phê."
      },
      "level3_expanded": {
        "japanese": "メアリーさんが カップを 持って 温かい コーヒーを 飲んでいます。",
        "reading": "メアリーさんが カップを もって あたたかい コーヒーを のんでいます。",
        "vietnamese": "Cô Mary đang cầm tách uống cà phê nóng."
      }
    }
  },
  {
    "id": "QA-IMG-L7-26",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Hoạt động của Mary",
    "hasImage": true,
    "imageType": "party_coffee",
    "imageDescription": "Tranh bữa tiệc: Cô Mary đang nhâm nhi tách cà phê thơm ngon",
    "questionJapanese": "メアリーさんは なにを していますか。",
    "questionFurigana": "メアリーさんは なにを していますか。",
    "questionVietnamese": "Cô Mary đang làm gì (theo tranh)?",
    "grammarPattern": "メアリーさんは コーヒーを のんでいます。",
    "keywords": [
      "メアリーさん",
      "なにを",
      "していますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "コーヒーを 飲んでいます。",
        "reading": "コーヒーを のんでいます。",
        "vietnamese": "Đang uống cà phê."
      },
      "level2_polite": {
        "japanese": "メアリーさんは コーヒーを 飲んでいます。",
        "reading": "メアリーさんは コーヒーを のんでいます。",
        "vietnamese": "Cô Mary đang uống cà phê."
      },
      "level3_expanded": {
        "japanese": "メアリーさんは テーブルの 横で おいしそうに コーヒーを 飲んでいます。",
        "reading": "メアリーさんは テーブルの よこで おいしそうに コーヒーを のんでいます。",
        "vietnamese": "Cô Mary đang đứng cạnh bàn thưởng thức ly cà phê thơm ngon."
      }
    }
  },
  {
    "id": "QA-IMG-L7-27",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Elena ăn sushi",
    "hasImage": true,
    "imageType": "party_sushi",
    "imageDescription": "Tranh bữa tiệc: Cô Elena đang dùng đũa gắp một miếng sushi cá hồi ngon tuyệt",
    "questionJapanese": "だれが おすしを たべていますか。",
    "questionFurigana": "だれが おすしを たべていますか。",
    "questionVietnamese": "Ai đang ăn sushi thế (theo tranh)?",
    "grammarPattern": "[Người]が おすしを たべています。",
    "keywords": [
      "だれが",
      "おすしを",
      "たべていますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "エレナさんです。",
        "reading": "エレナさんです。",
        "vietnamese": "Cô Elena."
      },
      "level2_polite": {
        "japanese": "エレナさんが お寿司を 食べています。",
        "reading": "エレナさんが おすしを たべています。",
        "vietnamese": "Cô Elena đang ăn sushi."
      },
      "level3_expanded": {
        "japanese": "エレナさんが はしで おいしそうに お寿司を 食べています。",
        "reading": "エレナさんが はしで おいしそうに おすしを たべています。",
        "vietnamese": "Cô Elena đang dùng đũa gắp ăn sushi rất ngon miệng."
      }
    }
  },
  {
    "id": "QA-IMG-L7-28",
    "lesson": 7,
    "part": 3,
    "partTitle": "Vấn đáp có tranh: Bữa tiệc - Hoạt động của Elena",
    "hasImage": true,
    "imageType": "party_sushi",
    "imageDescription": "Tranh bữa tiệc: Cô Elena đang thưởng thức món sushi tươi ngon",
    "questionJapanese": "エレナさんは なにを していますか。",
    "questionFurigana": "エレナさんは なにを していますか。",
    "questionVietnamese": "Cô Elena đang làm gì (theo tranh)?",
    "grammarPattern": "エレナさんは おすしを たべています。",
    "keywords": [
      "エレナさん",
      "なにを",
      "していますか"
    ],
    "answers": {
      "level1_short": {
        "japanese": "お寿司を 食べています。",
        "reading": "おすしを たべています。",
        "vietnamese": "Đang ăn sushi."
      },
      "level2_polite": {
        "japanese": "エレナさんは お寿司を 食べています。",
        "reading": "エレナさんは おすしを たべています。",
        "vietnamese": "Cô Elena đang ăn sushi."
      },
      "level3_expanded": {
        "japanese": "エレナさんは サーモンの お寿司を 食べています。とても おいしそうです。",
        "reading": "エレナさんは サーモンの おすしを たべています。とても おいしそうです。",
        "vietnamese": "Cô Elena đang ăn sushi cá hồi. Trông rất là ngon."
      }
    }
  }
];

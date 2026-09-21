export type KanaType = 'hiragana' | 'katakana' | 'both';
export type KanaGroup = 'main' | 'dakuten' | 'combination' | 'extended';

export interface KanaItem {
  id: string; // unique id, e.g. "h-a", "k-ka", "h-kya"
  group: KanaGroup;
  rowId: string; // e.g. "a", "ka", "sa", "kya", etc.
  hiragana: string;
  katakana: string;
  romaji: string; // primary romaji
  aliases: string[]; // alternative valid romaji (e.g. ['si'] for 'shi')
  order: number;
  displayMode?: 'hiragana' | 'katakana';
}

export interface KanaRowDef {
  id: string;
  group: KanaGroup;
  labelHiragana: string; // e.g. "あ/a"
  labelKatakana: string; // e.g. "ア/a"
  primaryRomaji: string;
  items: KanaItem[];
}

export interface KanaFontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: 'Gothic' | 'Mincho' | 'Maru' | 'Handwriting';
  description: string;
}

export const KANA_FONT_OPTIONS: KanaFontOption[] = [
  {
    id: 'noto-sans-jp',
    name: 'Noto Sans JP (Gothic chuẩn)',
    fontFamily: "'Noto Sans JP', sans-serif",
    category: 'Gothic',
    description: 'Font chữ hiện đại, rõ nét, dễ đọc nhất cho người mới bắt đầu'
  },
  {
    id: 'zen-maru-gothic',
    name: 'Zen Maru Gothic (Bo tròn mềm mại)',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    category: 'Maru',
    description: 'Nét chữ tròn trịa, thân thiện, tương tự font trên app học tập'
  },
  {
    id: 'shippori-mincho',
    name: 'Shippori Mincho (Nét bút lông truyền thống)',
    fontFamily: "'Shippori Mincho', serif",
    category: 'Mincho',
    description: 'Phong cách thư pháp Mincho thanh lịch chuẩn sách giáo khoa Nhật Bản'
  },
  {
    id: 'kosugi-maru',
    name: 'Kosugi Maru (Nét tròn tối giản)',
    fontFamily: "'Kosugi Maru', sans-serif",
    category: 'Maru',
    description: 'Font tròn gọn gàng, độ dày đồng đều'
  }
];

// Helper to create KanaItem
const item = (
  rowId: string,
  group: KanaGroup,
  hiragana: string,
  katakana: string,
  romaji: string,
  aliases: string[] = [],
  order: number = 0
): KanaItem => ({
  id: `${group}-${hiragana}`,
  group,
  rowId,
  hiragana,
  katakana,
  romaji,
  aliases: Array.from(new Set([romaji.toLowerCase(), ...aliases.map((a) => a.toLowerCase())])),
  order
});

/* ==========================================================================
   1. MAIN KANA (Gojuon - 46 cơ bản)
   ========================================================================== */
export const MAIN_KANA_ROWS: KanaRowDef[] = [
  {
    id: 'a',
    group: 'main',
    labelHiragana: 'あ/a',
    labelKatakana: 'ア/a',
    primaryRomaji: 'a',
    items: [
      item('a', 'main', 'あ', 'ア', 'a', [], 1),
      item('a', 'main', 'い', 'イ', 'i', [], 2),
      item('a', 'main', 'う', 'ウ', 'u', [], 3),
      item('a', 'main', 'え', 'エ', 'e', [], 4),
      item('a', 'main', 'お', 'オ', 'o', [], 5)
    ]
  },
  {
    id: 'ka',
    group: 'main',
    labelHiragana: 'か/ka',
    labelKatakana: 'カ/ka',
    primaryRomaji: 'ka',
    items: [
      item('ka', 'main', 'か', 'カ', 'ka', [], 6),
      item('ka', 'main', 'き', 'キ', 'ki', [], 7),
      item('ka', 'main', 'く', 'ク', 'ku', [], 8),
      item('ka', 'main', 'け', 'ケ', 'ke', [], 9),
      item('ka', 'main', 'こ', 'コ', 'ko', [], 10)
    ]
  },
  {
    id: 'sa',
    group: 'main',
    labelHiragana: 'さ/sa',
    labelKatakana: 'サ/sa',
    primaryRomaji: 'sa',
    items: [
      item('sa', 'main', 'さ', 'サ', 'sa', [], 11),
      item('sa', 'main', 'し', 'シ', 'shi', ['si'], 12),
      item('sa', 'main', 'す', 'ス', 'su', [], 13),
      item('sa', 'main', 'せ', 'セ', 'se', [], 14),
      item('sa', 'main', 'そ', 'ソ', 'so', [], 15)
    ]
  },
  {
    id: 'ta',
    group: 'main',
    labelHiragana: 'た/ta',
    labelKatakana: 'タ/ta',
    primaryRomaji: 'ta',
    items: [
      item('ta', 'main', 'た', 'タ', 'ta', [], 16),
      item('ta', 'main', 'ち', 'チ', 'chi', ['ti'], 17),
      item('ta', 'main', 'つ', 'ツ', 'tsu', ['tu'], 18),
      item('ta', 'main', 'て', 'テ', 'te', [], 19),
      item('ta', 'main', 'と', 'ト', 'to', [], 20)
    ]
  },
  {
    id: 'na',
    group: 'main',
    labelHiragana: 'な/na',
    labelKatakana: 'ナ/na',
    primaryRomaji: 'na',
    items: [
      item('na', 'main', 'な', 'ナ', 'na', [], 21),
      item('na', 'main', 'に', 'ニ', 'ni', [], 22),
      item('na', 'main', 'ぬ', 'ヌ', 'nu', [], 23),
      item('na', 'main', 'ね', 'ネ', 'ne', [], 24),
      item('na', 'main', 'の', 'ノ', 'no', [], 25)
    ]
  },
  {
    id: 'ha',
    group: 'main',
    labelHiragana: 'は/ha',
    labelKatakana: 'ハ/ha',
    primaryRomaji: 'ha',
    items: [
      item('ha', 'main', 'は', 'ハ', 'ha', [], 26),
      item('ha', 'main', 'ひ', 'ヒ', 'hi', [], 27),
      item('ha', 'main', 'ふ', 'フ', 'fu', ['hu'], 28),
      item('ha', 'main', 'へ', 'ヘ', 'he', [], 29),
      item('ha', 'main', 'ほ', 'ホ', 'ho', [], 30)
    ]
  },
  {
    id: 'ma',
    group: 'main',
    labelHiragana: 'ま/ma',
    labelKatakana: 'マ/ma',
    primaryRomaji: 'ma',
    items: [
      item('ma', 'main', 'ま', 'マ', 'ma', [], 31),
      item('ma', 'main', 'み', 'ミ', 'mi', [], 32),
      item('ma', 'main', 'む', 'ム', 'mu', [], 33),
      item('ma', 'main', 'め', 'メ', 'me', [], 34),
      item('ma', 'main', 'も', 'モ', 'mo', [], 35)
    ]
  },
  {
    id: 'ya',
    group: 'main',
    labelHiragana: 'や/ya',
    labelKatakana: 'ヤ/ya',
    primaryRomaji: 'ya',
    items: [
      item('ya', 'main', 'や', 'ヤ', 'ya', [], 36),
      item('ya', 'main', 'ゆ', 'ユ', 'yu', [], 37),
      item('ya', 'main', 'よ', 'ヨ', 'yo', [], 38)
    ]
  },
  {
    id: 'ra',
    group: 'main',
    labelHiragana: 'ら/ra',
    labelKatakana: 'ラ/ra',
    primaryRomaji: 'ra',
    items: [
      item('ra', 'main', 'ら', 'ラ', 'ra', [], 39),
      item('ra', 'main', 'り', 'リ', 'ri', [], 40),
      item('ra', 'main', 'る', 'ル', 'ru', [], 41),
      item('ra', 'main', 'れ', 'レ', 're', [], 42),
      item('ra', 'main', 'ろ', 'ロ', 'ro', [], 43)
    ]
  },
  {
    id: 'wa',
    group: 'main',
    labelHiragana: 'わ/wa',
    labelKatakana: 'ワ/wa',
    primaryRomaji: 'wa',
    items: [
      item('wa', 'main', 'わ', 'ワ', 'wa', [], 44),
      item('wa', 'main', 'を', 'ヲ', 'wo', ['o'], 45),
      item('wa', 'main', 'ん', 'ン', 'n', ['nn'], 46)
    ]
  }
];

/* ==========================================================================
   2. DAKUTEN KANA (Dakuon & Handakuon - 25 âm đục và bán đục)
   ========================================================================== */
export const DAKUTEN_KANA_ROWS: KanaRowDef[] = [
  {
    id: 'ga',
    group: 'dakuten',
    labelHiragana: 'が/ga',
    labelKatakana: 'ガ/ga',
    primaryRomaji: 'ga',
    items: [
      item('ga', 'dakuten', 'が', 'ガ', 'ga', [], 47),
      item('ga', 'dakuten', 'ぎ', 'ギ', 'gi', [], 48),
      item('ga', 'dakuten', 'ぐ', 'グ', 'gu', [], 49),
      item('ga', 'dakuten', 'げ', 'ゲ', 'ge', [], 50),
      item('ga', 'dakuten', 'ご', 'ゴ', 'go', [], 51)
    ]
  },
  {
    id: 'za',
    group: 'dakuten',
    labelHiragana: 'ざ/za',
    labelKatakana: 'ザ/za',
    primaryRomaji: 'za',
    items: [
      item('za', 'dakuten', 'ざ', 'ザ', 'za', [], 52),
      item('za', 'dakuten', 'じ', 'ジ', 'ji', ['zi'], 53),
      item('za', 'dakuten', 'ず', 'ズ', 'zu', [], 54),
      item('za', 'dakuten', 'ぜ', 'ゼ', 'ze', [], 55),
      item('za', 'dakuten', 'ぞ', 'ゾ', 'zo', [], 56)
    ]
  },
  {
    id: 'da',
    group: 'dakuten',
    labelHiragana: 'だ/da',
    labelKatakana: 'ダ/da',
    primaryRomaji: 'da',
    items: [
      item('da', 'dakuten', 'だ', 'ダ', 'da', [], 57),
      item('da', 'dakuten', 'ぢ', 'ヂ', 'ji', ['di', 'dji'], 58),
      item('da', 'dakuten', 'づ', 'ヅ', 'zu', ['du', 'dzu'], 59),
      item('da', 'dakuten', 'で', 'デ', 'de', [], 60),
      item('da', 'dakuten', 'ど', 'ド', 'do', [], 61)
    ]
  },
  {
    id: 'ba',
    group: 'dakuten',
    labelHiragana: 'ば/ba',
    labelKatakana: 'バ/ba',
    primaryRomaji: 'ba',
    items: [
      item('ba', 'dakuten', 'ば', 'バ', 'ba', [], 62),
      item('ba', 'dakuten', 'び', 'ビ', 'bi', [], 63),
      item('ba', 'dakuten', 'ぶ', 'ブ', 'bu', [], 64),
      item('ba', 'dakuten', 'べ', 'ベ', 'be', [], 65),
      item('ba', 'dakuten', 'ぼ', 'ボ', 'bo', [], 66)
    ]
  },
  {
    id: 'pa',
    group: 'dakuten',
    labelHiragana: 'ぱ/pa',
    labelKatakana: 'パ/pa',
    primaryRomaji: 'pa',
    items: [
      item('pa', 'dakuten', 'ぱ', 'パ', 'pa', [], 67),
      item('pa', 'dakuten', 'ぴ', 'ピ', 'pi', [], 68),
      item('pa', 'dakuten', 'ぷ', 'プ', 'pu', [], 69),
      item('pa', 'dakuten', 'ぺ', 'ペ', 'pe', [], 70),
      item('pa', 'dakuten', 'ぽ', 'ポ', 'po', [], 71)
    ]
  }
];

/* ==========================================================================
   3. COMBINATION KANA (Yōon - 36 âm ghép)
   ========================================================================== */
export const COMBINATION_KANA_ROWS: KanaRowDef[] = [
  {
    id: 'kya',
    group: 'combination',
    labelHiragana: 'きゃ/kya',
    labelKatakana: 'キャ/kya',
    primaryRomaji: 'kya',
    items: [
      item('kya', 'combination', 'きゃ', 'キャ', 'kya', [], 72),
      item('kya', 'combination', 'きゅ', 'キュ', 'kyu', [], 73),
      item('kya', 'combination', 'きょ', 'キョ', 'kyo', [], 74)
    ]
  },
  {
    id: 'sha',
    group: 'combination',
    labelHiragana: 'しゃ/sha',
    labelKatakana: 'シャ/sha',
    primaryRomaji: 'sha',
    items: [
      item('sha', 'combination', 'しゃ', 'シャ', 'sha', ['sya'], 75),
      item('sha', 'combination', 'しゅ', 'シュ', 'shu', ['syu'], 76),
      item('sha', 'combination', 'しょ', 'ショ', 'sho', ['syo'], 77)
    ]
  },
  {
    id: 'cha',
    group: 'combination',
    labelHiragana: 'ちゃ/cha',
    labelKatakana: 'チャ/cha',
    primaryRomaji: 'cha',
    items: [
      item('cha', 'combination', 'ちゃ', 'チャ', 'cha', ['tya'], 78),
      item('cha', 'combination', 'ちゅ', 'チュ', 'chu', ['tyu'], 79),
      item('cha', 'combination', 'ちょ', 'チョ', 'cho', ['tyo'], 80)
    ]
  },
  {
    id: 'nya',
    group: 'combination',
    labelHiragana: 'にゃ/nya',
    labelKatakana: 'ニャ/nya',
    primaryRomaji: 'nya',
    items: [
      item('nya', 'combination', 'にゃ', 'ニャ', 'nya', [], 81),
      item('nya', 'combination', 'にゅ', 'ニュ', 'nyu', [], 82),
      item('nya', 'combination', 'にょ', 'ニョ', 'nyo', [], 83)
    ]
  },
  {
    id: 'hya',
    group: 'combination',
    labelHiragana: 'ひゃ/hya',
    labelKatakana: 'ヒャ/hya',
    primaryRomaji: 'hya',
    items: [
      item('hya', 'combination', 'ひゃ', 'ヒャ', 'hya', [], 84),
      item('hya', 'combination', 'ひゅ', 'ヒュ', 'hyu', [], 85),
      item('hya', 'combination', 'ひょ', 'ヒョ', 'hyo', [], 86)
    ]
  },
  {
    id: 'mya',
    group: 'combination',
    labelHiragana: 'みゃ/mya',
    labelKatakana: 'ミャ/mya',
    primaryRomaji: 'mya',
    items: [
      item('mya', 'combination', 'みゃ', 'ミャ', 'mya', [], 87),
      item('mya', 'combination', 'みゅ', 'ミュ', 'myu', [], 88),
      item('mya', 'combination', 'みょ', 'ミョ', 'myo', [], 89)
    ]
  },
  {
    id: 'rya',
    group: 'combination',
    labelHiragana: 'りゃ/rya',
    labelKatakana: 'リャ/rya',
    primaryRomaji: 'rya',
    items: [
      item('rya', 'combination', 'りゃ', 'リャ', 'rya', [], 90),
      item('rya', 'combination', 'りゅ', 'リュ', 'ryu', [], 91),
      item('rya', 'combination', 'りょ', 'リョ', 'ryo', [], 92)
    ]
  },
  {
    id: 'gya',
    group: 'combination',
    labelHiragana: 'ぎゃ/gya',
    labelKatakana: 'ギャ/gya',
    primaryRomaji: 'gya',
    items: [
      item('gya', 'combination', 'ぎゃ', 'ギャ', 'gya', [], 93),
      item('gya', 'combination', 'ぎゅ', 'ギュ', 'gyu', [], 94),
      item('gya', 'combination', 'ぎょ', 'ギョ', 'gyo', [], 95)
    ]
  },
  {
    id: 'ja',
    group: 'combination',
    labelHiragana: 'じゃ/ja',
    labelKatakana: 'ジャ/ja',
    primaryRomaji: 'ja',
    items: [
      item('ja', 'combination', 'じゃ', 'ジャ', 'ja', ['jya', 'zya'], 96),
      item('ja', 'combination', 'じゅ', 'ジュ', 'ju', ['jyu', 'zyu'], 97),
      item('ja', 'combination', 'じょ', 'ジョ', 'jo', ['jyo', 'zyo'], 98)
    ]
  },
  {
    id: 'dya',
    group: 'combination',
    labelHiragana: 'ぢゃ/dya',
    labelKatakana: 'ヂャ/dya',
    primaryRomaji: 'dya',
    items: [
      item('dya', 'combination', 'ぢゃ', 'ヂャ', 'dya', ['ja', 'zya'], 99),
      item('dya', 'combination', 'ぢゅ', 'ヂュ', 'dyu', ['ju', 'zyu'], 100),
      item('dya', 'combination', 'ぢょ', 'ヂョ', 'dyo', ['jo', 'zyo'], 101)
    ]
  },
  {
    id: 'bya',
    group: 'combination',
    labelHiragana: 'びゃ/bya',
    labelKatakana: 'ビャ/bya',
    primaryRomaji: 'bya',
    items: [
      item('bya', 'combination', 'びゃ', 'ビャ', 'bya', [], 102),
      item('bya', 'combination', 'びゅ', 'ビュ', 'byu', [], 103),
      item('bya', 'combination', 'びょ', 'ビョ', 'byo', [], 104)
    ]
  },
  {
    id: 'pya',
    group: 'combination',
    labelHiragana: 'ぴゃ/pya',
    labelKatakana: 'ピャ/pya',
    primaryRomaji: 'pya',
    items: [
      item('pya', 'combination', 'ぴゃ', 'ピャ', 'pya', [], 105),
      item('pya', 'combination', 'ぴゅ', 'ピュ', 'pyu', [], 106),
      item('pya', 'combination', 'ぴょ', 'ピョ', 'pyo', [], 107)
    ]
  }
];

/* ==========================================================================
   4. EXTENDED KATAKANA (Tokushuon - 20 âm ngoại lai mượn tiếng nước ngoài)
   ========================================================================== */
export const EXTENDED_KATAKANA_ROWS: KanaRowDef[] = [
  {
    id: 'va',
    group: 'extended',
    labelHiragana: 'ヴ/va',
    labelKatakana: 'ヴ/va',
    primaryRomaji: 'va',
    items: [
      item('va', 'extended', 'ゔぁ', 'ヴァ', 'va', [], 108),
      item('va', 'extended', 'ゔぃ', 'ヴィ', 'vi', [], 109),
      item('va', 'extended', 'ゔ', 'ヴ', 'vu', ['v'], 110),
      item('va', 'extended', 'ゔぇ', 'ヴェ', 've', [], 111),
      item('va', 'extended', 'ゔぉ', 'ヴォ', 'vo', [], 112)
    ]
  },
  {
    id: 'fa',
    group: 'extended',
    labelHiragana: 'ふぁ/fa',
    labelKatakana: 'ファ/fa',
    primaryRomaji: 'fa',
    items: [
      item('fa', 'extended', 'ふぁ', 'ファ', 'fa', [], 113),
      item('fa', 'extended', 'ふぃ', 'フィ', 'fi', [], 114),
      item('fa', 'extended', 'ふぇ', 'フェ', 'fe', [], 115),
      item('fa', 'extended', 'ふぉ', 'フォ', 'fo', [], 116)
    ]
  },
  {
    id: 'ti',
    group: 'extended',
    labelHiragana: 'てぃ/ti',
    labelKatakana: 'ティ/ti',
    primaryRomaji: 'ti',
    items: [
      item('ti', 'extended', 'てぃ', 'ティ', 'ti', ['thi'], 117),
      item('ti', 'extended', 'でぃ', 'ディ', 'di', ['dhi'], 118),
      item('ti', 'extended', 'とぅ', 'トゥ', 'tu', ['thu'], 119),
      item('ti', 'extended', 'どぅ', 'ドゥ', 'du', ['dhu'], 120)
    ]
  },
  {
    id: 'wi',
    group: 'extended',
    labelHiragana: 'うぃ/wi',
    labelKatakana: 'ウィ/wi',
    primaryRomaji: 'wi',
    items: [
      item('wi', 'extended', 'うぃ', 'ウィ', 'wi', ['ui'], 121),
      item('wi', 'extended', 'うぇ', 'ウェ', 'we', ['ue'], 122),
      item('wi', 'extended', 'うぉ', 'ウォ', 'wo', ['uo'], 123)
    ]
  },
  {
    id: 'she',
    group: 'extended',
    labelHiragana: 'しぇ/she',
    labelKatakana: 'シェ/she',
    primaryRomaji: 'she',
    items: [
      item('she', 'extended', 'しぇ', 'シェ', 'she', ['sye'], 124),
      item('she', 'extended', 'じぇ', 'ジェ', 'je', ['zye', 'jye'], 125),
      item('she', 'extended', 'ちぇ', 'チェ', 'che', ['tye'], 126)
    ]
  }
];

export const ALL_KANA_ROWS = [
  ...MAIN_KANA_ROWS,
  ...DAKUTEN_KANA_ROWS,
  ...COMBINATION_KANA_ROWS,
  ...EXTENDED_KATAKANA_ROWS
];

export const TOTAL_KANA_COUNT = ALL_KANA_ROWS.reduce(
  (acc, row) => acc + row.items.length,
  0
);

import type { ZiweiChart } from './types';
import type { TopicKey } from './db-analysis';
import { STEMS, BRANCHES } from './constants';
import { detectPatterns } from './patterns';
import { STAR_IN_FUQI_GU, SIHUA_IN_FUQI_GU } from './heming-knowledge';
import {
  translatePalaceName,
  translateStarName,
  translateBrightness,
  translateSiHua,
  translateStem,
  translateBranch,
  translateWuxingJu,
  translateYinYangGender,
  STAR_DETAILS_VI,
  formatPalaceStarsSummaryVi,
  localizePattern,
  translateChineseAstrologyText,
} from '../utils/ziweiLocalization';
import tianjiEntriesRaw from '../data/tianjiEntries.json';
import { guSuiFu } from '../data/classics/gusuifu';
import { ziWeiQuanShu } from '../data/classics/quanshu';
import { ziWeiQuanJi } from '../data/classics/quanji';

export interface TianjiCorpusEntry {
  book: string;
  h2: string;
  h3: string;
  quote: string;
  section: number;
  t_hms: string;
  note: string;
  bvid: string;
  part: number;
}

const TIANJI_CORPUS = tianjiEntriesRaw as TianjiCorpusEntry[];

export interface ThirteenDimensionMeta {
  key: TopicKey;
  index: number;
  labelVi: string;
  subVi: string;
  palacePrefixCn: string;
  secondaryPalacePrefixCn?: string;
  principleVi: string;
}

export const THIRTEEN_DIMENSIONS_META: ThirteenDimensionMeta[] = [
  {
    key: 'overview',
    index: 1,
    labelVi: '1. Tổng Quan',
    subVi: 'Mệnh Cách & Đại Cục',
    palacePrefixCn: '命宫',
    secondaryPalacePrefixCn: '身宫',
    principleVi:
      '“Đại đạo chí giản — lấy Mệnh cung làm gốc tiên thiên, Thân cung làm hậu vận, Tam phương tứ chính (Mệnh – Tài – Quan – Di) làm dụng.”',
  },
  {
    key: 'personality',
    index: 2,
    labelVi: '2. Tính Cách',
    subVi: 'Khí Chất & Hành Xử',
    palacePrefixCn: '命宫',
    secondaryPalacePrefixCn: '福德',
    principleVi:
      '“Mệnh cung là khí chất biểu hiện ra ngoài, Thân cung là hành động hậu thiên, Phúc Đức là tư duy tiềm thức sâu thẳm.”',
  },
  {
    key: 'love',
    index: 3,
    labelVi: '3. Tình Duyên',
    subVi: 'Phu Thê & Phúc Đức',
    palacePrefixCn: '夫妻',
    secondaryPalacePrefixCn: '福德',
    principleVi:
      '“Xem hôn nhân chỉ nhìn cung Phu Thê là sai lầm lớn, bắt buộc phải đồng tham cung Phúc Đức — Phúc Đức mới là gốc rễ giữ gìn hạnh phúc.”',
  },
  {
    key: 'career',
    index: 4,
    labelVi: '4. Sự Nghiệp',
    subVi: 'Quan Lộc & Công Danh',
    palacePrefixCn: '官禄',
    secondaryPalacePrefixCn: '命宫',
    principleVi:
      '“Cung Quan Lộc định hình phương thức lập nghiệp: Cơ Nguyệt Đồng Lương hợp chuyên môn tổ chức; Sát Phá Tham hợp khai phá tự chủ.”',
  },
  {
    key: 'wealth',
    index: 5,
    labelVi: '5. Tài Chính',
    subVi: 'Tài Bạch & Dòng Tiền',
    palacePrefixCn: '财帛',
    secondaryPalacePrefixCn: '福德',
    principleVi:
      '“Cung Tài Bạch là dòng tiền lưu thông, đối chiếu với cung Phúc Đức (nguồn sinh tài) và Điền Trạch (kho giữ tiền).”',
  },
  {
    key: 'health',
    index: 6,
    labelVi: '6. Sức Khỏe',
    subVi: 'Tật Ách & Đông Y',
    palacePrefixCn: '疾厄',
    secondaryPalacePrefixCn: '命宫',
    principleVi:
      '“Y Dịch đồng nguyên — Cung Tật Ách kết hợp Địa chi và Ngũ hành tạng phủ Đông Y giúp nhận diện sớm cơ quan cần dưỡng sinh.”',
  },
  {
    key: 'family',
    index: 7,
    labelVi: '7. Anh Em',
    subVi: 'Huynh Đệ & Cổ Đông',
    palacePrefixCn: '兄弟',
    secondaryPalacePrefixCn: '交友',
    principleVi:
      '“Cung Huynh Đệ vừa chỉ anh chị em ruột thịt, vừa là cung xét đối tác hùn vốn và kho tiền mặt lưu động (Tài Bạch của Điền Trạch).”',
  },
  {
    key: 'children',
    index: 8,
    labelVi: '8. Con Cái',
    subVi: 'Tử Nữ & Hậu Đệ',
    palacePrefixCn: '子女',
    secondaryPalacePrefixCn: '田宅',
    principleVi:
      '“Cung Tử Nữ phản ánh duyên phận con cái, học trò, người kế cận và phúc ấm tuổi già (xung chiếu Điền Trạch).”',
  },
  {
    key: 'move',
    index: 9,
    labelVi: '9. Xuất Ngoại',
    subVi: 'Thiên Di & Phương Xa',
    palacePrefixCn: '迁移',
    secondaryPalacePrefixCn: '命宫',
    principleVi:
      '“Cung Thiên Di là bộ mặt khi bước ra xã hội, cơ hội lập nghiệp phương xa, xuất ngoại và quý nhân nơi đất khách.”',
  },
  {
    key: 'friends',
    index: 10,
    labelVi: '10. Quan Hệ',
    subVi: 'Nô Bộc & Quý Nhân',
    palacePrefixCn: '交友',
    secondaryPalacePrefixCn: '兄弟',
    principleVi:
      '“Cung Nô Bộc (Giao Hữu) cho biết chất lượng bạn bè, thuộc cấp, khách hàng và những người mình tiếp xúc ngoài xã hội.”',
  },
  {
    key: 'home',
    index: 11,
    labelVi: '11. Nhà Cửa',
    subVi: 'Điền Trạch & Cơ Nghiệp',
    palacePrefixCn: '田宅',
    secondaryPalacePrefixCn: '财帛',
    principleVi:
      '“Điền Trạch là kho tàng tích lũy bất động sản, môi trường gia trạch và phong thủy nơi cư ngụ của đương số.”',
  },
  {
    key: 'spirit',
    index: 12,
    labelVi: '12. Phúc Đức',
    subVi: 'Tinh Thần & Thọ Nguyên',
    palacePrefixCn: '福德',
    secondaryPalacePrefixCn: '财帛',
    principleVi:
      '“Phúc Đức quản hạt thế giới tinh thần, mức độ an lạc nội tâm, phúc ấm tổ tiên và vận trình hưởng phúc hậu vận.”',
  },
  {
    key: 'parents',
    index: 13,
    labelVi: '13. Cha Mẹ',
    subVi: 'Phụ Mẫu & Pháp Lý',
    palacePrefixCn: '父母',
    secondaryPalacePrefixCn: '疾厄',
    principleVi:
      '“Cung Phụ Mẫu biểu thị duyên phận với cha mẹ, thầy cô, cấp trên trực tiếp, đồng thời chủ về văn thư pháp lý và tướng mạo di truyền.”',
  },
];

// Đông Y 12 Địa Chi Tạng Phủ (Dùng cho chiều số 6: Sức Khỏe / Tật Ách)
const BRANCH_TCM_ORGANS_VI: Record<number, { organVi: string; adviceVi: string }> = {
  0: {
    organVi: 'Thận Thủy, Bàng Quang, Tai & Hệ Tiết Niệu Sinh Dục (Cung Tý – Dương Thủy)',
    adviceVi:
      'Tránh thức khuya sau 23h (giờ Đởm – Can), giữ ấm vùng thắt lưng và lòng bàn chân (huyệt Dũng Tuyền).',
  },
  1: {
    organVi: 'Tỳ Thổ, Gan Mật & Hệ Tiêu Hóa Dưới (Cung Sửu – Âm Thổ)',
    adviceVi:
      'Hạn chế đồ ăn sống lạnh, ẩm thấp; ăn uống đúng giờ để dưỡng Tỳ khí.',
  },
  2: {
    organVi: 'Đởm Mộc (Mật), Khớp Tứ Chi & Hệ Cơ Gân (Cung Dần – Dương Mộc)',
    adviceVi:
      'Duy trì vận động giãn gân cốt buổi sáng, tránh nóng giận làm uất Đởm khí.',
  },
  3: {
    organVi: 'Can Mộc (Gan), Mắt & Hệ Thần Kinh (Cung Mão – Âm Mộc)',
    adviceVi:
      'Tránh căng thẳng thần kinh kéo dài và điều tiết thời gian nhìn màn hình để dưỡng Can huyết.',
  },
  4: {
    organVi: 'Vị Thổ (Dạ Dày), Da & Hệ Bạch Huyết (Cung Thìn – Dương Thổ)',
    adviceVi:
      'Ăn chậm nhai kỹ, tránh bỏ bữa sáng (7h–9h là giờ Kinh Vị vượng nhất).',
  },
  5: {
    organVi: 'Tâm Hỏa, Tiểu Trường & Tuần Hoàn Máu (Cung Tỵ – Âm Hỏa)',
    adviceVi:
      'Giữ tâm thái bình hòa, chợp mắt buổi trưa (11h–13h) để dưỡng Tâm huyết.',
  },
  6: {
    organVi: 'Tâm Hỏa, Huyết Mạch, Mắt & Thần Minh (Cung Ngọ – Dương Hỏa)',
    adviceVi:
      'Chú ý huyết áp, tim mạch và giấc ngủ sâu; tránh dùng chất kích thích quá độ.',
  },
  7: {
    organVi: 'Tỳ Vị, Tiểu Trường & Cột Sống Lưng (Cung Mùi – Âm Thổ)',
    adviceVi:
      'Tăng cường thực phẩm ấm kiện Tỳ, hạn chế đồ ngọt béo gây đàm thấp.',
  },
  8: {
    organVi: 'Đại Trường, Phế Kim & Hệ Hô Hấp (Cung Thân – Dương Kim)',
    adviceVi:
      'Tập hít thở sâu buổi sáng sớm, uống đủ nước ấm để nhuận Đại trường.',
  },
  9: {
    organVi: 'Phế Kim (Phổi), Khí Quản, Mũi Họng & Da (Cung Dậu – Âm Kim)',
    adviceVi:
      'Bảo vệ đường hô hấp khi giao mùa, tránh để hàn khí xâm nhập vùng cổ ngực.',
  },
  10: {
    organVi: 'Mệnh Môn, Tâm Bào & Tuần Hoàn Hạ Tiêu (Cung Tuất – Dương Thổ)',
    adviceVi:
      'Giữ ấm nguyên khí hạ tiêu, kết hợp vận động nhẹ nhàng điều hòa khí huyết.',
  },
  11: {
    organVi: 'Tam Tiêu, Thận Thủy & Nội Tiết Toàn Thân (Cung Hợi – Âm Thủy)',
    adviceVi:
      'Chú trọng cân bằng nội tiết, ngâm chân nước ấm trước khi ngủ để dẫn hỏa quy nguyên.',
  },
};

// Luận giải đặc thù của 14 Chính Tinh khi rơi vào từng nhóm Chủ đề
const STAR_DIMENSION_TRAITS_VI: Record<
  string,
  {
    coreToneVi: string;
    careerWealthVi: string;
    relationshipVi: string;
    healthVi: string;
  }
> = {
  紫微: {
    coreToneVi:
      'Đế tinh Bắc Đẩu chủ về uy quyền, tự tôn, tầm nhìn lãnh đạo và khí chất đứng đầu.',
    careerWealthVi:
      'Hợp quản trị cấp cao, điều hành tổ chức, thương hiệu cao cấp hoặc cơ quan trọng yếu; cần Tả Hữu hội chiếu để tránh cô quân.',
    relationshipVi:
      'Trong quan hệ lục thân và tình cảm rất trọng danh dự và sự tôn trọng; hợp bạn đời/đối tác chín chắn, có năng lực độc lập.',
    healthVi: 'Thuộc Âm Thổ, cần lưu ý hệ tiêu hóa (Tỳ Vị) và áp lực thần kinh do suy nghĩ đại cuộc.',
  },
  天机: {
    coreToneVi:
      'Thiện tinh chủ về trí tuệ mưu lược, linh hoạt, nhạy bén số liệu và biến dịch không ngừng.',
    careerWealthVi:
      'Rất hợp công nghệ, kế hoạch, cố vấn chiến lược, giáo dục, nghiên cứu và thương mại linh hoạt; kỵ đầu cơ liều lĩnh khi gặp Hóa Kỵ.',
    relationshipVi:
      'Tư duy tinh tế nhưng dễ suy nghĩ nhiều; trong gia đạo và đối tác cần sự chia sẻ thẳng thắn để tránh đa nghi.',
    healthVi: 'Thuộc Ất Mộc, chủ về Can Đởm (gan mật), hệ thần kinh, giấc ngủ và tứ chi.',
  },
  太阳: {
    coreToneVi:
      'Quang minh chi tinh chủ về博愛 (bác ái), cống hiến, danh tiếng xã hội và chiếu sáng bốn phương.',
    careerWealthVi:
      'Phát huy mạnh trong ngoại giao, truyền thông, quản lý công, pháp luật, dịch vụ cộng đồng; danh đi trước lợi theo sau.',
    relationshipVi:
      'Đại diện cho người nam (cha, chồng, con trai); khi Miếu Vượng rất hào sảng che chở lục thân, khi Hãm địa dễ vất vả vì người thân.',
    healthVi: 'Thuộc Bính Hỏa, chủ về tim mạch, huyết áp, mắt (đặc biệt mắt trái) và đầu mặt.',
  },
  武曲: {
    coreToneVi:
      'Chính Tài tinh Bắc Đẩu chủ về cương nghị, thực tế, quyết đoán và kỷ luật hành động.',
    careerWealthVi:
      'Bậc thầy về tài chính, ngân hàng, kỹ thuật, quân đội, kinh doanh thực nghiệp; càng thực chiến càng phát tài.',
    relationshipVi:
      'Trọng chữ tín và hành động thực tế hơn lời nói hoa mỹ; trong tình duyên nên kết hôn muộn hoặc chọn người bạn đời ôn nhu bù trừ.',
    healthVi: 'Thuộc Tân Kim, chủ về Phế (phổi), hệ hô hấp, mũi họng và xương khớp.',
  },
  天同: {
    coreToneVi:
      'Phúc tinh Nam Đẩu chủ về ôn hòa, nhân hậu, nghệ thuật, biết thưởng thức cuộc sống và hóa giải tai ương.',
    careerWealthVi:
      'Hợp dịch vụ chăm sóc, văn hóa nghệ thuật, ẩm thực, du lịch, nhân sự và truyền thông mềm; khởi đầu từ tốn, hậu vận an nhàn.',
    relationshipVi:
      'Nhân duyên hòa nhã, dễ gần, ít kết oán; trong hôn nhân hợp người phối ngẫu chênh lệch tuổi tác để chiều chuộng lẫn nhau.',
    healthVi: 'Thuộc Nhâm Thủy, chủ về Thận, bàng quang, tai, hệ nội tiết và cân nặng.',
  },
  廉贞: {
    coreToneVi:
      'Thứ Đào Hoa & Quan Lộc Chủ — vừa giữ kỷ cương pháp độ vừa có sức hút giao tế mãnh liệt.',
    careerWealthVi:
      'Giỏi chính trị, hành chính, pháp chế, thiết kế mỹ thuật, điện tử và quan hệ công chúng; cực kỳ nhạy bén với quy tắc.',
    relationshipVi:
      'Cảm xúc nồng nhiệt, yêu ghét phân minh; cần Hóa Khoa hoặc Lộc Tồn điều hòa để giữ sự ổn định lâu dài.',
    healthVi: 'Thuộc Đinh Hỏa, chủ về huyết huyết, hệ miễn dịch, viêm nhiễm và tuần hoàn.',
  },
  天府: {
    coreToneVi:
      'Lệnh tinh Nam Đẩu & Lộc Khố — vững chãi, bao dung, giỏi bảo toàn cơ nghiệp và quản lý kho tàng.',
    careerWealthVi:
      'Hợp quản lý tài sản, bất động sản, tài chính, hành chính ổn định; cực giỏi tích lũy làm giàu bền vững.',
    relationshipVi:
      'Trọng tình nghĩa gia đình, giữ chữ tín với bạn bè đối tác; hôn nhân thiên về sự ổn định lâu bền.',
    healthVi: 'Thuộc Mậu Thổ, chủ về dạ dày, lá lách (Tỳ Vị) và hệ tiêu hóa.',
  },
  太阴: {
    coreToneVi:
      'Điền Trạch & Tài Phú Chi Tinh — tinh tế, trầm tĩnh, giàu nội tâm và năng lực tích lũy ngầm.',
    careerWealthVi:
      'Đại lợi về bất động sản, đầu tư dài hạn, tài chính, văn hóa, mỹ phẩm và dịch vụ tinh tế; Miếu Vượng chủ đại phú.',
    relationshipVi:
      'Đại diện cho người nữ (mẹ, vợ, con gái); khi sáng sủa mang lại gia phong êm ấm, dịu dàng.',
    healthVi: 'Thuộc Quý Thủy, chủ về Thận âm, nội tiết, phụ khoa/nam khoa và mắt phải.',
  },
  贪狼: {
    coreToneVi:
      'Chính Đào Hoa & Đa Tài Đa Nghệ — khát vọng vươn lên, giỏi giao tế xã hội, nhạy bén xu thế mới.',
    careerWealthVi:
      'Hợp giải trí, thương mại, marketing, ngoại giao, nghệ thuật; khi gặp Hỏa/Linh tạo cách Hỏa Tham/Linh Tham bộc phát tài lộc lớn.',
    relationshipVi:
      'Sức hút nhân duyên rất mạnh, nhiều bạn bè; trong hôn nhân cần sự mới mẻ và tôn trọng không gian phát triển.',
    healthVi: 'Thuộc Giáp Mộc (gốc Quý Thủy), chủ về gan mật, thận và chuyển hóa.',
  },
  巨门: {
    coreToneVi:
      'Ám tinh chủ về ngôn ngữ, phản biện, nghiên cứu chuyên sâu và truy tìm chân lý.',
    careerWealthVi:
      'Phát huy xuất sắc nhờ khẩu tài và chuyên môn: luật sư, giảng viên, bác sĩ, tư vấn, truyền thông, kiểm toán.',
    relationshipVi:
      'Thẳng thắn nhưng đôi khi lời nói sắc bén; khi có Thái Dương sáng chiếu hoặc Hóa Lộc/Khoa sẽ biến khẩu tài thành quý khí.',
    healthVi: 'Thuộc Quý Thủy / Kim, chủ về đường tiêu hóa, thực quản, răng miệng và hô hấp.',
  },
  天相: {
    coreToneVi:
      'Ấn tinh Nam Đẩu — công bằng, chuẩn mực, trọng hình tượng và giỏi điều phối hỗ trợ.',
    careerWealthVi:
      'Bậc thầy tham mưu, quản trị nhân sự, pháp무, kiểm soát chất lượng, dịch vụ cao cấp; rất cần Tài Ấm Giáp Ấn.',
    relationshipVi:
      'Tận tụy, chu đáo với gia đình và bằng hữu; thường kết duyên từ môi trường quen biết, đồng nghiệp.',
    healthVi: 'Thuộc Nhâm Thủy, chủ về hệ bài tiết, bàng quang, thận và da.',
  },
  天梁: {
    coreToneVi:
      'Ấm tinh & Thọ tinh — chính trực, từ bi, che chở người khác và có khả năng逢凶化吉 (phùng hung hóa cát).',
    careerWealthVi:
      'Hợp y dược, giáo dục, giám sát, thanh tra, từ thiện, cố vấn cao cấp; trọng danh dự hơn tiền bạc ngắn hạn.',
    relationshipVi:
      'Có phong thái bề trên, hay lo lắng chăm sóc người thân; hợp bạn đời điềm đạm, trưởng thành.',
    healthVi: 'Thuộc Mậu Thổ, chủ về Tỳ Vị, hệ tiêu hóa và xương sườn.',
  },
  七杀: {
    coreToneVi:
      'Tướng tinh chủ về uy dũng, độc lập tác chiến, dám đương đầu thử thách và xoay chuyển cục diện.',
    careerWealthVi:
      'Hợp khởi nghiệp khai phá, kỹ thuật mũi nhọn, quản lý dự án khó, lực lượng vũ trang; thành tựu rực rỡ sau gian khó.',
    relationshipVi:
      'Yêu ghét dứt khoát, trọng hành động; cần học cách mềm mỏng lắng nghe để gia đạo êm ấm.',
    healthVi: 'Thuộc Canh Kim带Hỏa, chủ về phổi, đại trường, ngoại thương và xương khớp.',
  },
  破军: {
    coreToneVi:
      'Hao tinh & Tiên phong tinh — phá cũ lập mới, không ngại đập đi xây lại để tạo đột phá.',
    careerWealthVi:
      'Hợp sáng tạo đổi mới, tái cấu trúc doanh nghiệp, vận tải, kỹ thuật hiện đại; gặp Hóa Lộc/Quyền thì “Tiên phá hậu thành”.',
    relationshipVi:
      'Ghét sự ràng buộc cứng nhắc; hôn nhân và hợp tác bền vững khi hai bên cùng hướng tới mục tiêu đổi mới.',
    healthVi: 'Thuộc Quý Thủy, chủ về thận, hệ sinh dục tiết niệu và huyết khí.',
  },
};

export interface DeterministicDimensionReading {
  topicKey: TopicKey;
  meta: ThirteenDimensionMeta;
  palaceNameVi: string;
  palaceGanZhiVi: string;
  headlineVi: string;
  scoreLabelVi: string;
  coreAnalysisBulletsVi: string[];
  chartEvidenceBulletsVi: string[];
  tcmOrganNoteVi?: { organVi: string; adviceVi: string };
  matchedTianjiQuotes: {
    quoteCn: string;
    quoteVi: string;
    chapterLabelVi: string;
    timeHms: string;
    bilibiliUrl: string;
  }[];
  matchedClassicPassages: {
    bookTitleVi: string;
    chapterVi: string;
    originalCn: string;
    translationVi: string;
  }[];
  promptContextVi: string;
}

function findMatchingTianjiQuotes(
  starNamesCn: string[],
  palacePrefixCn: string,
  topicKey: TopicKey
): DeterministicDimensionReading['matchedTianjiQuotes'] {
  const keywords = new Set<string>(starNamesCn);
  const shortPalace = palacePrefixCn.replace('宫', '');
  keywords.add(shortPalace);
  keywords.add(palacePrefixCn);

  if (topicKey === 'love') {
    keywords.add('夫妻');
    keywords.add('婚姻');
    keywords.add('福德');
  } else if (topicKey === 'health') {
    keywords.add('疾厄');
    keywords.add('病');
  } else if (topicKey === 'wealth') {
    keywords.add('财帛');
    keywords.add('禄');
  } else if (topicKey === 'career') {
    keywords.add('官禄');
  }

  const scored: { entry: TianjiCorpusEntry; score: number }[] = [];

  for (const entry of TIANJI_CORPUS) {
    let score = 0;
    for (const kw of keywords) {
      if (!kw) continue;
      if (entry.h3.includes(kw)) score += 5;
      if (entry.h2.includes(kw)) score += 3;
      if (entry.quote.includes(kw)) score += 2;
    }
    if (topicKey === 'health' && entry.book === '05-illness') score += 3;
    if (topicKey === 'overview' && entry.book === '03-patterns') score += 2;

    if (score >= 4 && entry.quote.length >= 14) {
      scored.push({ entry, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const picked: DeterministicDimensionReading['matchedTianjiQuotes'] = [];
  const seenQuotes = new Set<string>();

  for (const { entry } of scored) {
    if (seenQuotes.has(entry.quote)) continue;
    seenQuotes.add(entry.quote);
    picked.push({
      quoteCn: entry.quote,
      quoteVi: translateChineseAstrologyText(entry.quote),
      chapterLabelVi: translateChineseAstrologyText(`${entry.h2} • ${entry.h3}`),
      timeHms: entry.t_hms,
      bilibiliUrl: `https://www.bilibili.com/video/${entry.bvid}?p=${entry.part}`,
    });
    if (picked.length >= 4) break;
  }

  return picked;
}

function findMatchingClassicPassages(
  starNamesCn: string[],
  palacePrefixCn: string
): DeterministicDimensionReading['matchedClassicPassages'] {
  const books = [
    { book: guSuiFu, titleVi: '《Cốt Tủy Phú》' },
    { book: ziWeiQuanShu, titleVi: '《Tử Vi Đẩu Số Toàn Thư》' },
    { book: ziWeiQuanJi, titleVi: '《Đẩu Số Toàn Tập》' },
  ];
  const shortPalace = palacePrefixCn.replace('宫', '');
  const hits: DeterministicDimensionReading['matchedClassicPassages'] = [];

  for (const { book, titleVi } of books) {
    for (const ch of book.chapters) {
      for (const p of ch.paragraphs) {
        const hasStar = starNamesCn.some((st) => p.text.includes(st));
        const hasPalace = p.text.includes(shortPalace);
        if ((hasStar && hasPalace) || (hasStar && hits.length < 2)) {
          hits.push({
            bookTitleVi: titleVi,
            chapterVi: translateChineseAstrologyText(ch.title),
            originalCn: p.text,
            translationVi: translateChineseAstrologyText(p.text),
          });
          if (hits.length >= 3) return hits;
        }
      }
    }
  }

  return hits;
}

export function buildDeterministicDimensionReading(
  chart: ZiweiChart,
  topicKey: TopicKey
): DeterministicDimensionReading {
  const meta =
    THIRTEEN_DIMENSIONS_META.find((m) => m.key === topicKey) || THIRTEEN_DIMENSIONS_META[0];

  const mainPalace =
    chart.palaces.find((p) => p.name.startsWith(meta.palacePrefixCn)) ||
    (meta.palacePrefixCn === '交友'
      ? chart.palaces.find((p) => p.name.startsWith('仆役'))
      : undefined) ||
    chart.palaces.find((p) => p.branch === chart.mingGongBranch) ||
    chart.palaces[0];

  const secondaryPalace = meta.secondaryPalacePrefixCn
    ? meta.secondaryPalacePrefixCn === '身宫'
      ? chart.palaces.find((p) => p.branch === chart.shenGongBranch)
      : chart.palaces.find((p) => p.name.startsWith(meta.secondaryPalacePrefixCn!))
    : undefined;

  const oppPalace = chart.palaces.find((p) => p.branch === (mainPalace.branch + 6) % 12);
  const san1Palace = chart.palaces.find((p) => p.branch === (mainPalace.branch + 4) % 12);
  const san2Palace = chart.palaces.find((p) => p.branch === (mainPalace.branch + 8) % 12);

  const palaceNameVi = translatePalaceName(mainPalace.name);
  const stemVi = translateStem(STEMS[mainPalace.stem] || '');
  const branchVi = translateBranch(BRANCHES[mainPalace.branch] || '');
  const palaceGanZhiVi = `${stemVi} ${branchVi}`;

  const majorStars = mainPalace.stars.filter((s) => s.type === 'major');
  const effectiveMajorNamesCn =
    majorStars.length > 0
      ? majorStars.map((s) => s.name)
      : mainPalace.borrowedStars || [];

  const luckyStars = mainPalace.stars.filter((s) => s.type === 'lucky');
  const shaStars = mainPalace.stars.filter((s) => s.type === 'sha');
  const sihuaStars = mainPalace.stars.filter((s) => Boolean(s.siHua));

  // Đánh giá độ sáng & Cát Hung
  const brightCount = majorStars.filter((s) =>
    ['庙', '旺', '得'].includes(s.brightnessRaw || '')
  ).length;
  const hamCount = majorStars.filter((s) => s.brightnessRaw === '陷').length;
  const hasJi = sihuaStars.some((s) => s.siHua === '忌');
  const hasLuOrQuanOrKe = sihuaStars.some((s) =>
    ['禄', '权', '科'].includes(s.siHua || '')
  );

  let scoreLabelVi = 'Cát Bình Quân Hòa — Lấy Nhân Sự Bổ Thiên Mệnh';
  if ((brightCount > 0 && hasLuOrQuanOrKe && !hasJi) || (brightCount > 0 && luckyStars.length >= 2)) {
    scoreLabelVi = 'Thượng Cách Cát Vượng — Tinh Đẩu Đắc Địa Hội Cát Hóa';
  } else if (brightCount > 0 && shaStars.length === 0) {
    scoreLabelVi = 'Trung Thượng Cát Cách — Bản Cung Vững Vàng Thuận Lợi';
  } else if (hasJi || (hamCount > 0 && shaStars.length >= 2)) {
    scoreLabelVi = 'Cách Cục Cần Tu Dưỡng — Rèn Luyện Qua Thử Thách Để Thành Tựu';
  }

  const effectiveMajorViList =
    effectiveMajorNamesCn.length > 0
      ? effectiveMajorNamesCn.map((s) => translateStarName(s))
      : ['Vô Chính Diệu'];

  const headlineVi =
    majorStars.length > 0
      ? `Cung ${palaceNameVi} (${palaceGanZhiVi}) tọa thủ Chính tinh ${effectiveMajorViList.join(
          ' – '
        )}: ${scoreLabelVi}`
      : `Cung ${palaceNameVi} (${palaceGanZhiVi}) Vô Chính Diệu (Mượn ${effectiveMajorViList.join(
          ' – '
        )} từ Đối cung): Linh hoạt ứng biến theo Tam Phương Tứ Chính`;

  // Xây dựng các luận điểm cốt lõi cố định (Rule-Based Deductions)
  const coreAnalysisBulletsVi: string[] = [];

  for (const starCn of effectiveMajorNamesCn) {
    const trait = STAR_DIMENSION_TRAITS_VI[starCn];
    const detail = STAR_DETAILS_VI[starCn];
    const starObj = majorStars.find((x) => x.name === starCn);
    const brightLabel = starObj?.brightnessRaw
      ? ` (${translateBrightness(starObj.brightnessRaw)})`
      : ' (Mượn đối cung)';

    if (trait) {
      let specificText = trait.coreToneVi;
      if (['career', 'wealth', 'home', 'move'].includes(topicKey)) {
        specificText = `${trait.coreToneVi} ${trait.careerWealthVi}`;
      } else if (['love', 'family', 'children', 'friends', 'parents'].includes(topicKey)) {
        specificText = `${trait.coreToneVi} ${trait.relationshipVi}`;
      } else if (topicKey === 'health') {
        specificText = `${trait.coreToneVi} ${trait.healthVi}`;
      }

      coreAnalysisBulletsVi.push(
        `【Tinh tính ${translateStarName(starCn)}${brightLabel}】: ${specificText}${
          detail ? ` Khẩu quyết Nghê Sư: “${detail.niHaixiaQuoteVi}”` : ''
        }`
      );
    }

    // Nếu là chủ đề Tình Duyên (love), bổ sung khẩu quyết chuyên biệt từ STAR_IN_FUQI_GU
    if (topicKey === 'love' && STAR_IN_FUQI_GU[starCn]) {
      const fq = STAR_IN_FUQI_GU[starCn];
      coreAnalysisBulletsVi.push(
        `【Đoạn ngữ Phu Thê — ${translateStarName(starCn)}】: ${translateChineseAstrologyText(
          fq.summary
        )}. Điểm cát: ${translateChineseAstrologyText(
          fq.good
        )}. Lưu ý: ${translateChineseAstrologyText(fq.bad)}.`
      );
    }
  }

  // Luận giải Tứ Hóa tại Bản cung
  sihuaStars.forEach((s) => {
    const shVi = translateSiHua(s.siHua);
    const stVi = translateStarName(s.name);
    if (topicKey === 'love' && SIHUA_IN_FUQI_GU[`化${s.siHua}` as keyof typeof SIHUA_IN_FUQI_GU]) {
      coreAnalysisBulletsVi.push(
        `【${stVi} Hóa ${shVi} tại Cung ${palaceNameVi}】: ${translateChineseAstrologyText(
          SIHUA_IN_FUQI_GU[`化${s.siHua}` as keyof typeof SIHUA_IN_FUQI_GU]
        )}`
      );
    } else if (s.siHua === '禄') {
      coreAnalysisBulletsVi.push(
        `【${stVi} Hóa Lộc tọa Cung ${palaceNameVi}】: Khí lực hanh thông, mang lại nhân duyên thuận lợi, tài lộc tự nhiên và cơ hội mở mang tại phương diện ${meta.subVi}.`
      );
    } else if (s.siHua === '权') {
      coreAnalysisBulletsVi.push(
        `【${stVi} Hóa Quyền tọa Cung ${palaceNameVi}】: Tăng cường năng lực làm chủ, quyết đoán và vị thế dẫn dắt trong phương diện ${meta.subVi}, nhưng cần tránh cứng nhắc áp đặt.`
      );
    } else if (s.siHua === '科') {
      coreAnalysisBulletsVi.push(
        `【${stVi} Hóa Khoa tọa Cung ${palaceNameVi}】: Đệ nhất giải thần — mang lại quý nhân nâng đỡ, danh tiếng thanh nhã và khả năng hóa giải sóng gió tại Cung ${palaceNameVi}.`
      );
    } else if (s.siHua === '忌') {
      coreAnalysisBulletsVi.push(
        `【${stVi} Hóa Kỵ tọa Cung ${palaceNameVi}】: Tâm lực của đương số đặt nặng vào Cung ${palaceNameVi}; dễ trải qua thử thách rèn giũa trước khi thu hoạch, tuyệt đối tránh nóng vội hoặc cưỡng cầu.`
      );
    }
  });

  // Luận giải Tự Hóa nội cung
  if (mainPalace.selfSihua && mainPalace.selfSihua.length > 0) {
    coreAnalysisBulletsVi.push(
      `【Can Cung ${stemVi} kích phát Tự Hóa (${mainPalace.selfSihua
        .map((sh) => `${translateStarName(sh.starName)} Tự Hóa ${translateSiHua(sh.siHua)}`)
        .join(', ')})】: Nội tại phương diện ${meta.subVi} dễ có sự biến chuyển tâm ý theo từng giai đoạn, cần kiên định mục tiêu dài hạn.`
    );
  }

  // Luận giải Cung Đồng Tham (VD: Phúc Đức cho Tình Duyên, Thân Cung cho Tổng Quan...)
  if (secondaryPalace) {
    const secVi = translatePalaceName(secondaryPalace.name);
    const secSummary = formatPalaceStarsSummaryVi(secondaryPalace);
    coreAnalysisBulletsVi.push(
      `【Đồng tham Cung ${secVi} (${translateStem(
        STEMS[secondaryPalace.stem] || ''
      )} ${translateBranch(BRANCHES[secondaryPalace.branch] || '')})】: Chính tinh ${
        secSummary.majorText
      }${secSummary.luckyText ? ` • Cát tinh: ${secSummary.luckyText}` : ''}${
        secSummary.shaText ? ` • Sát/Kỵ: ${secSummary.shaText}` : ''
      } — đóng vai trò hậu thuẫn trực tiếp cho ${meta.labelVi}.`
    );
  }

  // Xây dựng căn cứ lá số (Chart Evidence Bullets)
  const chartEvidenceBulletsVi: string[] = [
    `Bản mệnh: ${translateYinYangGender(chart.yinYangGender)} • ${translateWuxingJu(
      chart.wuxingJuName
    )} • Mệnh chủ ${translateStarName(chart.mingZhu || '')} • Thân chủ ${translateStarName(
      chart.shenZhu || ''
    )}.`,
    `Bản cung (${palaceNameVi} - ${palaceGanZhiVi}): Chính tinh ${
      formatPalaceStarsSummaryVi(mainPalace).majorText
    }${
      luckyStars.length > 0
        ? ` | Lục Cát/Lộc Mã: ${luckyStars.map((s) => translateStarName(s.name)).join(', ')}`
        : ''
    }${
      shaStars.length > 0
        ? ` | Lục Sát: ${shaStars.map((s) => translateStarName(s.name)).join(', ')}`
        : ''
    }.`,
  ];

  if (oppPalace && san1Palace && san2Palace) {
    chartEvidenceBulletsVi.push(
      `Tam Phương Tứ Chính hội chiếu: Đối cung ${translatePalaceName(oppPalace.name)} (${
        formatPalaceStarsSummaryVi(oppPalace).majorText
      }) • Tam hợp ${translatePalaceName(san1Palace.name)} (${
        formatPalaceStarsSummaryVi(san1Palace).majorText
      }) & ${translatePalaceName(san2Palace.name)} (${
        formatPalaceStarsSummaryVi(san2Palace).majorText
      }).`
    );
  }

  const patterns = detectPatterns(chart).map(localizePattern);
  if (patterns.length > 0) {
    chartEvidenceBulletsVi.push(
      `Cách cục liên đới trên lá số: ${patterns
        .slice(0, 4)
        .map((pt) => `${pt.nameVi} (${pt.levelLabelVi})`)
        .join(' • ')}.`
    );
  }

  const tcmOrganNoteVi =
    topicKey === 'health' ? BRANCH_TCM_ORGANS_VI[mainPalace.branch] : undefined;

  const matchedTianjiQuotes = findMatchingTianjiQuotes(
    effectiveMajorNamesCn,
    meta.palacePrefixCn,
    topicKey
  );
  const matchedClassicPassages = findMatchingClassicPassages(
    effectiveMajorNamesCn,
    meta.palacePrefixCn
  );

  const promptContextVi = [
    `=== LUẬN ĐOÁN CỐ ĐỊNH THEO THUẬT TOÁN CHO CHUYÊN ĐỀ [${meta.labelVi.toUpperCase()} - ${meta.subVi.toUpperCase()}] ===`,
    `- Định điệu: ${headlineVi}`,
    ...coreAnalysisBulletsVi.map((b) => `- ${b}`),
    ...(tcmOrganNoteVi
      ? [`- Đông Y Tạng Phủ (${palaceGanZhiVi}): ${tcmOrganNoteVi.organVi}. ${tcmOrganNoteVi.adviceVi}`]
      : []),
    ...matchedTianjiQuotes.map((q) => `- Khẩu quyết Nghê Hải Hạ《Thiên Kỷ》: “${q.quoteVi}”`),
  ].join('\n');

  return {
    topicKey,
    meta,
    palaceNameVi,
    palaceGanZhiVi,
    headlineVi,
    scoreLabelVi,
    coreAnalysisBulletsVi,
    chartEvidenceBulletsVi,
    tcmOrganNoteVi,
    matchedTianjiQuotes,
    matchedClassicPassages,
    promptContextVi,
  };
}

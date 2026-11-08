import type { Palace, SiHua } from '../engine/types';
import type { TopicKey } from '../engine/db-analysis';
import {
  formatPalaceStarsSummaryVi,
  translateBrightness,
  translatePalaceName,
  translateSiHua,
  translateStarName,
} from './ziweiLocalization';

type ReadingPoint = {
  label: string;
  takeaway: string;
  explanation: string;
};

const STAR_TAKEAWAYS: Record<string, string> = {
  紫微: 'Có xu hướng đứng ra tổ chức và chịu trách nhiệm.',
  天机: 'Giỏi xoay xở và tìm cách làm mới.',
  太阳: 'Dễ được chú ý khi chủ động giúp đỡ và chia sẻ.',
  武曲: 'Thiên về cách làm thực tế và có kỷ luật.',
  天同: 'Thích sự hài hòa và dễ tạo cảm giác gần gũi.',
  廉贞: 'Vừa coi trọng quy tắc, vừa có sức hút khi giao tiếp.',
  天府: 'Thiên về giữ gìn và tích lũy lâu dài.',
  太阴: 'Thiên về quan sát kỹ và chuẩn bị từ từ.',
  贪狼: 'Thích khám phá, dễ kết nối và bắt nhịp với cái mới.',
  巨门: 'Hay đặt câu hỏi và nhìn ra điểm chưa rõ.',
  天相: 'Có xu hướng cân bằng lợi ích và hỗ trợ người khác.',
  天梁: 'Coi trọng sự công bằng và hay đứng ra giúp người khác.',
  七杀: 'Quyết đoán và sẵn sàng nhận việc khó.',
  破军: 'Thích thay đổi những cách làm đã kém hiệu quả.',
};

const WORK_AND_MONEY_EXAMPLES: Record<string, string> = {
  紫微: 'Ví dụ, bạn có thể thấy mình làm tốt hơn khi được giao quyền điều phối và trách nhiệm rõ ràng.',
  天机: 'Ví dụ, bạn có thể làm tốt việc lập kế hoạch, phân tích dữ liệu hoặc đổi cách làm khi hoàn cảnh thay đổi.',
  太阳: 'Trong công việc và tiền bạc, có thể hiểu là uy tín và việc người khác biết đến năng lực của bạn có thể mở thêm cơ hội.',
  武曲: 'Ví dụ, bạn có thể thấy mình hợp cách quản lý tiền có mục tiêu, ngân sách và số liệu rõ ràng.',
  天同: 'Xu hướng này dễ thấy ở công việc chăm sóc khách hàng, dịch vụ hoặc những việc cần tạo trải nghiệm dễ chịu.',
  廉贞: 'Ví dụ, bạn có thể phát huy khi công việc vừa có nguyên tắc rõ ràng vừa cần khéo léo với con người.',
  天府: 'Trong tiền bạc, ý này nghiêng về việc giữ nguồn lực và xây quỹ dự phòng từng bước.',
  太阴: 'Trong tiền bạc, có thể hiểu là thích tìm hiểu kỹ và tích lũy dần trước khi quyết định lớn.',
  贪狼: 'Cơ hội có thể đến từ việc giao tiếp, mở rộng mạng lưới hoặc thử một hướng sáng tạo.',
  巨门: 'Bạn có thể phát huy ở những việc cần giải thích, tư vấn, kiểm tra thông tin hoặc phản biện.',
  天相: 'Ví dụ, bạn có thể thấy mình làm tốt vai trò điều phối, hỗ trợ nhóm hoặc kiểm tra chất lượng.',
  天梁: 'Xu hướng này dễ thấy khi làm công việc hướng dẫn, giám sát hoặc đứng ra bảo vệ quyền lợi của người khác.',
  七杀: 'Ví dụ, bạn có thể phát huy trong dự án khó, cần tự quyết và có mục tiêu cụ thể.',
  破军: 'Bạn có thể phát huy khi thử nghiệm hoặc cải tổ. Hãy xác định trước phần cần giữ và phần cần thay đổi.',
};

const TRANSFORMATIONS: Record<SiHua, Pick<ReadingPoint, 'takeaway' | 'explanation'>> = {
  禄: {
    takeaway: 'Có thêm cơ hội hoặc sự hỗ trợ.',
    explanation: 'Ví dụ, công việc dễ có đầu mối mới hoặc được người khác giới thiệu. Hãy xem cơ hội đó có phù hợp với hoàn cảnh thực tế của mình hay không.',
  },
  权: {
    takeaway: 'Dễ muốn chủ động và nắm quyền quyết định.',
    explanation: 'Điểm mạnh là dám đứng ra làm. Điểm cần chú ý là lắng nghe khi quyết định của mình ảnh hưởng đến người khác.',
  },
  科: {
    takeaway: 'Có thể được hỗ trợ nhờ chuyên môn hoặc uy tín.',
    explanation: 'Ví dụ, một người có kinh nghiệm có thể chỉ đường, hoặc cách giải thích rõ ràng của bạn giúp gỡ vướng.',
  },
  忌: {
    takeaway: 'Đây là chỗ dễ bận tâm hoặc gặp vướng mắc.',
    explanation: 'Khi phải quyết định, nên kiểm tra lại thông tin và cho mình thời gian cân nhắc. Hóa Kỵ không tự nó kết luận kết quả xấu.',
  },
};

export function buildPlainReadingPoints(
  palace: Palace,
  effectiveStarNames: string[],
  secondaryPalace: Palace | undefined,
  topic: TopicKey,
): ReadingPoint[] {
  const palaceName = translatePalaceName(palace.name);
  const majorStars = palace.stars.filter((star) => star.type === 'major');
  const points: ReadingPoint[] = [];

  if (majorStars.length === 0) {
    points.push({
      label: 'Vô chính diệu',
      takeaway: 'Cung này không có sao chính đứng tại chỗ.',
      explanation: effectiveStarNames.length > 0
        ? 'Để đọc tiếp, lá số tham khảo các sao chính ở cung đối diện. Phần dưới ghi rõ những sao được dùng để đối chiếu.'
        : 'Phần luận sẽ dựa thêm vào các sao khác và các cung liên quan.',
    });
  }

  for (const starName of effectiveStarNames) {
    const takeaway = STAR_TAKEAWAYS[starName];
    if (!takeaway) continue;
    const star = majorStars.find(({ name }) => name === starName);
    const brightness = star?.brightnessRaw && translateBrightness(star.brightnessRaw);
    const context = brightness ? ` · ${brightness}` : star ? '' : ' · mượn từ cung đối diện';
    points.push({
      label: translateStarName(starName) + context,
      takeaway,
      explanation: topic === 'wealth' || topic === 'career' ? WORK_AND_MONEY_EXAMPLES[starName] : '',
    });
  }

  for (const star of palace.stars) {
    if (!star.siHua) continue;
    points.push({
      label: `${translateStarName(star.name)} Hóa ${translateSiHua(star.siHua)} tại cung ${palaceName}`,
      ...TRANSFORMATIONS[star.siHua],
      ...(topic === 'wealth' && star.siHua === '忌' ? {
        explanation: 'Ví dụ, khi lo về tiền, bạn có thể muốn quyết định cho xong. Hãy kiểm tra thu chi, so sánh các lựa chọn và tránh vội vì áp lực. Dấu này không tự nó báo sẽ mất tiền.',
      } : {}),
    });
  }

  if (palace.selfSihua?.length) {
    const marks = palace.selfSihua.map(({ starName, siHua }) =>
      `${translateStarName(starName)} Tự Hóa ${translateSiHua(siHua)}`
    );
    points.push({
      label: marks.join(' · '),
      takeaway: 'Đây là dấu Tự Hóa phát sinh ngay trong cung đang xem.',
      explanation: 'Trong cách đọc này, nó gợi ý xem cách phản ứng của bạn có thể thay đổi theo tình huống. Cần đọc cùng loại Tự Hóa và các dấu khác trong cung.',
    });
  }

  if (secondaryPalace && secondaryPalace.branch !== palace.branch) {
    const summary = formatPalaceStarsSummaryVi(secondaryPalace);
    points.push({
      label: `Đọc thêm cung ${translatePalaceName(secondaryPalace.name)}`,
      takeaway: 'Cung này bổ sung góc nhìn cho chủ đề đang xem.',
      explanation: `Sao chính để đối chiếu là ${summary.majorText}. Bạn có thể xem thêm các sao và vị trí của chúng trong phần căn cứ.`,
    });
  }

  return points;
}

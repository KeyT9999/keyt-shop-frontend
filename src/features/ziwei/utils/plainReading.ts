import type { Palace, SiHua, Star, ZiweiChart } from '../engine/types';
import { BRANCHES } from '../engine/constants';
import { boshiShenName } from '../engine/shier-shen';
import { STAR_READING_PROFILES } from './starReadingProfiles';
import type { TopicKey } from '../engine/db-analysis';
import {
  formatPalaceStarsSummaryVi,
  translateBranch,
  translateBrightness,
  translatePalaceName,
  translateSiHua,
  translateStarName,
} from './ziweiLocalization';

type ReadingPoint = {
  label: string;
  takeaway: string;
  explanation: string;
  kind?: string;
  notes?: { label: string; text: string }[];
  about?: { name: string; text: string };
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
  堂符: 'Phong thái chỉn chu, coi trọng cách cư xử và nề nếp.',
  喜神: 'Có xu hướng tạo bầu không khí vui vẻ và kết nối mọi người.',
  禄存: 'Thiên về giữ và tích lũy những gì đã có.',
  文昌: 'Thích sắp xếp ý và trình bày rõ ràng.',
  文曲: 'Nhạy với sắc thái và cách diễn đạt.',
  左辅: 'Dễ phát huy hơn khi có người cùng gánh việc.',
  右弼: 'Có thể tìm được người hỗ trợ đúng lúc.',
  天魁: 'Dễ học được nhiều từ người có kinh nghiệm.',
  天钺: 'Biết tận dụng sự chỉ dẫn và lời góp ý.',
  天马: 'Nổi bật khi di chuyển hoặc đổi môi trường.',
  擎羊: 'Có xu hướng đối diện vấn đề một cách trực tiếp.',
  陀罗: 'Một số việc cần thời gian và nhiều lượt chỉnh sửa.',
  火星: 'Dễ bắt đầu nhanh khi có động lực.',
  铃星: 'Nhạy với áp lực và những thay đổi đột ngột.',
  地空: 'Nên đối chiếu kỳ vọng với nguồn lực đang có.',
  地劫: 'Có ích khi chuẩn bị cho khả năng phải làm lại.',
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

const TOPIC_EXAMPLES: Partial<Record<TopicKey, string>> = {
  love: 'Đối chiếu điều này với cách hai người bày tỏ nhu cầu và xử lý bất đồng.',
  family: 'Trong quan hệ anh chị em, hãy nhìn cách chia trách nhiệm và hỏi ý nhau khi có việc chung.',
  children: 'Trong quan hệ với con cái, hãy xem cách hướng dẫn và khoảng tự do mỗi người cần.',
  parents: 'Trong quan hệ với cha mẹ, hãy đối chiếu cách góp ý, kỳ vọng và hỗ trợ qua lại.',
  home: 'Với chuyện nhà cửa, hãy nhìn cách bạn muốn tổ chức nơi ở và phân chia việc trong nhà.',
  friends: 'Khi chọn người hợp tác, hãy đối chiếu cách giữ lời và cách trao đổi lúc có bất đồng.',
  spirit: 'Có thể dùng ý này để suy ngẫm về những thói quen hoặc giá trị bạn học được từ gia đình.',
  move: 'Đối chiếu với cách bạn tìm chỗ dựa và thích nghi khi bước vào môi trường mới.',
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
  chart?: Pick<ZiweiChart, 'palaces' | 'lunarInfo' | 'birthInfo'>,
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

  const opposite = chart?.palaces.find(({ branch }) => branch === (palace.branch + 6) % 12);
  const starEntries = effectiveStarNames.map((name) => {
    const own = majorStars.find((star) => star.name === name);
    return {
      name,
      star: own ?? opposite?.stars.find((star) => star.name === name && star.type === 'major'),
      source: own ? palace : opposite,
      borrowed: !own,
      major: true,
    };
  });
  const supportingStars: Star[] = palace.stars.filter(({ type }) => type !== 'major');
  if (chart && boshiShenName(chart.lunarInfo.yearStem, chart.birthInfo.gender, palace.branch) === '喜神'
      && !supportingStars.some(({ name }) => name === '喜神')) {
    supportingStars.push({ name: '喜神', type: 'minor' });
  }
  starEntries.push(...supportingStars.map((star) => ({
    name: star.name, star, source: palace, borrowed: false, major: false,
  })));

  for (const { name, star, source, borrowed, major } of starEntries) {
    const profile = STAR_READING_PROFILES[name];
    if (!profile) continue;
    const nameVi = translateStarName(name);
    const branch = source ? translateBranch(BRANCHES[source.branch]) : '';
    const brightness = star?.brightnessRaw && translateBrightness(star.brightnessRaw);
    const label = borrowed
      ? `${nameVi} · mượn từ ${source ? `cung ${translatePalaceName(source.name)}` : 'đối cung'}${branch ? ` tại ${branch}` : ''}`
      : `Cung ${palaceName} có sao ${nameVi} · tại chi ${branch}`;
    const samePalaceMajors = source?.stars.filter((entry) => entry.type === 'major' && entry.name !== name) ?? [];
    const notes = [
      { label: 'Điểm mạnh', text: profile.strength },
      { label: 'Điều cần lưu ý', text: profile.caution },
    ];
    if ((topic === 'wealth' || topic === 'career') && WORK_AND_MONEY_EXAMPLES[name]) {
      notes.push({ label: 'Ví dụ đời thường', text: WORK_AND_MONEY_EXAMPLES[name] });
    } else if (major) {
      const example = TOPIC_EXAMPLES[topic];
      if (example) notes.push({ label: 'Trong chủ đề đang xem', text: example });
    }
    if (name === '天梁' && !borrowed && palaceName === 'Mệnh' && palace.branch === 11) {
      notes.push({
        label: 'Khi Thiên Lương ở Hợi',
        text: samePalaceMajors.some(({ name }) => name === '天同')
          ? 'Thiên Đồng đi cùng làm nổi bật nhu cầu thư giãn và hưởng thụ. Nếu thấy mình dễ chi quá tay cho những cuộc vui hoặc vì muốn giúp người khác, hãy đặt trước một khoản có thể dùng mà vẫn giữ được tiền dành dụm.'
          : 'Vị trí Hợi nên được đọc cùng các sao đồng cung và hội chiếu. Bạn có thể đối chiếu xem khi ưu tiên vui vẻ hoặc giúp người khác, mình có đang bỏ qua kế hoạch dài hạn hay khoản tiền cần dành dụm không.',
      });
    }
    if (major && source && samePalaceMajors.length) {
      notes.push({
        label: 'Sao chính đi cùng',
        text: `${samePalaceMajors.map(({ name }) => translateStarName(name)).join(', ')} cùng đứng tại cung ${translatePalaceName(source.name)}. Đọc hai nét tính cách song song để thấy chỗ chúng bổ trợ hoặc kéo theo những ưu tiên khác nhau.`,
      });
    }
    if (name === '紫微' && samePalaceMajors.some((entry) => entry.name === '破军') && topic === 'family') {
      notes.push({
        label: 'Đọc cùng Phá Quân ở Huynh Đệ',
        text: 'Tử Vi muốn có người đứng ra sắp xếp, còn Phá Quân muốn thay cách làm khi thấy bất tiện. Trong việc chung của anh chị em, hai xu hướng này có thể bổ trợ nhau nếu thống nhất trước ai quyết phần nào. Khi chưa thống nhất, một người dễ thấy mình bị kiểm soát, người kia lại thấy kế hoạch thay đổi quá nhanh.',
      });
    }
    if (name === '廉贞' && samePalaceMajors.some((entry) => entry.name === '贪狼')) {
      notes.push({
        label: 'Đọc cùng Tham Lang',
        text: 'Liêm Trinh giúp nhìn ra ranh giới, còn Tham Lang thích thử cái mới và mở rộng quan hệ. Hai nét này phối hợp tốt khi bạn đặt trước giới hạn rồi mới thử. Khi quá hào hứng, hãy kiểm tra xem lựa chọn mới có còn hợp mục tiêu đã đặt ra hay không.',
      });
    }
    points.push({
      label: brightness ? `${label} · ${brightness}` : label,
      kind: borrowed ? 'Mượn đối cung' : major ? 'Chính tinh' : 'Phụ tinh',
      takeaway: STAR_TAKEAWAYS[name] ?? profile.strength,
      explanation: '',
      notes,
      about: { name: nameVi, text: profile.about },
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

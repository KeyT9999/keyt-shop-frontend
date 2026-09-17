import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';
import { SpeakingHero } from '../../features/courses/components/speaking/SpeakingHero';
import { ReadingPracticeTab } from '../../features/courses/components/speaking/ReadingPracticeTab';
import { QAPracticeTab } from '../../features/courses/components/speaking/QAPracticeTab';
import { MockExamSimulator } from '../../features/courses/components/speaking/MockExamSimulator';
import { SurvivalKitTab } from '../../features/courses/components/speaking/SurvivalKitTab';

type SpeakingTab = 'reading' | 'qa' | 'mock' | 'survival';

export default function SpeakingPage() {
  const { courseCode = 'jpd123' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as SpeakingTab | null;
  const [activeTab, setActiveTab] = useState<SpeakingTab>(tabParam || 'mock');

  useEffect(() => {
    if (tabParam && ['reading', 'qa', 'mock', 'survival'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: SpeakingTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const upperCode = courseCode.toUpperCase();

  return (
    <>
      <Seo
        title={`Luyện Thi Nói ${upperCode} - Mô Phỏng Phòng Thi 1-1 Chuẩn FPT | Mindora AI`}
        description={`Ôn luyện kỹ năng thi nói tiếng Nhật ${upperCode} chuẩn cấu trúc khảo thí FPT University: Đọc đoạn văn 45đ, Vấn đáp Q&A 45đ, Tác phong & Chào hỏi 10đ với Giám thị AI.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/speaking`}
      />

      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <CourseBreadcrumb
            items={[
              { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
              { label: 'Luyện Thi Nói (会話試験)' }
            ]}
          />

          {/* Hero & Navigation Tabs */}
          <SpeakingHero
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Tab Content Panels */}
          <div className="mt-8">
            {activeTab === 'reading' && (
              <ReadingPracticeTab courseCode={courseCode} />
            )}

            {activeTab === 'qa' && (
              <QAPracticeTab courseCode={courseCode} />
            )}

            {activeTab === 'mock' && (
              <MockExamSimulator courseCode={courseCode} />
            )}

            {activeTab === 'survival' && (
              <SurvivalKitTab courseCode={courseCode} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

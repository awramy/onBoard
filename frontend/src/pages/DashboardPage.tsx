import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ContinueOrStartWidget } from '@/features/dashboard/components/ContinueOrStartWidget';
import { RecentQuestionsWidget } from '@/features/dashboard/components/RecentQuestionsWidget';
import { LeagueTopWidget } from '@/features/dashboard/components/LeagueTopWidget';
import { MyTopTechnologiesWidget } from '@/features/dashboard/components/MyTopTechnologiesWidget';
import { FavoritesWidget } from '@/features/dashboard/components/FavoritesWidget';

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      <ContinueOrStartWidget />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        <RecentQuestionsWidget />
        <LeagueTopWidget />
        <MyTopTechnologiesWidget />
        <FavoritesWidget />
      </div>
    </div>
  );
}

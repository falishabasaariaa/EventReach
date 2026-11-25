import React from 'react';
import { EventReachProvider, useEventReach } from './context/EventReachContext';
import { AppShell } from './components/layout/AppShell';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { AudienceDataPage } from './pages/AudienceDataPage';
import { SegmentationPage } from './pages/SegmentationPage';
import { CommunicationStrategyPage } from './pages/CommunicationStrategyPage';
import { PromoMediaPage } from './pages/PromoMediaPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { ProfilePage } from './pages/ProfilePage';

const PageRouter: React.FC = () => {
  const { currentPage } = useEventReach();

  switch (currentPage) {
    case 'beranda':
      return <DashboardPage />;
    case 'event':
      return <EventsPage />;
    case 'audiens':
      return <AudienceDataPage />;
    case 'segmentasi':
      return <SegmentationPage />;
    case 'strategi':
      return <CommunicationStrategyPage />;
    case 'promosi':
      return <PromoMediaPage />;
    case 'evaluasi':
      return <EvaluationPage />;
    case 'profil':
      return <ProfilePage />;
    default:
      return <DashboardPage />;
  }
};

export default function App() {
  return (
    <EventReachProvider>
      <AppShell>
        <PageRouter />
      </AppShell>
      <ToastContainer />
      <ConfirmDialog />
    </EventReachProvider>
  );
}

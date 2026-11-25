import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityItem,
  AppSettings,
  AudienceMember,
  AudienceSegment,
  CommunicationStrategy,
  ConfirmDialogState,
  EvaluationMetric,
  EventItem,
  NavPage,
  NotificationItem,
  PromoPlan,
  ToastMessage,
  UserProfile,
} from '../types/eventreach';
import {
  SEED_ACTIVITIES,
  SEED_AUDIENCES,
  SEED_EVALUATIONS,
  SEED_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_PROFILE,
  SEED_PROMO_PLANS,
  SEED_SEGMENTS,
  SEED_SETTINGS,
  SEED_STRATEGIES,
} from '../data/seedData';

const STORAGE_KEY = 'eventreach_workspace_v1';

interface StoredWorkspace {
  events: EventItem[];
  activeEventId: string;
  audiences: AudienceMember[];
  segments: AudienceSegment[];
  strategies: CommunicationStrategy[];
  promoPlans: PromoPlan[];
  evaluations: EvaluationMetric[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  profile: UserProfile;
  settings: AppSettings;
}

function getInitialWorkspace(): StoredWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredWorkspace>;
      if (parsed && Array.isArray(parsed.events) && parsed.events.length > 0) {
        return {
          events: parsed.events,
          activeEventId: parsed.activeEventId || parsed.events[0].id,
          audiences: Array.isArray(parsed.audiences) ? parsed.audiences : SEED_AUDIENCES,
          segments: Array.isArray(parsed.segments) ? parsed.segments : SEED_SEGMENTS,
          strategies: Array.isArray(parsed.strategies) ? parsed.strategies : SEED_STRATEGIES,
          promoPlans: Array.isArray(parsed.promoPlans) ? parsed.promoPlans : SEED_PROMO_PLANS,
          evaluations: Array.isArray(parsed.evaluations) ? parsed.evaluations : SEED_EVALUATIONS,
          activities: Array.isArray(parsed.activities) ? parsed.activities : SEED_ACTIVITIES,
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : SEED_NOTIFICATIONS,
          profile: parsed.profile || SEED_PROFILE,
          settings: parsed.settings || SEED_SETTINGS,
        };
      }
    }
  } catch {
    // Fall back to seed data if storage is malformed
  }
  return {
    events: SEED_EVENTS,
    activeEventId: SEED_EVENTS[0].id,
    audiences: SEED_AUDIENCES,
    segments: SEED_SEGMENTS,
    strategies: SEED_STRATEGIES,
    promoPlans: SEED_PROMO_PLANS,
    evaluations: SEED_EVALUATIONS,
    activities: SEED_ACTIVITIES,
    notifications: SEED_NOTIFICATIONS,
    profile: SEED_PROFILE,
    settings: SEED_SETTINGS,
  };
}

export function calculateMemberCompleteness(member: AudienceMember): number {
  const fields = [
    member.name.trim(),
    member.email.trim(),
    member.phone.trim(),
    member.category,
    member.institution.trim(),
    member.age !== null && member.age > 0 ? String(member.age) : '',
    member.interest.trim(),
    member.status,
  ];
  const filled = fields.filter((v) => v.length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function matchSegmentMembers(
  segment: Pick<AudienceSegment, 'categories' | 'ageRange' | 'institutions' | 'interests' | 'statuses'>,
  eventAudiences: AudienceMember[]
): AudienceMember[] {
  return eventAudiences.filter((member) => {
    if (segment.categories.length > 0 && !segment.categories.includes(member.category)) {
      return false;
    }
    if (segment.ageRange.enabled && member.age !== null) {
      if (member.age < segment.ageRange.min || member.age > segment.ageRange.max) {
        return false;
      }
    }
    if (
      segment.institutions.length > 0 &&
      !segment.institutions.some((inst) =>
        member.institution.toLowerCase().includes(inst.toLowerCase())
      )
    ) {
      return false;
    }
    if (segment.interests.length > 0 && !segment.interests.includes(member.interest)) {
      return false;
    }
    if (segment.statuses.length > 0 && !segment.statuses.includes(member.status)) {
      return false;
    }
    return true;
  });
}

interface EventReachContextValue {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;

  events: EventItem[];
  activeEvent: EventItem;
  activeEventId: string;
  setActiveEventId: (id: string) => void;

  audiences: AudienceMember[];
  activeAudiences: AudienceMember[];
  segments: AudienceSegment[];
  activeSegments: AudienceSegment[];
  strategies: CommunicationStrategy[];
  activeStrategies: CommunicationStrategy[];
  promoPlans: PromoPlan[];
  activePromoPlans: PromoPlan[];
  evaluations: EvaluationMetric[];
  activities: ActivityItem[];
  activeActivities: ActivityItem[];
  notifications: NotificationItem[];

  profile: UserProfile;
  settings: AppSettings;

  // Actions
  addEvent: (data: Omit<EventItem, 'id' | 'createdAt'>) => EventItem;
  updateEvent: (id: string, data: Partial<Omit<EventItem, 'id' | 'createdAt'>>) => void;
  deleteEvent: (id: string) => void;

  addAudience: (data: Omit<AudienceMember, 'id' | 'createdAt'>) => void;
  importAudiences: (rows: Omit<AudienceMember, 'id' | 'createdAt'>[]) => void;
  updateAudience: (id: string, data: Partial<Omit<AudienceMember, 'id' | 'createdAt'>>) => void;
  deleteAudience: (id: string) => void;

  addSegment: (data: Omit<AudienceSegment, 'id' | 'createdAt' | 'updatedAt'>) => AudienceSegment;
  updateSegment: (id: string, data: Partial<Omit<AudienceSegment, 'id' | 'createdAt'>>) => void;
  deleteSegment: (id: string) => void;

  addStrategy: (data: Omit<CommunicationStrategy, 'id' | 'updatedAt'>) => void;
  updateStrategy: (id: string, data: Partial<Omit<CommunicationStrategy, 'id'>>) => void;
  deleteStrategy: (id: string) => void;

  addPromoPlan: (data: Omit<PromoPlan, 'id'>) => void;
  updatePromoPlan: (id: string, data: Partial<Omit<PromoPlan, 'id'>>) => void;
  deletePromoPlan: (id: string) => void;

  updateProfile: (data: Partial<UserProfile>) => void;
  updateSettings: (data: Partial<AppSettings>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  resetDemoData: () => void;

  // UI helpers
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  confirmDialog: ConfirmDialogState;
  requestConfirm: (options: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirm: () => void;
  editingSegmentId: string | null;
  setEditingSegmentId: (id: string | null) => void;
}

const EventReachContext = createContext<EventReachContextValue | undefined>(undefined);

export const EventReachProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<StoredWorkspace>(() => getInitialWorkspace());
  const [currentPage, setCurrentPage] = useState<NavPage>('beranda');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Hapus',
    variant: 'danger',
    onConfirm: () => {},
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, [workspace]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requestConfirm = (options: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({ ...options, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const pushActivity = (
    prev: StoredWorkspace,
    eventId: string,
    title: string,
    detail: string,
    targetPage: NavPage
  ): ActivityItem[] => {
    const item: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      eventId,
      title,
      detail,
      timestamp: 'Baru saja',
      targetPage,
    };
    return [item, ...prev.activities].slice(0, 20);
  };

  const activeEvent = useMemo(() => {
    return (
      workspace.events.find((e) => e.id === workspace.activeEventId) ||
      workspace.events[0]
    );
  }, [workspace.events, workspace.activeEventId]);

  const activeEventId = activeEvent ? activeEvent.id : '';

  const activeAudiences = useMemo(
    () => workspace.audiences.filter((a) => a.eventId === activeEventId),
    [workspace.audiences, activeEventId]
  );

  const activeSegments = useMemo(
    () => workspace.segments.filter((s) => s.eventId === activeEventId),
    [workspace.segments, activeEventId]
  );

  const activeStrategies = useMemo(
    () => workspace.strategies.filter((s) => s.eventId === activeEventId),
    [workspace.strategies, activeEventId]
  );

  const activePromoPlans = useMemo(
    () => workspace.promoPlans.filter((p) => p.eventId === activeEventId),
    [workspace.promoPlans, activeEventId]
  );

  const activeActivities = useMemo(
    () => workspace.activities.filter((a) => a.eventId === activeEventId),
    [workspace.activities, activeEventId]
  );

  const setActiveEventId = (id: string) => {
    setWorkspace((prev) => ({ ...prev, activeEventId: id }));
    const found = workspace.events.find((e) => e.id === id);
    if (found) {
      showToast(`Beralih ke event "${found.name}"`, 'info');
    }
  };

  const addEvent = (data: Omit<EventItem, 'id' | 'createdAt'>): EventItem => {
    const newEvent: EventItem = {
      ...data,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWorkspace((prev) => ({
      ...prev,
      events: [newEvent, ...prev.events],
      activeEventId: newEvent.id,
      activities: pushActivity(
        prev,
        newEvent.id,
        `Event "${newEvent.name}" dibuat`,
        `${newEvent.date} · ${newEvent.location}`,
        'event'
      ),
    }));
    showToast(`Event "${newEvent.name}" berhasil ditambahkan`);
    return newEvent;
  };

  const updateEvent = (id: string, data: Partial<Omit<EventItem, 'id' | 'createdAt'>>) => {
    setWorkspace((prev) => ({
      ...prev,
      events: prev.events.map((evt) => (evt.id === id ? { ...evt, ...data } : evt)),
      activities: pushActivity(
        prev,
        id,
        `Detail event diperbarui`,
        data.name ? `Pembaruan informasi untuk ${data.name}` : 'Informasi jadwal/lokasi diperbarui',
        'event'
      ),
    }));
    showToast('Perubahan event berhasil disimpan');
  };

  const deleteEvent = (id: string) => {
    setWorkspace((prev) => {
      if (prev.events.length <= 1) {
        return prev;
      }
      const remaining = prev.events.filter((e) => e.id !== id);
      const nextActiveId = prev.activeEventId === id ? remaining[0].id : prev.activeEventId;
      return {
        ...prev,
        events: remaining,
        activeEventId: nextActiveId,
        audiences: prev.audiences.filter((a) => a.eventId !== id),
        segments: prev.segments.filter((s) => s.eventId !== id),
        strategies: prev.strategies.filter((s) => s.eventId !== id),
        promoPlans: prev.promoPlans.filter((p) => p.eventId !== id),
        evaluations: prev.evaluations.filter((ev) => ev.eventId !== id),
      };
    });
    showToast('Event berhasil dihapus');
  };

  const addAudience = (data: Omit<AudienceMember, 'id' | 'createdAt'>) => {
    const newMember: AudienceMember = {
      ...data,
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setWorkspace((prev) => ({
      ...prev,
      audiences: [newMember, ...prev.audiences],
      activities: pushActivity(
        prev,
        data.eventId,
        `Peserta baru: ${newMember.name}`,
        `${newMember.category} · ${newMember.status}`,
        'audiens'
      ),
    }));
    showToast(`Data audiens "${newMember.name}" ditambahkan`);
  };

  const importAudiences = (rows: Omit<AudienceMember, 'id' | 'createdAt'>[]) => {
    const now = Date.now();
    const mapped: AudienceMember[] = rows.map((row, idx) => ({
      ...row,
      id: `aud-csv-${now}-${idx}`,
      createdAt: new Date().toISOString(),
    }));
    setWorkspace((prev) => ({
      ...prev,
      audiences: [...mapped, ...prev.audiences],
      activities: pushActivity(
        prev,
        rows[0]?.eventId || prev.activeEventId,
        `Import CSV berhasil (${mapped.length} peserta)`,
        'Data peserta baru ditambahkan ke daftar audiens',
        'audiens'
      ),
    }));
    showToast(`${mapped.length} data audiens berhasil diimpor dari CSV`);
  };

  const updateAudience = (id: string, data: Partial<Omit<AudienceMember, 'id' | 'createdAt'>>) => {
    setWorkspace((prev) => ({
      ...prev,
      audiences: prev.audiences.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
    showToast('Data audiens berhasil diperbarui');
  };

  const deleteAudience = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      audiences: prev.audiences.filter((m) => m.id !== id),
    }));
    showToast('Data audiens berhasil dihapus');
  };

  const addSegment = (
    data: Omit<AudienceSegment, 'id' | 'createdAt' | 'updatedAt'>
  ): AudienceSegment => {
    const now = new Date().toISOString();
    const newSeg: AudienceSegment = {
      ...data,
      id: `seg-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setWorkspace((prev) => ({
      ...prev,
      segments: [newSeg, ...prev.segments],
      activities: pushActivity(
        prev,
        data.eventId,
        `Segmen baru: "${newSeg.name}"`,
        `Kategori: ${newSeg.categories.join(', ') || 'Semua Kategori'}`,
        'segmentasi'
      ),
    }));
    showToast(`Segmen "${newSeg.name}" berhasil disimpan`);
    return newSeg;
  };

  const updateSegment = (
    id: string,
    data: Partial<Omit<AudienceSegment, 'id' | 'createdAt'>>
  ) => {
    setWorkspace((prev) => ({
      ...prev,
      segments: prev.segments.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
      ),
      activities: pushActivity(
        prev,
        prev.activeEventId,
        `Segmen "${data.name || 'Audiens'}" diperbarui`,
        'Kriteria dan pesan segmentasi telah disesuaikan',
        'segmentasi'
      ),
    }));
    showToast('Segmen audiens berhasil diperbarui');
  };

  const deleteSegment = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      segments: prev.segments.filter((s) => s.id !== id),
    }));
    showToast('Segmen audiens dihapus');
  };

  const addStrategy = (data: Omit<CommunicationStrategy, 'id' | 'updatedAt'>) => {
    const item: CommunicationStrategy = {
      ...data,
      id: `str-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setWorkspace((prev) => ({
      ...prev,
      strategies: [item, ...prev.strategies],
      activities: pushActivity(
        prev,
        data.eventId,
        `Strategi komunikasi: "${item.title}"`,
        `Tujuan ${item.goal} · Tone ${item.tone}`,
        'strategi'
      ),
    }));
    showToast(`Strategi "${item.title}" berhasil disimpan`);
  };

  const updateStrategy = (
    id: string,
    data: Partial<Omit<CommunicationStrategy, 'id'>>
  ) => {
    setWorkspace((prev) => ({
      ...prev,
      strategies: prev.strategies.map((st) =>
        st.id === id ? { ...st, ...data, updatedAt: new Date().toISOString() } : st
      ),
    }));
    showToast('Strategi komunikasi berhasil diperbarui');
  };

  const deleteStrategy = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      strategies: prev.strategies.filter((st) => st.id !== id),
    }));
    showToast('Strategi komunikasi dihapus');
  };

  const addPromoPlan = (data: Omit<PromoPlan, 'id'>) => {
    const item: PromoPlan = {
      ...data,
      id: `prm-${Date.now()}`,
    };
    setWorkspace((prev) => ({
      ...prev,
      promoPlans: [...prev.promoPlans, item],
      activities: pushActivity(
        prev,
        data.eventId,
        `Jadwal promosi: ${item.title}`,
        `${item.platform} · ${item.publishDate} (${item.status})`,
        'promosi'
      ),
    }));
    showToast(`Rencana promosi "${item.title}" ditambahkan`);
  };

  const updatePromoPlan = (id: string, data: Partial<Omit<PromoPlan, 'id'>>) => {
    setWorkspace((prev) => ({
      ...prev,
      promoPlans: prev.promoPlans.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
    showToast('Jadwal promosi berhasil diperbarui');
  };

  const deletePromoPlan = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      promoPlans: prev.promoPlans.filter((p) => p.id !== id),
    }));
    showToast('Rencana promosi dihapus');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setWorkspace((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...data },
    }));
    showToast('Profil pengguna berhasil disimpan');
  };

  const updateSettings = (data: Partial<AppSettings>) => {
    setWorkspace((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...data },
    }));
    showToast('Pengaturan aplikasi diperbarui');
  };

  const markAllNotificationsRead = () => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const markNotificationRead = (id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setWorkspace({
      events: SEED_EVENTS,
      activeEventId: SEED_EVENTS[0].id,
      audiences: SEED_AUDIENCES,
      segments: SEED_SEGMENTS,
      strategies: SEED_STRATEGIES,
      promoPlans: SEED_PROMO_PLANS,
      evaluations: SEED_EVALUATIONS,
      activities: SEED_ACTIVITIES,
      notifications: SEED_NOTIFICATIONS,
      profile: SEED_PROFILE,
      settings: SEED_SETTINGS,
    });
    setEditingSegmentId(null);
    showToast('Data demo awal berhasil dipulihkan', 'info');
  };

  return (
    <EventReachContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        events: workspace.events,
        activeEvent,
        activeEventId,
        setActiveEventId,
        audiences: workspace.audiences,
        activeAudiences,
        segments: workspace.segments,
        activeSegments,
        strategies: workspace.strategies,
        activeStrategies,
        promoPlans: workspace.promoPlans,
        activePromoPlans,
        evaluations: workspace.evaluations,
        activities: workspace.activities,
        activeActivities,
        notifications: workspace.notifications,
        profile: workspace.profile,
        settings: workspace.settings,
        addEvent,
        updateEvent,
        deleteEvent,
        addAudience,
        importAudiences,
        updateAudience,
        deleteAudience,
        addSegment,
        updateSegment,
        deleteSegment,
        addStrategy,
        updateStrategy,
        deleteStrategy,
        addPromoPlan,
        updatePromoPlan,
        deletePromoPlan,
        updateProfile,
        updateSettings,
        markAllNotificationsRead,
        markNotificationRead,
        resetDemoData,
        toasts,
        showToast,
        dismissToast,
        confirmDialog,
        requestConfirm,
        closeConfirm,
        editingSegmentId,
        setEditingSegmentId,
      }}
    >
      {children}
    </EventReachContext.Provider>
  );
};

export function useEventReach() {
  const ctx = useContext(EventReachContext);
  if (!ctx) {
    throw new Error('useEventReach must be used inside EventReachProvider');
  }
  return ctx;
}

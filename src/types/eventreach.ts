export type NavPage =
  | 'beranda'
  | 'event'
  | 'audiens'
  | 'segmentasi'
  | 'strategi'
  | 'promosi'
  | 'evaluasi'
  | 'profil';

export type EventStatus = 'Upcoming' | 'Active' | 'Completed';

export interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: EventStatus;
  targetParticipants: number;
  organizer: string;
  createdAt: string;
}

export type AudienceCategory = 'Mahasiswa' | 'Dosen' | 'Alumni' | 'Masyarakat Umum';
export type AudienceStatus = 'Terdaftar' | 'Terkonfirmasi' | 'Prospek' | 'Batal';

export interface AudienceMember {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  category: AudienceCategory;
  institution: string;
  age: number | null;
  interest: string;
  status: AudienceStatus;
  createdAt: string;
}

export interface AudienceSegment {
  id: string;
  eventId: string;
  name: string;
  categories: AudienceCategory[];
  ageRange: {
    min: number;
    max: number;
    enabled: boolean;
  };
  institutions: string[];
  interests: string[];
  statuses: AudienceStatus[];
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type CommunicationGoal = 'Awareness' | 'Engagement' | 'Registration' | 'Attendance';
export type CommunicationTone = 'Formal' | 'Informal' | 'Friendly' | 'Persuasif';
export type MediaPlatform = 'Instagram' | 'TikTok' | 'WhatsApp' | 'Email' | 'Poster' | 'Website';

export interface CommunicationStrategy {
  id: string;
  eventId: string;
  title: string;
  segmentId: string;
  segmentName: string;
  goal: CommunicationGoal;
  tone: CommunicationTone;
  channels: MediaPlatform[];
  message: string;
  status: 'Draft' | 'Siap Digunakan';
  updatedAt: string;
}

export type PromoStatus = 'Draft' | 'Scheduled' | 'Published';

export interface PromoPlan {
  id: string;
  eventId: string;
  title: string;
  platform: MediaPlatform;
  publishDate: string;
  publishTime: string;
  contentType: string;
  caption: string;
  status: PromoStatus;
  strategyId?: string;
}

export interface EvaluationMetric {
  id: string;
  eventId: string;
  platform: MediaPlatform;
  period: string;
  reach: number;
  views: number;
  engagement: number;
  clicks: number;
  registrations: number;
}

export interface ActivityItem {
  id: string;
  eventId: string;
  title: string;
  detail: string;
  timestamp: string;
  targetPage: NavPage;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetPage: NavPage;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  organization: string;
  avatarPreset: 'rose' | 'blush' | 'mauve' | 'berry';
  customAvatarDataUrl?: string;
}

export interface AppSettings {
  compactTable: boolean;
  showInsightTips: boolean;
  autoSaveDrafts: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

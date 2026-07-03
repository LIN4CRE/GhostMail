export interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  snippet: string;
  body: string;
  bodyHtml: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  hasAttachments: boolean;
  attachments: Attachment[];
  selected: boolean;
  sizeEstimate: number;
}

export interface EmailAddress {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface LabelInfo {
  id: string;
  name: string;
  type: 'system' | 'user';
  color: string;
  unreadCount: number;
  totalCount: number;
  icon?: string;
}

export interface GoogleApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  description: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

export type ViewMode = 'comfortable' | 'compact' | 'cozy';

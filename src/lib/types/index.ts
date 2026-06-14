export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

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

export interface EmailFilter {
  query: string;
  label: string;
  isRead: boolean | null;
  hasAttachment: boolean | null;
  from: string;
  dateAfter: Date | null;
  dateBefore: Date | null;
  sizeGreaterThan: number | null; /* bytes */
}

export interface BulkAction {
  type: 'delete' | 'archive' | 'markRead' | 'markUnread' | 'addLabel' | 'removeLabel' | 'star' | 'unstar';
  emailIds: string[];
  label?: string;
}

export interface LabelInfo {
  id: string;
  name: string;
  type: 'system' | 'user';
  color: string;
  unreadCount: number;
  totalCount: number;
}

export interface GoogleApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  color: string;
  description: string;
}

export interface PaginationState {
  nextPageToken: string | null;
  previousPageTokens: string[];
  currentPage: number;
  totalEstimate: number;
  pageSize: number;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

export type SortOrder = 'newest' | 'oldest' | 'largest' | 'smallest';
export type ViewMode = 'comfortable' | 'compact';

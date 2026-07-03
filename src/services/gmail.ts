import type { Email, EmailAddress, LabelInfo, Attachment } from '../types';

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

async function gmailFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  if (!_accessToken) throw new Error('Not authenticated');
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${_accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 401) {
    _accessToken = null;
    throw new Error('Session expired — please sign in again');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// --- Parsing ---

function parseAddress(raw: string): EmailAddress {
  const match = raw.match(/^(.+)\s<(.+)>$/);
  if (match) return { name: match[1].replace(/"/g, '').trim(), email: match[2] };
  return { name: raw, email: raw };
}

function getHeader(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function decodeBody(data: string): string {
  try {
    return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return '';
  }
}

function extractBody(payload: any): { body: string; bodyHtml: string } {
  let body = '';
  let bodyHtml = '';

  function walk(part: any) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body = decodeBody(part.body.data);
    }
    if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml = decodeBody(part.body.data);
    }
    if (part.parts) part.parts.forEach(walk);
  }

  if (payload) walk(payload);
  return { body, bodyHtml };
}

function extractAttachments(payload: any): Attachment[] {
  const attachments: Attachment[] = [];
  function walk(part: any) {
    if (part.filename && part.filename.length > 0) {
      attachments.push({
        id: part.body?.attachmentId || '',
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body?.size || 0,
      });
    }
    if (part.parts) part.parts.forEach(walk);
  }
  if (payload) walk(payload);
  return attachments;
}

export function parseGmailMessage(msg: any): Email {
  const headers = msg.payload?.headers || [];
  const fromRaw = getHeader(headers, 'From');
  const toRaw = getHeader(headers, 'To');
  const subject = getHeader(headers, 'Subject') || '(no subject)';
  const dateStr = getHeader(headers, 'Date');
  const labels: string[] = msg.labelIds || [];
  const { body, bodyHtml } = extractBody(msg.payload);
  const attachments = extractAttachments(msg.payload);

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject,
    from: parseAddress(fromRaw),
    to: toRaw
      ? toRaw.split(',').map((t: string) => parseAddress(t.trim())).filter((t: EmailAddress) => t.email)
      : [],
    snippet: msg.snippet || '',
    body: body || msg.snippet || '',
    bodyHtml,
    date: dateStr ? new Date(dateStr) : new Date(parseInt(msg.internalDate)),
    isRead: !labels.includes('UNREAD'),
    isStarred: labels.includes('STARRED'),
    isImportant: labels.includes('IMPORTANT'),
    labels,
    hasAttachments: attachments.length > 0,
    attachments,
    selected: false,
    sizeEstimate: msg.sizeEstimate || 0,
  };
}

// --- API calls ---

export async function fetchMessages(labelId: string, query: string, maxResults = 50): Promise<{ emails: Email[]; nextPageToken: string | null }> {
  const params = new URLSearchParams({ maxResults: String(maxResults) });
  if (labelId && !query) params.set('labelIds', labelId);
  if (query) params.set('q', query);

  const list = await gmailFetch(`/messages?${params}`);
  const ids: string[] = (list.messages || []).map((m: any) => m.id);

  if (ids.length === 0) return { emails: [], nextPageToken: null };

  // Batch fetch in chunks of 10
  const emails: Email[] = [];
  for (let i = 0; i < ids.length; i += 10) {
    const chunk = ids.slice(i, i + 10);
    const details = await Promise.all(
      chunk.map((id) => gmailFetch(`/messages/${id}?format=full`))
    );
    emails.push(...details.map(parseGmailMessage));
  }

  return { emails, nextPageToken: list.nextPageToken || null };
}

export async function fetchLabels(): Promise<LabelInfo[]> {
  const res = await gmailFetch('/labels');
  const systemOrder = ['INBOX', 'STARRED', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'IMPORTANT'];
  const icons: Record<string, string> = {
    INBOX: '📥', STARRED: '⭐', SENT: '📤', DRAFT: '📝',
    SPAM: '⚠️', TRASH: '🗑️', IMPORTANT: '🏷️', CATEGORY_PERSONAL: '👤',
    CATEGORY_SOCIAL: '👥', CATEGORY_PROMOTIONS: '📢', CATEGORY_UPDATES: '🔔',
    CATEGORY_FORUMS: '💬',
  };

  return (res.labels || [])
    .filter((l: any) => {
      if (l.type === 'system') return systemOrder.includes(l.id);
      return true;
    })
    .map((l: any) => ({
      id: l.id,
      name: l.name,
      type: l.type === 'system' ? 'system' : 'user',
      color: l.color?.backgroundColor || '',
      unreadCount: l.messagesUnread || 0,
      totalCount: l.messagesTotal || 0,
      icon: icons[l.id] || '📌',
    }))
    .sort((a: LabelInfo, b: LabelInfo) => {
      if (a.type !== b.type) return a.type === 'system' ? -1 : 1;
      const ai = systemOrder.indexOf(a.id);
      const bi = systemOrder.indexOf(b.id);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
}

export async function modifyMessage(id: string, addLabels: string[], removeLabels: string[]): Promise<void> {
  await gmailFetch(`/messages/${id}/modify`, {
    method: 'POST',
    body: JSON.stringify({ addLabelIds: addLabels, removeLabelIds: removeLabels }),
  });
}

export async function batchModify(ids: string[], addLabels: string[], removeLabels: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    await gmailFetch('/messages/batchModify', {
      method: 'POST',
      body: JSON.stringify({ ids: chunk, addLabelIds: addLabels, removeLabelIds: removeLabels }),
    });
  }
}

export async function trashMessage(id: string): Promise<void> {
  await gmailFetch(`/messages/${id}/trash`, { method: 'POST' });
}

export async function batchTrash(ids: string[], onProgress?: (n: number) => void): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    await trashMessage(ids[i]);
    onProgress?.(i + 1);
  }
}

export async function sendMessage(to: string, subject: string, body: string, cc?: string, bcc?: string): Promise<void> {
  const lines = [
    `To: ${to}`,
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].filter(Boolean);

  const raw = btoa(unescape(encodeURIComponent(lines.join('\r\n'))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmailFetch('/messages/send', {
    method: 'POST',
    body: JSON.stringify({ raw }),
  });
}

export async function getMessage(id: string): Promise<Email> {
  const msg = await gmailFetch(`/messages/${id}?format=full`);
  return parseGmailMessage(msg);
}

export async function createGmailLabel(name: string, color?: string): Promise<LabelInfo> {
  const body: any = {
    name,
    labelListVisibility: 'labelShow',
    messageListVisibility: 'show',
  };
  if (color) {
    body.color = { backgroundColor: color, textColor: '#000000' };
  }
  const res = await gmailFetch('/labels', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return {
    id: res.id,
    name: res.name,
    type: 'user',
    color: color || '',
    unreadCount: 0,
    totalCount: 0,
    icon: '📌',
  };
}

export async function deleteGmailLabel(id: string): Promise<void> {
  await gmailFetch(`/labels/${id}`, { method: 'DELETE' });
}

export async function getProfile(): Promise<{ email: string; name: string; picture: string }> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${_accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to get profile');
  const data = await res.json();
  return {
    email: data.email || '',
    name: data.name || data.email?.split('@')[0] || 'User',
    picture: data.picture || '',
  };
}

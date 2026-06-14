import { getValidToken } from './googleAuth';
import { emailStore } from '$lib/stores/emails';
import { ui } from '$lib/stores/ui';
import type { Email, EmailAddress, LabelInfo, BulkAction } from '$lib/types';

const API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function gmailFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getValidToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API error ${res.status}`);
  }

  return res.json();
}

// Parse email address string: "Name <email@example.com>"
function parseEmailAddress(raw: string): EmailAddress {
  const match = raw.match(/^(.+)\s<(.+)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, '').trim(), email: match[2] };
  }
  return { name: raw, email: raw };
}

function getHeader(headers: any[], name: string): string {
  return headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function parseEmail(msg: any): Email {
  const headers = msg.payload.headers || [];
  const fromRaw = getHeader(headers, 'From');
  const toRaw = getHeader(headers, 'To');
  const subject = getHeader(headers, 'Subject') || '(no subject)';
  const dateStr = getHeader(headers, 'Date');
  const labels: string[] = msg.labelIds || [];

  // Extract body
  let body = '';
  let bodyHtml = '';

  function extractParts(part: any) {
    if (part.mimeType === 'text/plain' && part.body.data) {
      body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    if (part.mimeType === 'text/html' && part.body.data) {
      bodyHtml = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    if (part.parts) {
      part.parts.forEach(extractParts);
    }
  }

  if (msg.payload) {
    extractParts(msg.payload);
  }

  // Extract attachments
  const attachments: any[] = [];
  function findAttachments(part: any) {
    if (part.filename && part.filename.length > 0) {
      attachments.push({
        id: part.body.attachmentId || '',
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size || 0
      });
    }
    if (part.parts) part.parts.forEach(findAttachments);
  }
  if (msg.payload) findAttachments(msg.payload);

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject,
    from: parseEmailAddress(fromRaw),
    to: toRaw.split(',').map((t: string) => parseEmailAddress(t.trim())).filter((t: EmailAddress) => t.email),
    snippet: msg.snippet || '',
    body,
    bodyHtml,
    date: dateStr ? new Date(dateStr) : new Date(parseInt(msg.internalDate)),
    isRead: !labels.includes('UNREAD'),
    isStarred: labels.includes('STARRED'),
    isImportant: labels.includes('IMPORTANT'),
    labels,
    hasAttachments: attachments.length > 0,
    attachments,
    selected: false,
    sizeEstimate: msg.sizeEstimate || 0
  };
}

export async function fetchEmails(
  labelId: string = 'INBOX',
  query: string = '',
  pageToken: string | null = null,
  maxResults: number = 50
): Promise<void> {
  emailStore.setLoading(true);

  try {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
      labelIds: labelId
    });
    if (query) params.set('q', query);
    if (pageToken) params.set('pageToken', pageToken);

    const listResult = await gmailFetch(`/messages?${params}`);
    const messageIds: string[] = (listResult.messages || []).map((m: any) => m.id);

    if (messageIds.length === 0) {
      emailStore.setEmails([], null, 0);
      return;
    }

    // Batch fetch message details (in chunks of 20)
    const emails: Email[] = [];
    const chunkSize = 20;

    for (let i = 0; i < messageIds.length; i += chunkSize) {
      const chunk = messageIds.slice(i, i + chunkSize);
      const details = await Promise.all(
        chunk.map(id =>
          gmailFetch(`/messages/${id}?format=full`)
        )
      );
      emails.push(...details.map(parseEmail));
    }

    emailStore.setEmails(
      emails,
      listResult.nextPageToken || null,
      listResult.resultSizeEstimate || emails.length
    );
  } catch (err) {
    ui.notify('error', `Failed to fetch emails: ${err}`);
    emailStore.setLoading(false);
  }
}

export async function fetchLabels(): Promise<void> {
  try {
    const result = await gmailFetch('/labels');
    const labels: LabelInfo[] = (result.labels || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      type: l.type.toLowerCase() || 'user',
      color: l.color?.backgroundColor || '',
      unreadCount: l.messagesUnread || 0,
      totalCount: l.messagesTotal || 0
    }));

    // Sort system labels first, then alphabetical
    labels.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'system' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    emailStore.setLabels(labels);
  } catch (err) {
    ui.notify('error', `Failed to fetch labels: ${err}`);
  }
}

export async function executeBulkAction(action: BulkAction): Promise<void> {
  const { type, emailIds } = action;

  if (emailIds.length === 0) return;

  emailStore.setBulkProcessing(true, emailIds.length);

  try {
    // Gmail batch modify supports up to 1000 IDs
    const chunkSize = 1000;

    for (let i = 0; i < emailIds.length; i += chunkSize) {
      const chunk = emailIds.slice(i, i + chunkSize);

      switch (type) {
        case 'delete':
          // Batch trash
          await gmailFetch('/messages/batchModify', {
            method: 'POST',
            body: JSON.stringify({
              ids: chunk,
              addLabelIds: ['TRASH'],
              removeLabelIds: ['INBOX']
            })
          });
          break;

        case 'archive':
          await gmailFetch('/messages/batchModify', {
            method: 'POST',
            body: JSON.stringify({
              ids: chunk,
              removeLabelIds: ['INBOX']
            })
          });
          break;

        case 'markRead':
          await gmailFetch('/messages/batchModify', {
            method: 'POST',
            body: JSON.stringify({
              ids: chunk,
              removeLabelIds: ['UNREAD']
            })
          });
          break;

        case 'markUnread':
          await gmailFetch('/messages/batchModify', {
            method: 'POST',
            body: JSON.stringify({
              ids: chunk,
              addLabelIds: ['UNREAD']
            })
          });
          break;

        case 'addLabel':
          if (action.label) {
            await gmailFetch('/messages/batchModify', {
              method: 'POST',
              body: JSON.stringify({
                ids: chunk,
                addLabelIds: [action.label]
              })
            });
          }
          break;

        case 'removeLabel':
          if (action.label) {
            await gmailFetch('/messages/batchModify', {
              method: 'POST',
              body: JSON.stringify({
                ids: chunk,
                removeLabelIds: [action.label]
              })
            });
          }
          break;
      }

      emailStore.updateBulkProgress(Math.min(i + chunkSize, emailIds.length));
    }

    // Update local state
    if (type === 'delete' || type === 'archive') {
      emailStore.removeEmails(emailIds);
    } else if (type === 'markRead') {
      emailStore.markAsRead(emailIds);
    } else if (type === 'markUnread') {
      emailStore.markAsUnread(emailIds);
    }

    emailStore.deselectAll();
    ui.notify('success', `${type} completed on ${emailIds.length} email(s)`);

  } catch (err) {
    ui.notify('error', `Bulk ${type} failed: ${err}`);
  } finally {
    emailStore.setBulkProcessing(false);
  }
}

export async function permanentlyDeleteEmails(emailIds: string[]): Promise<void> {
  emailStore.setBulkProcessing(true, emailIds.length);

  try {
    // Permanent delete must be done one at a time (no batch endpoint)
    // But we can parallelize with concurrency limit
    const concurrency = 10;

    for (let i = 0; i < emailIds.length; i += concurrency) {
      const chunk = emailIds.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(id =>
          gmailFetch(`/messages/${id}`, { method: 'DELETE' })
        )
      );
      emailStore.updateBulkProgress(Math.min(i + concurrency, emailIds.length));
    }

    emailStore.removeEmails(emailIds);
    emailStore.deselectAll();
    ui.notify('success', `Permanently deleted ${emailIds.length} email(s)`);
  } catch (err) {
    ui.notify('error', `Delete failed: ${err}`);
  } finally {
    emailStore.setBulkProcessing(false);
  }
}

export async function searchAndSelectAll(query: string): Promise<string[]> {
  // Fetch ALL message IDs matching a query (for mass operations)
  const allIds: string[] = [];
  let pageToken: string | null = null;

  do {
    const params = new URLSearchParams({ q: query, maxResults: '500' });
    if (pageToken) params.set('pageToken', pageToken);

    const result = await gmailFetch(`/messages?${params}`);
    const ids = (result.messages || []).map((m: any) => m.id);
    allIds.push(...ids);
    pageToken = result.nextPageToken || null;
  } while (pageToken);

  return allIds;
}

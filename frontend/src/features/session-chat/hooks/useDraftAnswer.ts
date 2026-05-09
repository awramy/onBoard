const draftKey = (sessionId: string) => `onboard:chat-draft:${sessionId}`;

export function useDraftAnswer(sessionId: string) {
  function getDraft(): string {
    try {
      return localStorage.getItem(draftKey(sessionId)) ?? '';
    } catch {
      return '';
    }
  }

  function saveDraft(text: string) {
    try {
      if (text) {
        localStorage.setItem(draftKey(sessionId), text);
      } else {
        localStorage.removeItem(draftKey(sessionId));
      }
    } catch {
      // ignore
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(draftKey(sessionId));
    } catch {
      // ignore
    }
  }

  return { getDraft, saveDraft, clearDraft };
}

export type SentReply = {
  message: string;
  sentAt: string; // ISO date
};

const STORAGE_KEY = "gumamela-sent-replies";

// Saved only in her own browser; it can be empty in private mode or after clearing data
export function loadReplies(): SentReply[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveReplies(replies: SentReply[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
  } catch {
    // Storage blocked: the list just won't survive a reload
  }
}

export function RepliesList({ replies }: { replies: SentReply[] }) {
  if (replies.length === 0) {
    return <p className="text-muted">Wala pang na-send. 🌺</p>;
  }

  return (
    <ul className="flex w-full flex-col gap-3 text-left">
      {[...replies].reverse().map((r) => (
        <li
          key={r.sentAt}
          className="rounded-2xl border border-petal/20 bg-white/80 px-4 py-3 shadow-sm shadow-hibiscus/10"
        >
          <p className="whitespace-pre-wrap break-words text-ink">
            {r.message || <span className="italic text-muted">Just a yes, no message 🌺</span>}
          </p>
          <p className="mt-1 text-xs text-muted">
            {new Date(r.sentAt).toLocaleString("en-PH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </li>
      ))}
    </ul>
  );
}

"use client";

type Category = { id: string; name: string; slug: string; articleCount: number };

export function PreferencesPanel({
  categories,
  preferredCategories,
  hideRead,
  savedOnly,
  onCategoryToggle,
  onHideReadChange,
  onSavedOnlyChange,
}: {
  categories: Category[];
  preferredCategories: string[];
  hideRead: boolean;
  savedOnly: boolean;
  onCategoryToggle: (slug: string) => void;
  onHideReadChange: (value: boolean) => void;
  onSavedOnlyChange: (value: boolean) => void;
}) {
  return <details className="mb-5 border border-[var(--line)] bg-[var(--panel)] p-4"><summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--cyan)]">Local preferences <span className="text-[var(--muted)]">/ browser only</span></summary><div className="mt-4 grid gap-4 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)] sm:grid-cols-2"><label className="flex items-center gap-3"><input className="accent-[var(--cyan)]" type="checkbox" checked={hideRead} onChange={(event) => onHideReadChange(event.target.checked)} />Hide articles I have read</label><label className="flex items-center gap-3"><input className="accent-[var(--cyan)]" type="checkbox" checked={savedOnly} onChange={(event) => onSavedOnlyChange(event.target.checked)} />Show saved articles only</label><div className="sm:col-span-2"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Preferred channels</p><div className="flex flex-wrap gap-2">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 border border-[var(--line)] px-3 py-2"><input className="accent-[var(--cyan)]" type="checkbox" checked={preferredCategories.includes(category.slug)} onChange={() => onCategoryToggle(category.slug)} />{category.name}</label>)}</div><p className="mt-3 text-[10px] text-[var(--muted)]">Leave every channel selected to keep the full technology feed.</p></div></div></details>;
}

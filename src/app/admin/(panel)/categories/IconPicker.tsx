"use client";

import { useState } from "react";

const GROUPS: { label: string; icons: string[] }[] = [
  { label: "مشروبات ساخنة", icons: ["☕", "🍵", "🫖", "🥛", "🍶", "🌿"] },
  { label: "مشروبات باردة", icons: ["🧋", "🥤", "🧃", "🍹", "🍸", "🧊", "🥥", "🫧"] },
  { label: "حلويات", icons: ["🥞", "🧇", "🍫", "🍰", "🎂", "🧁", "🍩", "🍪", "🍦", "🍨", "🍧", "🍮", "🍯", "🍬", "🍭", "🥧"] },
  { label: "فواكه", icons: ["🍓", "🍌", "🍎", "🍊", "🍋", "🍉", "🍇", "🍑", "🍍", "🥭", "🥝", "🫐", "🍒"] },
  { label: "طعام", icons: ["🥐", "🥖", "🥯", "🥨", "🧀", "🥪", "🌯", "🌮", "🍕", "🍔", "🌭", "🍟", "🥗", "🍳", "🍝", "🍜", "🍗"] },
  { label: "شيشة ومناسبات", icons: ["💨", "🔥", "🌬️", "🍽️", "⭐", "✨", "❤️", "🎁", "🎉", "👑", "🌙", "☀️"] },
];

/** The last emoji in what was typed, or null if there isn't one. */
function lastEmoji(text: string) {
  const parts = [...new Intl.Segmenter().segment(text.trim())].map((s) => s.segment);
  const last = parts.at(-1);
  return last && /\p{Extended_Pictographic}/u.test(last) ? last : null;
}

export function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  const [open, setOpen] = useState(false);
  const choose = (icon: string) => {
    onChange(icon);
    setOpen(false);
  };

  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-sm font-bold text-caramel">
        {open ? "إخفاء الأيقونات" : "تغيير الأيقونة"}
      </button>
      {open && (
        <div className="mt-2 space-y-3 rounded-xl bg-ink/40 p-3 ring-1 ring-line">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="mb-1 text-xs font-semibold text-muted">{g.label}</p>
              <div className="flex flex-wrap gap-1">
                {g.icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => choose(icon)}
                    aria-pressed={value === icon}
                    className={`grid size-10 place-items-center rounded-lg text-xl ${value === icon ? "bg-caramel/30 ring-2 ring-caramel" : "hover:bg-surface-2"}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">أيقونة أخرى</span>
            <input
              value=""
              onChange={(e) => {
                const icon = lastEmoji(e.target.value);
                if (icon) choose(icon);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              placeholder="اكتب أي إيموجي من لوحة المفاتيح"
              className="h-10 w-full rounded-lg bg-surface-2 px-3 text-sm outline-none ring-1 ring-line placeholder:text-muted focus:ring-caramel"
            />
          </label>
        </div>
      )}
    </div>
  );
}

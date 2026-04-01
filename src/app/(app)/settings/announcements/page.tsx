import { SettingsSubpageShell } from '@/components/settings/settings-subpage-shell';
import announcementsData from '@/data/announcements.json';
import { formatJapaneseDate } from '@/lib/date';

type Announcement = {
  date: string;
  title: string;
  detail: string;
};

const announcements = announcementsData as Announcement[];

export default function AnnouncementsPage() {
  const sorted = [...announcements].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <SettingsSubpageShell title="アプリからのお知らせ">
      <ul className="flex flex-col gap-3" role="list">
        {sorted.map((item, index) => (
          <li
            key={`${item.date}-${index}`}
            className="rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <p className="text-xs text-muted-foreground font-sans">
              {formatJapaneseDate(item.date)}
            </p>
            <p className="text-sm font-medium font-sans text-foreground mt-1">
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground font-sans mt-2 leading-relaxed whitespace-pre-wrap">
              {item.detail}
            </p>
          </li>
        ))}
      </ul>
    </SettingsSubpageShell>
  );
}

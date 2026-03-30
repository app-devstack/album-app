interface SettingsSectionHeaderProps {
  label: string;
}

export function SettingsSectionHeader({ label }: SettingsSectionHeaderProps) {
  return (
    <p className="px-1 mb-1 text-xs font-medium font-sans text-muted-foreground tracking-wider uppercase select-none">
      {label}
    </p>
  );
}

interface ExperienceSectionProps {
  children: React.ReactNode;
}

export default function ExperienceSection({ children }: ExperienceSectionProps) {
  return <div className="space-y-4">{children}</div>;
}

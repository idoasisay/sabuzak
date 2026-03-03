type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b border-border pb-1">
        {title}
      </h2>
      <div className="text-foreground">{children}</div>
    </section>
  );
}

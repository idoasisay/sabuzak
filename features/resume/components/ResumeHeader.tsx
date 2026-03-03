import type { ResumeData } from "../data";

type ResumeHeaderProps = {
  data: Pick<ResumeData, "name" | "email" | "contact">;
  issueDate: string;
};

export function ResumeHeader({ data, issueDate }: ResumeHeaderProps) {
  return (
    <header className="mb-10 pb-6 border-b border-border">
      <h1 className="text-2xl font-semibold text-foreground">{data.name}</h1>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <a
          href={`mailto:${data.email}`}
          className="hover:text-foreground underline-offset-2 hover:underline print:no-underline"
        >
          {data.email}
        </a>
        {data.contact ? <span>{data.contact}</span> : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">발급일: {issueDate}</p>
    </header>
  );
}

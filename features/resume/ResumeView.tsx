import { resumeData } from "./data";
import { Section } from "./components/Section";
import { ResumeHeader } from "./components/ResumeHeader";

function formatIssueDate(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function ResumeView() {
  const issueDate = formatIssueDate();
  const { name, email, contact, summary, career, education, skills, certifications } = resumeData;

  return (
    <div className="resume-page min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-10 md:px-8 md:py-14">
        <ResumeHeader data={{ name, email, contact }} issueDate={issueDate} />

        {summary ? (
          <Section title="요약">
            <p className="text-muted-foreground">{summary}</p>
          </Section>
        ) : null}

        {career.length > 0 ? (
          <Section title="경력">
            <ul className="space-y-6">
              {career.map((item, i) => (
                <li key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-foreground">{item.company}</span>
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.position}</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground">
                    {item.duties.map((duty, j) => (
                      <li key={j}>{duty}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {education.length > 0 ? (
          <Section title="학력">
            <ul className="space-y-4">
              {education.map((item, i) => (
                <li key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-foreground">{item.school}</span>
                    <span className="text-sm text-muted-foreground">{item.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.major} · {item.degree}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {skills.length > 0 ? (
          <Section title="기술">
            <p className="text-sm text-foreground">{skills.join(" · ")}</p>
          </Section>
        ) : null}

        {certifications.length > 0 ? (
          <Section title="자격·인증">
            <ul className="space-y-2">
              {certifications.map((item, i) => (
                <li key={i} className="text-sm text-foreground">
                  {item.name}
                  {item.issuer ? ` (${item.issuer})` : ""}
                  {item.date ? ` · ${item.date}` : ""}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </div>
  );
}

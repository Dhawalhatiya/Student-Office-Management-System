import { requireStudent } from "@/lib/auth";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Help and FAQs" };

const FAQS = [
  ["Why can't I see my latest result?", "Only results that the Examination team has published are shown. Drafts and results under review stay hidden until they are published."],
  ["A payment I made is not counted. Why?", "A fee is only marked as paid after the Finance team verifies the payment. Pending payments do not reduce your balance yet."],
  ["How do I change my name or date of birth?", "These are protected details. Submit a Profile correction request so the Student Office can review it."],
  ["Who can see my documents?", "Only you and authorised Student Office staff. Documents are stored privately and there are no public links."],
  ["Is this real student data?", "No. This is an academic demo and every record is fictional."],
];

export default async function HelpPage() {
  await requireStudent();
  return (
    <>
      <PageHeader title="Help and FAQs" />
      <div className="panel divide-y divide-line">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group px-4 py-3">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="mt-2 text-sm text-muted">{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}

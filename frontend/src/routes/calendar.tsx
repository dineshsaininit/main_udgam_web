import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Card } from "@/components/ui/PageShell";
import { getSchedule } from "@/lib/fest.functions";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [
    { title: "Day Calendar — Udgam 2K26" },
    { name: "description", content: "Day-by-day schedule for Udgam 2K26." },
    { property: "og:title", content: "Day Calendar — Udgam 2K26" },
    { property: "og:description", content: "Plan your three days at Udgam 2K26." },
  ] }),
  loader: () => getSchedule(),
  component: Calendar,
});

function Calendar() {
  const days = Route.useLoaderData();
  return (
    <PageShell title="Day Calendar" subtitle="Detailed timings coming soon.">
      <div className="grid gap-5 md:grid-cols-3">
        {days.map((d) => (
          <Card key={d.day} title={d.label}>
            <ul className="mt-2 space-y-2">{d.items.map((i) => <li key={i}>✿ {i}</li>)}</ul>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

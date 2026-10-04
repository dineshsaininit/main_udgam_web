import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Card } from "@/components/ui/PageShell";
import { getEvents } from "@/lib/fest.functions";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [
    { title: "Events — Udgam 2K26" },
    { name: "description", content: "Music, tech, art and culture events at Udgam 2K26." },
    { property: "og:title", content: "Events — Udgam 2K26" },
    { property: "og:description", content: "Explore the events blooming at Udgam 2K26." },
  ] }),
  loader: () => getEvents(),
  component: Events,
});

function Events() {
  const events = Route.useLoaderData();
  return (
    <PageShell title="Events" subtitle="Full lineup coming soon — here's a sneak peek.">
      <div className="grid gap-5 md:grid-cols-3">
        {events.map((e) => <Card key={e.id} title={e.title} tag={`${e.category} · Day ${e.day}`}>{e.blurb}</Card>)}
      </div>
    </PageShell>
  );
}

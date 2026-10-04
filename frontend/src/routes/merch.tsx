import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Card } from "@/components/ui/PageShell";

export const Route = createFileRoute("/merch")({
  head: () => ({ meta: [
    { title: "Merch — Udgam 2K26" },
    { name: "description", content: "Official Udgam 2K26 merchandise, coming soon." },
    { property: "og:title", content: "Merch — Udgam 2K26" },
    { property: "og:description", content: "Blossom-themed fest merch is on its way." },
  ] }),
  component: () => (
    <PageShell title="Merch" subtitle="Coming soon — blossom-stitched goodies.">
      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Sakura Hoodie" tag="Soon">Soft pink, softer fabric.</Card>
        <Card title="Fest Tee" tag="Soon">Wear the bloom.</Card>
        <Card title="Petal Tote" tag="Soon">Carry the whimsy.</Card>
      </div>
    </PageShell>
  ),
});

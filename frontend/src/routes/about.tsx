import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { submitContact } from "@/lib/fest.functions";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — Udgam 2K26" },
    { name: "description", content: "The story behind Udgam 2K26, our cherry blossom college fest." },
    { property: "og:title", content: "About — Udgam 2K26" },
    { property: "og:description", content: "Meet the fest where dreams bloom." },
  ] }),
  component: About,
});

function About() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <PageShell title="About Udgam 2K26" subtitle="Udgam means 'origin' — the moment a bud opens. Our fest celebrates every idea that's ready to bloom.">
      <form
        className="glass max-w-lg space-y-3 rounded-3xl p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          try {
            const r = await submitContact({ data: { name: String(f.get("name")), email: String(f.get("email")), message: String(f.get("message")) } });
            setSent(`Thanks, ${r.received}! We'll get back to you.`);
            e.currentTarget.reset();
          } catch { setSent("Please check your details and try again."); }
        }}
      >
        <h2 className="text-2xl font-semibold">Get in touch</h2>
        <input name="name" required placeholder="Name" className="w-full rounded-xl border bg-background/70 px-4 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border bg-background/70 px-4 py-2" />
        <textarea name="message" required placeholder="Message" rows={3} className="w-full rounded-xl border bg-background/70 px-4 py-2" />
        <button className="btn-blossom rounded-full px-6 py-2 font-bold">Send</button>
        {sent && <p className="text-sm text-secondary-foreground">{sent}</p>}
      </form>
    </PageShell>
  );
}

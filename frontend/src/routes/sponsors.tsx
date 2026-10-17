import { createFileRoute } from "@tanstack/react-router";
import SponsorsPage from "@/features/sponsors/SponsorsPage";
import sponsorsCss from "@/features/sponsors/sponsors.css?url";
import { getSponsors } from "@/lib/sponsors.functions";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — Udgam 2K26" },
      {
        name: "description",
        content:
          "Meet the sponsors and partners powering Udgam 2K26 — from food and clothing to tech and media.",
      },
      { property: "og:title", content: "Sponsors — Udgam 2K26" },
      {
        property: "og:description",
        content: "The brands and partners that make Udgam 2K26 possible.",
      },
    ],
    links: [{ rel: "stylesheet", href: sponsorsCss }],
  }),
  loader: () => getSponsors(),
  component: Sponsors,
});

function Sponsors() {
  const data = Route.useLoaderData();
  return <SponsorsPage data={data} />;
}

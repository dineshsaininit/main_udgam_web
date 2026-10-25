import { createFileRoute } from "@tanstack/react-router";
import SponsorsPage from "@/features/sponsors/SponsorsPage";
import sponsorsCss from "@/features/sponsors/sponsors.css?url";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — Udgam 2K26" },
      {
        name: "description",
        content:
          "Meet the partners powering Udgam 2K26, NIT Sikkim's cherry-blossom festival, and find out how your brand can bloom with us.",
      },
      { property: "og:title", content: "Sponsors — Udgam 2K26" },
      {
        property: "og:description",
        content: "Where Dreams Bloom. Meet the official partners of Udgam 2K26 and become one.",
      },
    ],
    links: [
      { rel: "stylesheet", href: sponsorsCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&display=swap",
      },
    ],
  }),
  component: SponsorsPage,
});

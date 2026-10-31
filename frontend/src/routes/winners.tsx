import { createFileRoute } from "@tanstack/react-router";
import WinnersPage from "@/features/winners/WinnersPage";
import winnersCss from "@/features/winners/winners.css?url";

export const Route = createFileRoute("/winners")({
  head: () => ({
    meta: [
      { title: "Competition Winners — Udgam 2K26" },
      {
        name: "description",
        content:
          "Celebrating the champions of Singing and Dance competitions at Udgam 2K26, NIT Sikkim's annual fest.",
      },
      { property: "og:title", content: "Competition Winners — Udgam 2K26" },
      {
        property: "og:description",
        content: "Announcing the winners of Udgam 2K26 cultural competitions.",
      },
    ],
    links: [
      { rel: "stylesheet", href: winnersCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Quicksand:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: WinnersPage,
});

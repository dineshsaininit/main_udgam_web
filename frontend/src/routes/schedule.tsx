import { createFileRoute } from "@tanstack/react-router";
import SchedulePage from "@/features/schedule/SchedulePage";
import scheduleCss from "@/features/schedule/schedule.css?url";
import { FEST_DAYS, type ScheduleView } from "@/features/schedule/scheduleData";

type ScheduleSearch = { view?: ScheduleView; day?: number };

export const Route = createFileRoute("/schedule")({
  validateSearch: (search: Record<string, unknown>): ScheduleSearch => {
    const out: ScheduleSearch = {};
    if (search["view"] === "night") out.view = "night";
    const day = Number(search["day"]);
    if (search["day"] !== undefined && FEST_DAYS.some((d) => d.day === day)) out.day = day;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Schedule — Udgam 2K26" },
      {
        name: "description",
        content:
          "Day-by-day and night schedule for Udgam 2K26 at NIT Sikkim: every event, time and venue.",
      },
      { property: "og:title", content: "Schedule — Udgam 2K26" },
      {
        property: "og:description",
        content: "Every event, time and venue across the four days of Udgam 2K26.",
      },
    ],
    links: [{ rel: "stylesheet", href: scheduleCss }],
  }),
  component: Schedule,
});

function Schedule() {
  const { view, day } = Route.useSearch();
  return <SchedulePage view={view ?? "day"} day={day} />;
}

import { createFileRoute } from "@tanstack/react-router";
import SchedulePage from "@/features/schedule/SchedulePage";
import scheduleCss from "@/features/schedule/schedule.css?url";
import { FEST_DAYS, NIGHT_PROGRAMMES, type ScheduleView } from "@/features/schedule/scheduleData";

// night: which night's programme is open under Night; absent = the Headliners tab
type ScheduleSearch = { view?: ScheduleView; day?: number; night?: number };

export const Route = createFileRoute("/schedule")({
  validateSearch: (search: Record<string, unknown>): ScheduleSearch => {
    const out: ScheduleSearch = {};
    if (search["view"] === "night") out.view = "night";
    const day = Number(search["day"]);
    if (search["day"] !== undefined && FEST_DAYS.some((d) => d.day === day)) out.day = day;
    const night = Number(search["night"]);
    if (search["night"] !== undefined && NIGHT_PROGRAMMES.some((n) => n.night === night))
      out.night = night;
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
  const { view, day, night } = Route.useSearch();
  return <SchedulePage view={view ?? "day"} day={day} night={night} />;
}

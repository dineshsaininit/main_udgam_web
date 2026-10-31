// Winners data for Udgam 2K26 competitions.

export interface Winner {
  position: 1 | 2 | 3;
  name: string;
}

export interface WinnerCategory {
  title: string;
  emoji: string;
  winners: Winner[];
}

export const WINNER_CATEGORIES: WinnerCategory[] = [
  {
    title: "Singing",
    emoji: "🎤",
    winners: [
      { position: 1, name: "Anwesh Bagdas" },
      { position: 2, name: "Zigme Lepcha & Anushka Sonowadi" },
      { position: 3, name: "Saysay Hang" },
    ],
  },
  {
    title: "Dance",
    emoji: "💃",
    winners: [
      { position: 1, name: "Jer Ayoung & Group" },
      { position: 2, name: "Nawan & Group" },
      { position: 3, name: "Komal" },
    ],
  },
];

export type Competitor = {
  id: number;
  name: string;
  steps: number;
  streak: number;
  isOnline: boolean;
  scoreDate: string;
};

export const DAILY_GOAL = 12000;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const competitors: Competitor[] = [
  { id: 1, name: "Mia", steps: 10930, streak: 9, isOnline: true, scoreDate: "2026-04-22" },
  { id: 2, name: "You", steps: 10142, streak: 6, isOnline: true, scoreDate: "2026-04-21" },
  { id: 3, name: "Luca", steps: 9830, streak: 4, isOnline: true, scoreDate: "2026-04-22" },
  { id: 4, name: "Amara", steps: 8712, streak: 12, isOnline: false, scoreDate: "2026-04-20" },
  { id: 5, name: "Jake", steps: 7922, streak: 3, isOnline: true, scoreDate: "2026-04-19" },
  { id: 6, name: "Noor", steps: 7520, streak: 8, isOnline: false, scoreDate: "2026-04-18" },
];

export function formatSteps(value: number) {
  return value.toLocaleString();
}

export function formatScoreDate(value: string) {
  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return `${MONTH_NAMES[parsedDate.getUTCMonth()]} ${parsedDate.getUTCDate()}`;
}

export function buildLeaderboardState(data: Competitor[]) {
  const sorted = [...data].sort((a, b) => b.steps - a.steps);
  const leader = sorted[0];
  const you = sorted.find((item) => item.name === "You") ?? sorted[0];
  const rival =
    sorted.find((item) => item.name !== "You") ?? sorted[1] ?? sorted[0];
  const yourRank = sorted.findIndex((item) => item.id === you.id) + 1;

  const rivalDistance = Math.max(rival.steps - you.steps, 0);
  const leaderDistance = Math.max(leader.steps - you.steps, 0);

  const youProgress = Math.min((you.steps / DAILY_GOAL) * 100, 100);
  const rivalProgress = Math.min((rival.steps / DAILY_GOAL) * 100, 100);

  return {
    sorted,
    leader,
    you,
    rival,
    yourRank,
    rivalDistance,
    leaderDistance,
    youProgress,
    rivalProgress,
  };
}

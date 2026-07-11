export type InactivityMotivation = {
  title: string;
  body: string;
  url: string;
};

const gentleMessages = [
  "A short session still counts. Ten focused minutes can restart your rhythm.",
  "You do not need a perfect workout today—just a useful one.",
  "Momentum comes back one set, one walk, or one session at a time.",
];

const resetMessages = [
  "The gap does not define you. Make today the first page of the next streak.",
  "Your fitness has not disappeared. Give it one honest session and build from there.",
  "Start lighter than you think, finish feeling better, and let consistency return.",
];

const comebackMessages = [
  "No guilt, no punishment—just a calm comeback session when you are ready.",
  "A long break only changes the starting point. It does not change what you can build.",
  "Choose the easiest session you can complete today. Showing up is the win.",
];

function pickMessage(messages: string[], daysInactive: number, seed = "") {
  const seedValue = Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    daysInactive
  );

  return messages[seedValue % messages.length];
}

export function getInactivityMotivation(
  daysInactive: number,
  seed = ""
): InactivityMotivation {
  if (daysInactive >= 14) {
    return {
      title: "Your comeback can start small",
      body: pickMessage(comebackMessages, daysInactive, seed),
      url: "/workouts/live",
    };
  }

  if (daysInactive >= 7) {
    return {
      title: "Ready for a reset?",
      body: pickMessage(resetMessages, daysInactive, seed),
      url: "/training-plan",
    };
  }

  return {
    title: "Keep your rhythm alive",
    body: pickMessage(gentleMessages, daysInactive, seed),
    url: "/workouts/live",
  };
}

export function getDaysBetweenDates(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00Z`).getTime();
  const to = new Date(`${toDate}T00:00:00Z`).getTime();

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return 0;
  }

  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

export function getDateInTimeZone(date: Date, timeZone?: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

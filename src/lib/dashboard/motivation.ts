const weeklyCoachMessages = [
  "Build the week one honest session at a time.",
  "Your future strength is hidden inside this week's consistency.",
  "Small logs become clear progress. Keep showing up.",
  "Train with intent, recover with patience, and record the work.",
  "You do not need a perfect week—you need a week you can repeat.",
  "Every completed habit is a vote for the athlete you are becoming.",
  "Make the next healthy choice easy, then let momentum do its job.",
  "The goal this week is simple: leave useful evidence of progress.",
];

function getMondayWeekIndex(date: Date) {
  const utcDate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const dayFromMonday = (date.getUTCDay() + 6) % 7;
  const monday = utcDate - dayFromMonday * 86_400_000;

  return Math.floor(monday / (7 * 86_400_000));
}

/** Stable for a full Monday-Sunday week, then rotates automatically. */
export function getWeeklyCoachMessage(date = new Date(), seed = "") {
  const seedValue = Array.from(seed).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );
  const index = Math.abs(getMondayWeekIndex(date) + seedValue);

  return weeklyCoachMessages[index % weeklyCoachMessages.length];
}

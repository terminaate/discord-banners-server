export const prettyDuration = (ms: number) => {
  const minutes = String(Math.trunc(ms / (1000 * 60))).padStart(2, '0');
  const seconds = String(Math.trunc((ms / 1000) % 60)).padStart(2, '0');

  return `${minutes}:${seconds}`;
};

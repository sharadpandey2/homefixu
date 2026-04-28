export function getLast3Months(logs: any[]) {
  const now = new Date();
  return logs.filter((log) => {
    const logDate = new Date(log.date);
    const diff = now.getTime() - logDate.getTime();
    return diff <= 90 * 24 * 60 * 60 * 1000;
  });
}

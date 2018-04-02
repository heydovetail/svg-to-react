export async function stopwatch(fn: () => Promise<void>): Promise<number> {
  const startTime = new Date();
  await fn();
  const endTime = new Date();
  return endTime.getTime() - startTime.getTime();
}

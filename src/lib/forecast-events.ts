import { emit } from "./events";
export async function forecastRunStarted(meta: Record<string, any>) {
  await emit("ForecastRunStarted", meta);
}
export async function replenishmentDraftCreated(meta: Record<string, any>) {
  await emit("ReplenishmentDraftCreated", meta);
}
export async function forecastRunCompleted(meta: Record<string, any>) {
  await emit("ForecastRunCompleted", meta);
}

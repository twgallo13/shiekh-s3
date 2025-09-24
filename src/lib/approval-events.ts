import { emit } from "./events";
export async function approvalRequested(meta: Record<string, any>) {
  await emit("ApprovalRequested", meta);
}
export async function approvalGranted(meta: Record<string, any>) {
  await emit("ApprovalGranted", meta);
}
export async function approvalDenied(meta: Record<string, any>) {
  await emit("ApprovalDenied", meta);
}

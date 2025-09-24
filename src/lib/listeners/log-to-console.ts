import { on } from "../events";

function log(name: string, payload: unknown) {
  try {
    // pretty JSON with context if keys exist
    console.log("[event]", name, JSON.stringify(payload, null, 2));
  } catch {
    console.log("[event]", name, payload);
  }
}

if (process.env.NODE_ENV !== "production") {
  on("ReplenishmentDraftCreated", (p) => log("ReplenishmentDraftCreated", p));
  on("ApprovalRequested",       (p) => log("ApprovalRequested", p));
  on("ApprovalGranted",         (p) => log("ApprovalGranted", p));
  on("ApprovalDenied",          (p) => log("ApprovalDenied", p));
}

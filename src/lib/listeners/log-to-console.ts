import { on } from "../events";
// Attach minimal console logger in dev only
if (process.env.NODE_ENV !== "production") {
  on("ReplenishmentDraftCreated", (p) => console.log("[event] ReplenishmentDraftCreated", p));
  on("ApprovalRequested", (p) => console.log("[event] ApprovalRequested", p));
  on("ApprovalGranted", (p) => console.log("[event] ApprovalGranted", p));
  on("ApprovalDenied", (p) => console.log("[event] ApprovalDenied", p));
}

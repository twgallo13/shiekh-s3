import { on } from "../events";
import { pushDevEvent } from "../dev-events-buffer";

if (process.env.NODE_ENV !== "production") {
  const cap = (name: any) => (p: any) => { try { pushDevEvent({ name, payload: p, ts: Date.now() }); } catch {} };
  on("ForecastRunStarted", cap("ForecastRunStarted"));
  on("ForecastRunCompleted", cap("ForecastRunCompleted"));
  on("ReplenishmentDraftCreated", cap("ReplenishmentDraftCreated"));
  on("ApprovalRequested", cap("ApprovalRequested"));
  on("ApprovalGranted", cap("ApprovalGranted"));
  on("ApprovalDenied", cap("ApprovalDenied"));
}

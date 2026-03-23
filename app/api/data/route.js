import { getStore } from "../../../lib/store.js";

export function GET() {
  var store = getStore();
  return Response.json(store);
}

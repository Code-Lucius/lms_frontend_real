export function isNoActiveTermError(json: any): boolean {
  return json?.code === "no_active_term";
}
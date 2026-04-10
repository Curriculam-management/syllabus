export function formatDate(dateValue) {
  if (!dateValue) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

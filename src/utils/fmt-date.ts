export const fmtDate = (format: Intl.DateTimeFormat) => (date?: Date) =>
  date ? format.format(date) : "Present";

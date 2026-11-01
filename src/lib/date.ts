// Formats a "YYYY-MM" string as e.g. "Sep 2022".
export function formatYearMonth(value: string): string {
	const [year, month] = value.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1)).toLocaleDateString('en-US', {
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	});
}

export function formatRange(start: string | undefined, end: string | undefined): string {
	if (!start) return end ? formatYearMonth(end) : '';
	return `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : 'Present'}`;
}

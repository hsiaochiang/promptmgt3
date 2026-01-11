
export function formatDate(dateInput: string | Date | number): string {
    if (!dateInput) return '-';
    const date = new Date(dateInput);

    // Format: MM/DD/YYYY HH:mm:ss
    // Locale: en-US (for MM/DD/YYYY order)
    // Timezone: Asia/Taipei

    // Using Intl is safer than toLocaleString for consistent parts, but toKeep it simple and robust for the user's string:
    // "01/22/2026 22:11:14"
    // en-US usually outputs "01/22/2026, 22:11:14" (with comma)

    const formatted = date.toLocaleString('en-US', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return formatted.replace(/,/g, '');
}

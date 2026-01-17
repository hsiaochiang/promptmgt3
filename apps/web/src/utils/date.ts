
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

export function formatDateOnly(dateInput: string | Date | number): string {
    if (!dateInput) return '-';
    const date = new Date(dateInput);

    // Format: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

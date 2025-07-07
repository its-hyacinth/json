// --- FullCalendar + Import Logic ---
document.addEventListener('DOMContentLoaded', function() {
    // Initialize FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        editable: true,
        selectable: true,
        events: [], // Will be populated from import
        eventClick: function(info) {
            // Show event details
            alert(`Title: ${info.event.title}\nStart: ${info.event.start}\nEnd: ${info.event.end || ''}`);
        },
        select: function(info) {
            // Optionally allow manual event creation
            const title = prompt('Enter event title:');
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: info.startStr,
                    end: info.endStr,
                    allDay: info.allDay
                });
            }
            calendar.unselect();
        }
    });
    calendar.render();

    // Dropdown import logic
    const fileInput = document.getElementById('fileInput');
    document.getElementById('importExcelBtn').addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.accept = '.xlsx,.xls';
        fileInput.click();
    });
    document.getElementById('importCsvBtn').addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.accept = '.csv';
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            let events = [];
            if (file.name.endsWith('.csv')) {
                events = parseCSV(e.target.result);
            } else {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                events = parseSheetJSON(json);
            }
            // Add events to calendar
            events.forEach(ev => calendar.addEvent(ev));
            calendar.render();
        };
        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
        // Reset input
        fileInput.value = '';
    });

    // Helper: Parse CSV string to events
    function parseCSV(csv) {
        const lines = csv.split('\n').filter(Boolean);
        const header = lines[0].split(',');
        const titleIdx = header.findIndex(h => h.toLowerCase().includes('title'));
        const dateIdx = header.findIndex(h => h.toLowerCase().includes('date'));
        const startIdx = header.findIndex(h => h.toLowerCase().includes('start'));
        const endIdx = header.findIndex(h => h.toLowerCase().includes('end'));
        const events = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (!cols[titleIdx] || !cols[dateIdx]) continue;
            let start = cols[startIdx] || cols[dateIdx];
            let end = cols[endIdx] || '';
            events.push({
                title: cols[titleIdx],
                start: start,
                end: end || undefined
            });
        }
        return events;
    }

    // Helper: Parse Excel sheet JSON to events
    function parseSheetJSON(json) {
        // Assume first row is header
        const header = json[0].map(h => h.toString().toLowerCase());
        const titleIdx = header.findIndex(h => h.includes('title'));
        const dateIdx = header.findIndex(h => h.includes('date'));
        const startIdx = header.findIndex(h => h.includes('start'));
        const endIdx = header.findIndex(h => h.includes('end'));
        const events = [];
        for (let i = 1; i < json.length; i++) {
            const row = json[i];
            if (!row[titleIdx] || !row[dateIdx]) continue;
            let start = row[startIdx] || row[dateIdx];
            let end = row[endIdx] || '';
            events.push({
                title: row[titleIdx],
                start: start,
                end: end || undefined
            });
        }
        return events;
    }
}); 
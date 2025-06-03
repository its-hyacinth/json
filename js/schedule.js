document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [], // Will be populated with shifts
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        dateClick: function(info) {
            showAddShiftModal(info.date);
        }
    });
    calendar.render();

    // Sample employee data
    const employees = [
        { id: 1, name: 'John Doe', department: 'patrol' },
        { id: 2, name: 'Jane Smith', department: 'investigation' },
        // Add more employees as needed
    ];

    // Populate employee select
    const employeeSelect = document.getElementById('employeeSelect');
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        employeeSelect.appendChild(option);
    });

    // Modal elements
    const modal = document.getElementById('addShiftModal');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelShiftBtn');
    const saveBtn = document.getElementById('saveShiftBtn');
    const addShiftBtn = document.getElementById('addShiftBtn');

    // Department and shift filters
    const departmentFilter = document.getElementById('departmentFilter');
    const shiftFilter = document.getElementById('shiftFilter');

    // Event listeners
    addShiftBtn.addEventListener('click', () => showAddShiftModal(new Date()));
    closeBtn.addEventListener('click', hideModal);
    cancelBtn.addEventListener('click', hideModal);
    saveBtn.addEventListener('click', saveShift);

    departmentFilter.addEventListener('change', applyFilters);
    shiftFilter.addEventListener('change', applyFilters);

    // Functions
    function showAddShiftModal(date) {
        document.getElementById('shiftDate').value = formatDate(date);
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
        document.getElementById('addShiftForm').reset();
    }

    function saveShift() {
        const form = document.getElementById('addShiftForm');
        const date = document.getElementById('shiftDate').value;
        const shiftType = document.getElementById('shiftType').value;
        const employeeId = document.getElementById('employeeSelect').value;
        const notes = document.getElementById('shiftNotes').value;

        if (!date || !shiftType || !employeeId) {
            alert('Please fill in all required fields');
            return;
        }

        const employee = employees.find(emp => emp.id === parseInt(employeeId));
        const event = {
            title: `${employee.name} - ${capitalizeFirst(shiftType)} Shift`,
            start: date,
            className: `fc-event-${shiftType}`,
            extendedProps: {
                employeeId,
                shiftType,
                notes,
                department: employee.department
            }
        };

        calendar.addEvent(event);
        hideModal();
    }

    function showEventDetails(event) {
        const employee = employees.find(emp => emp.id === event.extendedProps.employeeId);
        const details = `
            Employee: ${employee.name}
            Shift: ${capitalizeFirst(event.extendedProps.shiftType)}
            Department: ${capitalizeFirst(employee.department)}
            Notes: ${event.extendedProps.notes || 'None'}
        `;
        alert(details); // Replace with a better UI for showing details
    }

    function applyFilters() {
        const department = departmentFilter.value;
        const shift = shiftFilter.value;

        const events = calendar.getEvents();
        events.forEach(event => {
            const matchesDepartment = department === 'all' || event.extendedProps.department === department;
            const matchesShift = shift === 'all' || event.extendedProps.shiftType === shift;
            event.setProp('display', matchesDepartment && matchesShift ? 'auto' : 'none');
        });
    }

    function formatDate(date) {
        const d = new Date(date);
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    }

    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Import schedule button
    document.getElementById('importScheduleBtn').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xlsx';
        input.onchange = function(e) {
            const file = e.target.files[0];
            // Here you would implement the file import logic
            alert('File import functionality would be implemented here');
        };
        input.click();
    });
}); 
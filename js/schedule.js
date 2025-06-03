$(document).ready(function() {
    // Load schedules when page loads
    loadSchedules();

    // Handle Add Schedule Form Submit
    $('#addScheduleForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            title: $('#title').val(),
            date: $('#date').val(),
            time: $('#time').val(),
            location: $('#location').val()
        };

        $.ajax({
            url: '/api/schedules',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                $('#addScheduleModal').modal('hide');
                $('#addScheduleForm')[0].reset();
                loadSchedules();
                showAlert('Schedule added successfully!', 'success');
            },
            error: function(xhr, status, error) {
                showAlert('Error adding schedule: ' + error, 'danger');
            }
        });
    });

    // Handle Edit Schedule Form Submit
    $('#editScheduleForm').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            title: $('#edit_title').val(),
            date: $('#edit_date').val(),
            time: $('#edit_time').val(),
            location: $('#edit_location').val()
        };

        const id = $('#edit_id').val();

        $.ajax({
            url: `/api/schedules/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                $('#editScheduleModal').modal('hide');
                loadSchedules();
                showAlert('Schedule updated successfully!', 'success');
            },
            error: function(xhr, status, error) {
                showAlert('Error updating schedule: ' + error, 'danger');
            }
        });
    });
});

// Load Schedules Function
function loadSchedules() {
    $.ajax({
        url: '/api/schedules',
        type: 'GET',
        success: function(schedules) {
            let tableBody = '';
            if (schedules.length === 0) {
                tableBody = `
                    <tr>
                        <td colspan="6" class="text-center">No schedules found</td>
                    </tr>
                `;
            } else {
                schedules.forEach(function(schedule) {
                    const formattedDate = new Date(schedule.date).toLocaleDateString();
                    const formattedTime = formatTime(schedule.time);
                    tableBody += `
                        <tr>
                            <td>${schedule.id}</td>
                            <td>${schedule.title}</td>
                            <td>${formattedDate}</td>
                            <td>${formattedTime}</td>
                            <td>${schedule.location}</td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-primary btn-action" onclick="editSchedule(${schedule.id})" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-action" onclick="deleteSchedule(${schedule.id})" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
            $('#scheduleTableBody').html(tableBody);
        },
        error: function(xhr, status, error) {
            showAlert('Error loading schedules: ' + error, 'danger');
        }
    });
}

// Edit Schedule Function
function editSchedule(id) {
    $.ajax({
        url: `/api/schedules/${id}`,
        type: 'GET',
        success: function(schedule) {
            $('#edit_id').val(schedule.id);
            $('#edit_title').val(schedule.title);
            $('#edit_date').val(schedule.date);
            $('#edit_time').val(schedule.time);
            $('#edit_location').val(schedule.location);
            $('#editScheduleModal').modal('show');
        },
        error: function(xhr, status, error) {
            showAlert('Error loading schedule details: ' + error, 'danger');
        }
    });
}

// Delete Schedule Function
function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
        $.ajax({
            url: `/api/schedules/${id}`,
            type: 'DELETE',
            success: function(response) {
                loadSchedules();
                showAlert('Schedule deleted successfully!', 'success');
            },
            error: function(xhr, status, error) {
                showAlert('Error deleting schedule: ' + error, 'danger');
            }
        });
    }
}

// Helper Functions
function formatTime(time) {
    if (!time) return '';
    try {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return time;
    }
}

function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    // Remove any existing alerts
    $('.alert').remove();
    
    // Add the new alert at the top of the container
    $('.container').prepend(alertHtml);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        $('.alert').fadeOut('slow', function() {
            $(this).remove();
        });
    }, 3000);
}

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
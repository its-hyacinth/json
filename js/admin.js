// Import mock data
import { users, leaves, schedule } from './data/mockData.js';

// Initialize calendar
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../html/index.html';
        return;
    }

    // Set admin name
    document.getElementById('adminName').textContent = currentUser.name;

    // Initialize dashboard
    initializeDashboard();
    
    // Initialize calendar
    const calendarEl = document.getElementById('departmentCalendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: getCalendarEvents,
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventContent: function(arg) {
            return {
                html: `<div class="fc-event-title">
                    <strong>${arg.event.title}</strong><br>
                    <small>${arg.event.extendedProps.notes || ''}</small>
                </div>`
            };
        }
    });
    calendar.render();

    // Navigation logic for dashboard views
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.dashboard-view');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));
            item.classList.add('active');
            const viewName = item.getAttribute('data-view');
            const view = document.getElementById(viewName + 'View');
            if (view) view.classList.add('active');
        });
    });

    // Placeholder for Create Overtime Event button
    const createOvertimeBtn = document.getElementById('createOvertimeBtn');
    if (createOvertimeBtn) {
        createOvertimeBtn.addEventListener('click', function() {
            alert('Create Overtime Event modal coming soon!');
        });
    }
});

// Initialize Dashboard
function initializeDashboard() {
    // Update stats
    updateDashboardStats();
    
    // Load recent leave requests
    loadRecentLeaveRequests();
    
    // Load upcoming events
    loadUpcomingEvents();
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.dashboard-view');
    
    navItems.forEach(item => {
        if (item.classList.contains('logout')) return;
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(`${viewName}View`).classList.add('active');
        });
    });
}

// Initialize Views
function initializeViews() {
    // Schedule View
    initializeFullSchedule();
    
    // Leave Requests View
    initializeLeaveRequests();
    
    // Events View
    initializeEvents();
    
    // Employees View
    initializeEmployees();
}

// Dashboard Stats
function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Count officers on duty today
    const officersOnDuty = schedule.filter(s => s.date === today).length;
    document.getElementById('officersOnDuty').textContent = officersOnDuty;
    
    // Count pending leaves
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    document.getElementById('pendingLeaves').textContent = pendingLeaves;
    
    // Count special events (mock data)
    document.getElementById('specialEvents').textContent = '2';
}

// Leave Requests Functions
function loadRecentLeaveRequests() {
    const container = document.getElementById('recentLeaveRequests');
    const recentLeaves = leaves
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    container.innerHTML = recentLeaves.map(leave => {
        const officer = users.find(u => u.id === leave.userId);
        return `
            <div class="list-item">
                <div class="leave-request-header">
                    <strong>${officer.name}</strong>
                    <span class="status ${leave.status}">${leave.status}</span>
                </div>
                <div class="leave-request-dates">
                    ${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}
                </div>
                <div class="leave-request-reason">${leave.reason}</div>
            </div>
        `;
    }).join('');
}

// Events Functions
function loadUpcomingEvents() {
    // Mock events data
    const events = [
        {
            title: 'Football Game',
            date: '2024-03-20',
            time: '15:00',
            officersNeeded: 4
        },
        {
            title: 'Campus Festival',
            date: '2024-03-25',
            time: '12:00',
            officersNeeded: 6
        }
    ];
    
    const container = document.getElementById('upcomingEvents');
    container.innerHTML = events.map(event => `
        <div class="list-item">
            <div class="event-header">
                <strong>${event.title}</strong>
                <span class="event-date">${formatDate(event.date)} ${event.time}</span>
            </div>
            <div class="event-details">
                Officers needed: ${event.officersNeeded}
            </div>
        </div>
    `).join('');
}

// Utility Functions
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getScheduleInfo(date) {
    const daySchedule = schedule.filter(s => s.date === date);
    const dayLeaves = leaves.filter(l => 
        date >= l.startDate && 
        date <= l.endDate && 
        l.status === 'approved'
    );
    
    let html = '';
    
    if (daySchedule.length > 0) {
        const shifts = daySchedule.map(s => s.shift);
        html += `<div class="shift-indicator">${shifts.join(', ')}</div>`;
    }
    
    if (dayLeaves.length > 0) {
        html += '<div class="leave-indicator">L</div>';
    }
    
    return { html, schedule: daySchedule, leaves: dayLeaves };
}

// Modal Functions
window.showAddShiftModal = function() {
    const modal = document.getElementById('addShiftModal');
    modal.classList.remove('hidden');
}

window.showAddEventModal = function() {
    const modal = document.getElementById('addEventModal');
    modal.classList.remove('hidden');
}

window.showAddEmployeeModal = function() {
    const modal = document.getElementById('addEmployeeModal');
    modal.classList.remove('hidden');
}

window.hideModal = function(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden');
}

// Form Handlers
document.getElementById('addShiftForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle shift addition
    hideModal('addShiftModal');
});

document.getElementById('addEventForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle event addition
    hideModal('addEventModal');
});

document.getElementById('addEmployeeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Handle employee addition
    hideModal('addEmployeeModal');
});

// Logout Function
window.logout = function() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Schedule Functions
function showScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    modal.style.display = 'flex';
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').min = today;
    
    // Load employees into select
    loadEmployeeOptions();
}

// Ensure default users exist
function ensureDefaultUsers() {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users || users.length === 0) {
        users = [
            { name: 'Carlson', email: 'carlson@cnu.edu', role: 'officer' },
            { name: 'Henderson', email: 'henderson@cnu.edu', role: 'officer' },
            { name: 'Martinez', email: 'martinez@cnu.edu', role: 'officer' },
            { name: 'Decker', email: 'decker@cnu.edu', role: 'sergeant' },
            { name: 'DeForest', email: 'deforest@cnu.edu', role: 'officer' },
            { name: 'Parker', email: 'parker@cnu.edu', role: 'officer' },
            { name: 'Jana Brown', email: 'janabrown@cnu.edu', role: 'corporal' },
            { name: 'Connelly', email: 'connelly@cnu.edu', role: 'officer' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Call on page load
ensureDefaultUsers();

function loadEmployeeOptions() {
    const select = document.getElementById('employee');
    select.innerHTML = '<option value="">Select Employee</option>';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach(user => {
        select.innerHTML += `<option value="${user.email}">${user.name} (${user.role})</option>`;
    });
}

function submitSchedule(event) {
    event.preventDefault();
    
    const scheduleData = {
        id: Date.now(),
        date: document.getElementById('scheduleDate').value,
        shift: document.getElementById('shift').value,
        employeeEmail: document.getElementById('employee').value,
        notes: document.getElementById('notes').value,
        createdAt: new Date().toISOString()
    };
    
    // Get employee details
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const employee = users.find(emp => emp.email === scheduleData.employeeEmail);
    scheduleData.employeeName = employee ? employee.name : '';
    scheduleData.employeeRole = employee ? employee.role : '';
    
    // Save schedule
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    
    // Check for conflicts
    const hasConflict = schedules.some(schedule => 
        schedule.date === scheduleData.date &&
        schedule.shift === scheduleData.shift
    );
    
    if (hasConflict) {
        alert('A schedule for this shift already exists on the selected date.');
        return;
    }
    
    // Check for employee availability
    const employeeHasShift = schedules.some(schedule =>
        schedule.date === scheduleData.date &&
        schedule.employeeEmail === scheduleData.employeeEmail
    );
    
    if (employeeHasShift) {
        alert('This employee is already scheduled for another shift on the selected date.');
        return;
    }
    
    // Check for approved leave
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const hasApprovedLeave = leaveRequests.some(leave =>
        leave.employeeEmail === scheduleData.employeeEmail &&
        leave.status === 'approved' &&
        new Date(leave.startDate) <= new Date(scheduleData.date) &&
        new Date(leave.endDate) >= new Date(scheduleData.date)
    );
    
    if (hasApprovedLeave) {
        alert('This employee has approved leave on the selected date.');
        return;
    }
    
    schedules.push(scheduleData);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    // Update calendar
    calendar.refetchEvents();
    
    // Close modal and reset form
    closeModal('scheduleModal');
    document.getElementById('scheduleForm').reset();
    
    // Show confirmation
    alert('Schedule added successfully.');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Get calendar events
function getCalendarEvents() {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const leaves = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    
    const events = [];
    
    // Add schedules
    schedules.forEach(schedule => {
        events.push({
            id: `schedule_${schedule.id}`,
            title: `${schedule.employeeName} - ${schedule.shift.charAt(0).toUpperCase() + schedule.shift.slice(1)} Shift`,
            start: `${schedule.date}T${getShiftTime(schedule.shift).start}`,
            end: `${schedule.date}T${getShiftTime(schedule.shift).end}`,
            backgroundColor: getShiftColor(schedule.shift),
            extendedProps: {
                type: 'schedule',
                notes: schedule.notes,
                employeeRole: schedule.employeeRole
            }
        });
    });
    
    // Add approved leaves
    leaves.filter(leave => leave.status === 'approved')
        .forEach(leave => {
            events.push({
                id: `leave_${leave.id}`,
                title: `${leave.employeeName} - Leave`,
                start: leave.startDate,
                end: leave.endDate,
                backgroundColor: '#dc3545',
                extendedProps: {
                    type: 'leave',
                    reason: leave.reason,
                    employeeRole: leave.employeeRole
                }
            });
        });
    
    return events;
}

// Show event details
function showEventDetails(event) {
    const type = event.extendedProps.type;
    const title = event.title;
    const time = type === 'schedule' ? 
        `${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}` :
        `${event.start.toLocaleDateString()} - ${event.end.toLocaleDateString()}`;
    
    const details = type === 'schedule' ?
        `Notes: ${event.extendedProps.notes || 'None'}` :
        `Reason: ${event.extendedProps.reason}`;
    
    alert(`${title}\n${time}\n${details}`);
}

// Utility functions
function getShiftTime(shift) {
    const times = {
        morning: { start: '06:00:00', end: '14:00:00' },
        evening: { start: '14:00:00', end: '22:00:00' },
        night: { start: '22:00:00', end: '06:00:00' }
    };
    return times[shift];
}

function getShiftColor(shift) {
    const colors = {
        morning: '#28a745',  // Green
        evening: '#007bff',  // Blue
        night: '#6f42c1'     // Purple
    };
    return colors[shift];
}

// Export functions
window.showScheduleModal = showScheduleModal;
window.submitSchedule = submitSchedule;
window.closeModal = closeModal;

// Handle schedule file upload
function uploadSchedule(type) {
    const modal = document.getElementById('scheduleUploadModal');
    const fileInput = document.getElementById('scheduleFile');
    
    // Set accepted file types
    switch(type) {
        case 'excel':
            fileInput.accept = '.xlsx,.xls';
            break;
        case 'pdf':
            fileInput.accept = '.pdf';
            break;
        case 'word':
            fileInput.accept = '.doc,.docx';
            break;
    }
    
    modal.style.display = 'flex';
}

// Handle schedule upload submission
async function handleScheduleUpload(event) {
    event.preventDefault();
    
    const file = document.getElementById('scheduleFile').files[0];
    const month = document.getElementById('scheduleMonth').value;
    const description = document.getElementById('scheduleDescription').value;
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const uploadProgress = document.querySelector('.upload-progress');
    
    if (!file) {
        alert('Please select a file to upload');
        return;
    }

    uploadProgress.style.display = 'block';
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', month);
    formData.append('description', description);

    try {
        // Upload file
        const response = await fetch('/api/upload-schedule', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        
        // Store schedule data in localStorage
        const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        schedules.push({
            id: Date.now(),
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            month: month,
            description: description,
            events: result.events // Parsed schedule events from the server
        });
        localStorage.setItem('schedules', JSON.stringify(schedules));

        // Update calendar
        initializeCalendar();
        
        // Close modal and show success message
        closeModal('scheduleUploadModal');
        alert('Schedule uploaded successfully');
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload schedule. Please try again.');
    } finally {
        uploadProgress.style.display = 'none';
        document.getElementById('scheduleUploadForm').reset();
    }
}

// Get calendar events including uploaded schedules
function getCalendarEvents(userEmail = null) {
    const events = [];
    
    // Get leave requests
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    events.push(...leaveRequests
        .filter(request => !userEmail || request.employeeEmail === userEmail)
        .map(request => ({
            id: request.id,
            title: `Leave - ${request.status.toUpperCase()}`,
            start: request.startDate,
            end: request.endDate,
            backgroundColor: getStatusColor(request.status),
            extendedProps: {
                type: 'leave',
                reason: request.reason,
                status: request.status,
                submittedAt: request.submittedAt,
                respondedAt: request.respondedAt
            }
        })));
    
    // Get uploaded schedules
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    schedules.forEach(schedule => {
        events.push(...(schedule.events || []).map(event => ({
            ...event,
            extendedProps: {
                ...event.extendedProps,
                type: 'schedule',
                uploadId: schedule.id
            }
        })));
    });
    
    return events;
}

// Show event details
function showEventDetails(event) {
    const props = event.extendedProps;
    let content = '';
    
    if (props.type === 'leave') {
        content = `
            <h3>Leave Request</h3>
            <p><strong>Status:</strong> ${props.status}</p>
            <p><strong>Reason:</strong> ${props.reason}</p>
            <p><strong>Submitted:</strong> ${new Date(props.submittedAt).toLocaleDateString()}</p>
        `;
    } else if (props.type === 'schedule') {
        content = `
            <h3>Schedule Event</h3>
            <p><strong>Time:</strong> ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}</p>
            <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
        `;
    }
    
    // Show in a modal or tooltip
    alert(content.replace(/<[^>]*>/g, '')); // Simple alert for now
}
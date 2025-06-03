// Check if user is logged in and is an employee
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role === 'admin') {
        window.location.href = '../html/index.html';
        return;
    }

    // Set employee name
    document.getElementById('employeeName').textContent = currentUser.name;

    // Initialize dashboard
    initializeDashboard();
    loadLeaveHistory();
    initializeCalendar();

    // Add view schedule button handler
    document.getElementById('viewScheduleBtn').addEventListener('click', function() {
        const calendarCard = document.querySelector('.calendar-card');
        // Scroll to calendar section
        calendarCard.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        calendarCard.classList.add('highlight');
        setTimeout(() => {
            calendarCard.classList.remove('highlight');
        }, 2000);
    });
});

// Dashboard initialization
function initializeDashboard() {
    updateStats();
    setupDateValidation();
}

// Update dashboard statistics
function updateStats() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const userRequests = leaveRequests.filter(req => req.employeeEmail === currentUser.email);

    const stats = {
        leaveBalance: currentUser.leaveBalance || 0,
        pendingRequests: userRequests.filter(req => req.status === 'pending').length,
        approvedLeaves: userRequests.filter(req => req.status === 'approved').length
    };

    document.getElementById('leaveBalance').textContent = stats.leaveBalance;
    document.getElementById('pendingRequests').textContent = stats.pendingRequests;
    document.getElementById('approvedLeaves').textContent = stats.approvedLeaves;
}

// Setup date validation for leave request form
function setupDateValidation() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;

    // Update end date minimum when start date changes
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value && endDateInput.value < this.value) {
            endDateInput.value = this.value;
        }
    });
}

// Show leave request modal
function showLeaveRequestModal() {
    document.getElementById('leaveRequestModal').style.display = 'flex';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Submit leave request
function submitLeaveRequest(event) {
    event.preventDefault();

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value;

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance
    if (days > currentUser.leaveBalance) {
        alert('Insufficient leave balance.');
        return;
    }

    // Create leave request
    const leaveRequest = {
        id: Date.now(),
        employeeEmail: currentUser.email,
        employeeName: currentUser.name,
        employeeRole: currentUser.role,
        startDate,
        endDate,
        reason,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };

    // Save request
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    leaveRequests.push(leaveRequest);
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));

    // Update UI
    updateStats();
    loadLeaveHistory();
    initializeCalendar();

    // Close modal and reset form
    closeModal('leaveRequestModal');
    document.getElementById('leaveRequestForm').reset();

    // Show confirmation
    alert('Leave request submitted successfully.');
}

// Load leave history
function loadLeaveHistory() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const userRequests = leaveRequests.filter(req => req.employeeEmail === currentUser.email);
    const historyContainer = document.getElementById('leaveHistory');

    historyContainer.innerHTML = '';

    if (userRequests.length === 0) {
        historyContainer.innerHTML = '<p class="no-requests">No leave requests found</p>';
        return;
    }

    userRequests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .forEach(request => {
            const requestElement = createHistoryElement(request);
            historyContainer.appendChild(requestElement);
        });
}

// Create leave history element
function createHistoryElement(request) {
    const div = document.createElement('div');
    div.className = 'request-item';
    div.innerHTML = `
        <div class="request-info">
            <h3>${formatDateRange(request.startDate, request.endDate)}</h3>
            <p class="reason">${request.reason}</p>
            <span class="status-${request.status}">${request.status.toUpperCase()}</span>
        </div>
        <div class="request-meta">
            <small>Submitted: ${new Date(request.submittedAt).toLocaleDateString()}</small>
            ${request.respondedAt ? 
                `<small>Responded: ${new Date(request.respondedAt).toLocaleDateString()}</small>` 
                : ''}
        </div>
    `;
    return div;
}

// Format date range
function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

// Initialize calendar
function initializeCalendar() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const calendarEl = document.getElementById('employeeCalendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: getCalendarEvents(currentUser.email),
        eventClick: function(info) {
            showEventDetails(info.event);
        }
    });
    calendar.render();
}

// Get calendar events
function getCalendarEvents(userEmail) {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    return leaveRequests
        .filter(request => request.employeeEmail === userEmail)
        .map(request => ({
            id: request.id,
            title: `Leave - ${request.status.toUpperCase()}`,
            start: request.startDate,
            end: request.endDate,
            backgroundColor: getStatusColor(request.status),
            extendedProps: {
                reason: request.reason,
                status: request.status,
                submittedAt: request.submittedAt,
                respondedAt: request.respondedAt
            }
        }));
}

// Get color based on request status
function getStatusColor(status) {
    const colors = {
        pending: '#ffc107',
        approved: '#28a745',
        declined: '#dc3545'
    };
    return colors[status] || '#6c757d';
}
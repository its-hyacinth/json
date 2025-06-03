// Import mock data
import { users, leaves, schedule } from './data/mockData.js';

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginModal = document.getElementById('adminLoginModal');
    const officerLoginModal = document.getElementById('officerLoginModal');
    const registrationModal = document.getElementById('registrationModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const employeeLoginForm = document.getElementById('employeeLoginForm');
    const registerForm = document.getElementById('registerForm');
    const calendarContainer = document.getElementById('calendar');
    const dutyInfo = document.getElementById('dutyInfo');

    // Initialize calendar
    initializeCalendar();

    // Calendar functions
    function initializeCalendar() {
        const today = new Date();
        renderCalendar(today);
    }

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];

        // Create calendar header
        const calendarHTML = `
            <div class="calendar-header">
                <button class="btn-secondary" onclick="previousMonth()">←</button>
                <h2>${monthNames[month]} ${year}</h2>
                <button class="btn-secondary" onclick="nextMonth()">→</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-day">Sun</div>
                <div class="calendar-day">Mon</div>
                <div class="calendar-day">Tue</div>
                <div class="calendar-day">Wed</div>
                <div class="calendar-day">Thu</div>
                <div class="calendar-day">Fri</div>
                <div class="calendar-day">Sat</div>
                ${generateCalendarDays(startingDay, daysInMonth, year, month)}
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;
        attachCalendarListeners();
    }

    function generateCalendarDays(startingDay, daysInMonth, year, month) {
        let days = '';
        let dayCount = 1;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days += '<div class="calendar-day empty"></div>';
        }

        // Add cells for each day of the month
        while (dayCount <= daysInMonth) {
            const currentDate = new Date(year, month, dayCount);
            const dateString = currentDate.toISOString().split('T')[0];
            const scheduleInfo = getScheduleInfo(dateString);
            
            days += `
                <div class="calendar-day" data-date="${dateString}">
                    ${dayCount}
                    ${scheduleInfo.html}
                </div>
            `;
            dayCount++;
        }

        return days;
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

    function attachCalendarListeners() {
        const days = document.querySelectorAll('.calendar-day:not(.empty)');
        days.forEach(day => {
            day.addEventListener('click', () => {
                const date = day.dataset.date;
                if (date) {
                    showDutyInfo(date);
                    // Remove selected class from all days
                    days.forEach(d => d.classList.remove('selected'));
                    // Add selected class to clicked day
                    day.classList.add('selected');
                }
            });
        });
    }

    // Make calendar navigation functions globally accessible
    window.previousMonth = function() {
        const currentDate = getCurrentDisplayedDate();
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    }

    window.nextMonth = function() {
        const currentDate = getCurrentDisplayedDate();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    }

    function getCurrentDisplayedDate() {
        const headerText = document.querySelector('.calendar-header h2').textContent;
        const [month, year] = headerText.split(' ');
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']
                          .indexOf(month);
        return new Date(parseInt(year), monthIndex);
    }

    // Make the modal functions globally accessible
    window.showLoginModal = function(type) {
        if (type === 'admin') {
            adminLoginModal.classList.add('show');
            adminLoginModal.classList.remove('hidden');
        } else {
            officerLoginModal.classList.add('show');
            officerLoginModal.classList.remove('hidden');
        }
    }

    window.hideLoginModal = function(type) {
        if (type === 'admin') {
            adminLoginModal.classList.remove('show');
            adminLoginModal.classList.add('hidden');
        } else {
            officerLoginModal.classList.remove('show');
            officerLoginModal.classList.add('hidden');
        }
    }

    window.showRegistrationModal = function() {
        officerLoginModal.classList.remove('show');
        officerLoginModal.classList.add('hidden');
        registrationModal.classList.add('show');
        registrationModal.classList.remove('hidden');
    }

    window.hideRegistrationModal = function() {
        registrationModal.classList.remove('show');
        registrationModal.classList.add('hidden');
    }

    // Handle registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('fullName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        // Check if user already exists
        if (users.find(user => user.email === email)) {
            alert('User already exists!');
            return;
        }

        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            role: 'employee'
        };

        users.push(newUser);
        alert('Registration successful! Please login.');
        registerForm.reset();
        hideRegistrationModal();
        showLoginModal('officer');
    });

    // Handle admin login
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        const user = users.find(u => u.email === email && u.password === password && u.role === 'admin');

        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'admin.html';
        } else {
            alert('Invalid admin credentials!');
        }
    });

    // Handle employee login
    employeeLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('employeeEmail').value;
        const password = document.getElementById('employeePassword').value;

        const user = users.find(u => u.email === email && u.password === password && u.role === 'employee');

        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'employee.html';
        } else {
            alert('Invalid employee credentials!');
        }
    });
});

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

// Utility functions for leave management
function createLeaveRequest(userId, startDate, endDate, reason) {
    const leave = {
        id: leaves.length + 1,
        userId,
        startDate,
        endDate,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    leaves.push(leave);
    return leave;
}

function updateLeaveStatus(leaveId, status) {
    const leave = leaves.find(l => l.id === leaveId);
    if (leave) {
        leave.status = status;
        if (status === 'approved') {
            updateSchedule(leave);
        }
        return true;
    }
    return false;
}

function updateSchedule(leave) {
    const user = users.find(u => u.id === leave.userId);
    if (user) {
        schedule.push({
            userId: user.id,
            userName: user.name,
            startDate: leave.startDate,
            endDate: leave.endDate,
            status: 'On Leave'
        });
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function showDutyInfo(date) {
    const dutyInfo = document.getElementById('dutyInfo');
    const onDutyList = document.getElementById('onDutyList');
    const onLeaveList = document.getElementById('onLeaveList');
    
    // Clear previous info
    onDutyList.innerHTML = '';
    onLeaveList.innerHTML = '';
    
    // Get schedule info for the selected date
    const scheduleInfo = getScheduleInfo(date);
    
    // Display on duty officers
    scheduleInfo.schedule.forEach(duty => {
        const officer = users.find(u => u.id === duty.userId);
        if (officer) {
            const dutyItem = document.createElement('div');
            dutyItem.className = 'duty-info-item';
            dutyItem.textContent = `${officer.name} - ${duty.shift} Shift`;
            onDutyList.appendChild(dutyItem);
        }
    });
    
    // Display on leave officers
    scheduleInfo.leaves.forEach(leave => {
        const officer = users.find(u => u.id === leave.userId);
        if (officer) {
            const leaveItem = document.createElement('div');
            leaveItem.className = 'duty-info-item';
            leaveItem.textContent = `${officer.name} - ${leave.reason}`;
            onLeaveList.appendChild(leaveItem);
        }
    });
    
    // Show the duty info section
    dutyInfo.style.display = 'block';
}
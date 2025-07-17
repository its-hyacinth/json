// Modal handling functions
function showLoginModal(type) {
    const modal = document.getElementById(`${type}LoginModal`);
    modal.style.display = 'flex';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function showRegisterModal() {
    hideModal('officerLoginModal');
    const modal = document.getElementById('registerModal');
    modal.style.display = 'flex';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// User roles and authentication
const ADMIN_EMAIL = 'jason.richards@cnu.edu';
const ADMIN_PASSWORD = 'admin123';

// Employee roles
const EmployeeRole = {
    SERGEANT: 'Sergeant',
    CORPORAL: 'Corporal',
    OFFICER: 'Officer'
};

// Store for active employees (in production this would be a database)
const employees = [
    {
        email: 'john.smith@cnu.edu',
        password: 'encrypted_password', // In production, this would be properly hashed
        name: 'John Smith',
        role: EmployeeRole.SERGEANT,
        leaveBalance: 15
    },
    // Add more employees as needed
];

function validateCNUEmail(email) {
    return email.toLowerCase().endsWith('@cnu.edu');
}

function handleAdminLogin(event) {
    event.preventDefault();
    console.log('Handling admin login...');
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    console.log('Login attempt for:', email);
    
    // Validate email domain
    if (!email.endsWith('@cnu.edu')) {
        alert('Please use your CNU email address.');
        return;
    }
    
    // Initialize users if needed
    const users = initializeDefaultUsers();
    console.log('Available users:', users);
    
    const user = users.find(u => u.email === email && u.password === password);
    console.log('Found user:', user);
    
    if (user && user.role === 'admin') {
        console.log('Login successful, redirecting to dashboard...');
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = '/admin/dashboard.html';
    } else {
        console.log('Login failed');
        alert('Invalid credentials or unauthorized access.');
    }
}

function handleEmployeeLogin(event) {
    event.preventDefault();
    console.log('Handling employee login...');
    
    const email = document.getElementById('employeeEmail').value;
    const password = document.getElementById('employeePassword').value;
    
    console.log('Login attempt for:', email);
    
    // Validate email domain
    if (!email.endsWith('@cnu.edu')) {
        alert('Please use your CNU email address.');
        return;
    }
    
    // Initialize users if needed
    const users = initializeDefaultUsers();
    console.log('Available users:', users);
    
    const user = users.find(u => u.email === email && u.password === password);
    console.log('Found user:', user);
    
    if (user && user.role !== 'admin') {
        console.log('Login successful, redirecting to dashboard...');
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = '/officer/dashboard.html';
    } else {
        console.log('Login failed');
        alert('Invalid credentials or unauthorized access.');
    }
}

// Leave request handling
function submitLeaveRequest(startDate, endDate, reason) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in first.');
        return;
    }

    // Check for minimum officer requirement
    const activeOfficers = getActiveOfficers(startDate, endDate);
    if (activeOfficers < 3) {
        alert('Warning: Approving this leave would result in less than 3 officers on duty.');
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

    // Store leave request (in production this would be a database)
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    leaveRequests.push(leaveRequest);
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));

    // Send notification to admin
    notifyAdmin(leaveRequest);
}

function notifyAdmin(leaveRequest) {
    // In production, this would send an actual email
    console.log(`New leave request from ${leaveRequest.employeeName} (${leaveRequest.employeeRole})`);
}

function handleLeaveResponse(leaveRequestId, isApproved) {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    const requestIndex = leaveRequests.findIndex(req => req.id === leaveRequestId);
    
    if (requestIndex === -1) return;
    
    const request = leaveRequests[requestIndex];
    request.status = isApproved ? 'approved' : 'declined';
    request.respondedAt = new Date().toISOString();
    
    localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
    
    // Notify employee
    notifyEmployee(request);
    
    // Check minimum officer requirement if approved
    if (isApproved) {
        const activeOfficers = getActiveOfficers(request.startDate, request.endDate);
        if (activeOfficers < 3) {
            alert('Warning: This approval results in less than 3 officers on duty.');
        }
    }
}

function notifyEmployee(leaveRequest) {
    // In production, this would send an actual email
    const status = leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1);
    console.log(`Leave request ${status} for ${leaveRequest.employeeName}`);
}

function getActiveOfficers(startDate, endDate) {
    // In production, this would query the database for active officers
    // Excluding those on approved leave during the specified period
    return 5; // Placeholder return value
}

// Calendar functionality
function initializeCalendar(containerId, events) {
    // Calendar initialization code would go here
    // This would show schedules and approved leaves
}

// Export functions for use in HTML
window.handleAdminLogin = handleAdminLogin;
window.handleEmployeeLogin = handleEmployeeLogin;
window.submitLeaveRequest = submitLeaveRequest;
window.handleLeaveResponse = handleLeaveResponse;
window.initializeCalendar = initializeCalendar;

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    // Officer login form
    const officerLoginForm = document.getElementById('officerLoginForm');
    if (officerLoginForm) {
        officerLoginForm.addEventListener('submit', handleEmployeeLogin);
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
});

// Initialize default users if none exist
function initializeDefaultUsers() {
    console.log('Initializing default users...');
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
        console.log('No users found, creating default users...');
        const defaultUsers = [
            {
                email: 'jason.richards@cnu.edu',
                password: 'admin123',
                name: 'Jason Richards',
                role: 'admin',
                leaveBalance: 30
            },
            {
                email: 'sarah.wilson@cnu.edu',
                password: 'officer123',
                name: 'Sarah Wilson',
                role: 'officer',
                leaveBalance: 25
            },
            {
                email: 'michael.thompson@cnu.edu',
                password: 'sergeant123',
                name: 'Michael Thompson',
                role: 'sergeant',
                leaveBalance: 28
            },
            {
                email: 'emily.parker@cnu.edu',
                password: 'corporal123',
                name: 'Emily Parker',
                role: 'corporal',
                leaveBalance: 26
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        users = defaultUsers;
        console.log('Default users created:', users);
    } else {
        console.log('Existing users found:', users);
    }
    return users;
}

// Call initialization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing users...');
    initializeDefaultUsers();
});

// Handle logout
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '/index.html';
} 
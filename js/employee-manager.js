document.addEventListener('DOMContentLoaded', function() {
    // Initial employee data
    let employees = [
        { id: 'EMP001', firstName: 'John', lastName: 'Doe', department: 'HR', email: 'john.doe@example.com', joinDate: '2021-02-01' },
        { id: 'EMP002', firstName: 'Jane', lastName: 'Smith', department: 'Finance', email: 'jane.smith@example.com', joinDate: '2020-03-15' },
        { id: 'EMP003', firstName: 'Mark', lastName: 'Taylor', department: 'IT', email: 'mark.taylor@example.com', joinDate: '2019-06-23' },
        { id: 'EMP004', firstName: 'Emily', lastName: 'Davis', department: 'Marketing', email: 'emily.davis@example.com', joinDate: '2022-10-10' },
        { id: 'EMP005', firstName: 'Michael', lastName: 'Brown', department: 'Sales', email: 'michael.brown@example.com', joinDate: '2021-08-15' },
        { id: 'EMP006', firstName: 'Sarah', lastName: 'Wilson', department: 'HR', email: 'sarah.wilson@example.com', joinDate: '2021-12-06' },
        { id: 'EMP007', firstName: 'David', lastName: 'Moore', department: 'Sales', email: 'david.moore@example.com', joinDate: '2019-11-29' },
        { id: 'EMP008', firstName: 'Laura', lastName: 'Clark', department: 'Finance', email: 'laura.clark@example.com', joinDate: '2020-08-08' },
        { id: 'EMP009', firstName: 'Robert', lastName: 'Lewis', department: 'Marketing', email: 'robert.lewis@example.com', joinDate: '2017-04-03' },
        { id: 'EMP010', firstName: 'Olivia', lastName: 'Hall', department: 'Sales', email: 'olivia.hall@example.com', joinDate: '2022-07-14' },
        { id: 'EMP011', firstName: 'James', lastName: 'Young', department: 'HR', email: 'james.young@example.com', joinDate: '2018-12-26' },
        { id: 'EMP012', firstName: 'Linda', lastName: 'King', department: 'Finance', email: 'linda.king@example.com', joinDate: '2020-09-14' },
        { id: 'EMP013', firstName: 'Brian', lastName: 'Scott', department: 'IT', email: 'brian.scott@example.com', joinDate: '2020-03-21' },
        { id: 'EMP014', firstName: 'Megan', lastName: 'Green', department: 'Marketing', email: 'megan.green@example.com', joinDate: '2021-05-18' },
        { id: 'EMP015', firstName: 'Olivia', lastName: 'Benett', department: 'Sales', email: 'olivia.benett@example.com', joinDate: '2023-05-17' }
    ];

    // DOM Elements
    const employeeTable = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
    const form = {
        employeeId: document.getElementById('employeeId'),
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        department: document.getElementById('department'),
        email: document.getElementById('email'),
        joinDate: document.getElementById('joinDate')
    };

    // Buttons
    const addButton = document.getElementById('addRecord');
    const updateButton = document.getElementById('updateRecord');
    const deleteButton = document.getElementById('deleteRecord');
    const clearButton = document.getElementById('clearForm');
    const themeToggle = document.getElementById('toggleTheme');

    let selectedEmployee = null;

    // Initialize table
    function displayEmployees() {
        employeeTable.innerHTML = '';
        employees.forEach(employee => {
            const row = employeeTable.insertRow();
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.firstName}</td>
                <td>${employee.lastName}</td>
                <td>${employee.department}</td>
                <td>${employee.email}</td>
                <td>${employee.joinDate}</td>
            `;
            row.addEventListener('click', () => selectEmployee(employee));
        });
    }

    // Select employee
    function selectEmployee(employee) {
        selectedEmployee = employee;
        form.employeeId.value = employee.id;
        form.firstName.value = employee.firstName;
        form.lastName.value = employee.lastName;
        form.department.value = employee.department;
        form.email.value = employee.email;
        form.joinDate.value = employee.joinDate;

        // Update selected row highlighting
        const rows = employeeTable.getElementsByTagName('tr');
        for (let row of rows) {
            row.classList.remove('selected');
            if (row.cells[0].textContent === employee.id) {
                row.classList.add('selected');
            }
        }
    }

    // Clear form
    function clearForm() {
        form.employeeId.value = '';
        form.firstName.value = '';
        form.lastName.value = '';
        form.department.value = '';
        form.email.value = '';
        form.joinDate.value = '';
        selectedEmployee = null;

        // Remove selected row highlighting
        const rows = employeeTable.getElementsByTagName('tr');
        for (let row of rows) {
            row.classList.remove('selected');
        }
    }

    // Add new employee
    function addEmployee() {
        const newEmployee = {
            id: form.employeeId.value,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            department: form.department.value,
            email: form.email.value,
            joinDate: form.joinDate.value
        };

        // Validation
        if (!validateEmployee(newEmployee)) {
            return;
        }

        if (employees.some(emp => emp.id === newEmployee.id)) {
            alert('Employee ID already exists');
            return;
        }

        employees.push(newEmployee);
        displayEmployees();
        clearForm();
    }

    // Update employee
    function updateEmployee() {
        if (!selectedEmployee) {
            alert('Please select an employee to update');
            return;
        }

        const updatedEmployee = {
            id: form.employeeId.value,
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            department: form.department.value,
            email: form.email.value,
            joinDate: form.joinDate.value
        };

        // Validation
        if (!validateEmployee(updatedEmployee)) {
            return;
        }

        const index = employees.findIndex(emp => emp.id === selectedEmployee.id);
        if (index !== -1) {
            employees[index] = updatedEmployee;
            displayEmployees();
            clearForm();
        }
    }

    // Delete employee
    function deleteEmployee() {
        if (!selectedEmployee) {
            alert('Please select an employee to delete');
            return;
        }

        if (confirm('Are you sure you want to delete this employee?')) {
            employees = employees.filter(emp => emp.id !== selectedEmployee.id);
            displayEmployees();
            clearForm();
        }
    }

    // Validate employee data
    function validateEmployee(employee) {
        if (!employee.id || !employee.firstName || !employee.lastName || 
            !employee.department || !employee.email || !employee.joinDate) {
            alert('Please fill in all fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(employee.email)) {
            alert('Please enter a valid email address');
            return false;
        }

        return true;
    }

    // Theme toggle
    function toggleTheme() {
        const employeeManager = document.querySelector('.employee-manager');
        employeeManager.classList.toggle('light-mode');
        const isDark = !employeeManager.classList.contains('light-mode');
        themeToggle.innerHTML = isDark ? 
            '<i class="fas fa-moon"></i> Light Mode' : 
            '<i class="fas fa-sun"></i> Dark Mode';
    }

    // Event listeners
    addButton.addEventListener('click', addEmployee);
    updateButton.addEventListener('click', updateEmployee);
    deleteButton.addEventListener('click', deleteEmployee);
    clearButton.addEventListener('click', clearForm);
    themeToggle.addEventListener('click', toggleTheme);

    // Initialize table
    displayEmployees();
}); 
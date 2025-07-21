// Employee Manager Logic

const mockEmployees = [
  {
    employeeId: 'E001',
    firstName: 'Jay',
    lastName: 'Richards',
    department: 'Patrol',
    email: 'jay.richards@cnu.edu',
    joinDate: '2022-01-15'
  },
  {
    employeeId: 'E002',
    firstName: 'Mike',
    lastName: 'Smith',
    department: 'Investigation',
    email: 'mike.smith@cnu.edu',
    joinDate: '2021-09-10'
  },
  {
    employeeId: 'E003',
    firstName: 'Jones',
    lastName: 'Stepher',
    department: 'Traffic',
    email: 'jones.stepher@cnu.edu',
    joinDate: '2020-05-20'
  },
  {
    employeeId: 'E004',
    firstName: 'Lesley',
    lastName: 'Dane',
    department: 'Admin',
    email: 'lesley.dane@cnu.edu',
    joinDate: '2019-11-03'
  }
];

let employees = [...mockEmployees];
let selectedRow = null;

function renderTable() {
  const tbody = document.querySelector('#employeeTable tbody');
  tbody.innerHTML = '';
  employees.forEach((emp, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${emp.employeeId}</td>
      <td>${emp.firstName}</td>
      <td>${emp.lastName}</td>
      <td>${emp.department}</td>
      <td>${emp.email}</td>
      <td>${emp.joinDate}</td>
    `;
    tr.onclick = () => selectRow(idx);
    if (selectedRow === idx) tr.style.background = 'rgba(79,172,254,0.12)';
    tbody.appendChild(tr);
  });
}

function clearForm() {
  document.getElementById('employeeId').value = '';
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('department').value = '';
  document.getElementById('email').value = '';
  document.getElementById('joinDate').value = '';
  selectedRow = null;
  renderTable();
}

function selectRow(idx) {
  selectedRow = idx;
  const emp = employees[idx];
  document.getElementById('employeeId').value = emp.employeeId;
  document.getElementById('firstName').value = emp.firstName;
  document.getElementById('lastName').value = emp.lastName;
  document.getElementById('department').value = emp.department;
  document.getElementById('email').value = emp.email;
  document.getElementById('joinDate').value = emp.joinDate;
  renderTable();
}

function addRecord() {
  const emp = getFormData();
  if (!emp) return;
  employees.push(emp);
  clearForm();
}

function updateRecord() {
  if (selectedRow === null) return;
  const emp = getFormData();
  if (!emp) return;
  employees[selectedRow] = emp;
  clearForm();
}

function deleteRecord() {
  if (selectedRow === null) return;
  employees.splice(selectedRow, 1);
  clearForm();
}

function getFormData() {
  const employeeId = document.getElementById('employeeId').value.trim();
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const department = document.getElementById('department').value.trim();
  const email = document.getElementById('email').value.trim();
  const joinDate = document.getElementById('joinDate').value;
  if (!employeeId || !firstName || !lastName || !department || !email || !joinDate) {
    alert('Please fill in all fields.');
    return null;
  }
  return { employeeId, firstName, lastName, department, email, joinDate };
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  document.getElementById('addRecord').onclick = addRecord;
  document.getElementById('updateRecord').onclick = updateRecord;
  document.getElementById('deleteRecord').onclick = deleteRecord;
  document.getElementById('clearForm').onclick = clearForm;
}); 
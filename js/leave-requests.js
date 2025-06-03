document.addEventListener('DOMContentLoaded', function() {
    // Sample leave requests data
    let leaveRequests = [
        {
            id: 'LR001',
            employeeId: 1,
            employeeName: 'John Doe',
            type: 'Vacation',
            startDate: '2024-03-15',
            endDate: '2024-03-20',
            duration: '5 days',
            status: 'pending',
            reason: 'Family vacation'
        },
        {
            id: 'LR002',
            employeeId: 2,
            employeeName: 'Jane Smith',
            type: 'Sick Leave',
            startDate: '2024-03-10',
            endDate: '2024-03-12',
            duration: '2 days',
            status: 'approved',
            reason: 'Medical appointment'
        }
    ];

    // DOM Elements
    const tableBody = document.getElementById('requestsTableBody');
    const statusFilter = document.getElementById('statusFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const modal = document.getElementById('leaveDetailsModal');
    const closeBtn = modal.querySelector('.close-btn');
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    const exportBtn = document.getElementById('exportBtn');

    // Current selected request
    let selectedRequest = null;

    // Initialize table
    function displayLeaveRequests() {
        const filteredRequests = filterRequests();
        tableBody.innerHTML = '';

        filteredRequests.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${request.id}</td>
                <td>${request.employeeName}</td>
                <td>${request.type}</td>
                <td>${formatDate(request.startDate)}</td>
                <td>${formatDate(request.endDate)}</td>
                <td>${request.duration}</td>
                <td><span class="status-badge status-${request.status}">${capitalizeFirst(request.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewRequest('${request.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Filter requests based on status and date range
    function filterRequests() {
        return leaveRequests.filter(request => {
            const matchesStatus = statusFilter.value === 'all' || request.status === statusFilter.value;
            const matchesDateRange = isWithinDateRange(request.startDate, request.endDate);
            return matchesStatus && matchesDateRange;
        });
    }

    // Check if request dates are within selected range
    function isWithinDateRange(start, end) {
        if (!dateFrom.value && !dateTo.value) return true;
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        const rangeStart = dateFrom.value ? new Date(dateFrom.value) : new Date(0);
        const rangeEnd = dateTo.value ? new Date(dateTo.value) : new Date('9999-12-31');

        return startDate >= rangeStart && endDate <= rangeEnd;
    }

    // View request details
    window.viewRequest = function(requestId) {
        selectedRequest = leaveRequests.find(req => req.id === requestId);
        if (!selectedRequest) return;

        document.getElementById('modalEmployee').textContent = selectedRequest.employeeName;
        document.getElementById('modalLeaveType').textContent = selectedRequest.type;
        document.getElementById('modalDateRange').textContent = 
            `${formatDate(selectedRequest.startDate)} to ${formatDate(selectedRequest.endDate)}`;
        document.getElementById('modalDuration').textContent = selectedRequest.duration;
        document.getElementById('modalReason').textContent = selectedRequest.reason;
        document.getElementById('modalStatus').textContent = capitalizeFirst(selectedRequest.status);

        // Show/hide approve/reject buttons based on status
        const showActionButtons = selectedRequest.status === 'pending';
        approveBtn.style.display = showActionButtons ? 'block' : 'none';
        rejectBtn.style.display = showActionButtons ? 'block' : 'none';

        modal.style.display = 'flex';
    };

    // Handle request approval
    function handleApprove() {
        if (!selectedRequest) return;
        selectedRequest.status = 'approved';
        updateRequestStatus();
    }

    // Handle request rejection
    function handleReject() {
        if (!selectedRequest) return;
        selectedRequest.status = 'rejected';
        updateRequestStatus();
    }

    // Update request status and refresh display
    function updateRequestStatus() {
        const index = leaveRequests.findIndex(req => req.id === selectedRequest.id);
        if (index !== -1) {
            leaveRequests[index] = selectedRequest;
            displayLeaveRequests();
            modal.style.display = 'none';
        }
    }

    // Export leave requests
    function exportRequests() {
        const filteredRequests = filterRequests();
        const csv = convertToCSV(filteredRequests);
        downloadCSV(csv, 'leave_requests.csv');
    }

    // Convert data to CSV format
    function convertToCSV(data) {
        const headers = ['Request ID', 'Employee', 'Type', 'Start Date', 'End Date', 'Duration', 'Status', 'Reason'];
        const rows = data.map(req => [
            req.id,
            req.employeeName,
            req.type,
            req.startDate,
            req.endDate,
            req.duration,
            req.status,
            req.reason
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Download CSV file
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Utility functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Event listeners
    statusFilter.addEventListener('change', displayLeaveRequests);
    dateFrom.addEventListener('change', displayLeaveRequests);
    dateTo.addEventListener('change', displayLeaveRequests);
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    approveBtn.addEventListener('click', handleApprove);
    rejectBtn.addEventListener('click', handleReject);
    exportBtn.addEventListener('click', exportRequests);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initial display
    displayLeaveRequests();
}); 
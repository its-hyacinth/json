document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const currentDateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = new Date().toLocaleDateString('en-US', options);

    // Add click handlers for action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleAction(action);
        });
    });

    // Add click handlers for approve/reject buttons
    const approveButtons = document.querySelectorAll('.btn-approve');
    const rejectButtons = document.querySelectorAll('.btn-reject');

    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const requestItem = this.closest('li');
            handleRequest(requestItem, 'approve');
        });
    });

    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const requestItem = this.closest('li');
            handleRequest(requestItem, 'reject');
        });
    });
});

function handleAction(action) {
    switch(action) {
        case 'Add Schedule':
            // Implement schedule addition logic
            console.log('Opening schedule creation form...');
            break;
        case 'Add Officer':
            // Implement officer addition logic
            console.log('Opening officer registration form...');
            break;
        default:
            console.log('Unknown action:', action);
    }
}

function handleRequest(requestItem, action) {
    const requestInfo = requestItem.querySelector('.request-info');
    const requestType = requestInfo.querySelector('h4').textContent;
    const officerName = requestInfo.querySelector('p').textContent;

    // Here you would typically make an API call to update the request status
    console.log(`${action}ing ${requestType} for ${officerName}`);

    // For demo purposes, we'll just remove the request item with animation
    requestItem.style.opacity = '0';
    setTimeout(() => {
        requestItem.style.height = '0';
        requestItem.style.padding = '0';
        requestItem.style.margin = '0';
        setTimeout(() => {
            requestItem.remove();
            updateRequestCount();
        }, 300);
    }, 300);
}

function updateRequestCount() {
    const remainingRequests = document.querySelectorAll('.request-list li').length;
    // Here you would typically update any counters or badges showing pending requests
    console.log('Remaining requests:', remainingRequests);
} 
// Mock Users Data
export const users = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@cnupd.edu',
        password: 'admin123',
        role: 'admin'
    },
    {
        id: 2,
        name: 'James Richards',
        email: 'cnupd.109@cnu.edu',
        password: 'officer123',
        role: 'employee'
    },
    {
        id: 3,
        name: 'Sarah Decker',
        email: 'decker@cnupd.edu',
        password: 'officer123',
        role: 'employee'
    },
    {
        id: 4,
        name: 'Michael Turner',
        email: 'turner@cnupd.edu',
        password: 'officer123',
        role: 'employee'
    }
];

// Mock Schedule Data
export const schedule = [
    {
        userId: 2,
        date: '2024-03-15',
        shift: '07',
        status: 'Scheduled'
    },
    {
        userId: 3,
        date: '2024-03-15',
        shift: '15',
        status: 'Scheduled'
    },
    {
        userId: 4,
        date: '2024-03-15',
        shift: '22',
        status: 'Scheduled'
    },
    // Add more schedule entries for different dates
    {
        userId: 2,
        date: '2024-03-16',
        shift: '07',
        status: 'Scheduled'
    },
    {
        userId: 3,
        date: '2024-03-16',
        shift: '15',
        status: 'Scheduled'
    }
];

// Mock Leave Data
export const leaves = [
    {
        id: 1,
        userId: 2,
        startDate: '2024-03-20',
        endDate: '2024-03-22',
        reason: 'Vacation',
        status: 'approved',
        createdAt: '2024-02-15T10:00:00Z'
    },
    {
        id: 2,
        userId: 3,
        startDate: '2024-03-18',
        endDate: '2024-03-19',
        reason: 'Sick Leave',
        status: 'approved',
        createdAt: '2024-03-17T08:00:00Z'
    }
];
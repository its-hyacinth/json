import { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Select, MenuItem, List, ListItem, ListItemText, InputLabel, FormControl } from '@mui/material';

const mockUsers = [
  { id: 1, name: 'Alice Smith', email: 'alice@cnu.edu', role: 'Admin' },
  { id: 2, name: 'Bob Jones', email: 'bob@cnu.edu', role: 'Supervisor' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@cnu.edu', role: 'Officer' },
];

const Accounts = () => {
  const [users, setUsers] = useState(mockUsers);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Officer' });
  const [currentUserRole] = useState('Admin'); // Simulate current user role

  const handleAddUser = () => {
    if (!newUser.email.endsWith('@cnu.edu')) return;
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ name: '', email: '', role: 'Officer' });
  };

  const handleRoleChange = (id, role) => {
    setUsers(users.map(u => u.id === id ? { ...u, role } : u));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Accounts</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Current User Role: {currentUserRole}</Typography>
        {currentUserRole === 'Admin' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Invite New User</Typography>
            <TextField
              label="Name"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              sx={{ mr: 2 }}
            />
            <TextField
              label="Email (@cnu.edu)"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              sx={{ mr: 2 }}
            />
            <FormControl sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Officer">Officer</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddUser} disabled={!newUser.email.endsWith('@cnu.edu')}>Invite</Button>
          </Box>
        )}
        <Typography variant="subtitle2">User List</Typography>
        <List>
          {users.map(user => (
            <ListItem key={user.id}>
              <ListItemText primary={`${user.name} (${user.email})`} secondary={`Role: ${user.role}`} />
              {currentUserRole === 'Admin' && (
                <FormControl sx={{ minWidth: 120, ml: 2 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={user.role}
                    label="Role"
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                    <MenuItem value="Officer">Officer</MenuItem>
                  </Select>
                </FormControl>
              )}
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Accounts; 
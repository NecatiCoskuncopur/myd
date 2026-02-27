'use client';

import { useState } from 'react';

import { Box, Paper, Tab, Tabs } from '@mui/material';

import ChangePasswordForm from './ChangePasswordForm';
import EditUserForm from './EditUserForm';
const ProfileSections = () => {
  const [value, setValue] = useState<number>(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue);
  };

  return (
    <Paper sx={{ width: '100%', p: 3 }}>
      <Tabs value={value} onChange={handleChange} textColor="primary" indicatorColor="primary">
        <Tab label="Düzenle" />
        <Tab label="Güvenlik" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {value === 0 && <EditUserForm />}
        {value === 1 && <ChangePasswordForm />}
      </Box>
    </Paper>
  );
};

export default ProfileSections;

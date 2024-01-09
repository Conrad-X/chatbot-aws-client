import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function appBarLabel(label) {
  return (
    <Toolbar>
        <Typography noWrap component="header" sx={{ flexGrow: 1 }}>
            {label}
        </Typography>
    </Toolbar>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#265073',
    },
  },
});

export default function Header() {
  return (
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={darkTheme}>
        <AppBar position="sticky" color="primary" enableColorOnDark>
          {appBarLabel('Voice Assistant')}
        </AppBar>
      </ThemeProvider>
    </Stack>
  );
}
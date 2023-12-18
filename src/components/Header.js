import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function appBarLabel(label) {
  return (
    <Toolbar>
        <Typography variant="h4" fontWeight="bolder" noWrap component="header" sx={{ flexGrow: 1 }}>
            {label}
        </Typography>
    </Toolbar>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});

export default function Header() {
  return (
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      <ThemeProvider theme={darkTheme}>
        <AppBar position="sticky" color="primary" enableColorOnDark>
          {appBarLabel('Conrad Labs Voice Assistant')}
        </AppBar>
      </ThemeProvider>
    </Stack>
  );
}
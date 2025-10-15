'use client';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from './theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={muiTheme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
'use client'

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import React from 'react'

const theme = createTheme({})
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}

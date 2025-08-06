import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7058be',
      light: '#8d7ccb',
      dark: '#5d4a9f',
    },
    secondary: {
      main: '#6b7280',
    },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
    divider: '#d1d5db',

    success: {
      main: '#269d69',
      contrastText: '#ffffff',
    },
    error: {
      main: '#e14775',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#e16032',
      contrastText: '#ffffff',
    },
    info: {
      main: '#1c8ca8',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'error'
            ? {
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }
            : {
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }),
        }),
        text: {
          '&.MuiButton-root': {
            color: '#000000',
            fontWeight: 700,
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        outlined: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'error'
            ? {
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                },
              }
            : {
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: 'rgba(112, 88, 190, 0.04)',
                },
              }),
        }),
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#a5b4fc',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#111827',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#e5e7eb',
          color: '#111827',
          fontWeight: 500,
        },
        deleteIcon: {
          color: '#6b7280',
          '&:hover': {
            color: '#374151',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a5b4fc',
            },
          },
          '& .MuiInputBase-input': {
            padding: '10px',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
        input: {
          color: '#111827',
          padding: '10px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f3f4f6',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#a5b4fc',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: '#a5b4fc',
          '&.Mui-checked': {
            color: '#a5b4fc',
          },
          '&.Mui-checked  .MuiSwitch-track': {
            backgroundColor: '#a5b4fc',
          },
        },
        track: {
          backgroundColor: '#d1d5db',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#a5b4fc',
        },
        thumb: {
          '&:hover, &.Mui-focusVisible, &.Mui-active': {
            boxShadow: '0px 0px 0px 8px rgba(165, 180, 252, 0.16)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        barColorPrimary: {
          backgroundColor: '#a5b4fc',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          stroke: '#a5b4fc',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#111827',
        },
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        subtitle1: { color: '#374151' },
        subtitle2: { color: '#6b7280' },
        body1: { color: '#374151' },
        body2: { color: '#6b7280' },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#000',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#269d69',
          color: '#ffffff',
        },
        standardError: {
          backgroundColor: '#e14775',
          color: '#ffffff',
        },
        standardInfo: {
          backgroundColor: '#1c8ca8',
          color: '#ffffff',
        },
        standardWarning: {
          backgroundColor: '#e16032',
          color: '#ffffff',
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          '& .MuiMenuItem-root': {
            fontSize: 14,
            fontWeight: 500,
            color: '#111827',
            transition: 'background-color .15s',
            '&:hover': { backgroundColor: '#f3f4f6' },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.danger': {
            color: '#ef4444',
            '&:hover': { backgroundColor: 'rgba(239,68,68,.08)' },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }),
        flexContainer: ({ theme }) => ({
          gap: theme.spacing(2),
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          minHeight: 0,
          minWidth: 0,
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.text.secondary,
          '&.Mui-selected': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ab9df2',
    },
    secondary: {
      main: '#9e9e9e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },

    success: {
      main: '#a9dc76',
      contrastText: '#000000',
    },
    error: {
      main: '#ff6188',
      contrastText: '#000000',
    },
    warning: {
      main: '#fc9867',
      contrastText: '#000000',
    },
    info: {
      main: '#78dce8',
      contrastText: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'error'
            ? {
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }
            : {
                backgroundColor: theme.palette.primary.main,
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#c0b1f5',
                },
              }),
        }),
        outlined: ({ ownerState, theme }) => ({
          ...(ownerState.color === 'error'
            ? {
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  backgroundColor: 'rgba(255, 97, 136, 0.08)',
                },
              }
            : {
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: '#c0b1f5',
                  backgroundColor: 'rgba(171, 157, 242, 0.08)',
                },
              }),
        }),
        text: {
          '&.MuiButton-root': {
            fontWeight: 700,
            color: '#ffffff',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#a5b4fc',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#262626',
            '& fieldset': {
              borderColor: '#9ca3af',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#e7e7e7',
              borderWidth: '2px',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a5b4fc',
              borderWidth: '2px',
            },
          },
          '& .MuiInputBase-input': {
            padding: '10px',
            color: '#ffffff',
          },
          '& .MuiInputBase-inputMultiline': {
            padding: '0px',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#262626',
        },
        input: {
          color: '#ffffff',
          padding: '10px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#262626',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#262626',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#262626',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#262626',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: '#a9dc76',
          color: '#000000',
        },
        standardError: {
          backgroundColor: '#ff6188',
          color: '#000000',
        },
        standardInfo: {
          backgroundColor: '#78dce8',
          color: '#000000',
        },
        standardWarning: {
          backgroundColor: '#fc9867',
          color: '#000000',
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#262626',
          border: '1px solid #374151',
          boxShadow: '0 2px 8px rgba(0,0,0,.5)',
          '& .MuiMenuItem-root': {
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            transition: 'background-color .15s',
            '&:hover': { backgroundColor: 'rgba(255,255,255,.08)' },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.danger': {
            color: '#ef4444',
            '&:hover': { backgroundColor: 'rgba(239,68,68,.16)' },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
        }),
        flexContainer: ({ theme }) => ({
          gap: theme.spacing(2),
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          minHeight: 0,
          minWidth: 0,
          fontWeight: theme.typography.fontWeightMedium,
          color: theme.palette.text.secondary,
          '&.Mui-selected': {
            color: theme.palette.primary.main,
          },
        }),
      },
    },
  },
});

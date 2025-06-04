import { createTheme } from '@mui/material/styles';
declare module '@mui/material/styles' {
  interface TypographyVariants {
    h1: {
      default: React.CSSProperties;
      regular: React.CSSProperties;
      semiBold: React.CSSProperties;
    };
    h2: {
      default: React.CSSProperties;
      regular: React.CSSProperties;
      semiBold: React.CSSProperties;
    };
    h3: {
      default: React.CSSProperties;
      regular: React.CSSProperties;
      semiBold: React.CSSProperties;
    };
    h4: {
      default: React.CSSProperties;
      regular: React.CSSProperties;
      semiBold: React.CSSProperties;
    };
    heading: {
      h1: React.CSSProperties;
      h2: React.CSSProperties;
      h3: React.CSSProperties;
      h4: React.CSSProperties;
      h5: React.CSSProperties;
    };
  }

  // Allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1?: {
      default?: React.CSSProperties;
      regular?: React.CSSProperties;
      semiBold?: React.CSSProperties;
    };
    h2?: {
      default?: React.CSSProperties;
      regular?: React.CSSProperties;
      semiBold?: React.CSSProperties;
    };
    h3?: {
      default?: React.CSSProperties;
      regular?: React.CSSProperties;
      semiBold?: React.CSSProperties;
    };
    h4?: {
      default?: React.CSSProperties;
      regular?: React.CSSProperties;
      semiBold?: React.CSSProperties;
    };
    heading?: {
      h1?: React.CSSProperties;
      h2?: React.CSSProperties;
      h3?: React.CSSProperties;
      h4?: React.CSSProperties;
      h5?: React.CSSProperties;
    };
  }
}
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    heading: true;
  }
}

export const theme = createTheme({
  palette: {
    action: {
      active: '#16306D',
      // hover: '#071A48',
      selected: '#1246BB',
    },
    success: {
      main: '#1B7B9F',
      dark: '#1C6382',
      contrastText: '#D4F3F9'
    },
    warning: {
      main: 'rgba(193, 139, 0, 1)',
      dark: '#5A4000',
      contrastText: 'rgba(255, 246, 223, 1)'
    },
    error: {
      main: '#C51809',
      dark: '#9C1510',
      contrastText: '#FFE4D4'
    },
    info:{
      main: '#16306D',
      dark:'#0E56E7',
      light:'#D8EDFF'

    },
    text: {
      primary: '#3D3D3D',
      secondary: '#252525',
      disabled: '#7C7C7C',
    },
  },
  typography: {
    fontFamily: '"Gibson", sans-serif',
    h1: {
      default: {
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: 500,
      },
      regular: {
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: 400,
      },
      semiBold: {
        fontSize: '16px',
        lineHeight: '20px',
        fontWeight: 600,
      }
    },
    h2: {
      default: {
        fontSize: '14px',
        lineHeight: '16px',
        fontWeight: 500,
      },
      regular: {
        fontSize: '14px',
        lineHeight: '16px',
        fontWeight: 400,
      },
      semiBold: {
        fontSize: '14px',
        lineHeight: '16px',
        fontWeight: 600,
      }
    },
    h3: {
      default: {
        fontSize: '12px',
        lineHeight: '14px',
        fontWeight: 500,
      },
      regular: {
        fontSize: '12px',
        lineHeight: '14px',
        fontWeight: 400,
      },
      semiBold: {
        fontSize: '12px',
        lineHeight: '14px',
        fontWeight: 600,
      }
    },
    h4: {
      default: {
        fontSize: '10px',
        lineHeight: '12px',
        fontWeight: 500,
      },
      regular: {
        fontSize: '10px',
        lineHeight: '12px',
        fontWeight: 400,
      },
      semiBold: {
        fontSize: '10px',
        lineHeight: '12px',
        fontWeight: 600,
      }
    },
    heading: {
      h1:{
        fontSize:'40px',
        lineHeight:'48px',
        fontWeight:600
      },
      h2:{
        fontSize:'32px',
        lineHeight:'40px',
        fontWeight:600
      },
      h3:{
        fontSize:'24px',
        lineHeight:'32px',
        fontWeight:600
      },
      h4:{
        fontSize:'20px',
        lineHeight:'24px',
        fontWeight:600
      },
      h5:{
        fontSize:'16px',
        lineHeight:'20px',
        fontWeight:600
      },
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: 'rgba(22, 48, 109, 1)',
          color: 'rgba(255, 255, 255, 1)',
          '&:hover': {
            backgroundColor: 'rgba(7, 26, 72, 1)',
          },
          '&:active': {
            backgroundColor: 'rgba(18, 70, 187, 1)',
          },
        },
        
        containedSecondary: {
          backgroundColor: 'rgba(255, 255, 255, 1)',
          color: 'rgba(61, 61, 61, 1)',
          '&:hover': {
            backgroundColor: 'rgba(239, 239, 239, 1)', 
          },
          '&:active': {
            backgroundColor: 'rgba(220, 220, 220, 1)', 
          },
        },
        containedError:{
          backgroundColor:'rgba(237, 39, 9, 1)',
          color:'rgba(255, 255, 255, 1)',
          '&:hover': {
            backgroundColor: 'rgba(197, 24, 9, 1)', 
          },
          '&:active': {
            backgroundColor: 'rgba(156, 21, 16, 1)', 
          },
        }
      },
    },
  },
});

export default theme;

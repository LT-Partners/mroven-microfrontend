import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./theme";


interface TypographyStyle {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
}


interface CustomTheme {
  typography: {
    h2: any;
    h3: {
      regular: { fontSize: any; lineHeight: any; fontWeight: any; };
      default: { fontSize: any; lineHeight: any; fontWeight: any; }; fontSize: any; lineHeight: any; fontWeight: any;
    };
  };
  palette: {
    text: {
      primary: string;
    };
  };
}


const customTheme = theme as unknown as CustomTheme;
export const Toastify = (type: string, msg: string, onClick?: () => void) => {
  let title = "";
  switch (type) {
    case "success":
      title = "Success";
      break;
    case "warning":
      title = "Warning";
      break;
    case "error":
      title = "Error";
      break;
    case "info":
      title = "Info";
      break;
    default:
      title = "Notification";
      break;
  }


  const { fontSize: h2FontSize, lineHeight: h2LineHeight, fontWeight: h2FontWeight } = customTheme.typography.h2.semiBold;
  const { fontSize: h3FontSize, lineHeight: h3LineHeight, fontWeight: h3FontWeight } = customTheme.typography.h2.regular;

  const toastContent = (
    <div>
      <p style={{
        fontSize: h2FontSize,
        lineHeight: h2LineHeight,
        fontWeight: h2FontWeight,
        marginBottom: '4px',
        letterSpacing: '-0.25px'
      }}>{title}</p>
      <p style={{
        color: theme.palette.text.primary,
        fontSize: h3FontSize,
        lineHeight: h3LineHeight,
        fontWeight: h3FontWeight,
        letterSpacing: '-0.25px'
      }} dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );

  switch (type) {
    case "success":
      toast.success(toastContent, {
        hideProgressBar: true,
        theme: "colored",
        onClick,
        style: { cursor: onClick ? 'pointer' : 'default' },
        className: "toast-success-container toast-style-ltp",
      });
      break;
    case "warning":
      toast.warn(toastContent, {
        hideProgressBar: true,
        theme: "colored",
        onClick,
        style: { cursor: onClick ? 'pointer' : 'default' },
        className: "toast-warning-container toast-style-ltp",
      });
      break;
    case "error":
      toast.error(toastContent, {
        hideProgressBar: true,
        theme: "colored",
        onClick,
        style: { cursor: onClick ? 'pointer' : 'default' },
        className: "toast-wrong-container toast-style-ltp",
      });
      break;
    case "info":
      toast.info(toastContent, {
        hideProgressBar: true,
        theme: "colored",
        onClick,
        style: { cursor: onClick ? 'pointer' : 'default' },
        className: "toast-info-container toast-style-ltp",
      });
      break;
    default:
      toast.info(toastContent, {
        hideProgressBar: true,
        theme: "colored",
        onClick,
        style: { cursor: onClick ? 'pointer' : 'default' },
        className: "toast-success-container toast-style-ltp",
      });
      break;
  }
};

export default ToastContainer;

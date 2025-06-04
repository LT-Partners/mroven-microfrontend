import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import "./conf.scss";
const ConfettiComponent = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#16306D",
      },
    },
    typography: {
      fontFamily: '"Montserrat", sans-serif',
    },
  });

  const conf = localStorage.getItem("conf") as string;
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  useEffect(() => {
    if (conf == "1") {
      localStorage.removeItem("conf");
      setShowConfetti(true);
      setShowDialog(true);
    }
  }, []);
  const handleClose = () => {
    // setShowDialog(false);
    setShowConfetti(false);
  };
  return (
    <>
      <Dialog
        PaperProps={{
          style: {
            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", // Optional: If you want to remove the box-shadow
          },
        }}
        BackdropProps={{
          style: {
            backgroundColor: "transparent", // Set the background color of the overlay to transparent
          },
        }}
        open={showConfetti}
      >
        {/* <DialogTitle
          style={{
            fontFamily: '"Montserrat", sans-serif',
            fontSize: "1.2rem",
            fontWeight: "700",
          }}
        >
          Welcome to Lift
        </DialogTitle> */}
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "10px",
              fontFamily: '"Montserrat", sans-serif',
              fontSize: "0.9rem",
              width: "380px",
            }}
          >
            <ThemeProvider theme={theme}>
              <h2
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Welcome to Lift!
              </h2>
            </ThemeProvider>
          </Box>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            style={{
              fontFamily: '"Montserrat", sans-serif',
              fontSize: "0.8rem",
              color: "#16306D",
              marginBottom: "18px",
            }}
            onClick={() => {
              handleClose();
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      {showConfetti && (
        <div style={{ position: "relative", zIndex: "1201", width: "100%" }}>
          <div className="background-blur-conf"></div>
          <Confetti
            numberOfPieces={500}
            colors={["#B51783", "#c4459c", "#FFC3EC", "#FFE6F7"]}
            wind={0.01}
            gravity={0.07}
            width={window.innerWidth}

            // confettiSource="M10 10 L50 50 L10 50 Z"
          />
        </div>
      )}
    </>
  );
};

export default ConfettiComponent;

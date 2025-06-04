import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import "./click-up.styles.scss";

const ClickUp = () => {

  // useEffect(() => {
  //   const script = document.createElement('script');

  //   script.type = 'text/javascript';
  //   script.innerHTML = `window.$sleek=[];window.SLEEK_PRODUCT_ID=299834364;(function(){d=document;s=d.createElement("script");s.src="https://client.sleekplan.com/sdk/e.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`;

  //   document.head.appendChild(script);

  //   return () => {
  //     document.head.removeChild(script);
  //   };
  // }, []);


  const [isIframeVisible, setIframeVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleIframe = () => {
    setIframeVisible(!isIframeVisible);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // return null;

  return(
    <>
      <div className='feedback-btn' style={{
        position: 'fixed',
        zIndex:"10000000",
        bottom:"15px",
        right:'15px'
      }}>
        <Button
          onClick={toggleIframe}
          style={{
            fontFamily: '"Gibson", sans-serif',
            background: '#033096',
            color: '#FFFFFF',
            border: 'none',
            padding: '5px 10px 5px 2px',
            borderRadius: '40px',
            fontSize:"13px",
            fontWeight:"600",
            letterSpacing:"0.8px",
            boxShadow:"0 1px 6px 0 rgba(0, 0, 0, 0.06), 0 2px 32px 0 rgba(0, 0, 0, 0.16)",
            maxHeight:"40px",
            display:"flex",
            justifyContent:"center",
            height:"40px",
          }}
        > 
            <img 
              className="logo" 
              alt="Logo" 
              src={'./assets/ne-logo.jpg'} 
            />
            <span style={{padding:"0 5px"}}>Feedback</span>
          </Button>
      </div>

      {isIframeVisible && (
        <div className='feedback-container'>
          {/* Close Button */}
          <IconButton
            onClick={toggleIframe}
            className='close-btn'
          >
            <CloseIcon/>
          </IconButton>

          {isLoading && (
            <div className='loader'>
              <CircularProgress />
            </div>
          )}

          {/* Iframe */}
          <iframe
            className="iframe"
            src="https://forms.clickup.com/9011066952/f/8chky28-83371/33YROAYPNAVCMOQQIZ"
            onLoad={handleIframeLoad}
          ></iframe>
        </div>
      )}
    </>
  ); 
};

export default ClickUp;

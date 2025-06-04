import React from "react";
import './preloader.scss';
import { PuffLoader } from 'react-spinners';


const MrOvenLoader = () => {
  
  
  

  return (
    <div
      className="preloader"
      style={{
        opacity: '.5',
      }}>
      <PuffLoader
        className="puff-loader-preloader"
        size={80}
        color="#16306D"
        speedMultiplier={0.8}
      />
    </div>
  );
};

export default MrOvenLoader
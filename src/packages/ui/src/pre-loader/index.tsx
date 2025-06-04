import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import './preloader.scss';
import { PuffLoader } from 'react-spinners';


const PreLoader = () => {
  const [showLoader, setShowLoader] = useState(true);
  const location = useLocation();
  const {brandName} = useParams()
  // TODO: remove later timer need to load all the time 
  // useEffect(() => {
  //   const time: number = location.pathname === '/' ? 3000 : 6000;
  //   // localStorage.setItem("brandSelected",brandName)
  //   setTimeout(() => {
  //     setShowLoader(false);
  //   }, time);
  // }, []);

  return (
    <div
      className="preloader"
      style={{
        display: showLoader ? 'flex' : 'none',
        opacity: location.pathname === '/' ? '1' : '.8',
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

export default PreLoader;

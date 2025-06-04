import React, { useState, useEffect } from 'react';

const DelayedComponent = ({ delay, children }:any) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return show ? children : null;
};

export default DelayedComponent;

import React from "react";
import { HashRouter, Route } from "react-router-dom";
import MrOven from "./features/mr-oven"
import "./styles/global.css";

interface AppProps {
  isActive: boolean;
}

const App: React.FC<AppProps> = ({ isActive }) => {
  console.log(isActive,'isActive');
  const useHash = !isActive
  

  if (useHash) {
    return (
      <HashRouter>
        <MrOven/>
      </HashRouter>
    );
  }
  return <MrOven/>;
  
};

export default App;

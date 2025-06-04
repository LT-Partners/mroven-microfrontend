import React from "react";
import { Tooltip } from "@mui/material";

import "./drawer-item-admin.styles.scss";

const DrawerItem = ({
  name,
  clickEventName,
  icon,
  clickEvent,
  selected,
  forLogout,
  className,
  drawerOpen,
}: {
  className: string;
  name: string;
  clickEventName: string;
  icon: React.ReactNode;
  clickEvent: () => void;
  selected: string;
  forLogout: boolean;
  drawerOpen: boolean;
}) => (
  <>
    {className === "main-item" ? (
      <div
        className={selected === clickEventName ? "selected-item" : "main-item"}
        onClick={clickEvent}
      >
        <div className="brick"></div>
     
          <div className="img">{icon}</div>

        {!forLogout && <div className="spacer">{name}</div>}
      </div>
    ) : (
      <div
        className={selected === clickEventName ? "selected" : "item"}
        onClick={clickEvent}
      >
        <div className="brick"></div>
        {!drawerOpen ? (
          <Tooltip title={name} placement="bottom">
            <div className="img" 
            style={{
              marginLeft : "30px",
              padding:0
            }}
            >{icon}</div>
          </Tooltip>
        ) : (
          <div className="img">{icon}</div>
        )}
        {!forLogout && drawerOpen && <div className="spacer">{name}</div>}
      </div>
    )}
  </>
);

export default DrawerItem;

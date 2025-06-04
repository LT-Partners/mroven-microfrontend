
import React, { useEffect, useState } from 'react';

import { Tooltip } from '@repo/ui/tooltip';

import './drawer-item.styles.scss';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
const DrawerItem = ({
  name,
  clickEventName,
  icon,
  clickEvent,
  selected,
  isTeamItem,
  subparts,
  subpartIcons,
  subPartsComponents,
  subPartName,
  selectedChildIndex,
  curComponent,
  childClickEvent,
  isBetaItem,
  className,
  curChannel,
  curModules,
  subClass,
  drawerOpen,
  isReportBuilder,
}: {
  name?: any;
  clickEventName?: any;
  icon?: any;
  clickEvent?: any;
  selected?: any;
  isTeamItem?: any;
  subparts?: any;
  subpartIcons?: any;
  subPartsComponents?: any;
  subPartName?: any;
  selectedChildIndex?: any;
  childClickEvent?: any;
  curComponent?: any;
  isBetaItem?: any;
  className?: any;
  curChannel?: any;
  curModules?: any;
  subClass?: any;
  drawerOpen?: any;
  isReportBuilder?:boolean;
}) => {
  // useEffect(() => {
  //   let elm = null;
  //   if (document.querySelector(`.item-get   .select`)) {
  //     elm = document.querySelector(`.item-get  .select`);
  //     elm?.scrollIntoView(true);
  //   } else {
  //     elm = document.querySelector(`.item-get .selected`);
  //     elm?.scrollIntoView(true);
  //   }
  // }, []);

  const beta = [
    'Publisher Revenue',
    'First Click Analysis',
    'Last Click Analysis',
    'First & Last Click',
    'New Traffic Analysis',
    'Publisher Opportunity',
  ];

  const moduleColor: any = {
    Affiliate: 'tangerine',
    'Paid Search': 'berry',
    Social: 'punch',
    Programmatic: 'aqua',
    SEO: 'tan',
    'Cross Channel': 'tangerine',
  };

  var isSafari =
    navigator.vendor &&
    navigator.vendor.indexOf('Apple') > -1 &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('CriOS') == -1 &&
    navigator.userAgent.indexOf('FxiOS') == -1;


  useEffect(() => {
    console.log(
      subClass,
      subparts,
      selected,
      clickEventName,
      isOpen && subparts != null && subparts.length > 0,
      'subparts-subClass'
    );
  }, [subClass, subparts]);

  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    console.log(isOpen, 'isOpen');
  }, [isOpen]);

  const currentUrl = window.location.href;

  const path = new URL(currentUrl).hash.substring(2);
  const parts = path.split("/")
  const extractedPath = "/" + parts.slice(0, -2).join("/");
  console.log(extractedPath,'extractedPath')
  const [selectedChind,setSelectedChild] = useState()
  return (
    <div className={`item-get ${className}`}>
      {className == 'module-item-disable' ? (
        // <Tooltip title={"Coming Soon"} placement="right">
        // <div
        //   className={`${
        //     selected === clickEventName &&
        //     className != 'module-item-disable' &&
        //     (!subparts || subparts.length === 0)
        //       ? `selected selected-${moduleColor[curChannel]}`
        //       : 'item'
        //   } menu-item-option ${className}`}
        //   // onClick={className == "module-item-disable" ? "" : clickEvent}
        // >
        //   <div style={{ display: 'flex', alignItems: 'center' }}>
        //     <div
        //       className="menu-option"
        //       style={{
        //         width: isTeamItem ? '60%' : '100%',
        //       }}>
        //       <div
        //         className="spacer"
        //         style={drawerOpen ? { whiteSpace: 'normal' } : {}}>
        //         {name}
        //       </div>
        //       {subparts != null && subparts.length > 0 ? (
        //         isOpen ? (
        //           <ExpandMoreIcon />
        //         ) : (
        //           <ChevronRightIcon />
        //         )
        //       ) : (
        //         <></>
        //       )}
        //     </div>
        //   </div>
        //   <div className="badge" style={{ opacity: 1 }}>
        //     <p style={{ opacity: 1, fontWeight: isSafari ? 500 : 600 }}>
        //       Coming Soon
        //     </p>
        //   </div>
        //   {isTeamItem ? <div className="team">Team</div> : ''}
        //   {isBetaItem ? <div className="team">Beta</div> : ''}
        // </div>
        <></>
      ) : (
        <div
          className={`${
            selected === clickEventName && (!subparts || subparts.length === 0)
              ? `selected selected-${moduleColor[curChannel]}`
              : 'item'
          } menu-item-option ${className}`}
          onClick={
            className == 'module-item-disable'
              ? () => {}
              : () => {
                  clickEvent();
                  setIsOpen(!isOpen);
                }
          }>
          <div
            className="menu-option"
            style={{
              width: isTeamItem ? '60%' : '100%',
            }}>
            <div className="spacer">{name}</div>
            {subparts != null && subparts.length > 0 ? (
              isOpen ? (
                <ExpandMoreIcon />
              ) : (
                <ChevronRightIcon />
              )
            ) : (
              <></>
            )}
          </div>
          {isTeamItem ? <div className="team">Team</div> : ''}
          {isBetaItem ? <div className="team">Beta</div> : ''}
        </div>
      )}
      <div
        className={`children `}
        style={{
          maxHeight: isOpen ? '500px' : '0',
        }}>
        {isOpen && subparts != null && subparts.length > 0 ? (
          subparts.map((item: any, i: any) => (
            <>
              {subClass && !subClass.includes(item.name) ? (
                // <Tooltip title={"Coming Soon"} placement="right">
                // <div
                //   className={`item-highlight ${
                //     subClass && !subClass.includes(item.name)
                //       ? 'module-item-disable'
                //       : ''
                //   }`}
                //   key={i}
                //   onClick={() => {
                //     if (subClass && !subClass.includes(item.name)) {
                //       setIsOpen(!isOpen);
                //     } else {
                //       childClickEvent(i, item.name);
                //     }
                //   }}>
                //   <div
                //     style={{
                //       // display: "inline-block",
                //       display: 'flex',
                //       alignItems: 'center',
                //     }}>
                //     <div
                //       style={{
                //         display: 'flex',
                //         justifyContent: 'center',
                //         alignItems: 'center',
                //       }}>
                //       <div
                //         className={
                //           selectedChildIndex === subparts.indexOf(item.name)
                //             ? `select select-${moduleColor[curChannel]}`
                //             : `child ${subClass && !subClass.includes(item.name) ? 'module-item-disable' : ''}`
                //         }>
                //         {item.name}
                //       </div>
                //       {beta.find((b) => b === item.name) ? (
                //         <div className="team">Beta</div>
                //       ) : (
                //         ''
                //       )}
                //     </div>
                //     <div className="badge" style={{ opacity: 1 }}>
                //       <p
                //         style={{
                //           opacity: 1,
                //           fontWeight: isSafari ? 500 : 600,
                //         }}>
                //         Coming Soon
                //       </p>
                //     </div>
                //   </div>
                // </div>
                <></>
              ) : (
                // </Tooltip>

                <div
                  className={`item-highlight ${
                    ((selectedChildIndex === i &&
                    curComponent === item.component &&
                    selected == name) || (extractedPath === item.location) || (isReportBuilder && selected === item?.name))
                      ? `select-highlighter`
                      : ''
                  }${
                    subClass && !subClass.includes(item.name)
                      ? 'module-item-disable'
                      : ''
                  }`}
                  key={i}
                  onClick={() => {
                    if (subClass && !subClass.includes(item.name)) {
                      setIsOpen(!isOpen);
                    } else {
                      childClickEvent(i, item.name);
                    }
                  }}>
                  {/* {console.log(item, name, selected, 'item.component')} */}
                  <Tooltip
                    title={
                      subClass && !subClass.includes(item.name)
                        ? 'Coming Soon'
                        : item.name
                    }>
                    <div
                      className={
                        selectedChildIndex === subparts.indexOf(item.name)
                          ? `dot-select dot-select-${moduleColor[curChannel]}`
                          : 'dot'
                      }
                      style={{ cursor: 'pointer' }}>
                      {subpartIcons[subparts.indexOf(item.name)]}
                    </div>
                  </Tooltip>
                  <div
                    style={{
                      display: 'inline-block',
                    }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <div
                        className={
                          selectedChildIndex === subparts.indexOf(item.name)
                            ? `select select-${moduleColor[curChannel]}`
                            : `child ${subClass && !subClass.includes(item.name) ? 'module-item-disable' : ''}`
                        }>
                        {item.name}
                      </div>
                      {beta.find((b) => b === item.name) ? (
                        <div className="team">Beta</div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ))
        ) : (
          <></>
        )}
      </div>
      {/* ) : (
        <div></div>
      )} */}
    </div>
  );
};

export default DrawerItem;

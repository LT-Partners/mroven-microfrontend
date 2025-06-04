import React from "react";
import BenefitFocusedDialog from './benifit';
import CompetitorBashingDialog from './competitor-bash';
import DonutClassicDialog from './donut-digital-classic';
import PASDialog from './pas';
import ProductDifferentiationDialog from './product-diff';


const Dialogs = () => {
  // return <DonutClassicDialog />;
  // return <PASDialog/>
  // return <CompetitorBashingDialog onClose={()=>{}}/>
  // return <BenefitFocusedDialog onClose={()=>{}}/>
  return <ProductDifferentiationDialog onClose={()=>{}}/>
};

export default Dialogs;

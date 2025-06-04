import React, { useEffect, useState } from "react";
import VideoSelection from "./components/video-selection";
import CreativeInsightsAccordion from "./components/accordion/creative_insights";
import "./index.scss";
import MrOvenContextProvider, { useMrOven } from "./context/MrOvenContext";
import NewAngleAccordion from "./components/accordion/new_angle";
import MrOvenLoader from "./components/loader/loader";
import MrOvenDashboard from "./components/dashboard";
import NavigationSteps from "./components/navigation-steps";
import { useSearchParams, useLocation } from "react-router-dom";
import ModelDropdown from "./components/model-dropdown";
import BrandParams from "./components/brand-params";
import NewConceptGeneration from "./components/new-concept-generation";

const MrOvenV2 = () => {
  return (
    <MrOvenContextProvider>
      <MrOvenContent />
    </MrOvenContextProvider>
  );
};

// Component to handle conditional rendering based on context state
const MrOvenContent = () => {
  const { step, isLoading, getURLParams, setStep } = useMrOven();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Get URL parameters
  const typeParam = searchParams.get("type");
  const analysisIdParam = searchParams.get("analysis_id");

  // Set initial state based on URL parameters
  const [selectedType, setSelectedType] = useState<string>(typeParam || "");
  const [analysisId, setAnalysisId] = useState<string>(analysisIdParam || "");

  useEffect(() => {
    // Update URL parameters when state changes
    if (selectedType || analysisId) {
      const params = new URLSearchParams(searchParams);
      if (selectedType) params.set("type", selectedType);
      if (analysisId) params.set("analysis_id", analysisId);
      setSearchParams(params);
    }
  }, [selectedType, analysisId]);

  useEffect(() => {
    // Update state when URL parameters change
    const type = searchParams.get("type");
    const analysis = searchParams.get("analysis_id");

    if (type) setSelectedType(type);
    if (analysis) setAnalysisId(analysis);
  }, [location.search]);

  // Show global loader when loading
  if (isLoading || step.loading) {
    return <MrOvenLoader />;
  }

  // Main content with NavigationSteps
  return (
    <div
      className={`mr-oven-container relative ${step.step === -1 ? "" : "pb-14"}`}
    >
      {/* Conditional rendering based on step */}
      {step.step === -1 ? (
        <MrOvenDashboard />
      ) : step.step === 0 ? (
        <VideoSelection />
      ) 
      // : step.step === 3 ? (
      //   <div className="overflow-auto">
      //     <BrandParams />
      //   </div>
      // )
       : step.step === 1 ? (
        <CreativeInsightsAccordion />
      )
      : step.step === 4 ? (
        <div className="overflow-auto">
          <NewConceptGeneration />
        </div>
      ) 
      : (
        <div className="overflow-auto">
          <NewAngleAccordion />
        </div>
      )}

      {/* Navigation steps always visible except on dashboard */}
      {step.step !== -1 && <NavigationSteps />}
    </div>
  );
};

export default MrOvenV2;

import React, { useEffect, useState } from "react";
import { useMrOven } from "../context/MrOvenContext";
import "../index.scss";
import apiClient from "../../../packages/utils/src/apiClient";
import { authFirebase } from "../../../packages/utils/src/firebase.config";
import ModelDropdown from "./model-dropdown";
import { MoveRight } from "lucide-react";

interface StepInfo {
  id: number;
  name: string;
  displayNumber: number;
}

const NavigationSteps: React.FC = () => {
  const {
    step,
    setStep,
    clearURLParams,
    updateURLParams,
    selectedVideos,
    setSelectedVideos,
  } = useMrOven();
  const [conceptsExist, setConceptsExist] = useState<boolean>(false);
  const [insightsExist, setInsightsExist] = useState<boolean>(false);
  // Track if we've already checked concepts for this session to avoid unnecessary API calls
  const [checkedAnalysisId, setCheckedAnalysisId] = useState<string>("");

  // Define all possible steps
  const allSteps: StepInfo[] = [
    { id: -1, name: "Home", displayNumber: 1 },
    { id: 0, name: "Select Videos", displayNumber: 2 },
    // { id: 3, name: "Brand Params", displayNumber: 5 },
    { id: 1, name: "Creative Insights", displayNumber: 3 },
    { id: 4, name: "Concept Preferences", displayNumber: 6 },
    { id: 2, name: "New Concepts", displayNumber: 4 },
  ];

  // Function to check if concepts exist for the current analysis
  const checkConceptsExist = async (analysisId: string): Promise<boolean> => {
    if (!analysisId) return false;

    try {
      const user = authFirebase.currentUser;
      let authHeader = {};

      if (user) {
        try {
          const idToken = await user.getIdToken();
          authHeader = { Authorization: `Bearer ${idToken}` };
        } catch (error) {
          try {
            const idToken = await user.getIdToken(true);
            authHeader = { Authorization: `Bearer ${idToken}` };
          } catch (refreshError) {
            console.error("Error refreshing Firebase token:", refreshError);
            return false;
          }
        }
      }

      const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const response = await apiClient.get(
        `/mr-oven/new-concepts/run/${analysisId}?user_id=${userLocal.id}`,
        {
          headers: {
            accept: "application/json",
            ...authHeader,
          },
        }
      );

      if (
        response.data &&
        response.data.content_angles &&
        response.data.content_angles.length > 0
      ) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking if concepts exist:", error);
      return false;
    }
  };

  // Check if insights exist when we have an analysis ID
  useEffect(() => {
    const analysisId = step?.metadata?.analysis_id;
    if (!analysisId) {
      setInsightsExist(false);
      return;
    }

    // If we're on insights page or have visited it or are on step 4 (which requires insights)
    if (step.step === 1 || step.step === 4) {
      setInsightsExist(true);
    }
  }, [step.step, step?.metadata?.analysis_id, step?.metadata?.previousStep]);

  // Check if concepts exist when we have an analysis ID
  useEffect(() => {
    const analysisId = step?.metadata?.analysis_id;
    if (!analysisId) {
      return;
    }

    // If we're coming directly from concepts to insights, we know concepts exist
    if (step.step === 1 && step?.metadata?.previousStep === 2) {
      console.log("Coming back from concepts, we know concepts exist");
      setConceptsExist(true);
      setInsightsExist(true);
      setCheckedAnalysisId(analysisId);
      return;
    }

    // If we have a flag in metadata explicitly telling us to check
    if (step?.metadata?.checkExistingConcepts) {
      console.log("Explicitly checking for concepts existence due to flag");
      checkConceptsExist(analysisId).then((exists) => {
        console.log("Concepts exist check result:", exists);
        setConceptsExist(exists);
        if (exists) setInsightsExist(true);
        setCheckedAnalysisId(analysisId);
      });
      return;
    }

    // If we're on insights page and haven't checked concepts for this analysis yet
    if (step.step === 1 && checkedAnalysisId !== analysisId) {
      console.log(
        "First time on insights for this analysis, checking concepts"
      );
      checkConceptsExist(analysisId).then((exists) => {
        console.log("Concepts exist check result:", exists);
        setConceptsExist(exists);
        if (exists) setInsightsExist(true);
        setCheckedAnalysisId(analysisId);
      });
    }

    // If we're on concepts page, concepts must exist
    if (step.step === 2) {
      console.log("On concepts page, concepts must exist");
      setConceptsExist(true);
      setInsightsExist(true); // If concepts exist, insights must exist
      setCheckedAnalysisId(analysisId);
    }
  }, [
    step.step,
    step?.metadata?.analysis_id,
    step?.metadata?.checkExistingConcepts,
    step?.metadata?.previousStep,
  ]);

  // Clear URL params when on dashboard or video selection
  useEffect(() => {
    if (step.step === -1 || step.step === 0 || step.step === 3) {
      clearURLParams();
    }
  }, [step.step, clearURLParams]);

  // Handle step click navigation
  const handleStepClick = (stepId: number) => {
    // Don't do anything if clicking the current step
    if (stepId === step.step) return;

    // Reset selectedVideos when clicking any step other than video selection
    if (stepId !== 0) {
      setSelectedVideos([]);
    }

    // For insights and concepts, only allow navigation if we have data
    if ((stepId === 1 || stepId === 2) && !step.metadata.analysis_id) {
      return; // No analysis data, can't navigate
    }

    // For concepts, only allow navigation if concepts exist
    if (stepId === 2 && !conceptsExist) {
      return; // No concepts data, can't navigate
    }

    // Clear URL params for home, video selection, or Brand Params
    if (stepId === -1 || stepId === 0 || stepId === 3) {
      clearURLParams();
    }
    // Update URL params for insights and concepts
    else if (stepId === 1) {
      updateURLParams("insights", step.metadata.analysis_id);
    } else if (stepId === 2) {
      updateURLParams("concepts", step.metadata.analysis_id);
    } else if (stepId === 4) {
      updateURLParams("new-concept", step.metadata.analysis_id);
    }

    // Include the previous step in metadata to track navigation history
    // Add specific flags based on navigation patterns
    let metadata = {};

    if (stepId >= 1) {
      metadata = {
        ...step.metadata,
        previousStep: step.step,
      };

      // When navigating from concepts to insights
      if (stepId === 1 && step.step === 2) {
        metadata = {
          ...metadata,
          streamProcess: false,
          checkExistingConcepts: true,
        };
      }

      // For concepts step via UI navigation
      if (stepId === 2 && conceptsExist) {
        metadata = {
          ...metadata,
          streamProcess: false,
        };
      }

      // For concept preferences step
      if (stepId === 4) {
        metadata = {
          ...metadata,
          streamProcess: false,
        };
      }
    }

    // Push to browser history before changing the step
    window.history.pushState(
      { step: stepId, metadata },
      "",
      window.location.href
    );

    setStep({ step: stepId, metadata, loading: false });
  };

  // Check if a step is navigable
  const isStepNavigable = (stepId: number) => {
    if (stepId === -1 || stepId === 0) return true; // Home, Video Selection, and Brand Params always navigable
    if (stepId === 3) return selectedVideos.length > 0; // Brand Params always navigable
    if (stepId === 1) return step.metadata && step.metadata.analysis_id; // Insights needs analysis_id
    if (stepId === 4)
      return step.metadata && step.metadata.analysis_id && insightsExist; // Concept Preferences needs analysis_id and insights to exist
    if (stepId === 2)
      return step.metadata && step.metadata.analysis_id && conceptsExist; // Concepts needs analysis_id and concepts to exist
    return false;
  };

  // Get the steps to display
  const stepsToDisplay = allSteps;

  return (
    <div className="mroven-navigation-steps">
      <div className="steps-container w-full">
        {/* Model Dropdown */}
        <div className="absolute left-0">
          <ModelDropdown />
        </div>

        {stepsToDisplay.map((s, index, displayedSteps) => {
          const isActive = s.id === step.step;
          const isPrevious = s.id < step.step;
          const isNavigable = isStepNavigable(s.id);

          return (
            <React.Fragment key={s.id}>
              <div
                className={`step-item ${isNavigable ? "navigable" : "disabled"} ${isActive ? "active" : ""}`}
                onClick={() =>
                  isNavigable ? handleStepClick(s.id) : undefined
                }
              >
                <div className={`step-name ${isActive ? "active" : ""}`}>
                  {s.name}
                </div>
              </div>

              {/* Add arrow between steps, but not after the last one */}
              {index < displayedSteps.length - 1 && (
                <div
                  className={`step-arrow ${s.id < step.step ? "completed" : ""}`}
                >
                  <MoveRight strokeWidth={1} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationSteps;

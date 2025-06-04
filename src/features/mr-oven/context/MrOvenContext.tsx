import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import apiClient from "../../../packages/utils/src/apiClient";
import { Toastify } from "../../../packages/ui/src/toast";

// Define all the types we need for our application
interface VideoMetadata {
  name: string;
  // Add other metadata properties as needed
}

interface Step {
  step: number;
  metadata?: Record<string, any>;
  loading?: boolean;
}

interface Model {
  id: string;
  name: string;
  description: string;
  tags: string[];
  is_default: boolean;
}

interface MrOvenContextType {
  // Video selection state
  selectedVideos: number[];
  setSelectedVideos: (
    videos: number[] | ((prev: number[]) => number[])
  ) => void;

  // Step management
  step: Step;
  setStep: (step: Step | ((prev: Step) => Step)) => void;
  goToNextStep: (metadata?: Record<string, any>) => void;
  goToPrevStep: () => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Video upload functions
  uploadVideos: (
    files: File[],
    metadataList?: VideoMetadata[],
    skipFailed?: boolean
  ) => Promise<any>;
  uploadSingleVideo: (file: File, metadata: VideoMetadata) => Promise<any>;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Brand information
  brandId: string | null;
  getBrandId: () => string;
  allBrands: any[];

  // URL parameters
  updateURLParams: (type: string, analysisId: string) => void;
  getURLParams: () => { type: string; analysisId: string };
  clearURLParams: () => void;

  // Model selection state
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  models: Model[];
  loadingModels: boolean;
  modelError: string | null;

  // Step stack for browser back/forward button handling
  stepStack: Step[];
  setStepStack: (stack: Step[]) => void;
  popFromStepStack: () => void;

  // Concept form data
  conceptFormData: any;
  setConceptFormData: (data: any) => void;
}

const MrOvenContext = createContext<MrOvenContextType | undefined>(undefined);

export const MrOvenContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  //Active tab
  const [activeTab, setActiveTab] = useState<string>("myRuns");

  // State management
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [step, setStep] = useState<Step>({
    step: -1,
    metadata: {},
    loading: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [allBrands, setAllBrands] = useState<any[]>([]);

  // Add model-related state
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // Step stack for browser back/forward button handling
  const [stepStack, setStepStack] = useState<Step[]>([]);
  const [prevStep, setPrevStep] = useState<Step | null>(null);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);


  const [conceptFormData, setConceptFormData] = useState<any>({});
  const updateURLParams = useCallback((type, analysisId) => {
    // Get the current URL and hash
    const url = new URL(window.location.href);
    const hashParts = url.hash.split("?");
    const hashPath = hashParts[0] || "#";
    const hashParams = new URLSearchParams(hashParts[1] || "");

    // Update hash params
    hashParams.set("type", type);
    hashParams.set("analysis_id", analysisId);

    // Remove any main URL params with the same names
    url.searchParams.delete("type");
    url.searchParams.delete("analysis_id");

    // Update URL with hash params
    url.hash = hashPath + "?" + hashParams.toString();

    // Update browser history without refreshing
    window.history.pushState({}, "", url.toString());
  }, []);

  // Function to get URL parameters from hash
  const getURLParams = useCallback(() => {
    const currentUrl = window.location.href;
    const hashIndex = currentUrl.indexOf("#");

    if (hashIndex !== -1) {
      // There is a hash in the URL
      const hashPart = currentUrl.slice(hashIndex);
      const hashParamIndex = hashPart.indexOf("?");

      if (hashParamIndex !== -1) {
        // Hash has parameters
        const hashParams = new URLSearchParams(
          hashPart.slice(hashParamIndex + 1)
        );
        return {
          type: hashParams.get("type"),
          analysisId: hashParams.get("analysis_id"),
        };
      }
    }

    return { type: null, analysisId: null };
  }, []);

  const clearURLParams = useCallback(() => {
    const url = new URL(window.location.href);
    const hashParts = url.hash.split("?");
    const hashPath = hashParts[0] || "#";

    // Clear params but keep hash path
    url.searchParams.delete("type");
    url.searchParams.delete("analysis_id");
    url.hash = hashPath;

    window.history.pushState({}, "", url.toString());
  }, []);

  // Add this useEffect to run once on initial mount
  useEffect(() => {
    const { type, analysisId } = getURLParams();

    if (type && analysisId) {
      setIsLoading(true);

      // Determine step based on URL params
      let targetStep = -1;
      if (type === "insights") {
        targetStep = 1;
      } else if (type === "concepts") {
        targetStep = 2;
      } else if (type === "new-concept") {
        targetStep = 4;
      }

      if (targetStep > -1) {
        // Update step with analysis_id from URL
        setStep({
          step: targetStep,
          metadata: { analysis_id: analysisId },
          loading: false,
        });
      }

      setIsLoading(false);
    }
  }, []); // Empty dependency array means it only runs once on mount

  // Get brand ID from localStorage
  const getBrandId = useCallback((): string => {
    const brandObjectSelected = JSON.parse(
      localStorage.getItem("brandObjectSelected") || "{}"
    );

    // TODO: Commenitng for DEV purpose
    if (!brandObjectSelected?.id) {
      // throw new Error("Brand ID is required");
      return "58";
    }

    return brandObjectSelected.id.toString();
  }, []);

  const getAllBrands = async () => {
    try {
      const res = await apiClient.get(`/brand/v1/user/brand/all`);
      setAllBrands(res.data.response);
    } catch (error) {
      Toastify("error", "Error while fetching brands");
    }
  };

  useEffect(() => {
    getAllBrands();
  }, []);

  // Initialize brand ID from localStorage
  useEffect(() => {
    try {
      const id = getBrandId();
      setBrandId(id);
    } catch (error) {
      console.error("Failed to get brand ID:", error);
    }
  }, [getBrandId]);

  // Step navigation helpers - modified to update URL
  const goToNextStep = useCallback(
    (metadata: Record<string, any> = {}) => {
      setStep((prev) => {
        const newStep = {
          step: prev.step + 1,
          metadata: { ...prev.metadata, ...metadata },
          loading: false,
        };

        // Update URL when moving to Creative Insights or New Concepts
        if (newStep.step === 1 && newStep.metadata.analysis_id) {
          updateURLParams("insights", newStep.metadata.analysis_id.toString());
        } else if (newStep.step === 2 && newStep.metadata.analysis_id) {
          updateURLParams("concepts", newStep.metadata.analysis_id.toString());
        }

        return newStep;
      });
    },
    [updateURLParams]
  );

  const goToPrevStep = useCallback(() => {
    setStep((prev) => {
      const newStep = {
        ...prev,
        step: Math.max(-1, prev.step - 1),
        loading: false,
      };

      // Clear URL parameters when going back to dashboard
      if (newStep.step === -1) {
        clearURLParams();
      } else if (newStep.step === 1 && prev.metadata.analysis_id) {
        // If going back from New Concepts to Creative Insights
        updateURLParams("insights", prev.metadata.analysis_id.toString());
      }

      return newStep;
    });
  }, [updateURLParams, clearURLParams]);

  // Add model fetching effect
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        setModelError(null);

        const response = await apiClient.get("/mr-oven/api/models/list");

        if (response.data) {
          setModels(response.data);
          // Set default model if available
          if (response.data.length > 0) {
            const defaultModel =
              response.data.find((m: Model) => m.is_default) ||
              response.data[0];
            setSelectedModel(defaultModel.id);
          }
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        setModelError("Failed to load models");
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // API functions
  const uploadVideos = useCallback(
    async (
      files: File[],
      metadataList: VideoMetadata[] = [],
      skipFailed: boolean = false
    ) => {
      try {
        setIsLoading(true);
        const id = getBrandId();

        // Create FormData
        const formData = new FormData();
        formData.append("brand_id", id);

        // Add metadata_list as JSON
        const completeMetadataList = files.map((file, index) => {
          return metadataList[index] || { name: file.name };
        });
        formData.append("metadata_list", JSON.stringify(completeMetadataList));

        // Add video files
        files.forEach((file) => {
          formData.append("videos", file);
        });

        // Add skip_failed parameter if provided
        if (skipFailed) {
          formData.append("skip_failed", "true");
        }

        const response = await apiClient.post(
          "/mr-oven/api/videos/upload-multiple-videos",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        throw new Error(`Failed to upload videos: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [getBrandId]
  );

  const uploadSingleVideo = useCallback(
    async (file: File, metadata: VideoMetadata) => {
      try {
        setIsLoading(true);
        const id = getBrandId();

        // Create FormData
        const formData = new FormData();
        formData.append("video", file);
        formData.append("metadata", JSON.stringify(metadata));

        const response = await apiClient.post(
          `/mr-oven/api/videos/upload-video?brand_id=${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return response.data;
      } catch (error: any) {
        throw new Error(`Failed to upload video: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [getBrandId]
  );

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      console.log("Browser back/forward button clicked");
      console.log("Current stepStack:", stepStack);

      // Set the flag to prevent pushing to stack when step changes
      setIsNavigatingBack(true);

      // If we have steps in the stack, pop the last one
      if (stepStack.length > 0) {
        const newStack = [...stepStack];
        const poppedStep = newStack.pop();
        setStepStack(newStack);

        if (poppedStep) {
          console.log("Popping step from stack on browser back:", poppedStep);

          // Set the step to the popped value
          setStep(poppedStep);

          // Update URL parameters if needed
          if (poppedStep.step === 1 && poppedStep.metadata?.analysis_id) {
            updateURLParams("insights", poppedStep.metadata.analysis_id);
          } else if (
            poppedStep.step === 2 &&
            poppedStep.metadata?.analysis_id
          ) {
            updateURLParams("concepts", poppedStep.metadata.analysis_id);
          } else if (poppedStep.step === -1 || poppedStep.step === 0) {
            clearURLParams();
          }
        }
      } else {
        // If stack is empty, go to dashboard
        console.log("Step stack is empty, going to dashboard");
        setStep({
          step: -1,
          metadata: {},
          loading: false,
        });
        clearURLParams();
      }
    };

    // Add event listener for popstate (browser back/forward)
    window.addEventListener("popstate", handlePopState);

    // Clean up the event listener
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [stepStack, updateURLParams, clearURLParams]);

  // Track step changes and manage stack
  useEffect(() => {
    if (prevStep === null) {
      // Initial step, just store it
      setPrevStep(step);
      return;
    }

    // Only add to stack if not navigating back
    if (step.step !== prevStep.step && !isNavigatingBack) {
      setStepStack((prev) => [...prev, prevStep]);
      console.log("Step added to stack:", prevStep);

      // Push to browser history when navigating forward
      if (step.step === 1 && step.metadata?.analysis_id) {
        updateURLParams("insights", step.metadata.analysis_id);
        window.history.pushState(
          { step: step.step, metadata: step.metadata },
          "",
          window.location.href
        );
      } else if (step.step === 2 && step.metadata?.analysis_id) {
        updateURLParams("concepts", step.metadata.analysis_id);
        window.history.pushState(
          { step: step.step, metadata: step.metadata },
          "",
          window.location.href
        );
      } else if (step.step === -1 || step.step === 0) {
        clearURLParams();
        window.history.pushState(
          { step: step.step, metadata: step.metadata },
          "",
          window.location.href
        );
      }
    }

    setPrevStep(step);
    // Reset the navigating back flag after the effect runs
    setIsNavigatingBack(false);
  }, [step, prevStep, isNavigatingBack, updateURLParams, clearURLParams]);

  // Function to manually pop from stack (for BACK button)
  const popFromStepStack = useCallback(() => {
    setStepStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const popped = newStack.pop();
      console.log("Step popped from stack on BACK button click:", popped);
      return newStack;
    });

    // Set the flag to prevent pushing to stack when step changes
    setIsNavigatingBack(true);

    // Push to browser history
    window.history.pushState({}, "", window.location.href);

    return stepStack[stepStack.length - 1];
  }, [stepStack]);

  // Initialize browser history on component mount
  useEffect(() => {
    // Push initial state to browser history
    window.history.pushState(
      { step: step.step, metadata: step.metadata },
      "",
      window.location.href
    );
  }, []);

  // Context value
  const contextValue: MrOvenContextType = {
    selectedVideos,
    setSelectedVideos,
    step,
    setStep,
    goToNextStep,
    goToPrevStep,
    uploadVideos,
    uploadSingleVideo,
    isLoading,
    setIsLoading,
    brandId,
    getBrandId,
    allBrands,
    activeTab,
    setActiveTab,
    updateURLParams,
    getURLParams,
    clearURLParams,
    selectedModel,
    setSelectedModel,
    models,
    loadingModels,
    modelError,
    stepStack,
    setStepStack,
    popFromStepStack,
    setConceptFormData,
    conceptFormData,
  };

  return (
    <MrOvenContext.Provider value={contextValue}>
      {children}
    </MrOvenContext.Provider>
  );
};

export const useMrOven = () => {
  const context = useContext(MrOvenContext);

  if (context === undefined) {
    throw new Error("useMrOven must be used within a MrOvenContextProvider");
  }

  return context;
};

export default MrOvenContextProvider;

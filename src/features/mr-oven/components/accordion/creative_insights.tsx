import React, { useEffect, useState } from "react";
import { ChevronDown, RotateCw } from "lucide-react";
import { useParams } from "react-router-dom";
import apiClient from "../../../../packages/utils/src/apiClient";
import VideoCard from "../video-card";
import { Skeleton, Fade, CircularProgress } from "@mui/material";
import { Toastify } from "../../../../packages/ui/src/toast";
import { authFirebase } from "../../../../packages/utils/src/firebase.config";
import { useMrOven } from "../../context/MrOvenContext";

const CreativeInsightsAccordion = () => {
  // Get context from MrOvenContext
  const {
    step,
    setStep,
    goToPrevStep,
    getBrandId,
    updateURLParams,
    getURLParams,
    clearURLParams,
    selectedModel,
    popFromStepStack,
  } = useMrOven();

  const getAnalysisId = () => {
    const { analysisId: urlAnalysisId } = getURLParams();
    if (urlAnalysisId) {
      return urlAnalysisId;
    }
    return step?.metadata?.analysis_id || analysis_id;
  };

  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const [expandedItem, setExpandedItem] = useState(null);
  const [insights, setInsights] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    videos: true,
    formula: true,
    hooks: true,
    cta: true,
  });
  const { analysis_id } = useParams();

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [streamedInsights, setStreamedInsights] = useState({
    creative_formula: [],
    hook_insights: [],
    cta_insights: [],
  });

  const [isNewAnalysis, setIsNewAnalysis] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [conceptsExist, setConceptsExist] = useState(false);

  function isNumber(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }
  const toggleItem = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const connectToSSE = async (analysisRunId) => {
    setAnalyzing(true);
    setProgress(0);
    setStatusMessage("Connecting to analysis stream...");
    setVideos([]);
    setStreamedInsights({
      creative_formula: [],
      hook_insights: [],
      cta_insights: [],
    });

    const abortController = new AbortController();
    let buffer = "";

    try {
      const user = authFirebase.currentUser;
      let authHeader = {};

      if (user) {
        try {
          const idToken = await user.getIdToken();
          authHeader = { Authorization: `Bearer ${idToken}` };
        } catch (error) {
          try {
            const refreshedIdToken = await user.getIdToken(true);
            authHeader = { Authorization: `Bearer ${refreshedIdToken}` };
          } catch (refreshError) {
            console.error("Error refreshing Firebase token:", refreshError);
            throw refreshError;
          }
        }
      }

      if (isNumber(analysisRunId)) {
        console.log("fetching analysis", analysisRunId);
        await fetchAnalysis(analysisRunId);
        setAnalyzing(false);
        abortController.abort();
        return;
      }
      const response = await fetch(
        `${process.env.VITE_BASEURL}/mr-oven/api/creative-insights-sse/stream/${analysisRunId}`,
        {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            ...authHeader,
          },
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `SSE connection failed with status: ${response.status}`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let lastHeartbeat = Date.now();
      const heartbeatTimer = setInterval(() => {
        const timeElapsed = Date.now() - lastHeartbeat;
        if (timeElapsed > 500000) {
          console.warn("Connection timeout - no heartbeat received");
          clearInterval(heartbeatTimer);
          abortController.abort();
          setStatusMessage("Connection lost. Please try again.");
          setAnalyzing(false);
        }
      }, 5000);

      const processStream = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split("\n\n");
            buffer = events.pop() || "";

            for (const event of events) {
              let eventType = "";
              let eventData = "";

              event.split("\n").forEach((line) => {
                if (line.startsWith("event:")) {
                  eventType = line.substring(6).trim();
                } else if (line.startsWith("data:")) {
                  eventData = line.substring(5).trim();
                }
              });

              if (!eventType || !eventData) continue;

              try {
                const data = JSON.parse(eventData);

                switch (eventType) {
                  case "heartbeat":
                    lastHeartbeat = Date.now();
                    break;

                  case "init":
                    setStatusMessage(data.message);
                    break;

                  case "analysis_created":
                    setStatusMessage(
                      `Analysis #${data.analysis_id} running. Processing videos...`
                    );
                    break;

                  case "videos_batch":
                    setStatusMessage(
                      `Loading videos: batch ${data.batch} of ${data.total_batches}`
                    );
                    setProgress(
                      Math.min(20, (data.batch / data.total_batches) * 20)
                    );

                    if (data.videos && data.videos.length > 0) {
                      setVideos((prev) => [...prev, ...data.videos]);
                      setLoadingStates((prev) => ({ ...prev, videos: false }));
                    }
                    break;

                  case "videos_loaded":
                    setStatusMessage(
                      `Loaded ${data.count} videos. Generating insights...`
                    );
                    setProgress(20);
                    setLoadingStates((prev) => ({ ...prev, videos: false }));
                    break;

                  case "progress":
                    setStatusMessage(data.message);
                    setProgress(data.percentage || 0);
                    break;

                  case "insight_chunk":
                    setProgress(data.progress || 0);

                    if (data.type && data.data) {
                      setInsights((prev) => ({
                        ...(prev || {}),
                        [data.type]: data.data,
                      }));

                      setStreamedInsights((prev) => ({
                        ...prev,
                        [data.type]: data.data,
                      }));

                      if (data.type === "creative_formula") {
                        setLoadingStates((prev) => ({
                          ...prev,
                          formula: false,
                        }));
                      } else if (data.type === "hook_insights") {
                        setLoadingStates((prev) => ({ ...prev, hooks: false }));
                      } else if (data.type === "cta_insights") {
                        setLoadingStates((prev) => ({ ...prev, cta: false }));
                      }

                      setStatusMessage(
                        `Received ${data.type.replace("_", " ")} insights...`
                      );
                    }
                    break;

                  case "complete":
                    console.log("Analysis complete:", data);
                    setStatusMessage("Analysis complete!");

                    setStep((prev) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        analysis_id: data.analysis_id,
                      },
                    }));

                    setProgress(100);
                    clearInterval(heartbeatTimer);

                    setTimeout(() => {
                      setAnalyzing(false);
                      setLoading(false);
                      setExpandedItem(1);
                    }, 1500);

                    updateURLParams("insights", data.analysis_id);
                    break;

                  case "error":
                    let errorMsg = data.message || "An error occurred";
                    setStatusMessage(`Error: ${errorMsg}`);
                    clearInterval(heartbeatTimer);
                    abortController.abort();
                    setAnalyzing(false);
                    fetchAnalysis(analysisRunId);
                    break;

                  default:
                    console.log(`Unhandled event type: ${eventType}`, data);
                    break;
                }
              } catch (error) {
                console.error("Error processing event data:", error, eventData);
              }
            }
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error reading stream:", error);
            setStatusMessage("Connection error. Please try again.");
            setAnalyzing(false);
            fetchAnalysis(analysisRunId);
          }
        }
      };

      processStream();

      return {
        close: () => {
          clearInterval(heartbeatTimer);
          abortController.abort();
        },
      };
    } catch (error) {
      console.error("Error establishing SSE connection:", error);
      setStatusMessage("Authentication error. Please try again.");
      setAnalyzing(false);
      fetchAnalysis(analysisRunId);
      return null;
    }
  };

  const fetchAnalysis = async (analysisRunId) => {
    try {
      setLoading(true);
      setIsDataLoaded(false);

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
          }
        }
      }

      const response = await apiClient.get(
        `/mr-oven/api/creative-insights/${analysisRunId}`,
        {
          headers: {
            accept: "application/json",
            ...authHeader,
          },
        }
      );

      if (response.data) {
        setInsights(
          response.data.insights || {
            creative_formula: [],
            hook_insights: [],
            cta_insights: [],
          }
        );
        setVideos(response.data.videos || []);
        setLoading(false);
        if (analysisRunId) {
          setStep((prev) => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              analysis_id: analysisRunId,
            },
          }));

          updateURLParams("insights", analysisRunId);
        }
        setLoadingStates({
          videos: false,
          formula: false,
          hooks: false,
          cta: false,
        });

        setLoading(false);
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setLoading(false);
      setIsDataLoaded(true);
    }
  };

  const generateNewConcepts = async () => {
    try {
      setStep((prevStep) => ({
        ...prevStep,
        loading: true,
      }));

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
          }
        }
      }

      const analysisRunId = getAnalysisId();

      if (!analysisRunId) {
        throw new Error("No analysis run ID available");
      }

      const brandId = getBrandId();

      const response = await apiClient.post(
        "/mr-oven/api/new-concepts-sse/generate",
        {
          analysis_run_id: analysisRunId,
          maintain_context: true,
          user_id: userLocal.id,
          brand_id: brandId,
          agent_type: selectedModel || undefined,
        },
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            ...authHeader,
          },
        }
      );

      if (!response.data || !response.data.session_id) {
        throw new Error("No session ID received for new concepts generation");
      }

      const session_id = response.data.session_id;
      console.log("New concepts session created:", session_id);

      setStep({
        step: 2,
        metadata: {
          analysis_id: analysisRunId,
          new_concepts_session_id: session_id,
          streamProcess: true,
          previousStep: 1,
        },
        loading: false,
      });

      updateURLParams("concepts", analysisRunId);
    } catch (error) {
      console.error("Error generating new concepts:", error);
      Toastify(
        "error",
        error.response?.data?.detail || "Failed to generate new concepts"
      );
      setStep((prevStep) => ({
        ...prevStep,
        loading: false,
      }));
    }
  };

  // Add a function to check if concepts exist for the current analysis
  const checkConceptsExist = async (analysisId) => {
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

  // Add a separate useEffect specifically for handling checkExistingConcepts
  useEffect(() => {
    console.log("Check concepts flag effect triggered", {
      checkFlag: step?.metadata?.checkExistingConcepts,
      analysisId: getAnalysisId(),
      conceptsExist,
    });

    // Only run this effect when the flag is explicitly set to true
    if (step?.metadata?.checkExistingConcepts === true) {
      const analysisId = getAnalysisId();

      if (analysisId) {
        console.log(
          "Explicitly checking for concepts due to back navigation",
          analysisId
        );

        // Force check concepts
        checkConceptsExist(analysisId).then((exists) => {
          console.log("Concept check result:", exists);
          setConceptsExist(exists);

          // Clear the flag immediately after checking
          console.log("Clearing checkExistingConcepts flag");
          setStep((prev) => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              checkExistingConcepts: false,
            },
          }));
        });
      }
    }
  }, [step?.metadata?.checkExistingConcepts]);

  // Main effect for initial loading and stream processing
  useEffect(() => {
    const analysisRunId = getAnalysisId();
    console.log("Main effect running with analysisId:", analysisRunId);

    if (!analysisRunId) return;

    if (step?.metadata?.streamProcess) {
      setIsNewAnalysis(true);
      const sseConnection: any = connectToSSE(analysisRunId);

      return () => {
        if (sseConnection && typeof sseConnection.then === "function") {
          sseConnection.then((conn) => {
            if (conn && conn.close) conn.close();
          });
        } else if (sseConnection && sseConnection.close) {
          sseConnection.close();
        }
      };
    } else {
      setIsNewAnalysis(false);
      fetchAnalysis(analysisRunId);

      // Only check for concepts on initial load if we haven't explicitly checked already
      // via the checkExistingConcepts flag
      if (!step?.metadata?.checkExistingConcepts && !conceptsExist) {
        console.log("Initial concepts check on component load");
        checkConceptsExist(analysisRunId).then((exists) => {
          console.log("Initial concept check result:", exists);
          setConceptsExist(exists);
        });
      }
    }
  }, [analysis_id, step?.metadata?.analysis_id]);

  // Create an array of insight sections for display with loading states
  const insightSections = [
    {
      id: 1,
      title: "Selected Videos",
      subTitle: "Your starting ingredients — handpicked by you.",
      description:
        "These are the videos you've picked for analysis. Mr. Oven starts here, using them to cook up all the juicy insights that follow.",
      isLoading: loadingStates.videos,
      items: videos,
      renderContent: () => (
        <div className="p-6">
          {loadingStates.videos ? (
            <div className="grid gap-10 grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={200}
                  animation="wave"
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-10 grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  url={video.path}
                  brandName={video?.brand_name || ""}
                  thumbnail={
                    video?.metadata?.thumbnailUrl ||
                    video.thumbnail ||
                    "https://air-prod.imgix.net/2a90245c-e3d5-4529-86a4-c03bb7eec72a/thumbnail.jpg"
                  }
                  title={video.title}
                  description={video.metadata?.name || ""}
                  isSelected={true}
                  onSelect={() => {}}
                  transcript={
                    video.transcription || "No transcription available"
                  }
                  video_metadata={video.metadata || {}}
                  created_at={video.metadata?.createdAt || ""}
                  brand_id={video.brand_id || ""}
                />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 2,
      title: "Creative Formula",
      subTitle: "The recipe behind the magic.",
      description:
        "Mr. Oven reveals the key patterns that make these creatives tick—highlighting repeatable patterns, smart strategies, and winning combos that drive results.",
      isLoading: loadingStates.formula,
      items: insights?.creative_formula || [],
      renderContent: () => (
        <div className="p-6">
          {loadingStates.formula ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton
                    variant="text"
                    height={30}
                    width="40%"
                    animation="wave"
                  />
                  <Skeleton
                    variant="rectangular"
                    height={100}
                    animation="wave"
                  />
                </div>
              ))}
            </div>
          ) : insights?.creative_formula?.length > 0 ? (
            <div>
              {insights.creative_formula.map((formula, idx) => (
                <Fade in={true} key={idx} timeout={300 + idx * 100}>
                  <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <h3
                      className="font-medium mb-4"
                      style={{ fontFamily: "Outfit" }}
                    >
                      Pattern {idx + 1}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4 text-center">
                      {formula.pattern.map((item, patternIdx) => (
                        <div
                          key={patternIdx}
                          className="bg-[#F3F0EA] px-3 py-1  rounded-full text-xs flex text-gray-700 items-center justify-center font-normal w-fit"
                          style={{ fontFamily: "Outfit" }}
                        >
                          {/* {patternIdx + 1}.  */}
                          {item.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <h4
                        className="text-m font-medium mb-2"
                        style={{ fontFamily: "Outfit" }}
                      >
                        Takeaway:
                      </h4>
                      <p
                        className="text-gray-600 text-m"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {formula.takeaway}
                      </p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 text-gray-500"
              style={{ fontFamily: "Outfit" }}
            >
              No creative formula insights available
            </div>
          )}
        </div>
      ),
    },
    {
      id: 3,
      title: "Hook Insights",
      subTitle: "The secret sauce for grabbing attention.",
      description:
        "See how the best hooks pull viewers in and keep them watching. Mr. Oven breaks down the techniques that spark curiosity and stop the scroll.",
      isLoading: loadingStates.hooks,
      items: insights?.hook_insights || [],
      renderContent: () => (
        <div className="p-6">
          {loadingStates.hooks ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    animation="wave"
                  />
                  <div className="mt-3">
                    <Skeleton variant="text" height={20} animation="wave" />
                    <Skeleton variant="text" height={20} animation="wave" />
                  </div>
                </div>
              ))}
            </div>
          ) : insights?.hook_insights?.length > 0 ? (
            <div>
              {insights.hook_insights.map((hook, idx) => (
                <Fade in={true} key={idx} timeout={300 + idx * 100}>
                  <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="bg-[#F3F0EA] px-3 py-1 rounded-full mb-3 text-center w-fit sm:w-fit">
                      <h3
                        className="text-xs text-gray-800"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {hook.key_factor.toUpperCase()}
                      </h3>
                    </div>
                    <div className="ml-2">
                      <h4
                        className="text-m font-medium mb-2 "
                        style={{ fontFamily: "Outfit" }}
                      >
                        Why it works:
                      </h4>
                      <p
                        className="text-gray-600 text-m"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {hook.takeaway}
                      </p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 text-gray-500"
              style={{ fontFamily: "Outfit" }}
            >
              No hook insights available
            </div>
          )}
        </div>
      ),
    },
    {
      id: 4,
      title: "CTA Insights",
      subTitle: "Driving action, one click at a time.",
      description:
        "Explore how these ads turn viewers into convertors. Mr. Oven uncovers how smart CTAs inspire engagement and boost conversions.",
      isLoading: loadingStates.cta,
      items: insights?.cta_insights || [],
      renderContent: () => (
        <div className="p-6">
          {loadingStates.cta ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    animation="wave"
                  />
                  <div className="mt-3">
                    <Skeleton variant="text" height={20} animation="wave" />
                    <Skeleton variant="text" height={20} animation="wave" />
                  </div>
                </div>
              ))}
            </div>
          ) : insights?.cta_insights?.length > 0 ? (
            <div>
              {insights.cta_insights.map((cta, idx) => (
                <Fade in={true} key={idx} timeout={300 + idx * 100}>
                  <div className="mb-6 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="bg-[#F3F0EA] px-3 py-1 rounded-full mb-3 text-center w-fit sm:w-fit">
                      <h3
                        className="text-xs text-gray-800"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {cta.heading.toUpperCase()}
                      </h3>
                    </div>
                    <div className="ml-2">
                      <h4
                        className="text-m font-medium mb-2"
                        style={{ fontFamily: "Outfit" }}
                      >
                        Impact:
                      </h4>
                      <p
                        className="text-gray-600 text-m"
                        style={{ fontFamily: "Outfit" }}
                      >
                        {cta.takeaway}
                      </p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 text-gray-500"
              style={{ fontFamily: "Outfit" }}
            >
              No CTA insights available
            </div>
          )}
        </div>
      ),
    },
  ];

  const TopLoader = () => {
    if (!analyzing || !isNewAnalysis) return null;

    return (
      <div className="sticky top-0 left-0 right-0 z-50 p-4 border-b">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between mb-2 items-center">
            <div className="flex items-center">
              <CircularProgress size={24} color="success" className="mr-3" />
              <span className="font-medium" style={{ fontFamily: "Outfit" }}>
                {statusMessage}
              </span>
            </div>
            <span className="font-medium" style={{ fontFamily: "Outfit" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#3A8165] h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex mt-2 text-sm text-gray-600 justify-between">
            <div className="flex space-x-4">
              {streamedInsights.creative_formula.length > 0 && (
                <span style={{ fontFamily: "Outfit" }}>
                  Formula: {streamedInsights.creative_formula.length}
                </span>
              )}

              {streamedInsights.hook_insights.length > 0 && (
                <span style={{ fontFamily: "Outfit" }}>
                  Hooks: {streamedInsights.hook_insights.length}
                </span>
              )}

              {streamedInsights.cta_insights.length > 0 && (
                <span style={{ fontFamily: "Outfit" }}>
                  CTAs: {streamedInsights.cta_insights.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  console.log(step, 'check step details');
  

  const handleBack = () => {
    if (step?.metadata?.streamProcess) {
      // If we came from streaming process, go back to video selection
      // Pop from stack before setting the step
      // popFromStepStack();
      setStep({
        step: 0,
        metadata: {},
        loading: false,
      });
      clearURLParams();
    } else {
      // Otherwise go back to dashboard
      // Pop from stack before setting the step
      // popFromStepStack();
      setStep({
        step: -1,
        metadata: {},
        loading: false,
      });
    }
    clearURLParams();
  };

  return (
    <div
      className="bg-gray-100"
      style={{
        height: "100vh",
        overflow: "auto",
        paddingTop: analyzing ? "2rem" : "2rem",
        paddingLeft: "2rem",
        paddingRight: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="max-w-2xl mx-auto mt-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="mr-4" onClick={handleBack}>
            <img
              src="/prizm/mr-oven.png"
              alt="Robot icon"
              className="w-20 h-20"
            />
          </div>
          <h1
            className="text-5xl font-bold text-gray-800"
            style={{
              fontFamily: "Outfit",
            }}
          >
            Creative Insights
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-xl text-gray-600 mb-8"
          style={{
            fontFamily: "Outfit",
          }}
        >
          Here are key takeaways to guide your next creative move.
        </p>

        {/* Content Sections List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {insightSections.map((section) => (
            <div
              key={section.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <button
                onClick={() => toggleItem(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div
                    className="bg-[#1e3771] text-white rounded-full w-8 h-8 flex items-center justify-center text-md font-bold"
                    style={{
                      aspectRatio: "1/1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: "1",
                      padding: "0",
                      margin: "0 16px 0 0",
                      fontWeight: "600",
                    }}
                  >
                    {section.id}
                  </div>
                  <div className="text-left">
                    <span
                      className="text-lg font-bold text-gray-700 block"
                      style={{ fontFamily: "Outfit" }}
                    >
                      {section.title}
                    </span>
                    <span
                      className="text-m text-gray-600 font-semibold"
                      style={{ fontFamily: "Outfit" }}
                    >
                      {section.subTitle}
                    </span>
                    <br />
                    <span
                      className="text-m text-gray-500"
                      style={{ fontFamily: "Outfit" }}
                    >
                      {section.description}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {section.isLoading && (
                    <CircularProgress size={16} className="mr-2" />
                  )}
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transition-transform ${
                      expandedItem === section.id ? "transform rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {expandedItem === section.id && (
                <div className="border-t border-gray-200">
                  {section.renderContent()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons - Only render when data is loaded */}
        {isDataLoaded && (
          <Fade in={true} timeout={300}>
            <div className="mt-8 flex justify-center space-x-4">
              <button
                className="border border-[#3A8165] text-[#3A8165] px-8 py-2 rounded-full hover:bg-green-50 transition-colors"
                onClick={handleBack}
                style={{
                  fontFamily: "Outfit",
                }}
              >
                BACK
              </button>

              {insights && (
                <button
                  className="bg-[#3A8165] hover:bg-[#3e6359] text-white px-8 py-2 rounded-full flex items-center transition-colors"
                  onClick={() => {
                    const analysisId = getAnalysisId();
                    setStep({
                      step: 4,
                      metadata: {
                        analysis_id: analysisId,
                        previousStep: 1,
                        streamProcess: step?.metadata?.streamProcess,
                      },
                      loading: false,
                    });
                    updateURLParams("new-concept", analysisId);
                  }}
                  style={{
                    fontFamily: "Outfit",
                  }}
                >
                  <span className="mr-2">NEXT →</span>
                </button>
              )}

              {/* {insights && conceptsExist && (
                <button
                  className="bg-[#3A8165] hover:bg-[#3e6359] text-white px-8 py-2 rounded-full flex items-center transition-colors"
                  onClick={() => {
                    const analysisId = getAnalysisId();
                    if (analysisId) {
                      setStep({
                        step: 2,
                        metadata: {
                          analysis_id: analysisId,
                          previousStep: 1,
                        },
                        loading: false,
                      });
                      updateURLParams("concepts", analysisId);
                    }
                  }}
                  style={{
                    fontFamily: "Outfit",
                  }}
                >
                  <span className="mr-2">VIEW CONCEPTS</span>
                </button>
              )} */}
            </div>
          </Fade>
        )}
      </div>

      {/* Top loader for analysis progress */}
      <TopLoader />
    </div>
  );
};

export default CreativeInsightsAccordion;

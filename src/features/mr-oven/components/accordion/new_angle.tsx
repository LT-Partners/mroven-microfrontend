import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import NewFormat from "../dialogs/new-format";
import { useParams } from "react-router-dom";
import apiClient from "../../../../packages/utils/src/apiClient";
import { Skeleton, Fade, CircularProgress, Button } from "@mui/material";
import { Toastify } from "../../../../packages/ui/src/toast";
import { authFirebase } from "../../../../packages/utils/src/firebase.config";
import { useMrOven } from "../../context/MrOvenContext";
import RePromptDialog from "../dialogs/re-prompt-dialog";

const NewAngleAccordion = () => {
  const {
    step,
    setStep,
    getBrandId,
    updateURLParams,
    getURLParams,
    clearURLParams,
    selectedModel,
    popFromStepStack,
    conceptFormData,
    
  } = useMrOven();
  const [currentScript, setCurrentScript] = useState(0);
  const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
  const [expandedItem, setExpandedItem] = useState(null);
  const [isNewFormatOpen, setIsNewFormatOpen] = useState(false);
  const [contentAngles, setContentAngles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { analysis_id } = useParams();

  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [eventSource, setEventSource] = useState(null);
  const streamCompletedRef = useRef(false);
  const [isRePromptClicked, setIsRePromptClicked] = useState(false);

  
  const getAnalysisId = () => {
    const { analysisId: urlAnalysisId } = getURLParams();
    return urlAnalysisId || step?.metadata?.analysis_id || analysis_id;
  };

  useEffect(() => {
    console.log("Current step metadata:", step?.metadata);
    console.log("Current content angles:", contentAngles);
    console.log("Loading state:", loading);
    console.log("Analyzing state:", analyzing);
  }, [step, contentAngles, loading, analyzing]);

  const toggleItem = (index) => {
    setExpandedItem(expandedItem === index ? null : index);
  };

  const processConceptData = (concept) => {
    if (typeof concept === "string") {
      try {
        return JSON.parse(concept);
      } catch (e) {
        console.error("Failed to parse concept data string:", e);
        return { title: "Untitled Concept", description: concept };
      }
    }
    return concept;
  };

  const parseScript = (script) => {
    if (typeof script === "string") {
      const [hooksSection = "", restOfScript = ""] = script.split(/\n-\n/);
      const hooks = [];
      const lines = [];
      let cta = "";
      const shotList = { productShots: [], lifestyleShots: [] };

      const hookLines = hooksSection.split("\n\n");
      hookLines.forEach((section) => {
        if (
          section.trim().startsWith("HOOK") ||
          section.trim().startsWith("Hook")
        ) {
          hooks.push(section.trim());
        }
      });

      if (restOfScript) {
        const sections = restOfScript.split("\n\n");
        let currentSection = null;
        let inShotList = false;

        sections.forEach((section) => {
          if (!section.trim()) return;
          if (section.startsWith("LINE") || section.startsWith("Line")) {
            lines.push(section.trim());
          } else if (section.startsWith("CTA") || section.startsWith("Cta")) {
            cta = section.replace(/^CTA:?\s*/i, "").trim();
          } else if (
            section.includes("SHOT LIST") ||
            section.includes("Shot List")
          ) {
            inShotList = true;
            const shots = section.split("\n");
            shots.forEach((shot) => {
              if (shot.includes("Product Shots:")) {
                currentSection = "productShots";
              } else if (shot.includes("Lifestyle Shots:")) {
                currentSection = "lifestyleShots";
              } else if (
                shot.trim().startsWith("•") ||
                shot.trim().startsWith("-")
              ) {
                const cleanShot = shot.trim().replace(/^[•-]\s*/, "");
                if (currentSection && cleanShot) {
                  shotList[currentSection].push(cleanShot);
                }
              }
            });
          } else if (
            inShotList &&
            (section.trim().startsWith("•") || section.trim().startsWith("-"))
          ) {
            const cleanShot = section.trim().replace(/^[•-]\s*/, "");
            if (currentSection && cleanShot) {
              shotList[currentSection].push(cleanShot);
            }
          }
        });
      }

      return { hooks, lines, cta, shotList };
    } else if (typeof script === "object" && script !== null) {
      return {
        hooks: script.hooks || [],
        lines: script.body || [],
        cta: script.cta?.cta || "",
        shotList: {
          productShots: script.shots?.product_shots || [],
          lifestyleShots: script.shots?.lifestyle_shots || [],
        },
      };
    } else {
      return {
        hooks: [],
        lines: [],
        cta: "",
        shotList: { productShots: [], lifestyleShots: [] },
      };
    }
  };

  const connectToSSE = async (sessionId) => {
    console.log("Connecting to SSE with session ID:", sessionId);
    setAnalyzing(true);
    setProgress(0);
    setStatusMessage("Starting new concepts generation...");
    setContentAngles([]);
    streamCompletedRef.current = false;

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
          const refreshedIdToken = await user.getIdToken(true);
          authHeader = { Authorization: `Bearer ${refreshedIdToken}` };
        }
      }

      const response = await fetch(
        `${process.env.VITE_BASEURL}/mr-oven/api/new-concepts-sse/stream/${sessionId}?agent_type=${selectedModel || ""}`,
        {
          method: "POST",
          headers: {
            Accept: "text/event-stream", 
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify({
            ...(Object.values(conceptFormData).some(value => value !== "") ? { user_input: conceptFormData } : {})
          }),
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
        if (Date.now() - lastHeartbeat > 500000) {
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
                if (line.startsWith("event:"))
                  eventType = line.substring(6).trim();
                else if (line.startsWith("data:"))
                  eventData = line.substring(5).trim();
              });

              if (!eventType || !eventData) continue;
              const data = JSON.parse(eventData);

              switch (eventType) {
                case "heartbeat":
                  lastHeartbeat = Date.now();
                  break;
                case "init":
                  setStatusMessage(data.message);
                  break;
                case "progress":
                  setStatusMessage(data.message);
                  setProgress(data.percentage || 0);
                  break;
                case "insights_context":
                  setStatusMessage("Processing creative insights context...");
                  setProgress(20);
                  break;
                case "concept_chunk":
                  setProgress(data.progress || 0);
                  if (data.concept) {
                    const processedConcept = processConceptData(data.concept);
                    setContentAngles((prev) => [...prev, processedConcept]);
                  }
                  setStatusMessage(
                    `Generated concept ${data.index} of ${data.total}...`
                  );
                  break;
                case "concept_batch":
                  setProgress(data.progress || 0);
                  if (data.concepts && data.concepts.length > 0) {
                    const processedConcepts =
                      data.concepts.map(processConceptData);
                    setContentAngles((prev) => [...prev, ...processedConcepts]);
                  }
                  setStatusMessage(
                    `Received concepts batch ${data.batch} of ${data.total_batches}...`
                  );
                  break;
                case "complete":
                  setProgress(100);
                  setStatusMessage("New concepts generation complete!");
                  streamCompletedRef.current = true;
                  clearInterval(heartbeatTimer);
                  setAnalyzing(false);
                  setLoading(false);
                  if (contentAngles.length > 0) setExpandedItem(0);
                  else
                    fetchConcepts(
                      step?.metadata?.analysis_id ||
                        data.analysis_id ||
                        analysis_id
                    );
                  break;
                case "error":
                  console.error("SSE Error event:", data.message);
                  setStatusMessage(
                    `Error: ${data.message || "An error occurred"}`
                  );
                  Toastify("error", data.message || "An error occurred");
                  clearInterval(heartbeatTimer);
                  abortController.abort();
                  setAnalyzing(false);
                  fetchConcepts(step?.metadata?.analysis_id || analysis_id);
                  break;
                default:
                  console.log(`Unhandled event type: ${eventType}`, data);
              }
            }
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error reading stream:", error);
            setStatusMessage("Connection error. Please try again.");
            setAnalyzing(false);
            fetchConcepts(step?.metadata?.analysis_id || analysis_id);
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
      fetchConcepts(step?.metadata?.analysis_id || analysis_id);
      return null;
    }
  };

  const connectToSSEUpdates = async (analysisId) => {
    console.log("Connecting to SSE updates for analysis ID:", analysisId);
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
          const refreshedIdToken = await user.getIdToken(true);
          authHeader = { Authorization: `Bearer ${refreshedIdToken}` };
        }
      }

      const response = await fetch(
        `${process.env.VITE_BASEURL}/mr-oven/api/new-concepts-sse/updates/${analysisId}`,
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
                if (line.startsWith("event:"))
                  eventType = line.substring(6).trim();
                else if (line.startsWith("data:"))
                  eventData = line.substring(5).trim();
              });

              if (!eventType || !eventData) continue;
              const data = JSON.parse(eventData);

              switch (eventType) {
                case "heartbeat":
                  console.log("SSE connection established for updates");
                  break;
                case "concept_batch":
                  if (data.concepts && data.concepts.length > 0) {
                    const processedConcepts =
                      data.concepts.map(processConceptData);
                    setContentAngles((prev) => [...prev, ...processedConcepts]);
                    setLoading(false);
                  }
                  break;
                case "complete":
                  setLoading(false);
                  if (contentAngles.length > 0) setExpandedItem(0);
                  abortController.abort();
                  break;
                default:
                  console.log(`Unhandled event type: ${eventType}`, data);
              }
            }
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error reading stream:", error);
            fetchConcepts(analysisId);
          }
        }
      };

      processStream();
      return { close: () => abortController.abort() };
    } catch (error) {
      console.error("Error establishing SSE connection for updates:", error);
      fetchConcepts(analysisId);
      return null;
    }
  };

  const fetchConcepts = async (analysisId) => {
    if (!analysisId) {
      console.warn("No analysis ID provided for fetchConcepts");
      return;
    }
    console.log("Fetching concepts via API for analysis ID:", analysisId);
    try {
      setLoading(true);
      const user = authFirebase.currentUser;
      let authHeader = {};
      if (user) {
        const idToken = await user.getIdToken();
        authHeader = { Authorization: `Bearer ${idToken}` };
      }

      const response = await apiClient.get(
        `/mr-oven/new-concepts/run/${analysisId}?user_id=${userLocal.id}`,
        { headers: { accept: "application/json", ...authHeader } }
      );

      if (response.data && response.data.content_angles) {
        const processedConcepts =
          response.data.content_angles.map(processConceptData);
        setContentAngles(processedConcepts);
        if (processedConcepts.length > 0) setExpandedItem(0);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching concepts:", error);
      setLoading(false);
      Toastify("error", "Failed to load concepts");
    }
  };

  useEffect(() => {
    const analysisId = getAnalysisId();
    if (!analysisId) return;

    if (
      step?.metadata?.new_concepts_session_id &&
      step?.metadata?.streamProcess
    ) {
      const sseConnection: any = connectToSSE(
        step.metadata.new_concepts_session_id
      );
      return () => {
        if (sseConnection && sseConnection.close) sseConnection.close();
      };
    } else {
      const sseConnection: any = connectToSSEUpdates(analysisId);
      const fallbackTimer = setTimeout(() => {
        if (loading) {
          if (sseConnection && sseConnection.close) sseConnection.close();
          fetchConcepts(analysisId);
        }
      }, 2000);

      return () => {
        clearTimeout(fallbackTimer);
        if (sseConnection && sseConnection.close) sseConnection.close();
      };
    }
  }, []);

  useEffect(() => {
    const analysisId = step?.metadata?.analysis_id || analysis_id;
    if (
      !loading &&
      !analyzing &&
      contentAngles.length === 0 &&
      streamCompletedRef.current
    ) {
      fetchConcepts(analysisId);
    }
  }, [loading, analyzing, contentAngles.length]);

  const handleGenerateNewFormat = () => setIsNewFormatOpen(true);

  const handleRefresh = () => {
    const analysisId = step?.metadata?.analysis_id || analysis_id;
    if (analysisId) fetchConcepts(analysisId);
  };

  const handlePreviousScript = (totalScripts) => {
    setCurrentScript((prev) => (prev > 0 ? prev - 1 : totalScripts - 1));
  };

  const handleNextScript = (totalScripts) => {
    setCurrentScript((prev) => (prev < totalScripts - 1 ? prev + 1 : 0));
  };

  const ConceptDetailSkeleton = () => (
    <div className="p-6">
      <Skeleton variant="text" height={32} width="70%" />
      <div className="mt-3">
        <Skeleton variant="text" height={18} />
        <Skeleton variant="text" height={18} />
        <Skeleton variant="text" height={18} width="80%" />
      </div>
    </div>
  );

  const TopLoader = () => {
    if (!analyzing) return null;
    const isErrorState =
      statusMessage.includes("Connection lost") ||
      statusMessage.includes("Error:") ||
      statusMessage.includes("Connection error");
    if (isErrorState && progress >= 100) return null;

    return (
      <div className="sticky top-0 left-0 right-0 z-50 p-4 border-b">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between mb-2 items-center">
            <div className="flex items-center">
              {isErrorState ? (
                <div className="text-red-500 mr-3">⚠️</div>
              ) : (
                <CircularProgress size={24} color="success" className="mr-3" />
              )}
              <span
                className={`font-medium ${isErrorState ? "text-red-500" : ""}`}
                style={{ fontFamily: "Outfit" }}
              >
                {statusMessage}
              </span>
            </div>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${isErrorState ? "bg-red-500" : "bg-[#3A8165]"}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex mt-2 text-sm text-gray-600 justify-between">
            <div>
              {contentAngles.length > 0 && (
                <span>Concepts generated: {contentAngles.length}</span>
              )}
            </div>
            {isErrorState && (
              <button
                className="text-blue-600 hover:text-blue-800 text-sm"
                onClick={handleRefresh}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleBack = () => {
    const analysisId = getAnalysisId();
    if (step?.metadata?.previousStep === 4) {
      // popFromStepStack();
      setStep({
        step: 4,
        metadata: {
          analysis_id: analysisId,
          streamProcess: step?.metadata?.streamProcess || analyzing,
          checkExistingConcepts: true,
        },
        loading: false,
      });
      updateURLParams("new-concept", analysisId);
    } else {
      popFromStepStack();
      setStep({ step: -1, metadata: {}, loading: false });
      clearURLParams();
    }
  };

  return (
    <div
      className="bg-gray-100 min-h-screen"
      style={{ minHeight: "100vh", overflow: "auto", padding: "2rem" }}
    >
      <NewFormat open={isNewFormatOpen} onOpenChange={setIsNewFormatOpen} />
      <div className="max-w-2xl mx-auto mt-4">
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
            style={{ fontFamily: "Outfit" }}
          >
            New Concepts
          </h1>
        </div>
        <p
          className="text-xl text-gray-600 mb-8"
          style={{ fontFamily: "Outfit" }}
        >
          Discover innovative ideas to elevate your content strategy.
        </p>

        {loading && contentAngles.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="border-b border-gray-200 last:border-b-0"
              >
                <div className="px-6 py-4">
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    className="mr-4"
                  />
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                </div>
              </div>
            ))}
          </div>
        ) : contentAngles.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600" style={{ fontFamily: "Outfit" }}>
              No concepts available. Try generating new concepts.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {contentAngles
              .sort((a, b) => b.id - a.id)
              .map((item, index) => {
                const concept = item || {};
                const title = concept.title || `Concept ${index + 1}`;
                const scripts = concept.custom_script
                  ? [concept.script, ...concept.custom_script]
                  : [concept.script];
                const totalScripts = scripts.length;

                const parsedScript = parseScript(
                  scripts[currentScript]?.script
                    ? scripts[currentScript].script
                    : scripts[currentScript]
                );

                return (
                  <div
                    key={index}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <button
                      onClick={() => {
                        toggleItem(index);
                        setCurrentScript(0);
                      }}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="bg-[#16306d] text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-semibold mr-4">
                          {index + 1}
                        </div>
                        <span
                          className="text-lg font-medium text-gray-700"
                          style={{ fontFamily: "Outfit" }}
                        >
                          {title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-400 transition-transform ${expandedItem === index ? "transform rotate-180" : ""}`}
                      />
                    </button>

                    {expandedItem === index && (
                      <div className="border-t border-gray-200">
                        {loading ? (
                          <ConceptDetailSkeleton />
                        ) : (
                          <div className="p-6">
                            <div className="mb-6">
                              <h2
                                className="text-xl font-semibold mb-2"
                                style={{ fontFamily: "Outfit" }}
                              >
                                {title}
                              </h2>
                              <p
                                className="text-gray-600"
                                style={{ fontFamily: "Outfit" }}
                              >
                                {concept.description ||
                                  "No description available"}
                              </p>
                            </div>

                            {concept.product && (
                              <div className="mb-6">
                                <h3
                                  className="font-semibold mb-2 text-lg"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  Product
                                </h3>
                                <p
                                  className="text-gray-600"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  {concept.product}
                                </p>
                              </div>
                            )}

                            {concept.target_audience && (
                              <div className="mb-6">
                                <h3
                                  className="font-semibold mb-2 text-lg"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  Target Audience
                                </h3>
                                <p
                                  className="text-gray-600"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  {concept.target_audience}
                                </p>
                              </div>
                            )}

                            {concept.creative_format && (
                              <div className="mb-6">
                                <h3
                                  className="font-semibold mb-2 text-lg"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  Creative Format
                                </h3>
                                <div className="bg-[#F3F0EA] py-1 px-3 w-fit rounded-full text-xs text-center">
                                  {concept.creative_format.header.toUpperCase()}
                                </div>
                                <p
                                  className="text-gray-600 text-m mt-2"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  {concept.creative_format.description}
                                </p>
                              </div>
                            )}

                            {concept.creative_formula && (
                              <div className="mb-6">
                                <h3
                                  className="font-semibold mb-2 text-lg"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  Creative Formula
                                </h3>
                                {concept.creative_formula.tags && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {concept.creative_formula.tags.map(
                                      (tag, i) => (
                                        <div
                                          key={i}
                                          className="bg-[#F3F0EA] py-1 px-3 w-fit rounded-full text-xs text-center"
                                          style={{ fontFamily: "Outfit" }}
                                        >
                                          {tag.toUpperCase()}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                                <p
                                  className="text-gray-600 text-m"
                                  style={{ fontFamily: "Outfit" }}
                                >
                                  {concept.creative_formula.description}
                                </p>
                              </div>
                            )}

                            {concept.visual_hook_variants &&
                              concept.visual_hook_variants.length > 0 && (
                                <div className="mb-6">
                                  <h3
                                    className="font-semibold mb-2 text-lg"
                                    style={{ fontFamily: "Outfit" }}
                                  >
                                    Visual Hook Variants
                                  </h3>
                                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    {concept.visual_hook_variants.map(
                                      (visual, i) => (
                                        <li
                                          key={i}
                                          className="text-sm"
                                          style={{ fontFamily: "Outfit" }}
                                        >
                                          {visual}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {concept.visual_hook_variant_suggestions &&
                              concept.visual_hook_variant_suggestions.length >
                                0 && (
                                <div className="mb-6">
                                  <h3
                                    className="font-semibold mb-2 text-lg"
                                    style={{ fontFamily: "Outfit" }}
                                  >
                                    Visual Hook Variant Suggestions
                                  </h3>
                                  <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    {concept.visual_hook_variant_suggestions.map(
                                      (suggestion, i) => (
                                        <li
                                          key={i}
                                          className="text-m"
                                          style={{ fontFamily: "Outfit" }}
                                        >
                                          {suggestion}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            <div className="border-t border-gray-200 pt-6 mt-6">
                              <h3
                                className="font-semibold mb-4 text-lg"
                                style={{ fontFamily: "Outfit" }}
                              >
                                Script
                              </h3>
                              <div className="relative max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4 mb-6">
                                <div className="absolute top-2 right-2 flex space-x-2">
                                  <button
                                    onClick={() => {
                                      const contentToCopy = `Client: ${concept.product || "Not specified"}
Writer: AI
Concept Name: ${concept.title || `Concept ${index + 1}`}

${
  parsedScript.hooks.length > 0
    ? "HOOKS\n\n" +
      parsedScript.hooks
        .map((hook, idx) =>
          typeof hook === "string"
            ? hook
            : `Hook ${idx + 1}: ${hook.hook}\nVisual: ${hook.visual}\nIn-ad text: ${hook.in_ad_text}`
        )
        .join("\n\n") +
      "\n\n"
    : ""
}${
                                        parsedScript.lines.length > 0
                                          ? "LINES\n\n" +
                                            parsedScript.lines
                                              .map((line, idx) =>
                                                typeof line === "string"
                                                  ? line
                                                  : `Line ${idx + 1}: ${line.line}\nVisual: ${line.visual}\nIn-ad text: ${line.in_ad_text}`
                                              )
                                              .join("\n\n") +
                                            "\n\n"
                                          : ""
                                      }${parsedScript.cta ? "CTA\n\n" + (typeof parsedScript.cta === "string" ? parsedScript.cta : `CTA: ${parsedScript.cta.cta}\nVisual: ${parsedScript.cta.visual}\nIn-ad text: ${parsedScript.cta.in_ad_text}`) + "\n\n" : ""}${parsedScript.shotList.productShots.length > 0 || parsedScript.shotList.lifestyleShots.length > 0 ? "SHOT LIST\n\n" : ""}${parsedScript.shotList.productShots.length > 0 ? "Product Shots:\n" + parsedScript.shotList.productShots.map((shot) => `• ${shot}`).join("\n") + "\n\n" : ""}${parsedScript.shotList.lifestyleShots.length > 0 ? "Lifestyle Shots:\n" + parsedScript.shotList.lifestyleShots.map((shot) => `• ${shot}`).join("\n") : ""}`;

                                      navigator.clipboard
                                        .writeText(contentToCopy)
                                        .then(() => {
                                          Toastify(
                                            "success",
                                            "Script copied to clipboard"
                                          );
                                        })
                                        .catch((error) =>
                                          console.error(
                                            "Failed to copy: ",
                                            error
                                          )
                                        );
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                    title="Copy to clipboard"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </button>
                                </div>

                                <div className="space-y-3 text-sm">
                                  <div>
                                    <p
                                      className="text-gray-700"
                                      style={{ fontFamily: "Outfit" }}
                                    >
                                      <strong>Client:</strong>{" "}
                                      {concept.product || "Not specified"}
                                    </p>
                                    <p
                                      className="text-gray-700"
                                      style={{ fontFamily: "Outfit" }}
                                    >
                                      <strong>Writer:</strong> AI
                                    </p>
                                    <p
                                      className="text-gray-700"
                                      style={{ fontFamily: "Outfit" }}
                                    >
                                      <strong>Concept Name:</strong>{" "}
                                      {concept.title || `Concept ${index + 1}`}
                                    </p>
                                  </div>

                                  {parsedScript.hooks.length > 0 && (
                                    <div className="mt-4">
                                      <h3
                                        className="uppercase text-base font-bold text-gray-700 mb-2"
                                        style={{ fontFamily: "Outfit" }}
                                      >
                                        HOOKS
                                      </h3>
                                      {parsedScript.hooks.map(
                                        (hookItem, idx) =>
                                          typeof hookItem === "string" ? (
                                            <div key={idx} className="mt-2">
                                              <p
                                                className="text-gray-700 text-xs whitespace-pre-line"
                                                style={{ fontFamily: "Outfit" }}
                                              >
                                                {hookItem
                                                  .split(":")
                                                  .map((part, i, arr) =>
                                                    i === 0 ? (
                                                      <React.Fragment key={i}>
                                                        <strong>{part}</strong>
                                                        {i < arr.length - 1
                                                          ? ":"
                                                          : ""}
                                                      </React.Fragment>
                                                    ) : (
                                                      <React.Fragment key={i}>
                                                        {part}
                                                        {i < arr.length - 1
                                                          ? ":"
                                                          : ""}
                                                      </React.Fragment>
                                                    )
                                                  )}
                                              </p>
                                            </div>
                                          ) : (
                                            <div key={idx} className="mt-2">
                                              <p
                                                className="text-gray-700 text-m"
                                                style={{ fontFamily: "Outfit" }}
                                              >
                                                <strong>Hook {idx + 1}:</strong>{" "}
                                                {hookItem.hook}
                                              </p>
                                              {hookItem.visual && (
                                                <p
                                                  className="text-gray-600 text-m mt-1"
                                                  style={{
                                                    fontFamily: "Outfit",
                                                  }}
                                                >
                                                  Visual: {hookItem.visual}
                                                </p>
                                              )}
                                              {hookItem.in_ad_text && (
                                                <p
                                                  className="text-gray-600 text-m mt-1"
                                                  style={{
                                                    fontFamily: "Outfit",
                                                  }}
                                                >
                                                  In-ad text:{" "}
                                                  {hookItem.in_ad_text}
                                                </p>
                                              )}
                                            </div>
                                          )
                                      )}
                                    </div>
                                  )}

                                  {parsedScript.lines.length > 0 && (
                                    <div className="mt-4">
                                      <h3
                                        className="uppercase text-base font-bold text-gray-700 mb-2"
                                        style={{ fontFamily: "Outfit" }}
                                      >
                                        LINES
                                      </h3>
                                      {parsedScript.lines.map(
                                        (lineItem, idx) =>
                                          typeof lineItem === "string" ? (
                                            <div key={idx} className="mt-2">
                                              <p
                                                className="text-gray-700 text-m whitespace-pre-line"
                                                style={{ fontFamily: "Outfit" }}
                                              >
                                                {lineItem
                                                  .split(":")
                                                  .map((part, i, arr) =>
                                                    i === 0 ? (
                                                      <React.Fragment key={i}>
                                                        <strong>{part}</strong>
                                                        {i < arr.length - 1
                                                          ? ":"
                                                          : ""}
                                                      </React.Fragment>
                                                    ) : (
                                                      <React.Fragment key={i}>
                                                        {part}
                                                        {i < arr.length - 1
                                                          ? ":"
                                                          : ""}
                                                      </React.Fragment>
                                                    )
                                                  )}
                                              </p>
                                            </div>
                                          ) : (
                                            <div key={idx} className="mt-2">
                                              <p
                                                className="text-gray-700 text-m"
                                                style={{ fontFamily: "Outfit" }}
                                              >
                                                <strong>Line {idx + 1}:</strong>{" "}
                                                {lineItem.line}
                                              </p>
                                              {lineItem.visual && (
                                                <p
                                                  className="text-gray-600 text-m mt-1"
                                                  style={{
                                                    fontFamily: "Outfit",
                                                  }}
                                                >
                                                  Visual: {lineItem.visual}
                                                </p>
                                              )}
                                              {lineItem.in_ad_text && (
                                                <p
                                                  className="text-gray-600 text-m mt-1"
                                                  style={{
                                                    fontFamily: "Outfit",
                                                  }}
                                                >
                                                  In-ad text:{" "}
                                                  {lineItem.in_ad_text}
                                                </p>
                                              )}
                                            </div>
                                          )
                                      )}
                                    </div>
                                  )}

                                  {parsedScript.cta && (
                                    <div className="mt-4">
                                      <h3
                                        className="uppercase text-base font-bold text-gray-700 mb-2"
                                        style={{ fontFamily: "Outfit" }}
                                      >
                                        CTA
                                      </h3>
                                      {typeof parsedScript.cta === "string" ? (
                                        <p
                                          className="text-gray-700 text-m whitespace-pre-line"
                                          style={{ fontFamily: "Outfit" }}
                                        >
                                          <strong>CTA</strong>:{" "}
                                          {parsedScript.cta}
                                        </p>
                                      ) : (
                                        <div>
                                          <p
                                            className="text-gray-700 text-m"
                                            style={{ fontFamily: "Outfit" }}
                                          >
                                            <strong>CTA</strong>:{" "}
                                            {parsedScript.cta.cta}
                                          </p>
                                          {parsedScript.cta.visual && (
                                            <p
                                              className="text-gray-600 text-m mt-1"
                                              style={{ fontFamily: "Outfit" }}
                                            >
                                              Visual: {parsedScript.cta.visual}
                                            </p>
                                          )}
                                          {parsedScript.cta.in_ad_text && (
                                            <p
                                              className="text-gray-600 text-m mt-1"
                                              style={{ fontFamily: "Outfit" }}
                                            >
                                              In-ad text:{" "}
                                              {parsedScript.cta.in_ad_text}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {parsedScript.shotList && (
                                    <div className="mt-4">
                                      <h3
                                        className="uppercase text-base font-bold text-gray-700 mb-2"
                                        style={{ fontFamily: "Outfit" }}
                                      >
                                        Shot List
                                      </h3>
                                      {parsedScript.shotList.productShots
                                        .length > 0 && (
                                        <div className="mt-2">
                                          <h4
                                            className="text-m font-bold text-gray-700"
                                            style={{ fontFamily: "Outfit" }}
                                          >
                                            <strong>Product Shots</strong>:
                                          </h4>
                                          <ul className="list-disc pl-5 space-y-1">
                                            {parsedScript.shotList.productShots.map(
                                              (shot, idx) => (
                                                <li
                                                  key={idx}
                                                  className="text-m text-gray-600"
                                                  style={{
                                                    fontFamily: "Outfit",
                                                  }}
                                                >
                                                  {shot}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                      {parsedScript.shotList.lifestyleShots
                                        .length > 0 && (
                                        <div className="mt-3">
                                          <h4
                                            className="text-m font-bold text-gray-700"
                                            style={{ fontFamily: "Outfit" }}
                                          >
                                            <strong>Lifestyle Shots</strong>:
                                          </h4>
                                          <ul className="list-disc pl-5 space-y-1">
                                            {parsedScript.shotList.lifestyleShots.map(
                                              (shot, idx) => (
                                                <li
                                                  key={idx}
                                                  className="text-m text-gray-600"
                                                  style={{
                                                    fontFamily: "Outfit",
                                                  }}
                                                >
                                                  {shot}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <RePromptDialog
                                open={isRePromptClicked}
                                onOpenChange={setIsRePromptClicked}
                                step={{ ...step, item }}
                                setContentAngles={setContentAngles}
                                setCurrentScript={setCurrentScript}
                                currentScriptIndex={currentScript}
                              />
                              <div className="flex flex-col items-center space-y-2 mt-6">
                                <button
                                  className="text-sm text-white bg-[#3A8165] px-10 py-2 rounded-full my-5"
                                  onClick={() => {
                                    setIsRePromptClicked(true);
                                  }}
                                >
                                  RE-PROMPT
                                </button>

                                {item.custom_script && (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handlePreviousScript(totalScripts)
                                      }
                                      className="w-8 h-8 flex items-center justify-center  text-gray-700   disabled:opacity-50"
                                      disabled={totalScripts <= 1}
                                    >
                                      <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => setCurrentScript(0)}
                                      className={`w-8 h-8 flex items-center justify-center  ${
                                        currentScript === 0
                                          ? "bg-orange-500 text-white"
                                          : "bg-gray-200 text-gray-700"
                                      }`}
                                    >
                                      1
                                    </button>
                                    {item.custom_script.map((it, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          setCurrentScript(index + 1)
                                        }
                                        className={`w-8 h-8 flex items-center justify-center  ${
                                          currentScript === index + 1
                                            ? "bg-orange-500 text-white"
                                            : "bg-gray-200 text-gray-700"
                                        }`}
                                      >
                                        {index + 2}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() =>
                                        handleNextScript(totalScripts)
                                      }
                                      className="w-8 h-8 flex items-center justify-center  text-gray-700 disabled:opacity-50"
                                      disabled={totalScripts <= 1}
                                    >
                                      <ChevronRight className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            className="border border-green-600 text-green-600 px-8 py-2 rounded-full hover:bg-green-50 transition-colors"
            onClick={handleBack}
            style={{ fontFamily: "Outfit" }}
          >
            BACK
          </button>
        </div>
      </div>
      <TopLoader />
    </div>
  );
};

export default NewAngleAccordion;

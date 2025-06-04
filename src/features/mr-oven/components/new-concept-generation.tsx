import React, { useState, useEffect } from "react";
import CampaignDialog from "./dialogs/brand-info-dialog";
import { useMrOven } from "../context/MrOvenContext";
import { CircularProgress } from "@mui/material";
import { Toastify } from "../../../packages/ui/src/toast";
import apiClient from "../../../packages/utils/src/apiClient";
import { authFirebase } from "../../../packages/utils/src/firebase.config";
import { useParams, useSearchParams } from "react-router-dom";

const NewConceptGeneration = () => {
  const { setStep, selectedModel, getURLParams, step, updateURLParams } =
    useMrOven();
  const { analysis_id } = useParams();

  const getAnalysisId = () => {
    const { analysisId: urlAnalysisId } = getURLParams();
    if (urlAnalysisId) {
      return urlAnalysisId;
    }
    return step?.metadata?.analysis_id || analysis_id;
  };

  const analysisId = getAnalysisId();
  const [initiatingGeneration, setInitiatingGeneration] = useState(false);
  const [conceptsExist, setConceptsExist] = useState(false);
  const [formData, setFormData] = useState({
    campaignObjective: "",
    preferredCreativeFormat: "",
    tone: "",
    hookReferences: "",
    visualReferences: "",
    anythingElse: "",
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const [brandInfoDialogOpen, setBrandInfoDialogOpen] = useState(false);

  console.log(analysisId, "analysisId");
  const { conceptFormData, setConceptFormData } = useMrOven();
  useEffect(() => {
    const checkConceptsExist = async () => {
      if (!analysisId) return;
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
        setConceptsExist(
          !!(
            response.data &&
            response.data.content_angles &&
            response.data.content_angles.length > 0
          )
        );
      } catch (error) {
        console.error("Error checking if concepts exist:", error);
        setConceptsExist(false);
      }
    };
    checkConceptsExist();
  }, [analysisId]);

  const generateNewConcepts = async () => {
    try {
      setConceptFormData(formData);
      setInitiatingGeneration(true);
      const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const brandObjectSelected = JSON.parse(
        localStorage.getItem("brandObjectSelected") || "{}"
      );

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

      const response = await apiClient.post(
        "/mr-oven/api/new-concepts-sse/generate",
        {
          analysis_run_id: analysisId,
          maintain_context: true,
          user_id: userLocal.id,
          brand_id: brandObjectSelected?.id,
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
          analysis_id: analysisId,
          new_concepts_session_id: session_id,
          streamProcess: true,
          previousStep: 4,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error generating new concepts:", error);
      Toastify(
        "error",
        error.response?.data?.detail || "Failed to generate new concepts"
      );
      setInitiatingGeneration(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8 bg-gray-50 mb-4 h-full">
      <CampaignDialog
        open={brandInfoDialogOpen}
        onOpenChange={setBrandInfoDialogOpen}
      />
      <div className="w-[60%] h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#3D3D3D] mb-4">
            Concept Preferences (Optional)
          </h1>
          <button
            onClick={() => setBrandInfoDialogOpen(true)}
            className="border-[1.6px] border-[#3A8165] text-[#3A8165] px-2 py-2 rounded-[10px] text-m font-medium"
          >
            VIEW CLIENT INFO
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
          {/* Product Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
              Campaign Objective
            </h2>
            <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
              <textarea
                value={formData.campaignObjective}
                onChange={handleChange("campaignObjective")}
                className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
                rows={2}
              />
            </div>
          </div>

          {/* Value Props */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
              Preferred Creative Format
            </h2>
            <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
              <textarea
                value={formData.preferredCreativeFormat}
                onChange={handleChange("preferredCreativeFormat")}
                className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
                rows={2}
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">Tone</h2>
            <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
              <textarea
                value={formData.tone}
                onChange={handleChange("tone")}
                className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
                rows={2}
              />
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
              Hook References
            </h2>
            <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
              <textarea
                value={formData.hookReferences}
                onChange={handleChange("hookReferences")}
                className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
                rows={2}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
              Visual References
            </h2>
            <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
              <textarea
                value={formData.visualReferences}
                onChange={handleChange("visualReferences")}
                className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
                rows={2}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
              Anything Else ?
            </h2>
            <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
              <textarea
                value={formData.anythingElse}
                onChange={handleChange("anythingElse")}
                className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={() => {
              setStep({
                step: 1,
                metadata: {
                  analysis_id: analysisId,
                  streamProcess: step?.metadata?.streamProcess,
                },
                loading: false,
              });
            }}
            className="px-8 py-2 border border-[#3A8165] text-[#3A8165] rounded-full hover:bg-gray-50 font-medium"
            style={{
              fontFamily: "Outfit",
            }}
          >
            BACK
          </button>

          <button
            className="px-8 py-2 bg-[#3A8165] text-white rounded-full hover:bg-[#3A8165] font-medium flex items-center"
            onClick={generateNewConcepts}
            disabled={initiatingGeneration}
            style={{
              fontFamily: "Outfit",
            }}
          >
            {initiatingGeneration ? (
              <CircularProgress size={24} color="inherit" className="mr-2" />
            ) : null}
            GENERATE NEW CONCEPTS →
          </button>
          {conceptsExist && (
            <button
              onClick={() => {
                const metadata = {
                  ...step.metadata,
                  previousStep: 4,
                  streamProcess: false,
                };
                setStep({ step: 2, metadata, loading: false });
                updateURLParams("concepts", analysisId);
              }}
              className="px-8 py-2 bg-[#3A8165] text-white rounded-full hover:bg-[#3A8165] font-medium flex items-center"
              style={{
                fontFamily: "Outfit",
              }}
            >
              VIEW CONCEPTS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConceptGeneration;

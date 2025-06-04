import React from "react";

import { useState } from "react";
import { ArrowRight, X } from "lucide-react";

import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Textarea } from "../../../../components/ui/textarea";
import { Toastify } from "../../../../packages/ui/src/toast";
import apiClient from "../../../../packages/utils/src/apiClient";

interface RePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: any;
  setContentAngles: (contentAngles: any) => void;
  setCurrentScript: (script: number) => void;
  currentScriptIndex: number;
}

export default function RePromptDialog({
  open,
  onOpenChange,
  step,
  setContentAngles,
  setCurrentScript,
  currentScriptIndex,
}: RePromptDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleRun = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log(step, "step-yoyo");
      const res = await apiClient.post(
        `${process.env.VITE_BASEURL}/mr-oven/new-concepts/custom-script`,
        {
          analysis_run_id: step?.metadata?.analysis_id,
          new_concept_id: step?.item?.id,
          user_instructions: prompt,
          agent_type: "google_gemini_flash",
          index: currentScriptIndex,
        }
      );
          setPrompt("");

      console.log(res, "response");

      if (res.data) {
        // Handle successful response
        Toastify("success", "Successfully generated new script");
      }
      const response = await apiClient.get(
        `${process.env.VITE_BASEURL}/mr-oven/new-concepts/run/${step?.metadata?.analysis_id}?user_id=${user.id}`
      );

      if (response.data && response.data.content_angles) {
        const processedConcepts =
          response.data.content_angles.map(processConceptData);
        setContentAngles(processedConcepts);
        // Set current script to the last script
        const currentConcept = processedConcepts.find(
          (c) => c.id === step?.item?.id
        );
        if (currentConcept) {
          const totalScripts = currentConcept.custom_script
            ? [currentConcept.script, ...currentConcept.custom_script].length
            : 1;
          setCurrentScript(totalScripts - 1);
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error generating custom script:", error);
      Toastify("error", "Failed to generate new script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setPrompt("");
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-lg">
        <div className="flex justify-end p-4"></div>
        <DialogHeader className="px-6 pb-4">
          <DialogTitle
            className="text-xl font-medium text-center"
            style={{ fontFamily: "Outfit" }}
          >
            What do you want me to do differently?
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-0">
          <div className="bg-[#F5F5F4] border border-dashed border-gray-300 rounded-md p-4 mb-6">
            <Textarea
              placeholder="Regenerate this video ad script to be more conversational and emotionally resonant. Keep the structure the same, but make the dialogue sound more like a real mom talking to another parent. Emphasize relief, trust, and the feeling of ‘finally finding something that works.’ The product is a leak-proof diaper. Avoid generic claims — instead, show her talking about a specific moment it saved her day."
              className="min-h-[120px] border-none focus-visible:ring-0 p-0 placeholder:text-gray-500 resize-none"
              style={{ fontFamily: "Outfit" }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              className={`px-8 rounded-[50px] ${prompt.length === 0 ? "bg-[#b3b3b3] hover:bg-[#b3b3b3]" : "bg-[#4d7c6f] hover:bg-[#3e6359]"} flex items-center gap-2`}
              style={{ fontFamily: "Outfit" }}
              onClick={handleRun}
              disabled={loading || prompt.length === 0}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  RUNNING
                </>
              ) : (
                <>
                  RUN <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

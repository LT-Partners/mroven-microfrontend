import apiClient from "../../../packages/utils/src/apiClient";
import React, { useEffect, useState } from "react";
import { useMrOven } from "../context/MrOvenContext";
import { CircularProgress } from "@mui/material";
import { Toastify } from "../../../packages/ui/src/toast";

const BrandParams = () => {
  const { setStep, selectedVideos, selectedModel } = useMrOven();
  const [initiatingAnalysis, setInitiatingAnalysis] = useState(false);

  const getBrandInfo = async () => {
    const brandId = JSON.parse(
      localStorage.getItem("brandObjectSelected") || "{}"
    ).id;
    if (!brandId) {
      return;
    }
    const response = await apiClient.get(
      `/mr-oven/api/brand/${brandId}`
    );
    if (response.data.metadata) {
      setFormData(response.data.metadata.brand_oven_meta_data);
    }
  };

  const updateBrandInfo = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const brandId = JSON.parse(
      localStorage.getItem("brandObjectSelected") || "{}"
    ).id;
    if (!brandId) {
      return;
    }
    const response = await apiClient.post(
      `/mr-oven/api/brand/metadata`,
      {
        user_id: user.id,
        brand_id: brandId,
        metadata: formData,
      }
    );
    await getBrandInfo();
    console.log(response, "response");
    Toastify("success", "Brand info updated successfully");
  };

  const createCreativeInsightsAnalysis = async () => {
    try {
      setInitiatingAnalysis(true);
      const userLocal = JSON.parse(localStorage.getItem("user") || "{}");
      const brandObjectSelected = JSON.parse(
        localStorage.getItem("brandObjectSelected") || "{}"
      );

      const response = await apiClient.post(
        "/mr-oven/api/creative-insights-sse/analyze",
        {
          video_ids: selectedVideos,
          user_id: userLocal.id,
          brand_id: brandObjectSelected?.id,
          agent_type: selectedModel || undefined,
        }
      );

      const { session_id } = response.data;

      if (!session_id) {
        throw new Error("No analysis run ID received from server");
        setInitiatingAnalysis(false);
        return;
      }

      setStep({
        step: 1,
        metadata: {
          analysis_id: session_id,
          streamProcess: true,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error creating creative insights analysis:", error);
      Toastify(
        "error",
        error.response?.data?.detail || "Failed to start video analysis"
      );
      setInitiatingAnalysis(false);
    }
  };

  useEffect(() => {
    getBrandInfo();
  }, []);

  const defaultFormData = {
    productDescription: "",
    valueProps: "",
    targetAudience: "",
    dosAndDonts: "",
    additionalInfo: "",
  };
  const [formData, setFormData] = useState(defaultFormData);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center p-8 bg-gray-50 min-h-screen">
      <div className="w-[80%] h-[95%]">
        {/* Product Description */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
            What does the product do?
          </h2>
          <div className="border-[2px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
            <textarea
              value={formData.productDescription}
              onChange={handleChange("productDescription")}
              className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
              rows={2}
            />
          </div>
        </div>

        {/* Value Props */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
            What are the value props?
          </h2>
          <div className="border-[3px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
            <textarea
              value={formData.valueProps}
              onChange={handleChange("valueProps")}
              className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
              rows={4}
            />
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
            Who is the target audience?
          </h2>
          <div className="border-[3px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
            <textarea
              value={formData.targetAudience}
              onChange={handleChange("targetAudience")}
              className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
              rows={2}
            />
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
            What are the do's and don'ts?
          </h2>
          <div className="border-[3px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
            <textarea
              value={formData.dosAndDonts}
              onChange={handleChange("dosAndDonts")}
              className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
              rows={4}
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#3D3D3D] mb-4">
            Anything else I should know?
          </h2>
          <div className="border-[3px] border-[#333E36] border-dotted rounded-[14px] p-4 bg-white">
            <textarea
              value={formData.additionalInfo}
              onChange={handleChange("additionalInfo")}
              className="w-full bg-transparent outline-none resize-none text-[#7C7C7C]"
              rows={4}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={() => {
              setStep({
                step: 0,
                metadata: {},
                loading: false,
              });
            }}
            className="px-8 py-2 border border-[#3A8165] text-[#3A8165] rounded-full hover:bg-gray-50 font-medium"
          >
            BACK
          </button>
          <button
            onClick={createCreativeInsightsAnalysis}
            className="px-8 py-2 bg-[#3A8165] text-white rounded-full hover:bg-[#3A8165] font-medium flex items-center"
            disabled={initiatingAnalysis}
          >
            {initiatingAnalysis ? (
              <CircularProgress size={24} color="inherit" className="mr-2" />
            ) : null}
            ANALYZE →
          </button>
          <button
            onClick={updateBrandInfo}
            className="px-8 py-2 bg-[#3A8165] text-white rounded-full hover:bg-[#3A8165] font-medium"
          >
            UPDATE
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandParams;

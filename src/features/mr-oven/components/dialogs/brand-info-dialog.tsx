import React from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import apiClient from "../../../../packages/utils/src/apiClient";

import { Dialog, DialogContent, DialogHeader } from "../../../../components/ui/dialog";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BrandData {
  productDescription: string;
  valueProps: string;
  targetAudience: string;
  dos: string;
  donts: string;
  additionalInfo: string;
}

export default function CampaignDialog({
  open,
  onOpenChange,
}: CampaignDialogProps) {
  const [brandData, setBrandData] = useState<BrandData>({
    productDescription: "",
    valueProps: "",
    targetAudience: "",
    dos: "",
    donts: "",
    additionalInfo: "",
  });

  const [loading, setLoading] = useState(false);

  const getBrandInfo = async () => {
    try {
      setLoading(true);
      const brandId = JSON.parse(
        localStorage.getItem("brandObjectSelected") || "{}"
      ).id;
      if (!brandId) {
        return;
      }
      const response = await apiClient.get(`/mr-oven/api/brand/${brandId}`);
      if (
        response.data.metadata &&
        response.data.metadata.brand_oven_meta_data
      ) {
        setBrandData(response.data.metadata.brand_oven_meta_data);
      }
    } catch (error) {
      console.error("Error fetching brand info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getBrandInfo();
    }
  }, [open]);

  // Parse Do's and Don'ts from separate fields
  const getDosAndDonts = () => {
    let dosArr: string[] = [];
    let dontsArr: string[] = [];

    // Parse dos field
    if (brandData.dos) {
      try {
        const parsedDos = JSON.parse(brandData.dos);
        if (Array.isArray(parsedDos)) {
          dosArr = parsedDos;
        } else if (typeof parsedDos === "string") {
          dosArr = [parsedDos];
        }
      } catch {
        dosArr = brandData.dos
          .split("\n")
          .map((line) => line.replace(/^[-*•]/, "").trim())
          .filter(Boolean);
      }
    }

    // Parse donts field
    if (brandData.donts) {
      try {
        const parsedDonts = JSON.parse(brandData.donts);
        if (Array.isArray(parsedDonts)) {
          dontsArr = parsedDonts;
        } else if (typeof parsedDonts === "string") {
          dontsArr = [parsedDonts];
        }
      } catch {
        dontsArr = brandData.donts
          .split("\n")
          .map((line) => line.replace(/^[-*•]/, "").trim())
          .filter(Boolean);
      }
    }

    return { dos: dosArr, donts: dontsArr };
  };

  const { dos, donts } = getDosAndDonts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 gap-0 rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center"></div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading brand information...</p>
          </div>
        ) : (
          <div className="space-y-8 mt-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Product</h2>
              <p className="text-gray-700">
                {brandData.productDescription || "No information available"}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Value Props</h2>
              <p className="text-gray-700">
                {brandData.valueProps || "No information available"}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Target Audience</h2>
              <p className="text-gray-700">
                {brandData.targetAudience || "No information available"}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Do's and Don'ts</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium border-gray-300 p-2">
                    <b>Do's</b>
                  </h3>
                  {dos.length > 0 ? (
                    <ul className="space-y-3">
                      <div className="border-b border-gray-300  w-full p-2"></div>
                      {dos.map((item, index) => (
                        <li key={index} className="text-gray-700">
                          {item}
                          <div className="border-b border-gray-300 w-full mt-3"></div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 border-b border-t p-2 border-gray-300">
                      No do's provided
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-medium p-2 border-gray-300">
                    <b>Don'ts</b>
                  </h3>
                  {donts.length > 0 ? (
                    <ul className="space-y-3">
                      <div className="border-b border-gray-300 w-full p-2"></div>
                      {donts.map((item, index) => (
                        <li key={index} className="text-gray-700">
                          {item}
                          <div className="border-b  border-gray-300 w-full mt-3"></div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700 p-2 border-b border-t border-gray-300">
                      No don'ts provided
                    </p>
                  )}
                </div>
              </div>
            </div>

            {brandData.additionalInfo && (
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Additional Information
                </h2>
                <p className="text-gray-700">{brandData.additionalInfo}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

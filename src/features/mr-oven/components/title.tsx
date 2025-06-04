import React, { useEffect, useState } from "react";
import { useMrOven } from "../context/MrOvenContext";

const Title = () => {
  const { goToPrevStep } = useMrOven();
  const [brandName, setBrandName] = useState("");
  const brandObjectSelected = JSON.parse(
    localStorage.getItem("brandObjectSelected") || "{}"
  );

  // Get brand name from localStorage
  useEffect(() => {
    setBrandName(brandObjectSelected.name || "");
  }, [brandObjectSelected.id]);

  return (
    <div
      className="flex justify-start items-center gap-4 text-6xl font-extrabold"
      style={{
        fontFamily: "Outfit",
      }}
    >
      <div className="oven-logo" onClick={goToPrevStep}>
        <img src="/assets/Mr Oven 2.png" alt="Mr Oven Logo" />
      </div>
      Select Videos for {brandName}
    </div>
  );
};

export default Title;

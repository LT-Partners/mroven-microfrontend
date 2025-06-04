import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { CircularProgress } from "@mui/material";
import { useMrOven } from "../context/MrOvenContext";

interface ModelDropdownProps {
  className?: string;
}

const ModelDropdown = ({ className = "" }: ModelDropdownProps) => {
  const { selectedModel, setSelectedModel, models, loadingModels, modelError } =
    useMrOven();

  if (loadingModels) {
    return <CircularProgress size={20} />;
  }

  if (modelError) {
    return <div className="text-red-500 text-sm">{modelError}</div>;
  }

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger
        className={`w-[200px] ${className}`}
        style={{ fontFamily: 'Outfit', fontSize: "14px", fontWeight: "500" }}
      >
        <SelectValue
          placeholder="Select Model"
          style={{ fontFamily: "Outfit", fontSize: "14px", fontWeight: "500" }}
        />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem
            key={model.id}
            value={model.id}
            style={{
              fontFamily: "Outfit",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelDropdown;

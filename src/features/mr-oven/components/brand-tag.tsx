import React, { useState } from "react";
import { useParams } from "react-router-dom";

interface TagProps {
  label: string;
  onRemove: () => void;
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center bg-[#D8EDFF] text-[#16306D] text-sm font-medium px-3 py-1 rounded-full mr-2">
      <span className="">{label}</span>
      <button
        onClick={onRemove}
        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        ✕
      </button>
    </div>
  );
};

interface TagListProps {
  brands: any[];
  setBrands: React.Dispatch<React.SetStateAction<any[]>>;
}

const TagList: React.FC<TagListProps> = ({ brands, setBrands }) => {
  const removeTag = (id: number) => {
    console.log(
      id,
      "id",
      brands.map((brand, i) =>
        i === id ? { ...brand, selected: false } : brand
      )
    );

    setBrands(
      brands.map((brand) =>
        id === brand.id ? { ...brand, selected: false } : brand
      )
    );
  };

  const {brandName} = useParams()

  return (
    <div className="p-4">
      {brands
        ?.filter((brand) => brand.selected && brand.name !== brandName)
        ?.map((brand, index) => (
          <Tag
            key={index}
            label={brand.name}
            onRemove={() => removeTag(brand.id)}
          />
        ))}
    </div>
  );
};

export default TagList;

import { ChevronDown } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

export interface Client {
  name: string;
  selected: boolean;
  logoUrl: string;
}

const ClientDropdown: React.FC<{ brands: any[]; setBrands: any }> = ({
  brands,
  setBrands,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {brandName} = useParams()
  console.log(brandName,'brandName');
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleBrand = (id: number) => {
    const updatedBrands = [...brands];
    setBrands(
      updatedBrands.map((brand) =>
        brand.id === id ? { ...brand, selected: !brand.selected } : brand
      )
    );
  };

  const filteredBrands = brands?.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center space-x-4 p-4 pb-0">
      <span className="text-lg font-medium text-gray-900">
        Include videos from other clients
      </span>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between w-[250px] space-x-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          <span>Select a Client</span>
          <ChevronDown
            className={`w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isOpen && (
          <div className="absolute mt-2 w-[250px] h-[350px] overflow-y-auto overflow-x-hidden bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <div className="sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-b border-gray-300 text-gray-700 focus:outline-none"
              />
            </div>
            {filteredBrands?.map((brand, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  disabled={brand.name === brandName}
                  checked={brand.selected}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-0"
                  style={{
                    accentColor: "#3A8165",
                    color: "#fff",
                  }}
                />
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-gray-700">{brand.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDropdown;

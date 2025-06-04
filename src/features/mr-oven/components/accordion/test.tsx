import React, { useState } from 'react';
import { ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

const ContentStrategyApp = () => {
  const [expandedConcept, setExpandedConcept] = useState(1);
  
  const concepts = [
    { id: 1, name: '["CONCEPT_NAME"]' },
    { id: 2, name: '["CONCEPT_NAME"]' },
    { id: 3, name: '["CONCEPT_NAME"]' }
  ];
  
  const toggleConcept = (id) => {
    setExpandedConcept(expandedConcept === id ? null : id);
  };
  
  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="bg-white p-2 rounded-md mr-3">
            <img src="/api/placeholder/40/40" alt="Idea icon" className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">New Concepts</h1>
            <p className="text-gray-600">Discover innovative ideas to elevate your content strategy.</p>
          </div>
          <div className="ml-auto">
            <button className="bg-green-600 text-white p-2 rounded-full">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
        
        {/* Concept List */}
        <div className="space-y-4">
          {concepts.map((concept) => (
            <div key={concept.id} className="bg-white rounded-lg shadow-sm">
              {/* Concept Header */}
              <div 
                className="flex items-center p-4 cursor-pointer" 
                onClick={() => toggleConcept(concept.id)}
              >
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {concept.id}
                </div>
                <span className="font-medium text-gray-800">{concept.name}</span>
                <div className="ml-auto">
                  {expandedConcept === concept.id ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedConcept === concept.id && concept.id === 1 && (
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-medium mb-2">{"['CONCEPT_TITLE']"}</h2>
                      <p className="text-gray-600">
                        Lorem ipsum dolor sit amet consectetur. Lectus quam aliquam egestas nascetur viverra egestas tempus viverra diam.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Product</h3>
                      <p className="text-gray-600">
                        Lorem ipsum dolor sit amet consectetur. Lectus quam aliquam egestas nascetur viverra.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Target Audience</h3>
                      <p className="text-gray-600">
                        Lorem ipsum dolor sit amet consectetur. Lectus quam aliquam egestas nascetur viverra.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Creative Format</h3>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="bg-gray-100 p-2 rounded text-xs text-gray-500">
                            LOREM IPSUM DOLOR SIT AMET
                          </div>
                        ))}
                      </div>
                      {[1, 2, 3].map((row) => (
                        <div key={row} className="mb-4">
                          <p className="text-gray-600 text-sm mb-2">
                            Lorem ipsum dolor sit amet consectetur. Tellus hac risus dictum lectus tincidunt faucibus. Faucibus feugiat tortor ut et vestibulum cursus amet nulla lacus.
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {[1, 2].map((item) => (
                              <div key={item} className="bg-gray-100 p-2 rounded text-xs text-gray-500">
                                LOREM IPSUM DOLOR SIT AMET
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Creative Formula</h3>
                      {[1, 2, 3].map((row) => (
                        <div key={row} className="mb-4">
                          <div className="bg-gray-100 p-2 rounded text-xs text-gray-500 mb-2 inline-block">
                            LOREM IPSUM DOLOR SIT AMET
                          </div>
                          <p className="text-gray-600 text-sm">
                            Lorem ipsum dolor sit amet consectetur. Tellus hac risus dictum lectus tincidunt faucibus. Faucibus feugiat tortor ut et vestibulum cursus amet nulla lacus.
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Messaging Test</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {[1, 2, 3].map((item) => (
                          <li key={item} className="text-sm">
                            Lorem ipsum dolor sit vs. Lorem ipsum dolor sit vs. Lorem ipsum dolor sit
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2">Visual Test</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        {[1, 2, 3].map((item) => (
                          <li key={item} className="text-sm">
                            Lorem ipsum dolor sit vs. Lorem ipsum dolor sit vs. Lorem ipsum dolor sit
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Editor Content moved inside accordion with separate scrollable section */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h3 className="font-medium mb-4">Concept Details</h3>
                      
                      {/* Scrollable editor section */}
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4 mb-6">
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-700">Client:</p>
                            <p className="text-gray-700">Writer:</p>
                            <p className="text-gray-700">Asana</p>
                            <p className="text-gray-700">Concept Name:</p>
                          </div>
                          
                          {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="mt-2">
                              <p className="text-gray-700">Test #{num}: Lorem ipsum dolor sit amet consectetur</p>
                            </div>
                          ))}
                          
                          <div className="mt-4">
                            <p className="uppercase text-xs text-gray-500">HOOK</p>
                            <p className="font-medium">HOOK 1:</p>
                            <p className="text-gray-700 text-xs">Lorem ipsum dolor sit amet consectetur. Tellus hac risus dictum lectus tincidunt faucibus. Faucibus feugiat tortor ut et vestibulum.</p>
                            <p className="text-xs mt-1"><span className="font-medium">Visual:</span> Lorem ipsum dolor sit amet consectetur tellus hac risus dictum.</p>
                            <p className="text-xs mt-1"><span className="font-medium">In-ad text:</span> Lorem ipsum dolor sit tellus hac risus dictum lectus tincidunt faucibus. Faucibus feugiat tortor ut et vestibulum.</p>
                          </div>
                          
                          <div className="mt-4">
                            <p className="uppercase text-xs text-gray-500">HOOK</p>
                            <p className="font-medium">HOOK 2:</p>
                            <p className="text-gray-700 text-xs">Lorem ipsum dolor sit amet consectetur. Tellus hac risus dictum lectus tincidunt faucibus. Faucibus feugiat tortor ut et vestibulum.</p>
                            <p className="text-xs mt-1"><span className="font-medium">Visual:</span> Lorem ipsum dolor sit amet consectetur tellus hac risus dictum.</p>
                            <p className="text-xs mt-1"><span className="font-medium">In-ad text:</span> Lorem ipsum dolor sit tellus hac risus dictum lectus tincidunt faucibus. Faucibus feugiat tortor ut et vestibulum.</p>
                          </div>
                          
                          <div className="mt-4">
                            <p className="uppercase text-xs text-gray-500">HOOK</p>
                            <p className="font-medium">HOOK 3:</p>
                            <p className="text-gray-700 text-xs">Lorem ipsum dolor sit amet consectetur tellus hac risus tincidunt.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-2 mt-6">
                        <button className="border border-gray-300 text-gray-600 py-2 px-4 rounded-md text-sm">
                          REPROMPT
                        </button>
                        <button className="bg-green-600 text-white py-2 px-4 rounded-md text-sm">
                          GENERATE NEW FORMAT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentStrategyApp;
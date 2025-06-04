import React from 'react';
import { X, Layers, Copy, Link2 } from 'lucide-react';

const PASDialog = () => {
  const steps = [
    {
      title: 'Hook',
      description: 'A problem-focused, compelling opening statement or question designed to grab the viewer\'s attention immediately.'
    },
    {
      title: 'Problem',
      description: 'A more thorough description of the issue or pain point the target audience is experiencing.'
    },
    {
      title: 'Agitate Problem',
      description: 'Amplifying the problem to create a sense of urgency or discomfort.'
    },
    {
      title: 'Product Intro',
      description: 'Introducing the product as a potential solution to the problem.'
    },
    {
      title: 'Product Demo',
      description: 'Demonstrating how the product works, showing its features and functionality.'
    },
    {
      title: 'Benefits',
      description: 'Highlighting the key advantages and positive outcomes of using the product.'
    },
    {
      title: 'Social Proof',
      description: 'Providing evidence of the product\'s effectiveness through testimonials, reviews, or endorsements.'
    },
    {
      title: 'CTA (Call to Action)',
      description: 'A prompt encouraging the viewer to take a specific action, such as purchasing, signing up, or learning more.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Problem, Agitate, Solution</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex">
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium text-gray-900 font-extrabold mr-1">
                    {step.title}: 
                  </span>
                  <span>{step.description}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center gap-4 mt-4 pt-2 border-t border-gray-100">
          <button className="rounded-full px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
            REPROMPT
          </button>
          <button className="rounded-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white">
            CHANGE FORMAT
          </button>
        </div>

        {/* Utility icons */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Layers className="w-5 h-5" />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Copy className="w-5 h-5" />
          </button>
          <button className="p-1 text-gray-500 hover:text-gray-700">
            <Link2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PASDialog;
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link2, Copy, Layers, X } from 'lucide-react';

const DonutClassicDialog = () => {
  const steps = [
    {
      title: 'Hook',
      description:
        "A compelling opening statement or question designed to grab the viewer's attention immediately.",
    },
    {
      title: 'Product Intro',
      description:
        'Introducing the product as a potential solution to the problem or need.',
    },
    {
      title: 'Problem',
      description:
        'A description of the issue or pain point the target audience is experiencing.',
    },
    {
      title: 'Features/USP',
      description:
        'Describing the unique features or unique selling propositions (USPs) of the product.',
    },
    {
      title: 'Demo',
      description:
        'Demonstrating how the product works, showing its features and functionality.',
    },
    {
      title: 'Benefit',
      description:
        'Highlighting the key advantages and positive outcomes of using the product.',
    },
    {
      title: 'Desired End Result',
      description:
        'Describing the ideal outcome the user can expect from using the product.',
    },
    {
      title: 'CTA (Call to Action)',
      description:
        'A prompt encouraging the viewer to take a specific action, such as purchasing, signing up, or learning more.',
    },
    {
      title: 'Product Intro',
      description:
        'Introducing the product as a potential solution to the problem or need.',
    },
    {
      title: 'Problem',
      description:
        'A description of the issue or pain point the target audience is experiencing.',
    },
    {
      title: 'Demo',
      description:
        'Demonstrating how the product works, showing its features and functionality.',
    },
    {
      title: 'Benefit',
      description:
        'Highlighting the key advantages and positive outcomes of using the product.',
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Donut Classic</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4">
            The Donut Classic
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex">
                <p className="text-sm text-gray-600 mt-1">
                  <span className="text-gray-900 font-extrabold mr-1">
                    {step.title}: 
                  </span>
                  <span>{step.description}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-2 relative">
          <Button
            variant="outline"
            className="rounded-full px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50">
            REPROMPT
          </Button>
          <Button className="rounded-full px-6 py-2 bg-green-600 hover:bg-green-700 text-white">
            CHANGE FORMAT
          </Button>
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
      </DialogContent>
    </Dialog>
  );
};

export default DonutClassicDialog;

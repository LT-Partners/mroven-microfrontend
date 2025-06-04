import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Info, X } from 'lucide-react';

interface FormatSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FormatSelector = ({ open, onOpenChange }: FormatSelectorProps) => {
  const formats = [
    {
      name: 'The Donut Classic',
      selected: true,
    },
    {
      name: 'Problem, Agitate, Solution',
      selected: false,
    },
    {
      name: 'Competitor Bashing',
      selected: false,
    },
    {
      name: 'Benefit-Focused',
      selected: false,
    },
    {
      name: 'Product Differentiation',
      selected: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-medium text-center">
            Select New Format
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {formats.map((format, index) => (
            <div
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                format.selected ? 'bg-green-50' : 'bg-white'
              }`}>
              <span
                className={`${format.selected ? 'text-green-800' : 'text-gray-900'}`}>
                {format.name}
              </span>
              <Info
                className={`w-4 h-4 ${format.selected ? 'text-green-800' : 'text-gray-400'}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#fff] mx-2 hover:bg-green-800 hover:text-white text-green-800 px-8 border-2 border-green-800 rounded-xl">
            BACK
          </Button>
          <Button className="bg-green-700 mx-2 hover:bg-green-800 text-white px-8 rounded-xl">
            RUN
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormatSelector;

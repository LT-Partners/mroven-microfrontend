import React from 'react';
import { Button } from '@/components/ui/button';

const EmptyState = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Oven SVG Illustration */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="mx-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M90 120c16.569 0 30-13.431 30-30 0-16.569-13.431-30-30-30-16.569 0-30 13.431-30 30 0 16.569 13.431 30 30 30z"
            fill="#E5E7EB"
          />
          <path
            d="M65 75c0-13.807 11.193-25 25-25s25 11.193 25 25v30H65V75z"
            fill="#D1D5DB"
          />
          <path d="M65 85h50v10H65V85zM70 95h40v5H70v-5z" fill="#9CA3AF" />
          <path
            d="M90 60c-8.284 0-15 6.716-15 15v5h30v-5c0-8.284-6.716-15-15-15z"
            fill="#F59E0B"
          />
          <rect
            x="60"
            y="70"
            width="60"
            height="40"
            rx="5"
            stroke="#374151"
            strokeWidth="2"
          />
          <circle cx="75" cy="80" r="2" fill="#374151" />
          <circle cx="85" cy="80" r="2" fill="#374151" />
          <circle cx="95" cy="80" r="2" fill="#374151" />
          <path d="M105 78h10v4h-10v-4z" fill="#374151" />
        </svg>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            No Ingredients Added!
          </h1>
          <p className="text-xl text-gray-600">Select a client to start.</p>
        </div>

        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-full text-lg"
          onClick={() => window.location.reload()}>
          REFRESH PAGE
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;

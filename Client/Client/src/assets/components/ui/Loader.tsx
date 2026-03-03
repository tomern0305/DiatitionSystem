import React from "react";

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "טוען נתונים..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm w-full h-screen">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-400 opacity-20"></div>
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
      </div>
      <p className="mt-6 text-xl text-blue-600 font-bold animate-pulse tracking-wide">
        {text}
      </p>
    </div>
  );
};

export default Loader;

import React, { useState, useEffect } from "react";

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text = "טוען נתונים..." }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const baseText = text.replace(/\.+$/, "");

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm w-full h-screen">
      <div className="relative flex justify-center items-center">
        <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-400 opacity-20"></div>
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
      </div>
      <div
        className="mt-6 flex items-center justify-center text-xl text-blue-600 font-bold animate-pulse tracking-wide"
        dir="rtl"
      >
        <span>{baseText}</span>
        <span className="inline-block w-6 text-right whitespace-nowrap">
          {dots}
        </span>
      </div>
    </div>
  );
};

export default Loader;

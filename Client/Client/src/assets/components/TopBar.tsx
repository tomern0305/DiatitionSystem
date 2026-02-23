import React from "react";

interface TopBarProps {
  title: string;
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
}

const TopBar = ({ title, setIsSideMenuOpen, children }: TopBarProps) => {
  return (
    <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {setIsSideMenuOpen && (
          <button
            onClick={() => setIsSideMenuOpen((prev) => !prev)}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors flex items-center justify-center cursor-pointer shadow-sm shrink-0"
            aria-label="Open side menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight m-0">
          {title}
        </h1>
      </div>

      {children && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {children}
        </div>
      )}
    </header>
  );
};

export default TopBar;

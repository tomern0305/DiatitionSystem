import React from "react";
import Loader from "./Loader";

interface LoadingGuardProps {
  loading: boolean;
  error: string | null;
  loadingText?: string;
  children: React.ReactNode;
}

/** Renders a loading spinner or error message; otherwise renders children. */
const LoadingGuard: React.FC<LoadingGuardProps> = ({
  loading,
  error,
  loadingText = "טוען...",
  children,
}) => {
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Loader text={loadingText} />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500" dir="rtl">
        <p className="text-xl">שגיאה: {error}</p>
      </div>
    );
  return <>{children}</>;
};

export default LoadingGuard;

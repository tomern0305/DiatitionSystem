import { useState, useEffect } from "react";

/** Fetches AI feature flag from the backend once on mount. */
const useAiEnabled = (): boolean => {
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products/ai-status`)
      .then((r) => r.json())
      .then((data) => setAiEnabled(data.ai_enabled === true))
      .catch(() => setAiEnabled(false));
  }, []);

  return aiEnabled;
};

export default useAiEnabled;

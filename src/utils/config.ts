// This file provides type-safe access to the configuration
declare global {
  interface Window {
    __CONFIG__: {
      NODE_ENV: string;
      API_URL: string;
      ENABLE_MOCK_API: boolean;
      DEBUG: boolean;
      LOG_LEVEL: "debug" | "info" | "error";
      FEATURE_FLAGS: {
        ENABLE_NEW_UI: boolean;
        ENABLE_ANALYTICS: boolean;
      };
      APP_NAME: string;
      VERSION: string;
      BUILD_TIME: string;
      isDevelopment: boolean;
      isProduction: boolean;
      isStaging: boolean;
    };
  }
}

// Get the configuration from the window object
const getConfig = () => {
  if (typeof window === "undefined") {
    throw new Error("Configuration is only available in the browser");
  }

  if (!window.__CONFIG__) {
    throw new Error(
      "Configuration not found. Make sure it is properly injected into the HTML template.",
    );
  }

  return window.__CONFIG__;
};

// Export a type-safe configuration object
export const config = getConfig();

// Export individual configuration values for convenience
export const {
  NODE_ENV,
  API_URL,
  ENABLE_MOCK_API,
  DEBUG,
  LOG_LEVEL,
  FEATURE_FLAGS,
  APP_NAME,
  VERSION,
  BUILD_TIME,
  isDevelopment,
  isProduction,
  isStaging,
} = config;

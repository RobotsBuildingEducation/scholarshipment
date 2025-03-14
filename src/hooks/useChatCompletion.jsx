import { useChatCompletion as useOpenAIChatCompletion } from "./stream";

const useChatCompletion = (config) => {
  return useOpenAIChatCompletion({
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.9,
    ...config,
  });
};

const useWebSearchAgent = (config) => {
  return useOpenAIChatCompletion({
    useWebSearch: true,
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    temperature: 0.9,
    ...config,
  });
};

export { useChatCompletion, useWebSearchAgent };

import { getToken } from "firebase/app-check";
import React, { useState } from "react";
import { ReadableStream } from "web-streams-polyfill";
import { appCheck } from "../database/setup";

// Modified request options builder to support both endpoints.
export const getOpenAiRequestOptions = (
  { apiKey, model, useWebSearch, ...restOfApiParams },
  messages,
  signal
) => {
  if (useWebSearch) {
    // For web search, concatenate all message contents into a single input string.
    const input = messages.map((m) => m.content).join("\n");
    return {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model,
        ...restOfApiParams,
        input,
        stream: false, // Disable streaming
      }),
      signal,
    };
  } else {
    // Default: use messages array for chat completions.
    return {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model,
        ...restOfApiParams,
        messages,
        stream: false, // Disable streaming
      }),
      signal,
    };
  }
};

// Endpoints for chat completions and web search.
const CHAT_COMPLETIONS_URL =
  "https://us-central1-scholarshipment.cloudfunctions.net/app/generate";
const WEBSEARCH_COMPLETIONS_URL =
  "https://us-central1-scholarshipment.cloudfunctions.net/app/websearch";

// Fetch handler that chooses the proper URL based on the useWebSearch flag.
export const openAiCompletionHandler = async (
  requestOpts,
  useWebSearch = false
) => {
  const appCheckTokenResult = await getToken(appCheck);
  const appCheckToken = appCheckTokenResult.token;
  requestOpts["headers"]["X-Firebase-AppCheck"] = appCheckToken;

  const url = useWebSearch ? WEBSEARCH_COMPLETIONS_URL : CHAT_COMPLETIONS_URL;
  const response = await fetch(url, requestOpts);
  if (!response.ok) {
    throw new Error(
      `Network response was not ok: ${response.status} - ${response.statusText}`
    );
  }
  const result = await response.json(); // Await the full JSON response
  return result;
};

const MILLISECONDS_PER_SECOND = 1000;
// Utility method for transforming a chat message to the minimal shape.
const officialOpenAIParams = ({ content, role }) => ({ content, role });
// Utility method for creating a chat message with metadata.
const createChatMessage = ({ content, role, ...restOfParams }) => ({
  content,
  role,
  timestamp: restOfParams.timestamp ?? Date.now(),
  meta: {
    loading: false,
    responseTime: "",
    chunks: [],
    ...restOfParams.meta,
  },
});
// Utility method for updating the last item in a list.
export const updateLastItem = (msgFn) => (currentMessages) =>
  currentMessages.map((msg, i) => {
    if (currentMessages.length - 1 === i) {
      return msgFn(msg);
    }
    return msg;
  });

export const useChatCompletion = (apiParams) => {
  const [fullResponse, _setFullResponse] = useState({});
  const [messages, _setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [controller, setController] = useState(null);

  // Abort an in-progress request.
  const abortResponse = () => {
    if (controller) {
      controller.abort();
      setController(null);
    }
  };

  // Reset the messages if not loading.
  const resetMessages = () => {
    if (!loading) {
      _setMessages([]);
    }
  };

  // Overwrite messages with new ones.
  const setMessages = (newMessages) => {
    if (!loading) {
      _setMessages(newMessages.map(createChatMessage));
    }
  };

  // Append new incremental data to the last message.
  const handleNewData = async (content, role, isFinal = false) => {
    _setMessages(
      updateLastItem((msg) => {
        const updatedChunks = [
          ...msg.meta.chunks,
          {
            content: content,
            role: role,
            timestamp: Date.now(),
            final: isFinal,
          },
        ];

        return {
          ...msg,
          content: `${msg.content}${content}`, // Append final content
          role: msg.role || role,
          meta: {
            ...msg.meta,
            chunks: updatedChunks,
          },
        };
      })
    );
  };

  // Called when the response stream is finished.
  const closeStream = (beforeTimestamp) => {
    const afterTimestamp = Date.now();
    const diffInSeconds =
      (afterTimestamp - beforeTimestamp) / MILLISECONDS_PER_SECOND;
    const formattedDiff = diffInSeconds.toFixed(2) + " sec.";
    _setMessages(
      updateLastItem((msg) => ({
        ...msg,
        timestamp: afterTimestamp,
        meta: {
          ...msg.meta,
          loading: false,
          responseTime: formattedDiff,
          done: true,
        },
      }))
    );
  };

  // Main submission function.
  const submitPrompt = React.useCallback(
    async (newMessages) => {
      // Prevent concurrent requests.
      if (messages[messages.length - 1]?.meta?.loading) return;
      if (!newMessages || newMessages.length < 1) return;
      setLoading(true);

      // Add new messages and a placeholder for the response.
      const updatedMessages = [
        ...messages,
        ...newMessages.map(createChatMessage),
        createChatMessage({
          content: "",
          role: "",
          timestamp: 0,
          meta: { loading: true },
        }),
      ];

      _setMessages(updatedMessages);

      // Create an abort controller.
      const newController = new AbortController();
      const signal = newController.signal;
      setController(newController);

      // Build the request options.
      // For web search, we convert messages differently (via getOpenAiRequestOptions).
      const requestOpts = getOpenAiRequestOptions(
        apiParams,
        updatedMessages
          .filter((m, i) => updatedMessages.length - 1 !== i)
          .map((msg) =>
            apiParams.useWebSearch ? msg : officialOpenAIParams(msg)
          ),
        signal
      );

      try {
        const openaiResponse = await openAiCompletionHandler(
          requestOpts,
          !!apiParams.useWebSearch
        );

        // Debug logs for troubleshooting
        console.log("Response:", openaiResponse);
        _setFullResponse(openaiResponse);

        let finalContent = "";
        let finalRole = "assistant";

        if (openaiResponse.choices && openaiResponse.choices[0]) {
          // Existing chat completions structure.
          finalContent = openaiResponse.choices[0].message.content;
          finalRole = openaiResponse.choices[0].message.role;
        } else if (openaiResponse.output && openaiResponse.output.length > 0) {
          // New Responses API structure.
          // Find the first message-type output.
          const messageObj = openaiResponse.output.find(
            (item) => item.type === "message"
          );
          if (
            messageObj &&
            messageObj.content &&
            messageObj.content.length > 0
          ) {
            const outputTextObj = messageObj.content.find(
              (contentItem) => contentItem.type === "output_text"
            );
            if (outputTextObj && outputTextObj.text) {
              finalContent = outputTextObj.text;
              finalRole = messageObj.role || "assistant";
            } else {
              throw new Error("No output text found in response");
            }
          } else {
            throw new Error("No message found in response output");
          }
        } else {
          throw new Error("Unexpected response structure");
        }

        // Handle the final response.
        handleNewData(finalContent, finalRole, true);
        closeStream(Date.now());
      } catch (err) {
        if (signal.aborted) {
          console.error("Request aborted", err);
        } else {
          console.error("Error during chat completion", err);
        }
      } finally {
        setController(null);
        setLoading(false);
      }
    },
    [messages, apiParams]
  );

  console.log("msgxx", messages);
  console.log("fullresponsex", fullResponse);
  return {
    messages,
    loading,
    submitPrompt,
    abortResponse,
    resetMessages,
    setMessages,
    fullResponse,
  };
};

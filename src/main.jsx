import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Define keyframes for the gradient animation
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Extend the theme
const theme = extendTheme({
  styles: {
    global: {
      body: {
        height: "100vh",
        background:
          "linear-gradient(270deg, lavender, #FBE4F3, lavender, #FBE4F3)",
        backgroundSize: "800% 800%",
        animation: `${gradientAnimation} 120s ease infinite`,
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);

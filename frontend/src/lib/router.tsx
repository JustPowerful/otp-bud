import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Home } from "../Home";

export const router = createBrowserRouter([
  {
    path: "/",
    // Layout component that wraps around all pages
    element: <App />,
    children: [
      // Main components will be rendered here
      { index: true, element: <Home /> },
    ],
  },
]);

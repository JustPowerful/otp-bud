import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Home } from "../Home";
import { SignIn } from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ApiTokenManagement from "@/pages/api-token/ApiTokenManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    // Layout component that wraps around all pages
    element: <App />,
    children: [
      // Main components will be rendered here
      { index: true, element: <Home /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "api-keys", element: <ApiTokenManagement /> },
    ],
  },
]);

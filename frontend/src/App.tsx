import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";

// Main application component
function App() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default App;

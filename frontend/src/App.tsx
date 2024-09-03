import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { AuthProvider } from "./Context/Authcontext";
import Dashboard from "./pages/Dashboard";
import CategoryPage from "../src/components/Categorycomponents/CategoryPage";
import VerifyEmail from "./components/Authcomponents/VerifyEmail";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories/:title" element={<CategoryPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;

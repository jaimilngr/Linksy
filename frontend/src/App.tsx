import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { AuthProvider } from "./Context/Authcontext";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./components/Authcomponents/VerifyEmail";
import ServiceDetails from "./components/servicecomponents/ServiceDetails";
import Updates from "./pages/Updates";
import Categories from "./pages/Categories";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/categories/:title" element={<Categories />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/service/:id" element={<ServiceDetails  />} />
            <Route path="/updates" element={<Updates />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;

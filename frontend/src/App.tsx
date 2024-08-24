import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { AuthProvider } from "./Context/Authcontext";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;

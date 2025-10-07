import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import GeneratePage from "./pages/GeneratePage";
import PricingPage from "./pages/PricingPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generatepage" element={<GeneratePage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Module3 from "./pages/Module3";
import Module4 from "./pages/Module4";
import Module5 from "./pages/Module5";
import Module6 from "./pages/Module6";
import Module7 from "./pages/Module7";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/module3" element={<Module3 />} />
        <Route path="/module4" element={<Module4 />} />
        <Route path="/module5" element={<Module5 />} />
        <Route path="/module6" element={<Module6 />} />
        <Route path="/module7" element={<Module7 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

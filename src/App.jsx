import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";

import MainLayout from "./layouts/MainLayout";
import UVMAcademy from "./pages/UVMAcademy";

import UVMDriverMastery from "./pages/UVMDriverMastery";
import Module3 from "./pages/modules/Module3";
import Module4 from "./pages/modules/Module4";
import Module5 from "./pages/modules/Module5";
import Module6 from "./pages/modules/Module6";
import Module7 from "./pages/modules/Module7";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<UVMAcademy />} />

          <Route path="/driver" element={<UVMDriverMastery />} />

          <Route path="/driver/module3" element={<Module3 />} />

          <Route path="/driver/module4" element={<Module4 />} />

          <Route path="/driver/module5" element={<Module5 />} />

          <Route path="/driver/module6" element={<Module6 />} />

          <Route path="/driver/module7" element={<Module7 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

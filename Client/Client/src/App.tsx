import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SideMenu from "./assets/components/SideMenu";
import ProductsPage from "./assets/pages/ProductsPage";
import ProductSettingsPage from "./assets/pages/ProductSettingsPage";
import CategorySettingsPage from "./assets/pages/CategorySettingsPage";

const App = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <>
      <SideMenu isOpen={isSideMenuOpen} setIsOpen={setIsSideMenuOpen} />
      <main className="transition-all duration-300">
        <Routes>
          <Route
            path="/"
            element={<ProductsPage setIsSideMenuOpen={setIsSideMenuOpen} />}
          />
          <Route
            path="/settings"
            element={
              <ProductSettingsPage setIsSideMenuOpen={setIsSideMenuOpen} />
            }
          />
          <Route
            path="/settings/categories"
            element={
              <CategorySettingsPage setIsSideMenuOpen={setIsSideMenuOpen} />
            }
          />
        </Routes>
      </main>
    </>
  );
};

export default App;

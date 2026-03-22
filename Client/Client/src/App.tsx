import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SideMenu from "./assets/components/ui/SideMenu";
import ProtectedRoute from "./assets/components/ui/ProtectedRoute";
import ProductsPage from "./assets/pages/ProductsPage";
import ProductSettingsPage from "./assets/pages/ProductSettingsPage";
import CategorySettingsPage from "./assets/pages/CategorySettingsPage";
import LineWorkerProductsPage from "./assets/pages/LineWorkerProductsPage.tsx";
import CreateMealPage from "./assets/pages/CreateMealPage";
import MealsCatalogPage from "./assets/pages/MealsCatalogPage";
import LoginPage from "./assets/pages/LoginPage";
import ChangePasswordPage from "./assets/pages/ChangePasswordPage";
import AdminPage from "./assets/pages/AdminPage";

const App = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <>
      <SideMenu isOpen={isSideMenuOpen} setIsOpen={setIsSideMenuOpen} />
      <main className="transition-all duration-300">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Authenticated — must change password first */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute skipPasswordCheck>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />

          {/* Dietitian + Admin */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["admin", "dietitian"]}>
                <ProductsPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["admin", "dietitian"]}>
                <ProductSettingsPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/categories"
            element={
              <ProtectedRoute allowedRoles={["admin", "dietitian"]}>
                <CategorySettingsPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute allowedRoles={["admin", "dietitian", "lineworker"]}>
                <MealsCatalogPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "dietitian"]}>
                <CreateMealPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />

          {/* Lineworker + Admin */}
          <Route
            path="/lineworker"
            element={
              <ProtectedRoute allowedRoles={["admin", "lineworker"]}>
                <LineWorkerProductsPage setIsSideMenuOpen={setIsSideMenuOpen} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
};

export default App;

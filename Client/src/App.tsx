import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SideMenu from "./components/layout/SideMenu";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ProductsPage from "./pages/ProductsPage";
import ProductSettingsPage from "./pages/ProductSettingsPage";
import LineWorkerProductsPage from "./pages/LineWorkerProductsPage";
import CreateMealPage from "./pages/CreateMealPage";
import MealsCatalogPage from "./pages/MealsCatalogPage";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminPage from "./pages/AdminPage";

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
            // Deprecated, rout is active but button removed from menu -Tomer
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

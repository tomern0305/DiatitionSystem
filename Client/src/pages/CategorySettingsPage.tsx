import React from "react";
import TopBar from "../components/layout/TopBar";
import CategoriesTableSection from "../components/settings/CategoriesTableSection";
import SensitivitiesTableSection from "../components/settings/SensitivitiesTableSection";
import TexturesTableSection from "../components/settings/TexturesTableSection";
import DietsTableSection from "../components/settings/DietsTableSection";

interface CategorySettingsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategorySettingsPage = ({
  setIsSideMenuOpen,
}: CategorySettingsPageProps) => {
  return (
    <div
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans"
      dir="rtl"
    >
      <div className="w-full mx-auto space-y-10">
        <TopBar setIsSideMenuOpen={setIsSideMenuOpen} title="ניהול משתנים" />

        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 items-start">
            <CategoriesTableSection />
            <SensitivitiesTableSection />
            <TexturesTableSection />
            <DietsTableSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsPage;

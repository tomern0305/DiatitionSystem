import { Link } from "react-router-dom";

interface SideMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideMenu = ({ isOpen, setIsOpen }: SideMenuProps) => {
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      {/* Side Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-[260px] bg-white text-gray-800 transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] p-6 shadow-2xl z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-extrabold text-gray-900 m-0">תפריט</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <ul className="list-none p-0 flex flex-col gap-2">
          <li>
            <Link
              to="/"
              onClick={toggleMenu}
              className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-gray-700 bg-gray-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
              קטלוג מוצרים
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              onClick={toggleMenu}
              className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-gray-700 bg-gray-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path
                  fillRule="evenodd"
                  d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c-.071-.157-.137-.316-.198-.478a.798.798 0 0 1 .608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.092-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              ניהול מוצרים
            </Link>
          </li>
          <li>
            <Link
              to="/settings/categories"
              onClick={toggleMenu}
              className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-gray-700 bg-gray-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.75.75h-9a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75Zm0-3.75a.75.75 0 0 1-.75.75h-9a.75.75 0 0 1 0-1.5h9a.75.75 0 0 1 .75.75Zm-9 8.25a.75.75 0 1 0 0-1.5h9a.75.75 0 1 0 0 1.5h-9Z"
                  clipRule="evenodd"
                />
              </svg>
              ניהול משתנים
            </Link>
          </li>
          <li>
            <Link
              to="/lineworker"
              onClick={toggleMenu}
              className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-gray-700 bg-gray-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v2.813l-1.5.375a5.625 5.625 0 0 0-11.25 0l-1.5-.375v-2.813ZM16.946 19.125a6.621 6.621 0 0 1-5.118-2.58A6.375 6.375 0 0 0 18.75 12a10.875 10.875 0 0 1 2.946 5.86v3.25l-4.75-.487v-1.5Z" />
              </svg>
              עובד פס
            </Link>
          </li>
          <li>
            <Link
              to="/meals"
              onClick={toggleMenu}
              className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-gray-700 bg-gray-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
              קטלוג ארוחות
            </Link>
          </li>
          <li>
            <Link
              to="/meals/create"
              onClick={toggleMenu}
              className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-all font-semibold text-gray-700 bg-gray-50/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-gray-700"
              >
                <path
                  fillRule="evenodd"
                  d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              הרכבת ארוחה
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default SideMenu;

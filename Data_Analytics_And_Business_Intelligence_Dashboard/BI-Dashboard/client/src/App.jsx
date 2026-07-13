import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Import from "./pages/Import";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("bi-dark-mode") === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("bi-dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen">
      <Sidebar darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
      <main className="flex-1 p-6 lg:p-8 max-w-[1400px]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/import" element={<Import />} />
        </Routes>
      </main>
    </div>
  );
}

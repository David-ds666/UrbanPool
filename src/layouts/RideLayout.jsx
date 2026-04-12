import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar/Navbar";
import Sidebar from "../components/common/Sidebar/Sidebar";

export default function RideLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Outlet />
    </>
  );
}
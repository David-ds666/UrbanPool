import { useState } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "../components/common/Navbar/Navbar"
import Footer from "../components/common/Footer/Footer"
import ChatBot from "../components/common/ChatBot/ChatBot"
import Sidebar from "../components/common/Sidebar/Sidebar"

function PublicLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />
      <Outlet />
      <Footer />
      <ChatBot />
    </>
  )
}

export default PublicLayout
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from './pages/Home';
import Login from './pages/Login';
import PostDetail from './pages/PostDetail';
import {FaBars } from "react-icons/fa"; 


function App() {
  const [isSidebarOpen, setSidebaropen] = useState(false);

  const toggleSidebar = () => setSidebaropen((prev) => !prev);

  return (
    <Router>
      <button className="hamburger-fixed"
      onClick={toggleSidebar}>
        <FaBars size={24}/>
      </button>
        <div style={{display:"flex",flexDirection: "column",height: "100vh"}}>
          <Header toggleSidebar={toggleSidebar}  />
          <div style={{ display: "flex", flex:1 }}>
            <Sidebar isOpen={isSidebarOpen} toggleMenu={toggleSidebar} />
            <main style={{flex: 1, padding: "1rem"}}>
           <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/post/:id" element={<PostDetail />} />
            </Routes>
            </main>
          </div>
        </div>
        
    </Router>
  );
}

export default App;

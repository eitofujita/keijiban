import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Login from "./components/Login";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import type { User } from "firebase/auth";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import CreateCommunity from "./pages/CreateCommunity"; 
import ManageCommunities from "./pages/ManageComunities";
import CommunityPage from "./pages/CommunityPage";
import CreatePostPage from "./pages/CreatePostPage";


const darkishTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#1c1c1c",
      paper: "#2c2c2c",
    },
    text: {
      primary: "#ffffff",
      secondary: "#bbbbbb",
    },
    primary: {
      main: "#4dabf5",
    },
    secondary: {
      main: "#f50057",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          fontWeight: "bold",
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  const [isSidebarOpen, setSidebaropen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const toggleSidebar = () => setSidebaropen((prev) => !prev);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (User) => {
      setUser(User);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={darkishTheme}>
      <CssBaseline />
      <Router>
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Header toggleSidebar={toggleSidebar} user={user} />
          <div style={{ display: "flex", flex: 1 }}>
            <Sidebar isOpen={isSidebarOpen} toggleMenu={toggleSidebar} />
            <main style={{ flex: 1, padding: "1rem" }}>
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/create" element={<Create />} />
                 <Route path="/create-community" element={<CreateCommunity />} />
                 <Route path="/manage-communities" element={<ManageCommunities />} />
                 <Route path="/r/:slug" element={<CommunityPage />} />
                 <Route path="/r/:slug/create-post" element={<CreatePostPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

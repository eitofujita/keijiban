import { Link } from "react-router-dom"
import "./Sidebar.css";

interface Props{
    isOpen: boolean;
    toggleMenu: () => void;
}

export default function Sidebar({ isOpen, toggleMenu }: Props) 

 {
    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="hamburger" onClick={toggleMenu}>
                ☰
            </button>
            <nav className="nav">
                <ul>
                    <li><Link to="/"> Home </Link></li>
                    <li><Link to="/login"> login </Link></li>
                </ul>
            </nav>
        </aside>
    );
}
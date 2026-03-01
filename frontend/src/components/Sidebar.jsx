import { useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, Layers, Settings } from "lucide-react"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const btnStyle = { border: "none", background: "none", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", cursor: "pointer", margin: "2px auto" }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">S</div>
      <nav className="sidebar-nav">
        <button onClick={() => navigate("/dashboard")} style={{ ...btnStyle, background: location.pathname === "/dashboard" ? "#d1fae5" : "none", color: location.pathname === "/dashboard" ? "#10b981" : "#6b7280" }}>
          <LayoutDashboard size={18} />
        </button>
        <button onClick={() => navigate("/inventory")} style={{ ...btnStyle, background: location.pathname === "/inventory" ? "#d1fae5" : "none", color: location.pathname === "/inventory" ? "#10b981" : "#6b7280" }}>
          <Layers size={18} />
        </button>
      </nav>
      <div className="sidebar-bottom">
        <button style={{ ...btnStyle, color: "#6b7280" }}><Settings size={18} /></button>
      </div>
    </div>
  )
}
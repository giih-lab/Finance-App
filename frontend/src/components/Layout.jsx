import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../styles/layout.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Layout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        {/* Usuário fictício igual ao print */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">A</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Ana Oliveira</div>
            <div className="sidebar-user-email">ana.oliveira@email.com</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-icon">▦</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-icon">▤</span>
            <span>Transações</span>
          </NavLink>

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-icon">◎</span>
            <span>Orçamentos</span>
          </NavLink>

          <NavLink
            to="/accounts"
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <span className="sidebar-icon">▣</span>
            <span>Contas</span>
          </NavLink>
        </nav>



        <button
  type="button"
  className="sidebar-cta"
  onClick={() => window.dispatchEvent(new Event("open-budget-modal"))}
>
  Criar Novo Orçamento
</button>


        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-footer-link"
            onClick={handleLogout}
          >
            ⤾ <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

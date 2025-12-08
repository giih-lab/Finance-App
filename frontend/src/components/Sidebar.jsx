import { NavLink } from "react-router-dom";
import {
  PieChartOutlined,
  SwapOutlined,
  WalletOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import "../styles/layout.css";

export default function Sidebar() {
  const getLinkClass = ({ isActive }) =>
    "sidebar-link" + (isActive ? " active" : "");

  return (
    <aside className="sidebar">

      <h2 className="logo">
        💰 <span>FinanceApp</span>
      </h2>

      <nav>
        <NavLink to="/" end className={getLinkClass}>
          <PieChartOutlined />
          Dashboard
        </NavLink>

        <NavLink to="/transaction" className={getLinkClass}>
          <SwapOutlined />
          Transações
        </NavLink>

        <NavLink to="/budgets" className={getLinkClass}>
          <ProfileOutlined />
          Orçamentos
        </NavLink>

        <NavLink to="/accounts" className={getLinkClass}>
          <WalletOutlined />
          Contas
        </NavLink>
      </nav>
    </aside>
  );
}

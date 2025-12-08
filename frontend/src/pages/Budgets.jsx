import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";
import BudgetModal from "../components/BudgetModal";

import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Button,
  Progress,
  Space,
  message,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [statusFilter, setStatusFilter] = useState("all");

  const [periodType, setPeriodType] = useState("monthly");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
  function openModal() {
    setModalOpen(true);
  }

  window.addEventListener("open-budget-modal", openModal);
  return () => window.removeEventListener("open-budget-modal", openModal);
}, []);

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatMonthLabel(date, type) {
    const d = new Date(date);
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    if (type === "yearly") {
      return d.getFullYear();
    }

    const month = meses[d.getMonth()];
    const year = d.getFullYear();
    return `${month} ${year}`;
  }

  function changeMonth(direction) {
    const d = new Date(currentDate);
    if (periodType === "yearly") {
      d.setFullYear(d.getFullYear() + direction);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setCurrentDate(d);
  }

  async function loadBudgets() {
    try {
      const resp = await api.get("/budgets");
      setBudgets(resp.data || []);
    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar orçamentos.");
    }
  }

  useEffect(() => {
    loadBudgets();
  }, []);

  const totalBudgeted = useMemo(
    () => budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0),
    [budgets]
  );

  const totalSpent = useMemo(
    () => budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0),
    [budgets]
  );

  const totalRemaining = useMemo(
    () => totalBudgeted - totalSpent,
    [totalBudgeted, totalSpent]
  );

  function getStatusByPercent(percent) {
    if (percent >= 100) return "exceeded";
    if (percent >= 70) return "warning";
    return "ok";
  }

  function getStatusLabel(status) {
    if (status === "ok") return "Em dia";
    if (status === "warning") return "Atenção";
    if (status === "exceeded") return "Excedido";
    return "";
  }

  function getStatusColor(status) {
    if (status === "ok") return "#16a34a";
    if (status === "warning") return "#f59e0b";
    if (status === "exceeded") return "#ef4444";
    return "#6b7280";
  }

  function getCardBackground(status) {
    if (status === "ok") return "#ecfdf3";
    if (status === "warning") return "#fffbeb";
    if (status === "exceeded") return "#fef2f2";
    return "#ffffff";
  }

  function getCardBorder(status) {
    if (status === "ok") return "#bbf7d0";
    if (status === "warning") return "#fed7aa";
    if (status === "exceeded") return "#fecaca";
    return "#e5e7eb";
  }

  const displayBudgets = useMemo(() => {
    let list = budgets.map((b) => {
      const amount = Number(b.amount || 0);
      const spent = Number(b.spent || 0);
      const remaining = amount - spent;
      const percent = amount > 0 ? Math.round((spent / amount) * 100) : 0;
      const status = getStatusByPercent(percent);

      return {
        ...b,
        _amount: amount,
        _spent: spent,
        _remaining: remaining,
        _percent: percent,
        _status: status,
      };
    });

    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (b) =>
          (b.name && b.name.toLowerCase().includes(term)) ||
          (b.category_name &&
            b.category_name.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((b) => b._status === statusFilter);
    }

    if (sortBy === "name") {
      list = list.sort((a, b) =>
        (a.name || a.category_name || "").localeCompare(
          b.name || b.category_name || ""
        )
      );
    } else if (sortBy === "remaining") {
      list = list.sort((a, b) => b._remaining - a._remaining);
    } else if (sortBy === "spent") {
      list = list.sort((a, b) => b._spent - a._spent);
    }

    return list;
  }, [budgets, search, sortBy, statusFilter]);

  function handleOpenModal() {
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Cabeçalho */}
      <Row
        justify="space-between"
        align="top"
        style={{ marginBottom: 24, rowGap: 16 }}
      >
        <Col flex="auto">
          <Title level={2} style={{ marginBottom: 4 }}>
            Orçamentos
          </Title>
          <Text type="secondary">
            Acompanhe e gerencie seus orçamentos para um melhor controle
            financeiro.
          </Text>
        </Col>

        <Col>
          <Space wrap>
            <Select
              value={periodType}
              onChange={setPeriodType}
              style={{ minWidth: 120 }}
              size="middle"
            >
              <Option value="monthly">Mensal</Option>
              <Option value="yearly">Anual</Option>
              <Option value="weekly">Semanal</Option>
            </Select>

            <Space>
              <Button
                size="middle"
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => changeMonth(-1)}
              />
              <Text style={{ minWidth: 120, textAlign: "center" }}>
                {formatMonthLabel(currentDate, periodType)}
              </Text>
              <Button
                size="middle"
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => changeMonth(1)}
              />
            </Space>
          </Space>
        </Col>
      </Row>

      {/* Cards superiores */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card
            bordered
            style={{
              borderRadius: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Text type="secondary" style={{ fontSize: 15 }}>
              Total Gasto
            </Text>
            <div style={{ marginTop: 6, fontSize: 32, fontWeight: 700 }}>
              {formatCurrency(totalSpent)}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            bordered
            style={{
              borderRadius: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Text type="secondary" style={{ fontSize: 15 }}>
              Total Orçado
            </Text>
            <div style={{ marginTop: 6, fontSize: 32, fontWeight: 700 }}>
              {formatCurrency(totalBudgeted)}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            bordered
            style={{
              borderRadius: 20,
              boxShadow: "0 8px 20px rgba(16,185,129,0.1)",
              background: "#f0fdf4",
              borderColor: "#a7f3d0",
            }}
          >
            <Text type="secondary" style={{ fontSize: 15 }}>
              Valor Restante
            </Text>
            <div
              style={{
                marginTop: 6,
                fontSize: 32,
                fontWeight: 700,
                color: "#22c55e",
              }}
            >
              {formatCurrency(totalRemaining)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Row
        gutter={[16, 16]}
        align="middle"
        style={{ marginBottom: 24, flexWrap: "wrap" }}
      >
        <Col flex="auto">
          <Input
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
          />
        </Col>

        <Col>
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ minWidth: 200 }}
          >
            <Option value="default">Padrão</Option>
            <Option value="remaining">Mais saldo restante</Option>
            <Option value="spent">Mais gasto</Option>
            <Option value="name">Nome (A-Z)</Option>
          </Select>
        </Col>

        <Col>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ minWidth: 170 }}
          >
            <Option value="all">Todos</Option>
            <Option value="ok">Em dia</Option>
            <Option value="warning">Atenção</Option>
            <Option value="exceeded">Excedidos</Option>
          </Select>
        </Col>
      </Row>

      {/* Cards de orçamento */}
      {displayBudgets.length === 0 && (
        <Card>
          <Text type="secondary">
            Nenhum orçamento encontrado com os filtros atuais.
          </Text>
        </Card>
      )}

      {displayBudgets.length > 0 && (
        <Row
          gutter={[16, 16]}
          style={{ width: "100%" }}
          align="stretch"
        >
          {displayBudgets.map((b) => {
            const status = b._status;
            const statusLabel = getStatusLabel(status);
            const statusColor = getStatusColor(status);

            const amount = b._amount;
            const spent = b._spent;
            const remaining = b._remaining;
            const percent = b._percent > 999 ? 999 : b._percent;
            const isExceeded = status === "exceeded";

            const frequency = b.frequency || "Mensal";

            return (
              <Col
                key={b.id}
                xs={24}
                sm={12}
                md={8}
                lg={6} // 4 cards por linha em telas grandes
              >
                <Card
                  bordered
                  style={{
                    borderRadius: 14,
                    borderColor: getCardBorder(status),
                    background: getCardBackground(status),
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    height: "100%",
                  }}
                  bodyStyle={{ display: "flex", flexDirection: "column", gap: 8 }}
                  hoverable
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 18,
                          marginBottom: 2,
                        }}
                      >
                        {b.category_name || b.name}
                      </div>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {frequency}
                      </Text>
                    </div>

                    <Space size={6} align="center">
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "999px",
                          backgroundColor: statusColor,
                          display: "inline-block",
                        }}
                      />
                      <Text
                        style={{
                          color: statusColor,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {statusLabel}
                      </Text>
                    </Space>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 4,
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>
                      Gasto: {formatCurrency(spent)}
                    </Text>
                    <Text style={{ fontSize: 12 }}>
                      de {formatCurrency(amount)}
                    </Text>
                  </div>

                  <div style={{ marginTop: 4 }}>
                    <Progress
                      percent={percent > 100 ? 100 : percent}
                      showInfo={false}
                      strokeColor={statusColor}
                      trailColor="#e5e7eb"
                      strokeWidth={10}
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  <div style={{ marginTop: 4 }}>
                    {isExceeded ? (
                      <Text
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          color: "#b91c1c",
                        }}
                      >
                        - {formatCurrency(Math.abs(remaining))}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: 14,
                            marginLeft: 4,
                          }}
                        >
                          Excedido
                        </span>
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                        }}
                      >
                        {formatCurrency(remaining)}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            fontSize: 14,
                            color: "#6b7280",
                            marginLeft: 4,
                          }}
                        >
                          Restantes
                        </span>
                      </Text>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <BudgetModal
        open={modalOpen}
        onClose={handleCloseModal}
        onCreated={loadBudgets}
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Table,
  Space,
  Button,
  Popconfirm,
  message,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    category_expenses: [],
  });

  const [transactions, setTransactions] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  // período padrão = mês atual
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const defaultTo = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const from = defaultFrom;
  const to = defaultTo;

  async function loadData() {
    try {
      const [summaryResp, txResp] = await Promise.all([
        api.get("/dashboard/summary", { params: { from, to } }),
        api.get("/transactions", { params: { from, to } }),
      ]);

      const summaryData = summaryResp.data || {};
      const tx = txResp.data || [];

      setSummary(summaryData);
      setTransactions(tx);
      setDailyData(buildDailyData(tx));
    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar dados do dashboard.");
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const balance =
    Number(summary.total_income || 0) - Number(summary.total_expense || 0);

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const pieData = (summary.category_expenses || []).map((c) => ({
    name: c.name || "Sem categoria",
    value: Number(c.total || 0),
  }));

  const COLORS = [
    "#008cff",
    "#0ea5e9",
    "#22c55e",
    "#f97316",
    "#e11d48",
    "#8b5cf6",
  ];

  async function handleDeleteTransaction(id) {
    try {
      await api.delete(`/transactions/${id}`);
      message.success("Transação excluída com sucesso!");
      await loadData();
    } catch (err) {
      console.error(err);
      message.error("Erro ao excluir transação.");
    }
  }

  function handleEditTransaction(record) {
    // aqui depois a gente pode abrir um modal de edição bonitão
    console.log("Editar transação:", record);
    message.info("Edição de transação ainda não implementada aqui 😉");
  }

  const columns = [
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString("pt-BR") : "-",
    },
    {
      title: "Descrição",
      dataIndex: "description",
      key: "description",
      render: (value) => value || "-",
    },
    {
      title: "Categoria",
      dataIndex: "category_name",
      key: "category_name",
      render: (value) => value || "-",
    },
    {
      title: "Conta",
      dataIndex: "account_name",
      key: "account_name",
      render: (value) => value || "-",
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      render: (value) =>
        value === "INCOME" ? (
          <Text style={{ color: "#16a34a", fontWeight: 600 }}>Receita</Text>
        ) : (
          <Text style={{ color: "#dc2626", fontWeight: 600 }}>Despesa</Text>
        ),
    },
    {
      title: "Valor",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Ações",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="small">
          <Button size="small" type="link" onClick={() => handleEditTransaction(record)}>
            Editar
          </Button>
          <Popconfirm
            title="Excluir transação"
            description="Tem certeza que deseja excluir esta transação?"
            okText="Sim"
            cancelText="Cancelar"
            onConfirm={() => handleDeleteTransaction(record.id)}
          >
            <Button danger size="small" type="link">
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tableData = transactions.slice(0, 6).map((t) => ({
    ...t,
    key: t.id,
  }));

  return (
    <div style={{ width: "100%" }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          Resumo financeiro
        </Title>
        <Text type="secondary">
          Acompanhe seu saldo, receitas e despesas do mês atual.
        </Text>
      </div>

      {/* Cards superiores */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary">Saldo atual</Text>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#008cff",
                marginTop: 6,
              }}
            >
              {formatCurrency(balance)}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Receitas - despesas do período
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary">Receitas</Text>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#16a34a",
                marginTop: 6,
              }}
            >
              {formatCurrency(summary.total_income)}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Entradas no mês
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary">Despesas</Text>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#dc2626",
                marginTop: 6,
              }}
            >
              {formatCurrency(summary.total_expense)}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Saídas no mês
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* Pizza por categoria */}
        <Col xs={24} md={8}>
          <Card style={{ height: "100%" }}>
            <div style={{ marginBottom: 4 }}>
              <Text strong>Despesas por categoria</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Distribuição das despesas no período
            </Text>

            <div style={{ width: "100%", height: 260, marginTop: 8 }}>
              {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
                <Text type="secondary">
                  Ainda não há despesas no período.
                </Text>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>

        {/* Barras evolução diária */}
        <Col xs={24} md={16}>
          <Card style={{ height: "100%" }}>
            <div style={{ marginBottom: 4 }}>
              <Text strong>Evolução diária</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Receitas x despesas ao longo do mês
            </Text>

            <div style={{ width: "100%", height: 260, marginTop: 8 }}>
              {dailyData.length === 0 ? (
                <Text type="secondary">
                  Ainda não há movimentações no período.
                </Text>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={dailyData}>
                    <XAxis dataKey="dateLabel" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => `Dia: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Receitas" fill="#22c55e" />
                    <Bar dataKey="expense" name="Despesas" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabela de transações recentes */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <Text strong>Transações recentes</Text>
          <Tag color="default">
            {transactions.length} movimentações no mês
          </Tag>
        </div>

        <Table
          size="small"
          columns={columns}
          dataSource={tableData}
          pagination={false}
          locale={{
            emptyText: "Nenhuma transação encontrada no período.",
          }}
        />
      </Card>
    </div>
  );
}

/* --------- helpers ---------- */

function buildDailyData(transactions) {
  const map = {};

  transactions.forEach((t) => {
    if (!t.date) return;
    const key = t.date.slice(0, 10);
    if (!map[key]) {
      map[key] = {
        dateKey: key,
        income: 0,
        expense: 0,
      };
    }

    const amount = Number(t.amount || 0);
    if (t.type === "INCOME") {
      map[key].income += amount;
    } else if (t.type === "EXPENSE") {
      map[key].expense += amount;
    }
  });

  return Object.values(map)
    .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey))
    .map((d) => ({
      ...d,
      dateLabel: new Date(d.dateKey).toLocaleDateString("pt-BR"),
    }));
}

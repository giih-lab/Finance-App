import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api/api";

import {
  Row,
  Col,
  Card,
  Typography,
  InputNumber,
  Input,
  Select,
  DatePicker,
  Upload,
  Switch,
  Button,
  Space,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import "../styles/transactions.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

export default function Transactions() {
  const [type, setType] = useState("EXPENSE"); // EXPENSE | INCOME
  const [amount, setAmount] = useState(null);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(dayjs());
  const [recurring, setRecurring] = useState(false);

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [catResp, accResp] = await Promise.all([
          api.get("/categories"),
          api.get("/accounts"),
        ]);

        setCategories(catResp.data || []);
        setAccounts(accResp.data || []);
      } catch (err) {
        console.error(err);
        message.error("Erro ao carregar categorias/contas.");
      }
    }

    load();
  }, []);

  function resetForm() {
    setAmount(null);
    setDescription("");
    setCategoryId("");
    setAccountId("");
    setDate(dayjs());
    setRecurring(false);
    setType("EXPENSE");
  }

  async function handleSubmit() {
    if (!amount || !categoryId || !accountId || !date) {
      message.warning("Preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/transactions", {
        amount: Number(amount),
        description,
        type,
        category_id: categoryId,
        account_id: accountId,
        date: date.format("YYYY-MM-DD"),
      });

      message.success("Transação lançada com sucesso!");
      resetForm();
    } catch (err) {
      console.error(err);
      message.error("Erro ao salvar transação.");
    } finally {
      setSaving(false);
    }
  }

  // filtra categorias por tipo; se não tiver nenhuma, usa todas
  const filteredCategories = (() => {
    const list = categories.filter((c) => !c.type || c.type === type);
    return list.length > 0 ? list : categories;
  })();

  return (
    <div className="tx-page">
      {/* título mais próximo do topo */}
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Col span={24}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Lançar Transação
          </Title>
          <Text type="secondary">
            Adicione uma nova despesa ou receita de forma rápida e fácil.
          </Text>
        </Col>
      </Row>

      {/* card central */}
      <Row justify="center">
        <Col xs={24} lg={18} xl={14}>
          <Card className="tx-card" bodyStyle={{ padding: 24 }}>
            {/* Toggle Despesa / Receita */}
            <div className="tx-type-toggle">
              <button
                type="button"
                className={
                  "tx-toggle-btn left " +
                  (type === "EXPENSE" ? "active-expense" : "inactive")
                }
                onClick={() => {
                  setType("EXPENSE");
                  setCategoryId(""); // limpa categoria ao trocar
                }}
              >
                ↓ Despesa
              </button>

              <button
                type="button"
                className={
                  "tx-toggle-btn right " +
                  (type === "INCOME" ? "active-income" : "inactive")
                }
                onClick={() => {
                  setType("INCOME");
                  setCategoryId(""); // limpa categoria ao trocar
                }}
              >
                ↑ Receita
              </button>
            </div>

            {/* Valor + Descrição */}
            <Row gutter={16} style={{ marginBottom: 16, marginTop: 16 }}>
              <Col xs={24} md={8}>
                <Text strong>* Valor</Text>
                <InputNumber
                  style={{ width: "100%", marginTop: 4 }}
                  prefix="R$"
                  min={0}
                  step={0.01}
                  value={amount}
                  onChange={setAmount}
                  placeholder="0,00"
                />
              </Col>
              <Col xs={24} md={16}>
                <Text strong>* Descrição</Text>
                <Input
                  style={{ marginTop: 4 }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Almoço no restaurante"
                />
              </Col>
            </Row>

            {/* Categoria */}
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Text strong>* Categoria</Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  value={categoryId || undefined}
                  onChange={setCategoryId}
                  placeholder="Selecione uma categoria"
                  showSearch
                  optionFilterProp="children"
                >
                  {filteredCategories.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {/* Conta + Data */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={12}>
                <Text strong>* Conta</Text>
                <Select
                  style={{ width: "100%", marginTop: 4 }}
                  value={accountId || undefined}
                  onChange={setAccountId}
                  placeholder="Selecione uma conta"
                  showSearch
                  optionFilterProp="children"
                >
                  {accounts.map((acc) => (
                    <Option key={acc.id} value={acc.id}>
                      {acc.name}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={12}>
                <Text strong>* Data</Text>
                <DatePicker
                  style={{ width: "100%", marginTop: 4 }}
                  format="YYYY-MM-DD"
                  value={date}
                  onChange={(d) => setDate(d || dayjs())}
                />
              </Col>
            </Row>

            {/* Anexos */}
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Text strong>Anexos</Text>
                <Dragger style={{ marginTop: 8 }} multiple disabled>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Clique para enviar ou arraste e solte
                  </p>
                  <p className="ant-upload-hint">
                    PNG, JPG ou PDF (MAX. 5MB) — apenas visual por enquanto.
                  </p>
                </Dragger>
              </Col>
            </Row>

            {/* Recorrente + botões */}
            <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
              <Col xs={24} md={12}>
                <Space align="center">
                  <Switch checked={recurring} onChange={setRecurring} />
                  <div>
                    <Text strong>Marcar como transação recorrente</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Esta transação se repetirá mensalmente.
                    </Text>
                  </div>
                </Space>
              </Col>

              <Col
                xs={24}
                md={12}
                style={{ marginTop: 12, textAlign: "right" }}
              >
                <Space>
                  <Button onClick={resetForm}>Cancelar</Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={saving}
                  >
                    Salvar Transação
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

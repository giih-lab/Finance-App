import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { api } from "../api/api";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  message,
} from "antd";

const { Text } = Typography;
const { Option } = Select;

export default function BudgetModal({ open, onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar categorias de despesa + período padrão (mês atual)
  useEffect(() => {
    if (!open) return;

    async function load() {
      try {
        const resp = await api.get("/categories");
        const expenseCats = (resp.data || []).filter(
          (c) => c.type === "EXPENSE"
        );
        setCategories(expenseCats);

        if (expenseCats.length > 0 && !categoryId) {
          setCategoryId(expenseCats[0].id);
          if (!name) {
            setName(`Orçamento ${expenseCats[0].name}`);
          }
        }

        // período padrão = mês atual
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const toISO = (d) => d.toISOString().slice(0, 10);
        if (!periodStart) setPeriodStart(toISO(start));
        if (!periodEnd) setPeriodEnd(toISO(end));
      } catch (err) {
        console.error(err);
        message.error("Erro ao carregar categorias.");
      }
    }

    load();
  }, [open]);

  // Atualiza nome quando troca categoria (se ainda não foi digitado nada manualmente)
  useEffect(() => {
    if (!categoryId || !categories.length) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (cat && (!name || name.startsWith("Orçamento "))) {
      setName(`Orçamento ${cat.name}`);
    }
  }, [categoryId, categories, name]);

  function handleClose() {
    setName("");
    setAmount("");
    setPeriodStart("");
    setPeriodEnd("");
    setCategoryId("");
    onClose();
  }

  async function handleSubmit() {
    if (!categoryId || !name || !amount || !periodStart || !periodEnd) {
      message.warning("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/budgets", {
        name,
        category_id: categoryId,
        amount: Number(amount),
        period_start: periodStart,
        period_end: periodEnd,
      });

      setLoading(false);
      onCreated && onCreated();
      handleClose();
      message.success("Orçamento criado com sucesso!");
    } catch (err) {
      console.error(err);
      setLoading(false);
      message.error("Erro ao criar orçamento.");
    }
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Novo orçamento"
      onOk={handleSubmit}
      okText={loading ? "Salvando..." : "Salvar"}
      okButtonProps={{ loading }}
      cancelText="Cancelar"
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Categoria"
              required
            >
              <Select
                placeholder="Selecione uma categoria"
                value={categoryId || undefined}
                onChange={setCategoryId}
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
              {categories.length === 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Cadastre categorias de despesa para usar orçamentos.
                </Text>
              )}
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Valor planejado"
              required
            >
              <Input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nome do orçamento"
          required
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mercado do mês, Lazer, Transporte..."
          />
        </Form.Item>

        <Text type="secondary" style={{ fontSize: 12 }}>
          Período
        </Text>

        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Início"
              required
            >
              <DatePicker
                style={{ width: "100%" }}
                value={periodStart ? dayjs(periodStart) : null}
                onChange={(_, dateString) => setPeriodStart(dateString)}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Fim"
              required
            >
              <DatePicker
                style={{ width: "100%" }}
                value={periodEnd ? dayjs(periodEnd) : null}
                onChange={(_, dateString) => setPeriodEnd(dateString)}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

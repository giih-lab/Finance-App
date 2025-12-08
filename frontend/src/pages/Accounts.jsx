import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import AccountModal from "../components/AccountModal";

import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Tag,
  Empty,
  Space,
  Modal,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function loadAccounts() {
    try {
      const resp = await api.get("/accounts");
      setAccounts(resp.data || []);
    } catch (err) {
      console.error(err);
      message.error("Erro ao carregar contas.");
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  function handleOpenCreate() {
    setEditingAccount(null);
    setModalOpen(true);
  }

  function handleOpenEdit(acc) {
    setEditingAccount(acc);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingAccount(null);
  }

  // chamada de exclusão com confirmação
  function handleDelete(acc) {
    confirm({
      title: "Excluir conta",
      content: `Tem certeza que deseja excluir a conta "${acc.name}"?`,
      okText: "Excluir",
      okType: "danger",
      cancelText: "Cancelar",
      async onOk() {
        try {
          await api.delete(`/accounts/${acc.id}`);
          message.success("Conta excluída com sucesso!");
          loadAccounts();
        } catch (err) {
          console.error(err);

          // tenta pegar mensagem que venha do back
          const apiMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            null;

          if (apiMessage) {
            message.error(apiMessage);
          } else {
            message.error(
              "Não foi possível excluir a conta. Verifique se ela não possui transações vinculadas."
            );
          }
        }
      },
    });
  }

  // só pra exibir uma tag visual baseada no nome
  function guessTag(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("carteira")) return "Carteira";
    if (
      n.includes("banco") ||
      n.includes("nubank") ||
      n.includes("inter") ||
      n.includes("caixa") ||
      n.includes("itau") ||
      n.includes("bradesco")
    )
      return "Banco";
    if (
      n.includes("inv") ||
      n.includes("fundo") ||
      n.includes("tesouro") ||
      n.includes("renda")
    )
      return "Investimento";
    return "Conta";
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 24, rowGap: 12 }}
      >
        <Col>
          <Title level={3} style={{ marginBottom: 4 }}>
            Contas
          </Title>
          <Text type="secondary">
            Visualize e gerencie suas contas bancárias, cartões e investimentos.
          </Text>
        </Col>

        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Adicionar conta
          </Button>
        </Col>
      </Row>

      {/* Sem contas */}
      {accounts.length === 0 && (
        <Card>
          <Empty
            description={
              <span>
                Você ainda não possui contas cadastradas. Clique em{" "}
                <strong>“Adicionar conta”</strong> para criar a primeira.
              </span>
            }
          />
        </Card>
      )}

      {/* Cards de contas */}
      {accounts.length > 0 && (
        <Row gutter={[16, 16]}>
          {accounts.map((acc) => {
            const current = acc.current_balance ?? acc.initial_balance ?? 0;
            const moved = acc.transactions_total ?? 0;

            return (
              <Col key={acc.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  style={{ height: "100%", borderRadius: 16 }}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                  extra={
                    <Space size={8}>
                      <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(acc)}
                      />
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(acc)}
                      />
                    </Space>
                  }
                >
                  <Row justify="space-between" align="top">
                    <Col>
                      <Text strong style={{ fontSize: 15 }}>
                        {acc.name}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Saldo atual
                      </Text>
                    </Col>
                    <Col>
                      <Tag color="blue">{guessTag(acc.name)}</Tag>
                    </Col>
                  </Row>

                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                    }}
                  >
                    {formatCurrency(current)}
                  </Text>

                  <Row justify="space-between" style={{ fontSize: 13 }}>
                    <Col>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Inicial:{" "}
                        <strong>
                          {formatCurrency(acc.initial_balance || 0)}
                        </strong>
                      </Text>
                    </Col>
                    <Col>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Movimentado:{" "}
                        <strong>{formatCurrency(moved)}</strong>
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <AccountModal
        open={modalOpen}
        onClose={handleCloseModal}
        onCreated={loadAccounts}
        account={editingAccount}
      />
    </div>
  );
}

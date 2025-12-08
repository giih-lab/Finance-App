import React, { useEffect, useState } from "react";
import { api } from "../api/api";
import { Modal, Form, Input, InputNumber, Button, message } from "antd";

export default function AccountModal({ open, onClose, onCreated, account }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEdit = !!account;

  // quando abrir para edição, preencher os campos
  useEffect(() => {
    if (open && account) {
      form.setFieldsValue({
        name: account.name,
        initialBalance: account.initial_balance ?? account.current_balance ?? 0,
      });
    }
    if (open && !account) {
      // modo criar: limpa e coloca saldo 0
      form.setFieldsValue({
        name: "",
        initialBalance: 0,
      });
    }
  }, [open, account, form]);

  function handleClose() {
    form.resetFields();
    onClose();
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        name: values.name,
        initial_balance: Number(values.initialBalance || 0),
      };

      if (isEdit) {
        await api.put(`/accounts/${account.id}`, payload);
        message.success("Conta atualizada com sucesso!");
      } else {
        await api.post("/accounts", payload);
        message.success("Conta criada com sucesso!");
      }

      setLoading(false);
      onCreated && onCreated();
      handleClose();
    } catch (err) {
      // se for erro de validação, só deixa o AntD mostrar
      if (!err?.errorFields) {
        console.error(err);
        message.error("Erro ao salvar conta.");
        setLoading(false);
      }
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? "Editar conta" : "Nova conta"}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {isEdit ? "Salvar alterações" : "Salvar"}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ initialBalance: 0 }}
      >
        <Form.Item
          label="Nome da conta"
          name="name"
          rules={[{ required: true, message: "Informe o nome da conta" }]}
        >
          <Input placeholder="Ex: Carteira, NuConta, Caixa, Investimentos..." />
        </Form.Item>

        <Form.Item label="Saldo inicial" name="initialBalance">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={0.01}
            placeholder="Ex: 1000.00"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Row, Col, Form, Input, Button, Typography, Card } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
  AppleFilled,
} from "@ant-design/icons";
import "../styles/login.css";
import loginImage from "../images/5206848.png";

const { Title, Text } = Typography;

export default function Login() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    try {
      setLoading(true);
      await login(values.email, values.password);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* ESQUERDA — Texto + Imagem */}
      <div className="login-left">
        <div className="login-logo">
          <span className="login-logo-icon">💰</span>
          <span className="login-logo-text">FinanceApp</span>
        </div>

        <div className="login-title-box">
          <h1>
            Seu futuro financeiro
            <br />
            começa aqui.
          </h1>
          <p>
            Tenha controle total sobre suas finanças com nossa
            plataforma segura e intuitiva.
          </p>
        </div>

        <img src={loginImage} alt="Finance" className="login-image" />
      </div>

      {/* DIREITA — Card de Login */}
      <div className="login-right">
        <Card className="login-card" bordered={false}>
          <Title level={3} style={{ marginBottom: 8 }}>
            Bem-vindo de volta!
          </Title>
          <Text type="secondary">
            Entre para acessar seu painel financeiro.
          </Text>

          <Form
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              label="E-mail ou nome de usuário"
              name="email"
              rules={[{ required: true, message: "Digite seu e-mail" }]}
            >
              <Input
                placeholder="Digite seu e-mail ou usuário"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Senha"
              name="password"
              rules={[{ required: true, message: "Digite sua senha" }]}
            >
              <Input.Password
                placeholder="Digite sua senha"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                size="large"
              />
            </Form.Item>

            <div style={{ textAlign: "right", marginTop: -8 }}>
              <button
                type="button"
                className="login-forgot"
              >
                Esqueci minha senha
              </button>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="login-button"
            >
              Entrar
            </Button>
          </Form>

          <div className="login-divider">
            <span>OU CONTINUE COM</span>
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Button icon={<GoogleOutlined />} block size="large">
                Google
              </Button>
            </Col>

            <Col span={12}>
              <Button icon={<AppleFilled />} block size="large">
                Apple
              </Button>
            </Col>
          </Row>

          <div className="login-register">
            Não tem uma conta? <a href="/register">Crie agora</a>
          </div>
        </Card>
      </div>
    </div>
  );
}
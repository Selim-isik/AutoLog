import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  ConfigProvider,
  theme,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";
import "./Register.css";

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);

    const finalValues = {
      ...values,
      role: "customer",
    };

    try {
      await api.post("/auth/register", finalValues);
      message.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      message.error("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: isDarkMode ? "#000000" : "#f0f2f5",
          transition: "background-color 0.3s ease",
        }}
      >
        <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Title level={2} style={{ color: "#1890ff" }}>
              <ToolOutlined /> AutoLog
            </Title>
            <Text type="secondary">Create a new account</Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Invalid email!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Register
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              Already have an account? <Link to="/login">Login now!</Link>
            </div>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default Register;

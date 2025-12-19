import { useState } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post("/auth/request-reset-token", values);
      message.success("Password reset link has been sent to your email!");
    } catch (error) {
      message.error(
        error.response?.data?.message || "User not found or system error."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: isDarkMode ? "#141414" : "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Title level={3}>Forgot Password?</Title>
          <Text type="secondary">
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          size="large"
          style={{ marginTop: "24px" }}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email address" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ height: "45px" }}
          >
            Send Reset Link
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link
            to="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <ArrowLeftOutlined /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;

import { useState } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

const { Title } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const token = searchParams.get("token");

  const onFinish = async (values) => {
    if (!token) return message.error("Invalid or missing token!");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
      });
      message.success("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      message.error("Link expired or invalid. Please request a new one.");
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
      <Card style={{ width: 400, borderRadius: "12px" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Set New Password
        </Title>
        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              {
                required: true,
                min: 6,
                message: "Password must be at least 6 characters!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value)
                    return Promise.resolve();
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm New Password"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            style={{ height: "45px" }}
          >
            Reset Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;

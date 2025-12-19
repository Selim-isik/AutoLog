import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  ConfigProvider,
  theme,
} from "antd";
import { UserOutlined, LockOutlined, ToolOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", values);
      const { user, accessToken } = response.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.avatar) {
        localStorage.setItem("user_avatar", user.avatar);
      }

      message.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      message.error("Invalid email or password");
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
      <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
        <Row style={{ height: "100%" }}>
          <Col
            xs={0}
            md={14}
            style={{
              height: "100%",
              backgroundImage:
                "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
              }}
            >
              <ToolOutlined
                style={{ fontSize: "80px", marginBottom: "20px" }}
              />
              <Title
                level={1}
                style={{ color: "#fff", margin: 0, fontSize: "48px" }}
              >
                AutoLog
              </Title>
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "20px",
                  marginTop: "10px",
                }}
              >
                Professional Garage Management
              </Text>
            </div>
          </Col>

          <Col
            xs={24}
            md={10}
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDarkMode ? "#141414" : "#ffffff",
              transition: "background-color 0.3s ease",
            }}
          >
            <div style={{ width: "100%", maxWidth: "400px", padding: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <Title level={2} style={{ margin: 0 }}>
                  Welcome Back
                </Title>
                <Text type="secondary">
                  Please enter your details to sign in.
                </Text>
              </div>

              <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="example@email.com"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  style={{ marginBottom: "4px" }}
                  rules={[
                    { required: true, message: "Please enter your password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="••••••"
                  />
                </Form.Item>

                <div style={{ textAlign: "right", marginBottom: "16px" }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#1677ff",
                    }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Form.Item style={{ marginBottom: "12px" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    style={{ height: "50px", fontSize: "16px" }}
                  >
                    Log In
                  </Button>
                </Form.Item>

                <div style={{ textAlign: "center" }}>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{ fontWeight: "bold", color: "#1677ff" }}
                  >
                    Register Now
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default Login;

import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Avatar,
  Row,
  Col,
  Typography,
  Divider,
  Switch,
  Tag,
  Grid,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BulbOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useTheme } from "../../context/ThemeContext";
import "./Settings.css";

const { Title, Text } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const screens = useBreakpoint();

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [form] = Form.useForm();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {
      _id: "fake_id_123",
      name: "",
      email: "",
      role: "user",
      avatar: null,
    }
  );

  useEffect(() => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role ? user.role.toUpperCase() : "USER",
    });
    if (user.avatar) {
      setImageUrl(user.avatar);
    }
  }, [user, form]);

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      messageApi.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error("Image must be smaller than 2MB!");
    }
    return isJpgOrPng && isLt2M;
  };

  const handleChange = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImageUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);

    const userId = user._id || user.id;
    if (!userId) {
      messageApi.error("User ID not found. Cannot update.");
      setLoading(false);
      return;
    }

    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      messageApi.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      if (values.newPassword) {
        formData.append("password", values.newPassword);
      }

      const response = await api.put(`/users/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUserFromBackend = response.data.data;

      localStorage.setItem("user", JSON.stringify(updatedUserFromBackend));

      setUser(updatedUserFromBackend);
      window.dispatchEvent(new Event("storage"));

      if (values.newPassword) {
        form.setFieldsValue({
          newPassword: "",
          confirmPassword: "",
        });
      }

      messageApi.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        messageApi.error(
          "User not found (404). Please Logout and Login again."
        );
      } else {
        messageApi.error("Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = imageUrl || user.avatar;

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {contextHolder}

      <Content className="settings-container">
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            style={{ fontSize: "18px" }}
          />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Settings
            </Title>
            <Text type="secondary">Manage your profile and account</Text>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="settings-card profile-card">
              <div className="profile-header">
                <div className="avatar-wrapper">
                  <Avatar
                    size={100}
                    src={displayAvatar}
                    icon={!displayAvatar && <UserOutlined />}
                    className="profile-avatar"
                    style={{
                      backgroundColor: displayAvatar
                        ? "transparent"
                        : "#87d068",
                      border: "4px solid white",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      color: "white",
                    }}
                  />
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    customRequest={({ onSuccess }) => onSuccess("ok")}
                  >
                    <Button
                      shape="circle"
                      icon={<CameraOutlined />}
                      className="upload-btn-floating"
                      type="primary"
                    />
                  </Upload>
                </div>

                <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                  {user.name}
                </Title>
                <Tag color="blue">
                  {user.role ? user.role.toUpperCase() : "USER"}
                </Tag>
              </div>

              <Divider />

              <div className="preferences-section">
                <div className="preference-item">
                  <span>{screens.md && <BulbOutlined />} Dark Mode</span>
                  <Switch checked={isDarkMode} onChange={toggleTheme} />
                </div>
                <div className="preference-item">
                  <span>
                    <BellOutlined /> Notifications
                  </span>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="settings-card" title="Edit Profile">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="John Doe" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[{ required: true, type: "email" }]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="email@example.com"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Role">
                      <Input
                        prefix={<SafetyCertificateOutlined />}
                        disabled
                        value={user.role ? user.role.toUpperCase() : "USER"}
                        className="read-only-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider titlePlacement="left" plain>
                  <span style={{ fontSize: 14, color: "#999" }}>Security</span>
                </Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="New Password" name="newPassword">
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="********"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Confirm Password" name="confirmPassword">
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="********"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={loading}
                    style={{ minWidth: 140 }}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Settings;

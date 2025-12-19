import { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Menu,
  Card,
  Button,
  Row,
  Col,
  Spin,
  Typography,
  Avatar,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Dropdown,
  Statistic,
  theme,
  Popconfirm,
  Tag,
  Upload,
} from "antd";
import {
  CarOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  BarChartOutlined,
  BulbOutlined,
  BulbFilled,
  UploadOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "./Dashboard.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [fileList, setFileList] = useState([]);

  const { isDarkMode, toggleTheme } = useTheme();
  const {
    token: { colorBgContainer, colorBgLayout },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_avatar");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest",
    role: "Customer",
  };

  const isMechanic = user.role === "mechanic";

  useEffect(() => {
    const savedAvatar = localStorage.getItem("user_avatar");
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    } else if (user.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, []);

  const chartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const data = months.map((m) => ({ name: m, revenue: 0 }));

    cars.forEach((car) => {
      if (car.history && Array.isArray(car.history)) {
        car.history.forEach((h) => {
          const d = new Date(h.date);
          if (d.getFullYear() === new Date().getFullYear()) {
            const monthIndex = d.getMonth();
            data[monthIndex].revenue += h.price || 0;
          }
        });
      }
    });

    return data;
  }, [cars]);

  const fetchCars = async () => {
    try {
      const response = await api.get("/cars");
      const data = response.data.data.data || [];
      setCars(data);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        messageApi.error("Session expired. Please login again.");
        handleLogout();
      } else {
        messageApi.error("Failed to fetch cars.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        if (editingCar) {
          const formValues = { ...editingCar };

          if (formValues.image && typeof formValues.image === "string") {
            const initialFile = [
              {
                uid: "-1",
                name: "vehicle-image.png",
                status: "done",
                url: formValues.image,
              },
            ];
            setFileList(initialFile);
            formValues.image = initialFile;
          } else {
            setFileList([]);
            formValues.image = [];
          }

          form.setFieldsValue(formValues);
        } else {
          form.resetFields();
          setFileList([]);
        }
      }, 0);
    }
  }, [isModalOpen, editingCar, form]);

  const filteredCars = useMemo(() => {
    if (!searchText) return cars;
    const lowerText = searchText.toLowerCase();
    return cars.filter(
      (car) =>
        car.plate.toLowerCase().includes(lowerText) ||
        car.brand.toLowerCase().includes(lowerText) ||
        car.model.toLowerCase().includes(lowerText)
    );
  }, [searchText, cars]);

  const handleEdit = (car) => {
    setEditingCar(car);
    setIsModalOpen(true);
  };

  const handleDeleteCar = (carId) => {
    try {
      api.delete(`/cars/${carId}`).then(() => {
        messageApi.success("Vehicle deleted successfully!");
        fetchCars();
      });
    } catch (error) {
      messageApi.error("Failed to delete vehicle.");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("plate", values.plate);
      formData.append("brand", values.brand);
      formData.append("model", values.model);
      formData.append("year", values.year);

      if (values.status) {
        formData.append("status", values.status);
      }

      if (values.ownerId && values.ownerId.trim() !== "") {
        formData.append("ownerId", values.ownerId);
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (fileList.length === 0 && editingCar && editingCar.image) {
        formData.append("deleteImage", "true");
      }

      if (editingCar) {
        await api.patch(`/cars/${editingCar._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        messageApi.success("Vehicle successfully updated!");
      } else {
        await api.post("/cars", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        messageApi.success("Vehicle successfully added!");
      }

      setIsModalOpen(false);
      setEditingCar(null);
      fetchCars();
    } catch (error) {
      console.error(error);
      messageApi.error(`Error ${editingCar ? "updating" : "adding"} vehicle.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "in-service":
        return "#faad14";
      case "ready":
        return "#52c41a";
      case "delivered":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  const menuItems = [
    {
      key: "1",
      icon: <AppstoreOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    ...(isMechanic
      ? [
          {
            key: "2",
            icon: <UserOutlined />,
            label: "Customers",
            onClick: () => navigate("/customers"),
          },
        ]
      : []),
    {
      key: "3",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      key: "theme",
      icon: isDarkMode ? <BulbFilled /> : <BulbOutlined />,
      label: isDarkMode ? "Light Mode" : "Dark Mode",
      onClick: toggleTheme,
    },
    {
      key: "4",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const userMenu = [
    {
      key: "1",
      label: (
        <div style={{ padding: "4px 8px" }}>
          <Text strong>{user.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {user.role ? user.role.toUpperCase() : "USER"}
          </Text>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "theme_toggle",
      label: "Toggle Theme",
      icon: isDarkMode ? <BulbFilled /> : <BulbOutlined />,
      onClick: toggleTheme,
    },
    {
      key: "2",
      danger: true,
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {contextHolder}
      {!collapsed && (
        <div className="mobile-overlay" onClick={() => setCollapsed(true)} />
      )}

      <Sider
        width={250}
        theme={isDarkMode ? "dark" : "light"}
        breakpoint="lg"
        collapsedWidth="0"
        collapsible
        trigger={null}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="app-sider"
      >
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
            <CarOutlined /> AutoLog
          </Title>
          <Text type="secondary">Digital Car Service</Text>
        </div>

        <Menu
          theme={isDarkMode ? "dark" : "light"}
          mode="inline"
          defaultSelectedKeys={["1"]}
          selectedKeys={[location.pathname === "/customers" ? "2" : "1"]}
          items={menuItems}
          onClick={() => {
            if (window.innerWidth < 992) {
              setCollapsed(true);
            }
          }}
        />
      </Sider>

      <Layout style={{ background: colorBgLayout }}>
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: isDarkMode ? "1px solid #333" : "1px solid #f0f0f0",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
                display: window.innerWidth >= 992 ? "none" : "block",
                marginLeft: -24,
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Vehicle List
            </Title>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              className="theme-toggle-btn"
              shape="circle"
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
            />

            <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = isDarkMode
                    ? "rgba(255,255,255,0.1)"
                    : "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    lineHeight: "1.3",
                  }}
                >
                  <Text strong style={{ fontSize: "14px" }}>
                    {user.name}
                  </Text>
                  <Tag
                    color={user.role === "mechanic" ? "blue" : "green"}
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      lineHeight: "14px",
                      height: "16px",
                      padding: "0 6px",
                      border: "none",
                    }}
                  >
                    {user.role ? user.role.toUpperCase() : "GUEST"}
                  </Tag>
                </div>

                <Avatar
                  size="large"
                  src={avatarUrl}
                  style={{
                    backgroundColor:
                      user.role === "mechanic" ? "#1890ff" : "#52c41a",
                    verticalAlign: "middle",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                  icon={<UserOutlined />}
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: "12px", padding: 16, minHeight: 280 }}>
          {loading ? (
            <div style={{ textAlign: "center", marginTop: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={isMechanic ? 16 : 24}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card variant="borderless">
                        <Statistic
                          title="Total Vehicles"
                          value={cars.length}
                          prefix={<CarOutlined />}
                          styles={{ content: { color: "#3f8600" } }}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card variant="borderless">
                        <Statistic
                          title="In Service"
                          value={
                            cars.filter((c) => c.status === "in-service").length
                          }
                          prefix={<ToolOutlined />}
                          styles={{ content: { color: "#faad14" } }}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card variant="borderless">
                        <Statistic
                          title="Ready for Pickup"
                          value={
                            cars.filter((c) => c.status === "ready").length
                          }
                          prefix={<CheckCircleOutlined />}
                          styles={{ content: { color: "#52c41a" } }}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card variant="borderless">
                        <Statistic
                          title="Delivered"
                          value={
                            cars.filter((c) => c.status === "delivered").length
                          }
                          prefix={<ClockCircleOutlined />}
                          styles={{ content: { color: "#cf1322" } }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </Col>

                {isMechanic && (
                  <Col xs={24} lg={8}>
                    <Card
                      title={
                        <>
                          <BarChartOutlined /> {new Date().getFullYear()}{" "}
                          Revenue
                        </>
                      }
                      variant="borderless"
                      style={{ height: "100%" }}
                      styles={{ body: { padding: "10px 0 0 0" } }}
                    >
                      <div style={{ width: "100%", height: 180 }}>
                        <ResponsiveContainer>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="colorRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#1890ff"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#1890ff"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={isDarkMode ? "#444" : "#eee"}
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 12,
                                fill: isDarkMode ? "#aaa" : "#666",
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis hide />
                            <Tooltip
                              cursor={false}
                              contentStyle={{
                                borderRadius: 8,
                                border: "none",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                backgroundColor: isDarkMode ? "#333" : "#fff",
                                color: isDarkMode ? "#fff" : "#000",
                              }}
                              formatter={(value) => [`$${value}`, "Revenue"]}
                            />
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#1890ff"
                              fillOpacity={1}
                              fill="url(#colorRevenue)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Input
                  placeholder="Search by plate, brand or model..."
                  prefix={<SearchOutlined style={{ color: "#ccc" }} />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 320, height: 40, borderRadius: 8 }}
                  allowClear
                />

                {isMechanic && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => {
                      setEditingCar(null);
                      setIsModalOpen(true);
                    }}
                  >
                    Add New Vehicle
                  </Button>
                )}
              </div>

              <Row gutter={[24, 24]}>
                {filteredCars.map((car) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={car._id}>
                    <div
                      className="vehicle-card-container"
                      onClick={() => navigate(`/cars/${car._id}`)}
                    >
                      <div className="vehicle-image-wrapper">
                        <img
                          src={
                            car.image
                              ? car.image
                              : `https://cdn-icons-png.flaticon.com/512/3202/3202926.png`
                          }
                          alt={car.model}
                          className="vehicle-image"
                          style={{
                            objectFit: car.image ? "cover" : "contain",
                            padding: car.image ? "0" : "20px",
                            backgroundColor: car.image
                              ? "transparent"
                              : "#f0f2f5",
                          }}
                        />
                        <div className="vehicle-overlay"></div>

                        <div
                          className="status-badge"
                          style={{
                            color: getStatusColor(car.status),
                            borderColor: getStatusColor(car.status),
                          }}
                        >
                          <div
                            className="pulse-dot"
                            style={{
                              backgroundColor: getStatusColor(car.status),
                            }}
                          ></div>
                          {car.status?.toUpperCase().replace("-", " ")}
                        </div>
                      </div>

                      <div className="vehicle-info">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {car.year} Model
                            </Text>
                            <Title
                              level={4}
                              style={{
                                margin: 0,
                                color: isDarkMode ? "white" : "#333",
                              }}
                            >
                              {car.brand} {car.model}
                            </Title>
                          </div>
                        </div>

                        <div className="vehicle-plate">
                          {car.plate.toUpperCase()}
                        </div>

                        {isMechanic && (
                          <div className="vehicle-actions">
                            <button
                              className="action-btn edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(car);
                              }}
                            >
                              <EditOutlined /> Edit
                            </button>

                            <Popconfirm
                              title="Delete Vehicle"
                              onConfirm={(e) => {
                                e.stopPropagation();
                                handleDeleteCar(car._id);
                              }}
                              onCancel={(e) => e.stopPropagation()}
                              okText="Yes"
                              cancelText="No"
                            >
                              <button
                                className="action-btn delete"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DeleteOutlined /> Delete
                              </button>
                            </Popconfirm>
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}

                {filteredCars.length === 0 && (
                  <Col span={24} style={{ textAlign: "center", marginTop: 40 }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      No vehicles found matching "{searchText}"
                    </Text>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Content>
      </Layout>

      <Modal
        title={editingCar ? "Edit Vehicle" : "Add New Vehicle"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="image"
            label="Vehicle Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="image"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />}>
                Click to Upload Car Image
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="plate"
            label="Plate Number"
            rules={[{ required: true }]}
          >
            <Input placeholder="34 ABC 123" disabled={!!editingCar} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Brand"
                rules={[{ required: true }]}
              >
                <Input placeholder="Toyota" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="model"
                label="Model"
                rules={[{ required: true }]}
              >
                <Input placeholder="Corolla" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="year" label="Year" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={1900} max={2025} />
          </Form.Item>

          {editingCar && (
            <Form.Item
              name="status"
              label="Vehicle Status"
              rules={[{ required: true }]}
              initialValue={editingCar.status}
            >
              <Select placeholder="Select Status">
                <Select.Option value="in-service">In Service</Select.Option>
                <Select.Option value="ready">Ready</Select.Option>
                <Select.Option value="delivered">Delivered</Select.Option>
              </Select>
            </Form.Item>
          )}

          {isMechanic && (
            <Form.Item
              name="ownerId"
              label="Customer ID (Optional)"
              tooltip="If you leave this empty, the car will belong to YOU."
            >
              <Input placeholder="Paste Customer ID (e.g. 65b3...)" />
            </Form.Item>
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ marginTop: 20 }}
          >
            {editingCar ? "Save Changes" : "Save Vehicle"}
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;

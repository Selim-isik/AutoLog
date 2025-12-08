import { useEffect, useState } from "react";
import {
  Layout,
  Table,
  Button,
  message,
  Typography,
  Card,
  Tag,
  Avatar,
  Modal,
  Select,
  Descriptions,
  Tooltip,
  Input,
  Popconfirm,
  Space,
  Divider,
} from "antd";
import {
  CopyOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  ExportOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "./Customers.css";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setCustomers(response.data.data || []);
    } catch (error) {
      messageApi.error("Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/users/${userId}`, { status: newStatus });

      messageApi.success("Status updated successfully");
      setCustomers((prev) =>
        prev.map((item) =>
          item._id === userId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      if (error.response && error.response.status === 404) {
        messageApi.error("Error: User update route not found (404).");
      } else {
        messageApi.error("Failed to update status");
      }
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      messageApi.success("Customer deleted successfully");
      setCustomers((prev) => prev.filter((item) => item._id !== userId));
    } catch (error) {
      messageApi.error("Failed to delete customer");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    messageApi.success("ID Copied to Clipboard! 🚀");
  };

  const shortenId = (id) =>
    id ? `${id.slice(0, 6)}•••${id.slice(-4)}` : "---";

  const exportCSV = () => {
    const csv = customers
      .map((u) => `${u.name},${u.email},${u._id},${u.status}`)
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text, record) => (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar
            src={record.avatar}
            style={{
              backgroundColor: "#1890ff",
              boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
            }}
            size="large"
          >
            {!record.avatar && (text ? text.charAt(0).toUpperCase() : "U")}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ fontSize: 15 }}>
              {text || "Unknown"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Customer ID",
      dataIndex: "_id",
      key: "_id",
      width: 200,
      render: (id) => (
        <Tooltip title="Click to copy">
          <div
            onClick={() => copyToClipboard(id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#ffffff",
              border: "1px solid #e6e6e6",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              maxWidth: "fit-content",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#40a9ff";
              e.currentTarget.style.background = "#f0f5ff";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px rgba(24, 144, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e6e6e6";
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)";
            }}
          >
            <IdcardOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
            <Text
              style={{
                fontFamily: "monospace",
                color: "#595959",
                fontSize: "13px",
                margin: 0,
                letterSpacing: "0.5px",
              }}
              strong
            >
              {shortenId(id)}
            </Text>
            <CopyOutlined style={{ color: "#1890ff", fontSize: "14px" }} />
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => (
        <Select
          key={status}
          value={status || "active"}
          style={{ width: 130 }}
          onChange={(value) => handleStatusChange(record._id, value)}
          variant="borderless"
          popupMatchSelectWidth={false}
          styles={{ popup: { borderRadius: "8px" } }}
        >
          <Option value="active">
            <Tag
              color="success"
              style={{ width: "100%", textAlign: "center", margin: 0 }}
            >
              ACTIVE
            </Tag>
          </Option>
          <Option value="pending">
            <Tag
              color="warning"
              style={{ width: "100%", textAlign: "center", margin: 0 }}
            >
              PENDING
            </Tag>
          </Option>
          <Option value="suspended">
            <Tag
              color="error"
              style={{ width: "100%", textAlign: "center", margin: 0 }}
            >
              SUSPENDED
            </Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => setSelectedUser(record)}
              size="middle"
              style={{ borderRadius: "6px" }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Customer"
            description="Are you sure you want to delete this customer?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete User">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="middle"
                style={{ borderRadius: "6px" }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      {contextHolder}

      <Header className="customers-header">
        <div className="header-left">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            className="back-btn"
          />
          <Title level={4} style={{ margin: 0 }}>
            Customers
          </Title>
        </div>

        <div className="header-right">
          <Input
            placeholder="Search by name or email..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
            allowClear
          />
          <div className="action-buttons">
            <Tooltip title="Refresh List">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCustomers}
                loading={loading}
                shape="circle"
              />
            </Tooltip>
            <Button icon={<ExportOutlined />} onClick={exportCSV}>
              Export CSV
            </Button>
          </div>
        </div>
      </Header>

      <Content className="customers-content">
        <Card className="customers-card" styles={{ body: { padding: "0" } }}>
          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </Content>

      {selectedUser && (
        <Modal
          open={true}
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingBottom: 5,
              }}
            >
              <div
                style={{
                  background: "#e6f7ff",
                  padding: "6px",
                  borderRadius: "6px",
                  display: "flex",
                }}
              >
                <IdcardOutlined style={{ color: "#1890ff", fontSize: 18 }} />
              </div>
              <span style={{ fontSize: 16 }}>Customer Profile</span>
            </div>
          }
          onCancel={() => setSelectedUser(null)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setSelectedUser(null)}
              style={{ borderRadius: "6px" }}
            >
              Close
            </Button>,
          ]}
          width={480}
          centered
          styles={{ body: { paddingTop: 10 } }}
        >
          <div style={{ textAlign: "center", marginBottom: 24, marginTop: 10 }}>
            <Avatar
              size={86}
              src={selectedUser.avatar}
              style={{
                backgroundColor: "#1890ff",
                marginBottom: 16,
                boxShadow: "0 8px 16px rgba(24,144,255,0.25)",
                border: "4px solid white",
              }}
            >
              {!selectedUser.avatar &&
                (selectedUser.name
                  ? selectedUser.name.charAt(0).toUpperCase()
                  : "U")}
            </Avatar>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              {selectedUser.name}
            </Title>
            <Text
              type="secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                marginTop: 4,
              }}
            >
              <MailOutlined /> {selectedUser.email}
            </Text>
          </div>

          <Divider style={{ margin: "16px 0", borderColor: "#f0f0f0" }} />

          <Descriptions
            column={1}
            bordered
            size="small"
            styles={{ label: { width: "140px", fontWeight: 500 } }}
          >
            <Descriptions.Item
              label={
                <>
                  <IdcardOutlined style={{ marginRight: 6 }} /> Customer ID
                </>
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  code
                  copyable={{ text: selectedUser._id }}
                  style={{ fontSize: "13px", margin: 0 }}
                >
                  {selectedUser._id}
                </Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <SafetyCertificateOutlined style={{ marginRight: 6 }} />{" "}
                  Status
                </>
              }
            >
              <Tag
                color={
                  selectedUser.status === "suspended"
                    ? "error"
                    : selectedUser.status === "pending"
                    ? "warning"
                    : "success"
                }
                style={{
                  fontSize: "13px",
                  padding: "2px 10px",
                  borderRadius: "4px",
                }}
              >
                {(selectedUser.status || "Active").toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  <UserOutlined style={{ marginRight: 6 }} /> Role
                </>
              }
            >
              <Tag
                color="processing"
                style={{
                  fontSize: "13px",
                  padding: "2px 10px",
                  borderRadius: "4px",
                }}
              >
                {(selectedUser.role || "USER").toUpperCase()}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      )}
    </Layout>
  );
};

export default Customers;

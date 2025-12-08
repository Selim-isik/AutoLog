import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tag,
  Spin,
  Typography,
  Row,
  Col,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Avatar,
  Empty,
  Grid,
} from "antd";
import {
  ArrowLeftOutlined,
  ToolOutlined,
  PlusOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api";
import "./CarDetail.css";
import ServicesTimeLine from "../../Pages/ServicesTimeLine/ServicesTimeLine";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [ownerName, setOwnerName] = useState("Loading...");
  const [ownerAvatar, setOwnerAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  const screens = useBreakpoint();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();
  const [modal, contextHolderModal] = Modal.useModal();

  const user = JSON.parse(localStorage.getItem("user")) || { role: "customer" };

  const getAvatarUrl = (name) => {
    const seed = name ? name.replace(/\s+/g, "") : "User";
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
  };

  const fetchCarDetails = useCallback(async () => {
    try {
      const response = await api.get(`/cars/${id}`);
      const carData = response.data.data;
      setCar(carData);

      if (carData.ownerId) {
        if (user._id === carData.ownerId || user.id === carData.ownerId) {
          setOwnerName(user.name);
          setOwnerAvatar(user.avatar);
        } else {
          try {
            const userRes = await api.get(`/users/${carData.ownerId}`);
            const u = userRes.data.data;
            const displayName =
              u.name ||
              u.fullname ||
              u.fullName ||
              `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
              "Valued Customer";

            setOwnerName(displayName);
            setOwnerAvatar(u.avatar);
          } catch (err) {
            setOwnerName("Valued Customer");
            setOwnerAvatar(null);
          }
        }
      } else {
        setOwnerName("Garage Vehicle");
        setOwnerAvatar(null);
      }
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to load car details.");
    } finally {
      setLoading(false);
    }
  }, [id, user._id, user.id, user.name, user.avatar, messageApi]);

  useEffect(() => {
    fetchCarDetails();
  }, [fetchCarDetails]);

  const handleDeleteService = (historyId) => {
    modal.confirm({
      title: "Are you sure you want to delete this service record?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await api.delete(`/cars/${car._id}/history/${historyId}`);
          messageApi.success("Service record deleted!");
          fetchCarDetails();
        } catch (error) {
          messageApi.error("Failed to delete service.");
        }
      },
    });
  };

  const handleAddService = async (values) => {
    try {
      await api.post(`/cars/${id}/history`, values);
      messageApi.success("Service history added successfully!");
      setIsModalOpen(false);
      form.resetFields();
      fetchCarDetails();
    } catch (error) {
      messageApi.error("Failed to add service.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(26);
    doc.setTextColor(24, 144, 255);
    doc.setFont("helvetica", "bold");
    doc.text("AutoLog", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Car Service System", 14, 28);
    doc.text("New York, USA", 14, 33);
    doc.text("support@autolog.com", 14, 38);

    doc.setFontSize(10);
    doc.setTextColor(50);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Date: ${dateStr}`, pageWidth - 14, 22, { align: "right" });
    doc.text(
      `Invoice #: INV-${Math.floor(Math.random() * 10000)}`,
      pageWidth - 14,
      28,
      { align: "right" }
    );

    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(14, 45, pageWidth - 14, 45);

    doc.setFontSize(14);
    doc.setTextColor(24, 144, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Vehicle Information", 14, 55);

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text(`${car.brand} ${car.model}`, 14, 63);

    doc.setFont("helvetica", "normal");
    doc.text(`Year: ${car.year}`, 14, 69);
    doc.text(`Plate: ${car.plate.toUpperCase()}`, 14, 75);
    doc.text(`Status: ${car.status.toUpperCase()}`, 14, 81);

    doc.setFontSize(14);
    doc.setTextColor(24, 144, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Information", pageWidth / 2 + 10, 55);

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text(`${ownerName}`, pageWidth / 2 + 10, 63);

    doc.setFont("helvetica", "normal");
    doc.text(`Customer ID:`, pageWidth / 2 + 10, 69);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${car.ownerId || "N/A"}`, pageWidth / 2 + 10, 74);

    const tableData = car.history.map((item) => [
      new Date(item.date).toLocaleDateString(),
      item.action,
      `$${item.price}`,
    ]);

    const totalCost = car.history.reduce(
      (acc, item) => acc + (item.price || 0),
      0
    );

    autoTable(doc, {
      startY: 90,
      head: [["Date", "Service Description", "Cost"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [24, 144, 255],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      styles: {
        fontSize: 10,
        cellPadding: 6,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        2: { halign: "right", fontStyle: "bold" },
      },
      foot: [["", "TOTAL AMOUNT", `$${totalCost}`]],
      footStyles: {
        fillColor: [245, 247, 250],
        textColor: [24, 144, 255],
        fontStyle: "bold",
        halign: "right",
        fontSize: 12,
      },
    });

    const finalY = doc.lastAutoTable.finalY + 30;

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for choosing AutoLog Services.", 14, finalY);

    doc.setDrawColor(200);
    doc.line(pageWidth - 70, finalY - 5, pageWidth - 14, finalY - 5);
    doc.text("Authorized Signature", pageWidth - 14, finalY, {
      align: "right",
    });

    doc.save(`${car.plate}_Invoice.pdf`);
    messageApi.success("Invoice downloaded successfully!");
  };

  const formattedHistory = car?.history
    ? [...car.history].reverse().map((item) => ({
        id: item._id,
        date: new Date(item.date).toLocaleDateString(),
        title: item.action,
        cost: item.price,
        currency: "$",
      }))
    : [];

  if (loading) {
    return <Spin size="large" tip="Loading Car Details..." fullscreen />;
  }

  if (!car) {
    return (
      <>
        {contextHolder}
        {contextHolderModal}
        <Empty description="Car not found" style={{ marginTop: 100 }} />
      </>
    );
  }

  return (
    <div className="detail-container">
      {contextHolder}
      {contextHolderModal}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard")}
          size={screens.md ? "large" : "middle"}
          style={{
            borderRadius: "8px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            paddingLeft: screens.md ? "15px" : "10px",
            paddingRight: screens.md ? "20px" : "10px",
            fontSize: screens.md ? undefined : "13px",
          }}
        >
          {screens.md ? "Back to Dashboard" : "Back"}
        </Button>

        <Button
          type="default"
          icon={<FilePdfOutlined />}
          onClick={generatePDF}
          size="large"
          style={{
            color: "#ff4d4f",
            borderColor: "#ff4d4f",
            borderRadius: "8px",
            fontWeight: 500,
          }}
        >
          Download Report
        </Button>
      </div>

      <Card className="car-header-card" styles={{ body: { padding: 0 } }}>
        <div style={{ position: "relative" }}>
          <img
            alt="car cover"
            src={`https://loremflickr.com/800/400/${car.brand},car/all?lock=${car._id}`}
            className="car-cover-image"
          />
        </div>

        <div style={{ padding: "24px 32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0, color: "#333" }}>
                {car.brand} {car.model}
              </Title>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px",
                  color: "#666",
                }}
              >
                <CalendarOutlined />
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {car.year}
                </Text>
                <span style={{ fontSize: "8px" }}>●</span>
                <Text strong style={{ fontSize: 16 }}>
                  {car.plate.toUpperCase()}
                </Text>
              </div>
            </div>

            <Tag
              color={car.status === "in-service" ? "gold" : "green"}
              className="status-tag"
              style={{ fontSize: "14px", padding: "6px 16px" }}
            >
              {car.status
                ? car.status.toUpperCase().replace("-", " ")
                : "UNKOWN"}
            </Tag>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card
            title={
              <>
                <ToolOutlined /> Service History
              </>
            }
            className="history-card"
            extra={
              user.role === "mechanic" && (
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Service
                </Button>
              )
            }
          >
            <div style={{ padding: "10px 0" }}>
              <ServicesTimeLine
                data={formattedHistory}
                onDelete={user.role === "mechanic" ? handleDeleteService : null}
                currency="$"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <>
                <UserOutlined /> Owner Info
              </>
            }
            className="history-card"
          >
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Avatar
                size={64}
                src={ownerAvatar || getAvatarUrl(ownerName)}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#f0f2f5",
                  color: "#999",
                  marginBottom: 16,
                  border: "1px solid #d9d9d9",
                }}
              />

              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {ownerName}
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: "12px", display: "block", marginTop: 4 }}
                >
                  Customer ID
                </Text>
                <div
                  style={{
                    background: "#f9f9f9",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    marginTop: "4px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#888",
                    display: "inline-block",
                  }}
                >
                  {car.ownerId || "No ID"}
                </div>
              </div>

              <Button type="primary" block icon={<CarOutlined />}>
                Contact Owner
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Add New Service Record"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleAddService}>
          <Form.Item
            name="action"
            label="Service Description"
            rules={[{ required: true, message: "What was done?" }]}
          >
            <Input placeholder="e.g. Brake Pad Replacement" size="large" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Total Cost (USD)"
            rules={[{ required: true, message: "Enter the cost" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="0.00"
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ marginTop: 10 }}
          >
            Save Service Record
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default CarDetail;

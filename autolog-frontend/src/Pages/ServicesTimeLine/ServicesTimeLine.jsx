import React from "react";
import { DeleteOutlined } from "@ant-design/icons";
import "./ServicesTimeLine.css";

const ServicesTimeLine = ({ data, onDelete, currency = "TL" }) => {
  if (!data || data.length === 0) {
    return <p>No process history available.</p>;
  }

  const processSteps = [...data].reverse();
  const currentIndex = processSteps.length - 1;

  return (
    <div className="timeline-container">
      {processSteps.map((item, index) => {
        let statusClass = "";
        if (index < currentIndex) {
          statusClass = "completed";
        } else if (index === currentIndex) {
          statusClass = "active";
        }

        return (
          <div
            key={item.id || index}
            className={`timeline-item ${statusClass}`}
          >
            <div className="timeline-marker">
              <div className="dot"></div>
              <div className="line"></div>
            </div>

            <div className="content">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <div>
                  <span className="date">{item.date}</span>
                  <h3 className="title">{item.title}</h3>
                  {item.cost && (
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      {currency === "$"
                        ? `${currency} ${item.cost}`
                        : `${item.cost} ${currency}`}
                    </div>
                  )}
                </div>

                {onDelete && (
                  <DeleteOutlined
                    className="delete-icon"
                    onClick={() => onDelete(item.id)}
                    style={{ marginLeft: 10 }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServicesTimeLine;

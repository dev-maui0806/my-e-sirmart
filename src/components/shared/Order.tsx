import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Space, notification, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { QuestionCircleOutlined } from '@ant-design/icons';
import "./style.css";
import { getOrders } from "../../services/api/order";
import axios from "axios";
import { BASE_URL } from "../../services/url";

interface OrderProps {
  toggleOrderModal: () => void;
  onOrderSuccess: () => void;
}

interface ProductItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  shopId: string;
  shopName: string;
  productItems: ProductItem[];
  orderStatus: string;
}

interface OrderType {
  razorpayOrderId: string;
  orders: Order[];
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
}

const columns: ColumnsType<OrderType> = [
  {
    title: "Razorpay Order ID",
    dataIndex: "razorpayOrderId",
    key: "razorpayOrderId",
  },
  {
    title: "Total Amount",
    dataIndex: "totalAmount",
    key: "totalAmount",
    align: "center",
    render: (amount) => `₹${amount}`,
  },
  {
    title: "Payment Status",
    dataIndex: "paymentStatus",
    key: "paymentStatus",
    align: "center",
  },
  {
    title: "Order Status",
    dataIndex: "orderStatus",
    key: "orderStatus",
    align: "center",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    align: "center",
    render: (date) => new Date(date).toLocaleString(), // Format the date as needed
  },
];

const Order: React.FC<OrderProps> = ({ toggleOrderModal, onOrderSuccess }) => {
  const [orderData, setOrderData] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChangeOrderStatus = async (order: Order) => {
    const userData = localStorage.getItem("user");
  
    if (userData) {
      const token = JSON.parse(userData).access_token;
      const data = JSON.stringify({
        status: "Delivered",
        orderId: order.orderId
      });
  
      const response = await axios.put(
        `${BASE_URL}/orders/updateOrder`,
        data,
        {
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      });
  
      console.log(response);
  
      if (response.data.success) {
        notification.success({
          message: response.data.message
        });

        setLoading(true);
        fetchOrders();
      }
    }
  };
  
  const handleCancel = async (order: Order) => {
    const userData = localStorage.getItem("user");

    const amount = order.productItems.reduce((total, item) => total + item.price * item.quantity, 0);

    if (userData) {
      const token = JSON.parse(userData).access_token;
      const data = JSON.stringify({
        status: "Cancelled",
        orderId: order.orderId,
        amount: amount
      });
  
      const response = await axios.put(
        `${BASE_URL}/orders/updateOrder`,
        data,
        {
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      });
  
      console.log(response);
  
      if (response.data.success) {
        notification.success({
          message: response.data.message
        });
  
        fetchOrders();
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();

      let availableOrderStatus: any = {
        "Pending": {level: 0, value:"Pending"},
        "Shipped": {level: 1, value:"Delivery in progress"},
        "Delivered": {level: 2, value:"Delivered"},
        "Cancelled": {level: 3, value:"Cancelled"}
      }

      let ordersData: any[] = [];
      Object.entries(data).forEach(([razorpayOrderId, orderDetails]: any) => {
        let ordersItems: any[] = [];
        let orderStatus: any = {level: 3, value:"Cancelled"};

        orderDetails.orders.forEach((order: any) => {
          let productItems: any[] = [];
          order.items.forEach((productItem: any) => {
            productItems.push({
              productId: productItem.productId._id,
              productName: productItem.productId.name,
              quantity: productItem.quantity,
              price: productItem.price
            })
          });

          if (availableOrderStatus[order.status].level <= orderStatus.level) {
            orderStatus = availableOrderStatus[order.status];
          }

          ordersItems.push({
            orderId: order._id,
            shopId: order.shopId._id,
            shopName: order.shopId.name,
            productItems: productItems,
            orderStatus: order.status
          })
        });

        ordersData.push({
          razorpayOrderId: razorpayOrderId,
          orders: ordersItems,
          paymentStatus: orderDetails.paymentStatus,
          orderStatus: orderStatus.value,
          totalAmount: orderDetails.totalAmount > 100 ? orderDetails.totalAmount+2 : orderDetails.totalAmount+2+15,
          createdAt: orderDetails.createdAt
        })
      });
      setLoading(false);
      setOrderData(ordersData);
    } catch (error: any) {
      console.log();
      const errorStatus = error.response.status;

      if (errorStatus === 401) {
        notification.error({
          message: "Get Orders Failed!"
        });
        notification.error({
          message: "Please login again!"
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        window.location.reload();
        return;
      }
      
      console.error("Error fetching orders:", error);
    }
  };

  const expandedRowRender = (record: OrderType) => {
    const nestedColumns: ColumnsType<Order> = [
      {
        title: "Shop Name",
        dataIndex: "shopName",
        key: "shopName",
      },
      {
        title: "Product Items",
        dataIndex: "productItems",
        key: "productItems",
        render: (items: ProductItem[]) =>
          items.map((item) => (
            <div key={item.productId} className="product-item">
              {item.productName} (x{item.quantity}) - ₹{item.price}
            </div>
          )),
      },
      {
        title: "Order Status",
        dataIndex: "orderStatus",
        key: "orderStatus",
        align: "center",
        render: (item) => item === "Shipped" ? "Delivery in progress" : item
      },
      {
        title: "Actions",
        key: "actions",
        width: "200px",
        align: "center",
        render: (_, order) => (
          <Space size="middle">
            {order.orderStatus === "Shipped" ? (
              <Popconfirm
                title="Confirm Delivery"
                description="Are you sure you want to mark this order as delivered?"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleChangeOrderStatus(order)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ type: 'primary', ghost: true }}
                cancelButtonProps={{ type: 'default', danger: true }}
              >
                <Button type="primary" ghost>Mark as Delivered</Button>
              </Popconfirm>
            ) : null}
            {order.orderStatus === "Pending" ? (
              <Popconfirm
                title="Cancel Order"
                description="Are you sure you want to cancel the order?"
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleCancel(order)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ type: 'primary', ghost: true }}
                cancelButtonProps={{ type: 'default', danger: true }}
              >
                <Button type="default" danger>Cancel</Button>
              </Popconfirm>
            ) : null}
          </Space>
        ),
      },
    ];
  
    return (
      <Table
        columns={nestedColumns}
        dataSource={record.orders}
        pagination={false}
        rowKey="orderId"
        style={{backgroundColor: "#70b55d", padding: "15px 11px 15px 0px"}}
      />
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-Order">
        <button className="modal-close" onClick={toggleOrderModal} style={{color: "#70b55d"}}>
          ×
        </button>
        <div className="modal-header">
          <h2 style={{color: "#70b55d"}}>My Orders</h2>
        </div>

        <div className="order-form">
        <Table
          columns={columns}
          dataSource={orderData}
          expandable={{ expandedRowRender }}
          rowKey="razorpayOrderId"
          pagination={false}
          bordered
          size="middle"
          loading={loading}
        />
        </div>
      </div>
    </div>
  );
};

export default Order;

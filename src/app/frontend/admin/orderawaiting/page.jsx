"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/customer/orderdata");
        const data = response.data.users[0].purchaseHistory.map((order) => ({
          id: order._id,
          customerName: response.data.users[0].name,
          phoneNumber: response.data.users[0].address[0].phone,
          email: response.data.users[0].email,
          address: response.data.users[0].address.find(
            (addr) => addr._id === order.addressId
          ).address,
          location: response.data.users[0].address.find(
            (addr) => addr._id === order.addressId
          ).location,
          products: order.products.map((product) => ({
            name: product.productDetails.name,
            quantity: product.quantity,
            price: product.totalPrice / product.quantity,
            size: product.productDetails.sizes.join(", "),
          })),
          totalAmount: order.totalAmount,
          status: order.status,
          paymentMethod: "Online Payment", // Replace with actual payment method if available
        }));
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const openPopup = (orderId) => {
    setSelectedOrderId(orderId);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedOrderId(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (selectedOrderId) {
      try {
        // Update the status on the backend
        await axios.post(`/api/orders/update-status`, {
          orderId: selectedOrderId,
          status: newStatus,
        });

        // Trigger WhatsApp communication
        await axios.post(`/api/messages/whatsapp`, {
          orderId: selectedOrderId,
          status: newStatus,
        });

        // Update the UI
        const updatedOrders = orders.map((order) =>
          order.id === selectedOrderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);

        closePopup();
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const calculateTotalPrice = (products) => {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="font-bold mb-4 text-gray-800 text-center text-xl">
        Admin Orders Management
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-800 bg-white shadow-lg">
          <thead>
            <tr className="bg-gray-200 text-left font-semibold text-gray-800 border-b-2 border-gray-800">
              <th className="px-4 py-2 border-r-2 border-gray-800">Order ID</th>
              <th className="px-4 py-2 border-r-2 border-gray-800">
                Customer Name
              </th>
              <th className="px-4 py-2 border-r-2 border-gray-800">
                Phone Number
              </th>
              <th className="px-4 py-2 border-r-2 border-gray-800">Email</th>
              <th className="px-4 py-2 border-r-2 border-gray-800">Address</th>
              <th className="px-4 py-2 border-r-2 border-gray-800 w-1/4">
                Order Details
              </th>
              <th className="px-4 py-2 border-r-2 border-gray-800">
                Total Price
              </th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-100 text-gray-800 border-b-2 border-gray-800"
              >
                <td className="px-4 py-2 border-r-2 border-gray-800">
                  {order.id}
                </td>
                <td className="px-4 py-2 border-r-2 border-gray-800">
                  {order.customerName}
                </td>
                <td className="px-4 py-2 border-r-2 border-gray-800">
                  {order.phoneNumber}
                </td>
                <td className="px-4 py-2 border-r-2 border-gray-800">
                  {order.email}
                </td>
                <td className="px-4 py-2 border-r-2 border-gray-800">
                  {order.address}
                </td>
                <td className="px-4 py-2 border-r-2 border-gray-800">
                  <table className="w-full border border-gray-500">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border border-gray-500">
                          Product
                        </th>
                        <th className="px-2 py-1 border border-gray-500">
                          Quantity
                        </th>
                        <th className="px-2 py-1 border border-gray-500">
                          Size
                        </th>
                        <th className="px-2 py-1 border border-gray-500">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-2 py-1 border border-gray-500">
                            {product.name}
                          </td>
                          <td className="px-2 py-1 border border-gray-500">
                            {product.quantity}
                          </td>
                          <td className="px-2 py-1 border border-gray-500">
                            {product.size}
                          </td>
                          <td className="px-2 py-1 border border-gray-500">
                            ₹{product.price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="px-4 py-2 border-r-2 border-gray-800 font-bold">
                  ₹{calculateTotalPrice(order.products)}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => openPopup(order.id)}
                    className={`px-2 py-2 rounded font-medium text-white transition ${
                      order.status === "Pending"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : order.status === "Dispatched"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {order.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full sm:w-96">
            <h2 className="text-lg text-black font-semibold mb-4">
              Change Order Status
            </h2>
            <p className="text-black mb-4">
              Select an action for order ID: <strong>{selectedOrderId}</strong>
            </p>
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
              <button
                onClick={() => handleStatusChange("Dispatched")}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Dispatch
              </button>
              <button
                onClick={() => handleStatusChange("Cancelled")}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Cancel Order
              </button>
              <button
                onClick={closePopup}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

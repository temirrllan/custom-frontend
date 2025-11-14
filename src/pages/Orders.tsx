import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { api } from "../api/api";
import Loader from "../components/Loader";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const tgId = WebApp.initDataUnsafe?.user?.id;
      if (!tgId) {
        WebApp.showAlert("❌ Не удалось получить ваш Telegram ID");
        return;
      }

      const res = await api.get("/api/bookings/my", {
        headers: { "x-tg-id": String(tgId) },
      });
      
      setOrders(res.data);
    } catch (err) {
      console.error("Ошибка загрузки заказов:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm("Вы уверены, что хотите отменить этот заказ?")) return;

    try {
      const tgId = WebApp.initDataUnsafe?.user?.id;
      await api.put(`/api/bookings/${orderId}/cancel`, {}, {
        headers: { "x-tg-id": String(tgId) },
      });

      WebApp.showAlert("✅ Заказ успешно отменён!");
      loadOrders(); // перезагружаем список
    } catch (err: any) {
      console.error("Ошибка отмены заказа:", err);
      const errorMsg = err.response?.data?.error || "Ошибка при отмене заказа";
      WebApp.showAlert(`❌ ${errorMsg}`);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      new: "🕐 Новая",
      confirmed: "✅ Подтверждена",
      cancelled: "❌ Отменена",
      completed: "✔️ Завершена",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "#007aff",
      confirmed: "#34c759",
      cancelled: "#ff3b30",
      completed: "#8e8e93",
    };
    return colors[status] || "#8e8e93";
  };

  if (loading) return <Loader text="Загрузка заказов..." />;

  return (
    <div className="orders-page">
      <header className="orders-header">
        <button className="back-btn" onClick={() => nav("/")}>
          ←
        </button>
        <h1 className="orders-title">Мои заказы</h1>
      </header>

      {orders.length === 0 ? (
        <div className="empty">
          <p>У вас пока нет заказов</p>
          <button onClick={() => nav("/")}>Перейти к каталогу</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>{order.costumeTitle}</h3>
                <span
                  className="order-status"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="order-details">
                <div className="order-row">
                  <span className="label">Размер:</span>
                  <span className="value">{order.size}</span>
                </div>

                {order.childName && (
                  <div className="order-row">
                    <span className="label">Ребёнок:</span>
                    <span className="value">{order.childName}</span>
                  </div>
                )}

                {order.childAge && (
                  <div className="order-row">
                    <span className="label">Возраст:</span>
                    <span className="value">{order.childAge} лет</span>
                  </div>
                )}

                <div className="order-row">
                  <span className="label">Дата заказа:</span>
                  <span className="value">
                    {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>

              {/* Кнопка отмены (только для новых и подтверждённых) */}
              {(order.status === "new" || order.status === "confirmed") && (
                <button
                  className="cancel-btn"
                  onClick={() => cancelOrder(order._id)}
                >
                  ❌ Отменить заказ
                </button>
              )}

              {order.status === "cancelled" && (
                <div className="cancelled-notice">
                  Заказ отменён
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
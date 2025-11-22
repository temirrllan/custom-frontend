import { useState, useEffect } from "react";
import "./BookingCalendar.css"

interface BookingCalendarProps {
  costumeId: string;
  size?: string;
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

export default function BookingCalendar({
  costumeId,
  size,
  selectedDate,
  onDateSelect,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  useEffect(() => {
    loadBookedDates();
  }, [costumeId, size, currentMonth]); // ✅ Перезагружаем при смене месяца

  const loadBookedDates = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const url = size
        ? `${API_BASE}/api/costumes/${costumeId}/booked-dates?size=${size}`
        : `${API_BASE}/api/costumes/${costumeId}/booked-dates`;

      const res = await fetch(url);
      const data = await res.json();
      setBookedDates(data.map((d: any) => d.date));
      
      console.log(`📅 [CALENDAR] Загружены забронированные даты:`, data.map((d: any) => d.date));
    } catch (err) {
      console.error("Ошибка загрузки занятых дат:", err);
      setBookedDates([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const isDateBooked = (dateStr: string) => {
    const isBooked = bookedDates.includes(dateStr);
    if (isBooked) {
      console.log(`🔴 [CALENDAR] Дата ${dateStr} забронирована`);
    }
    return isBooked;
  };

  const isDatePast = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // 🆕 Обработка клика на дату
  const handleDateClick = (dateStr: string) => {
    if (isDatePast(dateStr)) {
      alert("⚠️ Нельзя выбрать прошедшую дату");
      return;
    }

    if (isDateBooked(dateStr)) {
      alert(`❌ К сожалению, все костюмы этого размера заняты на ${new Date(dateStr).toLocaleDateString("ru-RU")}.\n\nПожалуйста, выберите другой день.`);
      return;
    }

    // Показываем модальное окно с правилами
    setPendingDate(dateStr);
    setShowModal(true);
  };

  // 🆕 Подтверждение выбора даты
  const confirmDateSelection = () => {
    if (pendingDate) {
      onDateSelect(pendingDate);
      setShowModal(false);
      setPendingDate(null);
    }
  };

  // 🆕 Отмена выбора даты
  const cancelDateSelection = () => {
    setShowModal(false);
    setPendingDate(null);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const isBooked = isDateBooked(dateStr);
    const isPast = isDatePast(dateStr);
    const isSelected = dateStr === selectedDate;

    days.push(
      <div
        key={day}
        className={`calendar-day ${isBooked ? "booked" : ""} ${isPast ? "past" : ""} ${
          isSelected ? "selected" : ""
        }`}
        onClick={() => !isPast && handleDateClick(dateStr)}
      >
        {day}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-loading">Загрузка календаря...</div>
      </div>
    );
  }

  // 🆕 Форматирование даты для модального окна
  const formatModalDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", { 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      weekday: "long"
    });
  };

  const getPickupDate = (eventDateStr: string) => {
    const eventDate = new Date(eventDateStr);
    const pickup = new Date(eventDate);
    pickup.setDate(pickup.getDate() - 1);
    return pickup.toLocaleDateString("ru-RU", { 
      day: "numeric", 
      month: "long",
      weekday: "short"
    });
  };

  return (
    <>
      {/* 🆕 Модальное окно с правилами */}
      {showModal && pendingDate && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-out",
            backdropFilter: "blur(4px)",
          }}
          onClick={cancelDateSelection}
        >
          <div 
            style={{
              background: "var(--tg-theme-secondary-bg-color, #fff)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              textAlign: "center",
              fontSize: "40px",
              marginBottom: "16px"
            }}>
              📅
            </div>

            <h3 style={{
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "20px",
              textAlign: "center",
              color: "var(--tg-theme-text-color, #1c1c1e)"
            }}>
              Правила аренды
            </h3>

            <div style={{
              fontSize: "15px",
              lineHeight: "1.6",
              color: "var(--tg-theme-text-color, #1c1c1e)",
              marginBottom: "20px"
            }}>
              <p style={{ marginBottom: "16px", fontWeight: "600" }}>
                🎭 Дата мероприятия:<br />
                <span style={{ color: "#007aff", fontSize: "16px" }}>
                  {formatModalDate(pendingDate)}
                </span>
              </p>

              <div style={{
                padding: "16px",
                background: "rgba(0, 122, 255, 0.08)",
                borderRadius: "12px",
                marginBottom: "12px"
              }}>
                <p style={{ marginBottom: "8px" }}>
                  <strong>📦 Выдача костюма:</strong>
                </p>
                <p style={{ color: "#007aff", fontWeight: "600" }}>
                  {getPickupDate(pendingDate)}<br />
                  с 17:00 до 19:00
                </p>
              </div>

              <div style={{
                padding: "16px",
                background: "rgba(52, 199, 89, 0.08)",
                borderRadius: "12px",
                marginBottom: "12px"
              }}>
                <p style={{ marginBottom: "8px" }}>
                  <strong>🔄 Возврат костюма:</strong>
                </p>
                <p style={{ color: "#34c759", fontWeight: "600" }}>
                  {formatModalDate(pendingDate).split(',')[0]}<br />
                  до 17:00
                </p>
              </div>

              <div style={{
                padding: "12px",
                background: "rgba(255, 59, 48, 0.08)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 59, 48, 0.2)"
              }}>
                <p style={{ fontSize: "14px", color: "#ff3b30" }}>
                  ⚠️ При нарушении сроков возврата предусмотрен штраф
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px"
            }}>
              <button 
                onClick={confirmDateSelection}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#007aff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ✓ Понятно, продолжить
              </button>
              <button 
                onClick={cancelDateSelection}
                style={{
                  padding: "14px 20px",
                  background: "transparent",
                  color: "var(--tg-theme-text-color, #1c1c1e)",
                  border: "2px solid #e0e0e0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={prevMonth}>
            ‹
          </button>
          <div className="calendar-title">
            {monthNames[month]} {year}
          </div>
          <button className="calendar-nav" onClick={nextMonth}>
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">{days}</div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color free"></div>
            <span>Свободно</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>Занято</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Выбрано</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
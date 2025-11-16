import { useState, useEffect } from "react";
import "./BookingCalendar.css";
import WebApp from "@twa-dev/sdk";

interface BookingCalendarProps {
  costumeId: string;
  size?: string;
  selectedDate?: string; // YYYY-MM-DD
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

  useEffect(() => {
    loadBookedDates();
  }, [costumeId, size]);

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
    } catch (err) {
      console.error("Ошибка загрузки занятых дат:", err);
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

  const isDateBooked = (dateStr: string) => bookedDates.includes(dateStr);
  const isDatePast = (dateStr: string) => new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));

  const handleDateClick = (dateStr: string) => {
    if (isDatePast(dateStr)) {
      WebApp.showAlert("⚠️ Нельзя выбрать прошедшую дату");
      return;
    }

    if (isDateBooked(dateStr)) {
      WebApp.showAlert("❌ Эта дата уже занята — выберите, пожалуйста, другой день");
      return;
    }

    onDateSelect(dateStr);
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

  return (
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
  );
}
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WebApp from "@twa-dev/sdk";

/**
 * Хук для управления кнопкой "Назад" в Telegram Web App
 * 
 * Автоматически показывает/скрывает кнопку в зависимости от текущего роута
 * и настраивает действие при нажатии
 */
export function useBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const backButton = WebApp.BackButton;

    // Определяем, находимся ли мы на главной странице
    const isMainPage = location.pathname === "/";

    if (isMainPage) {
      // На главной странице скрываем кнопку "Назад"
      backButton.hide();
    } else {
      // На всех остальных страницах показываем кнопку "Назад"
      backButton.show();

      // Устанавливаем обработчик клика
      const handleBackClick = () => {
        navigate(-1); // Возврат на предыдущую страницу
      };

      backButton.onClick(handleBackClick);

      // Cleanup: удаляем обработчик при размонтировании
      return () => {
        backButton.offClick(handleBackClick);
      };
    }
  }, [location.pathname, navigate]);
}

/**
 * Альтернативная версия с настройкой для конкретных страниц
 */
export function useBackButtonWithConfig(options?: {
  showOnPaths?: string[]; // Показывать только на этих путях
  hideOnPaths?: string[]; // Скрывать на этих путях
  onBack?: () => void;     // Кастомное действие при нажатии
}) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const backButton = WebApp.BackButton;
    const currentPath = location.pathname;

    // Проверяем, нужно ли показывать кнопку на текущем пути
    let shouldShow = currentPath !== "/";

    if (options?.showOnPaths) {
      shouldShow = options.showOnPaths.some(path => currentPath.startsWith(path));
    }

    if (options?.hideOnPaths) {
      const shouldHide = options.hideOnPaths.some(path => currentPath.startsWith(path));
      if (shouldHide) shouldShow = false;
    }

    if (shouldShow) {
      backButton.show();

      const handleBackClick = () => {
        if (options?.onBack) {
          options.onBack();
        } else {
          navigate(-1);
        }
      };

      backButton.onClick(handleBackClick);

      return () => {
        backButton.offClick(handleBackClick);
      };
    } else {
      backButton.hide();
    }
  }, [location.pathname, navigate, options]);
}
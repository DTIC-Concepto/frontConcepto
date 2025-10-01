'use client';

import React from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationConfig {
  type: NotificationType;
  title: string;
  description?: string;
  duration?: number;
}

interface NotificationState {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  show: boolean;
}

class NotificationManager {
  private notifications: NotificationState[] = [];
  private listeners: Array<(notifications: NotificationState[]) => void> = [];

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  subscribe(listener: (notifications: NotificationState[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show({ type, title, description, duration = 4500 }: NotificationConfig) {
    const id = this.generateId();
    const notification: NotificationState = {
      id,
      type,
      title,
      description,
      show: true,
    };

    this.notifications.push(notification);
    this.notify();

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  success(title: string, description?: string, duration?: number) {
    this.show({ type: 'success', title, description, duration });
  }

  error(title: string, description?: string, duration?: number) {
    this.show({ type: 'error', title, description, duration });
  }

  warning(title: string, description?: string, duration?: number) {
    this.show({ type: 'warning', title, description, duration });
  }

  info(title: string, description?: string, duration?: number) {
    this.show({ type: 'info', title, description, duration });
  }

  destroy() {
    this.notifications = [];
    this.notify();
  }
}

const notificationManager = new NotificationManager();

// Hook para componentes React
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<NotificationState[]>([]);

  React.useEffect(() => {
    return notificationManager.subscribe(setNotifications);
  }, []);

  return {
    notifications,
    removeNotification: notificationManager.remove.bind(notificationManager),
  };
}

// Componente de notificación individual
function NotificationItem({ notification, onRemove }: { 
  notification: NotificationState; 
  onRemove: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`rounded-lg border p-4 shadow-lg transition-all duration-300 ${getBgColor()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h3>
          {notification.description && (
            <p className="mt-1 text-sm text-gray-600">
              {notification.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(notification.id)}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente contenedor de notificaciones
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

// Export por defecto del manager para uso en cualquier lugar
class NotificationService {
  static success(title: string, description?: string, duration?: number) {
    notificationManager.success(title, description, duration);
  }

  static error(title: string, description?: string, duration?: number) {
    notificationManager.error(title, description, duration);
  }

  static warning(title: string, description?: string, duration?: number) {
    notificationManager.warning(title, description, duration);
  }

  static info(title: string, description?: string, duration?: number) {
    notificationManager.info(title, description, duration);
  }

  static show(config: NotificationConfig) {
    notificationManager.show(config);
  }

  static destroy() {
    notificationManager.destroy();
  }
}

export default NotificationService;
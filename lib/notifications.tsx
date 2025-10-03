'use client';

import React from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

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

  show({ type, title, description, duration = 5000 }: NotificationConfig) {
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

// Componente de notificación individual con el estilo del archivo NotificationModel.tsx
function NotificationItem({ notification, onRemove }: { 
  notification: NotificationState; 
  onRemove: (id: string) => void;
}) {
  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'success':
        return <Check className="text-white" size={16} strokeWidth={3} />;
      case 'error':
        return <X className="text-white" size={16} strokeWidth={3} />;
      case 'warning':
        return <AlertTriangle className="text-white" size={16} strokeWidth={2.5} />;
      case 'info':
        return <Info className="text-white" size={16} strokeWidth={2.5} />;
      default:
        return <Check className="text-white" size={16} strokeWidth={3} />;
    }
  };

  const getIconBgColor = (type: NotificationType) => {
    switch(type) {
      case 'success':
        return 'bg-emerald-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-emerald-600';
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 p-3 min-w-[280px] max-w-[350px] animate-slideIn"
      style={{
        animation: 'slideIn 0.3s ease-out',
        backgroundColor: '#ffffff',
        zIndex: 9999
      }}
    >
      <div className="flex items-start gap-3">
        {/* Ícono */}
        <div className={`${getIconBgColor(notification.type)} rounded-full p-1.5 flex-shrink-0 mt-0.5`}>
          {getIcon(notification.type)}
        </div>

        {/* Contenido */}
        <div className="flex-1 pt-0.5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
            {notification.title}
          </h3>
          {notification.description && (
            <p className="text-xs text-gray-600 leading-relaxed">
              {notification.description}
            </p>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => onRemove(notification.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// Componente contenedor de notificaciones estilo Ant Design
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Contenedor de notificaciones con posición fija */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>

      {/* Estilos de animación globales */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
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
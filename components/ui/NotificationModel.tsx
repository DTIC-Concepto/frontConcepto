import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = Date.now();
    const newNotification: Notification = { id, type, title, message };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto cerrar después de 4 segundos
    setTimeout(() => {
      closeNotification(id);
    }, 4000);
  };

  const closeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIcon = (type: 'success' | 'error' | 'warning' | 'info') => {
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

  const getIconBgColor = (type: 'success' | 'error' | 'warning' | 'info') => {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Botones de prueba */}
      <div className="space-y-3">
        <button
          onClick={() => showNotification('success', 'Completado', 'El registro se ha creado exitosamente')}
          className="block w-64 px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
        >
          Mostrar Notificación de Éxito
        </button>
        
        <button
          onClick={() => showNotification('error', 'Error', 'Ha ocurrido un error al procesar la solicitud')}
          className="block w-64 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Mostrar Notificación de Error
        </button>
        
        <button
          onClick={() => showNotification('warning', 'Advertencia', 'Algunos campos requieren tu atención')}
          className="block w-64 px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
        >
          Mostrar Notificación de Advertencia
        </button>
        
        <button
          onClick={() => showNotification('info', 'Información', 'La operación se está procesando')}
          className="block w-64 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
        >
          Mostrar Notificación de Información
        </button>
      </div>

      {/* Contenedor de notificaciones */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {notifications.map((notif, index) => (
          <div
            key={notif.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px] max-w-[350px] animate-slideIn"
            style={{
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div className="flex items-start gap-3">
              {/* Ícono */}
              <div className={`${getIconBgColor(notif.type)} rounded-full p-1.5 flex-shrink-0`}>
                {getIcon(notif.type)}
              </div>

              {/* Contenido */}
              <div className="flex-1 pt-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {notif.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => closeNotification(notif.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-1"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Estilos de animación */}
      <style jsx>{`
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
    </div>
  );
}
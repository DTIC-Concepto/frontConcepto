'use client';

import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import NotificationService from '@/lib/notifications';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordFormData {
  contrasenaActual: string;
  contrasenaNueva: string;
  confirmarContrasena: string;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<PasswordFormData>({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasena: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field: 'actual' | 'nueva' | 'confirmar') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswords = (): string[] => {
    const errors: string[] = [];

    if (!formData.contrasenaActual) {
      errors.push('La contraseña actual es requerida');
    }

    if (!formData.contrasenaNueva) {
      errors.push('La nueva contraseña es requerida');
    } else if (formData.contrasenaNueva.length < 8) {
      errors.push('La nueva contraseña debe tener al menos 8 caracteres');
    }

    if (!formData.confirmarContrasena) {
      errors.push('La confirmación de contraseña es requerida');
    } else if (formData.contrasenaNueva !== formData.confirmarContrasena) {
      errors.push('Las contraseñas no coinciden');
    }

    if (formData.contrasenaActual === formData.contrasenaNueva) {
      errors.push('La nueva contraseña debe ser diferente a la actual');
    }

    return errors;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validar datos
      const errors = validatePasswords();
      if (errors.length > 0) {
        NotificationService.warning(
          'Datos inválidos',
          errors.join('. ')
        );
        return;
      }

      // Obtener token de autenticación
      const token = AuthService.getToken();
      if (!token) {
        NotificationService.error(
          'Error de autenticación',
          'No se encontró token de acceso. Por favor, inicia sesión nuevamente.'
        );
        return;
      }
      
      const response = await fetch('/api/usuarios/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          contrasenaActual: formData.contrasenaActual,
          contrasenaNueva: formData.contrasenaNueva,
          confirmarContrasena: formData.confirmarContrasena,
        }),
      });

      // Intentar parsear la respuesta
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(`Error del servidor (${response.status}): No se pudo procesar la respuesta`);
      }

      if (!response.ok) {
        // Manejar diferentes tipos de errores del backend
        let errorMessage = 'Error al cambiar contraseña';
        
        if (response.status === 400) {
          errorMessage = data.error || data.message || 'Datos inválidos. Verifica que la contraseña actual sea correcta y que la nueva contraseña cumpla con los requisitos (mayúsculas, minúsculas, números y símbolos).';
        } else if (response.status === 401) {
          errorMessage = 'Credenciales inválidas. La contraseña actual no es correcta.';
        } else if (response.status === 404) {
          errorMessage = 'Servicio no disponible. El endpoint no fue encontrado. Contacta al administrador.';
        } else if (response.status >= 500) {
          errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
        } else {
          errorMessage = data.error || data.message || `Error del servidor (${response.status})`;
        }
        
        NotificationService.error(
          'Error al cambiar contraseña',
          errorMessage
        );
        return;
      }

      NotificationService.success(
        'Contraseña actualizada exitosamente',
        data.message || 'Tu contraseña ha sido cambiada correctamente. La próxima vez que inicies sesión, usa tu nueva contraseña.'
      );

      handleCancel();
    } catch (error) {
      let errorMessage = 'Ha ocurrido un error inesperado';
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
        } else if (error.message.includes('Cannot PUT')) {
          errorMessage = 'El servicio no está disponible. El servidor puede estar temporalmente inaccesible.';
        } else {
          errorMessage = error.message;
        }
      }
      
      NotificationService.error(
        'Error al cambiar contraseña',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contrasenaActual: '',
      contrasenaNueva: '',
      confirmarContrasena: '',
    });
    setShowPasswords({
      actual: false,
      nueva: false,
      confirmar: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Cambiar Contraseña
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Contraseña Actual */}
          <div className="space-y-2">
            <label htmlFor="contrasenaActual" className="block text-sm font-medium text-gray-700">
              Contraseña Actual *
            </label>
            <div className="relative">
              <input
                type={showPasswords.actual ? "text" : "password"}
                id="contrasenaActual"
                name="contrasenaActual"
                value={formData.contrasenaActual}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña actual"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('actual')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPasswords.actual ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="space-y-2">
            <label htmlFor="contrasenaNueva" className="block text-sm font-medium text-gray-700">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPasswords.nueva ? "text" : "password"}
                id="contrasenaNueva"
                name="contrasenaNueva"
                value={formData.contrasenaNueva}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu nueva contraseña"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('nueva')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPasswords.nueva ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Mínimo 8 caracteres
            </p>
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirmar ? "text" : "password"}
                id="confirmarContrasena"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirma tu nueva contraseña"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmar')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPasswords.confirmar ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
}

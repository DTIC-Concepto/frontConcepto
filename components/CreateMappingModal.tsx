'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import NotificationService from "@/lib/notifications";

interface CreateMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (justification: string) => Promise<void>;
  mappingType: 'OPP-RA' | 'EUR-ACE';
}

export default function CreateMappingModal({
  isOpen,
  onClose,
  onSave,
  mappingType
}: CreateMappingModalProps) {
  const [justification, setJustification] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const trimmedJustification = justification.trim();
    
    // Validación: campo vacío
    if (!trimmedJustification) {
      NotificationService.warning(
        'Campo requerido',
        'Por favor, ingrese una justificación para esta relación.'
      );
      return;
    }

    // Validación: longitud mínima de 10 caracteres
    if (trimmedJustification.length < 10) {
      NotificationService.warning(
        'Justificación muy corta',
        'La justificación debe tener al menos 10 caracteres.'
      );
      return;
    }

    try {
      setIsLoading(true);
      await onSave(trimmedJustification);
      
      NotificationService.success(
        'Relación creada',
        'La relación se ha creado exitosamente.'
      );
      
      setJustification('');
      onClose();
    } catch (error) {
      console.error('Error guardando mapping:', error);
      NotificationService.error(
        'Error al guardar',
        error instanceof Error ? error.message : 'No se pudo guardar la relación. Por favor, intente nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setJustification('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#171A1F] font-montserrat">
            Crear Mapeo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-[#565D6D] font-open-sans">
            Asegúrese de que la justificación se aclara.
          </p>

          {/* Campo de justificación */}
          <div className="space-y-2">
            <Label htmlFor="justification" className="text-sm font-medium text-[#171A1F]">
              Justificación *
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ingrese la justificación para esta relación..."
              className="min-h-[100px] resize-none"
              disabled={isLoading}
              maxLength={1500}
            />
            <div className="flex justify-end">
              <p className="text-[12px] text-gray-500">
                {justification.length} de 1500
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !justification.trim()}
              className="bg-[#003366] hover:bg-[#002244] text-white px-6"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
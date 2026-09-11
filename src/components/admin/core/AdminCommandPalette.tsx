import React from 'react';
import { CommandPaletteModal } from '../ai/CommandPaletteModal';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerQuickAction?: (actionId: string) => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onTriggerQuickAction,
}) => {
  return (
    <CommandPaletteModal
      isOpen={isOpen}
      onClose={onClose}
      onOpenModal={(modalName) => {
        if (onTriggerQuickAction) {
          if (modalName === 'AiProductIntakeModal') {
            onTriggerQuickAction('add-product');
          } else {
            onTriggerQuickAction(modalName);
          }
        }
      }}
    />
  );
};

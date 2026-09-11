import React from 'react';
import { Product } from '../../types';
import { CustomerActionWizardModal } from '../customer/CustomerActionWizardModal';
import { ReservationModal } from '../public/ReservationModal';
import { CustomerActionType } from '../../types/customerActions';

interface ProductActionModalsProps {
  product: Product;
  modalType: 'buy' | 'negotiate' | 'showroom' | 'directions' | 'reserve' | 'exchange' | 'inquiry' | null;
  onClose: () => void;
}

export const ProductActionModals: React.FC<ProductActionModalsProps> = ({
  product,
  modalType,
  onClose,
}) => {
  if (!modalType) return null;

  if (modalType === 'reserve') {
    return (
      <ReservationModal
        product={product}
        isOpen={true}
        onClose={onClose}
      />
    );
  }

  let mappedActionType: CustomerActionType = 'request_purchase';

  if (modalType === 'buy') mappedActionType = 'request_purchase';
  else if (modalType === 'negotiate') mappedActionType = 'negotiate';
  else if (modalType === 'showroom' || modalType === 'directions') mappedActionType = 'visit_showroom';
  else if (modalType === 'exchange') mappedActionType = 'exchange';
  else if (modalType === 'inquiry') mappedActionType = 'ask_question';

  return (
    <CustomerActionWizardModal
      product={product}
      actionType={mappedActionType}
      onClose={onClose}
    />
  );
};

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LmsPop from '@pages/LmsPop';
import LmsHeader from '@pages/LmsHeader';
import KjoPop from '@pages/KjoPop';
import KjoHeaderPopup from '@pages/kjoHeaderPopup';

const PopupRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/popup/lms_pop' element={<LmsPop />} />
      <Route path='/popup/lms_Header' element={<LmsHeader />} />
      <Route path='/popup/kjo_pop' element={<KjoPop />} />
      <Route path='/popup/kjo_header_pop' element={<KjoHeaderPopup />} />
    </Routes>
  );
};

export default PopupRoutes;

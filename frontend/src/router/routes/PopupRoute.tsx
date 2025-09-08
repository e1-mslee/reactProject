import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LmsPop from '@pages/lms/LmsPop';
import LmsHeader from '@pages/lms/LmsHeader';
import KjoPop from '@pages/kjo/KjoPop';
import KjoHeaderPopup from '@pages/kjo/kjoHeaderPopup';
import KjoTablePop from '@pages/kjo/kjoTablePop';

const PopupRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/popup/lms_pop' element={<LmsPop />} />
      <Route path='/popup/lms_Header' element={<LmsHeader />} />
      <Route path='/popup/kjo_pop' element={<KjoPop />} />
      <Route path='/popup/kjo_header_pop' element={<KjoHeaderPopup />} />
      <Route path='/popup/kjo_table_pop' element={<KjoTablePop />} />
    </Routes>
  );
};

export default PopupRoutes;

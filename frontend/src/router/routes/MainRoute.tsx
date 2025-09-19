import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '@pages/Home';
import Lms from '@pages/lms/Lms';
import Kjo from '@pages/kjo/Kjo';
import MultiRows from '@/pages/gridSamples/multiHeader/MultiHeaders';
import MergedCells from '@/pages/gridSamples/mergedCell/MergedCell';

const MainRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/home' element={<Home />} />
      <Route path='/lms' element={<Lms />} />
      <Route path='/kjo' element={<Kjo />} />
      <Route path='/mergedCell' element={<MergedCells />} />
      <Route path='/multiHeader' element={<MultiRows />} />
      <Route path='*' element={<Home />} />
    </Routes>
  );
};

export default MainRoutes;

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '@pages/Home';
import Lms from '@pages/Lms';
import Kjo from '@pages/Kjo';

const MainRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path='/' element={<Home key={location.key} />} />
      <Route path='/lms' element={<Lms key={location.key} />} />
      <Route path='/kjo' element={<Kjo key={location.key} />} />
      <Route path='*' element={<Home key={location.key} />} />
    </Routes>
  );
};

export default MainRoutes;

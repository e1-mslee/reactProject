import React from 'react';
import {Routes, Route, useLocation, Outlet, Navigate} from 'react-router-dom';
import Home from '@pages/Home';

import Lms from '@pages/lms/Lms';
import Kjo from '@pages/kjo/Kjo';

const MainRoutes: React.FC = () => {
    function PrivateRoute() {
        const isLoggedIn = Boolean(localStorage.getItem('accessToken')); // 로그인 체크 예시

        return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
    }

  return (
    <Routes>
        <Route element={<PrivateRoute />}>
            <Route path='/' element={<Home />} />
            <Route path='/home' element={<Home />} />
            <Route path='/lms' element={<Lms />} />
            <Route path='/kjo' element={<Kjo />} />
        </Route>
    </Routes>
  );
};

export default MainRoutes;

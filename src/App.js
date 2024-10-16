// src/App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from './axiosConfig';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import Layout from './components/Layout';
import AdvantageousCars from './components/AdvantageousCars';
import RecommendCars from './components/RecommendCars';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [userRole, setUserRole] = useState('');

  // useEffect(() => {
  //   axios.get('/auth/user')
  //     .then(res => {
  //       setIsLoggedIn(true);
  //       setUserRole(res.data.role);
  //     })
  //     .catch(() => {
  //       setIsLoggedIn(false);
  //       setUserRole('');
  //     });
  // }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    // setUserRole('');
  };

  // if (!isLoggedIn) {
  //   return (
  //     <Router>
  //       <Routes>
  //         <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
  //         <Route path="*" element={<Navigate to="/login" />} />
  //       </Routes>
  //     </Router>
  //   );
  // }

  return (
    <Router>
      {/* <Layout userRole={userRole} onLogout={handleLogout}> */}
      <Layout  onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/advantageous" element={<AdvantageousCars />} />
          <Route path="/recommend" element={<RecommendCars />} />
          {/* {userRole === 'admin' && (
            <Route path="/users" element={<UserManagement />} />
          )} */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
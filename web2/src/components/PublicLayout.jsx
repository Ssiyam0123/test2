// components/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';


const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#000c1d] to-[#00112c]">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
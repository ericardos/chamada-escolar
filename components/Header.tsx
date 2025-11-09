import React from 'react';

export const Header: React.FC = () => (
  <header className="py-6 mb-6 text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
      QR CODE Chamada Escolar
    </h1>
    <p className="text-md text-gray-400 mt-2">Gerenciador de Presença com QR Code</p>
  </header>
);
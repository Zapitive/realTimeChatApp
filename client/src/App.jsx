import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/authPage';
import ChatApp from './pages/chatsPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthPage/>} />
          <Route path='/chats' element={<ChatApp/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

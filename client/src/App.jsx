import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/authPage';
import ChatsPage from './pages/chatsPage';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthPage/>} />
          <Route path='/chats' element={<ChatsPage/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

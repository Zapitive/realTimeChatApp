import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import ChatsPage from './pages/ChatsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthPage/>} />
          <Route 
            path='/chats' 
            element={
              <ProtectedRoute>
                <ChatsPage/>
              </ProtectedRoute>
            } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

import React, { useState } from 'react';

export default function ChatApp() {
  const [selectedUser, setSelectedUser] = useState(1);
  const [messages, setMessages] = useState({
    1: [
      { id: 1, sender: 'Sarah Johnson', text: 'Hey! How are you doing?', timestamp: '10:30 AM', isOwn: false },
      { id: 2, sender: 'You', text: 'I\'m doing great! Just working on some projects.', timestamp: '10:31 AM', isOwn: true },
      { id: 3, sender: 'Sarah Johnson', text: 'That sounds amazing! Tell me more 😊', timestamp: '10:32 AM', isOwn: false },
      { id: 4, sender: 'You', text: 'Building a chat app with React and Tailwind CSS', timestamp: '10:33 AM', isOwn: true },
    ],
    2: [
      { id: 1, sender: 'Alex Chen', text: 'Meeting at 2 PM?', timestamp: '2:15 PM', isOwn: false },
      { id: 2, sender: 'You', text: 'Sure! I\'ll be there', timestamp: '2:16 PM', isOwn: true },
    ],
    3: [
      { id: 1, sender: 'Emma Davis', text: 'Did you see the latest update?', timestamp: '3:45 PM', isOwn: false },
    ],
  });
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const users = [
    { id: 1, name: 'Sarah Johnson', status: 'online', avatar: '👩‍💼', lastMessage: 'That sounds amazing! Tell me more 😊' },
    { id: 2, name: 'Alex Chen', status: 'online', avatar: '👨‍💻', lastMessage: 'Sure! I\'ll be there' },
    { id: 3, name: 'Emma Davis', status: 'away', avatar: '👩‍🔬', lastMessage: 'Did you see the latest update?' },
    { id: 4, name: 'James Wilson', status: 'offline', avatar: '👨‍🎨', lastMessage: 'Great work on the design!' },
    { id: 5, name: 'Olivia Brown', status: 'online', avatar: '👩‍🎓', lastMessage: 'See you tomorrow!' },
    { id: 6, name: 'Michael Lee', status: 'offline', avatar: '👨‍🏫', lastMessage: 'Thanks for the feedback' },
  ];

  const currentUser = users.find(u => u.id === selectedUser);
  const currentMessages = messages[selectedUser] || [];
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const newMessage = {
        id: (currentMessages.length || 0) + 1,
        sender: 'You',
        text: inputMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages(prev => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), newMessage]
      }));
      setInputMessage('');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Left Sidebar - Users List */}
      <div className="w-full sm:w-80 backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            Messages
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 text-sm"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 relative group ${
                  selectedUser === user.id
                    ? 'bg-white/15 border border-purple-400/50 shadow-lg shadow-purple-500/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <span className="text-3xl">{user.avatar}</span>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-slate-900`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{user.name}</h3>
                    <p className="text-gray-400 text-xs truncate">{user.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium">
            ⚙️
          </button>
          <button className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 text-sm font-medium">
            + New Chat
          </button>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col h-screen backdrop-blur-xl bg-white/5 border-l border-white/10 overflow-hidden">
        {currentUser ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{currentUser.avatar}</span>
                <div>
                  <h2 className="text-white font-semibold text-lg">{currentUser.name}</h2>
                  <p className={`text-xs ${
                    currentUser.status === 'online' ? 'text-green-400' : 
                    currentUser.status === 'away' ? 'text-yellow-400' : 
                    'text-gray-400'
                  }`}>
                    {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-300 hover:text-white">
                  ☎️
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-300 hover:text-white">
                  📹
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-300 hover:text-white">
                  ⋮
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.isOwn
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                        : 'bg-white/10 border border-white/20 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isOwn ? 'text-purple-100' : 'text-gray-400'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <button
                  type="button"
                  className="p-3 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-300 hover:text-white"
                >
                  📎
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-semibold active:scale-95"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
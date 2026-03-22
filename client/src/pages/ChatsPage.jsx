import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import ChatWindow from '../components/ChatWindow';
import MobileOverlay from '../components/MobileOverlay';
import { useAxiosPrivate } from '../api/axiosPrivate';

export default function ChatsPage() {

    const api = useAxiosPrivate();
    // State Management
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
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

    // User Data
    const users = [
        { id: 1, name: 'Sarah Johnson', status: 'online', avatar: '👩‍💼', lastMessage: 'That sounds amazing! Tell me more 😊' },
        { id: 2, name: 'Alex Chen', status: 'online', avatar: '👨‍💻', lastMessage: 'Sure! I\'ll be there' },
        { id: 3, name: 'Emma Davis', status: 'offline', avatar: '👩‍🔬', lastMessage: 'Did you see the latest update?' },
        { id: 4, name: 'James Wilson', status: 'offline', avatar: '👨‍🎨', lastMessage: 'Great work on the design!' },
        { id: 5, name: 'Olivia Brown', status: 'online', avatar: '👩‍🎓', lastMessage: 'See you tomorrow!' },
        { id: 6, name: 'Michael Lee', status: 'offline', avatar: '👨‍🏫', lastMessage: 'Thanks for the feedback' },
    ];

    // Computed Values
    const filteredUsers = users;
    const currentUser = selectedUser ? users.find(u => u.id === selectedUser) : null;
    const currentMessages = selectedUser ? (messages[selectedUser] || []) : [];

    // Helper Functions
    const getStatusColor = (status) => {
        switch (status) {
        case 'online':
            return 'bg-green-500';
        case 'offline':
            return 'bg-gray-500';
        default:
            return 'bg-gray-500';
        }
    };

    // Event Handlers
    const handleSelectUser = (userId) => {
        setSelectedUser(userId);
        setShowSidebar(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && selectedUser) {
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

    const handleBackClick = () => {
        setSelectedUser(null);
        setShowSidebar(true);
    };

    const handleOpenMessages = () => {
        setShowSidebar(true);
    };

    const handleCloseSidebar = () => {
        setShowSidebar(false);
    };

    //Searching users according to email or username
    const handleSearchChange = async(query) => {
        // setSearchQuery(e.target.value);
        try{
            if(!query) return;
            setSearchLoading(true);
            const response = await api.get(
                `/api/user/searchUser`,{
                    params: { searchValue: query },
                    withCredentials:true
                }
            );
            if (response) {
                setSearchLoading(false);
                setSearchResults(response.data.users);
            }
        }catch(err){
            console.log(err)
        }
        
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
    };


    

    // debouncing for rate limiting
    useEffect(()=>{
        const timer = setTimeout(()=>{
            handleSearchChange(searchQuery);
        },1000);

        return () => clearTimeout(timer);

    },[searchQuery]);

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

        {/* Mobile Overlay */}
        <MobileOverlay isVisible={showSidebar} onClose={handleCloseSidebar} />

        {/* Left Sidebar */}
        <UserSidebar
            filteredUsers={filteredUsers}
            selectedUser={selectedUser}
            showSidebar={showSidebar}
            searchResults={searchResults}
            searchLoading={searchLoading}
            searchQuery={searchQuery}
            getStatusColor={getStatusColor}
            setSearchQuery={setSearchQuery}
            onSelectUser={handleSelectUser}
            onCloseSidebar={handleCloseSidebar}
        />

        {/* Right Chat Window */}
        <ChatWindow
            selectedUser={selectedUser}
            currentUser={currentUser}
            currentMessages={currentMessages}
            inputMessage={inputMessage}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            onBackClick={handleBackClick}
            onOpenMessages={handleOpenMessages}
        />
        </div>
    );
}
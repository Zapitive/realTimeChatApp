import React, { useState, useEffect, useRef } from 'react';
import UserSidebar from '../components/UserSidebar';
import ChatWindow from '../components/ChatWindow';
import MobileOverlay from '../components/MobileOverlay';
import { useAxiosPrivate } from '../api/axiosPrivate';
import { useAuth } from '../context/authContext';
import { useSocketWithAuth } from '../socket/useSocketWithAuth';



export default function ChatsPage() {

    const { accessToken } = useAuth();
    const api = useAxiosPrivate();
    const socket = useSocketWithAuth();
    // State Management
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState({
        // 1: [
        // { id: 1, sender: 'Sarah Johnson', text: 'Hey! How are you doing?', timestamp: '10:30 AM', isOwn: false },
        // { id: 2, sender: 'You', text: 'I\'m doing great! Just working on some projects.', timestamp: '10:31 AM', isOwn: true },
        // { id: 3, sender: 'Sarah Johnson', text: 'That sounds amazing! Tell me more 😊', timestamp: '10:32 AM', isOwn: false },
        // { id: 4, sender: 'You', text: 'Building a chat app with React and Tailwind CSS', timestamp: '10:33 AM', isOwn: true },
        // ],
        // 2: [
        // { id: 1, sender: 'Alex Chen', text: 'Meeting at 2 PM?', timestamp: '2:15 PM', isOwn: false },
        // { id: 2, sender: 'You', text: 'Sure! I\'ll be there', timestamp: '2:16 PM', isOwn: true },
        // ],
        // 3: [
        // { id: 1, sender: 'Emma Davis', text: 'Did you see the latest update?', timestamp: '3:45 PM', isOwn: false },
        // ],
    });

    // User Data
    const [users, setUsers] = useState([
        // example User from backend
        // { id: 1, users:{name: 'Sarah Johnson', status: 'online', lastMessage: 'That sounds amazing! Tell me more 😊'} },
        // { id: 2, name: 'Alex Chen', status: 'online', avatar: '👨‍💻', lastMessage: 'Sure! I\'ll be there' },
    ]);

    const usersRef = useRef(users);
    const activeChatRef = useRef(selectedUser);

    const [loading, setLoading] = useState({
        chats: false,
        messages: false,
        search: false,
        sendingMessage: false,
    });

    const setLoadingState = (key, value) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    };

    const [appError, setAppError] = useState(null);


    // Computed Values
    const filteredUsers = users;

    // displaying current chat in chat window
    // console.log(users)
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

    const showError = (message, duration = 5000) => {
        setAppError(message);
        const timer = setTimeout(() => setAppError(null), duration);
        return () => clearTimeout(timer);
    };

    // Event Handlers
    const handleSelectUser = async (userId) => {
        const exists = users.find(user => user.id === userId);
        if (!exists && searchResults.length > 0){
            const newUser = searchResults.find(u => u.id === userId);
            const chatId = await createChatRoom(userId);
            const updateUser = {
                id : chatId,
                users: newUser
            }
            setUsers(prev => {
                return [...prev, updateUser];
            });
            socket.emit('joinRoom', {activeChatId: chatId});
            setSelectedUser(chatId);
        }else{
            socket.emit('joinRoom', {activeChatId: exists.id});
            setSelectedUser(exists.id);
        } 
        setSearchQuery('');
        setSearchResults([]);
        setShowSidebar(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && selectedUser) {
            
            const newMessage = {
                id: (currentMessages.length || 0) + 1,
                text: inputMessage,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                isOwn: true,
            };
            setMessages(prev => ({
                ...prev,
                [selectedUser]: [...(prev[selectedUser] || []), newMessage]
            }));
            socket.emit('sendMessage',{chatId: selectedUser, messageInp: inputMessage},(response)=>{
                
                if(response.status === "ok"){
                    setUsers((prev)=>
                        prev.map((chat) =>
                        chat.id === selectedUser
                        ? {
                            ...chat,
                            users: {
                                ...chat.users,
                                lastMessage: inputMessage
                            }
                            }
                        : chat
                    )
                    );
                }else{
                    // can add features for not sent message
                    console.log('no response')
                }
            });
            
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

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
    };

    // api calls

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

    // debouncing for rate limiting
    useEffect(()=>{
        const timer = setTimeout(()=>{
            handleSearchChange(searchQuery);
        },1000);

        return () => clearTimeout(timer);

    },[searchQuery]);

    // creating chat room
    const createChatRoom = async (userId) => {
        try{
            const response = await api.post(
                '/api/chats',{
                    receiverId: userId
                },{
                  withCredentials:true
                }
            );

            
            return response.data.chatId
        }catch(err){
            console.log(err)
        }
    }

    // get chat messages 
    
    const getMessages = async (chatId) =>{
        try{
            const response = await api.get(
                '/api/messages',{
                    params :{
                        chatId: chatId
                    },
                    withCredentials: true
                }
            );
            return response.data.chatMessages
        }catch(err){
            console.log(err)
        }
    }

    useEffect(()=>{

        const controller = new AbortController();

        const fetchMessages = async () =>{    
            if (!selectedUser) return;

            if (messages[selectedUser]) return;

            
            try{   
                setLoadingState('messages',true)
                const chatMessages = await getMessages(selectedUser);

                if (controller.signal.aborted) return;
                    
                const transformedMessages = chatMessages
                    .slice()
                    .reverse()
                    .map((msg) => {
                        const date = new Date(msg.timestamp);
                        const formattedTime = date.toLocaleTimeString([],{
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        return {
                            ...msg,
                            timestamp: formattedTime
                        };    
                    });
                setMessages((prev) => ({
                    ...prev,
                    [selectedUser]: transformedMessages
                }));
            }catch(err){
                if (!controller.signal.aborted){
                    showError('Failed to load messages');
                    console.log(err);
                }
            }finally{
                setLoadingState('messages',false)
            }
        };

        fetchMessages();
        usersRef.current = users;
        activeChatRef.current = selectedUser;

        return () => controller.abort();
    },[selectedUser, messages, users])

    //getting all chats

    useEffect(()=>{
        const getChats = async()=>{
            try{
                setLoadingState('chats',true)
                const response = await api.get(
                    '/api/chats',{
                    withCredentials:true
                    }
                );
                setUsers(response.data.chats || []);
            }catch(err){
                showError('Failed to load chats!');
                console.log(err);
                setUsers([]);
            }finally{
                setLoadingState('chats', false)
            }
        }

        getChats();
        
    },[api]);

    

    // socket connection
    useEffect(() =>{
        if(!socket.connected){
            socket.auth = {
                token: accessToken,
            };
            socket.connect();
        }

        // socket receive method methods 
        const handleReceive = (msg) =>{

            const date = new Date(msg.createdAt);

            const formatted = date.toLocaleTimeString([],{
                hour: '2-digit',
                minute: '2-digit'
            });

            const receiver = usersRef.current.find(u => u.id === msg.chatId);
            const newMessage = {
                id: msg._id,
                text: msg.content,
                timestamp: formatted,
                isOwn: receiver.users.id !== String(msg.senderId),
            }

            if (!newMessage.isOwn){
                setMessages(prev => ({
                    ...prev,
                    [msg.chatId]: [...(prev[msg.chatId] || []), newMessage]
                }));
            }
            
        }

        const handleNotification = (msg) =>{
            const date = new Date(msg.createdAt);

            const formatted = date.toLocaleTimeString([],{
                hour: '2-digit',
                minute: '2-digit'
            });
            
            

            setUsers((prev) =>
                prev.map((user) =>
                user.id === msg.chatId
                    ? {
                        ...user,
                        users: {
                                ...user.users,
                                lastMessage: msg.content
                            }
                    }
                    : user
                )
            );

            if (String(activeChatRef.current) !== String(msg.chatId)){
                const senderName = usersRef.current.find(u => u.id === String(msg.chatId))?.users?.name;
                alert(`${msg.content} from ${senderName} at ${formatted}`);
            }

        }

        // user status update
        const handleOnline = ({userId}) =>{
            setUsers( prev =>
                prev.map(user =>
                    user.users.id === userId
                    ? {
                        ...user,
                        users:{
                            ...user.users,
                            status: 'online'
                        }
                    }: user
                )
            );
        }

        const handleOffline = ({userId}) =>{
            setUsers( prev =>
                prev.map(user =>
                    user.users.id === userId
                    ? {
                        ...user,
                        users:{
                            ...user.users,
                            status: 'offline'
                        }
                    }: user
                )
            );
        }

        socket.on('userOnline', handleOnline);
        socket.on('userOffline', handleOffline);
        socket.on('receiveMessage',handleReceive);
        socket.on('receiveNotification', handleNotification)

        return () =>{
            socket.off('userOnline', handleOnline);
            socket.off('userOffline', handleOffline);
            socket.off('receiveMessage',handleReceive);
            socket.off('receiveNotification',handleNotification);
            socket.disconnect();
        };
    },[accessToken]);

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
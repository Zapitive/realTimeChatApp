import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const [activeChatId, setActiveChatId] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [chats, setChats] = useState({
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

    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    const usersRef = useRef(users);
    const activeChatRef = useRef(activeChatId);
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const prevScrollHeightRef = useRef(0)

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
    // console.log(chats[activeChatId]?.messages.length)
    const currentUser = activeChatId ? users.find(u => u.id === activeChatId) : null;
    
    const currentMessages = activeChatId ? (chats[activeChatId] || {
        messages: [],
        cursor: null,
        hasMore: true,
        isTyping: false
    }) : {};

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
            setActiveChatId(chatId);
        }else{
            socket.emit('joinRoom', {activeChatId: exists.id});
            socket.emit('messagesSeen', {chatId: exists.id});
            setActiveChatId(exists.id);
        } 
        setSearchQuery('');
        setSearchResults([]);
        setShowSidebar(false);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && activeChatId) {
            const tempId = (currentMessages.length || 0) + 1;
            const newMessage = {
                id: tempId,
                text: inputMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isOwn: true,
            };
            setChats(prev => {
                const chat = prev[activeChatId] || {
                    messages: [],
                    cursor: null,
                    hasMore: true
                };

                return {
                    ...prev,
                    [activeChatId]:{
                        ...chat,
                        messages: [...chat.messages, newMessage]
                    }
                }
            });
            socket.emit('sendMessage',{chatId: activeChatId, messageInp: inputMessage},(response)=>{
                
                if(response.status === "ok"){
                    setUsers((prev)=>
                        prev.map((chat) =>
                        chat.id === activeChatId
                        ? {
                            ...chat,
                            users: {
                                ...chat.users,
                                lastMessage: inputMessage
                            }
                            }
                        : chat
                    ));

                    setChats(prev => {
                        const chat = prev[activeChatId];
                        if (!chat) return prev;

                        return {
                            ...prev,
                            [activeChatId]: {
                            ...chat,
                            messages: chat.messages.map(msg =>
                                msg.id === tempId
                                ? { ...msg, id: response.msgId, msgStatus: response.msgStatus }
                                : msg
                            )
                            }
                        };
                    });
                }else{
                    // can add features for not sent message
                    console.log('no response')
                }
            });
            
            setInputMessage('');
        }
    };

    const handleBackClick = () => {
        setActiveChatId(null);
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
        const value = e.target.value;
        setInputMessage(value);

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { chatId: activeChatId });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { chatId: activeChatId });
            setIsTyping(false);
        }, 1000);
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
    
    const getMessages = async (params) =>{
        try{
            const response = await api.get(
                '/api/messages',{
                    params : params,
                    withCredentials: true
                }
            );
            return response.data
        }catch(err){
            console.log(err)
        }
    }

    const fetchMessages = async(controller, chatId, isInitial = false) =>{
        if (!chatId) return;
        if (loading.messages) return;

        const chat = chats[chatId];

        if(!isInitial && chat && !chat.hasMore) return;

        setLoadingState('messages',true);

        try{
            const params = { chatId };

            if(!isInitial && chat?.cursor){
                params.cursorCreatedAt = chat.cursor.createdAt;
            }

            const res = await getMessages(params);

            if (controller.signal.aborted) return;

            const formatted = res.chatMessages
                .slice()
                .reverse()
                .map((msg) => {
                    const date = new Date(msg.timestamp);
                    return {
                        ...msg,
                        timestamp: date.toLocaleTimeString([],{
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                    };    
            });

            setChats((prev) =>{
                const existing = prev[chatId] || {
                    messages: [],
                    cursor: null,
                    hasMore: true,
                };

                return {
                    ...prev,
                    [chatId]: {
                        messages: isInitial
                            ? formatted
                            : [...formatted, ...existing.messages],
                        cursor: res.nextCursor,
                        hasMore: !!res.nextCursor,
                    },
                };
            });
            

        }catch(err){
            console.log(err);
        }finally{
            setLoadingState('messages',false);
        }
    }
//--------------------------------------------------------infinite Scroll for  messages----------------------------------------------------------------------------
    const handleScroll = useCallback(async () => {
        const container = containerRef.current;

        if (!container) return;
        if (loading.messages || !chats[activeChatId]?.hasMore) return;

        if (container.scrollTop <= 0) {
            const chatId = activeChatRef.current;
            const params = { chatId };

            if (chats[activeChatId]?.cursor) {
                params.cursorCreatedAt = chats[activeChatId].cursor;
            }

            prevScrollHeightRef.current = container.scrollHeight;

            const res = await getMessages(params);
            const formatted = res.chatMessages
                .slice()
                .reverse()
                .map((msg) => {
                    const date = new Date(msg.timestamp);
                    return {
                        ...msg,
                        timestamp: date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    };
                });

            setChats((prev) => {
                const existing = prev[chatId] || {
                    messages: [],
                    cursor: null,
                    hasMore: true,
                };
                return {
                    ...prev,
                    [chatId]: {
                        messages: [...formatted, ...existing.messages],
                        cursor: res.nextCursor,
                        hasMore: !!res.nextCursor,
                    },
                };
            });
        }
    }, [activeChatId, loading.messages, chats]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !prevScrollHeightRef.current) return;

        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0; 
    }, [chats[activeChatId]?.messages?.length]);

//--------------------- try to combine the both useEffects---------------------------------------------------------------------------------------------------------
    useEffect(()=>{

        const controller = new AbortController();
        
        const chat = chats[activeChatId];
        if (!chat || chat.messages.length === 0){
            fetchMessages(controller, activeChatId, true);
        }
        
        usersRef.current = users;
        activeChatRef.current = activeChatId;

        const el = containerRef.current;
        if (el){
            const isNearBottom =
                el.scrollHeight - el.scrollTop - el.clientHeight < 400;

            if (isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }}

        return () => controller.abort();
    },[activeChatId]);

    useEffect(() => {
        if (!messagesEndRef.current) return;

        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
            behavior: "auto"
            });
        }, 50);
    }, [activeChatId]);

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
                setChats(prev => {
                    const chat = prev[msg.chatId] || {
                        messages: [],
                        cursor: null,
                        hasMore: false
                    };

                    return {
                        ...prev,
                        [msg.chatId]:{
                            ...chat,
                            messages: [...chat.messages, newMessage]
                        }
                    }
                });
            }
            
        }

        const handleNotification = (msg) =>{
            socket.emit('messageReceived',{msgId: msg._id, chatId: msg.chatId, senderId: msg.senderId});

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
            }else{
                socket.emit('messageSeen', {msgId: msg._id, senderId: msg.senderId, chatId: msg.chatId});
            }
        }

        const handleReceivedUpdate = async(data)=>{

            const {msgId, chatId, senderId} = data;

            
            setChats(prev => {
                const chat = prev[chatId];
                if (!chat) return prev;

                return {
                    ...prev,
                    [chatId]: {
                    ...chat,
                    messages: (chat.messages || []).map(msg =>
                        msg.id === String(msgId)
                        ? { ...msg, msgStatus: 'received' }
                        : msg
                    )
                    }
                };
            });
        }

        const handleSeenUpdate = (data) =>{
            const {chatId} = data;
            if (!chats[chatId]?.length) return;
            setChats( prev => {
                const chat = prev[chatId];

                return {
                    ...prev,
                    [chatId]:{
                        ...chat,
                        messages: (chat.messages || []).map( msg =>
                            msg.isOwn === true
                            ? {...msg, msgStatus: 'seen'}
                            :msg
                        )
                    }
                }
            })
            
        }

        const handleSeenMessage = (data) =>{
            const {msgId, chatId} = data
            setChats(prev => {
                const chat = prev[chatId];
                if (!chat) return prev;

                return {
                    ...prev,
                    [chatId]: {
                    ...chat,
                    messages: (chat.messages || []).map(msg =>
                        msg.id === String(msgId)
                        ? { ...msg, msgStatus: 'seen' }
                        : msg
                    )
                    }
                };
            });
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

        const handleTyping = ({ chatId })=>{
            setChats(prev => {
                const chat = prev[chatId] || {};

                return {
                    ...prev,
                    [chatId]:{
                        ...chat,
                        isTyping: true
                    }
                }
            });
        }
        const handleStopTyping = ({ chatId })=>{
            setChats(prev => {
                const chat = prev[chatId] || {};

                return {
                    ...prev,
                    [chatId]:{
                        ...chat,
                        isTyping: false
                    }
                }
            });
        }

        socket.on('userOnline', handleOnline);
        socket.on('userOffline', handleOffline);
        socket.on('receiveMessage', handleReceive);
        socket.on('receiveNotification', handleNotification);
        socket.on('receivedUpdate', handleReceivedUpdate);
        socket.on('seenUpdate', handleSeenUpdate);
        socket.on('seenSingleMessage', handleSeenMessage);
        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);

        return () =>{
            socket.off('userOnline', handleOnline);
            socket.off('userOffline', handleOffline);
            socket.off('receiveMessage', handleReceive);
            socket.off('receiveNotification', handleNotification);
            socket.off('receivedUpdate', handleReceivedUpdate);
            socket.off('seenUpdate', handleSeenUpdate);
            socket.off('seenSingleMessage', handleSeenMessage);
            socket.off('typing', handleTyping);
            socket.off('stopTyping', handleStopTyping);
            socket.disconnect();
        };
    },[accessToken]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden relative">

        <style>{`
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
            selectedUser={activeChatId}
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
            selectedUser={activeChatId}
            currentUser={currentUser}
            currentMessages={currentMessages}
            inputMessage={inputMessage}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            onBackClick={handleBackClick}
            onOpenMessages={handleOpenMessages}
            containerRef = {containerRef}
            messagesEndRef = {messagesEndRef}
        />
        </div>
    );
}
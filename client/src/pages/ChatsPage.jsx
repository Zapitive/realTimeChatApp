import React, { useState, useEffect, useRef, useCallback } from 'react';
import UserSidebar from '../components/UserSidebar';
import ChatWindow from '../components/ChatWindow';
import MobileOverlay from '../components/MobileOverlay';
import { useAxiosPrivate } from '../api/axiosPrivate';
import { useAuth } from '../context/authContext';
import { useSocketWithAuth } from '../socket/useSocketWithAuth';
import toast from 'react-hot-toast';

// ─── Utility ────────────────────────────────────────────────────────────────
 
// Converts a raw ISO timestamp into a HH:MM display string.
const formatTimestamp = (isoString) =>
    new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 
// Normalises a raw message from the server into the shape used by the UI.
const formatMessage = (msg) => ({
    ...msg,
    id: msg._id ?? msg.id,
    text: msg.content ?? msg.text,
    timestamp: formatTimestamp(msg.createdAt ?? msg.timestamp),
});

export default function ChatsPage() {

    const { accessToken } = useAuth();
    const api = useAxiosPrivate();
    const socket = useSocketWithAuth();

    // State Management
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [appError, setAppError] = useState(null);

    /* chats example
        chatId:{
            messages: [
                id: 1234,
                isOwn: true,
                timeStamp: Date(),
                msgStatus: 'sent',
                text: 'Hey'
            ],
            hasMore: true,
            cursor: Date(),
            isTyping: true}
    */
    const [chats, setChats] = useState({});

    // users example { id: 1, users:{id: userId, name: 'Sarah Johnson', status: 'online', lastMessage: 'That sounds amazing! Tell me more 😊'} },
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState({
        chats: false,
        messages: false,
        search: false,
        sendingMessage: false,
    });

    // Refs

    const typingTimeoutRef = useRef(null);
    const usersRef = useRef(users);
    const activeChatRef = useRef(activeChatId);
    const containerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    
    // Keep refs in sync with state so socket handlers always see fresh values.
    useEffect(() => { usersRef.current = users; }, [users]);
    useEffect(() => { activeChatRef.current = activeChatId; }, [activeChatId]);

    // derived values
    const currentUser = activeChatId ? users.find(u => u.id === activeChatId) : null;
    
    const currentMessages = activeChatId 
        ? (chats[activeChatId] ?? { messages: [], cursor: null, hasMore: true, isTyping: false 
    }) 
        : {  messages: [], cursor: null, hasMore: false, isTyping: false };

    // Helper Functions

    const setLoadingState = (key, value) =>
        setLoading(prev => ({ ...prev, [key]: value }));

    const showError = (message, duration = 5000) => {
        setAppError(message);
        const timer = setTimeout(() => setAppError(null), duration);
        return () => clearTimeout(timer);
    };

    const getStatusColor = (status) =>
        status === 'online' ? 'bg-green-500' : 'bg-gray-500';

    // updates the last-message preview in the sidebar

    const updateLastMessage = (chatId, text) => {
        setUsers(prev =>
            prev.map(u =>
                u.id === chatId
                    ? { ...u, users: { ...u.users, lastMessage: text } }
                    : u
            )
        );
    };

    // Appends or prepends formatted messages into the chats map. 
    const mergeMessages = (chatId, formatted, { prepend = false, cursor, hasMore }) => {
        setChats(prev => {
            const existing = prev[chatId] ?? { messages: [], cursor: null, hasMore: true };
            return {
                ...prev,
                [chatId]: {
                    ...existing,
                    messages: prepend
                        ? [...formatted, ...existing.messages]
                        : [...existing.messages, ...formatted],
                    cursor,
                    hasMore,
                },
            };
        });
    };

    // API calls----------------------------------------------------------------------------------------------------------------------------------------

    const createChatRoom = async (userId) => {
        try {
            const response = await api.post(
                '/api/chats',
                { receiverId: userId },
                { withCredentials: true }
                );
            return response.data.chatId;
        } catch (err) {
            console.error('createChatRoom:', err);
        }
    };

    // get chat messages 
    const getMessages = async (params) =>{
        try{
            const response = await api.get(
                '/api/messages',{
                    params,
                    withCredentials: true
                });
            return response.data;
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
                params.cursorCreatedAt = chat.cursor;
            }

            const res = await getMessages(params);

            if (controller.signal.aborted || !res) return;

            const formatted = res.chatMessages.slice().reverse().map(formatMessage);
            
            mergeMessages(chatId, formatted, {
                prepend: !isInitial,
                cursor: res.nextCursor,
                hasMore: !!res.nextCursor,
            });

        }catch(err){
            console.error('fetchMessages:', err);
        }finally{
            setLoadingState('messages',false);
        }
    }

    const handleSearchChange = async(query) => {
        if(!query) return;
        setLoadingState('search', true);
        try{
            const response = await api.get(
                `/api/user/searchUser`,{
                    params: { searchValue: query },
                    withCredentials:true
                }
            );
            setSearchResults(response.data.users);
        }catch(err){
            console.log(err)
        }finally{
            setLoadingState('search', false);
        }
        
    };

    // Event Handlers------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    const handleSelectUser = async (userId) => {
        const exists = users.find(user => user.id === userId);

        if (!exists && searchResults.length > 0){
            const newUser = searchResults.find(u => u.id === userId);
            const chatId = await createChatRoom(userId);
            setUsers(prev =>  [...prev, { id: chatId, users: newUser }]);
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
        if (!inputMessage.trim()  || !activeChatId) return;

        const tempId = (currentMessages.messages?.length ?? 0) + 1;
        const newMessage = {
            id: tempId,
            text: inputMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
        };
        setChats(prev => {
            const chat = prev[activeChatId] ?? { messages: [], cursor: null, hasMore: true, isTyping: false };
            return { ...prev, [activeChatId]: { ...chat, messages: [...chat.messages, newMessage] } };
        });
        socket.emit('sendMessage',{ chatId: activeChatId, messageInp: inputMessage }, ( response )=>{
                
            if(response?.status === "ok"){
                updateLastMessage(activeChatId, inputMessage);

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
                console.warn('sendMessage: no ok response', response);
            }
        });
            
        setInputMessage('');
    };

    const handleInputChange = (e) => {
        setInputMessage(e.target.value);
        const value = e.target.value;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { chatId: activeChatId });
        }

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { chatId: activeChatId });
            setIsTyping(false);
        }, 1000);
    };

    const handleBackClick = () => {
        setActiveChatId(null);
        setShowSidebar(true);
    };

    const handleOpenMessages = () => setShowSidebar(true);
    const handleCloseSidebar = () => setShowSidebar(false);

//--------------------------------------------------------infinite Scroll for  messages----------------------------------------------------------------------------
    
    const handleScroll = useCallback(async () => {
        const container = containerRef.current;

        if (!container) return;
        if (loading.messages || !chats[activeChatId]?.hasMore) return;

        if (container.scrollTop <= 0) {
            prevScrollHeightRef.current = container.scrollHeight;
            const controller = new AbortController();

            await fetchMessages(controller, activeChatId, false);
        }
    }, [activeChatId, loading.messages, chats]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Restore scroll position after older messages are prepended.
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !prevScrollHeightRef.current) return;
        container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0; 
    }, [chats[activeChatId]?.messages?.length]);

    // Effects------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
    // debounced user search
    useEffect(()=>{
        const timer = setTimeout(()=> handleSearchChange(searchQuery), 1000);
        return () => clearTimeout(timer);
    },[searchQuery]);
    
    // load messages when the active chat changes.
    useEffect(()=>{
        const chat = chats[activeChatId];
        const controller = new AbortController();
        if (!chat || chat.messages.length === 0){
            fetchMessages(controller, activeChatId, true);
        }
        return () => controller.abort();
    },[activeChatId]);

    // Scroll to bottom when switching to a different chat
    useEffect(() => {
        if (!messagesEndRef.current) return;
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 50);

        return () => clearTimeout(timer);
    }, [activeChatId]);

    // Auto-scroll on new messages(only if already near the bottom)
    useEffect(()=>{
        const el = containerRef.current;
        if(!el) return;
        
        const isNearBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 200;

        if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    },[chats[activeChatId]?.messages])

    
    // Initial chat list load.
    useEffect(()=>{
        const getChats = async()=>{
            setLoading('chats', true);
            try{
                const response = await api.get(
                    '/api/chats',{
                    withCredentials:true
                    }
                );
                setUsers(response.data.chats ?? []);
            }catch(err){
                showError('Failed to load chats!');
                console.error('getChats:', err);
                setUsers([]);
            }finally{
                setLoadingState('chats', false)
            }
        }
        getChats();
    },[]);

    // Socket setup & event handlers.
    useEffect(() =>{
        if(!socket.connected){
            socket.auth = {
                token: accessToken,
            };
            socket.connect();
        }

        // socket receive method 
        const handleReceive = (msg) =>{

            const receiver = usersRef.current.find(u => u.id === msg.chatId);
            if(!receiver) return;

            
            const newMessage = {
                ...formatMessage(msg),
                isOwn: receiver.users.id !== String(msg.senderId),
            }

            setChats(prev => {
                const chat = prev[msg.chatId] ?? { messages: [], cursor: null, hasMore: false, isTyping: false };
                return { ...prev, [msg.chatId]: { ...chat, messages: [...chat.messages, newMessage] } };
            });
            
        }

        const handleNotification = (msg) =>{
            socket.emit('messageReceived',{msgId: msg._id, chatId: msg.chatId, senderId: msg.senderId});

            updateLastMessage(msg.chatId, msg.content);
            

            if (String(activeChatRef.current) !== String(msg.chatId)){
                const user = usersRef.current.find(u => u.id === String(msg.chatId));
                const senderName = user?.users?.name;
                toast(`${msg.content} from ${senderName} at ${formatTimestamp(msg.createdAt)}`, {
                    duration: 3500, 
                    position: 'top-center'
                })
            }else{
                socket.emit('messageSeen', {msgId: msg._id, senderId: msg.senderId, chatId: msg.chatId});
            }
        };

        // message status updates

        const updateMessageStatus = (chatId, predicate, status) => {
            setChats(prev => {
                const chat = prev[chatId];
                if (!chat) return prev;
                return {
                    ...prev,
                    [chatId]: {
                        ...chat,
                        messages: (chat.messages ?? []).map(msg =>
                            predicate(msg) ? { ...msg, msgStatus: status } : msg
                        ),
                    },
                };
            });
        };

        const handleReceivedUpdate = async({ msgId, chatId })=> 
            updateMessageStatus(chatId, msg => msg.id === String(msgId), 'received');

        const handleSeenUpdate = ({ chatId }) =>
            updateMessageStatus(chatId, msg => msg.isOwn, 'seen');

        const handleSeenMessage = ({ msgId, chatId }) =>
            updateMessageStatus(chatId, msg => msg.id === String(msgId), 'seen');

        // user status update

        const handleOnline = ({ userId }) => {
            setUsers(prev =>
                prev.map(u =>
                    u.users.id === userId ? { ...u, users: { ...u.users, status: 'online' } } : u
                )
            );
            
            const chat = usersRef.current.find(u => u.users.id === userId);
            if (chat) {
                updateMessageStatus(
                    chat.id,
                    msg => msg.isOwn && msg.msgStatus === 'sent',
                    'received'
                );
            }
        };


        const handleOffline = ({userId}) =>
            setUsers( prev =>
                prev.map(u =>
                    u.users.id === userId ? { ...u, users:{ ...u.users, status: 'offline' } }: u
                )
            );

        const setTyping = (chatId, value) =>
            setChats(prev => ({
                ...prev,
                [chatId]: { ...(prev[chatId] ?? {}), isTyping: value },
            }));

        
        const handleTyping = ({ chatId }) => setTyping(chatId, true);
        const handleStopTyping = ({ chatId }) => setTyping(chatId, false);

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

        {appError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    {appError}
                    <button className="ml-3 font-bold" onClick={() => setAppError(null)}>✕</button>
                </div>
            )}

        {/* Mobile Overlay */}
        <MobileOverlay isVisible={showSidebar} onClose={handleCloseSidebar} />

        {/* Left Sidebar */}
        <UserSidebar
            filteredUsers={users}
            selectedUser={activeChatId}
            showSidebar={showSidebar}
            searchResults={searchResults}
            searchLoading={loading.search}
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
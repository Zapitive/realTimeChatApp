import ChatHeader from './ChatHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import ChatEmpty from './ChatEmpty';

export default function ChatWindow({
  selectedUser,
  currentUser,
  currentMessages,
  inputMessage,
  onInputChange,
  onSendMessage,
  onBackClick,
  onOpenMessages,
  containerRef,
  messagesEndRef,
  isTyping
}) {
  return (
    <div className="flex-1 flex flex-col h-screen backdrop-blur-xl bg-white/5 border-l border-white/10 overflow-hidden">
      {selectedUser ? (
        <>
          <ChatHeader user={currentUser} onBackClick={onBackClick} />
          <MessagesList messages={currentMessages} containerRef={containerRef} messagesEndRef={messagesEndRef} isTyping={isTyping}/>
          <MessageInput
            inputMessage={inputMessage}
            onInputChange={onInputChange}
            onSubmit={onSendMessage}
          />
        </>
      ) : (
        <ChatEmpty onOpenMessages={onOpenMessages} />
      )}
    </div>
  );
}
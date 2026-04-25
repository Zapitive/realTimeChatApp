import MessageBubble from './MessageBubble';

export default function MessagesList({ messages, containerRef, messagesEndRef, isTyping }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide py-2 pb-0 px-6 space-y-4" ref={containerRef}>
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {
        isTyping && (
          <MessageBubble key={1} message={{isOwn: false, text:'...', timeStamp: null}} />
        )}
      <div ref={messagesEndRef}/>
    </div>
  );
}
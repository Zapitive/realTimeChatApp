import MessageBubble from './MessageBubble';

export default function MessagesList({ messages, containerRef, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide py-2 pb-0 px-6 space-y-4" ref={containerRef}>
      {messages.messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {
        messages.isTyping && (
        <div className={`flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-500`}>
          <div className={`max-w-xs px-4 pb-2 rounded-2xl bg-white/10 border border-white/20 text-gray-100 rounded-bl-none`}>
            <p className="text-lg">...</p>
          </div>
        </div>
        )}
      <div ref={messagesEndRef}/>
    </div>
  );
}
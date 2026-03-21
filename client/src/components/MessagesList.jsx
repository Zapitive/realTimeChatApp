import MessageBubble from './MessageBubble';

export default function MessagesList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
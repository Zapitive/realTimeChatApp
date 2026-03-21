export default function MessageBubble({ message }) {
  return (
    <div
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
  );
}
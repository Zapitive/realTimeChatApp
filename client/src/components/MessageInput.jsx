export default function MessageInput({ inputMessage, onInputChange, onSubmit }) {
  return (
    <div className="p-6 border-t border-white/10">
      <form onSubmit={onSubmit} className="flex gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={onInputChange}
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
  );
}
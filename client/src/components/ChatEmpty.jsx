export default function ChatEmpty({ onOpenMessages }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg mb-6">Select a user to start chatting</p>
        <button
          onClick={onOpenMessages}
          className="md:hidden px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 font-semibold"
        >
          Open Messages
        </button>
      </div>
    </div>
  );
}
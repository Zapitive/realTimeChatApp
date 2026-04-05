export default function ChatHeader({ user, onBackClick }) {
  return (
    <div className="p-6 border-b border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackClick}
          className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-300 hover:text-white mr-2"
        >
          ←
        </button>
        <span className="text-4xl">{}</span>
        <div>
          <h2 className="text-white font-semibold text-lg">{user.users.name}</h2>
          <p
            className={`text-xs ${
              user.users.status === 'online'
                ? 'text-green-400'
                : 'text-gray-400'
            }`}
          >
            {user.users.status.charAt(0).toUpperCase() + user.users.status.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
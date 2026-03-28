export default function UserCard({ user, isSelected, getStatusColor, onSelectUser }) {
  return (
    <button
      onClick={onSelectUser}
      className={`w-full text-left p-4 rounded-xl transition-all duration-300 transform hover:scale-105 relative group ${
        isSelected
          ? 'bg-white/15 border border-purple-400/50 shadow-lg shadow-purple-500/20'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <span className="text-3xl">{user.avatar}</span>
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
              user?.users?.status ? user.users.status : user.status
            )} rounded-full border-2 border-slate-900`}
          ></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{user?.users?.name ? user.users.name : user.name}</h3>
          <p className="text-gray-400 text-xs truncate">{user.lastMessage}</p>
        </div>
      </div>
    </button>
  );
}
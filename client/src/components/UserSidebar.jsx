import SearchBar from './SearchBar';
import UserCard from './UserCard';

export default function UserSidebar({
  filteredUsers,
  selectedUser,
  showSidebar,
  getStatusColor,
  onSearchChange,
  onSelectUser,
  onCloseSidebar,
}) {
  return (
    <div
      className={`fixed md:relative w-full sm:w-80 backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col h-screen overflow-hidden z-40 transition-all duration-300 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
            Messages
          </h1>
          <button
            onClick={onCloseSidebar}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>
        <SearchBar onSearchChange={onSearchChange} />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-1 p-2">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isSelected={selectedUser === user.id}
              getStatusColor={getStatusColor}
              onSelectUser={() => onSelectUser(user.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default function SearchBar({ setSearchQuery, searchQuery }) {
    return (
        <div className="relative">
        <input
            type="text"
            placeholder="Search users..."
            name="searchQuery"
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300 text-sm"
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
        </span>
        </div>
    );
}
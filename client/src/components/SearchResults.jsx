import UserCard from './UserCard';

/**
 * SearchResults Component
 * 
 * Displays backend search results above the user list
 * Uses UserCard to render individual results
 * 
 * @param {Object} props
 * @param {Array} props.results - Array of user objects from backend
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message (if any)
 * @param {number} props.selectedUser - Currently selected user ID
 * @param {Function} props.getStatusColor - Function to get status color
 * @param {Function} props.onSelectUser - User selection callback
 * @param {boolean} props.hasQuery - Whether search query is active
 */
export default function SearchResults({
    results = [],
    loading = false,
    error = null,
    selectedUser = null,
    getStatusColor = () => 'bg-gray-500',
    onSelectUser = () => {},
    hasQuery = false,
    }) {
    // Don't show if no query
    if (!hasQuery) return null;

    return (
        <div className="border-b border-white/10 p-2">
        {/* Header */}
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {loading ? '🔍 Searching...' : `📌 Results (${results.length})`}
        </div>

        {/* Error State */}
        {error && (
            <div className="px-4 py-3 text-sm text-red-400 bg-red-500/10 rounded-lg mx-2 mb-2">
            ⚠️ {error}
            </div>
        )}

        {/* Loading State */}
        {loading && (
            <div className="px-4 py-3 text-sm text-gray-400 animate-pulse">
            Finding users...
            </div>
        )}

        {/* Results List */}
        {!loading && results.length > 0 && (
            <div className="space-y-1">
            {results.map((user) => (
                <UserCard
                key={user.id}
                user={user}
                isSelected={selectedUser === user.id}
                getStatusColor={getStatusColor}
                onSelectUser={() => onSelectUser(user.id)}
                />
            ))}
            </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && hasQuery && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No users found
            </div>
        )}
        </div>
    );
}
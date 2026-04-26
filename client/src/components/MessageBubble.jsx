export default function MessageBubble({ message }) {


  const renderStatus = (message) =>{
    if (!message.isOwn) return null

    switch (message.msgStatus){
      case 'sent':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" id="check">
            <path fill="none" d="M0 0h24v24H0V0z"></path>
            <path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z"></path>
          </svg>
        )
      case 'received':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" id="double-check">
            <path fill="#000000" fillRule="evenodd" d="M22.7071 7.70709C23.0976 7.31656 23.0976 6.68339 22.7071 6.29288C22.3166 5.90236 21.6834 5.90238 21.2929 6.29291L12.0003 15.5859L11.207 14.7928C10.8164 14.4023 10.1833 14.4024 9.79279 14.793C9.40232 15.1836 9.40242 15.8167 9.793 16.2072L11.2934 17.7072C11.684 18.0976 12.3171 18.0976 12.7076 17.7071L22.7071 7.70709ZM16.7071 7.70711C17.0976 7.31658 17.0976 6.68342 16.7071 6.29289C16.3166 5.90237 15.6834 5.90237 15.2929 6.29289L6 15.5858L2.70711 12.2929C2.31658 11.9024 1.68342 11.9024 1.29289 12.2929C0.902369 12.6834 0.902369 13.3166 1.29289 13.7071L5.29289 17.7071C5.48043 17.8946 5.73478 18 6 18C6.26522 18 6.51957 17.8946 6.70711 17.7071L16.7071 7.70711Z" clipRule="evenodd"></path>
          </svg>)
      case 'seen':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" id="double-check">
            <path fill="url(#paint0_linear_1233_4362)" fillRule="evenodd" d="M22.7071 7.70709C23.0976 7.31656 23.0976 6.68339 22.7071 6.29288C22.3166 5.90236 21.6834 5.90238 21.2929 6.29291L12.0003 15.5859L11.207 14.7928C10.8164 14.4023 10.1833 14.4024 9.79279 14.793C9.40232 15.1836 9.40242 15.8167 9.793 16.2072L11.2934 17.7072C11.684 18.0976 12.3171 18.0976 12.7076 17.7071L22.7071 7.70709ZM16.7071 7.70711C17.0976 7.31658 17.0976 6.68342 16.7071 6.29289C16.3166 5.90237 15.6834 5.90237 15.2929 6.29289L6 15.5858L2.70711 12.2929C2.31658 11.9024 1.68342 11.9024 1.29289 12.2929C0.902369 12.6834 0.902369 13.3166 1.29289 13.7071L5.29289 17.7071C5.48043 17.8946 5.73478 18 6 18C6.26522 18 6.51957 17.8946 6.70711 17.7071L16.7071 7.70711Z" clipRule="evenodd"></path>
            <defs>
              <linearGradient id="paint0_linear_1233_4362" x1="12" x2="12" y1="6" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#57EAEA"></stop>
                <stop offset="1" stopColor="#2BC9FF"></stop>
              </linearGradient>
            </defs>
          </svg>)
    }
  }

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
        <p className={`flex text-xs mt-1 ${message.isOwn ? 'text-purple-100 justify-end' : 'text-gray-400 justify-start'}`}>
          {message?.timestamp}
          &nbsp;
          {renderStatus(message)}
        </p>
      </div>
    </div>
  );
}
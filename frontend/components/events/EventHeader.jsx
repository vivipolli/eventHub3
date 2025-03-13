export default function EventHeader({ event }) {
    console.log('EventHeader - event:', event); // Debug log

    // Verificação de segurança para event
    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`bg-gradient-to-r ${event.gradient || 'from-primary to-primary-dark'} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
            <div className="container mx-auto px-6 py-16 relative">
                {/* Event Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {event.tags && event.tags.length > 0 ? (
                        event.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm text-gray-800 rounded-full text-sm border border-white/30 shadow-sm">
                                {tag}
                            </span>
                        ))
                    ) : null}
                </div>

                {/* Event Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    {event.title || 'Event Title'}
                </h1>

                {/* Event Details */}
                <div className="flex flex-wrap gap-6 text-white/90">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.date || 'Date TBD'}
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location || 'Location TBD'}
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {event.attendees || 0} attendees
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {event.category || 'Uncategorized'}
                    </div>
                </div>
            </div>
        </div>
    );
} 
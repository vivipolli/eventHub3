import Link from 'next/link';

export default function EventOrganizer({ organizer }) {
    return (
        <Link href={`/profile/${organizer.id}`} className="flex items-center space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all border border-white/30 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                <span className="font-medium">{organizer.name.charAt(0)}</span>
            </div>
            <div>
                <h3 className="font-medium">{organizer.name}</h3>
                <p className="text-sm text-gray-600">
                    {organizer.events} events · {organizer.followers} followers
                </p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
                <button className="px-4 py-2 bg-white/80 hover:bg-white rounded-full text-sm shadow-sm transition-all">
                    Follow
                </button>
            </div>
        </Link>
    );
} 
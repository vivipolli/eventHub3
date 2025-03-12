'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import {
    makeContractCall,
    standardPrincipalCV,
    stringAsciiCV,
    broadcastTransaction,
    Cl,
    callReadOnlyFunction
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { request } from '@stacks/connect';

// Array de eventos (posteriormente virá de uma API)
const events = [
    {
        id: 1,
        title: 'Web3 Summit 2024',
        date: 'Mar 15-17, 2024',
        location: 'New York, NY',
        category: 'Technology',
        price: 0.5,
        isPaid: true,
        attendees: 1200,
        image: '/images/event1.jpg',
        organizer: {
            name: 'Web3 Foundation',
            id: 'web3foundation'
        },
        status: 'upcoming',
        color: 'primary',
        description: 'Join us for the biggest Web3 event of the year. Get your NFT ticket and be part of the future.',
        spotsLeft: 300,
        gradient: 'from-primary to-primary-dark'
    },
    {
        id: 2,
        title: 'Blockchain Workshop',
        date: 'Mar 20, 2024',
        location: 'Virtual Event',
        category: 'Technology',
        price: 0,
        isPaid: false,
        attendees: 500,
        image: '/images/event2.jpg',
        organizer: {
            name: 'Tech Community DAO',
            id: 'techcommunity'
        },
        status: 'upcoming',
        color: 'secondary',
        description: 'Learn the basics of blockchain technology in this free workshop. Register now to secure your spot!',
        spotsLeft: 100,
        gradient: 'from-secondary to-secondary-dark'
    }
];

// Sample event data - in a real app, this would come from an API
const eventData = {
    id: '1',
    title: 'Web3 Summit 2024',
    description: `Join us for the premier Web3 event of the year, bringing together industry leaders, developers, and enthusiasts to explore the future of decentralized technology.

This two-day summit features keynote speeches, panel discussions, and hands-on workshops covering DeFi, NFTs, DAOs, and the latest blockchain innovations.

What to expect:
• Keynote presentations from industry leaders
• Interactive panel discussions
• Technical workshops and demos
• Networking opportunities
• Exclusive NFT for attendees`,
    date: 'Mar 15-17, 2024',
    time: '9:00 AM - 6:00 PM EST',
    location: 'Tech Conference Center',
    address: '123 Innovation Street, New York, NY 10001',
    organizer: {
        name: 'Web3 Foundation',
        image: '/images/organizer1.jpg',
        events: 15,
        followers: '1.2k'
    },
    price: '0.5 ETH',
    totalSpots: 1200,
    spotsLeft: 346,
    attendees: [
        { id: 1, name: 'Alex K.', image: '/images/user1.jpg' },
        // ... more attendees
    ],
    speakers: [
        {
            name: 'Sarah Chen',
            role: 'CEO, BlockchainTech',
            image: '/images/speaker1.jpg',
            topic: 'The Future of Decentralized Finance'
        },
        // ... more speakers
    ],
    schedule: [
        {
            day: 'Day 1 - March 15',
            events: [
                {
                    time: '09:00 AM',
                    title: 'Registration & Welcome Coffee',
                    duration: '1h'
                },
                {
                    time: '10:00 AM',
                    title: 'Keynote: The Future of Web3',
                    speaker: 'Sarah Chen',
                    duration: '1h'
                },
                // ... more schedule items
            ]
        },
        // ... more days
    ],
    color: 'primary',
    gradient: 'from-primary/20 via-secondary/20 to-accent/20',
    tags: ['Web3', 'Blockchain', 'DeFi', 'NFTs'],
};

// Share Modal Component
const ShareModal = ({ isOpen, onClose, event }) => {
    const [selectedFollowers, setSelectedFollowers] = useState([]);
    const [message, setMessage] = useState('');

    // Sample followers data - in a real app, this would come from an API
    const followers = [
        { id: 1, name: 'Sarah Chen', image: '/images/user1.jpg', username: '@sarahc' },
        { id: 2, name: 'Mike Johnson', image: '/images/user2.jpg', username: '@mikej' },
        // ... more followers
    ];

    const handleShare = () => {
        // Handle share logic here
        console.log('Sharing with:', selectedFollowers, 'Message:', message);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
                <h3 className="text-xl font-bold mb-4">Share with Followers</h3>

                <div className="mb-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message..."
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        rows="3"
                    />
                </div>

                <div className="mb-6">
                    <h4 className="font-medium mb-2">Select followers</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                        {followers.map(follower => (
                            <label
                                key={follower.id}
                                className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
                                    checked={selectedFollowers.includes(follower.id)}
                                    onChange={() => {
                                        setSelectedFollowers(prev =>
                                            prev.includes(follower.id)
                                                ? prev.filter(id => id !== follower.id)
                                                : [...prev, follower.id]
                                        );
                                    }}
                                />
                                <div className="ml-3 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-sm font-medium">{follower.name.charAt(0)}</span>
                                    </div>
                                    <div className="ml-2">
                                        <p className="font-medium text-sm">{follower.name}</p>
                                        <p className="text-sm text-gray-500">{follower.username}</p>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                        disabled={selectedFollowers.length === 0}
                    >
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function EventPage({ params }) {
    const [showFullSchedule, setShowFullSchedule] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const { isAuthenticated, userData } = useAuth();
    const router = useRouter();
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Buscar evento com base no ID (simulado por enquanto)
    const event = events.find(e => e.id.toString() === params.id) || events[0];

    const handleShareClick = (type) => {
        if (type === 'followers' && !isAuthenticated) {
            router.push('/login?redirect=' + encodeURIComponent(`/events/${params.id}`));
            return;
        }

        switch (type) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=Check out ${event.title}&url=${encodeURIComponent(window.location.href)}`);
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`);
                break;
            case 'followers':
                setIsShareModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleRegister = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=' + encodeURIComponent(`/events/${params.id}`));
            return;
        }

        // Verificar se é evento pago ou gratuito
        if (event.isPaid) {
            setShowPaymentModal(true);
        } else {
            setShowRegistrationModal(true);
        }
    };

    // Callback de sucesso do pagamento/mint
    const handlePaymentSuccess = () => {
        // Aqui você pode adicionar lógica adicional após o pagamento bem-sucedido
        // Por exemplo: atualizar o estado, mostrar notificação, etc.
        toast.success('NFT Ticket minted successfully!');
        router.push('/my-profile?tab=tickets'); // Redireciona para a aba de tickets
    };

    // Callback de sucesso do registro
    const handleRegistrationSuccess = () => {
        // Aqui você pode adicionar lógica adicional após o registro bem-sucedido
        toast.success('Registration completed successfully!');
        router.push('/my-profile?tab=tickets'); // Redireciona para a aba de tickets
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Event Header with Gradient Background */}
            <div className={`bg-gradient-to-r ${eventData.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
                <div className="container mx-auto px-6 py-16 relative">
                    {/* Event Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {eventData.tags.map(tag => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-white/20 backdrop-blur-sm text-gray-800 rounded-full text-sm
                                         border border-white/30 shadow-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Left Column - Event Info */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold text-gray-900">{eventData.title}</h1>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 bg-${eventData.color} text-white rounded-full text-sm
                                                        shadow-lg shadow-${eventData.color}/20`}>
                                        In-Person Event
                                    </span>
                                    <span className="text-gray-700 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                                        {eventData.spotsLeft} spots left
                                    </span>
                                </div>
                            </div>

                            {/* Organizer Info with Link */}
                            <Link
                                href={`/profile/${eventData.organizer.id}`}
                                className="flex items-center space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm
                                         hover:bg-white/80 transition-all border border-white/30 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary 
                                            flex items-center justify-center text-white shadow-lg">
                                    <span className="font-medium">
                                        {eventData.organizer.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-medium">{eventData.organizer.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {eventData.organizer.events} events · {eventData.organizer.followers} followers
                                    </p>
                                </div>
                                <div className="ml-auto flex items-center space-x-2">
                                    <button className="px-4 py-2 bg-white/80 hover:bg-white rounded-full text-sm
                                                   shadow-sm transition-all">
                                        Follow
                                    </button>
                                </div>
                            </Link>

                            {/* Date & Location */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 mt-1">
                                        <svg className="text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">{eventData.date}</p>
                                        <p className="text-gray-600">{eventData.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 mt-1">
                                        <svg className="text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium">{eventData.location}</p>
                                        <p className="text-gray-600">{eventData.address}</p>
                                        <button className="mt-2 text-primary text-sm hover:underline">
                                            View Map
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Ticket Info */}
                        <div className="lg:w-96">
                            <div className="sticky top-6 space-y-6">
                                {/* Ticket Card */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                    <div className="space-y-4">
                                        {/* Preço */}
                                        <div className="flex items-baseline justify-between">
                                            <h3 className="text-2xl font-bold">
                                                {event.isPaid ? `${event.price} ETH` : 'Free'}
                                            </h3>
                                            <span className={`${event.spotsLeft < 50 ? 'text-red-500' : 'text-gray-600'
                                                }`}>
                                                {event.spotsLeft} spots left
                                            </span>
                                        </div>

                                        {/* Benefícios */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium">What's included:</h4>
                                            <ul className="space-y-2">
                                                {event.isPaid ? (
                                                    <>
                                                        <li className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Non-transferable NFT Ticket
                                                        </li>
                                                        <li className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            VIP Access to all sessions
                                                        </li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Standard Access Pass
                                                        </li>
                                                        <li className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Digital Certificate
                                                        </li>
                                                    </>
                                                )}
                                                <li className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Networking Opportunities
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Botão de Registro */}
                                        <button
                                            onClick={handleRegister}
                                            className={`w-full py-3 rounded-xl text-white transition-colors ${event.isPaid
                                                ? 'bg-primary hover:bg-primary-dark'
                                                : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                        >
                                            {event.isPaid ? 'Purchase Ticket' : 'Register Now'}
                                        </button>
                                    </div>
                                </div>

                                {/* Share and Contact Card */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg p-6 space-y-6">
                                    {/* Share Section */}
                                    <div>
                                        <h3 className="font-medium mb-4">Share this event</h3>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleShareClick('twitter')}
                                                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group"
                                                title="Share on Twitter"
                                            >
                                                <svg className="w-5 h-5 text-gray-600 group-hover:text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleShareClick('linkedin')}
                                                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group"
                                                title="Share on LinkedIn"
                                            >
                                                <svg className="w-5 h-5 text-gray-600 group-hover:text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleShareClick('followers')}
                                                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors group"
                                                title="Share with Followers"
                                            >
                                                <svg className="w-5 h-5 text-gray-600 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Section */}
                                    <div>
                                        <h3 className="font-medium mb-4">Contact organizer</h3>
                                        <button
                                            onClick={() => router.push(`/messages/new?organizer=${eventData.organizer.id}`)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            <span>Send Message</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-1 space-y-12">
                        {/* About */}
                        <section>
                            <h2 className="text-xl font-bold mb-4">About this event</h2>
                            <div className="prose max-w-none">
                                {eventData.description.split('\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4 text-gray-600">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </section>

                        {/* Speakers */}
                        <section>
                            <h2 className="text-xl font-bold mb-6">Featured Speakers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {eventData.speakers.map(speaker => (
                                    <div key={speaker.name} className="flex items-start space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                            <span className="text-xl font-medium text-gray-600">
                                                {speaker.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{speaker.name}</h3>
                                            <p className="text-sm text-gray-600 mb-1">{speaker.role}</p>
                                            <p className="text-sm text-gray-600">{speaker.topic}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Schedule */}
                        <section>
                            <h2 className="text-xl font-bold mb-6">Event Schedule</h2>
                            <div className="space-y-8">
                                {eventData.schedule.slice(0, showFullSchedule ? undefined : 1).map(day => (
                                    <div key={day.day}>
                                        <h3 className="font-medium mb-4">{day.day}</h3>
                                        <div className="space-y-4">
                                            {day.events.map((event, index) => (
                                                <div key={index} className="flex items-start space-x-4">
                                                    <div className="w-20 flex-shrink-0">
                                                        <p className="text-sm text-gray-600">{event.time}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{event.title}</p>
                                                        {event.speaker && (
                                                            <p className="text-sm text-gray-600">
                                                                {event.speaker} · {event.duration}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {!showFullSchedule && eventData.schedule.length > 1 && (
                                <button
                                    onClick={() => setShowFullSchedule(true)}
                                    className="mt-6 text-primary hover:underline"
                                >
                                    Show full schedule
                                </button>
                            )}
                        </section>

                        {/* Attendees */}
                        <section>
                            <h2 className="text-xl font-bold mb-6">Who's Coming</h2>
                            <div className="flex -space-x-2 mb-4">
                                {eventData.attendees.map(attendee => (
                                    <div
                                        key={attendee.id}
                                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center"
                                    >
                                        <span className="text-sm font-medium text-gray-600">
                                            {attendee.name.charAt(0)}
                                        </span>
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                                    <span className="text-sm text-gray-600">+{eventData.totalSpots - eventData.spotsLeft}</span>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                Join {eventData.totalSpots - eventData.spotsLeft} others at this event
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                event={eventData}
            />

            {/* Modais condicionais */}
            {event.isPaid ? (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    event={event}
                    onSuccess={handlePaymentSuccess}
                />
            ) : (
                <RegistrationModal
                    isOpen={showRegistrationModal}
                    onClose={() => setShowRegistrationModal(false)}
                    event={event}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </div>
    );
}

// Componente do Modal de Pagamento
function PaymentModal({ isOpen, onClose, event, onSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionStarted, setTransactionStarted] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const { userData, isAuthenticated } = useAuth();

    const handleMint = async () => {
        try {
            setIsProcessing(true);

            // Verificar possíveis locais onde o endereço pode estar
            const userAddress = userData?.address ||
                userData?.stxAddress ||
                userData?.addresses?.stx?.[0]?.address ||
                userData?.profile?.stxAddress;

            if (!userAddress) {
                console.log('User address not found in userData');
                toast.error('Wallet address not found. Please reconnect your wallet.');
                setIsProcessing(false);
                return;
            }

            console.log('Found user address:', userAddress);

            // Definir o endereço e nome do contrato
            const contractAddress = 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK';
            const contractName = 'nft-ticket';

            // Criar um metadata simples
            const metadataUri = `event-${event.id}`;
            console.log('Using metadata:', metadataUri);

            // Mostrar toast de loading
            toast.loading('Preparing transaction...', { id: 'mint-toast' });

            // Usar o novo método request para chamar o contrato
            setTransactionStarted(true);

            try {
                // Registrar o tempo de início da transação
                const startTime = Date.now();

                // Usando stx_callContract conforme a documentação - versão simplificada
                const response = await request('stx_callContract', {
                    contract: `${contractAddress}.${contractName}`,
                    functionName: 'mint',
                    functionArgs: [
                        Cl.standardPrincipal(userAddress),
                        Cl.stringAscii(metadataUri)
                    ],
                    network: 'testnet',
                });

                console.log('Transaction response:', response);

                if (response && response.txid) {
                    setTransactionId(response.txid);
                    console.log('Transaction ID:', response.txid);

                    // Verificar o status da transação
                    checkTransactionStatus(response.txid);
                } else {
                    console.error('Invalid transaction response:', response);
                    toast.error('Failed to mint NFT ticket: Invalid response', { id: 'mint-toast' });
                    setIsProcessing(false);
                    setTransactionStarted(false);
                }
            } catch (requestError) {
                console.error('Request error:', requestError);

                // Ignorar completamente o erro de rejeição
                if (requestError.message && requestError.message.includes('rejected')) {
                    console.log('Ignoring rejection error - this is likely a false positive');

                    // Registrar o tempo de início para o timeout
                    const startTime = Date.now();

                    // Atualizar o toast para informar o usuário
                    toast.loading('Waiting for transaction confirmation...', { id: 'mint-toast' });

                    // Verificar periodicamente se temos um ID de transação
                    const checkInterval = setInterval(() => {
                        // Se a transação foi concluída, limpar o intervalo
                        if (transactionId) {
                            clearInterval(checkInterval);
                            return;
                        }

                        // Se ainda estamos processando após 60 segundos, desistir
                        if (Date.now() - startTime > 60000) {
                            console.log('Timeout waiting for transaction');
                            toast.error('Transaction timed out. Please check your wallet for pending transactions.', { id: 'mint-toast' });
                            setIsProcessing(false);
                            setTransactionStarted(false);
                            clearInterval(checkInterval);
                        } else if (Date.now() - startTime > 30000) {
                            // Após 30 segundos, atualizar a mensagem
                            toast.loading('Still waiting for confirmation. Please check your wallet...', { id: 'mint-toast' });
                        }
                    }, 2000);

                    return;
                } else {
                    toast.error(`Transaction failed: ${requestError.message || 'Unknown error'}`, { id: 'mint-toast' });
                    setIsProcessing(false);
                    setTransactionStarted(false);
                }
            }

        } catch (error) {
            console.error('Mint error:', error);
            toast.error('Failed to mint NFT ticket', { id: 'mint-toast' });
            setIsProcessing(false);
            setTransactionStarted(false);
        }
    };

    // Função para verificar o status da transação
    const checkTransactionStatus = async (txid) => {
        try {
            // Esperar um pouco antes de verificar
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verificar o status da transação
            const response = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${txid}`);
            const data = await response.json();

            console.log('Transaction status:', data);

            if (data.tx_status === 'success') {
                toast.success('NFT ticket minted successfully!', { id: 'mint-toast' });
                onSuccess();
                onClose();
                setIsProcessing(false);
                setTransactionStarted(false);
            } else if (data.tx_status === 'pending') {
                // Verificar novamente após alguns segundos
                toast.loading('Transaction pending. Please wait...', { id: 'mint-toast' });
                setTimeout(() => checkTransactionStatus(txid), 5000);
            } else {
                toast.error(`Transaction failed: ${data.tx_status}`, { id: 'mint-toast' });
                setIsProcessing(false);
                setTransactionStarted(false);
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
            toast.error('Error checking transaction status', { id: 'mint-toast' });
            setIsProcessing(false);
            setTransactionStarted(false);
        }
    };

    // Função para cancelar a transação em andamento
    const handleCancel = () => {
        setIsProcessing(false);
        setTransactionStarted(false);
        toast.dismiss('mint-toast');
        toast.error('Transaction canceled');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Purchase NFT Ticket</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-2xl font-bold">{event.price} STX</p>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>You will receive:</p>
                        <ul className="list-disc list-inside">
                            <li>Non-transferable NFT ticket</li>
                            <li>Access to the event</li>
                            <li>Ability to confirm presence on event day</li>
                        </ul>
                    </div>

                    {isProcessing ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                <p>{transactionStarted ? 'Waiting for wallet confirmation...' : 'Processing...'}</p>
                            </div>
                            {transactionId && (
                                <div className="text-xs text-center">
                                    <p>Transaction ID:</p>
                                    <a
                                        href={`https://explorer.stacks.co/txid/${transactionId}?chain=testnet`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline break-all"
                                    >
                                        {transactionId}
                                    </a>
                                </div>
                            )}
                            <button
                                onClick={handleCancel}
                                className="w-full py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleMint}
                            className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                        >
                            Confirm Purchase
                        </button>
                    )}

                    {transactionStarted && (
                        <div className="text-sm text-gray-500 text-center space-y-2 mt-4">
                            <p>Please check your wallet extension to confirm the transaction</p>
                            <p>If your wallet didn't open, please click the wallet extension icon manually</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

// Componente do Modal de Registro
function RegistrationModal({ isOpen, onClose, event, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Lógica para salvar registro
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Failed to complete registration');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <h3 className="text-xl font-bold mb-4">Event Registration</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                />
                <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                />
                <button
                    type="submit"
                    className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                >
                    Complete Registration
                </button>
            </form>
        </Modal>
    );
} 
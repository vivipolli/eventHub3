'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast, Toaster } from 'react-hot-toast';
import { getNftsForAddress } from '@/services/stacksService';
import NftCard from '@/components/nft/NftCard';
import { isValidIpfsUrl } from '@/utils/ipfs';


const organizedEvents = [
    {
        id: 1,
        name: 'Web3 Workshop',
        date: 'Apr 20, 2024',
        location: 'Virtual',
        attendees: 156,
        status: 'upcoming',
        color: 'secondary'
    },
    // ... more events
];

export default function MyProfilePage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const { userData } = useAuth();
    const [formData, setFormData] = useState({
        name: 'Alex Turner',
        username: '@alexturner',
        bio: 'Blockchain enthusiast | Event organizer | NFT collector',
        email: 'alex@example.com',
        location: 'New York, NY',
        website: 'alexturner.eth',
        isOrganizer: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [nfts, setNfts] = useState([]);
    const [userAddress, setUserAddress] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            if (userData?.addresses?.stx?.[0]?.address) {
                const address = userData.addresses.stx[0].address;

                try {
                    setIsLoading(true);
                    // Buscar NFTs do usuário
                    const userNfts = await getNftsForAddress(address);

                    setNfts(userNfts);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching NFTs:', error);
                    toast.error('Erro ao carregar NFTs');
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userData]);

    // Função para exibir endereço truncado
    const truncateAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to update the profile
        console.log('Saving profile:', formData);
        setIsEditing(false);
    };

    const handleConfirmPresence = async (ticketId) => {
        try {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        // Criar uma Promise que será resolvida após 2 segundos
                        const confirmPresence = new Promise((resolve, reject) => {
                            setTimeout(() => {
                                // Simular sucesso - em produção, aqui seria a chamada real
                                resolve();
                                // Para simular erro, use: reject(new Error('Failed'));
                            }, 2000);
                        });

                        // Usar toast.promise com a Promise
                        await toast.promise(
                            confirmPresence,
                            {
                                loading: 'Confirming presence...',
                                success: 'Presence confirmed! NFT will be minted shortly.',
                                error: 'Failed to confirm presence. Please try again.',
                            }
                        );

                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        toast.error('Please enable location services to confirm presence');
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                toast.error('Geolocation is not supported by your browser');
            }
        } catch (error) {
            console.error('Confirm presence error:', error);
            toast.error('Failed to confirm presence');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Adicionar o componente Toaster */}
            <Toaster position="top-center" />

            {/* Profile Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold">My Profile</h1>
                        {activeTab === 'profile' && (
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="flex space-x-6 border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`pb-4 px-2 text-sm font-medium relative ${activeTab === 'profile'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            className={`pb-4 px-2 text-sm font-medium relative ${activeTab === 'tickets'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            My Tickets
                        </button>
                        {formData?.isOrganizer && (
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`pb-4 px-2 text-sm font-medium relative ${activeTab === 'events'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Organized Events
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('nfts')}
                            className={`pb-4 px-2 text-sm font-medium relative ${activeTab === 'nfts'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            My NFTs
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-6 py-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl">
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                            {/* Wallet Address Display - Novo componente */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Connected Wallet
                                </label>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/5 rounded-xl border border-secondary/10">
                                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                                    <span className="text-sm font-medium text-secondary">
                                        {userData?.addresses?.stx?.[0]?.address ?
                                            truncateAddress(userData.addresses.stx[0].address) :
                                            'No wallet connected'
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        rows="3"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className={`bg-${ticket.color}/10 p-6`}>
                                    <h3 className="font-semibold text-lg mb-2">{ticket.eventName}</h3>
                                    <div className="flex items-center text-sm text-gray-600 mb-4">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {ticket.date}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 bg-${ticket.color}/20 text-${ticket.color} rounded-full text-sm`}>
                                            {ticket.ticketType}
                                        </span>
                                        {ticket.nftMinted && (
                                            <span className="text-sm text-secondary">
                                                NFT Minted ✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-100">
                                    {ticket.status === 'upcoming' && (
                                        <button
                                            onClick={() => handleConfirmPresence(ticket.id)}
                                            className="w-full py-2 bg-secondary text-white rounded-xl hover:bg-secondary-dark transition-colors"
                                        >
                                            Confirm Presence
                                        </button>
                                    )}
                                    {ticket.status === 'past' && ticket.presenceConfirmed && (
                                        <div className="text-center text-gray-600">
                                            Presence Confirmed ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Organized Events Tab */}
                {activeTab === 'events' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Your Events</h2>
                            <Link
                                href="/events/create"
                                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                            >
                                Create New Event
                            </Link>
                        </div>

                        {organizedEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between"
                            >
                                <div className="space-y-2 mb-4 md:mb-0">
                                    <h3 className="font-bold text-lg">{event.name}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>{event.date}</span>
                                        <span>•</span>
                                        <span>{event.location}</span>
                                        <span>•</span>
                                        <span>{event.attendees} attendees</span>
                                    </div>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${event.status === 'upcoming'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={`/events/${event.id}/manage`}
                                        className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Manage Event
                                    </Link>
                                    <Link
                                        href={`/events/${event.id}/analytics`}
                                        className="px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors text-sm"
                                    >
                                        View Analytics
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* NFTs Tab */}
                {activeTab === 'nfts' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold mb-6">Your NFT Collection</h2>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading your NFTs...</p>
                            </div>
                        ) : nfts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {nfts
                                    .filter(nft => nft.tokenUri && isValidIpfsUrl(nft.tokenUri))
                                    .map((nft, index) => (
                                        <NftCard
                                            key={nft.value.repr.replace('u', '')}
                                            tokenUri={nft.tokenUri}
                                            tx_id={nft.tx_id || nft.txid}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
                                <p className="mb-4">You don't have any NFTs yet</p>
                                <p className="text-sm">Attend events and confirm your presence to collect NFTs</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 
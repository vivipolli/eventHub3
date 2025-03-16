import { useState, useEffect } from 'react';
import { convertIpfsUrl } from '@/services/stacksService';

export default function TicketCard({ tokenUri, tx_id, onConfirmPresence }) {
    const [ticketData, setTicketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTicketData = async () => {
            try {
                let uri = tokenUri;
                if (uri.startsWith('ipfs://')) {
                    uri = convertIpfsUrl(uri);
                }

                const response = await fetch(uri);
                if (!response.ok) throw new Error('Failed to load ticket data');

                const data = await response.json();

                const attributes = {};
                if (Array.isArray(data.attributes)) {
                    data.attributes.forEach(attr => {
                        attributes[attr.trait_type] = attr.value;
                    });
                }

                setTicketData({
                    name: data.name,
                    date: attributes['Event Date'] || attributes['Date'],
                    time: attributes['Time'] || attributes['Event Time'],
                    location: attributes['Location'] || attributes['Venue'],
                    ticketType: attributes['Ticket Type'] || 'Standard',
                    tokenId: attributes['Token ID'] || data.tokenId,
                    eventId: attributes['Event ID'] || data.eventId
                });
                setIsLoading(false);
            } catch (error) {
                console.error('Error loading ticket data:', error);
                setError('Failed to load ticket');
                setIsLoading(false);
            }
        };

        if (tokenUri) loadTicketData();
    }, [tokenUri]);

    const handleConfirmPresence = async () => {
        setIsLoading(true);
        try {
            await onConfirmPresence();
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-1">{ticketData?.name || 'Loading...'}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                                {ticketData?.date || 'TBA'}
                                {ticketData?.time && ` at ${ticketData.time}`}
                            </span>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {ticketData?.ticketType || 'Standard'}
                    </span>
                </div>

                <div className="flex-grow">
                    <div className="border-t border-dashed border-gray-200 my-4" />
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Location:</span>
                        <span>{ticketData?.location || 'TBA'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Token ID:</span>
                        <span className="font-mono">#{ticketData?.tokenId || '0000'}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 break-all">
                        <span>NFT Hash: </span>
                        <span className="font-mono">{tx_id}</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <a
                        href={`https://explorer.hiro.so/txid/${tx_id}?chain=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:text-primary-dark"
                    >
                        View on Explorer
                    </a>
                    <button
                        onClick={handleConfirmPresence}
                        disabled={isLoading}
                        className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Confirming...' : 'Confirm Presence'}
                    </button>
                </div>
            </div>
        </div>
    );
} 
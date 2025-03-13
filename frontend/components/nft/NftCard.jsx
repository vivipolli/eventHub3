import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function NftCard({ tokenId, contractAddress, contractName, metadata }) {
    const [nftData, setNftData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNftData = async () => {
            try {
                setLoading(true);

                // Extrair informações do evento do metadata
                // Formato esperado: "u2" ou algo similar
                const eventId = metadata.replace('u', '');

                // Aqui você pode buscar mais detalhes do evento de uma API
                // Por enquanto, vamos criar dados de exemplo
                const eventData = {
                    name: `Evento #${eventId}`,
                    description: 'Ingresso NFT para evento exclusivo',
                    image: '/placeholder.png', // Imagem de placeholder
                    date: new Date().toLocaleDateString(),
                    location: 'Local do Evento',
                };

                setNftData({
                    tokenId,
                    ...eventData
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching NFT data:', error);
                setNftData({
                    tokenId,
                    name: `Ingresso NFT #${tokenId}`,
                    description: 'Erro ao carregar detalhes',
                    image: '/placeholder.png',
                });
                setLoading(false);
            }
        };

        fetchNftData();
    }, [tokenId, metadata]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="relative h-48 w-full bg-gray-200">
                {nftData.image && (
                    <Image
                        src={nftData.image}
                        alt={nftData.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{nftData.name}</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        #{tokenId}
                    </span>
                </div>

                <p className="text-gray-600 text-sm mb-3">{nftData.description}</p>

                {nftData.date && (
                    <p className="text-sm mb-1">
                        <span className="font-medium">Data:</span> {nftData.date}
                    </p>
                )}

                {nftData.location && (
                    <p className="text-sm mb-3">
                        <span className="font-medium">Local:</span> {nftData.location}
                    </p>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <a
                        href={`https://explorer.stacks.co/nft/${contractAddress}.${contractName}/${tokenId}?chain=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800"
                    >
                        Ver no Explorer
                    </a>

                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
                        Verificar
                    </button>
                </div>
            </div>
        </div>
    );
} 
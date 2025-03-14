import { useState, useEffect } from 'react';
import Image from 'next/image';
import { convertIpfsUrl } from '@/services/stacksService';

export default function NftCard({ tokenUri, tx_id }) {
    const [nftData, setNftData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadNftData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Buscar os metadados da URL
                const response = await fetch(tokenUri);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const nftMetadata = await response.json();

                // Processar a URL da imagem para IPFS
                let imageUrl = nftMetadata.image;
                if (imageUrl) {
                    imageUrl = convertIpfsUrl(imageUrl);
                }

                // Extrair data e local do evento dos atributos
                let eventDate = '';
                let eventLocation = '';
                let eventCategory = '';

                if (nftMetadata.attributes && Array.isArray(nftMetadata.attributes)) {
                    const dateAttr = nftMetadata.attributes.find(attr =>
                        attr.trait_type === 'Event Date' || attr.trait_type === 'Date'
                    );

                    const locationAttr = nftMetadata.attributes.find(attr =>
                        attr.trait_type === 'Location' || attr.trait_type === 'Venue'
                    );

                    const categoryAttr = nftMetadata.attributes.find(attr =>
                        attr.trait_type === 'Category' || attr.trait_type === 'Type'
                    );

                    if (dateAttr) eventDate = dateAttr.value;
                    if (locationAttr) eventLocation = locationAttr.value;
                    if (categoryAttr) eventCategory = categoryAttr.value;
                }

                setNftData({
                    name: nftMetadata.name,
                    description: nftMetadata.description || '',
                    image: imageUrl,
                    date: eventDate,
                    location: eventLocation,
                    category: eventCategory,
                    attributes: nftMetadata.attributes || [],
                    properties: nftMetadata.properties || {},
                });

                setLoading(false);
            } catch (error) {
                console.error('Error loading NFT data:', error);
                setError(`Erro ao carregar dados: ${error.message}`);
                setLoading(false);
            }
        };

        if (tokenUri) {
            loadNftData();
        } else {
            setError('URL dos metadados não fornecida');
            setLoading(false);
        }
    }, [tokenUri]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 h-80 flex flex-col items-center justify-center">
                <div className="text-red-500 mb-2">⚠️ Erro</div>
                <div className="text-center text-sm text-gray-700">{error}</div>
                <div className="mt-4 text-xs text-gray-500">Token URI: {tokenUri}</div>
                <a
                    href={`https://explorer.hiro.so/txid/${tx_id}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-purple-600 hover:text-purple-800"
                >
                    Ver Transação no Explorer
                </a>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="relative h-48 w-full bg-gray-200">
                {nftData.image ? (
                    <Image
                        src={nftData.image}
                        alt={nftData.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                            console.error('Image failed to load:', nftData.image);
                            e.target.onerror = null;
                            setError(`Erro ao carregar imagem: ${nftData.image}`);
                        }}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">Sem imagem</span>
                    </div>
                )}

                {nftData.category && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded">
                        {nftData.category}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{nftData.name}</h3>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        {tokenUri}
                    </span>
                </div>

                {nftData.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nftData.description}</p>
                )}

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

                {/* Exibir outros atributos relevantes */}
                {nftData.attributes && nftData.attributes.length > 0 && (
                    <div className="mt-2 mb-3">
                        <div className="grid grid-cols-2 gap-1">
                            {nftData.attributes
                                .filter(attr =>
                                    !['Event Date', 'Date', 'Location', 'Venue', 'Category', 'Type'].includes(attr.trait_type)
                                )
                                .slice(0, 4) // Limitar a 4 atributos para não sobrecarregar o card
                                .map((attr, index) => (
                                    <div key={index} className="bg-gray-50 px-2 py-1 rounded text-xs">
                                        <span className="font-medium">{attr.trait_type}:</span> {attr.value}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <a
                        href={`https://explorer.hiro.so/txid/${tx_id}?chain=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800"
                    >
                        Ver Transação no Explorer
                    </a>

                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
                        Verificar
                    </button>
                </div>
            </div>
        </div>
    );
} 
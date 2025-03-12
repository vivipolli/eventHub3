import React from 'react';

export default function NFTCard({ nft }) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* NFT Preview */}
            <div className={`h-48 bg-${nft.color}/10 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br from-${nft.color}/20 to-transparent`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-xl bg-white shadow-lg flex flex-col items-center justify-center p-4 rotate-3 border-2 border-${nft.color}/30`}>
                        <div className={`text-${nft.color} text-3xl font-bold mb-2`}>
                            {nft.eventName.split(' ')[0].charAt(0)}{nft.eventName.split(' ')[1]?.charAt(0) || ''}
                        </div>
                        <div className="text-xs text-gray-500 text-center">{nft.eventName}</div>
                        <div className="mt-2 text-xs px-3 py-1 bg-gray-100 rounded-full">{nft.date}</div>
                    </div>
                </div>

                {/* Blockchain Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`bg-${nft.color} text-white text-xs px-2 py-1 rounded-full`}>
                        Stacks NFT
                    </span>
                </div>
            </div>

            {/* NFT Details */}
            <div className="p-6">
                <h3 className="font-semibold text-lg mb-2">{nft.eventName}</h3>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {nft.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Token ID: {nft.tokenId}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Metadata: {nft.metadata}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 bg-${nft.color}/20 text-${nft.color} rounded-full text-sm`}>
                        {nft.ticketType}
                    </span>
                    {nft.txid && (
                        <a
                            href={`https://explorer.hiro.so/txid/${nft.txid}?chain=testnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                        >
                            View on Explorer
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
} 
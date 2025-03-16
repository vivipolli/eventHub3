'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { request } from '@stacks/connect';

export default function PaymentModal({ isOpen, onClose, event, onSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionStarted, setTransactionStarted] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [error, setError] = useState(null);
    const [metadataUri, setMetadataUri] = useState(null);
    const { userData } = useAuth();

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            setTransactionStarted(false);
            setTransactionId(null);
            setPaymentComplete(false);
            setError(null);

            const userAddress = userData?.address ||
                userData?.stxAddress ||
                userData?.addresses?.stx?.[0]?.address ||
                userData?.profile?.stxAddress;

            if (!userAddress) {
                toast.error('Wallet address not found. Please reconnect your wallet.');
                setIsProcessing(false);
                return;
            }

            const receiverAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
            const priceInMicroStx = Math.floor(event.price * 1000000).toString();

            toast.loading('Preparing payment transaction...', { id: 'payment-toast' });
            setTransactionStarted(true);

            try {
                const requestOptions = {
                    recipient: receiverAddress,
                    amount: priceInMicroStx,
                    memo: `Ticket for event ${event.id}`,
                    network: process.env.NEXT_PUBLIC_NETWORK,
                };

                const response = await request('stx_transferStx', requestOptions);

                if (response && response.txId) {
                    setTransactionId(response.txId);
                    toast.success('Payment successful! Minting your ticket...', { id: 'payment-toast' });
                    setPaymentComplete(true);
                    handleMint(userAddress, response.txId);
                } else {
                    throw new Error('No transaction ID returned');
                }
            } catch (requestError) {
                setError(requestError.message || 'Unknown error');

                if (requestError.message && requestError.message.includes('rejected')) {
                    toast.loading('Checking for recent transactions...', { id: 'payment-toast' });
                    try {
                        const response = await fetch(
                            `${process.env.NEXT_PUBLIC_HIRO_API_URL}/extended/v1/address/${userAddress}/transactions?limit=1`
                        );
                        const data = await response.json();

                        if (data.results && data.results.length > 0) {
                            const latestTx = data.results[0];
                            const currentTime = new Date().getTime();
                            const txTime = new Date(latestTx.burn_block_time_iso).getTime();

                            if (currentTime - txTime < 5 * 60 * 1000) {
                                setTransactionId(latestTx.tx_id);
                                toast.success('Found a recent payment! Minting your ticket...', { id: 'payment-toast' });
                                setPaymentComplete(true);
                                handleMint(userAddress, latestTx.tx_id);
                                return;
                            }
                        }
                        toast.error('Payment canceled by user', { id: 'payment-toast' });
                    } catch (checkError) {
                        toast.error('Payment canceled by user', { id: 'payment-toast' });
                    }
                } else {
                    toast.error(`Payment error: ${requestError.message || 'Unknown error'}`, { id: 'payment-toast' });
                }
                setIsProcessing(false);
                setTransactionStarted(false);
            }
        } catch (error) {
            setError(error.message || 'Unknown error');
            toast.error('Failed to process payment', { id: 'payment-toast' });
            setIsProcessing(false);
            setTransactionStarted(false);
        }
    };

    const handleManualTxId = () => {
        const txId = prompt('Please enter your transaction ID:');
        if (txId && txId.trim()) {
            setTransactionId(txId.trim());
            toast.success('Transaction ID received! Minting your ticket...', { id: 'payment-toast' });
            setPaymentComplete(true);

            const userAddress = userData?.address ||
                userData?.stxAddress ||
                userData?.addresses?.stx?.[0]?.address ||
                userData?.profile?.stxAddress;

            handleMint(userAddress, txId.trim());
        }
    };

    const handleMint = async (userAddress, paymentTxId) => {
        try {
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
            const contractName = process.env.NEXT_PUBLIC_CONTRACT_NAME;
            let uri = event.metadataUrl;

            if (uri.startsWith('ipfs://')) {
                uri = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }

            setMetadataUri(uri);
            toast.loading('Minting your NFT ticket...', { id: 'mint-toast' });

            try {
                const response = await fetch('/api/mint-nft', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAddress,
                        metadataUri: uri,
                        contractAddress,
                        contractName,
                        paymentTxId,
                        eventId: event.id
                    }),
                });

                const result = await response.json();

                if (result.success && result.txid) {
                    setTransactionId(result.txid);
                    toast.loading('NFT minting transaction submitted. Checking status...', { id: 'mint-toast' });
                    checkTransactionStatus(result.txid);
                } else {
                    toast.error(`Failed to mint NFT ticket: ${result.error || 'Unknown error'}`, { id: 'mint-toast' });
                    setIsProcessing(false);
                }
            } catch (apiError) {
                toast.error(`API error: ${apiError.message || 'Unknown error'}`, { id: 'mint-toast' });
                setIsProcessing(false);
            }
        } catch (error) {
            toast.error('Failed to mint NFT ticket', { id: 'mint-toast' });
            setIsProcessing(false);
        }
    };

    const checkTransactionStatus = async (txid) => {
        try {
            const cleanTxid = txid.startsWith('0x') ? txid.substring(2) : txid;
            const response = await fetch(`${process.env.NEXT_PUBLIC_HIRO_API_URL}/extended/v1/tx/${cleanTxid}`);

            if (!response.ok) {
                if (response.status === 404) {
                    setTimeout(() => checkTransactionStatus(txid), 5000);
                    return;
                }
                toast.error(`API error: ${response.status}`, { id: 'mint-toast' });
                setIsProcessing(false);
                return;
            }

            const data = await response.json();

            if (data.tx_status === 'success') {
                let tokenId = null;
                if (data.tx_result && data.tx_result.repr) {
                    const tokenMatch = data.tx_result.repr.match(/\(ok u(\d+)\)/);
                    if (tokenMatch && tokenMatch[1]) {
                        tokenId = tokenMatch[1];
                    }
                }

                const successMessage = tokenId
                    ? `NFT #${tokenId} minted successfully!`
                    : 'NFT minted successfully!';

                toast.success(successMessage, { id: 'mint-toast' });

                if (tokenId) {
                    const userNfts = JSON.parse(localStorage.getItem('userNfts') || '[]');
                    userNfts.push({
                        tokenId,
                        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                        contractName: process.env.NEXT_PUBLIC_CONTRACT_NAME,
                        metadata: metadataUri
                    });
                    localStorage.setItem('userNfts', JSON.stringify(userNfts));
                }

                onSuccess();
                onClose();
                setIsProcessing(false);

                setTimeout(() => {
                    window.location.href = '/my-profile';
                }, 2000);
            } else if (data.tx_status === 'pending') {
                toast.loading('Transaction pending, checking again soon...', { id: 'mint-toast' });
                setTimeout(() => checkTransactionStatus(txid), 5000);
            } else if (data.tx_status === 'abort_by_response') {
                let errorMessage = 'Minting transaction failed: aborted by contract';

                if (data.tx_result && data.tx_result.repr) {
                    const errorMatch = data.tx_result.repr.match(/\(err u(\d+)\)/);
                    if (errorMatch && errorMatch[1]) {
                        const errorCode = errorMatch[1];
                        const errorMessages = {
                            '100': 'Unauthorized: Only contract owner can mint',
                            '101': 'Invalid recipient',
                            '102': 'Invalid metadata URI',
                            '103': 'Cannot transfer to yourself',
                        };
                        errorMessage = errorMessages[errorCode] || `Contract error: code ${errorCode}`;
                    }
                }
                toast.error(errorMessage, { id: 'mint-toast' });
                setIsProcessing(false);
            } else {
                toast.error(`Minting transaction failed: ${data.tx_status}`, { id: 'mint-toast' });
                setIsProcessing(false);
            }
        } catch (error) {
            toast.loading('Error checking transaction status, trying again soon...', { id: 'mint-toast' });
            setTimeout(() => checkTransactionStatus(txid), 5000);
        }
    };

    const handleCancel = () => {
        setIsProcessing(false);
        setTransactionStarted(false);
        setPaymentComplete(false);
        toast.dismiss('payment-toast');
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

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            <p className="font-medium">Error:</p>
                            <p>{error}</p>
                            <p className="mt-2 text-xs">
                                If you already made the payment but got an error, you can
                                <button
                                    onClick={handleManualTxId}
                                    className="ml-1 underline font-medium"
                                >
                                    enter your transaction ID manually
                                </button>.
                            </p>
                        </div>
                    )}

                    {isProcessing ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                <p>
                                    {!transactionStarted
                                        ? 'Preparing transaction...'
                                        : !paymentComplete
                                            ? 'Waiting for payment confirmation...'
                                            : 'Minting your NFT ticket...'}
                                </p>
                            </div>
                            {transactionId && (
                                <div className="text-xs text-center">
                                    <p className="text-gray-500">Transaction ID:</p>
                                    <a
                                        href={`https://explorer.hiro.so/txid/${transactionId}?chain=testnet`}
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
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handlePayment}
                            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Pay {event.price} STX
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
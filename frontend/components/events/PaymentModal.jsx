'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { showConnect, request } from '@stacks/connect';

export default function PaymentModal({ isOpen, onClose, event, onSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionStarted, setTransactionStarted] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [error, setError] = useState(null);
    const { userData, isAuthenticated } = useAuth();

    // Verificar se o usuário está autenticado quando o modal abre
    useEffect(() => {
        if (isOpen && !isAuthenticated) {
            showConnect({
                appDetails: {
                    name: 'NFT Ticket App',
                    icon: window.location.origin + '/logo.png',
                },
                redirectTo: '/',
                onFinish: () => {
                    console.log('Connect finished');
                },
            });
        }
    }, [isOpen, isAuthenticated]);

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            setTransactionStarted(false);
            setTransactionId(null);
            setPaymentComplete(false);
            setError(null);

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
            console.log('User data:', userData);

            // Endereço do contrato ou carteira que receberá o pagamento
            const receiverAddress = 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK';

            // Converter o preço para microSTX (1 STX = 1,000,000 microSTX)
            const priceInMicroStx = Math.floor(event.price * 1000000).toString();

            // Mostrar toast de loading
            toast.loading('Preparing payment transaction...', { id: 'payment-toast' });

            // Atualizar o estado antes de chamar a carteira
            setTransactionStarted(true);

            console.log('Requesting STX transfer with amount:', priceInMicroStx);

            try {
                // Usar o método request com stx_transferStx
                const requestOptions = {
                    recipient: receiverAddress,
                    amount: priceInMicroStx,
                    memo: `Ticket for event ${event.id}`,
                    network: 'testnet',
                };

                console.log('Request options:', requestOptions);

                const response = await request('stx_transferStx', requestOptions);

                console.log('Payment transaction response:', response);

                if (response && response.txId) {
                    setTransactionId(response.txId);
                    toast.success('Payment successful! Minting your ticket...', { id: 'payment-toast' });
                    setPaymentComplete(true);
                    // Iniciar o processo de mint após o pagamento
                    handleMint(userAddress, response.txId);
                } else {
                    throw new Error('No transaction ID returned');
                }
            } catch (requestError) {
                console.error('Request error:', requestError);
                setError(requestError.message || 'Unknown error');

                // Mesmo com erro, vamos verificar se a transação foi enviada
                // Isso pode acontecer quando a carteira processa a transação mas há erro na comunicação
                if (requestError.message && requestError.message.includes('rejected')) {
                    // Verificar se há uma transação recente do usuário
                    toast.loading('Checking for recent transactions...', { id: 'payment-toast' });
                    try {
                        const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${userAddress}/transactions?limit=1`);
                        const data = await response.json();

                        if (data.results && data.results.length > 0) {
                            const latestTx = data.results[0];
                            const currentTime = new Date().getTime();
                            const txTime = new Date(latestTx.burn_block_time_iso).getTime();

                            // Se a transação for recente (menos de 5 minutos)
                            if (currentTime - txTime < 5 * 60 * 1000) {
                                console.log('Found recent transaction:', latestTx.tx_id);
                                setTransactionId(latestTx.tx_id);
                                toast.success('Found a recent payment! Minting your ticket...', { id: 'payment-toast' });
                                setPaymentComplete(true);
                                handleMint(userAddress, latestTx.tx_id);
                                return;
                            }
                        }

                        // Se não encontrar transação recente
                        toast.error('Payment canceled by user', { id: 'payment-toast' });
                    } catch (checkError) {
                        console.error('Error checking recent transactions:', checkError);
                        toast.error('Payment canceled by user', { id: 'payment-toast' });
                    }
                } else {
                    toast.error(`Payment error: ${requestError.message || 'Unknown error'}`, { id: 'payment-toast' });
                }
                setIsProcessing(false);
                setTransactionStarted(false);
            }

        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message || 'Unknown error');
            toast.error('Failed to process payment', { id: 'payment-toast' });
            setIsProcessing(false);
            setTransactionStarted(false);
        }
    };

    // Função para permitir que o usuário insira manualmente um ID de transação
    const handleManualTxId = () => {
        const txId = prompt('Please enter your transaction ID:');
        if (txId && txId.trim()) {
            setTransactionId(txId.trim());
            toast.success('Transaction ID received! Minting your ticket...', { id: 'payment-toast' });
            setPaymentComplete(true);

            // Verificar possíveis locais onde o endereço pode estar
            const userAddress = userData?.address ||
                userData?.stxAddress ||
                userData?.addresses?.stx?.[0]?.address ||
                userData?.profile?.stxAddress;

            handleMint(userAddress, txId.trim());
        }
    };

    const handleMint = async (userAddress, paymentTxId) => {
        try {
            // Definir o endereço e nome do contrato
            const contractAddress = 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK';
            const contractName = 'nft-ticket';

            // Criar um metadata simples
            const metadataUri = `event-${event.id}`;
            console.log('Using metadata:', metadataUri);

            toast.loading('Minting your NFT ticket...', { id: 'mint-toast' });

            // Chamar a API para fazer o mint no backend
            console.log('Calling backend API for minting...');
            try {
                const response = await fetch('/api/mint-nft', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userAddress,
                        metadataUri,
                        contractAddress,
                        contractName,
                        paymentTxId // Incluir o ID da transação de pagamento para referência
                    }),
                });

                const result = await response.json();
                console.log('API mint response:', result);

                if (result.success && result.txid) {
                    setTransactionId(result.txid);
                    toast.loading('NFT minting transaction submitted. Checking status...', { id: 'mint-toast' });
                    checkTransactionStatus(result.txid);
                } else {
                    console.error('API mint error:', result.error);
                    toast.error(`Failed to mint NFT ticket: ${result.error || 'Unknown error'}`, { id: 'mint-toast' });
                    setIsProcessing(false);
                }
            } catch (apiError) {
                console.error('API mint call error:', apiError);
                toast.error(`API error: ${apiError.message || 'Unknown error'}`, { id: 'mint-toast' });
                setIsProcessing(false);
            }

        } catch (error) {
            console.error('Mint error:', error);
            toast.error('Failed to mint NFT ticket', { id: 'mint-toast' });
            setIsProcessing(false);
        }
    };

    // Função para verificar o status da transação
    const checkTransactionStatus = async (txid) => {
        try {
            console.log('Checking transaction status for:', txid);

            // Remover o prefixo '0x' se estiver presente
            const cleanTxid = txid.startsWith('0x') ? txid.substring(2) : txid;

            const response = await fetch(`https://api.testnet.hiro.so/extended/v1/tx/${cleanTxid}`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Transaction not found yet, checking again soon...');
                    // Verificar novamente após alguns segundos
                    setTimeout(() => checkTransactionStatus(txid), 5000);
                    return;
                }

                // Outro erro de API
                toast.error(`API error: ${response.status}`, { id: 'mint-toast' });
                setIsProcessing(false);
                return;
            }

            const data = await response.json();
            console.log('Transaction status:', data);

            if (data.tx_status === 'success') {
                // Extrair o token ID do resultado da transação
                let tokenId = null;
                if (data.tx_result && data.tx_result.repr) {
                    const tokenMatch = data.tx_result.repr.match(/\(ok u(\d+)\)/);
                    if (tokenMatch && tokenMatch[1]) {
                        tokenId = tokenMatch[1];
                    }
                }

                // Mensagem de sucesso com o token ID, se disponível
                const successMessage = tokenId
                    ? `NFT #${tokenId} mintada com sucesso!`
                    : 'NFT mintada com sucesso!';

                toast.success(successMessage, { id: 'mint-toast' });

                // Armazenar o token ID no localStorage para exibição na página de perfil
                if (tokenId) {
                    const userNfts = JSON.parse(localStorage.getItem('userNfts') || '[]');
                    userNfts.push({
                        tokenId,
                        contractAddress: 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK',
                        contractName: 'nft-ticket',
                        metadata: metadataUri
                    });
                    localStorage.setItem('userNfts', JSON.stringify(userNfts));
                }

                onSuccess();
                onClose();
                setIsProcessing(false);

                // Redirecionar para a página de perfil após 2 segundos
                setTimeout(() => {
                    window.location.href = '/my-profile';
                }, 2000);
            } else if (data.tx_status === 'pending') {
                // Verificar novamente após alguns segundos
                toast.loading('Transação pendente, verificando novamente em breve...', { id: 'mint-toast' });
                setTimeout(() => checkTransactionStatus(txid), 5000);
            } else if (data.tx_status === 'abort_by_response') {
                // Transação foi abortada pelo contrato
                let errorMessage = 'Transação de mint falhou: abortada pelo contrato';

                // Tentar extrair o código de erro específico
                if (data.tx_result && data.tx_result.repr) {
                    const errorMatch = data.tx_result.repr.match(/\(err u(\d+)\)/);
                    if (errorMatch && errorMatch[1]) {
                        const errorCode = errorMatch[1];

                        // Mapear códigos de erro para mensagens amigáveis
                        const errorMessages = {
                            '100': 'Não autorizado: Apenas o proprietário do contrato pode mintar',
                            '101': 'Destinatário inválido',
                            '102': 'URI de metadados inválido',
                            '103': 'Não é possível transferir para si mesmo',
                        };

                        errorMessage = errorMessages[errorCode] || `Erro de contrato: código ${errorCode}`;
                    }
                }

                toast.error(errorMessage, { id: 'mint-toast' });
                setIsProcessing(false);
            } else {
                // Outro status de transação
                toast.error(`Transação de mint falhou: ${data.tx_status}`, { id: 'mint-toast' });
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);

            // Se receber um erro, tentar novamente após alguns segundos
            toast.loading('Erro ao verificar status da transação, tentando novamente em breve...', { id: 'mint-toast' });
            setTimeout(() => checkTransactionStatus(txid), 5000);
        }
    };

    // Função para cancelar a transação em andamento
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
                                        ? 'Preparing...'
                                        : paymentComplete
                                            ? 'Minting your NFT ticket...'
                                            : 'Processing payment...'}
                                </p>
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
                        <div className="space-y-3">
                            <button
                                onClick={handlePayment}
                                className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
                            >
                                Confirm Purchase
                            </button>

                            <button
                                onClick={handleManualTxId}
                                className="w-full py-2 text-sm text-gray-600 hover:underline"
                            >
                                I already made the payment
                            </button>
                        </div>
                    )}

                    {transactionStarted && !transactionId && (
                        <div className="text-sm text-gray-500 text-center space-y-2 mt-4">
                            <p>Please confirm the transaction in your wallet</p>
                            <p>This may take a few moments...</p>
                        </div>
                    )}

                    {paymentComplete && !transactionId && (
                        <div className="text-sm text-gray-500 text-center space-y-2 mt-4">
                            <p>Payment confirmed! Minting your NFT ticket...</p>
                            <p>This process is handled by our server and may take a few moments</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
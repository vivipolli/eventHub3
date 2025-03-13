// /api/mint-nft.js
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  Cl,
} from '@stacks/transactions'
import { NextResponse } from 'next/server'

// ATENÇÃO: Para produção, use variáveis de ambiente!
// Esta é uma chave de exemplo apenas para testes

export async function POST(request) {
  try {
    const {
      userAddress,
      metadataUri,
      contractAddress,
      contractName,
      paymentTxId,
    } = await request.json()

    // Log para depuração
    console.log('Mint request received:', {
      userAddress,
      metadataUri,
      contractAddress,
      contractName,
      paymentTxId,
    })

    // Verificar se todos os parâmetros necessários estão presentes
    if (!userAddress || !metadataUri || !contractAddress || !contractName) {
      console.error('Missing required parameters')
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verificar se o userAddress é válido (formato de endereço Stacks)
    if (!userAddress.startsWith('ST') || userAddress.length < 32) {
      console.error('Invalid user address format')
      return NextResponse.json(
        { success: false, error: 'Invalid user address format' },
        { status: 400 }
      )
    }

    // Verificar se o pagamento foi concluído (opcional)
    // Você pode adicionar uma verificação aqui para confirmar que o paymentTxId é válido

    // Usar a chave privada recuperada do mnemônico
    // Esta deve ser a chave do endereço que implantou o contrato
    const senderKey = process.env.STACKS_PRIVATE_KEY
    console.log('senderKey', senderKey)
    if (!senderKey) {
      console.error('STACKS_PRIVATE_KEY not found')
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: Missing STACKS_PRIVATE_KEY',
        },
        { status: 500 }
      )
    }

    console.log('Creating contract call transaction...')

    // Preparar o metadata URI - garantir que seja uma string ASCII válida e não vazia
    // Limitar a 256 caracteres conforme o contrato
    let validMetadataUri = ''
    try {
      // Remover caracteres não ASCII e limitar o tamanho
      validMetadataUri = metadataUri
        .replace(/[^\x20-\x7E]/g, '') // Manter apenas caracteres ASCII imprimíveis
        .substring(0, 256)

      // Verificar se a string resultante é válida e não vazia
      if (!validMetadataUri || validMetadataUri.length === 0) {
        console.error('Invalid or empty metadata URI after sanitization')
        return NextResponse.json(
          { success: false, error: 'Invalid or empty metadata URI' },
          { status: 400 }
        )
      }

      console.log('Sanitized metadata URI:', validMetadataUri)
    } catch (sanitizeError) {
      console.error('Error sanitizing metadata URI:', sanitizeError)
      return NextResponse.json(
        { success: false, error: 'Failed to process metadata URI' },
        { status: 400 }
      )
    }

    try {
      // Verificar se o endereço do contrato corresponde ao do plano de implantação
      if (contractAddress !== 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK') {
        console.warn(
          'Contract address mismatch. Using address from deployment plan.'
        )
        contractAddress = 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK'
      }

      // Verificar se o nome do contrato corresponde ao do plano de implantação
      if (contractName !== 'nft-ticket') {
        console.warn('Contract name mismatch. Using name from deployment plan.')
        contractName = 'nft-ticket'
      }

      console.log(`Using contract: ${contractAddress}.${contractName}`)
      console.log(`Minting to recipient: ${userAddress}`)
      console.log(`With metadata: ${validMetadataUri}`)

      // Criar a transação de mint usando o formato do exemplo
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'mint',
        functionArgs: [
          Cl.standardPrincipal(userAddress),
          Cl.stringAscii(validMetadataUri),
        ],
        senderKey,
        validateWithAbi: true,
        network: 'testnet',
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
      }

      const transaction = await makeContractCall(txOptions)

      console.log('Broadcasting transaction...')

      // Transmitir a transação usando o formato do exemplo
      const broadcastResponse = await broadcastTransaction({
        transaction,
        network: 'testnet',
      })
      console.log('Broadcast response:', broadcastResponse)

      // Verificar se a transação foi rejeitada
      if (broadcastResponse.error) {
        return NextResponse.json(
          {
            success: false,
            txid: broadcastResponse.txid,
            error: broadcastResponse.error,
            reason: broadcastResponse.reason,
            reasonData: broadcastResponse.reason_data,
            message: `Transaction rejected: ${broadcastResponse.reason}`,
          },
          { status: 400 }
        )
      }

      if (broadcastResponse.txid) {
        return NextResponse.json({
          success: true,
          txid: broadcastResponse.txid,
          message: 'NFT mint transaction submitted successfully',
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to broadcast transaction',
            details: broadcastResponse,
          },
          { status: 400 }
        )
      }
    } catch (txError) {
      console.error('Transaction error:', txError)

      return NextResponse.json(
        {
          success: false,
          error: `Transaction error: ${txError.message}`,
          stack:
            process.env.NODE_ENV === 'development' ? txError.stack : undefined,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

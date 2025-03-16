import { NextResponse } from 'next/server'
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  Cl,
} from '@stacks/transactions'

export async function POST(request) {
  try {
    const { userAddress, metadataUri, contractAddress, contractName } =
      await request.json()

    if (!userAddress || !metadataUri || !contractAddress || !contractName) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (!userAddress.startsWith('ST') || userAddress.length < 32) {
      return NextResponse.json(
        { success: false, error: 'Invalid user address format' },
        { status: 400 }
      )
    }

    const senderKey = process.env.STACKS_PRIVATE_KEY
    if (!senderKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: Missing STACKS_PRIVATE_KEY',
        },
        { status: 500 }
      )
    }

    let validMetadataUri = ''
    try {
      validMetadataUri = metadataUri
        .replace(/[^\x20-\x7E]/g, '')
        .substring(0, 256)

      if (!validMetadataUri || validMetadataUri.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid or empty metadata URI' },
          { status: 400 }
        )
      }
    } catch (sanitizeError) {
      return NextResponse.json(
        { success: false, error: 'Failed to process metadata URI' },
        { status: 400 }
      )
    }

    try {
      const defaultContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
      const defaultContractName = process.env.NEXT_PUBLIC_CONTRACT_NAME

      const finalContractAddress = contractAddress || defaultContractAddress
      const finalContractName = contractName || defaultContractName

      const txOptions = {
        contractAddress: finalContractAddress,
        contractName: finalContractName,
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

      const broadcastResponse = await broadcastTransaction({
        transaction,
        network: 'testnet',
      })

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

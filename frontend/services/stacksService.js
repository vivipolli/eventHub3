import { StacksTestnet } from '@stacks/network'
import {
  principalCV,
  uintCV,
  cvToValue,
  serializeCV,
} from '@stacks/transactions'

// Configurações do contrato
const CONTRACT_ADDRESS = 'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK'
const CONTRACT_NAME = 'nft-ticket'
const NETWORK = new StacksTestnet()

/**
 * Executa uma chamada de função somente leitura no contrato
 * @param {string} functionName Nome da função
 * @param {Array} functionArgs Argumentos da função
 * @returns {Promise<any>} Resultado da chamada
 */
async function callReadOnlyFunction(functionName, functionArgs = []) {
  try {
    // Construir a URL para a chamada da função
    const url = NETWORK.getReadOnlyFunctionCallApiUrl(
      CONTRACT_ADDRESS,
      CONTRACT_NAME,
      functionName
    )

    // Serializar os argumentos da função
    const args = functionArgs.map(arg => {
      return {
        type: arg.type,
        value: serializeCV(arg).toString('hex'),
      }
    })

    // Fazer a chamada HTTP
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        arguments: args,
        sender: CONTRACT_ADDRESS,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error)
    throw error
  }
}

/**
 * Busca o último token ID do contrato NFT
 * @returns {Promise<number>} O último token ID
 */
export async function getLastTokenId() {
  try {
    const result = await callReadOnlyFunction('get-last-token-id', [])

    // Extrair o valor do resultado
    if (result && result.value) {
      // O valor está em formato hexadecimal, converter para número
      return parseInt(result.value.value.hex.substr(2), 16)
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error fetching last token ID:', error)
    throw error
  }
}

/**
 * Verifica o proprietário de um token específico
 * @param {number} tokenId ID do token
 * @returns {Promise<string>} Endereço do proprietário
 */
export async function getTokenOwner(tokenId) {
  try {
    const result = await callReadOnlyFunction('get-owner', [uintCV(tokenId)])

    // Extrair o endereço do proprietário do resultado
    if (result && result.value && result.value.value) {
      return result.value.value
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error(`Error fetching owner for token ${tokenId}:`, error)
    throw error
  }
}

/**
 * Busca o URI de metadados de um token específico
 * @param {number} tokenId ID do token
 * @returns {Promise<string>} URI dos metadados
 */
export async function getTokenUri(tokenId) {
  try {
    const result = await callReadOnlyFunction('get-token-uri', [
      uintCV(tokenId),
    ])

    // Extrair o URI dos metadados do resultado
    if (result && result.value && result.value.value) {
      return result.value.value
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error(`Error fetching URI for token ${tokenId}:`, error)
    throw error
  }
}

/**
 * Busca todos os NFTs pertencentes a um usuário
 * @param {string} userAddress Endereço do usuário
 * @returns {Promise<Array>} Lista de NFTs do usuário
 */
export async function getUserNFTs(userAddress) {
  try {
    // Buscar o último token ID
    const lastTokenId = await getLastTokenId()
    console.log('Last token ID:', lastTokenId)

    // Array para armazenar os NFTs do usuário
    const userNFTs = []

    // Verificar cada token para ver se pertence ao usuário
    for (let tokenId = 1; tokenId <= lastTokenId; tokenId++) {
      try {
        const owner = await getTokenOwner(tokenId)

        // Se o proprietário for o endereço do usuário, buscar os metadados
        if (owner === userAddress) {
          const uri = await getTokenUri(tokenId)

          // Extrair informações do evento do URI (em produção, você buscaria mais dados)
          const eventId = uri.split('-')[1] || tokenId

          // Adicionar o NFT à lista
          userNFTs.push({
            id: tokenId,
            tokenId: tokenId,
            eventName: `Event #${eventId}`,
            date: 'Mar 15-17, 2024',
            location: 'New York, NY',
            status: 'past',
            ticketType: 'Standard',
            contractAddress: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
            metadata: uri,
            color: 'primary',
            nftMinted: true,
            presenceConfirmed: true,
          })
        }
      } catch (error) {
        console.error(`Error processing token ${tokenId}:`, error)
        // Continue com o próximo token
        continue
      }
    }

    console.log('Found NFTs:', userNFTs)
    return userNFTs
  } catch (error) {
    console.error('Error fetching user NFTs:', error)
    return []
  }
}

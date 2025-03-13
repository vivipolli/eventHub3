// Simplificado para usar apenas fetch API sem dependências externas

// Configurações da API
const API_BASE_URL = 'https://api.testnet.hiro.so'

/**
 * Função para obter NFTs de um endereço
 * @param {string} address - Endereço Stacks
 * @returns {Promise<Array>} - Lista de NFTs
 */
export async function getNftsForAddress(address) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/extended/v1/tokens/nft/holdings?principal=${address}&limit=50`
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return []
  }
}

/**
 * Função para obter detalhes de uma NFT específica
 * @param {string} contractAddress - Endereço do contrato
 * @param {string} contractName - Nome do contrato
 * @param {string|number} tokenId - ID do token
 * @returns {Promise<Object|null>} - Detalhes da NFT
 */
export async function getNftDetails(contractAddress, contractName, tokenId) {
  try {
    // Construir a URL para a API de metadados do token
    const url = `${API_BASE_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/get-token-uri`

    // Preparar o corpo da requisição
    const body = {
      sender: contractAddress,
      arguments: [`0x${parseInt(tokenId).toString(16)}`], // Converter tokenId para hex
    }

    // Fazer a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Extrair o URI dos metadados da resposta
    let metadata = null
    if (data.okay && data.result) {
      // Decodificar o resultado (formato Clarity)
      const resultHex = data.result.substr(2) // Remover '0x'
      const resultBuffer = Buffer.from(resultHex, 'hex')
      const resultString = resultBuffer.toString('utf8')

      // Extrair o valor da string (formato Clarity)
      const metadataMatch = resultString.match(/"([^"]+)"/)
      metadata = metadataMatch ? metadataMatch[1] : null
    }

    return {
      tokenId,
      metadata,
    }
  } catch (error) {
    console.error('Error fetching NFT details:', error)
    return null
  }
}

/**
 * Função para verificar o saldo de STX
 * @param {string} address - Endereço Stacks
 * @returns {Promise<Object>} - Saldo STX
 */
export async function getStxBalance(address) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/extended/v1/address/${address}/balances`
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      balance: parseInt(data.stx.balance),
      locked: parseInt(data.stx.locked || '0'),
    }
  } catch (error) {
    console.error('Error fetching STX balance:', error)
    return { balance: 0, locked: 0 }
  }
}

/**
 * Função para verificar se um usuário possui uma NFT específica
 * @param {string} userAddress - Endereço do usuário
 * @param {string} contractAddress - Endereço do contrato
 * @param {string} contractName - Nome do contrato
 * @param {string|number} tokenId - ID do token
 * @returns {Promise<boolean>} - True se o usuário possuir a NFT
 */
export async function checkNftOwnership(
  userAddress,
  contractAddress,
  contractName,
  tokenId
) {
  try {
    // Construir a URL para a API de proprietário do token
    const url = `${API_BASE_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/get-owner`

    // Preparar o corpo da requisição
    const body = {
      sender: userAddress,
      arguments: [`0x${parseInt(tokenId).toString(16)}`], // Converter tokenId para hex
    }

    // Fazer a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Verificar se o proprietário é o usuário
    if (data.okay && data.result) {
      // Decodificar o resultado (formato Clarity)
      const resultHex = data.result.substr(2) // Remover '0x'
      const resultBuffer = Buffer.from(resultHex, 'hex')
      const resultString = resultBuffer.toString('utf8')

      // Extrair o endereço do proprietário (formato Clarity)
      const ownerMatch = resultString.match(/'([^']+)/)
      const owner = ownerMatch ? ownerMatch[1] : null

      return owner === userAddress
    }

    return false
  } catch (error) {
    console.error('Error checking NFT ownership:', error)
    return false
  }
}

/**
 * Função para obter o último ID de token do contrato
 * @param {string} contractAddress - Endereço do contrato
 * @param {string} contractName - Nome do contrato
 * @returns {Promise<number|null>} - Último ID de token
 */
export async function getLastTokenId(contractAddress, contractName) {
  try {
    // Construir a URL para a API de último ID de token
    const url = `${API_BASE_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/get-last-token-id`

    // Preparar o corpo da requisição
    const body = {
      sender: contractAddress,
      arguments: [],
    }

    // Fazer a requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    // Extrair o último ID de token da resposta
    if (data.okay && data.result) {
      // Decodificar o resultado (formato Clarity)
      const resultHex = data.result.substr(2) // Remover '0x'
      const resultBuffer = Buffer.from(resultHex, 'hex')
      const resultString = resultBuffer.toString('utf8')

      // Extrair o valor numérico (formato Clarity)
      const idMatch = resultString.match(/u(\d+)/)
      return idMatch ? parseInt(idMatch[1]) : null
    }

    return null
  } catch (error) {
    console.error('Error fetching last token ID:', error)
    return null
  }
}

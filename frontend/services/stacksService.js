const API_BASE_URL = 'https://api.testnet.hiro.so'

/**
 * Função para obter NFTs de um endereço
 * @param {string} address - Endereço Stacks
 * @returns {Promise<Array>} - Lista de NFTs
 */
export async function getNftsForAddress(address) {
  try {
    const url = `${API_BASE_URL}/extended/v1/tokens/nft/holdings?principal=${address}&limit=50`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `API error: ${response.status} when fetching NFTs for address ${address}`
      )
    }

    const data = await response.json()
    const nfts = data.results || []

    const contractNfts = nfts.filter(nft =>
      nft.asset_identifier.includes(
        'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK.nft-ticket'
      )
    )

    const enrichedNfts = await Promise.all(
      contractNfts.map(async nft => {
        try {
          const tokenId = nft.value.repr.replace('u', '')
          const tokenUri = await getNftTokenUri(
            'ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK',
            'nft-ticket',
            tokenId,
            address
          )
          return {
            ...nft,
            tokenUri,
          }
        } catch (error) {
          console.error(`Error processing NFT:`, error)
          return nft
        }
      })
    )

    console.log('Enriched NFTs:', enrichedNfts)

    return enrichedNfts
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    throw error
  }
}

/**
 * Função para obter o URI do token diretamente do contrato
 * @param {string} contractAddress - Endereço do contrato
 * @param {string} contractName - Nome do contrato
 * @param {string|number} tokenId - ID do token
 * @param {string} userAddress - Endereço do usuário que está fazendo a chamada
 * @returns {Promise<string|null>} - URI do token
 */
export async function getNftTokenUri(
  contractAddress,
  contractName,
  tokenId,
  userAddress
) {
  try {
    const url = `${API_BASE_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/get-token-uri`

    const hexTokenId = `0x01${parseInt(tokenId).toString(16).padStart(32, '0')}`

    const body = {
      sender: userAddress,
      arguments: [hexTokenId],
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} when fetching token URI`)
    }

    const data = await response.json()

    if (data.okay && data.result) {
      const hexString = data.result.slice(2)
      const bytes = Buffer.from(hexString, 'hex')
      const decodedString = bytes.toString('utf8')
      const cleanString = decodedString
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        .replace(/^C/, '')
      return cleanString
    }

    return null
  } catch (error) {
    console.error('Error fetching NFT token URI:', error)
    throw error
  }
}

/**
 * Converte uma URL IPFS para uma URL HTTP acessível
 * @param {string} ipfsUrl - URL no formato ipfs://
 * @returns {string} - URL HTTP acessível
 */
export function convertIpfsUrl(ipfsUrl) {
  if (!ipfsUrl) {
    console.error('Empty IPFS URL provided to convertIpfsUrl')
    return null
  }

  // Verificar se é uma URL IPFS
  if (ipfsUrl.startsWith('ipfs://')) {
    // Extrair o hash IPFS (remover 'ipfs://')
    const ipfsHash = ipfsUrl.replace('ipfs://', '')
    console.log(
      `Converting IPFS URL: ipfs://${ipfsHash} to https://ipfs.io/ipfs/${ipfsHash}`
    )
    // Retornar a URL do gateway IPFS
    return `https://ipfs.io/ipfs/${ipfsHash}`
  }

  // Se já for uma URL HTTP ou HTTPS, retornar como está
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl
  }

  // Se for apenas o hash IPFS, adicionar o prefixo do gateway
  if (ipfsUrl.match(/^[a-zA-Z0-9]{46}$/)) {
    console.log(
      `Converting IPFS hash: ${ipfsUrl} to https://ipfs.io/ipfs/${ipfsUrl}`
    )
    return `https://ipfs.io/ipfs/${ipfsUrl}`
  }

  // Caso contrário, retornar a URL original
  return ipfsUrl
}

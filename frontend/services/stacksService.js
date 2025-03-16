const API_BASE_URL = process.env.NEXT_PUBLIC_HIRO_API_URL
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME

/**
 * Function to get NFTs for a given address
 * @param {string} address - Stacks address
 * @returns {Promise<Array>} - List of NFTs
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
      nft.asset_identifier.includes(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
    )

    const enrichedNfts = await Promise.all(
      contractNfts.map(async nft => {
        try {
          const tokenId = nft.value.repr.replace('u', '')
          const tokenUri = await getNftTokenUri(
            CONTRACT_ADDRESS,
            CONTRACT_NAME,
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

  if (ipfsUrl.startsWith('ipfs://')) {
    const ipfsHash = ipfsUrl.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${ipfsHash}`
  }

  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl
  }

  if (ipfsUrl.match(/^[a-zA-Z0-9]{46}$/)) {
    return `https://ipfs.io/ipfs/${ipfsUrl}`
  }

  return ipfsUrl
}

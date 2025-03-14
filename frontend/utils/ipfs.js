export const ipfsToHttp = ipfsUrl => {
  if (!ipfsUrl) return ''
  // Remove o prefixo ipfs:// se existir
  const hash = ipfsUrl.replace('ipfs://', '')
  // Você pode escolher qual gateway usar
  return `https://gateway.pinata.cloud/ipfs/${hash}`
  // ou return `https://ipfs.io/ipfs/${hash}`;
}

export const isValidIpfsUrl = url => {
  if (!url) return false

  // Verifica se é uma URL IPFS válida
  const ipfsPattern =
    /^https:\/\/(ipfs\.io|gateway\.pinata\.cloud)\/ipfs\/[a-zA-Z0-9]+/
  return ipfsPattern.test(url)
}

export const ipfsToHttp = ipfsUrl => {
  if (!ipfsUrl) return ''
  // Remove o prefixo ipfs:// se existir
  const hash = ipfsUrl.replace('ipfs://', '')
  // Você pode escolher qual gateway usar
  return `https://gateway.pinata.cloud/ipfs/${hash}`
  // ou return `https://ipfs.io/ipfs/${hash}`;
}

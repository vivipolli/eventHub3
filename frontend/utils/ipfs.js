export const ipfsToHttp = ipfsUrl => {
  if (!ipfsUrl) return ''
  const hash = ipfsUrl.replace('ipfs://', '')
  return `https://gateway.pinata.cloud/ipfs/${hash}`
  // or return `https://ipfs.io/ipfs/${hash}`;
}

export const isValidIpfsUrl = url => {
  if (!url) return false

  const ipfsPattern =
    /^https:\/\/(ipfs\.io|gateway\.pinata\.cloud)\/ipfs\/[a-zA-Z0-9]+/
  return ipfsPattern.test(url)
}

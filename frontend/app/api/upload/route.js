import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { mkdir } from 'fs/promises'

// Configurações do Pinata
const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY

// Diretório temporário para armazenar arquivos
const TEMP_DIR = join(process.cwd(), 'tmp')

// Função para garantir que o diretório temporário exista
async function ensureTempDir() {
  try {
    await mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating temp directory:', error)
  }
}

// Função para fazer upload de arquivo para o Pinata
async function uploadFileToPinata(filePath, fileName) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  const data = new FormData()
  data.append('file', fs.createReadStream(filePath), fileName)

  const response = await axios.post(url, data, {
    maxBodyLength: Infinity,
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  })

  return response.data
}

// Função para fazer upload de JSON para o Pinata
async function uploadJSONToPinata(jsonData) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'

  const response = await axios.post(url, jsonData, {
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  })

  return response.data
}

// Função para processar o upload de imagem
export async function POST(request) {
  try {
    await ensureTempDir()

    // Processar o formulário multipart
    const formData = await request.formData()
    const image = formData.get('image')
    const eventData = formData.get('eventData')

    if (!image || !eventData) {
      return NextResponse.json(
        { error: 'Missing image or event data' },
        { status: 400 }
      )
    }

    // Parsear os dados do evento
    const eventDetails = JSON.parse(eventData)

    // Salvar a imagem temporariamente
    const fileId = uuidv4()
    const fileExtension = image.name.split('.').pop()
    const fileName = `${fileId}.${fileExtension}`
    const filePath = join(TEMP_DIR, fileName)

    const buffer = Buffer.from(await image.arrayBuffer())
    await writeFile(filePath, buffer)

    // Fazer upload da imagem para o Pinata
    const imageUploadResponse = await uploadFileToPinata(filePath, fileName)
    const imageIpfsHash = imageUploadResponse.IpfsHash
    const imageUrl = `ipfs://${imageIpfsHash}`

    // Criar metadados do NFT
    const nftMetadata = {
      name: eventDetails.title,
      description: eventDetails.description,
      image: imageUrl,
      attributes: [
        { trait_type: 'Event Date', value: eventDetails.date },
        { trait_type: 'Location', value: eventDetails.location },
        { trait_type: 'Category', value: eventDetails.category },
        { trait_type: 'Organizer', value: eventDetails.organizer.name },
        { trait_type: 'Price', value: eventDetails.price.toString() },
        { trait_type: 'Ticket Type', value: 'Standard' },
      ],
      properties: {
        eventId: eventDetails.id.toString(),
        eventStatus: eventDetails.status,
        isPaid: eventDetails.isPaid,
        createdAt: new Date().toISOString(),
      },
    }

    // Fazer upload dos metadados para o Pinata
    const metadataUploadResponse = await uploadJSONToPinata(nftMetadata)
    const metadataIpfsHash = metadataUploadResponse.IpfsHash
    const metadataUrl = `ipfs://${metadataIpfsHash}`

    // Limpar o arquivo temporário
    fs.unlinkSync(filePath)

    // Retornar as URLs do IPFS
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      metadataUrl: metadataUrl,
      imageIpfsHash: imageIpfsHash,
      metadataIpfsHash: metadataIpfsHash,
    })
  } catch (error) {
    console.error('Error processing upload:', error)
    return NextResponse.json(
      { error: 'Error processing upload', details: error.message },
      { status: 500 }
    )
  }
}

# EventHub3 🎉

EventHub3 is a decentralized event management platform built on the Stacks blockchain. It leverages Clarity smart contracts for secure and transparent event ticketing, Stacks.js for seamless blockchain integration, and Next.js for a modern, responsive frontend experience.

## Table of Contents 📚

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Smart Contracts](#smart-contracts)
- [Frontend Integration](#frontend-integration)
- [Environment Variables](#environment-variables)
- [Future Implementations](#future-implementations)
- [Contributing](#contributing)
- [License](#license)

## Introduction 🌟

EventHub3 aims to revolutionize the way events are organized and attended by utilizing blockchain technology. By using the Stacks blockchain, EventHub3 ensures that event ticketing is secure, transparent, and immutable.

## Features ✨

- **Decentralized Ticketing**: Issue and manage event tickets on the blockchain.
- **NFT Integration**: Mint NFTs as event tickets, providing a unique and verifiable proof of attendance.
- **User Profiles**: Manage user profiles with NFT collections and event history.
- **Secure Transactions**: Utilize Clarity smart contracts for secure and transparent transactions.
- **Responsive Design**: Built with Next.js for a seamless user experience across devices.

## Tech Stack 🛠️

- **Stacks Blockchain**: For decentralized data storage and smart contract execution.
- **Clarity**: A smart contract language for the Stacks blockchain, ensuring predictable and secure contract behavior.
- **Stacks.js**: A JavaScript library for interacting with the Stacks blockchain.
- **Next.js**: A React framework for building fast and scalable web applications.

## Getting Started 🚀

To get started with EventHub3, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/vivipolli/eventHub3.git
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the necessary environment variables (see [Environment Variables](#environment-variables)).

4. **Run the development server**:

   ```bash
   yarn run dev
   ```

5. **Open your browser**:
   Visit `http://localhost:3000` to view the application.

## Smart Contracts 🔗

EventHub3 uses Clarity smart contracts to manage event ticketing. These contracts are deployed on the Stacks blockchain and handle the minting and transfer of NFT tickets.

- **Contract Address**: `ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK`
- **Contract Name**: `nft-ticket`

## Frontend Integration 🌐

The frontend of EventHub3 is built with Next.js and integrates with the Stacks blockchain using Stacks.js. This allows for seamless interaction with smart contracts and blockchain data.

- **Stacks.js**: Used for making contract calls and handling transactions.
- **Next.js**: Provides server-side rendering and static site generation for optimal performance.

## Environment Variables 🔑

Ensure you have the following environment variables set in your `.env` file:

```
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_api_key
STACKS_PRIVATE_KEY=your_stacks_private_key
NEXT_PUBLIC_CONTRACT_ADDRESS=ST3GJH07ZBJ6F385P8JP7YCS03E3HH6FENAZ5YBPK
NEXT_PUBLIC_CONTRACT_NAME=nft-ticket
NEXT_PUBLIC_HIRO_API_URL=https://api.testnet.hiro.so

```

## Future Implementations 🚀

### Short-term Improvements

- **Enhanced UI/UX**: Improved interface design and user experience features
- **Centralized Database Integration**: Adding database support to store event details and user preferences
- **NFT Marketplace Integration**: Implementing a marketplace with contract functionality for collection NFT issuance
- **Social Login**: Adding the ability to log in with social media accounts
- **Follow Functionality**: Enabling users to follow event organizers and other attendees

### Long-term Vision

- **Decentralized Social Features**: Building a fully decentralized social layer for greater interaction between participants
- **Mobile Application**: Developing native mobile apps for iOS and Android
- **Multi-chain Support**: Expanding beyond Stacks to support other blockchain networks
- **DAO Governance**: Implementing decentralized autonomous organization features for community-driven event management

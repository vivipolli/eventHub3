'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, userData, connect, disconnect } = useAuth()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Função para exibir endereço truncado
  const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="w-full py-4 px-6 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10 mr-2">
              <div className="absolute inset-0 bg-primary rounded-full opacity-20"></div>
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl">
                  E3
                </span>
              </div>
            </div>
            <span className="text-foreground font-bold text-xl">Event3</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/events"
            className="text-foreground hover:text-primary transition-colors"
          >
            Events
          </Link>
          <Link
            href="/marketplace"
            className="text-foreground hover:text-secondary transition-colors"
          >
            NFT Marketplace
          </Link>
          <Link
            href="/organizers"
            className="text-foreground hover:text-accent transition-colors"
          >
            Organizers
          </Link>
          <Link
            href="/community"
            className="text-foreground hover:text-primary transition-colors"
          >
            Community
          </Link>
        </nav>

        {/* Login/Register Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/5 rounded-full border border-secondary/10 hover:bg-secondary/10 transition-colors">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium text-secondary">
                  {truncateAddress(userData?.addresses?.stx?.[0]?.address)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-4 py-2 text-foreground hover:text-primary transition-colors"
              >
                Disconnect
              </button>
              <Link
                href="/my-profile"
                className="px-5 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
              >
                My Profile
              </Link>
            </>
          ) : (
            <button
              onClick={connect}
              className="px-5 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/events"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/marketplace"
              className="text-foreground hover:text-secondary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              NFT Marketplace
            </Link>
            <Link
              href="/organizers"
              className="text-foreground hover:text-accent transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Organizers
            </Link>
            <Link
              href="/community"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community
            </Link>
            <div className="pt-4 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary/5 rounded-full border border-secondary/10 mx-auto">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span className="text-sm font-medium text-secondary">
                      {truncateAddress(userData?.addresses?.stx?.[0]?.address)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-center py-2 text-foreground hover:text-primary transition-colors"
                  >
                    Disconnect
                  </button>
                  <Link
                    href="/my-profile"
                    className="text-center px-5 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                </>
              ) : (
                <button
                  onClick={connect}
                  className="text-center px-5 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <div className="relative overflow-hidden bg-white">
            {/* Background Elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-96 h-96 bg-secondary opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 right-1/3 w-96 h-96 bg-accent opacity-5 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-block">
                            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                                Revolutionizing events with blockchain
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            <span className="text-primary">Digital</span> Events with
                            <span className="text-secondary"> NFT</span>
                            <span className="text-accent"> Certificates</span>
                        </h1>

                        <p className="text-lg text-gray-700 max-w-lg">
                            Combine events, blockchain and social networking in a single platform.
                            Acquire secure tickets, validate your attendance and receive exclusive NFTs
                            as participation certificates.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register" className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors box-glow-primary text-center font-medium">
                                Get Started
                            </Link>
                            <Link href="/events" className="px-8 py-3 border-2 border-secondary text-secondary rounded-full hover:bg-secondary hover:text-white transition-colors text-center font-medium">
                                Explore Events
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6">
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-primary">1000+</p>
                                <p className="text-sm text-gray-600">Events</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-secondary">50K+</p>
                                <p className="text-sm text-gray-600">Users</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-accent">10K+</p>
                                <p className="text-sm text-gray-600">NFTs Issued</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - 3D Illustration */}
                    <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Circular glow effects */}
                            <div className="absolute w-64 h-64 bg-primary opacity-20 rounded-full blur-xl"></div>
                            <div className="absolute w-48 h-48 bg-secondary opacity-20 rounded-full blur-xl -translate-x-20 translate-y-20"></div>
                            <div className="absolute w-40 h-40 bg-accent opacity-20 rounded-full blur-xl translate-x-24 -translate-y-16"></div>

                            {/* NFT Ticket Mockup */}
                            <div className="relative w-72 h-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 rotate-6 z-10">
                                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-2xl"></div>
                                <div className="absolute top-1/4 left-0 right-0 flex justify-center">
                                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                                        <span className="text-primary text-4xl font-bold glow-primary">NE</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col items-center justify-end p-6">
                                    <h3 className="text-lg font-bold mb-1">Tech Conference 2023</h3>
                                    <p className="text-sm text-gray-600 mb-3">Dec 15 • New York</p>
                                    <div className="w-full h-24 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                        <div className="w-20 h-20 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            <span className="text-xs text-gray-500">QR Code</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">#NFT-8273-XYZW</div>
                                </div>
                            </div>

                            {/* Second NFT Ticket (decorative) */}
                            <div className="absolute w-72 h-96 bg-white rounded-2xl shadow-xl border border-gray-100 -rotate-6 -translate-x-8 translate-y-4">
                                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-r from-secondary via-accent to-primary rounded-t-2xl opacity-70"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brands/Partners */}
                <div className="mt-16 border-t border-gray-100 pt-8">
                    <p className="text-center text-sm text-gray-500 mb-6">TRUSTED BY LEADING COMPANIES</p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-60">
                        <div className="h-8 w-auto">Company 1</div>
                        <div className="h-8 w-auto">Company 2</div>
                        <div className="h-8 w-auto">Company 3</div>
                        <div className="h-8 w-auto">Company 4</div>
                        <div className="h-8 w-auto">Company 5</div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Animation utility for elements entering viewport
function useElementOnScreen(options) {
    const containerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    const callbackFunction = (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
            setIsVisible(true);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunction, options);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, [containerRef, options]);

    return [containerRef, isVisible];
}

// Feature Card Component
const FeatureCard = ({ icon, title, description, color, index }) => {
    const [ref, isVisible] = useElementOnScreen({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-100 transform transition-all duration-700 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-20 opacity-0'
                }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <div className={`w-16 h-16 rounded-full bg-${color}/10 flex items-center justify-center mb-6`}>
                <span className={`text-${color} text-2xl`}>{icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

// Connection Visualization Component
const ConnectionsVisualization = () => {
    const [ref, isVisible] = useElementOnScreen({ threshold: 0.2 });

    // Nodes representing users, events, and organizers
    const nodes = [
        { id: 'user1', type: 'user', x: 20, y: 20, color: 'primary' },
        { id: 'user2', type: 'user', x: 80, y: 30, color: 'primary' },
        { id: 'user3', type: 'user', x: 30, y: 70, color: 'primary' },
        { id: 'user4', type: 'user', x: 70, y: 80, color: 'primary' },
        { id: 'event1', type: 'event', x: 50, y: 20, color: 'secondary' },
        { id: 'event2', type: 'event', x: 20, y: 50, color: 'secondary' },
        { id: 'event3', type: 'event', x: 80, y: 60, color: 'secondary' },
        { id: 'organizer1', type: 'organizer', x: 60, y: 40, color: 'accent' },
        { id: 'organizer2', type: 'organizer', x: 40, y: 60, color: 'accent' },
    ];

    // Connections between nodes
    const connections = [
        { from: 'user1', to: 'event1' },
        { from: 'user1', to: 'organizer1' },
        { from: 'user2', to: 'event1' },
        { from: 'user2', to: 'event3' },
        { from: 'user3', to: 'event2' },
        { from: 'user3', to: 'organizer2' },
        { from: 'user4', to: 'event3' },
        { from: 'user4', to: 'organizer1' },
        { from: 'organizer1', to: 'event1' },
        { from: 'organizer1', to: 'event3' },
        { from: 'organizer2', to: 'event2' },
    ];

    return (
        <div
            ref={ref}
            className={`relative h-[400px] w-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
        >
            {/* Background grid */}
            <div className="absolute inset-0 bg-gray-50 bg-grid-pattern"></div>

            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full">
                {connections.map((connection, index) => {
                    const fromNode = nodes.find(n => n.id === connection.from);
                    const toNode = nodes.find(n => n.id === connection.to);

                    if (!fromNode || !toNode) return null;

                    const fromX = `${fromNode.x}%`;
                    const fromY = `${fromNode.y}%`;
                    const toX = `${toNode.x}%`;
                    const toY = `${toNode.y}%`;

                    return (
                        <line
                            key={index}
                            x1={fromX}
                            y1={fromY}
                            x2={toX}
                            y2={toY}
                            className={`stroke-${fromNode.color}/30 stroke-2 ${isVisible ? 'animate-drawLine' : ''
                                }`}
                            style={{
                                strokeDasharray: '5,5',
                                animationDelay: `${index * 200}ms`
                            }}
                        />
                    );
                })}
            </svg>

            {/* Nodes */}
            {nodes.map((node, index) => (
                <div
                    key={node.id}
                    className={`absolute w-10 h-10 rounded-full bg-${node.color} flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2 ${isVisible ? 'animate-pulseNode' : 'opacity-0'
                        }`}
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        animationDelay: `${index * 150}ms`
                    }}
                >
                    {node.type === 'user' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                    )}
                    {node.type === 'event' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    )}
                    {node.type === 'organizer' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    )}
                </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span>Users</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span>Events</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                    <span>Organizers</span>
                </div>
            </div>
        </div>
    );
};

// Digital Identity Showcase Component
const DigitalIdentityShowcase = () => {
    const [ref, isVisible] = useElementOnScreen({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`relative bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
        >
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary via-secondary to-accent"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Alex Johnson</h3>
                    <p className="text-gray-600 text-sm">Web3 Enthusiast • 28 Events Attended</p>
                </div>
                <button className="ml-auto px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors">
                    Follow
                </button>
            </div>

            {/* NFT Collection Preview */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Event Collection</h4>
                    <span className="text-sm text-gray-500">12 NFTs</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-lg bg-gradient-to-br ${i === 0 ? 'from-primary/20 to-primary/50' :
                                    i === 1 ? 'from-secondary/20 to-secondary/50' :
                                        i === 2 ? 'from-accent/20 to-accent/50' :
                                            'from-gray-200 to-gray-300'
                                } flex items-center justify-center`}
                        >
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span className={`text-xs font-bold ${i === 0 ? 'text-primary' :
                                        i === 1 ? 'text-secondary' :
                                            i === 2 ? 'text-accent' :
                                                'text-gray-500'
                                    }`}>
                                    {i === 0 ? 'WS' : i === 1 ? 'CF' : i === 2 ? 'DC' : 'TE'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h4 className="font-medium mb-3">Recent Activity</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">Registered for <span className="font-medium">Blockchain Summit 2023</span></p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">Collected <span className="font-medium">Web3 Summit NFT</span></p>
                            <p className="text-xs text-gray-500">1 week ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PlatformFeatures() {
    const [ref, isVisible] = useElementOnScreen({ threshold: 0.1 });

    const features = [
        {
            icon: "🔗",
            title: "Digital Identity",
            description: "Build your unique digital identity through event participation and NFT collections that showcase your interests and experiences.",
            color: "primary"
        },
        {
            icon: "🌐",
            title: "Community Connections",
            description: "Connect with like-minded individuals, follow event organizers, and build your network in the blockchain and event space.",
            color: "secondary"
        },
        {
            icon: "🏆",
            title: "Exclusive Collectibles",
            description: "Receive and trade unique NFTs that serve as proof of attendance and exclusive digital memorabilia from your favorite events.",
            color: "accent"
        },
        {
            icon: "📊",
            title: "Interactive Ecosystem",
            description: "Engage in a dynamic ecosystem where organizers and participants connect, share, and build relationships beyond the event itself.",
            color: "primary"
        }
    ];

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div
                    ref={ref}
                    className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        More Than Just Tickets - A Complete <span className="text-primary">Web3</span> Experience
                    </h2>
                    <p className="text-lg text-gray-600">
                        Our platform isn't just a marketplace for event tickets. It's a hub of experiences, innovation, and community within the blockchain revolution.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                color={feature.color}
                                index={index}
                            />
                        ))}
                    </div>

                    {/* Right Side - Interactive Visualization */}
                    <div className="space-y-8">
                        <ConnectionsVisualization />
                        <DigitalIdentityShowcase />
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold mb-6">Ready to Join the Revolution?</h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors box-glow-primary text-center font-medium"
                        >
                            Create Your Profile
                        </Link>
                        <Link
                            href="/about"
                            className="px-8 py-3 border-2 border-secondary text-secondary rounded-full hover:bg-secondary hover:text-white transition-colors text-center font-medium"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
} 
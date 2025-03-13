'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllEvents } from '@/services/eventService';
const categories = [
    { id: 'all', name: 'All Events', count: 42 },
    { id: 'tech', name: 'Technology', count: 15 },
    { id: 'business', name: 'Business', count: 12 },
    { id: 'art', name: 'Art & Culture', count: 8 },
    { id: 'gaming', name: 'Gaming', count: 7 }
];

export default function EventsPage() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const storedEvents = getAllEvents();
        setEvents(storedEvents);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-6 py-16">
                    <h1 className="text-4xl font-bold text-center mb-4">
                        Discover Amazing Events
                    </h1>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
                        Join groundbreaking blockchain events and collect unique NFT certificates. Connect with the community and build your digital identity.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                            </div>
                            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                            <h3 className="font-semibold mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
                                    >
                                        <span className="text-gray-700">{category.name}</span>
                                        <span className="text-sm text-gray-500">{category.count}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 my-6"></div>

                            <h3 className="font-semibold mb-4">Filters</h3>

                            {/* Date Filter */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">Date</label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                    <option>Any date</option>
                                    <option>Today</option>
                                    <option>This week</option>
                                    <option>This month</option>
                                    <option>Next 3 months</option>
                                </select>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">Price Range</label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                    <option>Any price</option>
                                    <option>Free</option>
                                    <option>Under 0.1 ETH</option>
                                    <option>0.1 - 0.5 ETH</option>
                                    <option>Over 0.5 ETH</option>
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div className="mb-6">
                                <label className="block text-sm text-gray-600 mb-2">Location</label>
                                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                    <option>Anywhere</option>
                                    <option>Virtual</option>
                                    <option>North America</option>
                                    <option>Europe</option>
                                    <option>Asia</option>
                                </select>
                            </div>

                            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Sort Options */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">Showing 42 events</p>
                            <select className="px-3 py-2 border border-gray-200 rounded-lg">
                                <option>Most Popular</option>
                                <option>Newest First</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>

                        {/* Events Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    {/* Event Image */}
                                    <div className={`h-48 bg-${event.color}/10 relative overflow-hidden`}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient}`}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white text-4xl font-bold">
                                                {event.title.charAt(0)}
                                            </span>
                                        </div>
                                        {/* Category and Price Badge */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <span className={`bg-${event.color} text-white text-xs px-2 py-1 rounded-full`}>
                                                {event.category}
                                            </span>
                                            <span className={`${event.isPaid ? 'bg-primary' : 'bg-green-500'} text-white text-xs px-2 py-1 rounded-full`}>
                                                {event.isPaid ? `${event.price} ETH` : 'Free'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Event Details */}
                                    <div className="p-6">
                                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>

                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {event.date}
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600 mb-4">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {event.location}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className={`${event.isPaid ? 'text-primary' : 'text-green-500'} font-semibold`}>
                                                {event.isPaid ? `${event.price} ETH` : 'Free Registration'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {event.spotsLeft} spots left
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-12 flex justify-center">
                            <nav className="flex items-center space-x-2">
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button className="px-4 py-2 rounded-lg bg-primary text-white">1</button>
                                <button className="px-4 py-2 rounded-lg hover:bg-gray-100">2</button>
                                <button className="px-4 py-2 rounded-lg hover:bg-gray-100">3</button>
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
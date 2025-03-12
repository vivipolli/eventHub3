'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import EventCreationForm from '@/components/EventCreationForm';

export default function CreateEventPage() {
    const { isAuthenticated, userData, isLoading } = useAuth();
    const router = useRouter();

    // Verificar se o usuário está autenticado e é um organizador
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error('You must be logged in to create an event');
            router.push('/login?redirect=/create-event');
        } else if (!isLoading && isAuthenticated && !userData?.isOrganizer) {
            toast.error('Only organizers can create events');
            router.push('/my-profile');
        }
    }, [isAuthenticated, isLoading, router, userData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated || !userData?.isOrganizer) {
        return null; // Não renderizar nada enquanto redireciona
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Create New Event</h1>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <EventCreationForm />
                    </div>
                </div>
            </div>
        </div>
    );
} 
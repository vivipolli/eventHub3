import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function EventCreationForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'Technology',
        price: 0,
        isPaid: false,
        spotsAvailable: 100,
        organizer: {
            name: '',
            id: ''
        },
        status: 'upcoming',
        color: 'primary'
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Manipular mudanças nos campos do formulário
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'price') {
            // Se o preço for maior que 0, marcar como pago
            const isPaid = parseFloat(value) > 0;
            setEventData({
                ...eventData,
                [name]: parseFloat(value),
                isPaid
            });
        } else if (type === 'checkbox') {
            setEventData({
                ...eventData,
                [name]: checked
            });
        } else if (name.startsWith('organizer.')) {
            const organizerField = name.split('.')[1];
            setEventData({
                ...eventData,
                organizer: {
                    ...eventData.organizer,
                    [organizerField]: value
                }
            });
        } else {
            setEventData({
                ...eventData,
                [name]: value
            });
        }
    };

    // Manipular upload de imagem
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Enviar o formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            toast.error('Please select an event image');
            return;
        }

        setIsSubmitting(true);
        toast.loading('Creating event and uploading to IPFS...', { id: 'event-creation' });

        try {
            // Criar FormData para enviar imagem e dados do evento
            const formData = new FormData();
            formData.append('image', image);
            formData.append('eventData', JSON.stringify(eventData));

            // Enviar para a API
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
            }

            const data = await response.json();

            // Salvar o evento no banco de dados (simulado)
            // Em um app real, você enviaria os dados para sua API de backend
            console.log('Event created with IPFS metadata:', data);

            toast.success('Event created successfully!', { id: 'event-creation' });

            // Redirecionar para a página do evento
            // Em um app real, você redirecionaria para o evento recém-criado
            router.push('/my-profile?tab=events');

        } catch (error) {
            console.error('Error creating event:', error);
            toast.error(`Failed to create event: ${error.message}`, { id: 'event-creation' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Event Details</h2>

                {/* Título do evento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={eventData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    />
                </div>

                {/* Descrição */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={eventData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    />
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={eventData.date}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                        </label>
                        <input
                            type="time"
                            name="time"
                            value={eventData.time}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                </div>

                {/* Local */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={eventData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    />
                </div>

                {/* Categoria */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <select
                        name="category"
                        value={eventData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    >
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="Arts">Arts</option>
                        <option value="Sports">Sports</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Preço */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (STX)
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={eventData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Set to 0 for free events
                    </p>
                </div>

                {/* Vagas disponíveis */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Available Spots
                    </label>
                    <input
                        type="number"
                        name="spotsAvailable"
                        value={eventData.spotsAvailable}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    />
                </div>

                {/* Organizador */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organizer Name
                    </label>
                    <input
                        type="text"
                        name="organizer.name"
                        value={eventData.organizer.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                    />
                </div>

                {/* Imagem do evento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Image
                    </label>
                    <div className="mt-1 flex items-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            required
                        />
                    </div>
                    {imagePreview && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Preview:</p>
                            <div className="w-full h-48 rounded-xl overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                >
                    {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
            </div>
        </form>
    );
} 
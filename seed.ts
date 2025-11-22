// This file now only exports the raw data for seeding.
// The logic to populate the database has been moved to store.ts for robustness.

export const initialSiteSettings = {
    id: 1, // Primary key
    academyName: "Gracie Barra",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    xUrl: "https://x.com",
    whatsappUrl: "https://whatsapp.com",
    pixKey: "seu-email-pix@dominio.com",
    paymentInstructions: "Após realizar o pagamento, por favor, envie o comprovante para o nosso WhatsApp.",
    logoUrl: null,
    loginImageUrl: null,
    paymentGateway: 'manual' as const,
    mercadoPagoApiKey: '',
    asaasApiKey: '',
};

export const initialUsers = [
    { id: 1, name: 'Admin User', email: 'admin@bjj.com', role: 'admin' as const, paymentDueDate: null, belt: 'preta' as const, securityQuestion: 'Primeiro pet?', securityAnswer: 'rex' },
    { id: 2, name: 'Mestre Helio', email: 'mestre@bjj.com', role: 'mestre' as const, paymentDueDate: null, belt: 'preta' as const, securityQuestion: 'Primeiro pet?', securityAnswer: 'rex' },
    { id: 3, name: 'Aluno Teste', email: 'user@bjj.com', role: 'user' as const, paymentDueDate: '2024-08-10', belt: 'roxa' as const, securityQuestion: 'Primeiro pet?', securityAnswer: 'rex' },
    { id: 4, name: 'Joana Silva', email: 'joana@bjj.com', role: 'user' as const, paymentDueDate: '2024-07-05', belt: 'azul' as const, securityQuestion: 'Primeiro pet?', securityAnswer: 'rex' },
];

export const initialClasses = [
    { id: 1, day: 'Segunda', time: '19:00 - 20:30', name: 'Gi Fundamentos', instructor: 'Professor Carlos', level: 'Iniciante' },
    { id: 2, day: 'Terça', time: '20:00 - 21:30', name: 'No-Gi Avançado', instructor: 'Professor Helio', level: 'Avançado' },
    { id: 3, day: 'Quarta', time: '19:00 - 20:30', name: 'Gi Intermediário', instructor: 'Professor Carlos', level: 'Intermediário' },
    { id: 4, day: 'Quinta', time: '07:00 - 08:30', name: 'Drills & Sparring', instructor: 'Professor Helio', level: 'Todos' },
    { id: 5, day: 'Sexta', time: '18:00 - 19:30', name: 'Open Mat', instructor: 'Todos', level: 'Todos' },
];

export const initialAnnouncements = [
    { id: 1, title: 'Novo Horário de Open Mat', date: '01/07/2024', content: 'A partir da próxima semana, o Open Mat de sexta será das 18:00 às 19:30. Oss!' },
    { id: 2, title: 'Seminário com Mestre Zé', date: '25/06/2024', content: 'Não percam o seminário especial no próximo sábado. Vagas limitadas!' },
];

export const initialProducts = [
    { id: 1, name: 'Kimono Branco Trançado', price: 350.00, imageUrl: 'https://images.unsplash.com/photo-1599291029848-0a7a05537597?q=80&w=2574&auto=format&fit=crop', category: 'Kimonos' },
    { id: 2, name: 'Rashguard Preta Manga Longa', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1621935642319-3f0f7f98d5a1?q=80&w=2574&auto=format&fit=crop', category: 'Vestuário' },
];

export const initialTatameAreas = [
    { id: 'tatame-principal', name: 'Tatame Principal', timeSlots: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00'] },
    { id: 'tatame-secundario', name: 'Área de Drills', timeSlots: ['09:30 - 10:30', '10:30 - 11:30'] },
];

export const initialPlans = [
    { id: 1, name: 'Plano Mensal', price: 150, duration: 'mês', total: null, features: ['Aulas ilimitadas', 'Acesso ao Open Mat'], isBestValue: false },
    { id: 2, name: 'Plano Trimestral', price: 130, duration: 'mês', total: 390, features: ['Aulas ilimitadas', 'Acesso ao Open Mat', 'Desconto na loja'], isBestValue: true },
];

export const initialCategories = [
    { id: 1, name: 'Mensalidade', type: 'income' as const, emoji: '💳' },
    { id: 2, name: 'Venda de Produtos', type: 'income' as const, emoji: '🥋' },
    { id: 3, name: 'Aluguel', type: 'expense' as const, emoji: '🏢' },
    { id: 4, name: 'Contas', type: 'expense' as const, emoji: '💡' },
];
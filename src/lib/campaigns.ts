export interface Campaign {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  features: string[];
  ctaText: string;
  whatsappMessage: string;
  image: string;
}

export const campaigns: Campaign[] = [
  {
    slug: "fashion-day",
    title: "Fashion Day",
    subtitle: "A Experiência Definitiva de Moda",
    description: "Um dia inteiro dedicado a capturar a essência da sua marca com estética de alta costura e direção criativa impecável. Ideal para lojistas e catálogos.",
    price: "R$ 250",
    features: [
      "Sessão Fotográfica Premium",
      "Direção Criativa e de Poses",
      "Iluminação de Estúdio",
      "Entrega Digital em Alta Resolução"
    ],
    ctaText: "Agendar Fashion Day",
    whatsappMessage: "Olá! Gostaria de reservar minha vaga no Fashion Day.",
    image: "https://images.unsplash.com/photo-1542042161784-26ab9e041e89?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "dia-das-maes",
    title: "Especial Dia das Mães",
    subtitle: "Herança Visual",
    description: "Eternize o vínculo mais forte através de retratos atemporais. Um ensaio focado em emoção, conexão e estética refinada para o Dia das Mães.",
    price: "R$ 550",
    features: [
      "Ensaio Fotográfico Afetivo",
      "Direção Exclusiva para Mães e Filhos",
      "Galeria Online Privada",
      "10 Fotos Tratadas em Alta Resolução"
    ],
    ctaText: "Garantir Vaga (Especial)",
    whatsappMessage: "Olá! Vi a campanha do Dia das Mães e quero agendar.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "retrato",
    title: "Retrato Corporativo",
    subtitle: "Autoridade Visual",
    description: "O seu retrato é o seu maior ativo digital. Criamos imagens que transmitem credibilidade instantânea, competência e confiança absoluta.",
    price: "Sob Consulta",
    features: [
      "Ensaio com Fundo Neutro ou Ambientado",
      "Direção de Poses para Autoridade",
      "Fotos Entregues Tratadas (Evoto/Lightroom)",
      "Guia de Preparação Exclusivo"
    ],
    ctaText: "Solicitar Orçamento de Retrato",
    whatsappMessage: "Olá! Tenho interesse no pacote de Retrato Corporativo.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "family-legacy",
    title: "Family Legacy",
    subtitle: "Retratos de Gerações",
    description: "Sessões fotográficas projetadas para se tornarem heranças de família. Fotografia documental e retratista de alto padrão para registrar o agora.",
    price: "Sob Consulta",
    features: [
      "Cobertura Fotográfica Completa",
      "Direção Natural e Espontânea",
      "Curadoria de Imagens",
      "Entrega Digital de Todas as Fotos Tratadas"
    ],
    ctaText: "Criar Nosso Legado Visual",
    whatsappMessage: "Olá! Quero saber mais sobre o ensaio Family Legacy.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "casamentos",
    title: "Casamentos",
    subtitle: "Matrimônio Editorial",
    description: "A intersecção entre o glamour da alta costura e a emoção crua de um dos dias mais marcantes da vida humana. Cobertura completa e artística.",
    price: "A partir de R$ 8.500",
    features: [
      "Cobertura do Making Of à Festa",
      "2 Fotógrafos Principais",
      "Galeria Online para Seleção",
      "Entrega em Alta Resolução"
    ],
    ctaText: "Verificar Data Disponível",
    whatsappMessage: "Olá! Sou noiva(o) e quero verificar a disponibilidade para meu casamento.",
    image: "https://images.unsplash.com/photo-1544257134-8bba23eddf82?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "ensaios",
    title: "Ensaios Editoriais",
    subtitle: "Arte Visual",
    description: "Direção de arte estrita e luz pintada à mão. Para marcas e indivíduos que buscam imortalizar uma estética única e ousada.",
    price: "A partir de R$ 2.500",
    features: [
      "Sessão Externa ou em Estúdio",
      "Direção de Arte Editorial",
      "Iluminação Cinematográfica",
      "Fotos Tratadas e Finalizadas"
    ],
    ctaText: "Planejar Meu Ensaio",
    whatsappMessage: "Olá! Gostaria de planejar um ensaio editorial exclusivo.",
    image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6ece?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "comerciais",
    title: "Eventos e Comerciais",
    subtitle: "Marca Pessoal",
    description: "Removemos o ruído digital e alinhamos a sua imagem com a autoridade que sua competência já exige. O foco absoluto em comunicar credibilidade.",
    price: "A partir de R$ 3.500",
    features: [
      "Cobertura Fotográfica Completa",
      "Registros Dinâmicos e Precisos",
      "Edição Padrão Editorial",
      "Entrega Digital Ágil"
    ],
    ctaText: "Transformar Minha Marca",
    whatsappMessage: "Olá! Preciso fazer uma cobertura corporativa.",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop"
  },
  {
    slug: "retrato-autoral",
    title: "Retrato Autoral",
    subtitle: "A Sua Essência em Imagem",
    description: "Existe uma diferença entre ser fotografado e ser retratado. Ser fotografado é registrar um momento. Ser retratado é capturar quem você é — a sua essência, o seu olhar, a sua história.",
    price: "Sob Consulta",
    features: [
      "Sessão Individual com Direção de Arte",
      "Luz Cinematográfica Personalizada",
      "Direção de Expressão e Movimento",
      "Fotos Tratadas e Finalizadas em Alta Resolução"
    ],
    ctaText: "Quero Ser Retratado",
    whatsappMessage: "Olá! Vi sobre o Retrato Autoral e quero saber mais sobre como funciona.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2000&auto=format&fit=crop"
  }
];

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return campaigns.find(c => c.slug === slug);
}

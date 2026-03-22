import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PackageData {
  id: string;
  type: string;
  title: string;
  description: string;
  price: number;
  cover_image_url: string;
}

const mockData: Record<string, PackageData> = {
  casamentos: {
    id: "1", type: "casamentos", title: "Casamentos",
    description: "Cobertura completa do making of à festa, com 2 fotógrafos e entrega em ata resolução.",
    price: 8500, cover_image_url: "https://images.unsplash.com/photo-1544257134-8bba23eddf82?q=80&w=2000&auto=format&fit=crop"
  },
  ensaios: {
    id: "2", type: "ensaios", title: "Ensaios de Moda",
    description: "Sessões externas ou em estúdio focadas em direção de arte editorial.",
    price: 2500, cover_image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6ece?q=80&w=2000&auto=format&fit=crop"
  },
  eventos: {
    id: "3", type: "eventos", title: "Eventos Sociais e Corporativos",
    description: "Registros precisos e dinâmicos de eventos de alto padrão.",
    price: 3500, cover_image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop"
  },
  video: {
    id: "4", type: "video", title: "Cinematografia",
    description: "Produção de vídeo impecável em 4K, com drones e color grading de cinema.",
    price: 6000, cover_image_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop"
  }
};

export default async function ServicePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  // Try fetching from DB, fallback to mock if DB fails (e.g no credentials)
  let pkg: PackageData | null = null;
  try {
    const q = query(collection(db, "packages"), where("type", "==", type));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      pkg = querySnapshot.docs[0].data() as PackageData;
    }
  } catch (e) {
    // Ignore error
  }

  if (!pkg) {
    pkg = mockData[type] || null;
  }

  if (!pkg) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={pkg.cover_image_url} 
          alt={pkg.title}
          className="w-full h-full object-cover grayscale-[30%]"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-24 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white mb-6 uppercase tracking-widest text-xs transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-5xl md:text-7xl font-serif text-white">{pkg.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-24 py-24 flex flex-col md:flex-row gap-16">
        <div className="md:w-2/3">
          <h2 className="text-sm tracking-[0.3em] uppercase text-primary mb-6">A Experiência</h2>
          <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed mb-8">
            {pkg.description}
          </p>
          <div className="prose prose-invert prose-p:font-light prose-p:text-gray-400">
             <p>Cada pacote foi desenhado para oferecer não apenas registros fotográficos, mas uma experiência imersiva no conceito de alta costura. Cuidamos da direção criativa, iluminação cênica e pós-produção avançada.</p>
          </div>
        </div>

        <div className="md:w-1/3 border border-border p-10 bg-surface/50 h-fit">
          <h3 className="text-sm tracking-widest text-gray-400 uppercase mb-4">Investimento a partir de</h3>
          <p className="text-4xl text-white font-serif mb-8">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pkg.price)}
          </p>
          <Link href="/login" className="block w-full text-center bg-white text-black hover:bg-primary hover:text-white transition-colors py-4 text-sm font-medium tracking-widest uppercase">
            Solicitar Orçamento
          </Link>
        </div>
      </div>
    </main>
  );
}

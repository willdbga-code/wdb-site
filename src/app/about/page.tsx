"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24 selection:bg-primary selection:text-black">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-24 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 uppercase tracking-widest leading-tight">
            A Nossa <span className="text-primary italic lowercase">Filosofia</span>
          </h1>
          <div className="w-px h-24 bg-primary/30 mx-auto mt-12 mb-12"></div>
        </motion.header>

        <article className="prose prose-invert lg:prose-xl prose-p:font-light prose-p:text-gray-300 prose-p:leading-relaxed mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="first-letter:text-7xl first-letter:font-serif first-letter:text-primary first-letter:mr-3 first-letter:float-left mb-12">
              O <span className="italic">Homo sapiens</span> não dominou a Terra pela sua força anatômica, mas pela sua capacidade revolucionária de arquitetar, acreditar e partilhar histórias. Somos a única espécie capaz de erguer impérios, moedas e ideais inteiros sobre a matéria intangível da imaginação. É a nossa narrativa quem dita as fronteiras da nossa existência.
            </p>

            <p className="mb-12">
              No entanto, a bússola rigorosa do Estoicismo nos recorda de uma verdade irrefutável: <em>Memento Mori</em> — lembre-se de que você é mortal. O tempo é um rio soberano e implacável que não poupa a juventude, a carne ou mesmo os triunfos mundanos. Diante da brevidade, focar naquilo que podemos eternizar não é apenas sabedoria; é um imperativo passional. E, afinal, o que sobrevive quando o pó das urgências cotidianas assenta na terra? 
            </p>

            <h2 className="text-2xl font-serif text-white tracking-widest uppercase mt-20 mb-10 text-center relative border-y border-white/5 py-8">
              A ARTE COMO REVOLTA DA MEMÓRIA
            </h2>

            <p className="mb-12">
              Se tudo está destinado à poeira, qual é o papel do artista senão ser o guardião indomável do efêmero? A fotografia, na nossa concepção, nunca foi apenas sobre fótons colidindo contra um sensor frio. É um ato visceral de rebeldia intelectual contra o esquecimento humano. Fotografar é o nosso esforço desesperado e poético para engarrafar a própria respiração do tempo.
            </p>

            <p className="mb-12">
              Quando os ecos do hoje cederem lugar às memórias do amanhã, a imagem final transcenderá o papel ou a tela. Ela se erguerá como um portal sagrado. A arte possui a propriedade empírica de reativar a textura e o cheiro de um <strong className="text-primary font-normal">sentimento</strong> — fortalecendo o seu vínculo espiritual com aquilo que deu sentido à sua morada aqui. Seja o sorriso desarmado no altar, a aura magnética de uma marca que prosperou, ou a nova vida pulsando miúda em suas mãos pela primeira vez. Tudo converge para o mesmo assombro: o amor pela vida materializado em luz.
            </p>

            <p className="mb-12 border-l border-primary pl-8 text-white/90 italic font-serif">
              "Nosso compromisso jamais fará concórdia com a vaidade vazia. O nosso ofício é sangrar pelo seu legado, garantindo que a sua mais pura essência permaneça cristalizada."
            </p>

            <p>
              Preparamos as nossas lentes não para que você apenas se contemple em um reflexo lisonjeiro, mas para que as gerações à frente, ao encontrarem o seu olhar preso num passado distante, consigam sentir na pele a magnitude apaixonante da história que você ousou protagonizar.
            </p>
          </motion.div>
        </article>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-32 border border-white/5 p-12 text-center bg-surface relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-primary/5 transition-opacity opacity-0 group-hover:opacity-100 duration-1000"></div>
          <h3 className="text-white font-serif text-xl uppercase tracking-widest mb-4">A Lente Que Vê o Invisível</h3>
          <p className="text-gray-400 font-light text-sm mb-8 mx-auto">
            Experimente o luxo da memória tangível.
          </p>
          <button 
           onClick={() => window.dispatchEvent(new Event('open-lead-bot'))}
           className="inline-block px-8 py-4 border border-primary text-primary hover:bg-primary hover:text-black uppercase tracking-widest text-[10px] font-bold transition-all relative z-10">
            AGENDAR MINHA SESSÃO
          </button>
        </motion.div>
      </div>
    </main>
  );
}

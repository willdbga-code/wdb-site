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
              O <span className="italic">Homo sapiens</span> não dominou a Terra pela sua força anatômica, mas pela sua capacidade revolucionária de arquitetar, acreditar e partilhar histórias. Somos a única espécie capaz de erguer impérios, moedas e ideais inteiros sobre a matéria intangível da imaginação. É a nossa narrativa quem diz quem somos.
            </p>

            <p className="mb-12">
              No entanto, a bússola rigorosa do Estoicismo nos recorda de uma verdade irrefutável: <em>Memento Mori</em> — lembre-se de que você é mortal. O tempo é um rio soberano e implacável que não poupa nossa juventude, nossa carne ou nossos triunfos mundanos. Diante da brevidade existencial, focar naquilo que está sob o nosso controle não é apenas sabedoria, é urgência. E, afinal, o que verdadeiramente permanece quando o pó da urgência cotidiana assenta? 
            </p>

            <h2 className="text-2xl font-serif text-white tracking-widest uppercase mt-20 mb-10 text-center relative border-y border-white/5 py-8">
              A ARTE COMO REVOLTA DA MEMÓRIA
            </h2>

            <p className="mb-12">
              Se tudo está destinado à entropia, qual é o papel do artista? A fotografia, na nossa concepção, nunca foi apenas sobre a luz atingindo um sensor digital. É um ato de rebeldia intelectual contra o esquecimento. Fotografar é o nosso esforço para engarrafar o próprio tempo.
            </p>

            <p className="mb-12">
              Quando os ecos do hoje inevitavelmente cederem lugar à velhice, a imagem final não funcionará apenas como um registro estético. Ela será um portal transcendental. A arte possui a propriedade empírica de reativar a exata química de um <strong className="text-primary font-normal">sentimento</strong> — fortalecendo o seu vínculo biológico e espiritual com aquilo que deu sentido à sua estadia por aqui. O sorriso intacto no altar da cerimônia, a serenidade de um retrato que definiu a sua autoridade, a nova vida pulsando em suas mãos pela primeira vez.
            </p>

            <p className="mb-12 border-l border-primary pl-8 text-white/90 italic font-serif">
              "Nosso compromisso não é com a vaidade superficial. O nosso ofício é garantir que a estrutura primária do seu legado permaneça cristalizada na luz."
            </p>

            <p>
              Preparamos as nossas lentes não para que você apenas se veja, mas para que as próximas gerações, ao encontrarem o seu retrato no futuro distante, consigam sentir exatamente o tamanho da história que você protagonizou.
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

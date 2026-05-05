# Estratégia de Vendas e Tráfego - WDB Editorial

Este documento serve como memória central para as implementações de funil de vendas, tráfego pago e SEO realizadas em Maio de 2026.

## 🚀 Landing Pages de Campanha
As rotas de alta conversão (sem NavBar e focadas em WhatsApp) estão localizadas em `/src/app/c/[slug]`.

**Pacotes Ativos:**
1.  **Fashion Day** (`/c/fashion-day`) - R$ 250
2.  **Dia das Mães** (`/c/dia-das-maes`) - R$ 550
3.  **Retrato Corporativo** (`/c/retrato`) - Sob Consulta
4.  **Retrato Autoral** (`/c/retrato-autoral`) - Sob Consulta
5.  **Family Legacy** (`/c/family-legacy`) - Sob Consulta
6.  **Casamentos** (`/c/casamentos`) - A partir de R$ 8.500
7.  **Ensaios Editoriais** (`/c/ensaios`) - A partir de R$ 2.500
8.  **Eventos e Comerciais** (`/c/comerciais`) - A partir de R$ 3.500

---

## 📊 Infraestrutura de Tráfego (Meta Ads)
*   **Pixel ID Instalado:** `2621752857960318` (Configurado em `src/components/Analytics.tsx`)
*   **Eventos Rastreados:**
    *   `PageView`: Disparado em todas as páginas.
    *   `Lead`: Disparado ao clicar no botão de WhatsApp das Landing Pages de Campanha.
*   **WhatsApp de Destino:** `5512988130316`

---

## 🔍 SEO e Indexação
*   **Sitemap Automático:** Localizado em `src/app/sitemap.ts`. Varre todas as campanhas e serviços.
*   **Robots.txt:** Localizado em `src/app/robots.ts`. Bloqueia indexação de `/admin` e `/dashboard`.
*   **Metadata Dinâmico:** Implementado via `generateMetadata()` em `/services/[type]` e `/c/[slug]`.

---

## 📝 Scripts de Anúncio (Sugestões)
*   **Retrato Autoral:** Foco em identidade e essência. *"Você tem uma foto que te representa de verdade?"*
*   **Fashion Day:** Foco em lojistas e agilidade. *"Seu catálogo com estética de alta costura."*

---

## 🛠 Como criar novas campanhas
Para adicionar uma nova página de venda, basta editar o arquivo `src/lib/campaigns.ts` e adicionar um novo objeto ao array `campaigns`. A página será gerada automaticamente.

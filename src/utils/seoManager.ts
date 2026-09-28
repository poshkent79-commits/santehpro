import { Article, PlumbingSpecialist } from '../types';

export interface SeoPageConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  structuredData?: object | object[];
}

/**
 * Dynamically updates document head metadata, OpenGraph, Twitter cards and Schema.org JSON-LD
 * for top Google, Yandex, and Bing search indexation.
 */
export function updatePageSeoMetadata(config: SeoPageConfig): void {
  if (typeof document === 'undefined') return;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://santehpro.info';
  const fullCanonical = config.canonicalUrl 
    ? (config.canonicalUrl.startsWith('http') ? config.canonicalUrl : `${origin}${config.canonicalUrl}`)
    : (typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://santehpro.info/');

  // 1. Page Title
  document.title = config.title;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', config.description);
  if (config.keywords) {
    setMetaTag('name', 'keywords', config.keywords);
  }

  // 3. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullCanonical);

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:title', config.title);
  setMetaTag('property', 'og:description', config.description);
  setMetaTag('property', 'og:url', fullCanonical);
  setMetaTag('property', 'og:type', config.ogType || 'website');
  setMetaTag('property', 'og:image', config.ogImage || `${origin}/pwa-512x512.png`);
  setMetaTag('property', 'og:site_name', 'СантехПро');
  setMetaTag('property', 'og:locale', 'ru_RU');

  // 5. Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', config.title);
  setMetaTag('name', 'twitter:description', config.description);
  setMetaTag('name', 'twitter:image', config.ogImage || `${origin}/pwa-512x512.png`);

  // 6. Inject / Update Schema.org JSON-LD
  if (config.structuredData) {
    injectSchemaJsonLd(config.structuredData);
  }
}

function setMetaTag(attrName: 'name' | 'property', attrValue: string, contentValue: string): void {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', contentValue);
}

function injectSchemaJsonLd(data: object | object[]): void {
  const SCRIPT_ID = 'dynamic-santehpro-jsonld';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const payload = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data,
      }
    : {
        '@context': 'https://schema.org',
        ...data,
      };

  script.textContent = JSON.stringify(payload);
}

/**
 * Generate Schema.org HowTo for step-by-step repair guides & articles
 */
export function generateHowToSchema(article: Article): object {
  const steps = (article.steps || []).map((step, idx) => ({
    '@type': 'HowToStep',
    position: idx + 1,
    name: step.title,
    text: step.text,
    url: `https://santehpro.info/?article=${encodeURIComponent(article.id)}#step-${idx + 1}`,
    ...(step.imageUrl ? { image: step.imageUrl } : {}),
  }));

  const toolsList = article.toolsRequired || [];
  const tools = toolsList.map((tool) => ({
    '@type': 'HowToTool',
    name: tool,
  }));

  const materialsList = article.materialsRequired || [];
  const materials = materialsList.map((mat) => ({
    '@type': 'HowToSupply',
    name: mat,
  }));

  return {
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    image: article.coverImage || 'https://santehpro.info/pwa-512x512.png',
    totalTime: 'PT30M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'RUB',
      value: '0',
    },
    tool: tools,
    supply: materials,
    step: steps,
  };
}

/**
 * Generate Schema.org LocalBusiness / Plumber for City Specialists Directory
 */
export function generateCityPlumbersSchema(
  cityName: string,
  countryName: string,
  specialists: PlumbingSpecialist[]
): object[] {
  const count = specialists.length;
  const avgRating = 4.9;

  const catalogSchema = {
    '@type': 'ItemList',
    name: `Проверенные мастера-сантехники в г. ${cityName} (${countryName})`,
    description: `Каталог ${count > 0 ? count : 'лучших'} проверенных сантехников с отзывами, рейтингом и прямыми контактами в городе ${cityName}.`,
    numberOfItems: count,
    itemListElement: specialists.slice(0, 10).map((spec, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Plumber',
        name: spec.name,
        image: spec.photo || 'https://santehpro.info/pwa-512x512.png',
        telephone: spec.phone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: spec.city || cityName,
          addressCountry: countryName,
        },
        priceRange: `${spec.minPrice || 1000} RUB`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: spec.rating || 4.9,
          reviewCount: spec.reviewsCount || 24,
        },
      },
    })),
  };

  const serviceBusinessSchema = {
    '@type': 'Plumber',
    name: `СантехПро — Сервис вызова проверенных мастеров в г. ${cityName}`,
    description: `Срочный вызов сантехника на дом в г. ${cityName}. Устранение протечек, замена смесителей, монтаж отопления, пайка труб. Без комиссии, напрямую с мастерами.`,
    url: `https://santehpro.info/?tab=specialists&city=${encodeURIComponent(cityName)}`,
    telephone: '+7 (924) 788-99-00',
    priceRange: '1000 - 15000 RUB',
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: Math.max(count * 15, 87),
    },
  };

  return [catalogSchema, serviceBusinessSchema];
}

/**
 * Generate Schema.org FAQPage for common questions and troubleshooting
 */
export function generateFaqSchema(faqs: { question: string; answer: string }[]): object {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

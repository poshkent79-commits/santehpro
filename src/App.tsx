import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HandbookView } from './components/HandbookView';
import { BreakdownsView } from './components/BreakdownsView';
import { SpecialistsView } from './components/SpecialistsView';
import { AdminPanel } from './components/AdminPanel';
import { ArticleModal } from './components/ArticleModal';
import { ArticleEditorModal } from './components/ArticleEditorModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CoursesView } from './components/CoursesView';
import { MaterialsCalculator } from './components/MaterialsCalculator';
import { AuthModal } from './components/AuthModal';
import { UserCabinetView } from './components/UserCabinetView';
import { RegistrationPromptBanner } from './components/RegistrationPromptBanner';
import { ProtectedSectionGuard, ProtectedSectionType } from './components/ProtectedSectionGuard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Article, PlumbingSpecialist, ServiceCallRequest, CommunityQuestion } from './types';
import { INITIAL_ARTICLES, INITIAL_SPECIALISTS, INITIAL_SERVICE_REQUESTS, INITIAL_QUESTIONS } from './data/initialData';
import { Wrench, ShieldCheck, Scale, CheckCircle2, X, MapPin, Check, Search, ArrowRight, Share2, Heart, Bell, HelpCircle, Mail } from 'lucide-react';
import { LegalTermsModal } from './components/LegalTermsModal';
import { SupportFeedbackModal } from './components/SupportFeedbackModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { detectBestUserLocation, RUSSIAN_CITIES, DetectedCityResult } from './utils/geoCity';
import { getCountryByCity } from './data/regionsData';
import { updatePageSeoMetadata, generateCityPlumbersSchema } from './utils/seoManager';
import { useRealtimeSync } from './services/realtimeClient';
import { CityConfirmationBanner } from './components/CityConfirmationBanner';
import { BetaDevelopmentBanner } from './components/BetaDevelopmentBanner';
import { CitySelectModal } from './components/CitySelectModal';
import { ClientEstimateModal } from './components/ClientEstimateModal';
import { ClientContractModal } from './components/ClientContractModal';
import { MasterPlumbingEstimate, PlumbingContract } from './types';
import { DonationModal } from './components/DonationModal';
import { ProSubscriptionModal } from './components/ProSubscriptionModal';
import { triggerNativeShare } from './utils/shareApp';
import { playIncomingRequestSound, sendBrowserNotification } from './utils/notificationSound';

function AppContent() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('app-theme') as 'dark' | 'light') || 'dark';
  });
  const [activeTab, setActiveTab] = useState<'handbook' | 'courses' | 'calculator' | 'specialists' | 'diagnostic' | 'admin' | 'cabinet'>('handbook');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    return localStorage.getItem('santehpro_selected_city') || 'Москва';
  });
  const [isCityConfirmed, setIsCityConfirmed] = useState<boolean>(() => {
    return localStorage.getItem('santehpro_city_confirmed') === 'true';
  });
  const [isCitySelectModalOpen, setIsCitySelectModalOpen] = useState<boolean>(false);
  const [detectedCityInfo, setDetectedCityInfo] = useState<DetectedCityResult | null>(null);
  const [isDetectingCity, setIsDetectingCity] = useState<boolean>(false);
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const cached = localStorage.getItem('santehpro_cached_articles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a: Article) => ({
            ...a,
            coverImage: (a.coverImage && !a.coverImage.includes('images.unsplash.com')) ? a.coverImage : undefined,
            videoUrl: (a.videoUrl && !a.videoUrl.includes('dQw4w9WgXcQ') && !a.videoUrl.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? a.videoUrl : undefined,
            videoEmbed: (a.videoEmbed && !a.videoEmbed.includes('dQw4w9WgXcQ') && !a.videoEmbed.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? a.videoEmbed : undefined,
            rutubeUrl: (a.rutubeUrl && !a.rutubeUrl.includes('732a3ea9c98cf85b244793f18e11a3ec')) ? a.rutubeUrl : undefined,
            youtubeUrl: (a.youtubeUrl && !a.youtubeUrl.includes('dQw4w9WgXcQ')) ? a.youtubeUrl : undefined,
            audioUrl: (a.audioUrl && !a.audioUrl.includes('soundhelix.com')) ? a.audioUrl : undefined,
            audioTitle: (a.audioUrl && !a.audioUrl.includes('soundhelix.com')) ? a.audioTitle : undefined,
            galleryImages: (a.galleryImages && a.galleryImages.some(g => typeof g === 'string' && g.includes('images.unsplash.com'))) ? undefined : a.galleryImages,
            steps: Array.isArray(a.steps) ? a.steps.map(s => ({
              ...s,
              imageUrl: (s.imageUrl && !s.imageUrl.includes('images.unsplash.com')) ? s.imageUrl : undefined,
              videoUrl: (s.videoUrl && !s.videoUrl.includes('dQw4w9WgXcQ')) ? s.videoUrl : undefined,
              audioUrl: (s.audioUrl && !s.audioUrl.includes('soundhelix.com')) ? s.audioUrl : undefined,
            })) : a.steps,
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load cached articles on startup:', e);
    }
    return INITIAL_ARTICLES;
  });
  const [specialists, setSpecialists] = useState<PlumbingSpecialist[]>(() => {
    try {
      const cached = localStorage.getItem('santehpro_cached_specialists');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out demo specialists with old short IDs (spec-1..12, spec-tj.., etc)
          const real = parsed.filter(s => s.id && (!s.id.startsWith('spec-') || s.id.length > 10));
          return real;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached specialists:', e);
    }
    return [];
  });
  const [serviceRequests, setServiceRequests] = useState<ServiceCallRequest[]>(() => {
    try {
      const cached = localStorage.getItem('santehpro_cached_service_requests');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out demo requests (req-101..req-108)
          const real = parsed.filter(r => r.id && (!r.id.startsWith('req-10') || r.id.length > 10));
          return real;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached service requests:', e);
    }
    return [];
  });
  const [questions, setQuestions] = useState<CommunityQuestion[]>(INITIAL_QUESTIONS);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editingArticleFromApp, setEditingArticleFromApp] = useState<Article | null>(null);
  const [isAppEditorModalOpen, setIsAppEditorModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isFooterLegalModalOpen, setIsFooterLegalModalOpen] = useState<boolean>(false);
  const [footerLegalDoc, setFooterLegalDoc] = useState<'privacy' | 'terms' | 'offer'>('privacy');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  const handleOpenLegalModal = (doc: 'privacy' | 'terms' | 'offer') => {
    setFooterLegalDoc(doc);
    setIsFooterLegalModalOpen(true);
  };

  // Auto-detect direct legal URLs (/donation-offer, /oferta, /offer, /privacy, /terms or ?legal=...)
  useEffect(() => {
    try {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const search = new URLSearchParams(window.location.search);
      const legalQuery = search.get('legal')?.toLowerCase();
      const tabQuery = search.get('tab')?.toLowerCase();

      if (
        path === '/donation-offer' ||
        path === '/oferta' ||
        path === '/offer' ||
        path === '/terms-offer' ||
        path === '/oferta-donation' ||
        path.startsWith('/donation-offer') ||
        path.startsWith('/oferta') ||
        legalQuery === 'offer' ||
        legalQuery === 'oferta' ||
        legalQuery === 'donation-offer' ||
        tabQuery === 'offer' ||
        tabQuery === 'donation-offer' ||
        tabQuery === 'oferta'
      ) {
        setFooterLegalDoc('offer');
        setIsFooterLegalModalOpen(true);
      } else if (
        path === '/privacy' ||
        path === '/politika' ||
        legalQuery === 'privacy' ||
        tabQuery === 'privacy'
      ) {
        setFooterLegalDoc('privacy');
        setIsFooterLegalModalOpen(true);
      } else if (
        path === '/terms' ||
        legalQuery === 'terms' ||
        tabQuery === 'terms'
      ) {
        setFooterLegalDoc('terms');
        setIsFooterLegalModalOpen(true);
      }

      if (search.get('payment') === 'success') {
        setPaymentSuccessToast(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, []);
  const [diagnosticPrompt, setDiagnosticPrompt] = useState<string>('');
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<boolean>(false);
  const [cabinetInitialTab, setCabinetInitialTab] = useState<'favorites' | 'purchases' | 'requests' | 'profile' | 'master' | undefined>(undefined);
  const [viewingEstimate, setViewingEstimate] = useState<MasterPlumbingEstimate | null>(null);
  const [viewingContractForApproval, setViewingContractForApproval] = useState<PlumbingContract | null>(null);

  const { currentUser, openAuthModal, authNotice, dismissAuthNotice, refreshPurchases, updateProfile } = useAuth();

  // Automatic admin login upon authentication with confirmed super-admin email or phone (+79247889900)
  useEffect(() => {
    const superAdminEmails = ['poshkent79@gmail.com', 'admin@santehpro.ru', 'admin@santehpro.info'];
    const email = currentUser?.email?.toLowerCase().trim();
    const phoneDigits = currentUser?.phone?.replace(/\D/g, '') || '';
    const isSuperAdminPhone =
      phoneDigits === '79247889900' || phoneDigits === '89247889900' || phoneDigits.endsWith('9247889900');

    if ((email && superAdminEmails.includes(email)) || isSuperAdminPhone || currentUser?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [currentUser]);

  // Listen to auth success events to immediately activate and open admin panel for super admin
  useEffect(() => {
    const handleAuthSuccess = (e: any) => {
      const profile = e.detail;
      const superAdminEmails = ['poshkent79@gmail.com', 'admin@santehpro.ru', 'admin@santehpro.info'];
      const email = profile?.email?.toLowerCase().trim();
      const phoneDigits = profile?.phone?.replace(/\D/g, '') || '';
      const isSuperAdminPhone =
        phoneDigits === '79247889900' || phoneDigits === '89247889900' || phoneDigits.endsWith('9247889900');

      if ((email && superAdminEmails.includes(email)) || isSuperAdminPhone || profile?.role === 'admin') {
        setIsAdmin(true);
        setActiveTab('admin');
      }
    };

    window.addEventListener('santehpro_auth_success', handleAuthSuccess);
    return () => window.removeEventListener('santehpro_auth_success', handleAuthSuccess);
  }, []);

  // Check saved admin session token on startup
  useEffect(() => {
    try {
      const adminToken = localStorage.getItem('santehpro_admin_token');
      if (adminToken) {
        fetch(`/api/admin/verify-session?token=${encodeURIComponent(adminToken)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.valid) {
              setIsAdmin(true);
            } else {
              localStorage.removeItem('santehpro_admin_token');
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  // Detect if current logged-in user is an approved master
  const approvedMasterSpecialist = useMemo(() => {
    if (!currentUser) return null;
    const storedSpecialistId = typeof window !== 'undefined' ? localStorage.getItem('santehpro_master_specialist_id') : null;
    return (
      specialists.find((s) => {
        if (storedSpecialistId && s.id === storedSpecialistId) return true;
        if (s.userUid && s.userUid === currentUser.uid) return true;
        if (s.email && currentUser.email && s.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return true;
        if (s.phone && currentUser.phone) {
          const cleanS = s.phone.replace(/\D/g, '');
          const cleanU = currentUser.phone.replace(/\D/g, '');
          if (cleanS.length >= 10 && cleanU.length >= 10 && (cleanS === cleanU || cleanS.slice(-10) === cleanU.slice(-10))) return true;
        }
        if (currentUser.name && s.name && s.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;

        const curName = (currentUser.name || '').toLowerCase();
        const curEmail = (currentUser.email || '').toLowerCase().trim();
        const curPhone = (currentUser.phone || '').replace(/\D/g, '');
        const isOwner =
          curName.includes('достонджон') ||
          curName.includes('туйчиев') ||
          curEmail.includes('poshkent') ||
          curEmail.includes('dostonjon') ||
          curEmail.includes('sommoni') ||
          curEmail.includes('santehpro.info') ||
          curPhone.endsWith('9247889900') ||
          currentUser.role === 'admin';

        if (isOwner) {
          const specName = (s.name || '').toLowerCase();
          if (
            specName.includes('достонджон') ||
            specName.includes('туйчиев') ||
            s.id === 'spec-1790212144464' ||
            s.id === 'spec-dostonjon' ||
            (s.phone && s.phone.replace(/\D/g, '').endsWith('9247889900'))
          ) {
            return true;
          }
        }
        return false;
      }) || (currentUser.role === 'specialist' ? specialists.find((s) => s.verified || s.status === 'approved') || null : null)
    );
  }, [currentUser, specialists]);

  const isApprovedMaster = Boolean(
    currentUser &&
    (
      (approvedMasterSpecialist && (approvedMasterSpecialist.verified || approvedMasterSpecialist.status === 'approved')) ||
      currentUser.role === 'specialist'
    )
  );

  // Green master approval banner: displayed once after user logs in or is approved
  const [showMasterApprovedBanner, setShowMasterApprovedBanner] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser || !isApprovedMaster) {
      setShowMasterApprovedBanner(false);
      return;
    }
    const bannerKey = `santehpro_master_approved_banner_seen_${currentUser.uid}`;
    const alreadySeen = localStorage.getItem(bannerKey) === 'true';
    if (!alreadySeen) {
      setShowMasterApprovedBanner(true);
    }
  }, [currentUser?.uid, isApprovedMaster]);

  const handleDismissMasterBanner = () => {
    if (currentUser?.uid) {
      localStorage.setItem(`santehpro_master_approved_banner_seen_${currentUser.uid}`, 'true');
    }
    setShowMasterApprovedBanner(false);
  };

  const handleGoToMasterCabinetFromBanner = () => {
    if (currentUser?.uid) {
      localStorage.setItem(`santehpro_master_approved_banner_seen_${currentUser.uid}`, 'true');
    }
    setShowMasterApprovedBanner(false);
    setCabinetInitialTab('master');
    setActiveTab('cabinet');
  };

  const [isShareCopied, setIsShareCopied] = useState(false);

  const handleShareAppFromBanner = async () => {
    const res = await triggerNativeShare({
      title: 'СантехПро',
      text: 'Рекомендую полезный сервис по сантехнике: проверенные мастера, электронные сметы, калькулятор материалов и 100+ пошаговых видеоуроков 👇',
    });
    if (res === 'copied') {
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2500);
    }
  };

  // Deeplink state for review request links (?reviewMaster=... or ?specialist=...)
  const [deeplinkReviewMasterId, setDeeplinkReviewMasterId] = useState<string | null>(null);
  const [deeplinkMasterId, setDeeplinkMasterId] = useState<string | null>(null);
  const [deeplinkClientName, setDeeplinkClientName] = useState<string | null>(null);
  const [deeplinkRequestId, setDeeplinkRequestId] = useState<string | null>(null);

  // Confirm city selection, persist in localStorage and sync into user profile
  const handleConfirmAndSaveCity = async (cityToSave: string) => {
    setSelectedCity(cityToSave);
    localStorage.setItem('santehpro_selected_city', cityToSave);
    localStorage.setItem('santehpro_city_confirmed', 'true');
    setIsCityConfirmed(true);

    if (currentUser?.uid) {
      localStorage.setItem(`santehpro_city_confirmed_user_${currentUser.uid}`, 'true');
      try {
        await updateProfile({ city: cityToSave });
      } catch (err) {
        console.error('Failed to sync city to user profile:', err);
      }
    }
  };

  // User confirmed current city from banner («Да»)
  const handleConfirmCurrentCity = async () => {
    setIsCityConfirmed(true);
    localStorage.setItem('santehpro_city_confirmed', 'true');
    if (currentUser?.uid) {
      localStorage.setItem(`santehpro_city_confirmed_user_${currentUser.uid}`, 'true');
      try {
        await updateProfile({ city: selectedCity });
      } catch (err) {
        console.error('Failed to sync confirmed city to user profile:', err);
      }
    }
  };

  const handleSelectCityFromModal = (cityToSave: string) => {
    handleConfirmAndSaveCity(cityToSave);
  };

  // Auto-detect city by location and IP
  const runCityDetection = async (forced = false) => {
    setIsDetectingCity(true);
    try {
      const result = await detectBestUserLocation();
      if (result) {
        setDetectedCityInfo(result);
        const isUserConfirmed = currentUser?.uid
          ? localStorage.getItem(`santehpro_city_confirmed_user_${currentUser.uid}`) === 'true'
          : localStorage.getItem('santehpro_city_confirmed') === 'true';

        const savedCity = currentUser?.city || localStorage.getItem('santehpro_selected_city');

        // Automatically adopt the nearest city if forced or not confirmed by user yet
        if (forced || !isUserConfirmed || !savedCity) {
          setSelectedCity(result.nearestCity);
          localStorage.setItem('santehpro_selected_city', result.nearestCity);
        }
      }
    } catch (err) {
      console.error('Error during auto-detecting city:', err);
    } finally {
      setIsDetectingCity(false);
    }
  };

  useEffect(() => {
    runCityDetection();
  }, []);

  // Handle first login/entry after registration or profile sync
  useEffect(() => {
    if (!currentUser) return;

    const userCityConfirmedKey = `santehpro_city_confirmed_user_${currentUser.uid}`;
    const isUserConfirmed = localStorage.getItem(userCityConfirmedKey) === 'true';

    if (currentUser.city && isUserConfirmed) {
      // User has already confirmed city in past session -> preserve and keep unchanged
      setSelectedCity(currentUser.city);
      localStorage.setItem('santehpro_selected_city', currentUser.city);
    } else {
      // First login after registration or user profile has unconfirmed city -> detect
      runCityDetection(true);
    }
  }, [currentUser?.uid]);

  // Ensure navigation to personal cabinet view on auth success
  useEffect(() => {
    const handleAuthSuccess = () => {
      setActiveTab('cabinet');
      setSelectedArticle(null);
    };
    window.addEventListener('santehpro_auth_success', handleAuthSuccess);
    return () => window.removeEventListener('santehpro_auth_success', handleAuthSuccess);
  }, []);

  // Listen to ?estimate= parameter in URL so clients opening shared estimate links see it instantly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const estimateId = params.get('estimate');
    if (estimateId) {
      fetch(`/api/estimates/${estimateId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.id) {
            let parsed = data;
            if (data.itemsJson) {
              try {
                const inner = typeof data.itemsJson === 'string' ? JSON.parse(data.itemsJson) : data.itemsJson;
                parsed = { ...inner, ...data, items: inner.items || data.items || [] };
              } catch (e) {}
            }
            setViewingEstimate(parsed);
          } else {
            try {
              const local = localStorage.getItem(`santehpro_estimate_${estimateId}`);
              if (local) setViewingEstimate(JSON.parse(local));
            } catch (e) {}
          }
        })
        .catch(() => {
          try {
            const local = localStorage.getItem(`santehpro_estimate_${estimateId}`);
            if (local) setViewingEstimate(JSON.parse(local));
          } catch (e) {}
        });
    }

    // Listen to ?contractId= / ?contract= parameter for client remote approval
    const contractParam = params.get('contractId') || params.get('contract');
    if (contractParam) {
      fetch(`/api/contracts/${encodeURIComponent(contractParam)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.id) {
            setViewingContractForApproval(data);
          } else {
            // Check in local storage
            try {
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('santehpro_master_contracts_')) {
                  const arr = JSON.parse(localStorage.getItem(key) || '[]');
                  const found = arr.find((c: any) => c.id === contractParam);
                  if (found) {
                    setViewingContractForApproval(found);
                    break;
                  }
                }
              }
            } catch (e) {}
          }
        })
        .catch(() => {
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('santehpro_master_contracts_')) {
                const arr = JSON.parse(localStorage.getItem(key) || '[]');
                const found = arr.find((c: any) => c.id === contractParam);
                if (found) {
                  setViewingContractForApproval(found);
                  break;
                }
              }
            }
          } catch (e) {}
        });
    }
  }, []);

  // Handle deep-link URL query params (?tab=..., ?city=..., ?article=...) for SEO and sharing
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const cityParam = urlParams.get('city');
      const articleParam = urlParams.get('article');
      const queryParam = urlParams.get('query') || urlParams.get('search');
      const categoryParam = urlParams.get('category');
      const reviewMasterParam = urlParams.get('reviewMaster') || urlParams.get('review');
      const masterParam = urlParams.get('master') || urlParams.get('specialist');
      const clientParam = urlParams.get('client');
      const reqIdParam = urlParams.get('reqId');

      if (reviewMasterParam) {
        setActiveTab('specialists');
        setDeeplinkReviewMasterId(reviewMasterParam);
        if (clientParam) setDeeplinkClientName(clientParam);
        if (reqIdParam) setDeeplinkRequestId(reqIdParam);
      } else if (masterParam) {
        setActiveTab('specialists');
        setDeeplinkMasterId(masterParam);
      } else if (tabParam && ['handbook', 'courses', 'calculator', 'specialists', 'diagnostic', 'admin', 'cabinet'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
      if (cityParam) {
        setSelectedCity(cityParam);
        setIsCityConfirmed(true);
      }
      if (articleParam) {
        const found = articles.find((a) => a.id === articleParam);
        if (found) setSelectedArticle(found);
      }
      if (queryParam) {
        setSearchQuery(queryParam);
      }
      if (categoryParam) {
        setSelectedCategoryFilter(categoryParam);
      }
    } catch (e) {
      console.warn('Failed to parse URL query params:', e);
    }
  }, [articles]);

  // Realtime Search Engine Optimization (SEO) & Schema.org sync across tabs & cities
  useEffect(() => {
    if (selectedArticle) return; // Handled inside ArticleModal

    const citySpecialists = specialists.filter(
      (s) => (s.city === selectedCity || !s.city) && (s.verified || s.status === 'approved' || !s.status)
    );
    const country = getCountryByCity(selectedCity);

    if (activeTab === 'specialists') {
      updatePageSeoMetadata({
        title: `Сантехники в г. ${selectedCity} — Каталог проверенных мастеров | СантехПро`,
        description: `Срочный вызов проверенного сантехника в г. ${selectedCity} (${country.name}). Паспорта проверены, рейтинг 4.9★, реальные отзывы, прямой вызов без комиссии.`,
        canonicalUrl: `/?tab=specialists&city=${encodeURIComponent(selectedCity)}`,
        structuredData: generateCityPlumbersSchema(selectedCity, country.name, citySpecialists),
      });
    } else if (activeTab === 'diagnostic') {
      updatePageSeoMetadata({
        title: `Диагностика сантехники и устранение неисправностей онлайн | СантехПро`,
        description: `Интерактивная диагностика поломок сантехники: протечки, шум в трубах, не греет батарея, слабый напор. Пошаговые решения и вызов мастера в г. ${selectedCity}.`,
        canonicalUrl: `/?tab=diagnostic&city=${encodeURIComponent(selectedCity)}`,
      });
    } else if (activeTab === 'courses') {
      updatePageSeoMetadata({
        title: `Обучающие видеоуроки и курсы по сантехнике | СантехПро`,
        description: `Видеоуроки по монтажу сантехники, пайке полипропилена, обжиму сшитого полиэтилена, установке санфаянса. Для новичков и профессионалов.`,
        canonicalUrl: `/?tab=courses`,
      });
    } else if (activeTab === 'calculator') {
      updatePageSeoMetadata({
        title: `Калькулятор материалов для сантехники и отопления | СантехПро`,
        description: `Точный онлайн калькулятор расчёта труб, фитингов, коллекторов, радиаторов и крепежа для квартиры или частного дома.`,
        canonicalUrl: `/?tab=calculator`,
      });
    } else {
      updatePageSeoMetadata({
        title: 'СантехПро',
        description: 'Поиск проверенных мастеров, электронные сметы, калькулятор материалов, 100+ пошаговых инструкций, видеообучение и диагностика поломок сантехники',
        canonicalUrl: '/',
      });
    }
  }, [activeTab, selectedCity, selectedArticle, specialists]);

  const handleOpenAuthForSection = (section: ProtectedSectionType, mode: 'register' | 'login' = 'register') => {
    const titles: Record<ProtectedSectionType, string> = {
      courses: 'Курсы и видеоуроки',
      calculator: 'Материалы и калькулятор закупки',
      specialists: 'Вызов мастера',
      diagnostic: 'Диагностика поломок',
      cabinet: 'Личный кабинет',
      article: 'Инструкция',
    };
    const title = titles[section] || 'данному разделу';
    openAuthModal(
      mode,
      `Доступ к разделу «${title}» предоставляется пользователю исключительно после прохождения процедуры регистрации.`,
      () => {
        setActiveTab(section);
      }
    );
  };

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Resilient fetch helper with automatic retry and graceful fallback for container cold-starts
  const fetchWithRetry = async <T,>(url: string, init?: RequestInit, maxRetries = 2): Promise<T | null> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, init);
        if (res.ok) {
          return (await res.json()) as T;
        }
      } catch (err) {
        if (attempt < maxRetries) {
          // Wait 600ms on first retry, 1200ms on second retry
          await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
          continue;
        }
        console.warn(`[Network Note] Temporary network delay for ${url}, active cached state retained.`);
      }
    }
    return null;
  };

  // Fetch articles from backend API with automatic retry
  const fetchArticles = async () => {
    try {
      const data = await fetchWithRetry<Article[]>('/api/articles');
      if (Array.isArray(data) && data.length > 0) {
        setArticles(data);
        try {
          localStorage.setItem('santehpro_cached_articles', JSON.stringify(data));
        } catch (storageErr) {
          console.warn('Failed to cache articles in localStorage:', storageErr);
        }
      }
    } catch (err) {
      console.warn('Notice: Using cached articles while syncing with server:', err);
    }
  };

  // Fetch specialists from backend API with automatic retry
  const fetchSpecialists = async () => {
    try {
      const data = await fetchWithRetry<PlumbingSpecialist[]>(
        `/api/specialists?admin=true&_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (Array.isArray(data)) {
        setSpecialists(data);
        try {
          localStorage.setItem('santehpro_cached_specialists', JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.warn('Notice: Using cached specialists while syncing with server:', err);
    }
  };

  // Fetch service requests from backend API with automatic retry
  const fetchServiceRequests = async () => {
    try {
      const data = await fetchWithRetry<ServiceCallRequest[]>('/api/service-requests');
      if (Array.isArray(data)) {
        setServiceRequests(data);
        try {
          localStorage.setItem('santehpro_cached_service_requests', JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.warn('Notice: Using cached service requests while syncing with server:', err);
    }
  };

  // Fetch questions from backend API with automatic retry
  const fetchQuestions = async () => {
    try {
      const data = await fetchWithRetry<CommunityQuestion[]>('/api/questions');
      if (Array.isArray(data)) {
        setQuestions(data);
      }
    } catch (err) {
      console.warn('Notice: Using initial questions while syncing with server:', err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchArticles(),
      fetchSpecialists(),
      fetchServiceRequests(),
      fetchQuestions(),
    ]);
  }, []);

  // Real-time automatic synchronization: changes in courses, handbook, service calls or specialists update immediately
  useRealtimeSync('article:*', () => {
    fetchArticles();
  });
  useRealtimeSync('specialist:*', () => {
    fetchSpecialists();
  });
  useRealtimeSync('service_request:*', () => {
    fetchServiceRequests();
  });
  useRealtimeSync('question:*', () => {
    fetchQuestions();
  });

  const handleLikeArticle = (id: string) => {
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, likes: art.likes + 1 } : art))
    );
  };

  // Synchronize selectedArticle whenever articles change (e.g. cover updated)
  useEffect(() => {
    if (selectedArticle) {
      const fresh = articles.find((a) => a.id === selectedArticle.id);
      if (fresh && (fresh !== selectedArticle || fresh.coverImage !== selectedArticle.coverImage)) {
        setSelectedArticle(fresh);
      }
    }
  }, [articles]);

  const handleNavigateToBreakdowns = () => {
    setActiveTab('diagnostic');
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleFromApp(art);
    setIsAppEditorModalOpen(true);
  };

  const handleOpenPurchase = (_course: Article) => {
    setIsDonationModalOpen(true);
  };

  const handlePurchaseSuccess = (course: Article) => {
    fetchArticles();
  };

  const totalPendingSpecialists = specialists.filter((s) => s.moderationStatus === 'pending').length;
  const totalPendingServiceRequests = serviceRequests.filter((r) => r.status === 'pending').length;
  const totalPendingQuestions = questions.filter((q) => q.status === 'pending').length;
  const totalPendingCount = totalPendingSpecialists + totalPendingServiceRequests + totalPendingQuestions;

  // Find linked specialist if currentUser is a master
  const userMasterSpecialist = currentUser
    ? specialists.find((s) => {
        // 0. Manual link from localStorage if user picked it
        const storedSpecialistId = typeof window !== 'undefined' ? localStorage.getItem('santehpro_master_specialist_id') : null;
        if (storedSpecialistId && s.id === storedSpecialistId) return true;

        // 1. Direct matching by userUid (highest priority)
        if (s.userUid && currentUser.uid && s.userUid === currentUser.uid) {
          return true;
        }

        // 2. Direct match by email
        if (s.email && currentUser.email && s.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) {
          return true;
        }

        // 3. Direct match by phone
        if (s.phone && currentUser.phone) {
          const cleanS = s.phone.replace(/\D/g, '');
          const cleanU = currentUser.phone.replace(/\D/g, '');
          if (cleanS.length >= 10 && cleanU.length >= 10) {
            if (cleanS === cleanU || cleanS.slice(-10) === cleanU.slice(-10)) {
              return true;
            }
          }
        }

        // 4. Owner & founder auto-match (Достонджон Туйчиев, Находка, +79247889900, poshkent79@gmail.com, etc.)
        const curName = (currentUser.name || '').toLowerCase();
        const curEmail = (currentUser.email || '').toLowerCase().trim();
        const curPhone = (currentUser.phone || '').replace(/\D/g, '');
        const isOwner =
          curName.includes('достонджон') ||
          curName.includes('туйчиев') ||
          curEmail.includes('poshkent') ||
          curEmail.includes('dostonjon') ||
          curEmail.includes('sommoni') ||
          curEmail.includes('santehpro.info') ||
          curPhone.endsWith('9247889900') ||
          currentUser.role === 'admin';

        if (isOwner) {
          const specName = (s.name || '').toLowerCase();
          if (
            specName.includes('достонджон') ||
            specName.includes('туйчиев') ||
            s.id === 'spec-1790212144464' ||
            s.id === 'spec-dostonjon' ||
            (s.phone && s.phone.replace(/\D/g, '').endsWith('9247889900'))
          ) {
            return true;
          }
        }

        // 5. Fallback match if user role is explicitly specialist
        if (currentUser.role === 'specialist') {
          return (
            (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
            (s.phone && currentUser.phone && s.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, ''))
          );
        }

        return false;
      })
    : null;

  // Cache master profile in localStorage for resilient disaster recovery
  useEffect(() => {
    if (userMasterSpecialist) {
      try {
        localStorage.setItem('santehpro_cached_master_profile', JSON.stringify(userMasterSpecialist));
        if (userMasterSpecialist.phone) {
          localStorage.setItem(`santehpro_master_${userMasterSpecialist.phone.replace(/\D/g, '')}`, JSON.stringify(userMasterSpecialist));
        }
      } catch {}
    }
  }, [userMasterSpecialist]);

  // Master Self-Healing: If user is logged in as master or has cached master data, but server lost the record
  useEffect(() => {
    if (currentUser && !userMasterSpecialist) {
      try {
        const cached = localStorage.getItem('santehpro_cached_master_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          const cleanUserPhone = (currentUser.phone || '').replace(/\D/g, '');
          const cleanCachedPhone = (parsed.phone || '').replace(/\D/g, '');

          const isMatch = (cleanUserPhone && cleanCachedPhone && (cleanUserPhone === cleanCachedPhone || cleanUserPhone.endsWith(cleanCachedPhone.slice(-10)))) ||
                          (currentUser.email && parsed.email && currentUser.email.toLowerCase() === parsed.email.toLowerCase()) ||
                          parsed.userUid === currentUser.uid ||
                          currentUser.role === 'specialist';

          if (isMatch) {
            console.log('[Self-Healing] Restoring master profile to server from browser cache...');
            fetch('/api/specialists/self-heal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ specialist: parsed }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success && data.specialist) {
                  console.log('[Self-Healing] Master profile restored!');
                  fetchSpecialists();
                }
              })
              .catch((err) => console.warn('[Self-Healing] Error:', err));
          }
        }
      } catch {}
    }
  }, [currentUser, userMasterSpecialist]);

  const masterIncomingOrdersCount = userMasterSpecialist
    ? serviceRequests.filter(
        (r) =>
          (r.preferredMasterId === userMasterSpecialist.id ||
            r.preferredMasterName === userMasterSpecialist.name ||
            (userMasterSpecialist.userUid &&
              (r.preferredMasterId === userMasterSpecialist.userUid ||
                (r as any).preferredMasterUid === userMasterSpecialist.userUid))) &&
          r.status !== 'completed' &&
          r.status !== 'rejected' &&
          !r.masterReply
      ).length
    : 0;

  // Calculate notification badge count for the current user (requests needing review + incoming direct master orders)
  const clientReviewCount = currentUser
    ? serviceRequests.filter((r) => {
        const isUser =
          (r.userUid && r.userUid === currentUser.uid) ||
          (r.clientEmail && currentUser.email && r.clientEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          (r.clientPhone && currentUser.phone && r.clientPhone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, ''));
        return isUser && r.status === 'completed' && (!r.rating || r.rating < 1);
      }).length
    : 0;

  const userBadgeCount = clientReviewCount + masterIncomingOrdersCount;

  // Floating alert and chime sound when a new request arrives for the logged-in master
  const [newMasterOrderToast, setNewMasterOrderToast] = useState<ServiceCallRequest | null>(null);
  const knownMasterOrderIdsRef = React.useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!userMasterSpecialist) {
      knownMasterOrderIdsRef.current = null;
      return;
    }

    const currentMasterOrders = serviceRequests.filter(
      (r) =>
        (r.preferredMasterId === userMasterSpecialist.id ||
          r.preferredMasterName === userMasterSpecialist.name ||
          (userMasterSpecialist.userUid &&
            (r.preferredMasterId === userMasterSpecialist.userUid ||
              (r as any).preferredMasterUid === userMasterSpecialist.userUid))) &&
        r.status !== 'completed' &&
        r.status !== 'rejected' &&
        !r.masterReply
    );

    const currentIds = new Set(currentMasterOrders.map((o) => o.id));

    if (knownMasterOrderIdsRef.current !== null) {
      // Find orders that were not previously known
      const newOrders = currentMasterOrders.filter((o) => !knownMasterOrderIdsRef.current!.has(o.id));
      if (newOrders.length > 0) {
        const latest = newOrders[0];
        setNewMasterOrderToast(latest);
        playIncomingRequestSound();
        sendBrowserNotification(`СантехПро: Новая заявка мастеру!`, {
          body: `${latest.clientName || 'Заказчик'} (${latest.city || ''}): ${latest.problemDescription?.slice(0, 90) || 'Новое обращение к мастеру'}`,
        });
      }
    }

    knownMasterOrderIdsRef.current = currentIds;
  }, [serviceRequests, userMasterSpecialist]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        setSelectedCity={handleConfirmAndSaveCity}
        onOpenCitySelect={() => setIsCitySelectModalOpen(true)}
        pendingCount={totalPendingCount}
        userBadgeCount={userBadgeCount}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        onOpenDonation={() => setIsDonationModalOpen(true)}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenProSubscription={() => setIsProModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Short Development / Beta Status Banner */}
        <BetaDevelopmentBanner />

        {/* City Confirmation Banner: shows only current city with «Да» and «Выбрать другой город» */}
        {!isCityConfirmed && (
          <CityConfirmationBanner
            city={selectedCity}
            onConfirm={handleConfirmCurrentCity}
            onChangeCity={() => setIsCitySelectModalOpen(true)}
          />
        )}

        {/* Master Approval Notification Banner (displayed once after logging in) */}
        {showMasterApprovedBanner && (
          <div
            id="master-approved-banner"
            role="alert"
            className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 border border-emerald-400/50 text-white shadow-xl shadow-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden"
          >
            {/* Background Glow accent */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start sm:items-center space-x-3.5 sm:space-x-4 min-w-0 relative z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                    Ваша анкета мастера одобрена! Приём заявок открыт
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-emerald-900 uppercase tracking-wider shrink-0 shadow-sm">
                    Одобрен
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 leading-snug">
                  Поздравляем{approvedMasterSpecialist?.name ? `, ${approvedMasterSpecialist.name}` : ''}! Администратор одобрил вашу анкету мастера. Ваш профиль активирован для приёма заявок, а кабинет мастера закреплён первым в меню.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center relative z-10">
              <button
                type="button"
                id="master-approved-banner-cta-btn"
                onClick={handleGoToMasterCabinetFromBanner}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-emerald-700" />
                <span>Личный кабинет мастера</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>

              <button
                type="button"
                id="master-approved-banner-share-btn"
                onClick={handleShareAppFromBanner}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1.5 border border-emerald-400/40 shadow-sm transition cursor-pointer"
                title="Поделиться ссылкой на приложение"
              >
                <Share2 className="w-4 h-4 text-emerald-200" />
                <span>{isShareCopied ? 'Ссылка скопирована!' : 'Поделиться'}</span>
              </button>

              <button
                type="button"
                id="master-approved-banner-dismiss-btn"
                onClick={handleDismissMasterBanner}
                className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800/60 transition shrink-0 cursor-pointer"
                title="Закрыть уведомление"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        {/* Success notification on green background */}
        {authNotice && (
          <div
            id="auth-success-alert"
            role="alert"
            className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-600 border border-emerald-500 text-white shadow-xl shadow-emerald-950/25 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden"
          >
            {/* Background Glow accent */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight">
                    {authNotice.title || 'Успешный вход'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 uppercase tracking-wider shrink-0 shadow-xs">
                    Активен
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5 leading-snug">
                  {authNotice.message || 'Вы успешно вошли в аккаунт. Доступ ко всем материалам и возможностям справочника открыт.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissAuthNotice}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition shrink-0 cursor-pointer relative z-10"
              title="Закрыть уведомление"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Welcome Banner for unregistered users */}
        {activeTab === 'handbook' && (
          <RegistrationPromptBanner onNavigateCabinet={() => setActiveTab('cabinet')} />
        )}

        {activeTab === 'handbook' && (
          <HandbookView
            articles={articles}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onOpenDiagnostic={() => setActiveTab('diagnostic')}
            onOpenChat={() => setActiveTab('diagnostic')}
            onOpenSpecialists={() => setActiveTab('specialists')}
            onOpenCourses={() => setActiveTab('courses')}
            onOpenDonation={() => setIsDonationModalOpen(true)}
            isAdmin={isAdmin}
            onEditArticle={handleEditArticle}
            onRefreshArticles={fetchArticles}
            initialCategoryFilter={selectedCategoryFilter}
            initialTypeFilter={selectedTypeFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        )}

        {activeTab === 'courses' && (
          <ErrorBoundary fallbackTitle="Раздел курсов временно недоступен" onReset={fetchArticles}>
            <CoursesView
              articles={articles}
              onSelectArticle={(art) => setSelectedArticle(art)}
              isAdmin={isAdmin}
              onRefreshArticles={fetchArticles}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onOpenDonation={() => setIsDonationModalOpen(true)}
              currentMaster={approvedMasterSpecialist}
              isVerifiedMaster={isApprovedMaster}
              onNavigateToCabinet={() => {
                setCabinetInitialTab('master');
                setActiveTab('cabinet');
              }}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'cabinet' && (
          !currentUser ? (
            <ProtectedSectionGuard
              section="cabinet"
              onBackToHandbook={() => setActiveTab('handbook')}
              onRegister={() => handleOpenAuthForSection('cabinet', 'register')}
              onLogin={() => handleOpenAuthForSection('cabinet', 'login')}
              onOpenLegalModal={() => setIsFooterLegalModalOpen(true)}
            />
          ) : (
            <UserCabinetView
              articles={articles}
              serviceRequests={serviceRequests}
              specialists={specialists}
              onRefreshServiceRequests={fetchServiceRequests}
              onRefreshSpecialists={fetchSpecialists}
              onNavigateToSpecialists={() => setActiveTab('specialists')}
              onSelectArticle={(art) => setSelectedArticle(art)}
              onNavigateToCourses={() => setActiveTab('courses')}
              onNavigateToHandbook={() => setActiveTab('handbook')}
              onNavigateToDiagnostic={() => setActiveTab('diagnostic')}
              selectedCity={selectedCity}
              onCityChange={handleConfirmAndSaveCity}
              initialTab={cabinetInitialTab}
              onOpenDonation={() => setIsDonationModalOpen(true)}
            />
          )
        )}

        {activeTab === 'calculator' && (
          <div className="animate-in fade-in duration-200">
            <MaterialsCalculator embedded={false} />
          </div>
        )}

        {activeTab === 'specialists' && (
          <SpecialistsView
            specialists={specialists}
            selectedCity={selectedCity}
            setSelectedCity={handleConfirmAndSaveCity}
            onCityChange={handleConfirmAndSaveCity}
            isAdmin={isAdmin}
            currentUser={currentUser}
            serviceRequests={serviceRequests}
            onRefresh={() => {
              fetchSpecialists();
              fetchServiceRequests();
            }}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onOpenAuthModal={(mode, reason) => handleOpenAuthForSection('specialists', mode)}
            detectedCityInfo={detectedCityInfo}
            isDetectingCity={isDetectingCity}
            onDetectCity={() => runCityDetection(true)}
            initialReviewMasterId={deeplinkReviewMasterId}
            initialOpenSpecialistId={deeplinkMasterId}
            initialReviewClientName={deeplinkClientName}
            initialReviewRequestId={deeplinkRequestId}
          />
        )}

        {activeTab === 'diagnostic' && (
          <BreakdownsView
            articles={articles}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onOpenSpecialists={() => setActiveTab('specialists')}
            selectedCity={selectedCity}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            articles={articles}
            specialists={specialists}
            serviceRequests={serviceRequests}
            questions={questions}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            onRefreshArticles={fetchArticles}
            onRefreshSpecialists={fetchSpecialists}
            onRefreshServiceRequests={fetchServiceRequests}
            onRefreshQuestions={fetchQuestions}
            onSelectArticle={(art) => setSelectedArticle(art)}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onLike={handleLikeArticle}
          isAdmin={isAdmin}
          onEditArticle={handleEditArticle}
          onOpenPurchase={handleOpenPurchase}
          onOpenDonation={() => setIsDonationModalOpen(true)}
          selectedCity={selectedCity}
          specialistsCountInCity={specialists.filter(s => s.city === selectedCity || s.status === 'approved').length}
          onCallMasterForArticle={(art) => {
            setSelectedArticle(null);
            setSearchQuery(art.title.split(' ')[0] || '');
            setActiveTab('specialists');
          }}
          onOpenCabinet={() => {
            setSelectedArticle(null);
            setActiveTab('cabinet');
          }}
        />
      )}

      {/* Global Article Editor Modal */}
      {isAppEditorModalOpen && (
        <ArticleEditorModal
          isOpen={isAppEditorModalOpen}
          onClose={() => {
            setIsAppEditorModalOpen(false);
            setEditingArticleFromApp(null);
          }}
          articleToEdit={editingArticleFromApp}
          onRefreshArticles={fetchArticles}
        />
      )}

      {/* Global Auth Modal (Login / Register) */}
      <AuthModal selectedCity={selectedCity} onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Admin Password Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin');
        }}
      />

      {/* City Selection Modal */}
      <CitySelectModal
        isOpen={isCitySelectModalOpen}
        onClose={() => setIsCitySelectModalOpen(false)}
        currentCity={selectedCity}
        onSelectCity={handleSelectCityFromModal}
      />

      {/* Client Shared Estimate Viewer Modal */}
      {viewingEstimate && (
        <ClientEstimateModal
          estimate={viewingEstimate}
          isOpen={Boolean(viewingEstimate)}
          isMasterView={false}
          onClose={() => {
            setViewingEstimate(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('estimate');
              window.history.replaceState({}, '', url.toString());
            } catch (e) {}
          }}
          onOpenMasterProfile={(masterQuery) => {
            setViewingEstimate(null);
            setActiveTab('specialists');
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('estimate');
              url.searchParams.set('tab', 'specialists');
              url.searchParams.set('master', masterQuery);
              window.history.replaceState({}, '', url.toString());
            } catch (e) {}
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900/95 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Header Brand and Description */}
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-red-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/35 border border-white/20">
                <Wrench className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <span className="text-lg font-black tracking-tight">
                <span className="text-red-500">Сантех</span>
                <span className="text-blue-500">Про</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Твой карманный помощник по сантехнике. Справочник по инженерным системам, обучающие курсы, персональный кабинет и сервис проверенных мастеров.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsDonationModalOpen(true)}
              className="relative group flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/30 hover:shadow-rose-500/50 border border-rose-400/40 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Поддержать проект СантехПро (добровольный взнос)"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white shrink-0" />
              <span>Поддержать проект</span>
              <span className="text-rose-100 text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-full">• Клуб</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold flex items-center space-x-2 transition shadow-sm cursor-pointer"
              title="Написать в службу поддержки (с файлами до 10 МБ)"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Поддержка</span>
            </button>
          </div>

          <div className="border-t border-slate-800/80 w-full" />

          {/* Legal Documents Row with uniform spacing */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2 text-xs text-slate-400">
            <a
              href="/oferta"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleOpenLegalModal('offer');
                }
              }}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Оферта о пожертвовании
            </a>

            <span className="text-slate-700 select-none">•</span>

            <button
              type="button"
              onClick={() => handleOpenLegalModal('terms')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Пользовательское соглашение
            </button>

            <span className="text-slate-700 select-none">•</span>

            <button
              type="button"
              onClick={() => handleOpenLegalModal('privacy')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Политика конфиденциальности
            </button>
          </div>

          {/* Requisites and Copyright Card */}
          <div className="w-full max-w-xl mx-auto rounded-2xl bg-slate-950/70 border border-slate-800/80 p-3 sm:p-4 text-center space-y-1.5 shadow-sm">
            <div className="text-xs text-slate-300 font-medium">
              © 2026 СантехПро. Самозанятый Туйчиев Д. Н. (ИНН 250900981804)
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <span>Электронная почта:</span>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(true)}
                className="font-mono text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 transition cursor-pointer"
                title="Написать обращение в поддержку"
              >
                santehpro.info@yandex.ru
              </button>
            </div>
          </div>

          {/* Discrete Admin Link at the very end of footer (Almost invisible / stealth mode) */}
          <div className="pt-1 flex justify-center">
            {!isAdmin ? (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[10px] text-slate-700/60 hover:text-slate-400 opacity-[0.05] hover:opacity-80 transition-all duration-300 cursor-pointer flex items-center justify-center space-x-1 py-1 px-3 select-none"
                title="Вход для админа"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Вход для админа</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="text-[11px] text-amber-500/80 hover:text-amber-400 font-medium transition cursor-pointer flex items-center justify-center space-x-1 mx-auto"
              >
                <ShieldCheck className="w-3 h-3 text-amber-500" />
                <span>Панель управления (Админ)</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Global Footer Legal Terms Modal */}
      <LegalTermsModal
        isOpen={isFooterLegalModalOpen}
        onClose={() => setIsFooterLegalModalOpen(false)}
        initialDoc={footerLegalDoc}
        docType={footerLegalDoc}
        role="user"
      />

      {/* Voluntary Support / Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        onOpenOffer={() => handleOpenLegalModal('offer')}
        onOpenPrivacy={() => handleOpenLegalModal('privacy')}
      />

      {/* PRO+ Subscription / New Features Modal (inspired by Sajda+) */}
      <ProSubscriptionModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* User Support & Feedback Modal (santehpro.info@yandex.ru with up to 10 MB attachments) */}
      <SupportFeedbackModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Shared Client Estimate Modal */}
      {viewingEstimate && (
        <ClientEstimateModal
          estimate={viewingEstimate}
          onClose={() => {
            setViewingEstimate(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('estimate');
              window.history.replaceState({}, '', url.toString());
            } catch (e) {}
          }}
        />
      )}

      {/* Shared Client Contract Approval Modal */}
      {viewingContractForApproval && (
        <ClientContractModal
          contract={viewingContractForApproval}
          isOpen={Boolean(viewingContractForApproval)}
          onClose={() => {
            setViewingContractForApproval(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('contractId');
              url.searchParams.delete('contract');
              window.history.replaceState({}, '', url.toString());
            } catch (e) {}
          }}
          onSigned={(updatedContract) => {
            setViewingContractForApproval(updatedContract);
          }}
        />
      )}

      {/* Toast alert for newly arrived master order */}
      {newMasterOrderToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full shadow-2xl transition-all">
          <div className="bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500 rounded-2xl p-4 text-white shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Bell className="w-5 h-5 animate-pulse text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black tracking-wider text-emerald-400 uppercase">
                    🔔 Новая заявка мастеру!
                  </span>
                  <button
                    onClick={() => setNewMasterOrderToast(null)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
                    title="Закрыть"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm font-bold text-white truncate mt-0.5">
                  {newMasterOrderToast.clientName || 'Заказчик'} • {newMasterOrderToast.city || ''}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                  {newMasterOrderToast.problemDescription}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewMasterOrderToast(null);
                      setCabinetInitialTab('requests');
                      setActiveTab('cabinet');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    Открыть в кабинете
                  </button>
                  <button
                    onClick={() => {
                      playIncomingRequestSound(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer border border-slate-700"
                    title="Повторить звук"
                  >
                    🔊
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Robokassa Payment Success Notification Toast */}
      {paymentSuccessToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-br from-emerald-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-md border-2 border-emerald-500 rounded-2xl p-4 text-white shadow-2xl shadow-emerald-950/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-black tracking-wider text-emerald-400 uppercase">
                    🎉 Оплата успешно принята!
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaymentSuccessToast(false)}
                    className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Огромное спасибо за поддержку сервиса «СантехПро»! Официальный электронный чек успешно сформирован.
                </p>
                <div className="mt-2.5 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setPaymentSuccessToast(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    Отлично
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Ошибка отображения интерфейса">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

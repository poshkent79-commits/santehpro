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
import { Wrench, ShieldCheck, Scale, CheckCircle2, X, MapPin, Check, Search, ArrowRight, Share2, Heart } from 'lucide-react';
import { LegalTermsModal } from './components/LegalTermsModal';
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
import { triggerNativeShare } from './utils/shareApp';

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
          return parsed;
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
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached specialists:', e);
    }
    return INITIAL_SPECIALISTS;
  });
  const [serviceRequests, setServiceRequests] = useState<ServiceCallRequest[]>(() => {
    try {
      const cached = localStorage.getItem('santehpro_cached_service_requests');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached service requests:', e);
    }
    return INITIAL_SERVICE_REQUESTS;
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

  const handleOpenLegalModal = (doc: 'privacy' | 'terms' | 'offer') => {
    setFooterLegalDoc(doc);
    setIsFooterLegalModalOpen(true);
  };
  const [diagnosticPrompt, setDiagnosticPrompt] = useState<string>('');
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
        if (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
        if (s.phone && currentUser.phone) {
          const cleanS = s.phone.replace(/\D/g, '');
          const cleanU = currentUser.phone.replace(/\D/g, '');
          if (cleanS.length >= 10 && cleanS === cleanU) return true;
        }
        if (currentUser.name && s.name && s.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
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
      const masterParam = urlParams.get('master') || urlParams.get('specialist');

      if (masterParam) {
        setActiveTab('specialists');
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
      if (Array.isArray(data) && data.length > 0) {
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
    ? specialists.find(
        (s) =>
          (s.userUid && s.userUid === currentUser.uid) ||
          (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (s.phone && currentUser.phone && s.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')) ||
          (currentUser.name && s.name && s.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
      )
    : null;

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
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight">
                <span className="text-red-500">Сантех</span>
                <span className="text-blue-500">Про</span>
              </span>
            </div>

            <p className="text-center md:text-right text-slate-400 max-w-md">
              Твой карманный помощник по сантехнике. Справочник по инженерным системам, обучающие курсы, персональный кабинет и сервис проверенных мастеров.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-6 flex flex-col items-center justify-center text-center space-y-3">
            {/* Document links row with separators and hover effects */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-[13px] font-normal">
              <a
                href="/oferta"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleOpenLegalModal('offer');
                  }
                }}
                className="text-slate-400 hover:text-sky-400 no-underline hover:underline transition-colors cursor-pointer"
              >
                Публичная оферта
              </a>

              <span className="text-slate-600 select-none hidden sm:inline">•</span>

              <button
                type="button"
                onClick={() => handleOpenLegalModal('terms')}
                className="text-slate-400 hover:text-sky-400 no-underline hover:underline transition-colors cursor-pointer"
              >
                Пользовательское соглашение
              </button>

              <span className="text-slate-600 select-none hidden sm:inline">•</span>

              <button
                type="button"
                onClick={() => handleOpenLegalModal('privacy')}
                className="text-slate-400 hover:text-sky-400 no-underline hover:underline transition-colors cursor-pointer"
              >
                Политика конфиденциальности
              </button>

              <span className="text-slate-600 select-none hidden sm:inline">•</span>

              <button
                type="button"
                onClick={() => setIsDonationModalOpen(true)}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1 cursor-pointer transition"
                title="Поддержать проект СантехПро"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>Поддержать проект</span>
              </button>
            </div>

            {/* Requisites and copyright */}
            <p className="text-[12px] sm:text-[13px] text-slate-500 m-0 leading-relaxed text-center">
              © 2026 СантехПро. Самозанятый Туйчиев Д. Н. (ИНН 250900981804) • Электронная почта:{' '}
              <a href="mailto:santehpro.info@gmail.com" className="text-slate-400 hover:text-emerald-400 font-medium">
                santehpro.info@gmail.com
              </a>
            </p>

            {/* Discrete Admin Link at the very end of footer */}
            <div className="pt-1">
              {!isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-[11px] text-slate-700 hover:text-slate-500 transition-colors cursor-pointer flex items-center justify-center space-x-1 opacity-40 hover:opacity-100"
                  title="Панель администратора"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Вход для админа</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className="text-[11px] text-amber-500/80 hover:text-amber-400 font-medium transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  <span>Панель управления (Админ)</span>
                </button>
              )}
            </div>
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

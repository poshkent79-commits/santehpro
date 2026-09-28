import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, MapPin, Check, Globe } from 'lucide-react';
import { RUSSIAN_CITIES } from '../data/initialData';
import {
  COUNTRIES,
  CountryInfo,
  getCountryByCity,
  getCitiesByCountry,
} from '../data/regionsData';

interface CitySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onSelectCity: (city: string) => void;
  selectedCountryCode?: string;
  onSelectCountry?: (countryCode: string) => void;
}

export const CitySelectModal: React.FC<CitySelectModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
  selectedCountryCode,
  onSelectCountry,
}) => {
  // Detect country from current city or prop
  const detectedInitialCountry = useMemo(() => {
    if (selectedCountryCode) return selectedCountryCode;
    const fromCity = getCountryByCity(currentCity);
    return fromCity.code;
  }, [currentCity, selectedCountryCode]);

  const [activeCountry, setActiveCountry] = useState<string>(detectedInitialCountry);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync active country when modal opens or current city changes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      const fromCity = getCountryByCity(currentCity);
      const targetCountry = selectedCountryCode || fromCity.code || 'RU';
      setActiveCountry(targetCountry);
    }
  }, [isOpen, currentCity, selectedCountryCode]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentCountryObj = useMemo(() => {
    return COUNTRIES.find((c) => c.code === activeCountry) || COUNTRIES[0];
  }, [activeCountry]);

  // Cities for the active country
  const countryCities = useMemo(() => {
    return getCitiesByCountry(activeCountry, RUSSIAN_CITIES);
  }, [activeCountry]);

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return countryCities;
    return countryCities.filter((c) => c.toLowerCase().includes(q));
  }, [searchQuery, countryCities]);

  // If search query didn't find any in the current country, search across all countries
  const otherCountryMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || filteredCities.length > 0) return [];

    const otherCountries = COUNTRIES.filter((co) => co.code !== activeCountry);
    const matches: { city: string; country: CountryInfo }[] = [];

    for (const co of otherCountries) {
      const cities = getCitiesByCountry(co.code, RUSSIAN_CITIES);
      for (const city of cities) {
        if (city.toLowerCase().includes(q)) {
          matches.push({ city, country: co });
        }
      }
    }
    return matches.slice(0, 15);
  }, [searchQuery, filteredCities.length, activeCountry]);

  if (!isOpen) return null;

  const handleCountrySwitch = (countryCode: string) => {
    setActiveCountry(countryCode);
    setSearchQuery('');
    onSelectCountry?.(countryCode);
    try {
      localStorage.setItem('santehpro_selected_country', countryCode);
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="city-select-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="city-select-title" className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Выбор региона и города</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {currentCountryObj.flag} {currentCountryObj.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Подбор мастеров и расчёт услуг для вашей страны
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Country Selector Tabs */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0 mr-1 hidden sm:block" />
          {COUNTRIES.map((co) => {
            const isActive = activeCountry === co.code;
            return (
              <button
                key={co.code}
                type="button"
                onClick={() => handleCountrySwitch(co.code)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <span className="text-sm">{co.flag}</span>
                <span>{co.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Поиск города в ${currentCountryObj.name}...`}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Popular Cities of the active country */}
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Крупные города ({currentCountryObj.name}):</span>
              <span className="text-[10px] text-slate-500">Валюта: {currentCountryObj.currency}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {currentCountryObj.popularCities.map((c) => {
                const isCurrent = c.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onSelectCity(c);
                      onClose();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Full City List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-slate-800/40">
          {filteredCities.length === 0 && otherCountryMatches.length === 0 ? (
            <div className="py-8 text-center text-xs sm:text-sm text-slate-400 space-y-1">
              <p className="font-semibold text-white">Город не найден в {currentCountryObj.name}</p>
              <p className="text-slate-500 text-xs">Попробуйте переключить страну вверху</p>
            </div>
          ) : (
            <>
              {filteredCities.map((city) => {
                const isSelected = city.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{currentCountryObj.flag}</span>
                      <span>{city}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}

              {/* Show matching cities from other countries if found */}
              {otherCountryMatches.length > 0 && (
                <div className="pt-3 mt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-amber-400 px-3 py-1">
                    Найдено в других странах:
                  </div>
                  {otherCountryMatches.map(({ city, country }) => (
                    <button
                      key={`${country.code}-${city}`}
                      type="button"
                      onClick={() => {
                        handleCountrySwitch(country.code);
                        onSelectCity(city);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-left text-xs sm:text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{country.flag}</span>
                        <span>{city}</span>
                        <span className="text-[10px] text-slate-500">({country.name})</span>
                      </div>
                      <span className="text-[10px] text-cyan-400">Выбрать</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Выбранный город: <strong className="text-slate-300">{currentCity}</strong> ({currentCountryObj.name})
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer ml-auto"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

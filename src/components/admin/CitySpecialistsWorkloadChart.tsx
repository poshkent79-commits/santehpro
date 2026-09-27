import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { PlumbingSpecialist, ServiceCallRequest } from '../../types';
import {
  Activity,
  AlertTriangle,
  Users,
  PhoneCall,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  Table as TableIcon
} from 'lucide-react';

interface CityWorkloadData {
  city: string;
  totalMasters: number;
  activeMasters: number;
  verifiedMasters: number;
  emergencyMasters: number;
  totalRequests: number;
  activeRequests: number;
  pendingRequests: number;
  completedRequests: number;
  emergencyRequests: number;
  workloadRatio: number; // activeRequests / activeMasters
  status: 'critical' | 'high' | 'optimal' | 'low';
}

interface CitySpecialistsWorkloadChartProps {
  specialists: PlumbingSpecialist[];
  serviceRequests?: ServiceCallRequest[];
  onSelectCityFilter?: (city: string) => void;
}

export const CitySpecialistsWorkloadChart: React.FC<CitySpecialistsWorkloadChartProps> = ({
  specialists,
  serviceRequests = [],
  onSelectCityFilter
}) => {
  const [viewMode, setViewMode] = useState<'balance' | 'ratio' | 'distribution' | 'table'>('balance');
  const [filterMode, setFilterMode] = useState<'all' | 'top10' | 'deficit' | 'active'>('top10');
  const [selectedCityDetail, setSelectedCityDetail] = useState<string | null>(null);

  // Process data by city
  const cityStatsList: CityWorkloadData[] = useMemo(() => {
    const cityMap: Record<string, CityWorkloadData> = {};

    // Helper to get or init city record
    const getCityRecord = (cityName: string): CityWorkloadData => {
      const cleanCity = cityName.trim() || 'Не указан';
      if (!cityMap[cleanCity]) {
        cityMap[cleanCity] = {
          city: cleanCity,
          totalMasters: 0,
          activeMasters: 0,
          verifiedMasters: 0,
          emergencyMasters: 0,
          totalRequests: 0,
          activeRequests: 0,
          pendingRequests: 0,
          completedRequests: 0,
          emergencyRequests: 0,
          workloadRatio: 0,
          status: 'low'
        };
      }
      return cityMap[cleanCity];
    };

    // Aggregate specialists
    specialists.forEach((sp) => {
      if (sp.status === 'deleted') return;
      const rec = getCityRecord(sp.city || 'Не указан');
      rec.totalMasters += 1;
      if (sp.status === 'approved') {
        rec.activeMasters += 1;
      }
      if (sp.verified) {
        rec.verifiedMasters += 1;
      }
      if (sp.emergency247) {
        rec.emergencyMasters += 1;
      }
    });

    // Aggregate service requests
    serviceRequests.forEach((req) => {
      const rec = getCityRecord(req.city || 'Не указан');
      rec.totalRequests += 1;
      if (req.status === 'pending') {
        rec.pendingRequests += 1;
        rec.activeRequests += 1;
      } else if (req.status === 'approved') {
        rec.activeRequests += 1;
      } else if (req.status === 'completed') {
        rec.completedRequests += 1;
      }
      if (req.emergency) {
        rec.emergencyRequests += 1;
      }
    });

    // Calculate workload ratio and status for each city
    return Object.values(cityMap).map((rec) => {
      const availableStaff = Math.max(rec.activeMasters, 1);
      const ratio = Number((rec.activeRequests / availableStaff).toFixed(2));
      
      let status: 'critical' | 'high' | 'optimal' | 'low' = 'low';
      if (rec.activeRequests > 0 && rec.activeMasters === 0) {
        status = 'critical'; // Zero masters but has active requests!
      } else if (ratio >= 2.5) {
        status = 'critical';
      } else if (ratio >= 1.2) {
        status = 'high';
      } else if (ratio >= 0.4 || rec.activeMasters > 0) {
        status = 'optimal';
      }

      return {
        ...rec,
        workloadRatio: ratio,
        status
      };
    });
  }, [specialists, serviceRequests]);

  // Filtered and sorted dataset
  const displayData = useMemo(() => {
    let list = [...cityStatsList];

    // Filter
    if (filterMode === 'deficit') {
      // Deficit: cities where requests exceed masters or 0 masters with active requests
      list = list.filter((c) => c.status === 'critical' || (c.activeRequests > c.activeMasters));
    } else if (filterMode === 'active') {
      // Active: only cities with at least 1 specialist or 1 request
      list = list.filter((c) => c.activeMasters > 0 || c.activeRequests > 0);
    }

    // Default sort by active requests + masters descending
    list.sort((a, b) => (b.activeRequests * 2 + b.activeMasters) - (a.activeRequests * 2 + a.activeMasters));

    if (filterMode === 'top10') {
      list = list.slice(0, 10);
    }

    return list;
  }, [cityStatsList, filterMode]);

  // Overall KPIs
  const summaryKPIs = useMemo(() => {
    const totalMastersCount = specialists.filter((s) => s.status === 'approved').length;
    const totalActiveRequests = serviceRequests.filter((r) => r.status === 'pending' || r.status === 'approved').length;
    const totalPendingRequests = serviceRequests.filter((r) => r.status === 'pending').length;
    const citiesWithStaff = cityStatsList.filter((c) => c.activeMasters > 0).length;
    const deficitCitiesCount = cityStatsList.filter((c) => c.status === 'critical').length;
    const avgRatio = totalMastersCount > 0 ? (totalActiveRequests / totalMastersCount).toFixed(2) : '0';

    return {
      totalMastersCount,
      totalActiveRequests,
      totalPendingRequests,
      citiesWithStaff,
      deficitCitiesCount,
      avgRatio
    };
  }, [specialists, serviceRequests, cityStatsList]);

  // Pie chart data for distribution
  const pieData = useMemo(() => {
    const sorted = [...cityStatsList].sort((a, b) => b.totalMasters - a.totalMasters);
    const top = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((acc, curr) => acc + curr.totalMasters, 0);

    const result = top.map((item) => ({
      name: item.city,
      value: item.totalMasters
    }));

    if (othersCount > 0) {
      result.push({
        name: 'Другие города РФ',
        value: othersCount
      });
    }

    return result;
  }, [cityStatsList]);

  const PIE_COLORS = ['#f59e0b', '#06b6d4', '#10b981', '#6366f1', '#ec4899', '#64748b'];

  return (
    <div id="admin-workload-stats" className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl text-white">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Загруженность Мастеров и Спрос по Городам</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Recharts Analytics
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Мониторинг баланса активных вызовов и доступных сантехников по регионам РФ
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('balance')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'balance' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Сравнение мастеров и заявок"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Спрос vs Мастера</span>
              <span className="sm:hidden">График</span>
            </button>
            <button
              onClick={() => setViewMode('ratio')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'ratio' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Индекс нагрузки на одного мастера"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Индекс нагрузки</span>
              <span className="sm:hidden">Индекс</span>
            </button>
            <button
              onClick={() => setViewMode('distribution')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'distribution' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Доли специалистов по городам"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Доли рынка</span>
              <span className="sm:hidden">Круг</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Сводная таблица по городам"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Таблица</span>
            </button>
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="bg-transparent text-slate-300 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="top10" className="bg-slate-900 text-white">Топ-10 городов</option>
              <option value="all" className="bg-slate-900 text-white">Все города</option>
              <option value="deficit" className="bg-slate-900 text-white">Зоны дефицита (где не хватает)</option>
              <option value="active" className="bg-slate-900 text-white">Только активные</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Мастера (актив)</span>
            <Users className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">{summaryKPIs.totalMastersCount}</div>
          <p className="text-[10px] text-slate-400">в {summaryKPIs.citiesWithStaff} городах РФ</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Заявки в работе</span>
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">{summaryKPIs.totalActiveRequests}</div>
          <p className="text-[10px] text-slate-400">{summaryKPIs.totalPendingRequests} новых</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Средняя нагрузка</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-300">{summaryKPIs.avgRatio}</div>
          <p className="text-[10px] text-slate-400">заявок на 1 мастера</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Зоны дефицита</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className={`text-xl font-black ${summaryKPIs.deficitCitiesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summaryKPIs.deficitCitiesCount}
          </div>
          <p className="text-[10px] text-slate-400">нужен набор мастеров</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Проверенные</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-blue-400">
            {specialists.filter((s) => s.verified).length}
          </div>
          <p className="text-[10px] text-slate-400">с верификацией</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase">
            <span>Аварийные 24/7</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400">
            {specialists.filter((s) => s.emergency247).length}
          </div>
          <p className="text-[10px] text-slate-400">выезд круглосуточно</p>
        </div>
      </div>

      {/* Main Chart Presentation */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6">
        {/* VIEW 1: BALANCE (BAR CHART) */}
        {viewMode === 'balance' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-semibold text-slate-300">
                Сравнение: Активные мастера в базе vs Заявки клиентов (в работе и ожидании)
              </span>
              <div className="flex items-center space-x-4 text-[11px]">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  <span className="text-slate-400">Мастера (в наличии)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                  <span className="text-slate-400">Заявки клиентов</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                  <span className="text-slate-400">Экстренные 24/7</span>
                </span>
              </div>
            </div>

            {displayData.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                Нет данных по выбранному фильтру
              </div>
            ) : (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="city"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={45}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = displayData.find((d) => d.city === label);
                          return (
                            <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
                              <div className="font-bold text-white flex items-center space-x-1 border-b border-slate-800 pb-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                <span>{label}</span>
                              </div>
                              <div className="flex justify-between items-center text-emerald-400">
                                <span>Мастеров в городе:</span>
                                <span className="font-mono font-bold">{item?.activeMasters || 0}</span>
                              </div>
                              <div className="flex justify-between items-center text-amber-400">
                                <span>Заявок в работе:</span>
                                <span className="font-mono font-bold">{item?.activeRequests || 0}</span>
                              </div>
                              <div className="flex justify-between items-center text-rose-400">
                                <span>Экстренных вызовов:</span>
                                <span className="font-mono font-bold">{item?.emergencyRequests || 0}</span>
                              </div>
                              <div className="flex justify-between items-center text-cyan-400 pt-1 border-t border-slate-800 font-bold">
                                <span>Загрузка на мастера:</span>
                                <span className="font-mono">{item?.workloadRatio}</span>
                              </div>
                              {item?.status === 'critical' && (
                                <div className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded text-center mt-1">
                                  ⚠️ Высокий дефицит специалистов!
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
                    />
                    <Bar
                      name="Мастера (активные)"
                      dataKey="activeMasters"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Заявки клиентов"
                      dataKey="activeRequests"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      name="Экстренные вызовы"
                      dataKey="emergencyRequests"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: WORKLOAD RATIO & INDEX (COMPOSED CHART) */}
        {viewMode === 'ratio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-semibold text-slate-300">
                Коэффициент нагрузки: сколько активных заявок приходится на одного мастера в городе
              </span>
              <span className="text-[11px] text-slate-400">
                Линия показывает критический порог загруженности (&gt; 2.0 = дефицит)
              </span>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displayData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="city"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    angle={-25}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    label={{ value: 'Коэфф.', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = displayData.find((d) => d.city === label);
                        return (
                          <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 min-w-[180px]">
                            <div className="font-bold text-white flex items-center space-x-1 border-b border-slate-800 pb-1">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{label}</span>
                            </div>
                            <div className="text-cyan-300 font-bold">
                              Загрузка: {item?.workloadRatio} заявок/мастера
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              Мастеров: {item?.activeMasters} | Заявок: {item?.activeRequests}
                            </div>
                            <div className="pt-1">
                              {item?.status === 'critical' ? (
                                <span className="text-rose-400 font-bold">● Критическая перегрузка</span>
                              ) : item?.status === 'high' ? (
                                <span className="text-amber-400 font-bold">● Высокая нагрузка</span>
                              ) : (
                                <span className="text-emerald-400 font-bold">● Оптимальный баланс</span>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="workloadRatio" name="Коэффициент загрузки" radius={[4, 4, 0, 0]}>
                    {displayData.map((entry, index) => {
                      let color = '#10b981'; // optimal
                      if (entry.status === 'critical') color = '#ef4444'; // critical
                      else if (entry.status === 'high') color = '#f59e0b'; // high
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="workloadRatio"
                    name="Тренд нагрузки"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0284c7' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: GEOGRAPHIC DISTRIBUTION (PIE / DONUT) */}
        {viewMode === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} мастеров`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm">Топ регионов по концентрации мастеров:</h3>
              <div className="space-y-2">
                {pieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      ></span>
                      <span className="font-semibold text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-white">{item.value} сантехников</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Всего охвачено более 190+ городов РФ с гео-привязкой заявок и расчетом выезда мастеров.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 4: SUMMARY TABLE */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Город</th>
                  <th className="py-2.5 px-3 text-center">Мастеров</th>
                  <th className="py-2.5 px-3 text-center">Проверено</th>
                  <th className="py-2.5 px-3 text-center">24/7</th>
                  <th className="py-2.5 px-3 text-center">Заявок (актив)</th>
                  <th className="py-2.5 px-3 text-center">Экстренных</th>
                  <th className="py-2.5 px-3 text-center">Индекс нагрузки</th>
                  <th className="py-2.5 px-3 text-right">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayData.map((item) => (
                  <tr
                    key={item.city}
                    className="hover:bg-slate-900/60 transition cursor-pointer"
                    onClick={() => {
                      if (onSelectCityFilter) {
                        onSelectCityFilter(item.city);
                      }
                    }}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.city}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.activeMasters}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-blue-400">{item.verifiedMasters}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-purple-400">{item.emergencyMasters}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">{item.activeRequests}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-400">{item.emergencyRequests}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {item.workloadRatio}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {item.status === 'critical' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Дефицит
                        </span>
                      ) : item.status === 'high' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Высокая
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Норма
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Insight / Actionable Recommendations for Dispatcher */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-300 block">Рекомендация диспетчеру:</span>
            <span className="text-slate-400 text-[11px]">
              {summaryKPIs.deficitCitiesCount > 0
                ? `Внимание! В ${summaryKPIs.deficitCitiesCount} городах зафиксирован дефицит сантехников при наличии активных заказов. Рекомендуется активировать привлечение региональных мастеров.`
                : 'Баланс вызовов и сантехников в регионах находится в стабильной зоне. Доступность мастеров 24/7 обеспечена.'}
            </span>
          </div>
        </div>

        {onSelectCityFilter && displayData.length > 0 && (
          <button
            onClick={() => onSelectCityFilter(displayData[0].city)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
          >
            Фильтровать по «{displayData[0].city}»
          </button>
        )}
      </div>
    </div>
  );
};

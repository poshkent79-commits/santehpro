import { DiagnosticSession } from '../types';

const STORAGE_KEY = 'santehpro_diagnostic_history';

export const INITIAL_DIAGNOSTIC_SESSIONS: DiagnosticSession[] = [
  {
    id: 'diag-demo-1',
    query: 'Откопал яму под септик, а там глина. Что лучше поставить: бетонные кольца или станцию биоочистки?',
    result: `### 🔍 Диагностическое заключение: Выбор и монтаж септика в глинистом грунте / при высоком УГВ
**Категория узла:** Наружная канализация и локальные очистные сооружения (ЛОС)

**Характер неисправности:**
Глина и суглинок — водоупорные грунты с крайне низким коэффициентом фильтрации (< 0.01 м/сут). Классический колодец из колец без дна переполнится за 2–3 недели, а весной верховодка затопит септик.

#### 🛠 Необходимый инструмент:
• Лазерный или оптический нивелир (уклон трубы 110 мм — 2 см на 1 м)
• Дренажный насос с поплавком для осушения котлована
• Штыковая и совковая лопаты, ручная трамбовка

#### 📦 Необходимые материалы и запчасти:
• Станция глубокой биологической очистки (АУ/ЛОС) с ПРИНУДИТЕЛЬНЫМ сбросом насосом (модели ПР: Топас-ПР, Астра-ПР, Евролос Грунт)
• Песок речной мытый и цемент М500 (ЦПС 1:5 для засыпки пазух)
• Экструдированный пенополистирол (ЭППС) 50 мм для утепления горловины
• Труба наружная рыжая ПВХ 110 мм (класс жесткости SN4)

#### 📋 Пошаговый регламент:
1. Исключить фильтрационные колодцы без дна — только герметичный корпус или ЛОС.
2. Подготовить песчаную подушку 10-15 см на дне ямы.
3. Опускать станцию строго по уровню.
4. Выполнять обратную засыпку ЦПС с одновременным заполнением отсеков водой.
5. Организовать принудительный сброс дренажным насосом в насыпную траншею или канаву с контруклоном.`,
    category: 'Септики и ЛОС',
    timestamp: 'Сегодня в 14:25',
    createdAt: Date.now() - 1000 * 60 * 35,
  },
  {
    id: 'diag-demo-2',
    query: 'Капает из-под излива смесителя на кухне, как разобрать и заменить картридж 35мм?',
    result: `### 🔍 Диагностическое заключение: Замена картриджа однорычажного смесителя
**Категория узла:** Смесители и запорная арматура

**Характер неисправности:**
Износ керамических пластин или уплотнительных манжет картриджа (35 мм). Проявляется постоянным капанием в мойку или тугим ходом рычага.

#### 🛠 Необходимый инструмент:
• Разводной сантехнический ключ или рожковый ключ 27–30 мм
• Шестигранный ключ 2.5 мм (или плоская шлицевая отвертка 3 мм)
• Канцелярский нож (поддеть декоративную заглушку)

#### 📦 Необходимые материалы:
• Керамический картридж 35 мм (с низкой или высокой ножкой — сверить со снятым)
• Силиконовая сантехническая смазка (Silicot / Efele)

#### 📋 Пошаговый регламент:
1. Перекрыть коренные краны ГВС и ХВС на коллекторе или стояке, открыть смеситель для сброса давления.
2. Поддеть ножом красно-синюю заглушку на рычаге.
3. Шестигранником 2.5 мм выкрутить стопорный винт на 2-3 оборота и снять рычаг вверх.
4. Вручную открутить декоративный хромированный сферический колпак.
5. Разводным ключом выкрутить латунную прижимную гайку картриджа.
6. Извлечь старый картридж, очистить посадочное седло от песка и ржавчины.
7. Установить новый картридж, совместив направляющие выступы с углублениями в корпусе смесителя.
8. Затянуть гайку с умеренным усилием (не пережимать керамику!). Собрать смеситель в обратном порядке.`,
    category: 'Смесители и санфаянс',
    timestamp: 'Вчера в 18:40',
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
  },
];

export function detectDiagnosticCategory(query: string, result: string = ''): string {
  const text = (query + ' ' + result).toLowerCase();
  if (text.includes('септик') || text.includes('лос') || text.includes('глина') || text.includes('котлован') || text.includes('кольц') || text.includes('скважин') || text.includes('насос')) {
    return 'Септики и ЛОС';
  }
  if (text.includes('смесител') || text.includes('картридж') || text.includes('кран-букс') || text.includes('унитаз') || text.includes('бачок') || text.includes('арматур') || text.includes('инсталляци')) {
    return 'Смесители и санфаянс';
  }
  if (text.includes('радиатор') || text.includes('отоплен') || text.includes('батаре') || text.includes('котел') || text.includes('байпас') || text.includes('воздухоотводчик') || text.includes('маевск')) {
    return 'Отопление и радиаторы';
  }
  if (text.includes('ппр') || text.includes('полипропилен') || text.includes('труб') || text.includes('фитинг') || text.includes('американк') || text.includes('пайк') || text.includes('pex') || text.includes('сшит')) {
    return 'Трубы и фитинги';
  }
  if (text.includes('засор') || text.includes('сифон') || text.includes('прочистк') || text.includes('трос') || text.includes('слив') || text.includes('раковин') || text.includes('волосы')) {
    return 'Канализация и засоры';
  }
  return 'Общая сантехника';
}

export async function getDiagnosticHistory(userUid?: string): Promise<DiagnosticSession[]> {
  try {
    // 1. Try server endpoint first
    const url = userUid
      ? `/api/diagnostics/history?uid=${encodeURIComponent(userUid)}`
      : '/api/diagnostics/history';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Save to local cache as well
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch diagnostic history from server, using local storage:', err);
  }

  // 2. Fallback to LocalStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading localStorage diagnostic history:', e);
  }

  // 3. If completely empty, return initial demo sessions and persist
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DIAGNOSTIC_SESSIONS));
  } catch {}
  return INITIAL_DIAGNOSTIC_SESSIONS;
}

export async function saveDiagnosticSession(sessionData: {
  userUid?: string;
  userEmail?: string;
  query: string;
  result: string;
  imagePreview?: string;
  category?: string;
}): Promise<DiagnosticSession> {
  const category = sessionData.category || detectDiagnosticCategory(sessionData.query, sessionData.result);
  const now = Date.now();
  const dateStr = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  const newSession: DiagnosticSession = {
    id: `diag-${now}-${Math.random().toString(36).substring(2, 7)}`,
    userUid: sessionData.userUid,
    userEmail: sessionData.userEmail,
    query: sessionData.query,
    result: sessionData.result,
    imagePreview: sessionData.imagePreview,
    category,
    timestamp: dateStr,
    createdAt: now,
  };

  // 1. Update localStorage immediately
  try {
    const existing = await getDiagnosticHistory(sessionData.userUid);
    const updated = [newSession, ...existing.filter((s) => s.id !== newSession.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }

  // 2. Sync to server in background
  try {
    fetch('/api/diagnostics/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSession),
    }).catch((e) => console.warn('Background server sync diagnostic error:', e));
  } catch {}

  // 3. Dispatch global event for instant UI update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santehpro_diagnostic_updated', { detail: newSession }));
  }

  return newSession;
}

export async function deleteDiagnosticSession(id: string, userUid?: string): Promise<void> {
  // 1. LocalStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed: DiagnosticSession[] = JSON.parse(local);
      const filtered = parsed.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('LocalStorage delete error:', e);
  }

  // 2. Server
  try {
    await fetch(`/api/diagnostics/history/${encodeURIComponent(id)}?uid=${encodeURIComponent(userUid || '')}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('Server delete error:', e);
  }

  // 3. Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santehpro_diagnostic_updated'));
  }
}

export async function clearAllDiagnosticHistory(userUid?: string): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}

  try {
    await fetch(`/api/diagnostics/history?uid=${encodeURIComponent(userUid || '')}`, {
      method: 'DELETE',
    });
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santehpro_diagnostic_updated'));
  }
}

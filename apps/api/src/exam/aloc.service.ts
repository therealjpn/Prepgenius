import { Injectable, Logger } from '@nestjs/common';

const ALOC_BASE = 'https://questions.aloc.com.ng/api/v2';

const SUBJECT_MAP: Record<string, string> = {
  Mathematics: 'mathematics', 'English Language': 'english', Biology: 'biology',
  Chemistry: 'chemistry', Physics: 'physics', Economics: 'economics',
  Government: 'government', 'Literature in English': 'englishlit',
  Commerce: 'commerce', Accounting: 'accounting', Geography: 'geography',
  'Christian Religious Knowledge': 'crk', 'Islamic Religious Knowledge': 'irk',
  'Civic Education': 'civiledu', History: 'history',
};

const EXAM_TYPE_MAP: Record<string, string | null> = {
  WAEC: 'wassce', NECO: 'wassce', JAMB: 'utme', UTME: 'utme', all: null,
};

function cleanHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

function normalizeQuestion(q: any) {
  if (!q || !q.option) return null;
  const optionMap: Record<string, string> = {};
  const options: string[] = [];
  for (const letter of ['a', 'b', 'c', 'd', 'e']) {
    if (q.option[letter]) {
      const text = q.option[letter].trim();
      optionMap[letter] = text;
      options.push(text);
    }
  }
  const correctLetter = (q.answer || '').toLowerCase().trim();
  let examType = 'WAEC';
  if (q.examtype === 'utme' || q.section === 'utme') examType = 'JAMB';
  return {
    question: cleanHtml(q.question || ''),
    options,
    correct_answer: optionMap[correctLetter] || options[0] || '',
    explanation: cleanHtml(q.solution || 'No explanation available.'),
    topic: q.topic || '', year: q.examyear || '', exam_type: examType,
    source: 'aloc',
  };
}

@Injectable()
export class AlocService {
  private readonly logger = new Logger(AlocService.name);
  private token = process.env.ALOC_ACCESS_TOKEN || '';

  isAvailable(): boolean { return !!this.token; }
  getSubjectSlug(name: string): string | null { return SUBJECT_MAP[name] || null; }
  getSubjectMap() { return SUBJECT_MAP; }

  async fetchQuestions(subject: string, count = 20, opts: { examType?: string; year?: string } = {}) {
    const slug = SUBJECT_MAP[subject];
    if (!slug || !this.token) throw new Error('ALOC not available for ' + subject);

    let url = `${ALOC_BASE}/q/${Math.min(count, 40)}?subject=${slug}`;
    if (opts.examType && opts.examType !== 'all') {
      const t = EXAM_TYPE_MAP[opts.examType];
      if (t) url += `&type=${t}`;
    }
    if (opts.year && opts.year !== 'all') url += `&year=${opts.year}`;

    this.logger.log(`Fetching: ${url}`);
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', AccessToken: this.token },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`ALOC API error ${res.status}`);

    const data = await res.json();
    let raw: any[] = [];
    if (data.data) { raw = Array.isArray(data.data) ? data.data : [data.data]; }
    else if (data.question) { raw = [data]; }

    const normalized = raw.map(normalizeQuestion).filter(
      (q): q is NonNullable<typeof q> => q !== null && !!q.question && q.options.length >= 2 && !!q.correct_answer,
    );
    this.logger.log(`Got ${normalized.length} valid questions for ${subject}`);
    return normalized;
  }
}

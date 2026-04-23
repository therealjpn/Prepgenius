import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

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

// Available years for random selection
const AVAILABLE_YEARS = ['2019', '2020', '2021', '2022', '2023'];

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

/**
 * Generate a cryptographically random integer in [0, max)
 */
function cryptoRandomInt(max: number): number {
  const bytes = crypto.randomBytes(4);
  return bytes.readUInt32BE(0) % max;
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

  /**
   * Fetch questions using multiple calls with randomized parameters
   * to break the sequential pattern and maximize diversity.
   *
   * Strategy:
   * 1. Split the requested count across 2-3 smaller calls
   * 2. Use random year filters for each call
   * 3. Deduplicate by question text hash
   * 4. Shuffle the final result
   */
  async fetchRandomizedQuestions(
    subject: string,
    count: number,
    opts: { examType?: string; year?: string } = {},
  ): Promise<any[]> {
    const slug = SUBJECT_MAP[subject];
    if (!slug || !this.token) throw new Error('ALOC not available for ' + subject);

    const allQuestions = new Map<string, any>(); // Deduplicate by question text hash

    // Determine which years to query
    const yearsToQuery = opts.year && opts.year !== 'all'
      ? [opts.year]
      : this.getRandomYears(3); // Pick 3 random years

    // Determine exam types to query
    const examTypes: string[] = [];
    if (opts.examType === 'all' || !opts.examType) {
      examTypes.push('wassce', 'utme');
    } else {
      const mapped = EXAM_TYPE_MAP[opts.examType];
      if (mapped) examTypes.push(mapped);
      else examTypes.push('wassce');
    }

    // Make multiple parallel calls with varied parameters
    const calls: Promise<any[]>[] = [];
    const perCall = Math.ceil(count / Math.max(yearsToQuery.length, 2));

    for (const year of yearsToQuery) {
      for (const type of examTypes) {
        calls.push(
          this.fetchSingleBatch(slug, Math.min(perCall + 5, 40), type, year)
            .catch((e) => {
              this.logger.warn(`ALOC batch failed (${type}/${year}): ${e.message}`);
              return [];
            }),
        );
      }
    }

    // Also make one call without year filter for extra diversity
    calls.push(
      this.fetchSingleBatch(slug, Math.min(count, 40), examTypes[0], undefined)
        .catch(() => []),
    );

    const results = await Promise.all(calls);

    // Merge and deduplicate
    for (const batch of results) {
      for (const q of batch) {
        const hash = this.questionHash(q);
        if (!allQuestions.has(hash)) {
          allQuestions.set(hash, q);
        }
      }
    }

    // Convert to array and crypto-shuffle
    let pool = Array.from(allQuestions.values());
    pool = this.cryptoShuffle(pool);

    this.logger.log(`Randomized ALOC: ${allQuestions.size} unique questions from ${results.length} batches, returning ${Math.min(count, pool.length)}`);
    return pool.slice(0, count);
  }

  private async fetchSingleBatch(slug: string, count: number, type?: string, year?: string): Promise<any[]> {
    let url = `${ALOC_BASE}/q/${count}?subject=${slug}`;
    if (type) url += `&type=${type}`;
    if (year) url += `&year=${year}`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', AccessToken: this.token },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`ALOC API error ${res.status}`);

    const data = await res.json();
    let raw: any[] = [];
    if (data.data) { raw = Array.isArray(data.data) ? data.data : [data.data]; }
    else if (data.question) { raw = [data]; }

    return raw.map(normalizeQuestion).filter(
      (q): q is NonNullable<typeof q> => q !== null && !!q.question && q.options.length >= 2 && !!q.correct_answer,
    );
  }

  /**
   * Get N random years from available years.
   */
  private getRandomYears(n: number): string[] {
    const shuffled = this.cryptoShuffle([...AVAILABLE_YEARS]);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  /**
   * Create a hash of a question for deduplication.
   */
  private questionHash(q: any): string {
    const text = (q.question || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 100);
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Fisher-Yates shuffle with crypto randomness.
   */
  private cryptoShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = cryptoRandomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

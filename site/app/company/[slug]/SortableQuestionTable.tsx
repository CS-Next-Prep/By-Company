'use client';

import { useState, useMemo, useCallback } from 'react';
import DifficultyBadge from '@/components/DifficultyBadge';
import ProblemPanel from '@/components/ProblemPanel';
import type { Question } from '@/lib/types';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

const TOPICS: { label: string; keywords: string[] }[] = [
  { label: 'Array',          keywords: ['array', 'subarray', 'matrix', 'subarrays'] },
  { label: 'String',         keywords: ['string', 'palindrome', 'anagram', 'substring', 'subsequence'] },
  { label: 'DP',             keywords: ['dp', 'dynamic', 'knapsack', 'coin change', 'longest common', 'edit distance', 'partition', 'fibonacci'] },
  { label: 'Tree',           keywords: ['tree', 'bst', 'binary tree', 'trie', 'segment tree'] },
  { label: 'Graph',          keywords: ['graph', 'bfs', 'dfs', 'topological', 'dijkstra', 'network', 'island', 'flood fill', 'cycle'] },
  { label: 'Linked List',    keywords: ['linked list', 'node', 'cycle', 'reverse list', 'merge list'] },
  { label: 'Binary Search',  keywords: ['binary search', 'search insert', 'rotated', 'peak'] },
  { label: 'Sliding Window', keywords: ['sliding window', 'window', 'two pointer', 'two sum'] },
  { label: 'Stack/Queue',    keywords: ['stack', 'queue', 'monotonic', 'valid parentheses', 'bracket'] },
  { label: 'Heap',           keywords: ['heap', 'priority queue', 'kth largest', 'top k', 'median'] },
  { label: 'Math',           keywords: ['math', 'number', 'digit', 'prime', 'pow', 'sqrt', 'roman', 'integer'] },
];

function getTopics(title: string) {
  const low = title.toLowerCase();
  return TOPICS.filter(t => t.keywords.some(kw => low.includes(kw))).map(t => t.label);
}

interface QuestionWithTopics extends Question { topics: string[] }

interface ActiveQuestion {
  question: QuestionWithTopics;
  maxFreq: number;
}

export default function SortableQuestionTable({
  questions,
  companySlug,
}: {
  questions: Question[];
  companySlug?: string;
}) {
  const [diffFilter, setDiffFilter] = useState<Set<Difficulty>>(new Set());
  const [topicFilter, setTopicFilter] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ActiveQuestion | null>(null);

  const questionsWithTopics = useMemo(
    () => questions.map(q => ({ ...q, topics: getTopics(q.title) })),
    [questions],
  );

  const availableTopics = useMemo(() => {
    const count: Record<string, number> = {};
    questionsWithTopics.forEach(q => q.topics.forEach(t => { count[t] = (count[t] || 0) + 1; }));
    return Object.entries(count).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [questionsWithTopics]);

  const toggle = <T,>(set: Set<T>, val: T) => {
    const next = new Set(set);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    return next;
  };

  const visible = useMemo(() => {
    let arr = questionsWithTopics;
    if (diffFilter.size > 0) arr = arr.filter(q => diffFilter.has(q.difficulty as Difficulty));
    if (topicFilter.size > 0) arr = arr.filter(q => q.topics.some(t => topicFilter.has(t)));
    // Default: sort by frequency descending
    return [...arr].sort((a, b) => b.frequency - a.frequency);
  }, [questionsWithTopics, diffFilter, topicFilter]);

  const maxFreq = useMemo(() => Math.max(...questions.map(q => q.frequency), 1), [questions]);
  const hasFilters = diffFilter.size > 0 || topicFilter.size > 0;

  const openPanel = useCallback((q: QuestionWithTopics) => {
    setActive({ question: q, maxFreq });
  }, [maxFreq]);

  const closePanel = useCallback(() => setActive(null), []);

  const surpriseMe = useCallback(() => {
    if (visible.length === 0) return;
    const pick = visible[Math.floor(Math.random() * visible.length)];
    setActive({ question: pick, maxFreq });
  }, [visible, maxFreq]);

  return (
    <>
      {/* Filter bar — difficulty + topic chips */}
      <div className="filter-bar" role="group" aria-label="Filter questions">
        <span className="filter-group-label">Difficulty</span>
        {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
          <button
            key={d}
            type="button"
            className={`filter-chip ${d.toLowerCase()}${diffFilter.has(d) ? ' active' : ''}`}
            onClick={() => setDiffFilter(prev => toggle(prev, d))}
            aria-pressed={diffFilter.has(d)}
          >
            {d}
          </button>
        ))}

        {availableTopics.length > 0 && (
          <>
            <div className="filter-divider" aria-hidden="true" />
            <span className="filter-group-label">Topic</span>
            {availableTopics.slice(0, 8).map(t => (
              <button
                key={t}
                type="button"
                className={`filter-chip${topicFilter.has(t) ? ' active' : ''}`}
                onClick={() => setTopicFilter(prev => toggle(prev, t))}
                aria-pressed={topicFilter.has(t)}
              >
                {t}
              </button>
            ))}
          </>
        )}

        {hasFilters && (
          <button type="button" className="filter-clear"
            onClick={() => { setDiffFilter(new Set()); setTopicFilter(new Set()); }}>
            Clear
          </button>
        )}

        {/* Surprise Me — opens a random question from the current filtered list */}
        <button type="button" className="surprise-btn" onClick={surpriseMe} title="Open a random question">
          🎲 Surprise me
        </button>

        <span className="filter-count-badge" aria-live="polite">
          {visible.length} of {questions.length}
        </span>
      </div>

      {/* Question table — plain column labels (no sort buttons per user request) */}
      <div className="question-table-wrap">
        <table className="question-table" aria-label="Interview questions">
          <thead>
            <tr>
              <th scope="col" className="th-num">No.</th>
              <th scope="col">Problem</th>
              <th scope="col" className="th-diff">Difficulty</th>
              <th scope="col" className="th-freq">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(q => (
              <tr
                key={q.id || q.title}
                className="question-row"
                onClick={() => openPanel(q)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openPanel(q); }}
                aria-label={`${q.title} — click to view details`}
                style={{ cursor: 'pointer' }}
              >
                <td className="td-num">{q.id ?? '—'}</td>
                <td className="td-title">
                  <span className="td-title-text">{q.title}</span>
                  {q.topics.length > 0 && (
                    <div className="question-tags" aria-label="Topic tags">
                      {q.topics.map(t => <span key={t} className="question-tag">{t}</span>)}
                    </div>
                  )}
                </td>
                <td><DifficultyBadge difficulty={q.difficulty} /></td>
                <td className="td-freq">
                  <div className="freq-bar-wrap">
                    <div className="freq-bar" aria-hidden="true">
                      <div className="freq-bar-fill" style={{ width: `${(q.frequency / maxFreq) * 100}%` }} />
                    </div>
                    <span>{q.frequency.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <p className="empty-table-state">
            No questions match.{' '}
            {hasFilters && (
              <button type="button" className="filter-clear"
                onClick={() => { setDiffFilter(new Set()); setTopicFilter(new Set()); }}>
                Clear filters
              </button>
            )}
          </p>
        )}
      </div>

      {/* Right-side problem panel */}
      {active && (
        <ProblemPanel
          questionId={active.question.id}
          title={active.question.title}
          difficulty={active.question.difficulty}
          frequency={active.question.frequency}
          maxFreq={active.maxFreq}
          leetcodeUrl={active.question.leetcode_url}
          topics={active.question.topics}
          currentCompanySlug={companySlug}
          onClose={closePanel}
        />
      )}
    </>
  );
}

'use client';

import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import ProblemPanel from './ProblemPanel';
import { getQuestionTopics } from '@/lib/question-topics';

type GlobalQuestion = {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  frequency: number;
  leetcode_url: string;
  finalWeight: number;
};

let questionsCache: Promise<GlobalQuestion[]> | null = null;

function loadQuestions() {
  if (!questionsCache) {
    questionsCache = fetch('/data/global-surprise.json')
      .then(response => {
        if (!response.ok) throw new Error(`Global question index failed: ${response.status}`);
        return response.json() as Promise<{ questions: GlobalQuestion[] }>;
      })
      .then(data => data.questions)
      .catch(error => {
        questionsCache = null;
        throw error;
      });
  }
  return questionsCache;
}

function pickWeighted(questions: GlobalQuestion[]) {
  const totalWeight = questions.reduce((sum, question) => sum + question.finalWeight, 0);
  if (totalWeight <= 0) return questions[Math.floor(Math.random() * questions.length)];

  let target = Math.random() * totalWeight;
  for (const question of questions) {
    target -= question.finalWeight;
    if (target <= 0) return question;
  }
  return questions[questions.length - 1];
}

export default function GlobalSurpriseMe() {
  const [active, setActive] = useState<GlobalQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const surpriseMe = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const questions = await loadQuestions();
      if (questions.length > 0) setActive(pickWeighted(questions));
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const questionTopics = active ? getQuestionTopics(active.title) : [];
  const maxFrequency = active ? 100 : 1;

  return (
    <>
      <div className="global-surprise">
        <div className="global-surprise-copy">
          <h2>Not sure where to start?</h2>
          <p>Let chance choose your next challenge.</p>
        </div>
        <button
          type="button"
          className="surprise-btn global-surprise-btn"
          onClick={surpriseMe}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Loading…' : 'Surprise me'}
        </button>
        {error && <p className="global-surprise-error" role="alert">Could not load a random question. Please try again.</p>}
      </div>

      {active && typeof document !== 'undefined' && createPortal(
        <ProblemPanel
          questionId={active.id}
          title={active.title}
          difficulty={active.difficulty}
          frequency={active.frequency}
          maxFreq={maxFrequency}
          leetcodeUrl={active.leetcode_url}
          topics={questionTopics}
          onClose={() => setActive(null)}
        />,
        document.body,
      )}
    </>
  );
}

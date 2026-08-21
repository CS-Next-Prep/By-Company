/**
 * DifficultyBadge — renders Easy/Medium/Hard with semantic color coding.
 * AGENTS.md Section 4: "difficulty color-coding used for meaning, never decoration"
 */

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Unknown' | string;

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const classMap: Record<string, string> = {
  Easy:    'badge badge-easy',
  Medium:  'badge badge-medium',
  Hard:    'badge badge-hard',
  Unknown: 'badge badge-unknown',
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const className = classMap[difficulty] || 'badge badge-unknown';
  return (
    <span className={className}>
      {difficulty}
    </span>
  );
}

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

export function getQuestionTopics(title: string): string[] {
  const low = title.toLowerCase();
  return TOPICS.filter(topic => topic.keywords.some(keyword => low.includes(keyword))).map(topic => topic.label);
}

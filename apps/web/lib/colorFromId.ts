const GRADIENTS = [
  'from-indigo-500 via-violet-500 to-fuchsia-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-amber-500 via-orange-500 to-rose-500',
];

/** Deterministically picks a gradient for an id, so project cards get varied
 * but stable-per-project color without needing a real thumbnail. */
export function gradientFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

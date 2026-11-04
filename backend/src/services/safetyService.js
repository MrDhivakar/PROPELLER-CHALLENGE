// Prohibited content detection. Conservative regex — human review is still required.
const PROHIBITED_PATTERNS = [
  /suicid/i, /self[- ]?harm/i, /cut(ting)? (your|my)self/i, /kill (your|my)self/i,
  /starve|no (food|water)|sleep depriv/i,
  /jump (off|from)|dangerous stunt|stunt|risky location/i,
  /isolat(e|ion)|hide (it )?from|keep (it )?secret|don'?t tell/i,
  /threat|blackmail|revenge/i, /harass|bully|humiliat|shame/i,
  /illegal|drugs?|alcohol|get drunk|steal/i,
  /send (me )?(your )?(password|otp|pin|ssn|card|bank|id)/i,
  /pay(ment)?|transfer (money|funds)|send (me )?money|crypto/i,
  /coerce|forced|must complete or|punish(ment)? (if|for)/i,
];

export const PROHIBITED_CATEGORY_NOTE =
  'Prohibited: self-harm, suicide, dangerous stunts, deprivation, isolation, coercion, ' +
  'threats, harassment, humiliation, illegal activity, drugs/alcohol, financial or ' +
  'sensitive-data requests, manipulation, forced participation.';

export function scanTaskContent({ title = '', description = '' }) {
  const text = `${title}\n${description}`;
  const hits = [];
  for (const re of PROHIBITED_PATTERNS) {
    if (re.test(text)) hits.push(re.source);
  }
  return { safe: hits.length === 0, hits };
}

export function assertTaskSafe(content) {
  const res = scanTaskContent(content);
  if (!res.safe) {
    const err = new Error(`Prohibited content detected: ${res.hits.join(', ')}. ${PROHIBITED_CATEGORY_NOTE}`);
    err.prohibited = true;
    throw err;
  }
  return res;
}
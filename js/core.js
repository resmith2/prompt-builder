/* Shared by every skill file. Loaded first. */

const SKILLS = [];
function registerSkill(s) { SKILLS.push(s); }

// Labels of slots the last build left empty. app.js clears it before each build.
const emptySlots = [];
function slot(val, label) {
  const v = (val || '').trim();
  if (!v) emptySlots.push(label);
  return v || `<${label}>`;
}
const sentence = s => { s = (s || '').trim(); return !s || /[.!?]$/.test(s) ? s : `${s}.`; };
const labeled = (name, s) => (s || '').trim() ? `${name}: ${sentence(s)}` : '';
const joinParts = (...parts) => parts.filter(Boolean).join(' ');

/* Shared by every skill file. Loaded first. */

const SKILLS = [];
function registerSkill(s) { SKILLS.push(s); }

function slot(val, label) { return (val || '').trim() || `<${label}>`; }
const sentence = s => { s = (s || '').trim(); return !s || /[.!?]$/.test(s) ? s : `${s}.`; };
const labeled = (name, s) => (s || '').trim() ? `${name}: ${sentence(s)}` : '';
const joinParts = (...parts) => parts.filter(Boolean).join(' ');

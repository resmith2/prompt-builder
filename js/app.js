/* Rendering and events. Knows nothing about individual skills. Loaded last. */

const $ = s => document.querySelector(s);
// Ready skills first, then coming soon; each group A to Z. Script tag order no longer matters.
SKILLS.sort((a, b) => (b.ready - a.ready) || a.name.localeCompare(b.name));
let skill = SKILLS.find(s => s.ready);
const modeOf = Object.fromEntries(SKILLS.filter(s => s.ready).map(s => [s.id, s.modes[0].id]));
const formOf = s => $(`form[data-skill="${s.id}"]`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fieldsOf = s => s.groups.flatMap(g => g.fields);
let currentText = '';

// Native radios: arrow keys, one Tab stop and correct announcements come for free. Rendered once.
function renderSkillPicker() {
  $('#skill-picker').innerHTML = SKILLS.filter(s => s.ready).map(s =>
    `<label class="pill relative"><input type="radio" name="skill" value="${s.id}" ${s === skill ? 'checked' : ''}><span>${esc(s.name)}</span></label>`
  ).join('');
  const soon = SKILLS.filter(s => !s.ready).map(s => s.name);
  $('#skills-soon').textContent = soon.length ? `Coming soon: ${soon.join(', ')}` : '';
}

function renderDocs() {
  $('#skill-docs').innerHTML = skill.docs
    ? `<a href="${esc(skill.docs)}" target="_blank" rel="noopener" class="hover:text-paper">${esc(skill.name)} docs</a>` : '';
}

// Modes with `step` are numbered (an ordered pipeline); `gate` marks an optional quality check.
function renderModes() {
  $('#mode-picker').innerHTML = skill.modes.map(m =>
    `<label class="seg relative"><input type="radio" name="mode" value="${m.id}" ${m.id === modeOf[skill.id] ? 'checked' : ''}><span>${m.step ? `${m.step}. ` : ''}${esc(m.label)}${m.gate ? '<i class="gate-dot" aria-hidden="true"></i><span class="sr-only"> (quality gate)</span>' : ''}</span></label>`
  ).join('');
  $('#mode-key').hidden = !skill.modes.some(m => m.gate);
  $('#next-step').hidden = true;
  showSelectedMode();
}

// On narrow screens the step row scrolls sideways; keep the selected step visible.
function showSelectedMode() {
  const row = $('#mode-picker');
  const pill = row.querySelector('input:checked')?.parentElement;
  if (!pill) return;
  const r = row.getBoundingClientRect(), p = pill.getBoundingClientRect();
  row.scrollLeft += (p.left - r.left) - (r.width - p.width) / 2;
  updateFade(row);
}

// Fade the edge of a sideways-scrolling row on whichever side still has hidden options.
function updateFade(row) {
  row.classList.toggle('fade-l', row.scrollLeft > 1);
  row.classList.toggle('fade-r', row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
}

function optionsHTML(f, s) {
  const opts = s[f.optionsFrom];
  const one = o => `<option value="${o.id}" ${o.id === f.value ? 'selected' : ''}>${esc(o.label)}</option>`;
  const groups = [...new Set(opts.map(o => o.group).filter(Boolean))];
  return groups.length
    ? groups.map(g => `<optgroup label="${esc(g)}">${opts.filter(o => o.group === g).map(one).join('')}</optgroup>`).join('')
    : opts.map(one).join('');
}

function fieldHTML(f, s) {
  const modes = f.modes === '*' ? '*' : f.modes.join(' ');
  const id = `f-${s.id}-${f.id}`;
  const hint = f.hint ? `<p class="mt-1.5 text-xs text-muted">${esc(f.hint)}</p>` : '';
  const note = f.preview ? `<p data-note id="${id}-note" class="mt-1.5 text-xs text-paper/80" hidden></p>` : '';
  const error = f.inputType === 'number' ? `<p data-error id="${id}-error" class="mt-1.5 text-xs text-danger" hidden></p>` : '';
  const described = [note && `${id}-note`, error && `${id}-error`].filter(Boolean).join(' ');
  const aria = described ? ` aria-describedby="${described}"` : '';
  const numberAttrs = f.inputType === 'number' ? ' min="1" max="10" step="1" inputmode="numeric"' : '';
  let control = '';
  if (f.type === 'text') control = `<input id="${id}" name="${f.id}" type="${f.inputType || 'text'}"${numberAttrs}${aria} class="field-input" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}"${f.list ? ` list="${id}-list"` : ''}>`
    + (f.list ? `<datalist id="${id}-list">${f.list.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : '');
  if (f.type === 'textarea') control = `<textarea id="${id}" name="${f.id}" rows="${f.rows || 3}" class="field-input resize-y" placeholder="${esc(f.placeholder || '')}"></textarea>`;
  if (f.type === 'select') control = `<select id="${id}" name="${f.id}" class="field-input">${optionsHTML(f, s)}</select>`;
  if (f.type === 'seg') control = `<div class="seg-row rounded-full border border-line bg-surface p-1" role="radiogroup" aria-labelledby="${id}">${f.options.map(([val, lab]) =>
      `<label class="seg relative"><input type="radio" name="${f.id}" value="${val}" ${val === f.value ? 'checked' : ''}><span>${esc(lab)}</span></label>`).join('')}</div>`;
  if (f.type === 'chips') control = `<div class="flex flex-wrap gap-2">${f.options.map(o =>
      `<label class="chip relative"><input type="checkbox" name="${f.id}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>
      <textarea name="${f.id}Other" rows="2" class="field-input mt-3 resize-y" placeholder="${esc(f.placeholder)}" aria-label="Other things to avoid"></textarea>`;

  // showWhen: { field, is: [values] } hides the field unless that other field holds one of the values
  const when = f.showWhen ? ` data-show-field="${f.showWhen.field}" data-show-is="${f.showWhen.is.join('|')}"` : '';
  const attrs = `data-field="${f.id}" data-modes="${modes}"${when}`;
  if (f.type === 'check') return `<div ${attrs}><label class="flex items-center gap-3 text-sm cursor-pointer"><input name="${f.id}" type="checkbox" ${f.value ? 'checked' : ''} class="w-4 h-4 accent-[#d8a55c]">${esc(f.label)}</label>${hint}</div>`;
  const labelTag = (f.type === 'seg' || f.type === 'chips') ? `<p id="${id}" class="block text-sm font-medium mb-2">${esc(f.label)}</p>` : `<label for="${id}" class="block text-sm font-medium mb-2">${esc(f.label)}</label>`;
  return `<div ${attrs}>${labelTag}${control}${hint}${note}${error}</div>`;
}

// `collapsible` groups (long optional briefs) fold into a details panel that counts what is filled.
function groupHTML(g, s) {
  const fields = g.fields.map(f => fieldHTML(f, s)).join('');
  return g.collapsible
    ? `<details data-group class="min-w-0 rounded-2xl border border-line bg-surface/40"><summary class="flex items-center justify-between gap-3 cursor-pointer rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"><span>${esc(g.title)} <span data-filled class="ml-1 text-xs font-normal text-muted"></span></span><i class="ph ph-caret-down caret text-muted" aria-hidden="true"></i></summary><div class="space-y-5 px-4 pb-5 pt-2">${fields}</div></details>`
    : `<fieldset data-group class="min-w-0 space-y-5"><legend class="text-xs uppercase tracking-[.18em] text-accent/80 mb-5">${esc(g.title)}</legend>${fields}</fieldset>`;
}

// One form per skill, rendered once, so switching skill or step never loses input.
function renderForms() {
  $('#forms').insertAdjacentHTML('beforeend', SKILLS.filter(s => s.ready).map(s =>
    `<form data-skill="${s.id}" class="space-y-10" autocomplete="off" onsubmit="return false">${s.groups.map(g => groupHTML(g, s)).join('')}</form>`
  ).join(''));
}

function applyMode() {
  document.querySelectorAll('#forms form').forEach(f => { f.hidden = f !== formOf(skill); });
  $('#mode-hint').textContent = skill.modes.find(m => m.id === modeOf[skill.id]).hint;
}

// Shows a field only when it is in this mode and its showWhen rule holds.
function applyVisibility(v) {
  const form = formOf(skill);
  const inMode = el => el.dataset.modes === '*' || el.dataset.modes.split(' ').includes(v.mode);
  form.querySelectorAll('[data-modes]').forEach(el => {
    let show = inMode(el);
    const dep = el.dataset.showField;
    const ctrl = dep && form.querySelector(`[data-field="${dep}"]`);
    // A rule only applies while its controlling field is part of this mode
    if (show && ctrl && inMode(ctrl)) show = el.dataset.showIs.split('|').includes(String(v[dep]));
    el.hidden = !show;
  });
  const groups = [...form.querySelectorAll('[data-group]')];
  groups.forEach(g => { g.hidden = ![...g.querySelectorAll('[data-modes]')].some(el => !el.hidden); });
  $('#no-input').hidden = groups.some(g => !g.hidden);
  form.querySelectorAll('details[data-group]').forEach(d => {
    const controls = [...d.querySelectorAll('[data-modes]:not([hidden])')].map(el => el.querySelector('input, textarea, select'));
    d.querySelector('[data-filled]').textContent = `${controls.filter(c => c?.value.trim()).length} of ${controls.length} filled`;
  });
}

// An out-of-range number shows an error and counts as empty, so it never reaches the output.
const numberOk = el => !el || el.type !== 'number' || el.validity.valid;

function checkNumbers(form) {
  form.querySelectorAll('input[type=number]').forEach(i => {
    const bad = !numberOk(i);
    i.setAttribute('aria-invalid', bad);
    const err = i.parentElement.querySelector('[data-error]');
    err.hidden = !bad;
    err.textContent = bad ? `Enter a whole number from ${i.min} to ${i.max}.` : '';
  });
}

function readValues(s = skill, mode = modeOf[s.id]) {
  const form = formOf(s);
  const fd = new FormData(form);
  const v = { mode };
  fieldsOf(s).forEach(f => {
    if (f.type === 'chips') {
      const other = (fd.get(`${f.id}Other`) || '').trim();
      v[f.id] = [...fd.getAll(f.id), ...(other ? [other] : [])];
    } else if (f.type === 'check') v[f.id] = fd.has(f.id);
    else v[f.id] = numberOk(form.elements[f.id]) ? fd.get(f.id) || '' : '';
  });
  return v;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
let missing = [];

// Only the slots this build left empty are marked; template placeholders like <restate> stay plain.
function renderOutput(text, mode) {
  currentText = text;
  let html = esc(text);
  missing.forEach(label => {
    const s = esc(`<${label}>`);
    html = html.split(s).join(`<mark class="slot">${s}</mark>`);
  });
  $('#prompt').innerHTML = html;
  // Soft-wrapped shell commands read as two lines; terminal steps scroll sideways instead
  $('#prompt').classList.toggle('nowrap', mode.wrap === 'off');
}

function update() {
  const form = formOf(skill);
  checkNumbers(form);
  const v = readValues();
  applyVisibility(v);
  fieldsOf(skill).filter(f => f.preview).forEach(f => {
    const note = form.querySelector(`[data-field="${f.id}"] [data-note]`);
    const text = f.preview(v[f.id]);
    note.hidden = !text;
    note.textContent = text || '';
  });
  emptySlots.length = 0;
  const text = skill.build(v, skill);
  missing = [...new Set(emptySlots)];
  const mode = skill.modes.find(m => m.id === v.mode);
  renderOutput(text, mode);
  $('#output-label').textContent = mode.outputLabel || skill.outputLabel || 'Prompt for your agent';
  $('#bar-summary').textContent = missing.length ? `${plural(missing.length, 'slot')} still empty. View output` : 'View output';
  $('#count').textContent = plural(text.trim().split(/\s+/).length, 'word');
  // Semicolons: some slot labels contain commas
  $('#slot-status').textContent = missing.length
    ? `${plural(missing.length, 'slot')} still empty: ${missing.join('; ')}. Fill ${missing.length === 1 ? 'it' : 'them'} in the form, or after pasting.`
    : 'Nothing left to fill.';
  document.querySelectorAll('.seg-row').forEach(updateFade);
}

function setMode(id) {
  modeOf[skill.id] = id;
  applyMode(); update(); showSelectedMode();
  $('#next-step').hidden = true;
}

renderSkillPicker();
renderDocs();
renderModes();
renderForms();
applyMode();
update();

$('#forms').addEventListener('input', update);
$('#mode-picker').addEventListener('change', e => setMode(e.target.value));
$('#skill-picker').addEventListener('change', e => {
  skill = SKILLS.find(s => s.id === e.target.value);
  renderModes(); renderDocs(); applyMode(); update();
});
document.addEventListener('scroll', e => { if (e.target.classList?.contains('seg-row')) updateFade(e.target); }, true);
addEventListener('resize', () => document.querySelectorAll('.seg-row').forEach(updateFade));

// After copying a step of an ordered skill, offer the next step.
$('#next-step').addEventListener('click', () => {
  const next = skill.modes[skill.modes.findIndex(m => m.id === modeOf[skill.id]) + 1];
  if (!next) return;
  $(`#mode-picker input[value="${next.id}"]`).checked = true;
  setMode(next.id);
});

document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const btn = b.querySelector('span');
  let ok = true;
  try { await navigator.clipboard.writeText(currentText); }
  catch {
    const range = document.createRange();
    range.selectNodeContents($('#prompt'));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    ok = document.execCommand('copy');
  }
  // Re-set to empty first so repeated copies are announced again
  $('#copy-status').textContent = '';
  $('#copy-status').textContent = !ok ? 'Copy failed. The prompt is selected; press Ctrl+C to copy it.'
    : missing.length ? `Copied, with ${plural(missing.length, 'empty slot')} to fill after pasting.` : 'Copied. Nothing left to fill.';
  btn.textContent = ok ? 'Copied' : 'Copy failed';
  setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  const i = skill.modes.findIndex(m => m.id === modeOf[skill.id]);
  const next = skill.modes[i + 1];
  if (ok && next && skill.modes.some(m => m.step)) {
    $('#next-step span').textContent = `Next: ${next.step ? `${next.step}. ` : ''}${next.label}`;
    $('#next-step').hidden = false;
  }
}));

// Below lg, the fixed copy bar steps aside while the output (with its own Copy) is on screen.
new IntersectionObserver(([e]) => { $('#copy-bar').hidden = e.isIntersecting; }).observe($('#output'));

/* Self-check: every step of every skill builds from its default form, with no em or en dashes.
   A skill can add its own checks with selfCheck(text, modeId, values). */
SKILLS.filter(s => s.ready).forEach(s => s.modes.forEach(m => {
  const v = readValues(s, m.id);
  const t = s.build(v, s);
  console.assert(t.trim(), `empty output for ${s.id}/${m.id}`);
  console.assert(![0x2013, 0x2014].some(c => t.includes(String.fromCharCode(c))), `dash found in ${s.id}/${m.id}`);
  s.selfCheck?.(t, m.id, v);
}));
// showWhen rules must point at a real field of the same skill
SKILLS.filter(s => s.ready).forEach(s => fieldsOf(s).filter(f => f.showWhen).forEach(f =>
  console.assert(fieldsOf(s).some(o => o.id === f.showWhen.field), `${s.id}/${f.id} showWhen points at a missing field`)));

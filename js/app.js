/* Rendering and events. Knows nothing about individual skills. Loaded last. */

const $ = s => document.querySelector(s);
let skill = SKILLS.find(s => s.ready);
const modeOf = Object.fromEntries(SKILLS.filter(s => s.ready).map(s => [s.id, s.modes[0].id]));
const formOf = s => $(`form[data-skill="${s.id}"]`);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Native radios: arrow keys, one Tab stop and correct announcements come for free. Rendered once.
function renderSkillPicker() {
  $('#skill-picker').innerHTML = SKILLS.filter(s => s.ready).map(s =>
    `<label class="pill relative"><input type="radio" name="skill" value="${s.id}" ${s === skill ? 'checked' : ''}><span>${esc(s.name)}</span></label>`
  ).join('');
  const soon = SKILLS.filter(s => !s.ready).map(s => s.name);
  $('#skills-soon').textContent = soon.length ? `Coming soon: ${soon.join(', ')}` : '';
  $('#skill-docs').innerHTML = SKILLS.filter(s => s.docs).map(s =>
    `<a href="${esc(s.docs)}" target="_blank" rel="noopener" class="hover:text-paper">${esc(s.name)} docs</a>`).join('');
}

function renderModes() {
  $('#mode-picker').innerHTML = skill.modes.map(m =>
    `<label class="seg relative"><input type="radio" name="mode" value="${m.id}" ${m.id === modeOf[skill.id] ? 'checked' : ''}><span>${esc(m.label)}</span></label>`
  ).join('');
}

function fieldHTML(f, s) {
  const modes = f.modes === '*' ? '*' : f.modes.join(' ');
  const hint = f.hint ? `<p class="mt-1.5 text-xs text-muted">${esc(f.hint)}</p>` : '';
  const id = `f-${s.id}-${f.id}`;
  let control = '';
  if (f.type === 'text') control = `<input id="${id}" name="${f.id}" type="text" class="field-input" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}"${f.list ? ` list="${id}-list"` : ''}>`
    + (f.list ? `<datalist id="${id}-list">${f.list.map(o => `<option value="${esc(o)}">`).join('')}</datalist>` : '');
  if (f.type === 'textarea') control = `<textarea id="${id}" name="${f.id}" rows="${f.rows || 3}" class="field-input resize-y" placeholder="${esc(f.placeholder || '')}"></textarea>`;
  if (f.type === 'select') control = `<select id="${id}" name="${f.id}" class="field-input">${s[f.optionsFrom].map(o => `<option value="${o.id}" ${o.id === f.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
  if (f.type === 'seg') control = `<div class="inline-flex flex-wrap rounded-full border border-line bg-surface p-1" role="radiogroup" aria-labelledby="${id}">${f.options.map(([val, lab]) =>
      `<label class="seg relative"><input type="radio" name="${f.id}" value="${val}" ${val === f.value ? 'checked' : ''}><span>${esc(lab)}</span></label>`).join('')}</div>`;
  if (f.type === 'chips') control = `<div class="flex flex-wrap gap-2">${f.options.map(o =>
      `<label class="chip relative"><input type="checkbox" name="${f.id}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>
      <textarea name="${f.id}Other" rows="2" class="field-input mt-3 resize-y" placeholder="${esc(f.placeholder)}" aria-label="Other things to avoid"></textarea>`;
  if (f.type === 'check') return `<div data-modes="${modes}"><label class="flex items-center gap-3 text-sm cursor-pointer"><input name="${f.id}" type="checkbox" ${f.value ? 'checked' : ''} class="w-4 h-4 accent-[#d8a55c]">${esc(f.label)}</label></div>`;

  const labelTag = (f.type === 'seg' || f.type === 'chips') ? `<p id="${id}" class="block text-sm font-medium mb-2">${esc(f.label)}</p>` : `<label for="${id}" class="block text-sm font-medium mb-2">${esc(f.label)}</label>`;
  return `<div data-modes="${modes}">${labelTag}${control}${hint}</div>`;
}

// One form per skill, rendered once, so switching skill or step never loses input.
function renderForms() {
  $('#forms').insertAdjacentHTML('beforeend', SKILLS.filter(s => s.ready).map(s =>
    `<form data-skill="${s.id}" class="space-y-10" autocomplete="off" onsubmit="return false">${s.groups.map(g =>
      `<fieldset data-group class="space-y-5"><legend class="text-xs uppercase tracking-[.18em] text-accent/80 mb-5">${esc(g.title)}</legend>${g.fields.map(f => fieldHTML(f, s)).join('')}</fieldset>`
    ).join('')}</form>`
  ).join(''));
}

function applyMode() {
  const mode = modeOf[skill.id];
  document.querySelectorAll('#forms form').forEach(f => { f.hidden = f !== formOf(skill); });
  formOf(skill).querySelectorAll('[data-modes]').forEach(el => {
    const m = el.dataset.modes;
    el.hidden = !(m === '*' || m.split(' ').includes(mode));
  });
  const groups = [...formOf(skill).querySelectorAll('[data-group]')];
  groups.forEach(g => {
    g.hidden = ![...g.querySelectorAll('[data-modes]')].some(el => !el.hidden);
  });
  $('#no-input').hidden = groups.some(g => !g.hidden);
  $('#mode-hint').textContent = skill.modes.find(m => m.id === mode).hint;
}

function readValues(s = skill, mode = modeOf[s.id]) {
  const fd = new FormData(formOf(s));
  const v = { mode };
  s.groups.flatMap(g => g.fields).forEach(f => {
    if (f.type === 'chips') {
      const other = (fd.get(`${f.id}Other`) || '').trim();
      v[f.id] = [...fd.getAll(f.id), ...(other ? [other] : [])];
    } else if (f.type === 'check') v[f.id] = fd.has(f.id);
    else v[f.id] = fd.get(f.id) || '';
  });
  return v;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
let missing = [];

function update() {
  emptySlots.length = 0;
  const text = skill.build(readValues(), skill);
  missing = [...new Set(emptySlots)];
  const mode = skill.modes.find(m => m.id === modeOf[skill.id]);
  $('#prompt').value = text;
  $('#output-label').textContent = mode.outputLabel || skill.outputLabel || 'Prompt for your agent';
  $('#count').textContent = plural(text.trim().split(/\s+/).length, 'word');
  // Semicolons: some slot labels contain commas
  $('#slot-status').textContent = missing.length
    ? `${plural(missing.length, 'slot')} still empty: ${missing.join('; ')}. Fill ${missing.length === 1 ? 'it' : 'them'} in the form, or after pasting.`
    : 'Nothing left to fill.';
}

renderSkillPicker();
renderModes();
renderForms();
applyMode();
update();

$('#forms').addEventListener('input', update);
$('#mode-picker').addEventListener('change', e => { modeOf[skill.id] = e.target.value; applyMode(); update(); });
$('#skill-picker').addEventListener('change', e => {
  skill = SKILLS.find(s => s.id === e.target.value);
  renderModes(); applyMode(); update();
});

$('#copy').addEventListener('click', async () => {
  const btn = $('#copy span');
  let ok = true;
  try { await navigator.clipboard.writeText($('#prompt').value); }
  catch { $('#prompt').select(); ok = document.execCommand('copy'); }
  // Re-set to empty first so repeated copies are announced again
  $('#copy-status').textContent = '';
  $('#copy-status').textContent = !ok ? 'Copy failed. The prompt is selected; press Ctrl+C to copy it.'
    : missing.length ? `Copied, with ${plural(missing.length, 'empty slot')} to fill after pasting.` : 'Copied. Nothing left to fill.';
  btn.textContent = ok ? 'Copied' : 'Copy failed';
  setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
});

/* Self-check: every step of every skill builds from its default form, with no em or en dashes.
   A skill can add its own checks with selfCheck(text, modeId, values). */
SKILLS.filter(s => s.ready).forEach(s => s.modes.forEach(m => {
  const v = readValues(s, m.id);
  const t = s.build(v, s);
  console.assert(t.trim(), `empty output for ${s.id}/${m.id}`);
  console.assert(![0x2013, 0x2014].some(c => t.includes(String.fromCharCode(c))), `dash found in ${s.id}/${m.id}`);
  s.selfCheck?.(t, m.id, v);
}));

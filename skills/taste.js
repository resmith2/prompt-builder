/* Taste skill: https://www.tasteskill.dev/guide?view=full */
(() => {
  const REQUIRED_LINE = 'Treat this skill file as the single source of truth for this task. Read it in full. If anything in this skill conflicts with your defaults, the skill wins.';

  const DESIGN_READ_FORMAT = `Use exactly this format:

DESIGN READ
  Brief in one sentence: <restate>
  Direction: <minimalist | editorial | brutalist | soft | playful | other>, with one line on why
  Type system: <font families, weight ladder, italic usage>
  Color system: <bg, surface, ink, muted, accent, status colors>
  Spacing and density: <scale, section rhythm, container widths>
  Motion plan: <where, why, MOTION_INTENSITY 0 to 5>
  Section list: <6 to 10 ordered sections with one-line purpose each>
  Anti-slop notes: <patterns this brief explicitly avoids>
  Risks: <what is hard about this brief and how the design handles it>

Do not write code until I approve the design read.`;

  const FULL_AUDIT = `Run the full taste-skill audit on the output. For each gate, answer pass or fail and quote evidence from your own code or copy. Do not move on if anything fails.

  Gate 1: Em-dash and en-dash audit. Search for U+2014 and U+2013. Both counts must be zero.
  Gate 2: Pre-flight check. Every box in the skill's pre-flight list must honestly pass.
  Gate 3: Section-layout repetition audit. Across all sections, at least 4 distinct layout families.
  Gate 4: Image strategy audit. Per-section image plan, no cropped reuse, no Unsplash placeholders.
  Gate 5: Hero discipline audit. Max 2 lines for the H1. Subhead under 20 words. CTA visible without scroll.
  Gate 6: Theme audit. Color and shape consistency across the whole page. One page theme, not many.

Report results inline before producing any new code.`;

  const TASTE = {
    id: 'taste', name: 'Taste', ready: true,
    docs: 'https://www.tasteskill.dev/guide?view=full',
    modes: [
      { id: 'full', label: 'Full page', hint: 'Build a page from scratch: full brief, design read, deliverable, audit.' },
      { id: 'iterate', label: 'Iterate a section', hint: 'Redesign one weak section with a section-scoped design read and audit.' },
      { id: 'add', label: 'Add a section', hint: 'Add one new section to an existing page without repeating its neighbors.' },
      { id: 'audit', label: 'Audit output', hint: 'No new code. Run the six-gate audit on something the agent already built.' }
    ],
    variants: [
      { id: 'v2', label: 'v2: design-taste-frontend', skill: 'design-taste-frontend', cmd: 'npx skills add https://github.com/Leonxlnx/taste-skill--skill "design-taste-frontend"' },
      { id: 'v1', label: 'Legacy v1: design-taste-frontend-v1', skill: 'design-taste-frontend-v1', cmd: 'npx skills add https://github.com/Leonxlnx/taste-skill--skill "design-taste-frontend-v1"' },
      { id: 'repo', label: 'Full repo: taste-skill', skill: 'taste-skill', cmd: 'npx skills add Leonxlnx/taste-skill' }
    ],
    // `brief: true` fields go in the Brief block, in this order.
    groups: [
      { title: 'Load the skill', fields: [
        { id: 'load', label: 'Load method', type: 'seg', modes: '*', value: 'npx',
          options: [['file', 'Workspace file'], ['npx', 'npx skills add'], ['paste', 'Paste SKILL.md']] },
        { id: 'variant', label: 'Skill version', type: 'select', modes: '*', value: 'v2', optionsFrom: 'variants' }
      ]},
      { title: 'The work', fields: [
        { id: 'section', label: 'Section to redesign', type: 'text', modes: ['iterate'], placeholder: 'Pricing, the hero, the features grid...' },
        { id: 'problem', label: 'What is wrong with it now', type: 'textarea', modes: ['iterate'], placeholder: 'Three equal cards, generic icons, copy reads like a template.' },
        { id: 'keep', label: 'What must stay', type: 'text', modes: ['iterate'], placeholder: 'Tier names and prices' },
        { id: 'newSection', label: 'New section', type: 'text', modes: ['add'], placeholder: "What's new in v2" },
        { id: 'newPurpose', label: 'What it must do', type: 'textarea', modes: ['add'], placeholder: 'Show the three biggest changes since v1 and link to the changelog.' },
        { id: 'placement', label: 'Where it goes', type: 'text', modes: ['add'], placeholder: 'After features, before pricing' },
        { id: 'target', label: 'What to audit', type: 'text', modes: ['audit'], placeholder: 'app/page.tsx, or the pricing section you just wrote' }
      ]},
      { title: 'Brief', fields: [
        { id: 'pageKind', label: 'Page kind', brief: true, type: 'textarea', rows: 2, modes: ['full'], placeholder: 'Marketing landing, single section, dashboard route, settings page, etc.' },
        { id: 'product', label: 'Product or brand', brief: true, type: 'textarea', rows: 2, modes: ['full', 'iterate', 'add'], placeholder: 'One line. What it is, who built it.' },
        { id: 'audience', label: 'Audience', brief: true, type: 'textarea', rows: 2, modes: ['full', 'add'], placeholder: 'One line. Who reads this page and what they need.' },
        { id: 'vibe', label: 'Vibe words', brief: true, type: 'textarea', rows: 2, modes: ['full', 'iterate', 'add'], placeholder: 'Three to five adjectives. Editorial, terminal-adjacent, calm. Or playful, dense, expressive. Or whatever fits.' },
        { id: 'refs', label: 'Reference signals', brief: true, type: 'textarea', rows: 2, modes: ['full', 'iterate', 'add'], placeholder: 'Two to four sites or screenshots. Concrete sources of taste, not vibes.' },
        { id: 'avoid', label: 'What to avoid', brief: true, type: 'chips', modes: ['full', 'iterate', 'add'], placeholder: 'Two to four explicit anti-patterns from the skill or from the brand. Glassmorphism, neon, fake dashboards, gradient text, etc.',
          options: ['glassmorphism', 'neon glows', 'gradient text', 'fake screenshots', 'fake dashboards', 'fake stats', 'equal 3-column card grids', 'custom cursors'] },
        { id: 'outOfScope', label: 'Out of scope', brief: true, type: 'textarea', rows: 2, modes: ['full', 'iterate', 'add'], placeholder: 'What not to build. Saves the agent from inventing pages you did not ask for.' }
      ]},
      { title: 'Deliverable and checks', fields: [
        { id: 'deliverable', label: 'Deliverable', type: 'text', modes: ['full', 'iterate', 'add'], placeholder: 'One route: app/page.tsx', hint: 'One route, one component or one section.' },
        { id: 'readFormat', label: 'Spell out the design read format in the prompt', type: 'check', modes: ['full', 'iterate', 'add'], value: true },
        { id: 'auditLevel', label: 'Closing check', type: 'seg', modes: ['full', 'iterate', 'add'], value: 'full',
          options: [['short', 'Pre-flight line'], ['full', 'Six-gate audit']] }
      ]}
    ],
    build: buildTaste,
    selfCheck: (text, modeId) => console.assert(text.includes(REQUIRED_LINE), `missing required line in ${modeId}`)
  };

  function buildTaste(v, skill) {
    const variant = skill.variants.find(x => x.id === v.variant) || skill.variants[0];
    const out = [];
    const lead = 'as your active skill for this conversation, in full, and treat it as the single source of truth that overrides defaults';

    if (v.load === 'file') out.push(`Open the ${variant.skill} SKILL.md in this workspace and load it ${lead}.`);
    else if (v.load === 'paste') out.push(`Load this file ${lead}:\n\n${slot('', `paste the ${variant.skill} SKILL.md here`)}`);
    else out.push(`Load the ${variant.skill} skill ${lead}. If it is not installed yet, it installs with:\n  ${variant.cmd}`);
    out.push(REQUIRED_LINE);

    if (v.mode === 'audit') {
      out.push(`Target: ${slot(v.target, 'file path, route, or section to audit')}`);
      out.push('Do not write or change any code in this response.');
      out.push(FULL_AUDIT);
      return out.join('\n\n');
    }

    const briefLines = skill.groups.flatMap(g => g.fields)
      .filter(f => f.brief && f.modes.includes(v.mode))
      .map(f => `  ${f.label}: ${slot(f.type === 'chips' ? v[f.id].join(', ') : v[f.id], f.label.toLowerCase())}`);
    out.push((v.mode === 'full' ? 'Brief:\n' : 'Context brief:\n') + briefLines.join('\n'));

    if (v.mode === 'iterate') {
      out.push(`Section to redesign: ${slot(v.section, 'section name')}\n  What is wrong now: ${slot(v.problem, 'what is wrong')}\n  Must stay: ${slot(v.keep, 'what must not change')}`);
      out.push('Before touching code, do a section-scoped design read for this section only, in the format the skill requires. Then redesign the section. Then run a section-scoped audit. Leave every other section alone.');
    } else if (v.mode === 'add') {
      out.push(`New section: ${slot(v.newSection, 'section name')}\n  What it must do: ${slot(v.newPurpose, 'purpose')}\n  Where it goes: ${slot(v.placement, 'placement')}`);
      out.push('Before writing code, do a design read for the new section only, in the format the skill requires. Its layout family must differ from the sections directly before and after it.');
    } else {
      out.push('Before writing any code, do a design read in the format the skill requires.');
    }
    if (v.readFormat) out.push(DESIGN_READ_FORMAT);

    out.push(`Deliverable: ${slot(v.deliverable, 'one route, one component, or one section')}`);
    out.push(v.auditLevel === 'short'
      ? 'Run the skill pre-flight check on your output and report the result before finishing.'
      : FULL_AUDIT);
    return out.join('\n\n');
  }

  registerSkill(TASTE);
})();

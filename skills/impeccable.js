/* Impeccable skill: commands from the installed SKILL.md and https://impeccable.style/docs/ */
(() => {
  const IMPECCABLE = {
    id: 'impeccable', name: 'Impeccable', ready: true,
    docs: 'https://impeccable.style/docs/',
    outputLabel: 'Command for your agent chat',
    modes: [
      { id: 'setup', label: 'Setup', outputLabel: 'Terminal, then agent chat', wrap: 'off', hint: 'Install once in your terminal, then run init in your agent chat to write PRODUCT.md. document records an existing visual system in DESIGN.md.' },
      { id: 'build', label: 'Build new', hint: 'Describe the outcome in plain words; no sub-command needed. Shape first returns a design brief and writes no code.' },
      { id: 'improve', label: 'Improve', hint: 'One focused pass on a named page, route or file. Refinement keeps what already works.' },
      { id: 'evaluate', label: 'Evaluate', hint: 'critique reviews the design and what holds it back. audit checks accessibility, performance and responsive behavior.' },
      { id: 'system', label: 'Design system', hint: 'document writes DESIGN.md from your code. extract pulls repeated patterns into shared components and tokens.' },
      { id: 'variations', label: 'Variations', hint: 'Web only, needs a running dev server. generate makes variants of a named element; live lets you pick elements in the browser.' },
      { id: 'maintenance', label: 'Maintenance', hint: 'doctor finds stale context files and broken hooks. hooks controls the automatic design detector.' }
    ],
    improveCommands: [
      { id: 'polish', label: 'polish: final quality pass before shipping' },
      { id: 'bolder', label: 'bolder: more presence for safe or bland designs' },
      { id: 'quieter', label: 'quieter: tone down loud or busy designs' },
      { id: 'distill', label: 'distill: strip to essence, remove clutter' },
      { id: 'layout', label: 'layout: spacing, rhythm and visual hierarchy' },
      { id: 'typeset', label: 'typeset: typography hierarchy and fonts' },
      { id: 'colorize', label: 'colorize: strategic color for flat or gray UIs' },
      { id: 'animate', label: 'animate: purposeful motion and micro-interactions' },
      { id: 'delight', label: 'delight: personality and memorable touches' },
      { id: 'overdrive', label: 'overdrive: push past conventional limits' },
      { id: 'clarify', label: 'clarify: UX copy, labels and error messages' },
      { id: 'adapt', label: 'adapt: other screen sizes, devices or platforms' },
      { id: 'harden', label: 'harden: errors, i18n and edge cases' },
      { id: 'onboard', label: 'onboard: first-run flows and empty states' },
      { id: 'optimize', label: 'optimize: diagnose and fix UI performance' }
    ],
    groups: [
      { title: 'Agent', fields: [
        { id: 'prefix', label: 'Command syntax', type: 'seg', modes: '*', value: '/',
          options: [['/', 'Most agents: /impeccable'], ['$', 'Codex: $impeccable']] }
      ]},
      { title: 'Install', fields: [
        { id: 'install', label: 'Install with', type: 'seg', modes: ['setup'], value: 'impeccable',
          options: [['impeccable', 'npx impeccable install'], ['skills', 'npx skills add']], hint: 'In the GitHub Copilot app it is built in: enable it under Settings, Experimental.' },
        { id: 'document', label: 'Project already has UI code (also run document for DESIGN.md)', type: 'check', modes: ['setup'] }
      ]},
      { title: 'What to build', fields: [
        { id: 'what', label: 'What to build', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'design a signup page for our monthly book club' },
        { id: 'shapeFirst', label: 'Shape first: return a design brief, no code yet', type: 'check', modes: ['build'] },
        { id: 'surface', label: 'Surface mode', type: 'seg', modes: ['build'], value: '',
          options: [['', 'Let it decide'], ['Persuade', 'Persuade'], ['Operate', 'Operate'], ['Read', 'Read'], ['Experience', 'Experience']],
          hint: 'Persuade: landing, pricing. Operate: app, dashboard, settings. Read: docs, articles. Experience: portfolio, gallery.' },
        { id: 'mockup', label: 'Approach', type: 'seg', modes: ['build'], value: 'code',
          options: [['code', 'Build directly'], ['mockup', 'Mockup first']], hint: 'Mockup first allows bolder directions but needs image generation in your agent.' }
      ]},
      { title: 'Brief (all optional)', fields: [
        { id: 'purpose', label: 'What it is for', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'The problem this surface must solve.' },
        { id: 'who', label: 'Who arrives', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'Who reaches it, in what situation and state of mind.' },
        { id: 'success', label: 'Primary action and success', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'The one thing they must understand or do, and what success looks like.' },
        { id: 'unique', label: 'What is uniquely true', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'What a neighboring product or a template could not claim.' },
        { id: 'content', label: 'Real content and data', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'Copy, evidence, data and assets it must carry, with realistic ranges.' },
        { id: 'states', label: 'States that matter', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'First-run, empty, loading, error, success, permissions...' },
        { id: 'untouched', label: 'Keep untouched', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'What must not change, and what would feel wrong even if polished.' },
        { id: 'constraints', label: 'Constraints', type: 'textarea', rows: 2, modes: ['build'], placeholder: 'Platform, framework, performance, accessibility, localization.' }
      ]},
      { title: 'Command', fields: [
        { id: 'improveCmd', label: 'Pass', type: 'select', modes: ['improve'], value: 'polish', optionsFrom: 'improveCommands' },
        { id: 'evalCmd', label: 'Review', type: 'seg', modes: ['evaluate'], value: 'critique',
          options: [['critique', 'critique: design review'], ['audit', 'audit: technical checks']] },
        { id: 'systemCmd', label: 'Action', type: 'seg', modes: ['system'], value: 'document',
          options: [['document', 'document'], ['extract', 'extract']] },
        { id: 'varCmd', label: 'Action', type: 'seg', modes: ['variations'], value: 'generate',
          options: [['generate', 'generate'], ['live', 'live']] },
        { id: 'maintCmd', label: 'Action', type: 'seg', modes: ['maintenance'], value: 'doctor',
          options: [['doctor', 'doctor'], ['hooks on', 'hooks on'], ['hooks off', 'hooks off'], ['hooks status', 'hooks status']] }
      ]},
      { title: 'Target', fields: [
        { id: 'target', label: 'Target', type: 'text', modes: ['improve', 'evaluate', 'system'], placeholder: 'the pricing page', hint: 'A page, route, component or file. Not used by document.' },
        { id: 'context', label: 'Context (adapt only)', type: 'text', modes: ['improve'], placeholder: 'mobile, tablet, print...' },
        { id: 'problem', label: 'What feels wrong (optional)', type: 'textarea', rows: 2, modes: ['improve', 'evaluate'], placeholder: 'The cards all look the same and the main plan does not stand out.' },
        { id: 'keep', label: 'What to keep (optional)', type: 'textarea', rows: 2, modes: ['improve'], placeholder: 'Tier names, prices and the current color palette.' }
      ]},
      { title: 'Variants', fields: [
        { id: 'count', label: 'How many', type: 'text', modes: ['variations'], value: '3', hint: 'Not used by live.' },
        { id: 'direction', label: 'Direction', type: 'text', modes: ['variations'], placeholder: 'bold' },
        { id: 'element', label: 'Element', type: 'text', modes: ['variations'], placeholder: 'the pricing cards' }
      ]}
    ],
    build: buildImpeccable,
    selfCheck: (text, modeId, values) => {
      if (modeId === 'setup') return console.assert(text.includes('/impeccable init'), 'setup missing init');
      console.assert(text.startsWith('/impeccable'), `wrong prefix for ${modeId}`);
      if (modeId === 'variations') console.assert(text === '/impeccable generate 3 <direction> variants of <element>', `generate format: ${text}`);
      if (modeId === 'build') console.assert(buildImpeccable({ ...values, prefix: '$' }).startsWith('$impeccable '), 'Codex prefix not applied');
    }
  };

  function buildImpeccable(v) {
    const cmd = `${v.prefix || '/'}impeccable`;
    switch (v.mode) {
      case 'setup': {
        const lines = ['# In your terminal', v.install === 'skills' ? 'npx skills add pbakaus/impeccable' : 'npx impeccable install',
          '', '# Then in your agent chat', `${cmd} init`];
        if (v.document) lines.push(`${cmd} document`);
        return lines.join('\n');
      }
      case 'build': {
        const first = `${cmd} ${v.shapeFirst ? 'shape ' : ''}${slot(v.what, 'what to build')}`;
        const brief = [['For', v.purpose], ['Who arrives', v.who], ['Primary action and success', v.success], ['Uniquely true', v.unique],
          ['Real content', v.content], ['States that matter', v.states], ['Keep untouched', v.untouched], ['Constraints', v.constraints],
          ['Surface mode', v.surface]].map(([k, val]) => labeled(k, val)).filter(Boolean);
        const parts = [first];
        if (brief.length) parts.push(brief.map(l => `  ${l}`).join('\n'));
        if (v.mockup === 'mockup' && !v.shapeFirst) parts.push('Mockup first: show me an image comp of the direction before writing code.');
        return parts.join('\n\n');
      }
      case 'improve':
        return joinParts(`${cmd} ${v.improveCmd} ${slot(v.target, 'target')}`,
          v.improveCmd === 'adapt' && v.context.trim() && `for ${v.context.trim()}.`,
          labeled('What feels wrong', v.problem), labeled('Keep', v.keep));
      case 'evaluate':
        return joinParts(`${cmd} ${v.evalCmd} ${slot(v.target, 'target')}`, labeled('Focus on', v.problem));
      case 'system':
        return v.systemCmd === 'document' ? `${cmd} document` : joinParts(`${cmd} extract`, v.target.trim());
      case 'variations':
        return v.varCmd === 'live' ? `${cmd} live`
          : `${cmd} generate ${slot(v.count, 'count')} ${slot(v.direction, 'direction')} variants of ${slot(v.element, 'element')}`;
      default:
        return `${cmd} ${v.maintCmd}`;
    }
  }

  registerSkill(IMPECCABLE);
})();

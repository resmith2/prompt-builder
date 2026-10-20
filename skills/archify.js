/* Archify skill: https://github.com/tt-a1i/archify and https://archify.si/guide */
(() => {
  const ARCHIFY = {
    id: 'archify', name: 'Archify', ready: true,
    docs: 'https://archify.si/guide',
    modes: [
      { id: 'setup', label: 'Setup', outputLabel: 'Terminal commands', wrap: 'off', hint: 'Runs in your terminal. Installs the skill for Claude Code, Codex CLI, Cursor or opencode. Needs Node.js.' },
      { id: 'describe', label: 'Describe', hint: 'A diagram from your own description. No repository needed. Say what it must explain, not just the diagram type.' },
      { id: 'code', label: 'From code', hint: 'Traces a repository in source first, then draws how it actually runs.' },
      { id: 'explainer', label: 'Explainer', hint: 'One page that answers a question: the conclusion first, then one panel per question, with sources and diagrams.' },
      { id: 'refine', label: 'Refine', hint: 'Change a diagram Archify already made. It edits the candidate file and reruns finalize.' }
    ],
    types: [
      { id: '', label: 'Let Archify choose' },
      ...['architecture', 'workflow', 'sequence', 'dataflow', 'lifecycle', 'erd', 'class', 'tree', 'timeline', 'waterfall'].map(t => ({ id: t, label: t }))
    ],
    groups: [
      { title: 'Install', fields: [
        { id: 'agent', label: 'Coding agent', type: 'seg', modes: ['setup'], value: '',
          options: [['', 'Ask me'], ['claude-code', 'Claude Code'], ['codex', 'Codex'], ['cursor', 'Cursor'], ['opencode', 'opencode']],
          hint: 'Ask me runs the interactive installer. Picking an agent installs for it without prompts.' },
        { id: 'tryOnly', label: 'Try it without installing', type: 'check', modes: ['setup'] }
      ]},
      { title: 'The diagram', fields: [
        { id: 'type', label: 'Diagram type', type: 'select', modes: ['describe', 'code'], value: '', optionsFrom: 'types' },
        { id: 'explain', label: 'What it must explain', type: 'textarea', modes: ['describe'], placeholder: 'How a web request is served when the cache misses.' },
        { id: 'details', label: 'The parts and how they connect', type: 'textarea', modes: ['describe'], placeholder: 'The browser calls the API. The API checks Redis. On a cache miss it queries PostgreSQL and fills the cache.' },
        { id: 'scope', label: 'Repository or folder', type: 'text', modes: ['code'], placeholder: 'this repository, or services/api' },
        { id: 'components', label: 'Core components', type: 'text', modes: ['code'], value: '8 to 12' },
        { id: 'path', label: 'Primary path to show (optional)', type: 'text', modes: ['code'], placeholder: 'A user checkout, from the cart to the payment provider' },
        { id: 'question', label: 'Question to answer', type: 'textarea', modes: ['explainer'], placeholder: 'Why did P99 latency rise after the last deploy?' },
        { id: 'context', label: 'Context or sources (optional)', type: 'textarea', rows: 2, modes: ['explainer'], placeholder: 'The deploy diff, the latency dashboard export, and the service logs in logs/.' },
        { id: 'target', label: 'Diagram to change', type: 'text', modes: ['refine'], placeholder: '.archify/architecture-checkout-20261020-101500/' },
        { id: 'changes', label: 'What to change', type: 'textarea', modes: ['refine'], placeholder: 'Add the email worker. Highlight the payment path. Switch to the light theme.' }
      ]},
      { title: 'Look', fields: [
        { id: 'audience', label: 'Audience (optional)', type: 'text', modes: ['describe', 'code', 'explainer'], placeholder: 'New engineers on the team' },
        { id: 'theme', label: 'Theme', type: 'seg', modes: ['describe', 'code', 'explainer'], value: '',
          options: [['', 'Default'], ['dark', 'Dark'], ['light', 'Light']] }
      ]}
    ],
    build: buildArchify,
    selfCheck: (text, modeId, values) => {
      if (modeId === 'setup') {
        console.assert(buildArchify({ ...values, agent: 'cursor' }).includes('--agent cursor'), 'agent flag missing');
        return;
      }
      console.assert(text.startsWith('Use the archify skill'), `skill not named in ${modeId}`);
    }
  };

  function buildArchify(v) {
    const typeName = v.type ? `${v.type} diagram` : 'diagram';
    const pickType = v.type ? '' : 'Pick the diagram type that best fits what it must explain.';
    const look = joinParts(labeled('Audience', v.audience), v.theme && `Use the ${v.theme} theme.`);
    switch (v.mode) {
      case 'setup':
        if (v.tryOnly) return `npx skills use tt-a1i/archify@archify --agent ${v.agent || 'claude-code'}`;
        return v.agent
          ? `npx -y skills add tt-a1i/archify --skill archify --agent ${v.agent} --global --yes`
          : 'npx skills add tt-a1i/archify -g';
      case 'describe':
        return joinParts(`Use the archify skill to make a ${typeName}.`, pickType,
          `It must explain: ${sentence(slot(v.explain, 'what the diagram must explain'))}`,
          labeled('The parts and how they connect', v.details),
          look, 'If a fact you need is missing, ask me instead of inventing it.');
      case 'code':
        return joinParts(`Use the archify skill. Analyze ${slot(v.scope, 'repository or folder')} and build a high-level runtime ${typeName}`,
          `with ${slot(v.components, 'number of')} core components, one primary path, external dependencies and trust boundaries.`,
          labeled('Primary path', v.path), pickType && 'Pick the diagram type that best fits the code.',
          'Trace the behavior in source before you draw it.', look);
      case 'explainer':
        return joinParts(`Use the archify skill to answer this as one page: ${sentence(slot(v.question, 'question'))}`,
          'Lead with the conclusion, then one panel per question, with sources and diagrams.',
          labeled('Context', v.context), look);
      case 'refine':
        return joinParts(`Use the archify skill to change the diagram in ${slot(v.target, 'diagram folder or HTML file')}.`,
          `Changes: ${sentence(slot(v.changes, 'what to change'))}`,
          'Edit the candidate file and rerun finalize, then link the new HTML.');
    }
  }

  registerSkill(ARCHIFY);
})();

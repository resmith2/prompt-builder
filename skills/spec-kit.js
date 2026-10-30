/* Spec-Kit skill: steps follow https://github.github.com/spec-kit/quickstart.html (full path) */
(() => {
  const SPEC_KIT = {
    id: 'spec-kit', name: 'Spec-Kit', ready: true,
    docs: 'https://github.github.com/spec-kit/quickstart.html',
    outputLabel: 'Command for your agent chat',
    modes: [
      { id: 'setup', label: 'Setup', outputLabel: 'Terminal commands', wrap: 'off', hint: 'Runs in your terminal, not agent chat. Installs the specify CLI (needs uv) and initializes the project.' },
      { id: 'constitution', label: 'Constitution', step: 1, hint: 'Once per project. The ground rules every later step is checked against.' },
      { id: 'specify', label: 'Specify', step: 2, hint: 'What to build and why. Leave the tech stack for the plan.' },
      { id: 'clarify', label: 'Clarify', step: 3, gate: true, hint: 'Quality gate. Asks targeted questions about gaps and folds the answers into the spec. Run it before planning.' },
      { id: 'plan', label: 'Plan', step: 4, hint: 'The tech stack and architecture go here, not in the spec.' },
      { id: 'checklist', label: 'Checklist', step: 5, gate: true, hint: 'Quality gate. Generates a requirements-quality checklist. Tick items only once a reviewer agrees they hold.' },
      { id: 'tasks', label: 'Tasks', step: 6, hint: 'Breaks the design into a dependency-ordered tasks.md.' },
      { id: 'analyze', label: 'Analyze', step: 7, gate: true, hint: 'Quality gate. Read-only check across spec, plan and tasks. Fix issues at the source and re-run.' },
      { id: 'implement', label: 'Implement', step: 8, hint: 'Runs tasks.md in dependency order. Scope it to one phase for large features.' },
      { id: 'converge', label: 'Converge', step: 9, hint: 'Checks the code against spec, plan and tasks. Repeat implement and converge until it reports Converged.' }
    ],
    groups: [
      { title: 'Project', fields: [
        { id: 'existing', label: 'Project type', type: 'seg', modes: ['setup'], value: 'new',
          options: [['new', 'New project'], ['existing', 'Existing repository']],
          hint: 'Existing repository runs init with --force, which can replace files Spec Kit manages. Commit or stash first.' },
        { id: 'project', label: 'Project name', type: 'text', modes: ['setup'], placeholder: 'taskify', hint: 'Becomes the folder name.',
          showWhen: { field: 'existing', is: ['new'] }, preview: name => previewName(name) },
        { id: 'integration', label: 'Coding agent (--integration key)', type: 'text', modes: ['setup'], value: 'claude',
          list: ['claude', 'copilot', 'gemini', 'cursor-agent', 'codex', 'windsurf', 'opencode', 'qwen'], hint: 'Run specify init --help for the full list.' },
        { id: 'script', label: 'Script variant', type: 'seg', modes: ['setup'], value: '',
          options: [['', 'OS default'], ['sh', 'Bash'], ['ps', 'PowerShell'], ['py', 'Python']] },
        { id: 'nonInteractive', label: 'Non-interactive (CI or agent harness)', type: 'check', modes: ['setup'] },
        { id: 'gitExt', label: 'Add the git extension (numbered feature branches)', type: 'check', modes: ['setup'] }
      ]},
      { title: 'Ground rules', fields: [
        { id: 'principles', label: 'Core principles', type: 'textarea', rows: 2, modes: ['constitution'], placeholder: 'Security-first. All user inputs must be validated.' },
        { id: 'architecture', label: 'Architecture rules', type: 'textarea', rows: 2, modes: ['constitution'], placeholder: 'Microservices architecture. Follow the existing service boundaries.' },
        { id: 'testing', label: 'Testing rules', type: 'textarea', rows: 2, modes: ['constitution'], placeholder: 'Run the established unit and integration test suites.' },
        { id: 'standards', label: 'Code standards', type: 'textarea', rows: 2, modes: ['constitution'], placeholder: 'Code must be fully documented.' }
      ]},
      { title: 'The feature', fields: [
        { id: 'what', label: 'What you are building and why', type: 'textarea', modes: ['specify'], placeholder: 'Taskify, a team productivity platform where users create projects, assign tasks, comment, and move tasks across Kanban columns.' },
        { id: 'users', label: 'Who uses it', type: 'textarea', rows: 2, modes: ['specify'], placeholder: 'One product manager and four engineers, predefined.' },
        { id: 'behaviors', label: 'Key behaviors', type: 'textarea', rows: 2, modes: ['specify'], placeholder: 'Drag tasks between To Do, In Progress, In Review and Done. Comment on any task.' },
        { id: 'data', label: 'Sample data or scale', type: 'textarea', rows: 2, modes: ['specify'], placeholder: 'Three sample projects.' },
        { id: 'boundaries', label: 'Must not change', type: 'textarea', rows: 2, modes: ['specify'], placeholder: 'Existing code only: behavior, APIs or permissions that must stay intact.' },
        { id: 'notNow', label: 'Not in this phase', type: 'textarea', rows: 2, modes: ['specify'], placeholder: 'Login, notifications.' }
      ]},
      { title: 'Focus', fields: [
        { id: 'focus', label: 'Focus area (optional)', type: 'textarea', rows: 2, modes: ['clarify'], placeholder: 'Focus on task card behavior: status changes, comment permissions, and user assignment.' }
      ]},
      { title: 'Tech stack', fields: [
        { id: 'stack', label: 'Backend and data', type: 'textarea', rows: 2, modes: ['plan'], placeholder: '.NET Aspire with Postgres' },
        { id: 'frontend', label: 'Frontend', type: 'textarea', rows: 2, modes: ['plan'], placeholder: 'Blazor Server with drag-and-drop boards and real-time updates' },
        { id: 'apis', label: 'APIs and integrations', type: 'textarea', rows: 2, modes: ['plan'], placeholder: 'REST APIs for projects, tasks and notifications' },
        { id: 'constraints', label: 'Constraints', type: 'textarea', rows: 2, modes: ['plan'], placeholder: 'Reuse the existing architecture, dependencies and test conventions.' }
      ]},
      { title: 'Scope', fields: [
        { id: 'phase', label: 'Phase to implement (optional)', type: 'text', modes: ['implement'], placeholder: 'Phase 1 only', hint: 'Leave blank to build everything.' }
      ]}
    ],
    build: buildSpecKit,
    selfCheck: (text, modeId, values) => {
      if (modeId !== 'setup') return console.assert(text.startsWith(`/speckit-${modeId}`), `wrong command for ${modeId}`);
      console.assert(buildSpecKit({ ...values, project: ' task  board ' }).includes('specify init task-board '), 'project name with spaces not hyphenated');
      console.assert(buildSpecKit({ ...values, project: 'My App & "x"; rm' }).includes('specify init My-App-x-rm '), 'project name not shell-safe');
      emptySlots.length = 0;
      buildSpecKit({ ...values, existing: 'existing', project: '' });
      console.assert(!emptySlots.length, 'existing repository reports a project-name slot');
      console.assert(previewName('My App') === 'Will be created as My-App' && previewName('ok') === '', 'name preview wrong');
    }
  };

  // Spaces and shell metacharacters (& ; " $ ...) would break or change the command; keep a safe folder name
  const safeName = s => (s || '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  function previewName(raw) {
    const name = safeName(raw);
    if (!(raw || '').trim() || name === raw.trim()) return '';
    return name ? `Will be created as ${name}` : 'No usable characters. Use letters, digits, dot, dash or underscore.';
  }

  function buildSpecKit(v) {
    switch (v.mode) {
      case 'setup': {
        const flags = joinParts(`--integration ${slot(v.integration, 'agent key')}`, v.script && `--script ${v.script}`, v.nonInteractive && '--non-interactive');
        if (v.existing === 'existing') {
          const lines = ['# From the repository root, after committing or stashing your work', 'uv tool install specify-cli', `specify init --here --force ${flags}`];
          if (v.gitExt) lines.push('specify extension add git');
          return lines.join('\n');
        }
        const name = slot(safeName(v.project), 'project-name');
        const lines = ['uv tool install specify-cli', `specify init ${name} ${flags}`, `cd ${name}`];
        if (v.gitExt) lines.push('specify extension add git');
        return lines.join('\n');
      }
      case 'constitution':
        return `/speckit-constitution ${joinParts(sentence(v.principles) || slot('', 'core principles'), sentence(v.architecture), sentence(v.testing), sentence(v.standards))}`;
      case 'specify':
        return `/speckit-specify ${joinParts(sentence(v.what) || slot('', 'what you are building and why'), labeled('Users', v.users), labeled('Key behaviors', v.behaviors),
          labeled('Sample data', v.data), labeled('Must not change', v.boundaries), labeled('Not in this phase', v.notNow))}`;
      case 'clarify':
        return joinParts('/speckit-clarify', sentence(v.focus));
      case 'plan':
        return `/speckit-plan ${joinParts(labeled('Backend and data', v.stack) || `Backend and data: ${slot('', 'stack')}`, labeled('Frontend', v.frontend),
          labeled('APIs and integrations', v.apis), labeled('Constraints', v.constraints))}`;
      case 'implement':
        return joinParts('/speckit-implement', sentence(v.phase));
      default:
        return `/speckit-${v.mode}`;
    }
  }

  registerSkill(SPEC_KIT);
})();

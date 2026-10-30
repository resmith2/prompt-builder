/* Vercel plugin skill: https://vercel.com/docs/agent-resources/vercel-plugin */
(() => {
  const s = (id, group, what) => ({ id, group, label: `${id}: ${what}` });

  const VERCEL = {
    id: 'vercel', name: 'Vercel', ready: true,
    docs: 'https://vercel.com/docs/agent-resources/vercel-plugin',
    outputLabel: 'Command for your agent chat',
    modes: [
      { id: 'setup', label: 'Setup', outputLabel: 'Terminal commands', wrap: 'off', hint: 'Runs in your terminal. Installs the Vercel plugin: context, 33 skills, 3 agents and 4 slash commands. Needs Node.js 18+ and Bun, except in OpenCode.' },
      { id: 'bootstrap', label: 'Bootstrap', hint: 'Links the project, provisions environment variables and sets up a database.' },
      { id: 'deploy', label: 'Deploy', hint: 'Deploys to a preview, or to production.' },
      { id: 'env', label: 'Env vars', hint: 'Lists, pulls, adds, removes or diffs environment variables.' },
      { id: 'status', label: 'Status', hint: 'Shows the project, recent deployments and an environment overview.' },
      { id: 'skill', label: 'Ask a skill', hint: 'Calls one of the plugin\'s 33 skills directly for targeted guidance.' }
    ],
    // The plugin's 33 skills, grouped for the picker
    skills: [
      s('ai-sdk', 'AI and agents', 'AI SDK, streaming, tool calling, agents, MCP'),
      s('ai-gateway', 'AI and agents', 'one model API, routing, failover, cost tracking'),
      s('build-agents', 'AI and agents', 'building agents with eve'),
      s('eve', 'AI and agents', 'durable agents: channels, sandboxes, schedules, evals'),
      s('chat-sdk', 'AI and agents', 'chat bots for Slack, Teams, Discord and more'),
      s('vercel-agent', 'AI and agents', 'Vercel Agent: code review, investigations'),
      s('vercel-sandbox', 'AI and agents', 'microVMs for untrusted or AI-written code'),
      s('is-agentic', 'AI and agents', 'agent readiness scores for sites and MCP endpoints'),
      s('deployments-cicd', 'Deploy and project', 'deploy, promote, rollback, CI files'),
      s('vercel-cli', 'Deploy and project', 'Vercel CLI commands'),
      s('bootstrap', 'Deploy and project', 'linking, env provisioning, database, first run'),
      s('env-vars', 'Deploy and project', '.env files, vercel env, OIDC tokens'),
      s('domains', 'Deploy and project', 'search, buy, DNS, transfers, renewals'),
      s('access-protected-vercel-deployment', 'Deploy and project', 'reach protected deployments'),
      s('verification', 'Deploy and project', 'end-to-end checks across browser, API and data'),
      s('knowledge-update', 'Deploy and project', 'what changed on Vercel lately'),
      s('create-a-backend', 'Backend and data', 'Functions, Services, containers, Workflow, Queues'),
      s('vercel-functions', 'Backend and data', 'runtimes, streaming, WebSockets, Cron Jobs'),
      s('vercel-services', 'Backend and data', 'several frontends and backends in one project'),
      s('workflow', 'Backend and data', 'Workflow SDK, durable execution, pause and resume'),
      s('queues', 'Backend and data', 'topics, consumer groups, retries'),
      s('vercel-storage', 'Backend and data', 'Blob, Neon Postgres, Upstash Redis'),
      s('runtime-cache', 'Backend and data', 'per-region key-value cache'),
      s('marketplace', 'Backend and data', 'integrations and unified billing'),
      s('auth', 'Backend and data', 'Clerk, Better Auth, Descope, Auth0'),
      s('vercel-connect', 'Backend and data', 'scoped OAuth tokens for third-party services'),
      s('react-best-practices', 'Performance and edge', 'React and Next.js performance'),
      s('cdn-caching', 'Performance and edge', 'cache hits, revalidation, ISR costs'),
      s('routing-middleware', 'Performance and edge', 'rewrites, redirects, personalization'),
      s('microfrontends', 'Performance and edge', 'path routing and project composition'),
      s('custom-metrics', 'Performance and edge', 'app and business metrics'),
      s('flags-sdk', 'Performance and edge', 'feature flags and A/B tests'),
      s('vercel-firewall', 'Performance and edge', 'WAF, rate limits, bot filtering')
    ],
    groups: [
      { title: 'Install', fields: [
        { id: 'telemetry', label: 'Turn off the plugin\'s usage telemetry', type: 'check', modes: ['setup'] },
        { id: 'shell', label: 'Your shell', type: 'seg', modes: ['setup'], value: 'unix', showWhen: { field: 'telemetry', is: [true] },
          options: [['unix', 'macOS or Linux'], ['windows', 'Windows']] },
        { id: 'doctor', label: 'Run the plugin doctor after installing', type: 'check', modes: ['setup'] }
      ]},
      { title: 'Bootstrap', fields: [
        { id: 'setupNotes', label: 'What to set up (optional)', type: 'textarea', rows: 2, modes: ['bootstrap'], placeholder: 'Link to the acme team, add Neon Postgres, pull env vars locally.' }
      ]},
      { title: 'Deploy', fields: [
        { id: 'target', label: 'Deploy to', type: 'seg', modes: ['deploy'], value: '', options: [['', 'Preview'], ['prod', 'Production']] }
      ]},
      { title: 'Environment variables', fields: [
        { id: 'envAction', label: 'Action', type: 'seg', modes: ['env'], value: 'list',
          options: [['list', 'list'], ['pull', 'pull'], ['add', 'add'], ['remove', 'remove'], ['diff', 'diff']] },
        { id: 'envName', label: 'Variable name', type: 'text', modes: ['env'], placeholder: 'DATABASE_URL', showWhen: { field: 'envAction', is: ['add', 'remove'] } },
        { id: 'envTarget', label: 'Environment (optional)', type: 'seg', modes: ['env'], value: '',
          options: [['', 'Any'], ['development', 'Development'], ['preview', 'Preview'], ['production', 'Production']] }
      ]},
      { title: 'The skill', fields: [
        { id: 'skillId', label: 'Skill', type: 'select', modes: ['skill'], value: 'ai-sdk', optionsFrom: 'skills' },
        { id: 'task', label: 'What you need', type: 'textarea', modes: ['skill'], placeholder: 'Stream a chat response with tool calling from a Next.js route handler.' }
      ]},
      { title: 'Settings', fields: [
        { id: 'tool', label: 'Coding tool', type: 'seg', modes: '*', value: 'default',
          options: [['default', 'Claude Code and most others'], ['opencode', 'OpenCode']],
          hint: 'OpenCode installs the plugin its own way and uses the /vercel: prefix.' }
      ]}
    ],
    build: buildVercel,
    selfCheck: (text, modeId, values) => {
      if (modeId === 'setup') {
        console.assert(text.includes('npx plugins add vercel/vercel-plugin'), 'install command missing');
        console.assert(buildVercel({ ...values, tool: 'opencode' }).includes('opencode plugin add github:vercel/vercel-plugin'), 'OpenCode install missing');
        console.assert(buildVercel({ ...values, telemetry: true, shell: 'windows' }).includes('setx VERCEL_PLUGIN_TELEMETRY off'), 'Windows telemetry line missing');
        return;
      }
      console.assert(text.startsWith('/vercel-plugin:'), `wrong prefix for ${modeId}`);
      if (modeId === 'deploy') console.assert(buildVercel({ ...values, target: 'prod' }) === '/vercel-plugin:deploy prod', 'production deploy wrong');
      if (modeId === 'status') console.assert(buildVercel({ ...values, tool: 'opencode' }) === '/vercel:status', 'OpenCode prefix not applied');
    }
  };

  function buildVercel(v) {
    const cmd = name => `/${v.tool === 'opencode' ? 'vercel' : 'vercel-plugin'}:${name}`;
    switch (v.mode) {
      case 'setup': {
        const lines = [v.tool === 'opencode' ? 'opencode plugin add github:vercel/vercel-plugin' : 'npx plugins add vercel/vercel-plugin'];
        if (v.telemetry) lines.push(v.shell === 'windows' ? 'setx VERCEL_PLUGIN_TELEMETRY off' : 'export VERCEL_PLUGIN_TELEMETRY=off');
        if (v.doctor) lines.push('npx vercel-plugin doctor');
        if (v.tool === 'opencode') lines.push('# Then run /mcps in OpenCode, select vercel and sign in');
        return lines.join('\n');
      }
      case 'bootstrap':
        return joinParts(cmd('bootstrap'), sentence(v.setupNotes));
      case 'deploy':
        return joinParts(cmd('deploy'), v.target);
      case 'env': {
        const named = ['add', 'remove'].includes(v.envAction);
        return joinParts(cmd('env'), v.envAction, named && slot(v.envName, 'variable name'), v.envTarget && `in ${v.envTarget}`);
      }
      case 'status':
        return cmd('status');
      case 'skill':
        return `${cmd(v.skillId)} ${sentence(slot(v.task, 'what you need'))}`;
    }
  }

  registerSkill(VERCEL);
})();

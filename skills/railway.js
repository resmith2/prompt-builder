/* Railway skills for Claude Code: https://railway.com/agents/claude */
(() => {
  const RAILWAY = {
    id: 'railway', name: 'Railway', ready: true,
    docs: 'https://railway.com/agents/claude',
    modes: [
      { id: 'setup', label: 'Setup', outputLabel: 'Terminal commands', wrap: 'off', hint: 'Runs in your terminal. Installs the Railway skills, and optionally the CLI and the MCP server. Needs Node.js.' },
      { id: 'deploy', label: 'Deploy', hint: 'Deploys local code with /deploy.' },
      { id: 'database', label: 'Database', hint: 'Adds a Railway database with /database and wires it to a service.' },
      { id: 'template', label: 'Template', hint: 'Deploys from the Railway marketplace with /templates.' },
      { id: 'configure', label: 'Configure', hint: 'Variables, resources, replicas and environments with /environment.' },
      { id: 'domain', label: 'Domain', hint: 'A Railway domain or your own, with /domain.' },
      { id: 'debug', label: 'Debug', hint: 'Reads deployment logs and metrics with /deployment and /metrics, then fixes the cause.' }
    ],
    groups: [
      { title: 'Install', fields: [
        { id: 'method', label: 'Install skills with', type: 'seg', modes: ['setup'], value: 'plugin',
          options: [['plugin', 'Claude Code plugin'], ['script', 'Skills script']] },
        { id: 'cli', label: 'Also install the Railway CLI and log in', type: 'check', modes: ['setup'], value: true },
        { id: 'link', label: 'Project', type: 'seg', modes: ['setup'], value: '',
          options: [['', 'Skip'], ['link', 'Link existing'], ['init', 'Create new']],
          hint: 'Needs the CLI. Run it in your project folder.' },
        { id: 'mcp', label: 'Also add the Railway MCP server (browser login, no API key)', type: 'check', modes: ['setup'] }
      ]},
      { title: 'Target', fields: [
        { id: 'scope', label: 'What to deploy', type: 'text', modes: ['deploy'], placeholder: 'this project, or apps/web' },
        { id: 'service', label: 'Service (optional)', type: 'text', modes: ['deploy', 'database', 'configure', 'domain', 'debug'], placeholder: 'web' },
        { id: 'env', label: 'Environment (optional)', type: 'text', modes: ['deploy', 'database', 'configure', 'domain', 'debug'], placeholder: 'production' }
      ]},
      { title: 'Details', fields: [
        { id: 'afterDeploy', label: 'Check the logs and fix errors after deploying', type: 'check', modes: ['deploy'], value: true },
        { id: 'db', label: 'Database', type: 'seg', modes: ['database'], value: 'Postgres',
          options: [['Postgres', 'Postgres'], ['MySQL', 'MySQL'], ['Redis', 'Redis'], ['MongoDB', 'MongoDB']] },
        { id: 'template', label: 'Template', type: 'text', modes: ['template'], placeholder: 'Next.js AI Chatbot' },
        { id: 'extras', label: 'Add or change (optional)', type: 'textarea', rows: 2, modes: ['template'], placeholder: 'Postgres for chat history and Redis for rate limiting.' },
        { id: 'variables', label: 'Variables to set (optional)', type: 'textarea', rows: 2, modes: ['configure'], placeholder: 'NODE_ENV=production, LOG_LEVEL=info' },
        { id: 'resources', label: 'Resources (optional)', type: 'text', modes: ['configure'], placeholder: '2 vCPUs and 1 GB memory' },
        { id: 'replicas', label: 'Replicas (optional)', type: 'text', inputType: 'number', modes: ['configure'], placeholder: '2' },
        { id: 'newEnv', label: 'New environment to create (optional)', type: 'text', modes: ['configure'], placeholder: 'staging, copied from production' },
        { id: 'domain', label: 'Custom domain (optional)', type: 'text', modes: ['domain'], placeholder: 'app.example.com',
          hint: 'Leave empty for a Railway-provided domain.' },
        { id: 'symptom', label: 'What is wrong', type: 'textarea', modes: ['debug'], placeholder: 'The last deploy crashes on start. Requests time out under load.' }
      ]}
    ],
    build: buildRailway,
    selfCheck: (text, modeId, values) => {
      if (modeId === 'setup') {
        console.assert(buildRailway({ ...values, method: 'plugin' }).includes('railway@claude-plugins-official'), 'plugin install missing');
        console.assert(buildRailway({ ...values, cli: false, link: 'link' }).includes('railway link'), 'link without CLI dropped');
        return;
      }
      console.assert(text.startsWith('/'), `no slash command in ${modeId}`);
    }
  };

  function buildRailway(v) {
    const where = joinParts(labeled('Service', v.service), labeled('Environment', v.env));
    switch (v.mode) {
      case 'setup':
        return [
          v.method === 'script' ? 'curl -fsSL railway.com/skills.sh | bash' : 'claude plugin install railway@claude-plugins-official',
          v.cli && 'npm install -g @railway/cli',
          v.cli && 'railway login',
          v.link && `railway ${v.link}`,
          v.mcp && 'claude mcp add railway --transport http https://mcp.railway.com'
        ].filter(Boolean).join('\n');
      case 'deploy':
        return joinParts(`/deploy Deploy ${slot(v.scope, 'what to deploy')} to Railway.`, where,
          v.afterDeploy && 'When it finishes, check the deployment logs and fix any errors.');
      case 'database':
        return joinParts(`/database Add a ${v.db} database to my Railway project.`, where,
          'Connect it to the service with reference variables, not copied values.');
      case 'template':
        return joinParts(`/templates Deploy the ${slot(v.template, 'template name')} template from the Railway marketplace.`,
          labeled('Also', v.extras));
      case 'configure':
        return joinParts('/environment Configure my Railway service.', where,
          labeled('Set these variables', v.variables), labeled('Resources', v.resources),
          v.replicas && `Run ${v.replicas} replicas.`, labeled('Create the environment', v.newEnv),
          'Show me each change before you apply it.');
      case 'domain':
        return joinParts(v.domain ? `/domain Set up ${v.domain} with SSL for my Railway service.` : '/domain Generate a Railway domain for my service.',
          where, v.domain && 'Tell me the DNS records to add.');
      case 'debug':
        return joinParts(`/deployment ${sentence(slot(v.symptom, 'what is wrong'))}`, where,
          'Read the latest deployment logs and use /metrics for CPU and memory, find the cause, fix it in the code or config, and redeploy.');
    }
  }

  registerSkill(RAILWAY);
})();

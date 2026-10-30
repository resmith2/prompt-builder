# prompt-builder

A single-page tool for building prompts that load an agent skill and steer a coding agent through a task. Fill in the form, and it assembles the prompt live; copy it into your agent.

## Usage

Open `index.html` in a browser. There is no build step or install. Tailwind is loaded from a CDN, so you need to be online.

1. Pick a skill. Ready skills are listed A to Z, followed by the ones coming soon.
2. Pick what you are working on (the mode or step).
3. Fill in the form. The output updates as you type. Fields appear only when the current choice uses them. Anything still in `<angle brackets>` is a slot you have not filled yet: it is highlighted in the output, and the line under the output lists every empty slot.
4. Click **Copy** and paste the result where the output label says: your agent's chat, or your terminal for setup steps. If slots are still empty, Copy tells you how many.

What you type is kept when you switch steps or skills (until you reload the page). On phones, a bar at the bottom of the screen keeps **Copy** and the empty-slot count in reach while you fill in the form, and steps that don't fit fade at the edge to show the row scrolls. The footer links to the docs for the selected skill.

## Skills

| Skill | Status |
|-------|--------|
| [Archify](https://archify.si/guide) | Ready |
| [Impeccable](https://impeccable.style/docs/) | Ready |
| [Railway](https://railway.com/agents/claude) | Ready |
| [Spec-Kit](https://github.github.com/spec-kit/quickstart.html) | Ready |
| [Taste](https://www.tasteskill.dev/guide?view=full) | Ready |
| [Vercel](https://vercel.com/docs/agent-resources/vercel-plugin) | Ready |
| Brandkit | Coming soon |

### Archify modes

Archify has no slash command; the prompt asks for it by name ("Use the archify skill...").

- **Setup**: terminal command to install it (`npx skills add tt-a1i/archify -g`), or a non-interactive install for one agent, or a try-without-installing command.
- **Describe**: a diagram from your own description, with an optional diagram type (or let Archify choose).
- **From code**: traces a repository and draws its runtime structure: core components, one primary path, external dependencies and trust boundaries.
- **Explainer**: a one-page answer to a question, conclusion first.
- **Refine**: changes to a diagram Archify already made, in its `.archify/` folder.

Describe, From code and Explainer take an optional audience and a dark or light theme.

### Impeccable modes

Impeccable is one command, `/impeccable` (`$impeccable` in Codex), followed by a sub-command and a target. The builder groups its commands by intent:

- **Setup**: install, then `init` and optionally `document`.
- **Build new**: a description plus an optional brief taken from Impeccable's own shape interview. Options for shape first (a brief, no code), surface mode, and mockup first. The mockup option is hidden while shape first is on, since shape writes no code. The brief folds away and shows how many of its fields are filled.
- **Improve**: grouped as in Impeccable's command table. Refine: polish, bolder, quieter, distill, harden, onboard. Enhance: layout, typeset, colorize, animate, delight, overdrive. Fix: clarify, adapt, optimize.
- **Evaluate**: critique, audit.
- **Design system**: document, extract.
- **Variations**: generate, live.
- **Maintenance**: doctor, hooks.

### Railway modes

Railway's skills are slash commands in Claude Code (`/deploy`, `/database`, `/domain` and others); each prompt starts with one.

- **Setup**: terminal commands to install the skills (the Claude Code plugin or the skills script), with optional Railway CLI install, login, project link or init, and the Railway MCP server.
- **Deploy**: deploys local code, then optionally checks the logs and fixes errors.
- **Database**: adds Postgres, MySQL, Redis or MongoDB and connects it to a service.
- **Template**: deploys a marketplace template, with optional extras.
- **Configure**: variables, resources, replicas and new environments.
- **Domain**: a Railway domain, or your own with SSL and the DNS records to add.
- **Debug**: reads deployment logs and metrics, fixes the cause and redeploys.

Every mode except Setup and Template takes an optional service and environment.

### Spec-Kit steps

Spec-Kit runs as separate `/speckit-*` commands, each reviewed before the next, so the builder outputs one command per step. The steps follow the quickstart's full path: **Setup** (terminal commands to install the `specify` CLI and run `specify init`, for a new project or an existing repository), then **Constitution**, **Specify**, **Clarify**, **Plan**, **Checklist**, **Tasks**, **Analyze**, **Implement** and **Converge**. Steps are numbered 1 to 9 as in the quickstart. Clarify, Checklist and Analyze carry a dot: they are quality gates you can skip for small features. After you copy a step, a button offers the next one.

The project name in Setup is made shell-safe: anything other than letters, digits, dot, dash and underscore becomes a dash, so `My App & co` becomes `My-App-co`. The field shows the cleaned name as you type. For an existing repository the name field goes away, and the hint warns that `--force` can replace files Spec Kit manages.

### Taste modes

- **Full page**: build a page from scratch, with a full brief, design read, deliverable and audit.
- **Iterate a section**: redesign one weak section, with a design read and audit that cover only that section.
- **Add a section**: add a new section whose layout differs from the sections next to it.
- **Audit output**: no new code; runs the six-gate audit on something the agent already built.

Options include how the skill gets loaded (workspace file, `npx skills add`, or pasting SKILL.md), which skill version to use (v2, legacy v1, or the full repo), whether the prompt spells out the design-read format, and whether it closes with the pre-flight line or the full six-gate audit.

### Vercel modes

The Vercel plugin (`vercel/vercel-plugin`) adds four slash commands and 33 on-demand skills. Commands start with `/vercel-plugin:` (`/vercel:` in OpenCode).

- **Setup**: terminal commands to install the plugin (`npx plugins add vercel/vercel-plugin`, or the OpenCode command), with optional lines to turn off its telemetry and run its doctor.
- **Bootstrap**: links the project, provisions environment variables and sets up a database, with optional notes on what to set up.
- **Deploy**: a preview, or production with `prod`.
- **Env vars**: list, pull, add, remove or diff, with a variable name for add and remove and an optional environment.
- **Status**: project status, recent deployments and environments.
- **Ask a skill**: pick one of the 33 skills (grouped as AI and agents, Deploy and project, Backend and data, Performance and edge) and describe what you need.

## Accessibility

- Skill, step and option pickers are native radio buttons: one Tab stop each, arrow keys move between options, and every control has a visible focus ring.
- Copy results, including failures and empty slots, are announced to screen readers.
- Number fields reject values outside 1 to 10 with an inline error, and a bad value never reaches the output.
- Placeholder text meets 4.5:1 contrast and field borders meet 3:1.
- Touch targets are at least 44px on touch screens, and field text is 16px on phones so iOS doesn't zoom in on focus.

## Layout

```
index.html              markup and the script tags
css/app.css             styles
js/core.js              the SKILLS list, registerSkill() and text helpers shared by skills
skills/<name>.js        one file per skill; each calls registerSkill()
skills/coming-soon.js   skills shown as "coming soon"
js/app.js               rendering, events and the self-check; never names a skill
```

The files are plain scripts, not ES modules, so the page still works when opened straight from disk. Skills are sorted when the page loads, so the order of the script tags doesn't matter.

## Adding a skill

1. Copy `skills/spec-kit.js` to `skills/<name>.js`. A skill is one object with `id`, `name`, `ready: true`, `modes`, `groups` of form fields, and a `build(values)` function that turns the form values into the prompt text.
2. Add `<script src="skills/<name>.js"></script>` to `index.html`, before `js/app.js`.
3. If the skill was listed in `skills/coming-soon.js`, delete that line.

Wrap anything the user still has to fill in `slot(value, label)` from `js/core.js`. It prints `<label>` when the value is empty and adds the label to the empty-slot list under the output.

Optional settings:

| Where | Setting | What it does |
|-------|---------|--------------|
| Skill | `docs` | URL for the footer's docs link while the skill is selected. |
| Skill | `outputLabel` | Label above the output, such as "Command for your agent chat". The default is "Prompt for your agent". |
| Skill | `selfCheck(text, modeId, values)` | Extra `console.assert` checks run when the page loads. |
| Mode | `outputLabel` | Overrides the skill's label for one step, such as "Terminal commands". |
| Mode | `wrap: 'off'` | Stops the output from wrapping lines, for shell commands. |
| Mode | `step: n` | Numbers the step in the picker and offers the next step after Copy. For skills that run in order. |
| Mode | `gate: true` | Marks an optional quality-check step with a dot. |
| Group | `collapsible: true` | Folds the group into a panel that shows how many fields are filled. For long optional briefs. |
| Field | `showWhen: { field, is: [...] }` | Shows the field only while that other field holds one of the values. Use `is: [false]` for an unticked checkbox. The rule is ignored in modes where the other field isn't shown. |
| Field | `preview(value)` | Returns a note shown under the field as you type, such as the cleaned project name. |
| Field | `inputType: 'number'` | Makes a text field a number input (1 to 10). |
| Field | `list: [...]` | Suggestions shown under a text field. |
| Options | `group` | On a select's options, groups them under headings. |

When the page loads, it builds every step of every skill and logs a failed `console.assert` if any output is empty or has em or en dashes, or if a `showWhen` points at a field that doesn't exist.

# prompt-builder

A single-page tool for building prompts that load an agent skill and steer a coding agent through a task. Fill in the form, and it assembles the prompt live; copy it into your agent.

## Usage

Open `index.html` in a browser. There is no build step or install. Tailwind is loaded from a CDN, so you need to be online.

1. Pick a skill. Ready skills are listed A to Z, followed by the ones coming soon.
2. Pick what you are working on (the mode or step).
3. Fill in the form. The output updates as you type. Anything still in `<angle brackets>` is a slot you have not filled yet, and the line under the output lists every empty slot.
4. Click **Copy** and paste the result where the output label says: your agent's chat, or your terminal for setup steps. If slots are still empty, Copy tells you how many.

What you type is kept when you switch steps or skills (until you reload the page). On phones, a bar at the bottom of the screen keeps **Copy** and the empty-slot count in reach while you fill in the form. The footer links to the docs for the selected skill.

## Skills

| Skill | Status |
|-------|--------|
| [Archify](https://archify.si/guide) | Ready |
| [Impeccable](https://impeccable.style/docs/) | Ready |
| [Spec-Kit](https://github.github.com/spec-kit/quickstart.html) | Ready |
| [Taste](https://www.tasteskill.dev/guide?view=full) | Ready |
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
- **Build new**: a description plus an optional brief taken from Impeccable's own shape interview. Options for shape first (a brief, no code), surface mode, and mockup first. The mockup option is disabled while shape first is on, since shape writes no code.
- **Improve**: polish, bolder, quieter, distill, layout, typeset, colorize, animate, delight, overdrive, clarify, adapt, harden, onboard, optimize.
- **Evaluate**: critique, audit.
- **Design system**: document, extract.
- **Variations**: generate, live.
- **Maintenance**: doctor, hooks.

### Spec-Kit steps

Spec-Kit runs as separate `/speckit-*` commands, each reviewed before the next, so the builder outputs one command per step. The steps follow the quickstart's full path: **Setup** (terminal commands to install the `specify` CLI and run `specify init`, for a new project or an existing repository), then **Constitution**, **Specify**, **Clarify**, **Plan**, **Checklist**, **Tasks**, **Analyze**, **Implement** and **Converge**. Clarify, Checklist and Analyze are quality gates you can skip for small features.

The project name in Setup is made shell-safe: anything other than letters, digits, dot, dash and underscore becomes a dash, so `My App & co` becomes `My-App-co`.

### Taste modes

- **Full page**: build a page from scratch, with a full brief, design read, deliverable and audit.
- **Iterate a section**: redesign one weak section, with a design read and audit that cover only that section.
- **Add a section**: add a new section whose layout differs from the sections next to it.
- **Audit output**: no new code; runs the six-gate audit on something the agent already built.

Options include how the skill gets loaded (workspace file, `npx skills add`, or pasting SKILL.md), which skill version to use (v2, legacy v1, or the full repo), whether the prompt spells out the design-read format, and whether it closes with the pre-flight line or the full six-gate audit.

## Accessibility

- Skill, step and option pickers are native radio buttons: one Tab stop each, arrow keys move between options, and every control has a visible focus ring.
- Copy results, including failures and empty slots, are announced to screen readers.
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
| Field | `disabledWhen: '<checkbox id>'` | Disables the field while that checkbox is ticked. |
| Field | `inputType: 'number'` | Makes a text field a number input (1 to 10). |
| Field | `list: [...]` | Suggestions shown under a text field. |

When the page loads, it builds every step of every skill and logs a failed `console.assert` if any output is empty or has em or en dashes.

# prompt-builder

A single-page tool for building prompts that load an agent skill and steer a coding agent through a task. Fill in the form, and it assembles the prompt live; copy it into your agent.

## Usage

Open `index.html` in a browser. There is no build step or install. Tailwind is loaded from a CDN, so you need to be online.

1. Pick a skill.
2. Pick what you are working on (the mode).
3. Fill in the form. Anything still in `<angle brackets>` in the output is a slot you have not filled yet.
4. Click **Copy** and paste the prompt into your agent.

## Skills

| Skill | Status |
|-------|--------|
| [Taste](https://github.com/Leonxlnx/taste-skill) | Ready |
| [Spec-Kit](https://github.github.com/spec-kit/quickstart.html) | Ready |
| [Impeccable](https://impeccable.style/docs/) | Ready |
| Brandkit | Coming soon |

### Taste modes

- **Full page**: build a page from scratch, with a full brief, design read, deliverable and audit.
- **Iterate a section**: redesign one weak section, with a design read and audit that cover only that section.
- **Add a section**: add a new section whose layout differs from the sections next to it.
- **Audit output**: no new code; runs the six-gate audit on something the agent already built.

Options include how the skill gets loaded (workspace file, `npx skills add`, or pasting SKILL.md), which skill version to use (v2, legacy v1, or the full repo), whether the prompt spells out the design-read format, and whether it closes with the pre-flight line or the full six-gate audit.

### Spec-Kit steps

Spec-Kit runs as separate `/speckit-*` commands, each reviewed before the next, so the builder outputs one command per step. The steps follow the quickstart's full path: **Setup** (terminal commands to install the `specify` CLI and run `specify init`, for a new project or an existing repository), then **Constitution**, **Specify**, **Clarify**, **Plan**, **Checklist**, **Tasks**, **Analyze**, **Implement** and **Converge**. Clarify, Checklist and Analyze are quality gates you can skip for small features. Inputs are kept as you move between steps.

### Impeccable modes

Impeccable is one command, `/impeccable` (`$impeccable` in Codex), followed by a sub-command and a target. The builder groups its commands by intent: **Setup** (install, then `init` and optionally `document`), **Build new** (a description plus an optional brief taken from Impeccable's own shape interview, with shape-first, surface mode and mockup-first options), **Improve** (polish, bolder, quieter, distill, layout, typeset, colorize, animate, delight, overdrive, clarify, adapt, harden, onboard, optimize), **Evaluate** (critique, audit), **Design system** (document, extract), **Variations** (generate, live) and **Maintenance** (doctor, hooks).

## Layout

```
index.html              markup and the script tags, in load order
css/app.css             styles
js/core.js              the SKILLS list, registerSkill() and text helpers shared by skills
skills/<name>.js        one file per skill; each calls registerSkill()
skills/coming-soon.js   skills shown as "soon"
js/app.js               rendering, events and the self-check; never names a skill
```

The files are plain scripts, not ES modules, so the page still works when opened straight from disk.

## Adding a skill

1. Copy `skills/spec-kit.js` to `skills/<name>.js`. A skill is one object: `id`, `name`, `ready: true`, `modes`, `groups` of form fields, and a `build(values)` function that turns the form values into the prompt text. It can also have a `selfCheck(text, modeId, values)` function with its own `console.assert` checks.
2. Add `<script src="skills/<name>.js"></script>` to `index.html`, before `js/app.js`.
3. If the skill was listed in `skills/coming-soon.js`, delete that line.

When the page loads, it builds every step of every skill and logs a failed `console.assert` if any output is empty or has em or en dashes.

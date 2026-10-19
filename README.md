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
| Spec-Kit | Coming soon |
| Impeccable | Coming soon |
| Brandkit | Coming soon |

### Taste modes

- **Full page**: build a page from scratch, with a full brief, design read, deliverable and audit.
- **Iterate a section**: redesign one weak section, with a design read and audit that cover only that section.
- **Add a section**: add a new section whose layout differs from the sections next to it.
- **Audit output**: no new code; runs the six-gate audit on something the agent already built.

Options include how the skill gets loaded (workspace file, `npx skills add`, or pasting SKILL.md), which skill version to use (v2, legacy v1, or the full repo), whether the prompt spells out the design-read format, and whether it closes with the pre-flight line or the full six-gate audit.

## Adding a skill

Each skill is one object in the `<script>` block of `index.html`. Look at `TASTE` for the shape: `modes`, `groups` of form fields, and a `build` function that turns the form values into the prompt text. Add the object to `SKILLS` with `ready: true`.

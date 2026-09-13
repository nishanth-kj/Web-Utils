# WebUtils Design System

## 1. Purpose

WebUtils is a modern, privacy-focused, developer-first web utility platform.

The design should communicate:

* Developer tooling
* Speed
* Precision
* Simplicity
* Privacy
* Reliability
* Technical quality
* Professionalism

The interface must feel like a serious developer product rather than a generic collection of online tools.

---

## 2. Critical Development Rule

## DO NOT CHANGE THE EXISTING FILE STRUCTURE

The existing project structure must remain intact.

DO NOT:

* move files
* rename files
* reorganize folders
* replace the routing architecture
* create an entirely new frontend structure
* rewrite working components unnecessarily
* replace the existing framework
* introduce a different design architecture solely for visual changes

Implement design improvements inside the existing architecture.

If a new component is required, follow the existing component structure and conventions.

---

## 3. Existing Product Identity

Brand:

WebUtils

Website:

<https://webutils.site>

Core positioning:

> Fast, privacy-focused developer tools that work directly in the browser.

The product should feel like a unified developer workspace rather than unrelated utilities.

---

## 4. Design Principles

## 4.1 Developer First

The interface is primarily designed for:

* software engineers
* web developers
* backend developers
* frontend developers
* DevOps engineers
* students
* technical professionals
* open-source developers

Prioritize functionality over decorative UI.

---

## 4.2 Minimal Interface

Avoid unnecessary:

* gradients
* animations
* decorative illustrations
* excessive shadows
* oversized cards
* unnecessary borders
* excessive rounded containers
* marketing-style visual noise

Every visual element should have a purpose.

---

## 4.3 Tool First

When a user opens a tool, the tool itself should be the dominant element.

Example:

```text
------------------------------------------------
JSON Formatter
Format and validate JSON directly in your browser.

[ JSON INPUT                 ] [ JSON OUTPUT ]

[Format] [Minify] [Validate] [Copy]
------------------------------------------------
```

Do not make users scroll through large marketing sections before reaching the tool.

---

## 5. Visual Direction

The visual style should be:

* modern
* technical
* clean
* compact
* responsive
* professional
* high information density
* developer-oriented

Reference the visual quality of modern developer products, but DO NOT copy another website's design.

The final result must have a distinct WebUtils identity.

---

## 6. Color System

Use the existing project's color system if one already exists.

Do not unnecessarily replace the existing brand colors.

If the project does not have a consistent design token system, establish semantic tokens.

Example:

```css
--background
--foreground
--surface
--surface-muted
--border
--border-muted
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--success
--warning
--error
--info
```

Avoid hardcoding the same color repeatedly throughout components.

Use semantic variables.

---

## 7. Dark Mode

Dark mode should be a first-class experience.

Developer tools are frequently used for long periods, so dark mode must have:

* readable text
* appropriate contrast
* clear borders
* visible controls
* comfortable editor colors
* distinguishable error/success states

Do not simply invert the colors.

Use a purpose-built dark theme.

---

## 8. Light Mode

Light mode must remain equally usable.

Avoid:

* extremely bright white surfaces everywhere
* low-contrast gray text
* faint borders
* tiny text

Maintain WCAG-friendly contrast.

---

## 9. Typography

Use the existing font system if one exists.

Typography should prioritize:

* readability
* compactness
* technical clarity

Recommended hierarchy:

```text
Display
H1
H2
H3
Body
Small
Caption
Code
```

Avoid excessively large marketing typography.

---

## 10. Code Typography

Developer content should use a monospace font.

Use the project's existing code font if available.

Apply monospace typography to:

* code
* JSON
* YAML
* SQL
* terminal output
* generated values
* UUIDs
* timestamps
* technical identifiers

Do not use monospace for normal prose.

---

## 11. Spacing

Use a consistent spacing scale.

Prefer existing project spacing tokens.

If no system exists, use a predictable scale such as:

```text
4
8
12
16
20
24
32
40
48
64
```

Avoid arbitrary spacing values unless necessary.

---

## 12. Border Radius

Use restrained radius values.

Suggested:

```text
Small controls: 6px
Inputs: 6–8px
Cards: 8–12px
Large containers: 12–16px
```

Avoid excessive pill-shaped UI.

Pills should be reserved for:

* tags
* status
* badges
* compact filters

---

## 13. Shadows

Use shadows sparingly.

Prefer:

* borders
* surface contrast
* subtle elevation

over large shadows.

Developer interfaces should remain visually precise.

---

## 14. Navigation

The existing navigation structure must remain functional.

Improve:

* visual hierarchy
* active-state indication
* spacing
* accessibility
* mobile behavior

Primary navigation should make it easy to reach:

* Home
* Documentation
* Editor
* Viewer
* IDE
* available tools

Do not introduce unnecessary navigation items.

---

## 15. Header

The header should clearly communicate:

```text
WebUtils
```

with access to the main product areas.

Recommended conceptual layout:

```text
[WebUtils]   Tools   Docs   Editor   Viewer   IDE       [Theme] [GitHub]
```

Adapt this to the existing application.

Do not duplicate navigation systems.

---

## 16. Homepage

The homepage should immediately explain what WebUtils does.

Recommended hierarchy:

```text
WebUtils

Free Online Developer Tools

Format, validate, convert, generate and visualize
code and data directly in your browser.

[Explore Tools]

Popular Tools
--------------------------------

JSON Formatter
JSON Validator
UUID Generator
Epoch Converter
SQL Visualizer
Password Generator

Categories
--------------------------------

Formatters
Converters
Generators
Developer Tools

Why WebUtils?
--------------------------------

Fast
Private
Browser-based
No unnecessary signup

Latest / Useful Resources
--------------------------------
```

The actual existing tools should be used.

Do not invent tools that do not exist.

---

## 17. Homepage Hero

The hero must not dominate the page.

Keep it compact.

The user should reach useful tools quickly.

Avoid:

* giant empty hero sections
* excessive animation
* video backgrounds
* decorative 3D graphics
* unnecessary illustrations

---

## 18. Tool Cards

Tool cards should be compact and informative.

Each card should communicate:

* tool name
* one-line purpose
* category
* optional status/tag

Example:

```text
JSON Formatter
Format and validate JSON online.

[Open Tool]
```

Do not overload cards with:

* long descriptions
* unnecessary icons
* ratings
* fake popularity
* fake user counts

---

## 19. Tool Page

Every tool should follow the same visual principles.

Recommended structure:

```text
Breadcrumb

H1
Short description

Tool interface

Features / status

How to use

Explanation

Examples

FAQ

Related tools
```

The tool interface should remain the visual focus.

---

## 20. Tool Interface

Tool interfaces must feel like professional developer software.

Prioritize:

* clear input/output
* keyboard accessibility
* copy buttons
* download buttons where applicable
* reset/clear controls
* validation status
* error messages
* responsive behavior

Avoid unnecessary confirmation dialogs.

---

## 21. Editors

For Monaco or other code editors:

* preserve existing editor functionality
* maintain syntax highlighting
* provide clear focus states
* make controls easy to discover
* avoid unnecessary editor chrome

Recommended layout:

```text
Toolbar
--------------------------------
Language / Actions / Status

Editor
--------------------------------
Input

Output / Preview
--------------------------------
```

On smaller screens:

```text
Input
↓
Actions
↓
Output
```

---

## 22. Error States

Errors should be:

* concise
* specific
* actionable

Bad:

```text
Something went wrong.
```

Better:

```text
Invalid JSON at line 8, column 14.
Expected a closing brace.
```

Do not expose raw stack traces to normal users.

---

## 23. Success States

Use clear but subtle feedback.

Examples:

```text
Copied
Formatted
Generated
Validated
Downloaded
```

Do not use intrusive notifications for every small action.

---

## 24. Loading States

Loading indicators should be used only when necessary.

Avoid displaying:

```text
Loading...
```

for content that can be rendered immediately.

For expensive operations use:

* skeletons
* progress indicators
* subtle spinners

Do not block the entire interface unnecessarily.

---

## 25. Empty States

Empty states should tell users what to do.

Example:

```text
No JSON yet

Paste JSON into the editor to begin.
```

Avoid empty decorative screens.

---

## 26. Documentation Design

Documentation should be highly readable.

Structure:

```text
Documentation
├── Getting Started
├── Tools
├── Editor
├── Viewer
├── IDE
├── Privacy
└── Keyboard Shortcuts
```

Use:

* headings
* code examples
* tables
* callouts
* copy buttons
* internal links

Avoid excessively wide text columns.

Recommended documentation reading width:

approximately 700–850px.

---

## 27. SEO Content Design

SEO content must not look like content inserted only for search engines.

Place useful explanatory content naturally below or around the tool.

Example:

```text
JSON Formatter
----------------

[Tool]

Format JSON directly in your browser.

## What is JSON formatting?

...

## How to use the formatter

...

## Common JSON errors

...

## FAQ

...
```

The design should integrate SEO content into the product experience.

---

## 28. AI / GEO Content

Important factual information should be visually easy to scan.

Use:

* concise definitions
* short paragraphs
* tables
* examples
* FAQ sections
* clear headings

Do not create walls of text.

---

## 29. Cards

Use cards only when they improve grouping.

Avoid putting every section inside a card.

Preferred:

```text
Page background

Heading

Tool surface

Section
Content

Section
Content
```

rather than:

```text
Card
  Card
    Card
      Card
```

---

## 30. Tables

Tables should be:

* responsive
* readable
* horizontally scrollable on small screens
* visually restrained

Use tables for:

* comparisons
* supported formats
* keyboard shortcuts
* technical specifications
* examples

---

## 31. Buttons

Buttons should have clear hierarchy.

Primary:

```text
Format
Generate
Convert
Run
```

Secondary:

```text
Copy
Download
Reset
Clear
```

Danger:

```text
Delete
Clear All
```

Do not make every button visually primary.

---

## 32. Icons

Use the existing icon library if the project already has one.

Do not introduce multiple icon libraries.

Icons should support meaning.

Avoid decorative icon overload.

Every icon-only interactive control needs an accessible label.

---

## 33. Accessibility

The UI must support:

* keyboard navigation
* visible focus
* screen readers
* semantic HTML
* proper labels
* sufficient contrast
* accessible buttons
* accessible forms
* reduced motion

Do not use clickable `<div>` elements when semantic controls are appropriate.

---

## 34. Responsive Design

The application must work at:

```text
320px
375px
425px
768px
1024px
1280px
1440px
1920px+
```

Do not design only for desktop.

---

## 35. Mobile Navigation

On mobile:

* keep navigation compact
* provide accessible menu controls
* preserve tool usability
* avoid excessive nested menus

The tool itself must remain easy to use.

---

## 36. Mobile Editors

Editors must not become unusable on mobile.

Consider:

* horizontal scrolling where necessary
* compact toolbars
* stacked panels
* larger touch targets
* preserved syntax readability

Do not simply shrink desktop UI.

---

## 37. Internationalization Design

WebUtils should eventually support global users.

The design must accommodate translated text.

Do not assume English text length.

UI must tolerate:

* longer German labels
* Spanish text
* French text
* Hindi
* Arabic
* Japanese
* Chinese
* Korean

Avoid fixed-width buttons where text may overflow.

---

## 38. RTL

Support RTL languages such as Arabic.

Use logical CSS properties where possible:

```css
margin-inline
padding-inline
inset-inline
border-inline
text-align: start
```

Avoid unnecessary:

```css
margin-left
margin-right
left
right
```

when logical properties are appropriate.

Test RTL layouts.

---

## 39. Language Selector

The language selector should be:

* easy to find
* accessible
* compact
* keyboard accessible

Only display languages that are actually implemented.

Do not display fake translation options.

---

## 40. Performance

Design decisions must not unnecessarily hurt performance.

Avoid:

* massive background images
* unnecessary animations
* oversized SVGs
* excessive JavaScript
* unnecessary third-party libraries
* auto-playing media

The visual design must support excellent Core Web Vitals.

---

## 41. Animation

Animation should be subtle.

Use animation for:

* menu transitions
* tool feedback
* modal appearance
* state changes

Avoid:

* constant motion
* distracting backgrounds
* long transitions

Respect:

```css
prefers-reduced-motion
```

---

## 42. SEO-Friendly UI

Important content must be accessible through normal HTML.

Do not hide important information exclusively inside:

* modals
* tooltips
* JavaScript-only interactions
* canvas
* inaccessible tabs

Navigation between important pages should use normal links.

---

## 43. Tool Discoverability

Users should be able to discover tools through:

* homepage
* navigation
* existing IDE
* documentation
* related tools
* search
* categories where already supported

Do not create duplicate navigation systems.

---

## 44. Search

If the existing application contains search functionality, improve it to support:

* tool names
* descriptions
* categories
* aliases
* common developer terminology

Example:

Searching:

```text
json
```

should surface relevant JSON tools.

Searching:

```text
timestamp
```

should surface the epoch converter.

Searching:

```text
uuid
```

should surface the UUID generator.

---

## 45. Empty / Error / Offline Behavior

The application should gracefully handle:

* slow connections
* offline usage where supported
* invalid input
* unsupported formats
* empty input
* large input
* browser limitations

Never leave users with unexplained blank screens.

---

## 46. Privacy UI

Where tools process data locally, make this visible but unobtrusive.

Example:

```text
Processed locally in your browser
```

Use a small privacy indicator near the tool.

Only display this when technically accurate.

---

## 47. Trust Indicators

Useful trust indicators may include:

```text
Browser-based
No signup required
Open source
Processed locally
```

Only show claims that are true.

Never use:

```text
Trusted by 1M+ developers
#1 developer tool
Industry-leading
```

without verified evidence.

---

## 48. Footer

The footer should provide useful navigation.

Possible sections:

```text
WebUtils

Tools
Documentation
Editor
Viewer
IDE

Resources
Guides
Privacy
Terms
Contact

Community
GitHub
```

Use only links that actually exist.

Do not create fake social links.

---

## 49. Visual Consistency

All existing tools should gradually share:

* same header
* same toolbar language
* same button hierarchy
* same typography
* same spacing
* same error states
* same success states
* same responsive behavior

Users should immediately recognize that a tool belongs to WebUtils.

---

## 50. Avoid Design Overengineering

Do not add:

* unnecessary dashboards
* complex animations
* excessive settings
* unnecessary onboarding
* artificial gamification
* badges
* points
* fake ratings
* social counters

WebUtils should remain focused on developer productivity.

---

## 51. Component Reuse

Reuse existing components whenever possible.

Before creating a new component:

1. Search the repository.
2. Determine whether an existing component already performs the function.
3. Extend it if appropriate.
4. Only create a new component if necessary.

Avoid duplicate implementations.

---

## 52. Existing Functionality Has Priority

Visual improvements must never break:

* editors
* viewers
* tools
* formatting
* validation
* conversion
* generation
* copy functionality
* downloads
* keyboard shortcuts
* navigation
* persistence where already supported

If a visual change breaks functionality, revert or redesign the change.

---

## 53. Design Quality Checklist

Before considering a design change complete, check:

## Visual

* consistent spacing
* consistent typography
* clear hierarchy
* appropriate contrast
* restrained shadows
* consistent borders
* consistent buttons

## UX

* obvious primary action
* clear navigation
* useful feedback
* good empty states
* understandable errors

## Accessibility

* keyboard navigation
* focus states
* semantic HTML
* labels
* contrast
* reduced motion

## Responsive

* mobile
* tablet
* desktop
* wide screens

## Performance

* minimal additional JavaScript
* optimized assets
* no unnecessary animation
* no unnecessary dependencies

## SEO

* crawlable content
* semantic headings
* accessible links
* correct metadata
* no hidden SEO content

---

## 54. Design Implementation Process

When modifying the existing website:

1. Inspect the current implementation.
2. Identify existing design tokens.
3. Identify reusable components.
4. Identify inconsistencies.
5. Fix the highest-impact inconsistencies first.
6. Preserve the existing architecture.
7. Preserve functionality.
8. Test desktop.
9. Test mobile.
10. Test dark mode.
11. Test light mode.
12. Test accessibility.
13. Test performance.
14. Test existing tools.

Do not perform a complete redesign unless explicitly requested.

---

## 55. Priority

Use:

## P0

* broken layouts
* unusable tools
* accessibility failures
* mobile failures
* unreadable text
* broken navigation
* broken controls

## P1

* inconsistent tool UI
* poor hierarchy
* weak homepage presentation
* poor tool discoverability
* weak responsive behavior
* inconsistent states

## P2

* visual polish
* animation
* micro-interactions
* additional visual refinement

## P3

* experimental visual features

---

## 56. Design Philosophy

WebUtils should feel like:

```text
A serious developer tool
```

not:

```text
A generic SEO website
```

SEO content must support the product.

The product must remain the primary experience.

---

## 57. Final Rule

DO NOT change the project's existing file structure.

DO NOT rebuild WebUtils from scratch.

DO NOT replace the current application architecture.

DO NOT sacrifice performance for visual effects.

DO NOT sacrifice usability for SEO.

DO NOT sacrifice accessibility for aesthetics.

DO NOT sacrifice functionality for redesign.

Improve the existing WebUtils product incrementally and professionally.

The final experience should be:

```text
Fast
Clean
Technical
Professional
Accessible
Responsive
Privacy-focused
SEO-friendly
AI-search-friendly
International-ready
Developer-first
```

while preserving the existing project architecture and functionality.

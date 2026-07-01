# Stitch Design System

Tags: #design #ui #tokens

## Overview
Stitch is the internal design system for Manjanium Sports UI.
Applied via CSS tokens and Tailwind classes across [[apps/hub]] and [[apps/game]].

## Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| Accent (Gold) | `#FBBF24` | Primary CTAs, highlights, F1 elements |
| Surface | `#131313` | Page/card backgrounds |
| Surface Alt | `#1F2937` | Secondary surfaces |
| Blue | `#0EA5E9` | Info states, telemetry data |
| Green | `#10B981` | Success, Football accent |
| Red | `#EF4444` | Error, brake indicators |
| Muted | `#6B7280` | Labels, secondary text |
| Border | `#333333` | Borders, dividers |

## Typography
- Headings: Space Grotesk (`font-heading`)
- Body: Inter (`font-body`)
- Mono/Telemetry: Font Mono (`font-mono`)

## Glassmorphic Pattern
```css
bg-[#0a0a0a]/80 backdrop-blur-md border border-[#FBBF24]/20 rounded-lg
```

## Component Library
- [[F1Card]] — F1 Hub card wrapper
- [[F1Badge]] — Status badges (live, info, warning)
- [[FootballCard]] — Football Hub card wrapper
- [[TerminalChat]] — Glassmorphic CLI sidebar

## Related
- [[MonorepoArchitecture]]
- [[F1Hub]]
- [[FootballHub]]

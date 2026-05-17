# Temporary disclosure (Tim Doud Allstate)

**TEMPORARY DISCLOSURE — REMOVE WHEN CHANDLER HILL AGENCY OPERATES UNDER ITS OWN APPOINTMENTS**

## What this is

Modular legal disclaimer shown at the bottom of every site section (About, Products, Locations, Quotes).

## Files

| File | Purpose |
|------|---------|
| `disclosure.html` | Disclaimer copy |
| `disclosure.css` | Styling |
| `disclosure.js` | Loads CSS + HTML into all `[data-temp-disclosure-mount]` elements |

## How to remove later

1. Delete this folder: `components/temp-disclosure/`
2. In `index.html`, remove every block marked:
   `<!-- TEMPORARY DISCLOSURE — REMOVE WHEN CHANDLER HILL AGENCY OPERATES UNDER ITS OWN APPOINTMENTS -->`
   and the following `<div data-temp-disclosure-mount></div>` (or `quotes-disclosure-wrap` wrapper on Quotes)
3. Remove the script tag: `<script src="components/temp-disclosure/disclosure.js"></script>`

No other files need changes.

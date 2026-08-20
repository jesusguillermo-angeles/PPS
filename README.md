# PeroPero Seduction — Historical Reconstruction v13

This revision replaces the previous "screenshot as background" approach for **Collection** with a real HTML/CSS reconstruction of the historical interface shown in the supplied reference PDF.

## What changed

- Collection is now built from real HTML/CSS layers instead of using the screenshot as the UI background.
- Historical proportions, pink header, black textured panels, silver controls, filter pills, deck area, page controls, collection header and 7-column card grid are reconstructed.
- The first Collection page uses cropped card-art references from the user's supplied historical screenshot so the visible card thumbnails match the documented screen rather than using invented art.
- The event window was rebuilt into a period-style Super Elite Guard interface based on the supplied screenshot: pink title bar, guard card, SED/Focus strip, orange/pink action buttons, item strip, comments and ranking.
- The event selector is now integrated into the event window instead of appearing as a generic modern modal.
- Historical event names/order are retained from the supplied PDF and the archived event-history reference.
- TypeScript strict/noEmit check passes.

## Run

```powershell
npm install
npm run dev
```

````markdown
# Aurora Baby

A React Native app for comprehensive baby-care tracking and insights. Aurora Baby helps parents log and visualize their child’s daily activities—sleep, feeding, diaper changes, play/awake time, and other essentials—via an intuitive circular tracker UI. It also offers “quick logs,” AI- or rule-based future event suggestions, and an end-of-day export/share feature.

---

## Table of Contents

- [Features](#features)  
- [Screens & Workflows](#screens--workflows)  
- [Installation](#installation)  
- [Project Structure](#project-structure)  
- [Core Components & Hooks](#core-components--hooks)  
- [Data Storage & AI Integration](#data-storage--ai-integration)  
- [Circular Tracker Design](#circular-tracker-design)  
- [Theming & Styling](#theming--styling)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Features

- **24-Hour Circular Tracker**  
  - Multi-ring visualization of sleep/awake, feeding/diaper, and other essential activities.  
  - Real-time “current time” arc.  
  - Time-of-day labels placed within the empty inner circle.  

- **Quick Log & Future Log**  
  - Log events (sleep, feeding, diaper changes, showers, playtime) via a Quick Log menu.  
  - Persist logs “as they happen” into local storage (AsyncStorage).  
  - Optionally generate “future” suggestions (next 24 hours) using AI (LlamaLogGenerator) or rule-based heuristics.  
  - Automatically promote future logs to real logs when their timestamp is reached.  

- **Past Logs & Insights**  
  - View a chronological list of past logs.  
  - Inspect details, edit/delete individual logs.  
  - Generate end-of-day CSV export and share via system share sheet.  
  - Insights screen (charts/graphs) summarizing daily or weekly patterns.  

- **Filter & Toggle**  
  - Toggle between “Today” (midnight → now) vs “Last 24 Hours” mode.  
  - Visual filter applied to the tracker and event markers.  

- **Theming & Custom UI**  
  - Styled with `styled-components/native`.  
  - Light/dark or accent-based theming supported.  
  - Modular, reusable components (CategoryRing, SliceRing, QuickLogMenu, etc.).  

---

## Screens & Workflows

1. **Tracker (Care) Screen**  
   - At the top, three icon buttons:
     - **Clear All**: Wipes any “future” logs or resets the tracker view.  
     - **Fill Next-Day**: Triggers AI/rule-based generation of the next 24 hours of logs.  
     - **Share**: Exports an end-of-day report and invokes the share dialog.  
   - Below, the **circular tracker UI** (3 concentric CategoryRings + current time arc + time labels).  
   - Bottom: a filter toggle (Today vs Last 24 Hours).

2. **Past Logs Screen**  
   - A vertical list of all saved logs (sorted by timestamp).  
   - Tap on a log to view/edit/delete.  
   - Quick “add log” button to create a new entry manually.

3. **Inferred (Future) Logs Screen**  
   - Shows any pending “future” logs (AI- or rule-generated) with the option to promote them now or delete them.

4. **Insights Screen**  
   - Charts/graphs summarizing patterns: total sleep hours, feed/diaper frequency, etc.

5. **End-of-Day Export Screen**  
   - Preview the CSV/JSON export of today’s logs.  
   - Share via native share sheet (email, messaging, etc.).

---

## Installation

> **Prerequisites**  
> - Node.js (≥ 14.x) & npm or Yarn  
> - React Native CLI (for iOS/Android builds)  
> - Xcode (for iOS) or Android Studio SDK (for Android)  

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/MiladArbabi/aurora-baby.git
   cd aurora-baby
````

2. **Install Dependencies**
   Using npm:

   ```bash
   npm install
   ```

   Or using Yarn:

   ```bash
   yarn install
   ```

3. **iOS Setup** (macOS only)

   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run on Simulator / Device**

   * **iOS**

     ```bash
     npx react-native run-ios
     ```
   * **Android**

     ```bash
     npx react-native run-android
     ```

5. **Environment Variables**

   * If you integrate any third-party services (e.g., AI API keys), create a `.env` file based on `.env.example` and populate the required keys.

---

## Project Structure

```
aurora-baby/
├── android/                     # Android native project files
├── ios/                         # iOS native project files
├── src/
│   ├── assets/                  # Images, SVGs, and icon components
│   │   ├── carescreen/
│   │   │   ├── common/          # ClearLogs, FillNextDayIcon, ShareIcon, etc.
│   │   │   ├── tracker-rings/   # OutterRim, CategoryRing SVG assets
│   │   └── whispr/              # WhisprVoiceButton icon assets
│   │
│   ├── components/              # Reusable UI components
│   │   ├── carescreen/
│   │   │   ├── CategoryRing.tsx  # Draws a single ring of 24 slices
│   │   │   ├── SliceRing.tsx     # Legacy ring, if still used
│   │   │   ├── CareLayout.tsx    # Layout wrapper for all care screens
│   │   │   ├── QuickLogMenu.tsx  # Modal menu to create a quick log
│   │   │   ├── LogDetailModal.tsx# Modal to view/delete existing log
│   │   │   ├── TrackerFilter.tsx # Toggle between Last 24 Hours / Today
│   │   │   ├── QuickLogButton.tsx# Floating “+” button for logs
│   │   │   ├── WhisprVoiceButton.tsx # Voice-input button (Whispr)
│   │   │   └── MiniNavBar.tsx     # Bottom tab navigation icons
│   │   └── ...                   # (Other generic/shared components)
│   │
│   ├── hooks/
│   │   ├── useTrackerData.ts     # Core logic: aggregates logs into hourlyCategories
│   │   └── useFutureLogs.ts      # Provides future log state management
│   │
│   ├── models/
│   │   └── QuickLogSchema.ts     # Realm or SQLite schema for QuickLogEntry
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx      # React Navigation stack & tab setup
│   │
│   ├── screens/
│   │   ├── CareScreen.tsx        # Main tracker screen (circular UI + icons)
│   │   ├── PastLogs.tsx          # List of saved logs (history)
│   │   ├── InferredLogs.tsx      # List of “future” (inferred) logs
│   │   ├── Insights.tsx          # Charts & summary statistics
│   │   └── EndOfDayExport.tsx    # CSV/JSON export & share screen
│   │
│   ├── services/
│   │   ├── QuickLogAccess.ts     # AsyncStorage I/O: getLogsBetween, saveFutureEntries
│   │   ├── LlamaLogGenerator.ts  # AI-powered quick log generation (Llama)
│   │   ├── RuleBasedLogGenerator.ts # Rule-based quick log suggestions
│   │   └── ...                   # (Other API or helper services)
│   │
│   ├── storage/
│   │   ├── QuickLogStorage.ts    # Wrapper around AsyncStorage for QuickLogEntry
│   │   └── QuickLogEvents.ts     # EventEmitter for “saved”, “deleted”, “future-saved”
│   │
│   ├── utils/
│   │   └── dailySliceTemplate.ts # Default 24-hour template for generating logs
│   │
│   └── App.tsx                   # Root component mounting React Navigation
│
├── .env.example                  # Example environment variables
├── .gitignore
├── package.json
├── README.md                     # ← You are here
└── tsconfig.json
```

---

## Core Components & Hooks

Below are the most important building blocks of Aurora Baby:

### `useTrackerData` (Hook)

* Consumes persisted QuickLog entries (`sleep`, `feedDiaper`, `showerEss`, `play`).
* Builds:

  1. `hourlyCategories: SliceCategory[24]` – for each hour, a category in priority order (`sleep > feedDiaper > showerEss > play`).
  2. `nowFrac: number` – the current time as a fraction of 24 hours (used to draw the moving “current time” arc).

### `CategoryRing` (Component)

* Renders a circle divided into 24 slices.
* **Props**:

  * `size: number` – diameter of the outer circle in pixels.
  * `strokeWidth: number` – ring thickness.
  * `mask: boolean[24]` – an array where `true` means “fill this slice,” `false` means transparent.
  * `fillColor: string` – color to use for `true` slices.
  * `separatorColor?: string` – color for faint dividing lines between slices.
* Internally builds each slice via an SVG path (using `react-native-svg`).

### `OutterRim` (Component)

* Draws an outer circular arc that fills from 0 → 100% of the circle based on a `progress` prop (0–1).
* Used to indicate the current time of day by wrapping the entire circular tracker.

### `TrackerFilter` (Component)

* A simple toggle (switch) between “Last 24 Hours” and “Today (midnight → now)”.
* Keeps the circular tracker and event markers in sync with the chosen filter.

---

## Data Storage & AI Integration

### QuickLog Persistence (AsyncStorage)

* **Past Logs**: all saved `QuickLogEntry` records live in a persistent store (e.g., SQLite or AsyncStorage).
* **Future Logs**: temporarily stored under a key `@future_logs`.

  * The app checks every 30 seconds and “promotes” any future log whose timestamp is now ≤ current time:

    1. Save into the real log store (`saveQuickLogEntry`).
    2. Remove from future store and update UI.

#### Key Services

* **`QuickLogAccess.ts`**

  * `getLogsBetween(startISO: string, endISO: string): Promise<QuickLogEntry[]>`
  * `getFutureEntries(): Promise<QuickLogEntry[]>`
  * `saveFutureEntries(entries: QuickLogEntry[]): Promise<void>`
  * `deleteLogEntry(entry: QuickLogEntry): Promise<void>`
  * `deleteFutureEntry(id: string): Promise<void>`

* **`QuickLogEvents.ts`**

  * An `EventEmitter` to broadcast “saved”, “deleted”, “future-saved”, “future-deleted” so that all screens update reactively.

### AI & Rule-Based Quick Log Generation

* **`LlamaLogGenerator.ts`**

  * Uses a LLaMA (or OpenAI) model to generate plausible next-24 hours of logs based on recent history.
  * Returns an array of `QuickLogEntry` suggestions (timestamps + types).

* **`RuleBasedLogGenerator.ts`**

  * Heuristics to create “next day” templates (e.g., schedule a nap every \~4 hours, feed every \~3 hours).

* **Usage**

  * Tapping **Fill Next-Day** triggers one of the above generators.
  * Generated entries are saved to AsyncStorage under `@future_logs` and displayed in the InferredLogs screen.

---

## Circular Tracker Design

The circular tracker is composed of three concentric rings plus a moving arc:

1. **Outer Ring (Sleep/Awake)**

   * Renders two overlapping CategoryRings:

     * **Awake Ring** (warm yellow): shows any hour where the baby is not asleep (`mask = !sleepMask[h]`).
     * **Sleep Ring** (light blue): overlays on top, showing hours where `sleepMask[h] === true`.

2. **Middle Ring (Feed/Diaper)**

   * One CategoryRing colored light orange (`#FFE0B2`) showing hours where `feedDiaperMask[h] === true`.

3. **Inner Ring (Other Essentials)**

   * One CategoryRing colored light green/yellow (`#F0F4C3`) showing hours where `showerEssMask[h] === true`.

4. **Current Time Arc**

   * Drawn by `OutterRim` around the very outside of the outer ring.
   * The `progress` prop is the fraction `nowFrac = (hours*60 + minutes + seconds/60) / 1440`.

5. **Time-of-Day Labels**

   * Placed inside the innermost empty circle (radius computed as:

     ```ts
     const emptyRadius =
       RING_SIZE / 2.5
       - (RING_THICKNESS + GAP) * 2
       - RING_THICKNESS / 2;
     ```
   * Labels at `00:00`, `06:00`, `12:00`, `18:00` are positioned along that radius at angles `0°`, `90°`, `180°`, and `270°`.

---

## Theming & Styling

* **`styled-components/native`**

  * Provides a theming context (`theme.colors`, `theme.spacing`, etc.).
  * All UI components (buttons, backgrounds, icons) adhere to the selected theme.

* **Responsive Sizing**

  * `RING_SIZE = Dimensions.get('window').width * 0.9` – ensures the tracker uses 90 % of screen width.
  * Rings are absolutely positioned to center within their container.

* **Z-Index & Overlapping**

  * Each ring/overlay is wrapped in a `View` with `position: 'absolute'`.
  * The order in JSX determines stacking:

    1. Awake ring (yellow)
    2. Sleep ring (blue)
    3. Feed/Diaper ring
    4. Essentials ring
    5. Current time arc (topmost)

---

## Contributing

We welcome contributions! If you’d like to improve Aurora Baby:

1. **Fork** the repository.
2. Create a **feature branch** (`git checkout -b feature/my-feature`).
3. Make your changes and add/add tests if applicable.
4. Submit a **Pull Request**, referencing any relevant issues.

Please ensure:

* Code follows the existing style conventions (TypeScript, React Native).
* New components/hooks include clear JSDoc or inline comments.
* Any new dependencies are well-justified.

---

## License

Aurora Baby is open-source under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

> *Aurora Baby—making baby-care tracking intuitive, visual, and (where possible) automated!*
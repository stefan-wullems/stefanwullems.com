- Start with explaining what the purpose of the analysis is, why it's valuable and how it can be used broadly.
- End with an interpretation and action manual for the analysis.
- The context provider cannot call domain functions?

## Project Organization

### SOP Structure
Each SOP should be organized as an independent unit with its own directory containing:

```
/app/sops/[sop-name]/
├── page.mdx                 # MDX page with content and examples
└── _components/             # SOP-specific components
    ├── context.tsx     # Context provider for SOP state including the use[SOP]SOP hook
    ├── steps.tsx    # SOP steps  module that holds all the step components
    ├── progress-tracker.tsx # Custom progress tracker visualization component
```

### Shared Component Organization
Shared components in `/components/sop/` are organized by functionality:

```
/components/sop/
├── forms/                   # Form components
│   ├── DataUploadForm.tsx
│   ├── AnalysisConfigForm.tsx
│   └── PublishedDateConfigForm.tsx
├── ui/                      # Core UI components
│   ├── SOPStep.tsx
│   ├── ProgressTracker.tsx
│   └── ResultsTable.tsx
├── progress/                # Progress-related components
│   └── PublishedDateProgressBar.tsx
├── steps/                   # Generic step components
│   ├── GenericDataUploadStep.tsx
│   └── GenericPublishedDateStep.tsx
└── index.ts                 # Exports organized by category
```

### Key Principles Applied
1. **SOP Isolation**: Each SOP is self-contained with its own _components directory
2. **Shared Components**: Common functionality is organized by purpose (forms, ui, progress)
3. **Import Organization**: Use absolute imports (`@/components/sop/ui/SOPStep`) for shared components
5. **Clean Exports**: Main index.ts provides organized exports grouped by functionality

## SOP Content Rules (for Interactive SOPs)

1. **Structure**
   Always follow this exact structure. Do not omit any section:

   * Intro (1–2 sentences to set the stage)
   * **Goal**
   * **Ideal Outcome**
   * **Why this is Important**
   * **Where this is done**
   * **When this is done**
   * **Who does this**
   * **Prerequisites or Requirements**
   * **SOP**: 📋 Step-by-Step Instructions

2. **Tone & Style**

   * Use clear, direct, professional language.
   * Keep sentences short and actionable.
   * Avoid jargon unless absolutely necessary. If jargon is used, provide a simple explanation (e.g., explain *quartiles* or *referring domains*).
   * Write so that a beginner can follow without prior training.

3. **Section Rules**

   * **Goal**: State the main purpose in 1–2 sentences.
   * **Ideal Outcome**: Describe what success looks like in concrete, measurable terms (e.g., quartile rankings, composite scores).
   * **Why this is Important**: Link the activity to business value (e.g., efficient resource allocation, stronger SEO performance).
   * **Where this is done**: Specify the exact tool, software, or environment (e.g., “Ahrefs Site Explorer”).
   * **When this is done**: Define the trigger or frequency (e.g., quarterly or after major content launches).
   * **Who does this**: Assign responsibility to a clear role (e.g., Content Strategist, SEO Specialist).
   * **Prerequisites or Requirements**: Use bullet points to list needed tools, accounts, files, or permissions.
   * **Step-by-Step Instructions**:

     * Use “Step N” as a header.
     * Begin each step with an action verb: *Open, Upload, Export, Select, Run, Interpret*.
     * Be precise about buttons, fields, or file formats (e.g., *Export as CSV with UTF-8 encoding*).
     * Cluster related instructions under a single step header if they belong together.
     * Include tips, insights, or context as callouts (💡).

4. **Formatting**

   * Use bullet points for prerequisites.
   * Highlight file types, button names, or settings in **bold** or “quotes.”
   * Use blockquotes for tips, warnings, or context.

5. **Completeness**

   * Each SOP must stand alone — a new user should be able to follow it without extra explanation.
   * If another SOP is referenced, link it clearly or include its exact name.
   * Include interpretive guidance where necessary (e.g., how to read quartile rankings or composite scores).

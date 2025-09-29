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

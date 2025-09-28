# Interactive SOP System - Content Audit Implementation

This project implements an interactive Standard Operating Procedure (SOP) system for conducting content audits using Ahrefs data. The system transforms the original Python-based Jupyter notebook workflow into a fully interactive web application.

## Overview

The SOP system provides a step-by-step interactive guide for content auditing that includes:
- Project setup and configuration
- Data upload and validation
- Analysis configuration with customizable parameters
- Automated content inventory analysis
- Time-based performance analysis
- Results visualization with export capabilities

## Architecture

### Domain Models (JavaScript)
Located in `src/lib/sop/`, these models replicate the Python domain logic:

- **AhrefsPage** (`ahrefs-page.ts`): Handles CSV parsing and published date enrichment
- **ContentInventory** (`content-inventory.ts`): Generates content performance analysis with composite scores
- **TimeBasedAnalysis** (`time-based-analysis.ts`): Creates time-based performance metrics

### React Components
Located in `src/components/sop/`, these provide the interactive user interface:

- **SOPStep**: Wrapper component for individual workflow steps
- **ProjectSetupForm**: Project configuration and workspace creation
- **DataUploadForm**: CSV file upload with validation and preview
- **AnalysisConfigForm**: Analysis parameter configuration
- **ResultsTable**: Data visualization with sorting, pagination, and CSV export
- **ProgressTracker**: Visual progress indicator for the workflow
- **ContentAuditSOP**: Main orchestrator component

### Features

#### Data Processing
- **CSV Import**: Supports standard Ahrefs Top Pages export format
- **Data Validation**: Ensures required columns are present
- **Published Date Enrichment**: Optional web scraping for publication dates
- **Caching**: Implements caching for expensive operations

#### Analysis Capabilities
- **Content Inventory**: Multi-dimensional analysis with composite scoring
- **Quartile Rankings**: Performance quartiles for referring domains, traffic, and efficiency
- **Time-Based Analysis**: Performance trends relative to historical content
- **Strategy Options**: Median vs. average aggregation strategies

#### User Experience
- **Progressive Workflow**: Step-by-step guided process
- **Real-time Validation**: Immediate feedback on user inputs
- **Progress Tracking**: Visual progress indicator
- **Error Handling**: Comprehensive error messages and recovery
- **Export Options**: CSV export for further analysis

## File Structure

```
src/
├── lib/sop/
│   ├── ahrefs-page.ts          # CSV parsing and data models
│   ├── content-inventory.ts    # Content analysis logic
│   ├── time-based-analysis.ts  # Time-based metrics
│   └── index.ts               # Exports
├── components/sop/
│   ├── SOPStep.tsx            # Step wrapper component
│   ├── ProjectSetupForm.tsx   # Project configuration
│   ├── DataUploadForm.tsx     # File upload interface
│   ├── AnalysisConfigForm.tsx # Analysis settings
│   ├── ResultsTable.tsx       # Data table with export
│   ├── ProgressTracker.tsx    # Progress visualization
│   ├── ContentAuditSOP.tsx    # Main workflow orchestrator
│   └── index.ts              # Component exports
└── app/sops/
    ├── page.tsx              # SOP listing page
    └── content-audit/
        └── page.mdx          # Interactive SOP documentation
```

## Key Components Explained

### ContentAuditSOP
The main orchestrator that manages:
- Workflow state across all steps
- Data flow between components
- Error handling and validation
- Progress tracking
- Step completion logic

### Domain Models
JavaScript implementations of the original Python logic:
- Maintains identical algorithms for consistency
- Adds TypeScript types for better developer experience
- Implements proper error handling

### ResultsTable
Advanced data table with:
- Sortable columns
- Pagination
- Type-aware rendering based on analysis type
- CSV export functionality
- Responsive design

## Analysis Metrics

### Content Inventory
- **Composite Score**: Combined performance ranking (2-8 scale)
- **RD Quartile**: Referring domains performance quartile
- **Traffic Quartile**: Organic traffic performance quartile
- **RD per Visit**: Link acquisition efficiency metric
- **RD per Visit Quartile**: Link quality ranking

### Time-Based Analysis
- **Time-Based Index**: Performance relative to historical content
- **Strategy Options**: Median (robust) vs. Average (sensitive)
- **Performance Stats**: Outperformers, underperformers, averages

## Usage

### Basic Workflow
1. **Project Setup**: Configure project name and workspace
2. **Data Upload**: Upload Ahrefs CSV export
3. **Analysis Config**: Choose strategy and published date options
4. **Run Analysis**: Process data and generate insights
5. **View Results**: Explore results and export data

### Sample Data
A sample CSV file is provided at `/public/sample-ahrefs-data.csv` for testing purposes.

### Export Formats
All results can be exported as CSV files with proper formatting for Excel compatibility.

## Technical Considerations

### Performance
- Client-side processing for immediate feedback
- Pagination for large datasets
- Efficient sorting and filtering
- Caching for published date lookups

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Clear error messaging
- Progressive enhancement

### Responsive Design
- Mobile-first approach
- Collapsible sections for small screens
- Responsive tables with horizontal scrolling
- Touch-friendly interface elements

## Comparison with Original Python Implementation

### Maintained Features
- Identical analysis algorithms
- Same metric calculations
- Equivalent output formats
- Consistent quartile logic

### Enhanced Features
- Interactive user interface
- Real-time validation
- Progress tracking
- Better error handling
- Responsive design
- Export capabilities

### Differences
- Client-side processing (vs. server-side Python)
- Mock published date fetching (vs. actual web scraping)
- Browser-based file handling (vs. file system)
- TypeScript types (vs. Python types)

## Future Enhancements

### Planned Features
- Real web scraping for published dates
- Additional export formats (Excel, JSON)
- Data visualization charts
- Batch processing capabilities
- Template system for different SOP types

### Extensibility
The system is designed to support additional SOP types by:
- Creating new domain models
- Building new form components
- Adding new analysis types
- Extending the progress tracker

## Dependencies

### Core Dependencies
- Next.js 15+ (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Heroicons (icons)

### Development Dependencies
- ESLint (code quality)
- Prettier (code formatting)

## Getting Started

1. Ensure the project builds: `npm run build`
2. Start development server: `npm run dev`
3. Navigate to `/sops/content-audit`
4. Use the sample CSV or upload your own Ahrefs data
5. Follow the interactive workflow

## Maintenance

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Prettier for formatting
- Component-based architecture

### Testing Considerations
- Unit tests for domain models
- Integration tests for components
- End-to-end tests for workflows
- Performance testing for large datasets

This implementation provides a solid foundation for building additional interactive SOPs while maintaining the analytical rigor of the original Python implementation.
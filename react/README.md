# BHB Visualization Examples (React)

A [Next.js](https://nextjs.org) application that provides interactive visualization examples for the BigHugeBrain (BHB) API. It demonstrates how to take the structured JSON "DNA" produced by the BHB Core API and build rich, interactive dashboards for Identity & Correlation Mapping.

## Features

The application includes several specialized visualization components for interpreting BHB API responses:

- **Entity Network Visualization** (`EntityNetworkViz`): View complex connections between entities across documents using D3.js force-directed graphs.
- **Correlation Matrix** (`CorrelationMatrix`): Understand statistical co-occurrence relationships across entity data points.
- **Sentiment Timeline** (`SentimentTimeline`): Track narrative and sentiment flow over time with Recharts.
- **Topic Clusters** (`TopicClusters`): D3.js circle-packing visualization of semantic topic groupings.
- **Narrative Intensity** (`NarrativeIntensity`): Area charts mapping analytical pressure across document nodes.
- **Language Profile** (`LanguageProfile`): Radar and bar charts breaking down linguistic DNA (plurality, gender, entity types).
- **Errata Log** (`ErrataLog`): Monitor anomalies detected during the correlation phase.
- **API Playground**: Interface directly with your BHB instance to see real-time analysis.

## Getting Started

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Visualizations**: [D3.js](https://d3js.org/) and [Recharts](https://recharts.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: TypeScript

## Project Structure

```
react/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (docs)/       # Documentation pages (Introduction, Onboarding, etc.)
│   │   ├── playground/   # Interactive API playground
│   │   └── api/          # Server-side API proxy route
│   ├── components/       # React visualization components
│   ├── lib/              # API client and utility functions
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── package.json
└── tsconfig.json
```

## Learn More

- [BHB Documentation](https://docs.proggor.com) — Full API reference and guides.

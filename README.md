# BHB Examples

Reference implementations and example code for the **BigHugeBrain (BHB)** document analysis API by [Correlation Concepts](https://github.com/correlation-concepts).

BHB is a neural correlation engine that transforms unstructured text into structured JSON "DNA" — rich graphs of identities, sentiments, topics, and entity relationships. This repository provides working examples in multiple languages to help you get started.

## Repository Structure

```
bhb-examples/
├── react/       # Next.js interactive visualization dashboard
├── python/      # Python scripts for analysis & visualization
├── LICENSE
└── README.md
```

## Quick Start

### React (Interactive Dashboard)

A full Next.js application with D3.js and Recharts visualizations including entity networks, correlation matrices, sentiment timelines, topic clusters, and more.

```bash
cd react
npm install
npm run dev
```

See the [React README](./react/README.md) for full documentation.

### Python (Analysis & Visualization)

Standalone Python scripts demonstrating how to authenticate, analyze documents, and generate visualizations using matplotlib, networkx, and seaborn.

```bash
cd python
pip install -r requirements.txt
python examples/analyze_document.py
```

See the [Python README](./python/README.md) for full documentation.

## What is BHB?

BHB (BigHugeBrain) is a document analysis API that performs:

- **Identity Resolution** — Enterprise-grade named entity recognition for people, organizations, places, and things
- **Correlation Mapping** — Entity co-occurrence analysis across document segments
- **Sentiment Chronology** — Emotional flow tracking across the document timeline
- **Topological Clustering** — Semantic concept grouping and theme extraction
- **Linguistic Profiling** — Token-level analysis of plurality, gender, possessiveness, and more

The API returns structured JSON that can be ingested into graph databases, used for predictive modeling, or rendered as interactive visualizations.

## Getting API Credentials

To use the BHB API, you need OAuth2 client credentials (Client ID + Client Secret). Visit [docs.proggor.com](https://docs.proggor.com) for details on obtaining access.

## Documentation

- **Interactive Docs**: [docs.proggor.com](https://docs.proggor.com)
- **API Playground**: [docs.proggor.com/playground](https://docs.proggor.com/playground)

## License

[MIT](./LICENSE)

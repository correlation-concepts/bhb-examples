# BHB Python Examples

Python scripts demonstrating how to authenticate with the BHB API, analyze documents, and generate visualizations from the structured JSON "DNA" response.

## Setup

### Requirements

- Python 3.9+
- API credentials (Client ID + Client Secret) from [Correlation Concepts](https://docs.proggor.com)

### Installation

```bash
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the `python/` directory:

```env
BHB_CLIENT_ID=your_client_id_here
BHB_CLIENT_SECRET=your_client_secret_here
BHB_EMAIL=your@email.com
```

## Examples

### 1. Analyze a Document

Authenticate and analyze a document URL, saving the raw JSON response:

```bash
python examples/analyze_document.py --url "https://en.wikipedia.org/wiki/MissingNo."
```

### 2. Entity Network Graph

Generate a force-directed entity network visualization using NetworkX and Matplotlib:

```bash
python examples/entity_network.py --input output/analysis.json --output output/entity_network.png
```

### 3. Correlation Heatmap

Create a correlation heatmap showing entity co-occurrence strength:

```bash
python examples/correlation_heatmap.py --input output/analysis.json --output output/correlation_heatmap.png
```

### 4. Sentiment Flow

Plot sentiment flow across document sections:

```bash
python examples/sentiment_flow.py --input output/analysis.json --output output/sentiment_flow.png
```

### 5. Topic Distribution

Visualize topic/category distribution from entity tokens:

```bash
python examples/topic_distribution.py --input output/analysis.json --output output/topic_distribution.png
```

## Project Structure

```
python/
├── bhb_client/           # Reusable BHB API client
│   ├── __init__.py
│   └── client.py         # Authentication + analysis
├── examples/             # Standalone example scripts
│   ├── analyze_document.py
│   ├── entity_network.py
│   ├── correlation_heatmap.py
│   ├── sentiment_flow.py
│   └── topic_distribution.py
├── output/               # Generated visualizations (gitignored)
├── requirements.txt
└── README.md
```

## Output

All generated visualizations are saved to the `output/` directory by default. This directory is gitignored — outputs are ephemeral and meant for local exploration.

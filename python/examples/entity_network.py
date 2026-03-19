#!/usr/bin/env python3
"""
Entity Network Graph

Generates a force-directed graph visualization of entities and their
co-occurrence relationships from a BHB analysis JSON file.

Entities are extracted from note tokens and linked when they co-occur
within the same note. Node colors represent entity types (person, place,
organization, thing).

Usage:
    python examples/entity_network.py --input output/analysis.json
    python examples/entity_network.py --input output/analysis.json --output output/entity_network.png
"""

import argparse
import json
import os
import sys

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import networkx as nx


# Color scheme matching the React visualization
ENTITY_COLORS = {
    "PERSON": "#f6ad55",
    "ORGANIZATION": "#63b3ed",
    "PLACE": "#68d391",
    "THING": "#fc8181",
    "NAME": "#d6bcfa",
}
DEFAULT_COLOR = "#a0aec0"


def extract_entities_and_links(data: dict) -> tuple:
    """Extract entities and co-occurrence links from BHB analysis data."""
    doc = data.get("complete_document", {})
    notes = doc.get("notes", [])

    entities = {}  # id -> {name, type}
    links = set()  # (source_id, target_id)

    for note in notes:
        tokens = note.get("tokens", [])
        note_entities = []

        for token in tokens:
            name_type = token.get("nameType", "UNKNOWN")
            if name_type and name_type != "UNKNOWN":
                eid = token.get("_id", token.get("spelling", ""))
                if eid:
                    entities[eid] = {
                        "name": token.get("spelling", eid),
                        "type": name_type,
                    }
                    note_entities.append(eid)

        # Create co-occurrence links between entities in the same note
        for i in range(len(note_entities)):
            for j in range(i + 1, len(note_entities)):
                a, b = sorted([note_entities[i], note_entities[j]])
                links.add((a, b))

    return entities, links


def build_graph(entities: dict, links: set) -> nx.Graph:
    """Build a NetworkX graph from entities and links."""
    G = nx.Graph()

    for eid, info in entities.items():
        G.add_node(eid, label=info["name"], entity_type=info["type"])

    for a, b in links:
        if a in entities and b in entities:
            G.add_edge(a, b)

    return G


def plot_entity_network(G: nx.Graph, output_path: str):
    """Generate and save the entity network visualization."""
    if len(G.nodes) == 0:
        print("No entities found in the analysis data.")
        return

    fig, ax = plt.subplots(1, 1, figsize=(16, 12), facecolor="#0a0a0a")
    ax.set_facecolor("#0a0a0a")

    # Layout
    if len(G.nodes) < 50:
        pos = nx.spring_layout(G, k=2.0, iterations=80, seed=42)
    else:
        pos = nx.kamada_kawai_layout(G)

    # Node colors based on entity type
    node_colors = []
    for node in G.nodes():
        etype = G.nodes[node].get("entity_type", "")
        node_colors.append(ENTITY_COLORS.get(etype, DEFAULT_COLOR))

    # Node sizes based on degree
    degrees = dict(G.degree())
    node_sizes = [max(100, degrees[node] * 80) for node in G.nodes()]

    # Draw edges
    nx.draw_networkx_edges(
        G, pos, ax=ax,
        edge_color="#4a5568",
        alpha=0.3,
        width=0.8,
    )

    # Draw nodes
    nx.draw_networkx_nodes(
        G, pos, ax=ax,
        node_color=node_colors,
        node_size=node_sizes,
        alpha=0.85,
        edgecolors="#1a202c",
        linewidths=1.5,
    )

    # Draw labels for higher-degree nodes
    labels = {}
    for node in G.nodes():
        if degrees[node] >= 2 or len(G.nodes) < 20:
            labels[node] = G.nodes[node].get("label", node)[:20]

    nx.draw_networkx_labels(
        G, pos, labels, ax=ax,
        font_size=7,
        font_color="#e2e8f0",
        font_weight="bold",
    )

    # Legend
    legend_patches = []
    for etype, color in ENTITY_COLORS.items():
        count = sum(1 for n in G.nodes() if G.nodes[n].get("entity_type") == etype)
        if count > 0:
            legend_patches.append(mpatches.Patch(color=color, label=f"{etype} ({count})"))

    if legend_patches:
        legend = ax.legend(
            handles=legend_patches,
            loc="upper left",
            facecolor="#1a202c",
            edgecolor="#4a5568",
            fontsize=8,
            labelcolor="#e2e8f0",
        )
        legend.get_frame().set_alpha(0.9)

    # Title
    ax.set_title(
        f"Entity Network — {len(G.nodes)} entities, {len(G.edges)} connections",
        color="#60a5fa",
        fontsize=14,
        fontweight="bold",
        pad=20,
    )

    ax.axis("off")
    plt.tight_layout()

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    plt.savefig(output_path, dpi=150, bbox_inches="tight", facecolor="#0a0a0a")
    plt.close()
    print(f"Entity network saved to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate entity network graph from BHB analysis")
    parser.add_argument("--input", default="output/analysis.json", help="Path to BHB analysis JSON")
    parser.add_argument("--output", default="output/entity_network.png", help="Output image path")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        print("Run analyze_document.py first to generate the analysis JSON.")
        sys.exit(1)

    with open(args.input) as f:
        data = json.load(f)

    entities, links = extract_entities_and_links(data)
    print(f"Found {len(entities)} entities and {len(links)} co-occurrence links")

    G = build_graph(entities, links)
    plot_entity_network(G, args.output)


if __name__ == "__main__":
    main()

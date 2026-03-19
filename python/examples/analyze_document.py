#!/usr/bin/env python3
"""
Analyze a Document with the BHB API

Authenticates, sends a document URL for analysis, and saves the raw JSON
response to a file. This is the starting point for all other visualization
examples.

Usage:
    python examples/analyze_document.py --url "https://en.wikipedia.org/wiki/MissingNo."
    python examples/analyze_document.py --url "https://en.wikipedia.org/wiki/Voynich_manuscript" --output output/voynich.json
"""

import argparse
import json
import os
import sys

from dotenv import load_dotenv

# Allow importing bhb_client from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from bhb_client import BHBClient


def main():
    parser = argparse.ArgumentParser(description="Analyze a document with the BHB API")
    parser.add_argument("--url", required=True, help="Public URL of the document to analyze")
    parser.add_argument("--email", default=None, help="Your registered email (or set BHB_EMAIL env var)")
    parser.add_argument("--type", default="developer", choices=["user", "business", "academic", "developer"], help="User type")
    parser.add_argument("--output", default="output/analysis.json", help="Path to save the JSON response")
    args = parser.parse_args()

    # Load environment variables from .env file
    load_dotenv()

    client_id = os.getenv("BHB_CLIENT_ID")
    client_secret = os.getenv("BHB_CLIENT_SECRET")
    email = args.email or os.getenv("BHB_EMAIL")

    if not client_id or not client_secret:
        print("Error: BHB_CLIENT_ID and BHB_CLIENT_SECRET must be set in .env or environment")
        sys.exit(1)
    if not email:
        print("Error: Email must be provided via --email or BHB_EMAIL env var")
        sys.exit(1)

    # Initialize client and run analysis
    client = BHBClient(client_id=client_id, client_secret=client_secret)

    print(f"Analyzing: {args.url}")
    print(f"User type: {args.type}")
    print("Authenticating...")

    try:
        result = client.analyze(url=args.url, email=email, user_type=args.type)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    # Save the result
    with open(args.output, "w") as f:
        json.dump(result, f, indent=2)

    # Print summary
    doc = result.get("complete_document", {})
    sentences = doc.get("sentences", [])
    notes = doc.get("notes", [])
    errata = doc.get("errata", [])

    print(f"\n{'='*50}")
    print(f"Analysis Complete!")
    print(f"{'='*50}")
    print(f"  Sentences: {len(sentences)}")
    print(f"  Notes:     {len(notes)}")
    print(f"  Errata:    {len(errata)}")
    print(f"  Saved to:  {args.output}")

    # Count unique entities
    entity_types = {}
    for note in notes:
        for token in note.get("tokens", []):
            name_type = token.get("nameType", "UNKNOWN")
            if name_type != "UNKNOWN":
                entity_types[name_type] = entity_types.get(name_type, 0) + 1

    if entity_types:
        print(f"\n  Entity Types Found:")
        for etype, count in sorted(entity_types.items(), key=lambda x: -x[1]):
            print(f"    {etype}: {count}")


if __name__ == "__main__":
    main()

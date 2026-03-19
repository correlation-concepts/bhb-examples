"""
BHB API Client

A Python client for authenticating with and querying the BigHugeBrain (BHB)
document analysis API. Handles OAuth2 token exchange and document analysis
requests.

Usage:
    from bhb_client import BHBClient

    client = BHBClient(client_id="...", client_secret="...")
    result = client.analyze(
        url="https://en.wikipedia.org/wiki/MissingNo.",
        email="your@email.com",
        user_type="developer"
    )
"""

import time
import requests
from typing import Optional


AUTH_URL = "https://correlationconcepts.us.auth0.com/oauth/token"
API_BASE_URL = "https://server.proggor.com"
AUDIENCE = "server.proggor.com"


class BHBClient:
    """Client for the BHB document analysis API."""

    def __init__(self, client_id: str, client_secret: str):
        """
        Initialize the BHB client.

        Args:
            client_id: OAuth2 client ID from Correlation Concepts.
            client_secret: OAuth2 client secret from Correlation Concepts.
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self._access_token: Optional[str] = None
        self._token_expiry: float = 0

    def _get_access_token(self) -> str:
        """
        Obtain or refresh the OAuth2 access token.

        Returns:
            A valid JWT access token string.

        Raises:
            requests.HTTPError: If the authentication request fails.
        """
        # Return cached token if still valid (with 60s buffer)
        if self._access_token and time.time() < self._token_expiry - 60:
            return self._access_token

        response = requests.post(
            AUTH_URL,
            headers={"content-type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "audience": AUDIENCE,
            },
        )
        response.raise_for_status()

        token_data = response.json()
        self._access_token = token_data["access_token"]
        self._token_expiry = time.time() + token_data.get("expires_in", 86400)

        return self._access_token

    def analyze(
        self,
        url: str,
        email: str,
        user_type: str = "developer",
        key: int = 1000000030,
    ) -> dict:
        """
        Analyze a document at the given URL.

        Args:
            url: Public URL of the document to analyze.
            email: Your registered email address.
            user_type: One of 'user', 'business', 'academic', 'developer'.
            key: API key value (default: 1000000030).

        Returns:
            The full JSON response from the BHB API as a dictionary.
            Contains 'complete_document' with 'sentences', 'notes', and 'errata'.

        Raises:
            requests.HTTPError: If the analysis request fails.
        """
        token = self._get_access_token()
        ts = int(time.time())

        response = requests.post(
            f"{API_BASE_URL}/",
            headers={
                "Authorization": f"Bearer {token}",
                "content-type": "application/x-www-form-urlencoded",
            },
            data={
                "url": url,
                "email": email,
                "type": user_type,
                "ts": str(ts),
                "key": str(key),
            },
        )
        response.raise_for_status()
        return response.json()

"""
Turns a persona + feature vector into a short natural-language insight shown
on the Dashboard's "Traveler Insights" card. Works fully offline by default
(templated), and upgrades to a real Claude API call automatically if
ANTHROPIC_API_KEY is set in the environment - this is the one place an LLM
sits on top of the trained models, rather than replacing them.
"""
import os
import httpx

TEMPLATES = {
    "Solo Budget Traveler": "You mostly travel solo and consistently pick the cheapest option available — TripSpot leans your fare board toward price over polish.",
    "Family Group Traveler": "You usually travel with family, often including children — TripSpot prioritizes comfort and reliability over the absolute lowest fare.",
    "Frequent Business Flyer": "You fly often and book close to departure — TripSpot surfaces fast, reliable options first, even at a premium.",
    "Weekend Explorer": "You travel in small groups, mostly on weekends — TripSpot highlights well-rated options that suit a short getaway.",
    "Luxury Solo Traveler": "You travel solo and rarely choose the cheapest option — TripSpot weights comfort and rating over price for you.",
    "Balanced Traveler": "Your travel habits don't lean strongly any one way yet — TripSpot is ranking fares close to a balanced price/comfort mix while it learns more.",
}


def _template_insight(persona: str, features: dict, is_new: bool) -> str:
    if is_new:
        return "Welcome aboard — book a few trips and TripSpot will start personalizing your fare board to how you actually travel."
    return TEMPLATES.get(persona, TEMPLATES["Balanced Traveler"])


def generate_insight(persona: str, features: dict, is_new: bool) -> str:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return _template_insight(persona, features, is_new)

    try:
        prompt = (
            f"A travel app classified a user as persona '{persona}' based on their "
            f"trip history stats: {features}. In one warm, concise sentence "
            f"(under 30 words), explain to the user what this means for how "
            f"their fare results are personalized. No greeting, just the sentence."
        )
        resp = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 100,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=6.0,
        )
        resp.raise_for_status()
        data = resp.json()
        text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
        return text_blocks[0].strip() if text_blocks else _template_insight(persona, features, is_new)
    except Exception:
        # Fail soft - a slow/broken LLM call should never break the dashboard
        return _template_insight(persona, features, is_new)

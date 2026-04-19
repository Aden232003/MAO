#!/usr/bin/env python3.11
"""
MAO reveal — audio generation.
Uses Gemini Lyria-3-pro-preview for the music bed.

Usage:
    GEMINI_API_KEY=xxx python3.11 scripts/generate-audio.py
"""

import mimetypes
import os
import sys
from pathlib import Path

from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
if not API_KEY:
    print("ERROR: set GEMINI_API_KEY in the environment first.", file=sys.stderr)
    sys.exit(1)

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "audio"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MUSIC_PROMPT = """A 14-second cinematic ambient brand-reveal music bed.

Style: premium, restrained, founder-led, anticipatory. Think Apple product reveal
or a luxury watch launch trailer. Not EDM, not trailer-boom, not cheesy risers.

Instrumentation: soft evolving synth pad (warm, wide), low sub-bass pulse at 60 BPM,
subtle analog texture. No drums, no percussion, no melody, no vocals.

Arc: starts quiet and spacious in the first 3 seconds; tension grows subtly through
the middle 8 seconds with a gentle harmonic rise; resolves with a single clean low
impact hit at around 13 seconds, followed by a short 1-second decay tail.

Mood: something serious is opening. Exclusive. Limited. Already in motion.
Instrumental only. No speech."""

SUSTAIN_PROMPT = """An 8-second minimal cinematic ambient tail. It continues in the
aftermath of a brand-reveal sequence — as if a low impact hit has just landed and
the room is breathing in the afterglow.

Instrumentation: one warm sustained synth pad (soft, wide, slowly evolving), a
very low sub-bass drone holding steady, subtle analog air / room-tone texture.
No drums, no percussion, no melody, no vocals, no new builds or risers.

Arc: begins at a quiet, confident level and holds steady for the first 4 seconds,
then gently tapers over the remaining 4 seconds into a soft reverberant decay,
ending in clean silence.

Mood: founder-led stillness, premium after-glow, the moment a screenshot gets
taken. Instrumental only."""


def save_stream(prompt: str, output_basename: str) -> Path | None:
    """Run Lyria once and save whatever audio it streams to public/audio/."""
    client = genai.Client(api_key=API_KEY)
    model = "lyria-3-pro-preview"

    contents = [
        types.Content(role="user", parts=[types.Part.from_text(text=prompt)]),
    ]
    config = types.GenerateContentConfig(response_modalities=["audio"])

    audio_bytes = b""
    mime_type = "audio/mp3"

    print(f"▸ requesting Lyria for: {output_basename}")
    try:
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=config,
        ):
            if chunk.parts is None:
                continue
            # Iterate through every part — audio may not be parts[0].
            for part in chunk.parts:
                inline = getattr(part, "inline_data", None)
                if inline and getattr(inline, "data", None):
                    audio_bytes += inline.data
                    mime_type = inline.mime_type or mime_type
            if getattr(chunk, "text", None):
                print(f"  (lyria said): {chunk.text[:120]}")
    except Exception as exc:
        print(f"  ✗ Lyria request failed: {exc}")
        return None

    if not audio_bytes:
        print("  ✗ empty audio payload")
        return None

    ext = mimetypes.guess_extension(mime_type) or ".mp3"
    out_path = OUT_DIR / f"{output_basename}{ext}"
    out_path.write_bytes(audio_bytes)
    print(f"  ✓ saved {out_path} ({len(audio_bytes):,} bytes, mime={mime_type})")
    return out_path


def main() -> None:
    print(f"Output dir: {OUT_DIR}")

    # Don't regenerate the main music bed if it already exists — it's approved.
    if (OUT_DIR / "music-bed.mp3").exists():
        print("▸ music-bed.mp3 already exists — skipping regeneration")
    else:
        music_path = save_stream(MUSIC_PROMPT, "music-bed")
        if music_path is None:
            print("\nMusic bed generation failed.")
            sys.exit(2)
        if music_path.suffix != ".mp3":
            alias = OUT_DIR / "music-bed.mp3"
            alias.write_bytes(music_path.read_bytes())
            print(f"  ▸ aliased to {alias}")

    # Always regenerate sustain tail (cheap + user might tune prompt).
    sustain_path = save_stream(SUSTAIN_PROMPT, "sustain-tail")
    if sustain_path is None:
        print("\nSustain tail generation failed — the final 6s will be silent.")
    elif sustain_path.suffix != ".mp3":
        alias = OUT_DIR / "sustain-tail.mp3"
        alias.write_bytes(sustain_path.read_bytes())
        print(f"  ▸ aliased to {alias}")

    print("\n✓ audio ready — run `npm run build` to render the final MP4.")


if __name__ == "__main__":
    main()

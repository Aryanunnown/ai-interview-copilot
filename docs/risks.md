# Risks

## Product And Compliance

- Live interview assistance may violate employer or platform rules.
- Audio capture may require consent depending on jurisdiction.
- Interview transcripts may contain sensitive personal or proprietary data.

## Technical

- Realtime usefulness depends on low transcription and suggestion latency.
- Browser audio capture support varies by operating system and browser.
- Transcription quality can degrade with background noise, accents, or overlapping speakers.
- AI-generated suggestions can hallucinate unless grounded in user-provided context.
- Streaming AI and transcription can become expensive without usage controls.

## Security

- Provider API keys must never be exposed to clients.
- WebSocket sessions need authentication, rate limits, and backpressure.
- Uploaded files require validation and isolated parsing.
- User content can contain prompt injection attempts.

## Operational

- Realtime services need separate scaling from REST APIs.
- Provider outages require graceful degradation.
- Data retention policies must be explicit before production use.

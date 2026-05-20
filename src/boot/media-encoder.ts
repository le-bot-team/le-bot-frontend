import { defineBoot } from '#q-app/wrappers';
import { register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

export default defineBoot(async () => {
  try {
    await register(await connect());
  } catch (error) {
    // WAV encoder requires SharedArrayBuffer (secure context + COOP/COEP headers).
    // Gracefully degrade — chat audio recording will fall back to default encoding.
    console.warn('[media-encoder] Failed to initialize WAV encoder:', error);
  }
});

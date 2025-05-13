import { defineBoot } from '#q-app/wrappers';
import { register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

export default defineBoot(async () => {
  await register(await connect());
});

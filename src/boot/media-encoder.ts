import { register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

await register(await connect());

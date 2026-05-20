import type MockAdapter from 'axios-mock-adapter';

import { MOCK_PERSONS } from 'src/mock/data/voiceprint';
import { mockError, mockId, mockSuccess } from 'src/mock/utils';

import type { Person, PersonDetail, UpdatePersonRequest } from 'src/types/api/voiceprint';
import type { VprRelationship } from 'components/vpr-relationships';

/** Mutable deep copy of persons that mock endpoints operate on.
 * Re-initialized on each call to setupVoiceprintMock (supports HMR). */
let persons: PersonDetail[];

/**
 * Register mock handlers for the voiceprint module.
 */
export function setupVoiceprintMock(mock: MockAdapter): void {
  // Reset mutable state on each setup (HMR-safe)
  persons = JSON.parse(JSON.stringify(MOCK_PERSONS)) as PersonDetail[];
  // Recognize voiceprint
  mock.onPost('/voiceprint/recognize').reply(() => {
    const personsWithVoices = persons.filter((p) => p.voices.length > 0);
    if (personsWithVoices.length === 0) {
      return [200, mockError('未找到匹配的声纹')];
    }

    const person = personsWithVoices[Math.floor(Math.random() * personsWithVoices.length)]!;
    const voice = person.voices[0]!;

    return [
      200,
      mockSuccess({
        person_id: person.person_id,
        voice_id: voice.voice_id,
        confidence: 0.85 + Math.random() * 0.14,
        similarity: 0.8 + Math.random() * 0.19,
        processing_time_ms: Math.floor(100 + Math.random() * 200),
        details: [],
        name: person.name,
        age: person.age,
        address: person.address,
        relationship: person.relationship,
        metadata: person.metadata,
      }),
    ];
  });

  // Register a new voiceprint person
  mock.onPost('/voiceprint/register').reply((config) => {
    let data: {
      audio: string;
      name: string;
      age: number;
      relationship: VprRelationship;
      address?: string;
      isTemporal?: boolean;
    };
    try {
      data = JSON.parse(config.data ?? '{}');
    } catch {
      return [200, mockError('请求数据格式错误')];
    }

    if (!data.audio || !data.name) {
      return [200, mockError('音频数据和人名不能为空')];
    }

    const personId = mockId();
    const voiceId = mockId();

    const newPerson: PersonDetail = {
      person_id: personId,
      voice_count: 1,
      is_temporal: data.isTemporal ?? false,
      name: data.name,
      age: data.age,
      relationship: data.relationship,
      voices: [
        {
          voice_id: voiceId,
          feature_vector: Array.from({ length: 4 }, () => Math.random()),
          created_at: new Date().toISOString(),
        },
      ],
    };
    if (data.address !== undefined) {
      newPerson.address = data.address;
    }

    persons.push(newPerson);
    console.log(`[Mock Voiceprint] Registered person: ${data.name} (${personId})`);

    return [
      200,
      mockSuccess({
        person_id: personId,
        person_name: data.name,
        voice_id: voiceId,
        voice_count: 1,
        registration_time: new Date().toISOString(),
      }),
    ];
  });

  // Get all persons
  mock.onGet('/voiceprint/persons').reply(() => {
    // Rebuild list from mutable array
    const list: Person[] = persons.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ voices, ...rest }) => rest,
    );
    return [200, mockSuccess(list)];
  });

  // Get single person detail
  mock.onGet(/\/voiceprint\/persons\/([^/]+)$/).reply((config: { url?: string }) => {
    const personId = extractLastPathSegment(config.url ?? '');
    const person = persons.find((p) => p.person_id === personId);

    if (!person) {
      return [200, mockError('人物不存在')];
    }

    return [200, mockSuccess({ ...person })];
  });

  // Update person info
  mock.onPut(/\/voiceprint\/persons\/([^/]+)$/).reply((config) => {
    const personId = extractLastPathSegment(config.url ?? '');
    const person = persons.find((p) => p.person_id === personId);

    if (!person) {
      return [200, mockError('人物不存在')];
    }

    let data: UpdatePersonRequest;
    try {
      data = JSON.parse(config.data ?? '{}');
    } catch {
      return [200, mockError('请求数据格式错误')];
    }
    if (data.name !== undefined) person.name = data.name;
    if (data.relationship !== undefined) person.relationship = data.relationship;
    if (data.isTemporal !== undefined) person.is_temporal = data.isTemporal;

    console.log(`[Mock Voiceprint] Updated person: ${personId}`);
    return [200, { success: true as const }];
  });

  // Delete person
  mock.onDelete(/\/voiceprint\/persons\/([^/]+)$/).reply((config: { url?: string }) => {
    const personId = extractLastPathSegment(config.url ?? '');
    const index = persons.findIndex((p) => p.person_id === personId);

    if (index === -1) {
      return [200, mockError('人物不存在')];
    }

    persons.splice(index, 1);
    console.log(`[Mock Voiceprint] Deleted person: ${personId}`);
    return [200, { success: true as const }];
  });

  // Add voice to person
  mock.onPost(/\/voiceprint\/persons\/([^/]+)\/voices\/add$/).reply((config: { url?: string }) => {
    const personId = extractPersonIdFromVoiceUrl(config.url ?? '');
    const person = persons.find((p) => p.person_id === personId);

    if (!person) {
      return [200, mockError('人物不存在')];
    }

    const newVoice = {
      voice_id: mockId(),
      feature_vector: Array.from({ length: 4 }, () => Math.random()),
      created_at: new Date().toISOString(),
    };

    person.voices.push(newVoice);
    person.voice_count = person.voices.length;

    console.log(`[Mock Voiceprint] Added voice to ${personId}`);
    return [200, { success: true as const }];
  });

  // Update voice
  mock
    .onPut(/\/voiceprint\/persons\/([^/]+)\/voices\/([^/]+)$/)
    .reply((config: { url?: string }) => {
      const personId = extractPersonIdFromVoiceUrl(config.url ?? '');
      const voiceId = extractLastPathSegment(config.url ?? '');
      const person = persons.find((p) => p.person_id === personId);

      if (!person) {
        return [200, mockError('人物不存在')];
      }

      const voice = person.voices.find((v) => v.voice_id === voiceId);
      if (!voice) {
        return [200, mockError('声音不存在')];
      }

      voice.feature_vector = Array.from({ length: 4 }, () => Math.random());
      voice.created_at = new Date().toISOString();

      console.log(`[Mock Voiceprint] Updated voice ${voiceId} for ${personId}`);
      return [
        200,
        mockSuccess({
          person_id: personId,
          voice_id: voiceId,
          voice_count: person.voice_count,
        }),
      ];
    });

  // Delete voice
  mock
    .onDelete(/\/voiceprint\/persons\/([^/]+)\/voices\/([^/]+)$/)
    .reply((config: { url?: string }) => {
      const personId = extractPersonIdFromVoiceUrl(config.url ?? '');
      const voiceId = extractLastPathSegment(config.url ?? '');
      const person = persons.find((p) => p.person_id === personId);

      if (!person) {
        return [200, mockError('人物不存在')];
      }

      const voiceIndex = person.voices.findIndex((v) => v.voice_id === voiceId);
      if (voiceIndex === -1) {
        return [200, mockError('声音不存在')];
      }

      person.voices.splice(voiceIndex, 1);
      person.voice_count = person.voices.length;

      console.log(`[Mock Voiceprint] Deleted voice ${voiceId} from ${personId}`);
      return [200, { success: true as const }];
    });
}

function extractLastPathSegment(url: string): string {
  const segments = url.replace(/\/$/, '').split('/');
  return segments[segments.length - 1] ?? '';
}

/**
 * Extract person ID from voice-related URLs like:
 *   /voiceprint/persons/:personId/voices/add
 *   /voiceprint/persons/:personId/voices/:voiceId
 * The personId is always the segment immediately after "persons".
 */
function extractPersonIdFromVoiceUrl(url: string): string {
  const match = url.match(/\/persons\/([^/]+)\/voices/);
  return match?.[1] ?? '';
}

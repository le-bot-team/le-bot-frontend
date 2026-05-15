import type { Person, PersonDetail } from 'src/types/api/voiceprint';

/**
 * Preset mock voiceprint persons for testing voiceprint CRUD and recognition flows.
 */
export const MOCK_PERSONS: PersonDetail[] = [
  {
    person_id: 'mock-person-00000000-0000-0000-0000-000000000001',
    voice_count: 2,
    is_temporal: false,
    name: '张三',
    age: 30,
    address: '北京',
    relationship: 'self',
    voices: [
      {
        voice_id: 'mock-voice-00000000-0000-0000-0000-000000000011',
        feature_vector: [0.12, 0.34, 0.56, 0.78],
        created_at: '2024-06-01T08:00:00.000Z',
      },
      {
        voice_id: 'mock-voice-00000000-0000-0000-0000-000000000012',
        feature_vector: [0.11, 0.33, 0.55, 0.77],
        created_at: '2024-07-01T08:00:00.000Z',
      },
    ],
  },
  {
    person_id: 'mock-person-00000000-0000-0000-0000-000000000002',
    voice_count: 1,
    is_temporal: false,
    name: '李四',
    age: 25,
    address: '上海',
    relationship: 'family',
    voices: [
      {
        voice_id: 'mock-voice-00000000-0000-0000-0000-000000000021',
        feature_vector: [0.22, 0.44, 0.66, 0.88],
        created_at: '2024-08-01T08:00:00.000Z',
      },
    ],
  },
  {
    person_id: 'mock-person-00000000-0000-0000-0000-000000000003',
    voice_count: 1,
    is_temporal: true,
    expire_date: '2025-06-01T08:00:00.000Z',
    name: '访客临时',
    age: 35,
    address: '深圳',
    relationship: 'friend',
    voices: [
      {
        voice_id: 'mock-voice-00000000-0000-0000-0000-000000000031',
        feature_vector: [0.32, 0.54, 0.76, 0.98],
        created_at: '2024-09-01T08:00:00.000Z',
      },
    ],
  },
];

/**
 * Convert PersonDetail[] to Person[] (list view, no voices array).
 */
export const MOCK_PERSONS_LIST: Person[] = MOCK_PERSONS.map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ voices, ...rest }) => rest,
);

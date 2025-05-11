export const constructChatConfig = (userId: string) => ({
  data: {
    chat_config: {
      auto_save_history: true,
      user_id: userId,
      meta_data: {},
      custom_variables: {},
      extra_params: {},
      parameters: {},
    },
    input_audio: {
      format: 'wav',
      codec: 'pcm',
      sample_rate: 24000,
      channel: 1,
      bit_depth: 16,
    },
    output_audio: {
      codec: 'pcm',
      pcm_config: {
        sample_rate: 24000,
        frame_size_ms: 50,
        limit_config: {
          period: 1,
          max_frame_num: 22,
        },
      },
      speech_rate: 0,
      voice_id: '7426720361733046281',
    },
  },
});

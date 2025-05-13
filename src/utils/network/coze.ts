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
      speech_rate: 0,
      voice_id: '7426725529589596187',
    },
  },
});

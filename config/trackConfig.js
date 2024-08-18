export const trackConfigs = {
  scene_1: {
    nutmeg: {
      tracks: [
        '/nutmeg/nutmeg_a_80.wav',
        '/nutmeg/nutmeg_aM3_80.wav',
        '/nutmeg/nutmeg_aMT_80.wav',
        '/nutmeg/nutmeg_fs_80.wav',
        '/nutmeg/nutmeg_fsm3_80.wav'
      ],
      imagePrefix: '/img/instr_2_',
    },
    piano: {
      tracks: [
        '/piano/piano_dM_80.wav',
        '/piano/piano_dM7oFs_80.wav',
        '/piano/piano_dM9oFs_80.wav'
      ],
      imagePrefix: '/img/instr_1_',
    },
    viola: {
      tracks: [
        '/viola/viola_a_80.wav',
        '/viola/viola_b_80.wav',
        '/viola/viola_fs_80.wav'
      ],
      imagePrefix: '/img/instr_3_',
    },
    reese: {
      tracks: [
        '/reese/reese_d_80.wav',
        '/reese/reese_b_80.wav',
        '/reese/reese_fs_80.wav'
      ],
      imagePrefix: '/img/instr_4_',
    },
    bpm: 80, // Beats per minute
    beatsPerBar: 4,
    get secondsPerBeat() {
      return 60 / this.bpm;
    },
  },
  scene_2: {
    nutmeg: {
      tracks: [
        '/nutmeg/nutmeg_a_80.wav',
        '/nutmeg/nutmeg_aM3_80.wav',
        '/nutmeg/nutmeg_aMT_80.wav',
        '/nutmeg/nutmeg_fs_80.wav',
        '/nutmeg/nutmeg_fsm3_80.wav'
      ],
      imagePrefix: '/img/instr_2_',
    },
    piano: {
      tracks: [
        '/piano/piano_dM_80.wav',
        '/piano/piano_dM7oFs_80.wav',
        '/piano/piano_dM9oFs_80.wav'
      ],
      imagePrefix: '/img/instr_1_',
    },
    viola: {
      tracks: [
        '/viola/viola_a_80.wav',
        '/viola/viola_b_80.wav',
        '/viola/viola_fs_80.wav'
      ],
      imagePrefix: '/img/instr_3_',
    },
    reese: {
      tracks: [
        '/reese/reese_d_80.wav',
        '/reese/reese_b_80.wav',
        '/reese/reese_fs_80.wav'
      ],
      imagePrefix: '/img/instr_4_',
    },
    bpm: 80, // Beats per minute
    beatsPerBar: 4,
    get secondsPerBeat() {
      return 60 / this.bpm;
    },
  },
  // Additional scenes can be added here
  // scene_2: { ... }
  // scene_3: { ... }
};

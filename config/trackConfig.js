export const trackConfigs = {
  scene_1: {
    nutmeg: {
      tracks: [
        '/b1/nutmeg/nutmeg_a_80.wav',
        '/b1/nutmeg/nutmeg_aM3_80.wav',
        '/b1/nutmeg/nutmeg_aMT_80.wav',
        '/b1/nutmeg/nutmeg_fs_80.wav',
        '/b1/nutmeg/nutmeg_fsm3_80.wav'
      ],
      imagePrefix: '/img/instr_2_',
    },
    piano: {
      tracks: [
        '/b1/piano/piano_dM_80.wav',
        '/b1/piano/piano_dM7oFs_80.wav',
        '/b1/piano/piano_dM9oFs_80.wav'
      ],
      imagePrefix: '/img/instr_1_',
    },
    viola: {
      tracks: [
        '/b1/viola/viola_a_80.wav',
        '/b1/viola/viola_b_80.wav',
        '/b1/viola/viola_fs_80.wav'
      ],
      imagePrefix: '/img/instr_3_',
    },
    reese: {
      tracks: [
        '/b1/reese/reese_d_80.wav',
        '/b1/reese/reese_b_80.wav',
        '/b1/reese/reese_fs_80.wav'
      ],
      imagePrefix: '/img/instr_4_',
    },
    featuredArtist: {
      name: "CO.GA",
      spotifyLink: "https://open.spotify.com/artist/5MUjMywaSDPTVm82XIlCQS?si=ceb4bf6b77394716"
    },
    backgroundColor: 'hsl(256, 46.15%, 25.49%)',
    bpm: 80, // Beats per minute
    beatsPerBar: 4,
    get secondsPerBeat() {
      return 60 / this.bpm;
    },
  },
  scene_2: {
    reese: {
      tracks: [
        'b2/reese/as.wav',
        'b2/reese/cs.wav',
        'b2/reese/ds.wav',
        'b2/reese/fs.wav',
        'b2/reese/gs.wav'
      ],
      imagePrefix: '/img/instr_5_',
    },
    pad: {
      tracks: [
        'b2/pad/as.wav',
        'b2/pad/c.wav',
        'b2/pad/ds.wav',
        'b2/pad/f.wav',
        'b2/pad/gs.wav'
      ],
      imagePrefix: '/img/instr_6_',
    },
    arp: {
      tracks: [
        'b2/arp/f.wav',
        'b2/arp/fs.wav',
        'b2/arp/gs.wav'
      ],
      imagePrefix: '/img/instr_7_',
    },
    guitar: {
      tracks: [
        'b2/guitar/g1.wav',
        'b2/guitar/g2.wav',
        'b2/guitar/g3.wav'
      ],
      imagePrefix: '/img/instr_8_',
    },
    vocal: {
      tracks: [
        'b2/vocal/v1.wav',
        'b2/vocal/v2.wav',
        'b2/vocal/v3.wav'
      ],
      imagePrefix: '/img/instr_9_',
    },
    // drum: {
    //   tracks: [
    //     'b2/drums/d1.wav',
    //     'b2/drums/d2.wav',
    //     'b2/drums/d3.wav'
    //   ],
    //   imagePrefix: '/img/instr_4_',
    // },
    featuredArtist: {
      name: "CO.GA",
      spotifyLink: "https://open.spotify.com/artist/5MUjMywaSDPTVm82XIlCQS?si=ceb4bf6b77394716"
    },
    backgroundColor: 'hsl(144, 21%, 27%)',
    bpm: 90,
    beatsPerBar: 4,
    get secondsPerBeat() {
      return 60 / this.bpm;
    },
  },
};

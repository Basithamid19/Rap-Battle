/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BeatStyle } from '../types.js';

class RapBeatEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private bpm = 90;
  private currentBeatStyle: BeatStyle = 'boho-boombap';
  private currentStep = 0;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private vinylGain: GainNode | null = null;
  private isMuted = false;
  private volume = 0.85;

  // Track active speech for cleanup
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private initAudio() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master bus with compression for a fat studio punch
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.1, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);

      // Start vinyl crackle layer
      this.setupVinylCrackle();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupVinylCrackle() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Sparse clicks + pink dust
        const isClick = Math.random() < 0.0008;
        output[i] = isClick ? (Math.random() * 2 - 1) * 0.4 : (Math.random() * 2 - 1) * 0.015;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.0;

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.value = 0.04; // subtle background warmth

      whiteNoise.connect(filter);
      filter.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain);

      whiteNoise.start();
    } catch {
      // Audio buffer fallback
    }
  }

  // 808 Sub-Bass / Punch Kick Drum
  private playKick(time: number, isSub = false) {
    if (!this.ctx || !this.masterGain) return;

    // Body Oscillator (Pitch-dropped sine)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = isSub ? 160 : 130;
    const endFreq = isSub ? 42 : 50;
    const decay = isSub ? 0.45 : 0.3;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.07);

    // Punch transient
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    // Warm soft saturation curve
    const waveShaper = this.ctx.createWaveShaper();
    waveShaper.curve = this.makeDistortionCurve(15);

    osc.connect(waveShaper);
    waveShaper.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + decay);

    // Click attack
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(320, time);
    click.frequency.exponentialRampToValueAtTime(30, time + 0.02);
    clickGain.gain.setValueAtTime(0.4, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(time);
    click.stop(time + 0.02);
  }

  // Boom-Bap Crisp Snare Drum
  private playSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Noise component (snare wires)
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1100;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);

    // Tonal body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, time);
    osc.frequency.exponentialRampToValueAtTime(95, time + 0.12);

    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  // Metallic Hi-Hat (Closed & Open)
  private playHiHat(time: number, isOpen = false) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * (isOpen ? 0.35 : 0.06);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8500;
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.35 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isOpen ? 0.28 : 0.05));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
  }

  // Melodic Bohemian Chord Synth / Riff
  private playChord(time: number, chordType: number) {
    if (!this.ctx || !this.masterGain) return;

    // Boho chords: Dm9, Fmaj7, Gm7, Am7
    const chordFrequencies: number[][] = [
      [146.83, 174.61, 220.00, 261.63], // D minor 7
      [174.61, 220.00, 261.63, 329.63], // F major 7
      [196.00, 233.08, 293.66, 349.23], // G minor 7
      [220.00, 261.63, 329.63, 392.00], // A minor 7
    ];

    const notes = chordFrequencies[chordType % chordFrequencies.length];

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = this.currentBeatStyle === 'desert-trap' ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      // Add gentle boho vibrato
      osc.detune.setValueAtTime((i - 1.5) * 5, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.currentBeatStyle === 'desert-trap' ? 1400 : 850, time);
      filter.frequency.exponentialRampToValueAtTime(350, time + 0.7);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.9);
    });
  }

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // 16-step rhythmic pattern sequencer
  private stepBeat() {
    if (!this.isPlaying || !this.ctx) return;

    const time = this.ctx.currentTime + 0.05;
    const step = this.currentStep % 16;
    const bar = Math.floor(this.currentStep / 16) % 4;

    // Boom-Bap & Trap Patterns
    if (this.currentBeatStyle === 'desert-trap') {
      // Trap Kick: Heavy on 0, 7, 10
      if (step === 0 || step === 7 || step === 10) {
        this.playKick(time, true);
      }
      // Snare on 8 (half-time)
      if (step === 8) {
        this.playSnare(time);
      }
      // Trap hats: 16ths + rolls on 14, 15
      if (step % 2 === 0 || step >= 12) {
        this.playHiHat(time, step === 14);
      }
    } else {
      // Classic Boom-Bap / Golden Era
      // Kick on 0, 3 (sometimes), 10
      if (step === 0 || (bar % 2 === 1 && step === 3) || step === 10) {
        this.playKick(time, false);
      }
      // Snare on 4 and 12 (backbeat)
      if (step === 4 || step === 12) {
        this.playSnare(time);
      }
      // Hi-Hats on straight 8ths with swing
      if (step % 2 === 0) {
        this.playHiHat(time, step === 6 || step === 14);
      }
    }

    // Chords on bar boundaries
    if (step === 0) {
      this.playChord(time, bar);
    }

    this.currentStep++;
  }

  public startBeat(style: BeatStyle = 'boho-boombap') {
    this.initAudio();
    this.currentBeatStyle = style;

    // Set BPM based on subgenre
    if (style === 'desert-trap') {
      this.bpm = 136;
    } else if (style === 'chillhop') {
      this.bpm = 84;
    } else {
      this.bpm = 90;
    }

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    // Step duration based on 16th notes: (60 / bpm) / 4 * 1000 ms
    const stepInterval = (60 / this.bpm / 4) * 1000;
    this.timerId = window.setInterval(() => {
      this.stepBeat();
    }, stepInterval);
  }

  public stopBeat() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public setVolume(val: number) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : val, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Recite a verse with rhythmic speech cadence
  public reciteVerse(lines: string[], onLineStart?: (lineIndex: number) => void): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      let lineIdx = 0;

      const speakNextLine = () => {
        if (lineIdx >= lines.length) {
          resolve();
          return;
        }

        const line = lines[lineIdx];
        if (onLineStart) onLineStart(lineIdx);

        const utterance = new SpeechSynthesisUtterance(line);
        this.currentUtterance = utterance;

        // Tune speech for rhythm / rap bounce
        utterance.rate = this.currentBeatStyle === 'desert-trap' ? 1.15 : 1.05;
        utterance.pitch = 0.95 + (lineIdx % 2) * 0.1; // subtle vocal bounce between bars
        utterance.volume = this.volume;

        // Look for expressive English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Male') || v.name.includes('Google'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          lineIdx++;
          // Small pause between bars in rhythm
          setTimeout(speakNextLine, 350);
        };

        utterance.onerror = () => {
          lineIdx++;
          setTimeout(speakNextLine, 200);
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextLine();
    });
  }

  public stopRecitation() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const rapAudio = new RapBeatEngine();

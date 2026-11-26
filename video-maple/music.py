"""秋天許願楓樹林：原創配樂（純 numpy 合成，無任何取樣或現成音樂）
70 BPM，D 大調，Bm - G - D - A - (Gmaj7) - Dmaj9
鋼琴：加法合成（帶輕微非諧和、分頻衰減、槌擊噪聲）
弦樂 pad：多聲部失諧加法合成 + 慢起音 + 顫音
空間：合成脈衝響應的卷積殘響
用法：python3 music.py out.wav
"""
import sys
import numpy as np

SR = 48000
DUR = 15.0
N = int(SR * DUR)
BEAT = 60 / 70
rng = np.random.default_rng(1126)
t_all = np.arange(N) / SR


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def m(name):
    n, o = name[:-1], int(name[-1])
    return 12 * (o + 1) + NOTE[n]


# ---------- 鋼琴 ----------
def piano(freq, dur, vel):
    n = int(SR * dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00012  # 非諧和係數
    for k in range(1, 11):
        fk = freq * k * np.sqrt(1 + B * k * k)
        if fk > SR / 2.2:
            break
        amp = (1 / k ** 1.25) * (0.55 + 0.45 * vel) ** (k * 0.35)
        decay = 1.1 + 0.55 * k + freq / 500
        env = np.exp(-t * decay) * 0.75 + np.exp(-t * decay * 0.18) * 0.25
        detune = 1 + (rng.random() - 0.5) * 0.0008
        out += amp * env * np.sin(2 * np.pi * fk * detune * t + rng.random() * 6.28)
    att = np.minimum(1, t / 0.004)
    hammer = rng.standard_normal(n) * np.exp(-t * 90) * 0.02
    rel = np.minimum(1, (dur - t) / 0.25).clip(0, 1)
    return (out * att + hammer) * rel * vel


# ---------- 弦樂 pad ----------
def pad_voice(freq, start, end, gain):
    i0, i1 = int(start * SR), min(N, int(end * SR))
    t = np.arange(i1 - i0) / SR
    L = np.zeros(len(t)); Rr = np.zeros(len(t))
    for d, pan in ((-0.07, 0.25), (0.0, 0.5), (0.08, 0.75)):  # 半音分之失諧
        f = freq * 2 ** (d / 12)
        vib = 1 + 0.0025 * np.sin(2 * np.pi * (4.6 + d) * t + rng.random() * 6.28)
        phase = 2 * np.pi * np.cumsum(f * vib) / SR
        s = np.zeros(len(t))
        for k in range(1, 9):
            if f * k > 6000:
                break
            s += np.sin(k * phase + rng.random() * 6.28) / k ** 1.6  # 柔化的鋸齒波
        L += s * (1 - pan); Rr += s * pan
    dur = end - start
    env = np.minimum(1, t / 1.6) ** 1.5 * np.minimum(1, (dur - t) / 1.4).clip(0, 1)
    swell = 0.85 + 0.15 * np.sin(2 * np.pi * t / 6.0)
    return i0, i1, L * env * swell * gain, Rr * env * swell * gain


# ---------- 編曲 ----------
bar = 4 * BEAT  # 3.43 s
chords = [  # (起, 迄, 低音, pad 和弦音, 琶音音)
    (0.0, bar, 'B2', ['B3', 'D4', 'F#4', 'C#5'], ['B3', 'F#4', 'B4', 'D5', 'C#5', 'D5', 'B4', 'F#4']),
    (bar, 2 * bar, 'G2', ['G3', 'B3', 'D4', 'F#4'], ['G3', 'D4', 'B4', 'D5', 'F#5', 'D5', 'B4', 'D4']),
    (2 * bar, 3 * bar, 'F#2', ['F#3', 'A3', 'D4', 'A4'], ['D4', 'A4', 'D5', 'E5', 'F#5', 'E5', 'D5', 'A4']),
    (3 * bar, 12.0, 'A2', ['A3', 'C#4', 'E4', 'G4'], ['A3', 'E4', 'A4', 'C#5', 'E5', 'C#5']),
    (12.0, DUR, 'D2', ['D3', 'A3', 'C#4', 'E4', 'F#4'], []),
]
melody = [  # (秒, 音, 長度, 力度)
    (0.0 * BEAT, 'F#5', 2.6, 0.5), (2.0 * BEAT, 'E5', 1.5, 0.42), (3.0 * BEAT, 'D5', 1.8, 0.45),
    (4.0 * BEAT, 'D5', 2.4, 0.48), (6.0 * BEAT, 'B4', 1.6, 0.4), (7.0 * BEAT, 'A4', 1.6, 0.4),
    (8.0 * BEAT, 'A4', 2.2, 0.46), (10.0 * BEAT, 'F#5', 1.6, 0.44), (11.0 * BEAT, 'E5', 1.8, 0.42),
    (12.0 * BEAT, 'E5', 2.0, 0.44), (13.5 * BEAT, 'C#5', 1.6, 0.4),
    (12.0, 'D5', 3.0, 0.38), (13.0, 'A5', 2.0, 0.22),
]

L = np.zeros(N); Rch = np.zeros(N)


def add(sig, at, pan=0.5, g=1.0):
    i0 = int(max(0.0, at) * SR)
    i1 = min(N, i0 + len(sig))
    if i0 >= N:
        return
    seg = sig[:i1 - i0] * g
    L[i0:i1] += seg * np.sqrt(1 - pan)
    Rch[i0:i1] += seg * np.sqrt(pan)


eighth = BEAT / 2
for (s, e, bass, padn, arp) in chords:
    add(piano(midi_hz(m(bass)), 3.5, 0.5), s, 0.42, 0.55)
    add(piano(midi_hz(m(bass) + 12), 3.2, 0.35), s + 0.01, 0.45, 0.3)
    for i, nn in enumerate(arp):
        at = s + i * eighth
        if at < e - 0.05:
            human = (rng.random() - 0.5) * 0.018
            add(piano(midi_hz(m(nn)), 2.4, 0.26 + 0.06 * (i % 4 == 0)), at + human, 0.35 + 0.3 * (i / 8), 0.42)
    for nn in padn:
        i0, i1, pl, pr = pad_voice(midi_hz(m(nn)), max(0, s - 0.4), min(DUR, e + 1.2), 0.05)
        L[i0:i1] += pl; Rch[i0:i1] += pr
    # 低音弦
    i0, i1, pl, pr = pad_voice(midi_hz(m(bass)), max(0, s - 0.4), min(DUR, e + 1.2), 0.035)
    L[i0:i1] += pl; Rch[i0:i1] += pr

for at, nn, ln, v in melody:
    add(piano(midi_hz(m(nn)), ln + 1.5, v), at + 0.02, 0.58, 0.75)

# ---------- 殘響（合成脈衝響應） ----------
def reverb(x, seed, rt=2.6, mix=0.32):
    r = np.random.default_rng(seed)
    n = int(SR * rt)
    tt = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-tt * 6.9 / rt)
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    # 高頻衰減：簡單移動平均
    k = 6
    ir = np.convolve(ir, np.ones(k) / k, mode='same')
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x * (1 - mix) + wet * mix * 1.4


L = reverb(L, 1); Rch = reverb(Rch, 2)
mix = np.stack([L, Rch], axis=1)

# ---------- 音量包絡：1s 淡入、12s 文字出現時收弱、最後 1.5s 淡出 ----------
env = np.ones(N)
env *= np.clip(t_all / 1.0, 0, 1) ** 2
duck = np.interp(t_all, [0, 11.6, 12.6, DUR], [1, 1, 0.72, 0.72])
env *= duck
fo = np.clip((DUR - t_all) / 1.5, 0, 1)
env *= fo ** 1.6
mix *= env[:, None]

# 柔和限幅 + 正規化（峰值 -3 dBFS）
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 10 ** (-3 / 20)

out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
pcm = (mix * 32767).astype(np.int16)
import wave
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out)

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const DATASET_ROOT = process.argv[2] ?? "/Users/nalinee/Downloads/archive";
const OUTPUT = process.argv[3] ?? "public/benchmark/audio-deepfake-subset.json";
const REAL_DIR = "real_samples";
const SPOOF_DIRS = ["FlashSpeech", "NaturalSpeech3", "PromptTTS2", "VALLE", "VoiceBox", "seedtts_files", "xTTS"];
const TARGET_REAL = 100;
const TARGET_SPOOF = 100;

function listAudioFiles(dir) {
  return readdirSync(dir)
    .filter((name) => [".wav", ".wave"].includes(extname(name).toLowerCase()))
    .map((name) => join(dir, name))
    .sort();
}

function readWavPcm(filePath) {
  const buffer = readFileSync(filePath);
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Not a RIFF/WAVE file");
  }

  let offset = 12;
  let fmt = null;
  let dataStart = -1;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;

    if (id === "fmt ") {
      fmt = {
        audioFormat: buffer.readUInt16LE(start),
        channels: buffer.readUInt16LE(start + 2),
        sampleRate: buffer.readUInt32LE(start + 4),
        bitsPerSample: buffer.readUInt16LE(start + 14)
      };
    }

    if (id === "data") {
      dataStart = start;
      dataSize = size;
      break;
    }

    offset = start + size + (size % 2);
  }

  if (!fmt || dataStart < 0) throw new Error("Missing WAV fmt/data chunk");
  if (fmt.audioFormat !== 1) throw new Error(`Unsupported WAV format ${fmt.audioFormat}`);
  if (![16, 24, 32].includes(fmt.bitsPerSample)) throw new Error(`Unsupported PCM depth ${fmt.bitsPerSample}`);

  const bytesPerSample = fmt.bitsPerSample / 8;
  const frameCount = Math.floor(dataSize / (bytesPerSample * fmt.channels));
  const samples = new Float32Array(frameCount);

  for (let i = 0; i < frameCount; i += 1) {
    let acc = 0;
    for (let ch = 0; ch < fmt.channels; ch += 1) {
      const sampleOffset = dataStart + (i * fmt.channels + ch) * bytesPerSample;
      if (fmt.bitsPerSample === 16) {
        acc += buffer.readInt16LE(sampleOffset) / 32768;
      } else if (fmt.bitsPerSample === 24) {
        acc += buffer.readIntLE(sampleOffset, 3) / 8388608;
      } else {
        acc += buffer.readInt32LE(sampleOffset) / 2147483648;
      }
    }
    samples[i] = acc / fmt.channels;
  }

  return { samples, sampleRate: fmt.sampleRate };
}

function sampleEvenly(files, count) {
  if (files.length <= count) return files;
  const selected = [];
  const step = files.length / count;
  for (let i = 0; i < count; i += 1) selected.push(files[Math.floor(i * step)]);
  return selected;
}

function selectDataset() {
  const real = sampleEvenly(listAudioFiles(join(DATASET_ROOT, REAL_DIR)), TARGET_REAL).map((file) => ({
    file,
    label: "bonafide",
    source: REAL_DIR
  }));

  const perSpoofDir = Math.ceil(TARGET_SPOOF / SPOOF_DIRS.length);
  const spoofCandidates = SPOOF_DIRS.flatMap((dir) => {
    const path = join(DATASET_ROOT, dir);
    if (!statSync(path, { throwIfNoEntry: false })?.isDirectory()) return [];
    return sampleEvenly(listAudioFiles(path), perSpoofDir).map((file) => ({ file, label: "spoof", source: dir }));
  });

  const spoof = sampleEvenly(spoofCandidates, TARGET_SPOOF);
  return [...real, ...spoof];
}

function frameFeatures(samples, sampleRate) {
  const frameSize = Math.min(2048, samples.length);
  const hop = Math.max(512, Math.floor(frameSize / 2));
  const frames = [];

  for (let start = 0; start + frameSize <= samples.length && frames.length < 48; start += hop * 8) {
    let energy = 0;
    let zc = 0;
    let diff = 0;
    let prev = samples[start];
    let absMax = 0;

    for (let i = 0; i < frameSize; i += 1) {
      const value = samples[start + i];
      energy += value * value;
      absMax = Math.max(absMax, Math.abs(value));
      if ((value >= 0 && prev < 0) || (value < 0 && prev >= 0)) zc += 1;
      diff += Math.abs(value - prev);
      prev = value;
    }

    frames.push({
      rms: Math.sqrt(energy / frameSize),
      zcr: zc / frameSize,
      roughness: diff / frameSize,
      peak: absMax,
      sampleRate
    });
  }

  return frames;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function std(values) {
  const m = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - m) ** 2)));
}

function featuresFor(filePath) {
  const { samples, sampleRate } = readWavPcm(filePath);
  const frames = frameFeatures(samples, sampleRate);
  const rms = frames.map((frame) => frame.rms);
  const zcr = frames.map((frame) => frame.zcr);
  const roughness = frames.map((frame) => frame.roughness);
  const peak = frames.map((frame) => frame.peak);
  const durationSeconds = samples.length / sampleRate;

  return {
    durationSeconds,
    sampleRate,
    rmsMean: mean(rms),
    rmsStd: std(rms),
    zcrMean: mean(zcr),
    zcrStd: std(zcr),
    roughnessMean: mean(roughness),
    peakMean: mean(peak),
    dynamicRangeProxy: mean(peak) / Math.max(0.00001, mean(rms))
  };
}

function featureVector(feature) {
  return [
    Math.log10(feature.durationSeconds + 0.01),
    Math.log10(feature.rmsMean + 0.000001),
    Math.log10(feature.rmsStd + 0.000001),
    feature.zcrMean,
    feature.zcrStd,
    feature.roughnessMean,
    feature.peakMean,
    feature.dynamicRangeProxy,
    feature.sampleRate / 24000
  ];
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function sourceFold(item) {
  let hash = 0;
  for (const char of `${item.source}:${item.file}`) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 10;
}

function splitTrainTest(items) {
  const train = [];
  const test = [];
  for (const item of items) {
    if (sourceFold(item) < 7) train.push(item);
    else test.push(item);
  }
  return { train, test };
}

function scalerFor(items) {
  const vectors = items.map((item) => item.vector);
  const dims = vectors[0]?.length ?? 0;
  const meanValues = Array.from({ length: dims }, (_, dim) => mean(vectors.map((vector) => vector[dim])));
  const stdValues = Array.from({ length: dims }, (_, dim) => std(vectors.map((vector) => vector[dim])) || 1);
  return { meanValues, stdValues };
}

function scale(vector, scaler) {
  return vector.map((value, index) => (value - scaler.meanValues[index]) / scaler.stdValues[index]);
}

function trainLogistic(items) {
  const scaler = scalerFor(items);
  const dims = items[0]?.vector.length ?? 0;
  const weights = Array.from({ length: dims }, () => 0);
  let bias = 0;
  const learningRate = 0.08;
  const l2 = 0.003;

  for (let epoch = 0; epoch < 900; epoch += 1) {
    for (const item of items) {
      const x = scale(item.vector, scaler);
      const y = item.label === "spoof" ? 1 : 0;
      const prediction = sigmoid(x.reduce((sum, value, index) => sum + value * weights[index], bias));
      const error = prediction - y;
      for (let index = 0; index < weights.length; index += 1) {
        weights[index] -= learningRate * (error * x[index] + l2 * weights[index]);
      }
      bias -= learningRate * error;
    }
  }

  return {
    weights,
    bias,
    scaler,
    score(item) {
      const x = scale(item.vector, scaler);
      return sigmoid(x.reduce((sum, value, index) => sum + value * weights[index], bias));
    }
  };
}

function confusion(items, threshold) {
  return items.reduce((acc, item) => {
    const predicted = item.score >= threshold ? "spoof" : "bonafide";
    if (item.label === "spoof" && predicted === "spoof") acc.tp += 1;
    if (item.label === "spoof" && predicted === "bonafide") acc.fn += 1;
    if (item.label === "bonafide" && predicted === "bonafide") acc.tn += 1;
    if (item.label === "bonafide" && predicted === "spoof") acc.fp += 1;
    return acc;
  }, { tp: 0, fp: 0, tn: 0, fn: 0 });
}

function metricsAt(items, threshold) {
  const c = confusion(items, threshold);
  const total = c.tp + c.fp + c.tn + c.fn;
  const far = c.fp / Math.max(1, c.fp + c.tn);
  const frr = c.fn / Math.max(1, c.fn + c.tp);
  return {
    threshold,
    ...c,
    accuracy: (c.tp + c.tn) / Math.max(1, total),
    precision: c.tp / Math.max(1, c.tp + c.fp),
    recall: c.tp / Math.max(1, c.tp + c.fn),
    far,
    frr
  };
}

function findEer(items) {
  let best = null;
  for (let i = 0; i <= 1000; i += 1) {
    const threshold = i / 1000;
    const m = metricsAt(items, threshold);
    const gap = Math.abs(m.far - m.frr);
    if (!best || gap < best.gap) best = { ...m, gap, eer: (m.far + m.frr) / 2 };
  }
  return best;
}

const selected = selectDataset();
const evaluated = [];
const skipped = [];

for (const item of selected) {
  try {
    const feature = featuresFor(item.file);
    const vector = featureVector(feature);
    evaluated.push({
      label: item.label,
      source: item.source,
      file: basename(item.file),
      vector,
      score: 0,
      feature
    });
  } catch (error) {
    skipped.push({ file: item.file, reason: error instanceof Error ? error.message : "unknown" });
  }
}

const split = splitTrainTest(evaluated);
const model = trainLogistic(split.train);
for (const item of evaluated) item.score = model.score(item);

const eer = findEer(split.test);
const operatingThreshold = eer.threshold;
const operating = metricsAt(split.test, operatingThreshold);
const bySource = Object.entries(evaluated.reduce((acc, item) => {
  acc[item.source] ??= { count: 0, avgScore: 0, label: item.label };
  acc[item.source].count += 1;
  acc[item.source].avgScore += item.score;
  return acc;
}, {})).map(([source, value]) => ({
  source,
  label: value.label,
  count: value.count,
  avgSpoofScore: value.avgScore / value.count
}));

const report = {
  generatedAt: new Date().toISOString(),
  datasetName: "Audio Deepfake Detection Dataset",
  datasetPath: DATASET_ROOT,
  disclosure: "Local subset evaluation using folder labels. This is a lightweight acoustic-feature baseline, not a trained AASIST/RawNet checkpoint.",
  subset: {
    bonafide: evaluated.filter((item) => item.label === "bonafide").length,
    spoof: evaluated.filter((item) => item.label === "spoof").length,
    train: split.train.length,
    test: split.test.length,
    skipped: skipped.length
  },
  metrics: {
    evaluation: "deterministic 70/30 held-out split",
    threshold: operatingThreshold,
    accuracy: operating.accuracy,
    precision: operating.precision,
    recall: operating.recall,
    far: operating.far,
    frr: operating.frr,
    eer: eer.eer,
    confusion: {
      trueSpoof: operating.tp,
      falseSpoof: operating.fp,
      trueBonafide: operating.tn,
      falseBonafide: operating.fn
    }
  },
  baselineModel: {
    kind: "logistic_regression_acoustic_features",
    featureOrder: ["logDuration", "logRmsMean", "logRmsStd", "zcrMean", "zcrStd", "roughnessMean", "peakMean", "dynamicRangeProxy", "sampleRateRatio"],
    threshold: operatingThreshold,
    weights: model.weights,
    bias: model.bias,
    scaler: model.scaler
  },
  bySource,
  sampleScores: evaluated.slice(0, 16).map(({ file, label, source, score }) => ({ file, label, source, score })),
  skipped: skipped.slice(0, 20)
};

writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

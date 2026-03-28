/**
 * Local Edge Signal Processing (FFT)
 * Computes FFT features over a temporal window of sensor data.
 */
export interface FFTFeatures {
  fftPeak: number
  fftEnergy: number
  dominantFrequency: number
  signalVariance: number
  motionIndex: number
}

export function extractFeatures(buffer: number[], sampleRate: number = 60): FFTFeatures {
  const N = buffer.length
  if (N === 0) {
    return { fftPeak: 0, fftEnergy: 0, dominantFrequency: 0, signalVariance: 0, motionIndex: 0 }
  }

  let sum = 0
  for (let i = 0; i < N; i++) sum += buffer[i]
  const mean = sum / N

  let variance = 0
  for (let i = 0; i < N; i++) variance += Math.pow(buffer[i] - mean, 2)
  variance /= N

  let fftPeak = 0
  let dominantFreqIndex = 0
  let fftEnergy = 0

  // Compute standard DFT up to Nyquist frequency
  for (let k = 0; k < N / 2; k++) {
    let real = 0
    let imag = 0
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N
      const val = buffer[n] - mean
      real += val * Math.cos(angle)
      imag -= val * Math.sin(angle)
    }
    const magnitude = Math.sqrt(real * real + imag * imag)
    fftEnergy += magnitude * magnitude

    if (magnitude > fftPeak) {
      fftPeak = magnitude
      dominantFreqIndex = k
    }
  }

  const dominantFrequency = dominantFreqIndex * (sampleRate / N)
  const motionIndex = Math.sqrt(variance) * fftPeak

  return {
    fftPeak: Number(fftPeak.toFixed(4)),
    fftEnergy: Number(fftEnergy.toFixed(4)),
    dominantFrequency: Number(dominantFrequency.toFixed(4)),
    signalVariance: Number(variance.toFixed(4)),
    motionIndex: Number(motionIndex.toFixed(4)),
  }
}

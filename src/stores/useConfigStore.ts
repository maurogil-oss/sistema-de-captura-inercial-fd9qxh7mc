import { create } from 'zustand'

export interface CloudConfig {
  profile: 'custom' | 'critical' | 'standard'
  gForceThreshold: number
  samplingFreq: number
}

interface ConfigState {
  config: CloudConfig
  setConfig: (config: Partial<CloudConfig>) => void
  setProfile: (profile: 'custom' | 'critical' | 'standard') => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: {
    profile: 'standard',
    gForceThreshold: 2.5,
    samplingFreq: 50,
  },
  setConfig: (newConfig) =>
    set((state) => ({ config: { ...state.config, ...newConfig, profile: 'custom' } })),
  setProfile: (profile) =>
    set((state) => {
      if (profile === 'critical')
        return { config: { profile, gForceThreshold: 1.0, samplingFreq: 100 } }
      if (profile === 'standard')
        return { config: { profile, gForceThreshold: 2.5, samplingFreq: 50 } }
      return { config: { ...state.config, profile } }
    }),
}))

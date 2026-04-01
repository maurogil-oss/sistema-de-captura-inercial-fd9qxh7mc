import React from 'react'
import { QrCode, Cpu, Lock, FileCheck2, Globe, Shield, Zap, CheckCircle2 } from 'lucide-react'

const chips = [
  { label: 'ENVIRONMENTAL ENTROPY', value: 'HYBRID CHAOS ACTIVE', color: 'dark' as const },
  { label: 'QUANTUM RESISTANCE', value: 'DILITHIUM-READY', color: 'purple' as const },
  { label: 'GDPR PRIVACY SHIELD', value: 'GAIA-X COMPLIANT', color: 'blue' as const },
  { label: 'OFFLINE-SYNC VERIFIED', value: 'GLOBAL SOUTH OK', color: 'orange' as const },
  { label: 'ANTI-AI INTEGRITY', value: '75% PHYS. SCORE', color: 'green' as const },
]

export default function CertificateReport() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans animate-fade-in pb-20">
      <div className="max-w-[1000px] mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200 p-8 md:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#0B1120] rounded-2xl flex items-center justify-center shrink-0">
              <Cpu className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0B1120] leading-none mb-4">
                HARDTECH
                <br />
                CONFLICT-FREE
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-[#0B1120] text-white">
                  <Lock className="w-3 h-3" /> ORBIS TRUST TIMESTAMP
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-slate-100 text-slate-600">
                  <FileCheck2 className="w-3 h-3" /> MP 2.200-2 COMPLIANT
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-blue-100 text-blue-700">
                  <Globe className="w-3 h-3" /> DPP READY
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end w-full md:w-[360px] shrink-0">
            <div className="text-right w-full">
              <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                Hash Forense Inviolável
              </div>
              <div className="bg-[#0B1120] text-white font-mono text-lg px-6 py-2 rounded-xl text-center shadow-inner tracking-wider">
                L5-A0F3D1EA
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full">
              {chips.map((c) => (
                <StatusChip key={c.label} {...c} />
              ))}
            </div>
            <div className="text-right w-full mt-1">
              <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">
                L5 Cryptographic Seal
              </div>
              <div className="bg-[#064E3B] text-emerald-400 font-mono text-[10px] px-2 py-2 rounded-lg text-center break-all shadow-inner tracking-wider">
                L5-SEAL-2BB27A51494024A3EDBA6375F5FC1434
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0B1120] text-white rounded-3xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-8">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-wider text-emerald-400">
                  EVIDÊNCIA BLINDADA
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                    Classificação Pericial
                  </div>
                  <div className="text-xl font-bold leading-tight">
                    COMPONENTE
                    <br />
                    ELETRÔNICO L5
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                    Metodologia
                  </div>
                  <div className="text-sm font-mono text-emerald-400">GHG_PROTOCOL_LCA</div>
                </div>
              </div>
            </div>

            <div className="bg-[#EEF2FF] rounded-3xl p-6 border border-indigo-100">
              <h3 className="text-xs font-bold tracking-wider text-indigo-800 mb-4">
                CONFLICT-FREE SCORE
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-black text-indigo-950 tracking-tighter">100</span>
                <span className="text-2xl font-bold text-indigo-950">%</span>
              </div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                ASSEGURANÇA DE ORIGEM ÉTICA
              </p>
            </div>

            <div className="bg-[#E6F9F0] rounded-3xl p-6 border border-emerald-100">
              <h3 className="text-xs font-bold tracking-wider text-emerald-800 mb-4">
                ÍNDICE DE INTEGRIDADE (IIP)
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-emerald-950 tracking-tighter">99.8</span>
                <span className="text-xl font-bold text-emerald-950">%</span>
              </div>
            </div>

            <div className="bg-[#0B1120] text-white rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold tracking-wider text-emerald-400">
                  REGISTRO BLOCKCHAIN
                </h3>
              </div>
              <div className="space-y-4">
                <InfoItem label="Rede" value="Polygon PoS (Mainnet)" />
                <InfoItem
                  label="Contrato"
                  value="0x8f3C7fad23Cd3CabdD9735AFF958023239c6A063"
                  mono
                />
                <InfoItem
                  label="TX Hash"
                  value="0x37333dc0812c080afcad4272ca91595ff63b15b8675e50f0f34f2c7f8a56e58f"
                  mono
                  highlight
                />
                <InfoItem label="Bloco" value="40991682" mono />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] p-8 border-2 border-[#00B87A] relative overflow-hidden shadow-sm">
              <CheckCircle2 className="absolute -right-8 -top-8 w-64 h-64 text-slate-50 opacity-50 pointer-events-none" />
              <h3 className="text-xs font-bold tracking-wider text-slate-400 mb-6 uppercase">
                VALOR DO ATIVO CIRCULAR RWA
              </h3>
              <div className="mb-6 relative z-10">
                <div className="flex items-start mb-2">
                  <span className="text-4xl font-black mt-2 mr-2">R$</span>
                  <span className="text-6xl sm:text-7xl lg:text-[110px] leading-none font-black tracking-tighter">
                    137,936
                  </span>
                </div>
                <div className="text-lg font-medium text-slate-500 ml-1">
                  ≈ US$ 26.232 • ≈ € 22,646
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-8 relative z-10">
                <div className="bg-[#0B1120] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg">
                    0.0 <span className="text-xs text-slate-400">kgCO2e</span>
                  </span>
                </div>
                <div className="bg-white border-2 border-[#0B1120] text-[#0B1120] px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-lg">
                  <CheckCircle2 className="w-5 h-5" /> AUDIT GRADE L5
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-[2rem] p-6 md:p-8 border border-slate-200">
              <h3 className="text-xs font-bold tracking-wider text-slate-500 mb-6">
                LIQUIDAÇÃO E TAX SPLIT (L5 PROTOCOL)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { l: 'Audit', v: '13.79' },
                  { l: 'Orbis Node', v: '6.90' },
                  { l: 'Buffer Pool', v: '2.76' },
                ].map((x) => (
                  <div
                    key={x.l}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"
                  >
                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">{x.l}</div>
                    <div className="text-lg font-bold">R$ {x.v}</div>
                  </div>
                ))}
                <div className="bg-[#00B87A] text-white p-4 rounded-xl shadow-sm">
                  <div className="text-[10px] font-bold text-emerald-100 mb-2 uppercase">
                    Net P/ Seller
                  </div>
                  <div className="text-2xl font-black">R$ 114.49</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0B1120] text-white rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-emerald-400 uppercase">
                    PRÊMIO CARBONO ESTIMADO
                  </h3>
                </div>
                <div className="text-4xl md:text-5xl font-black tracking-tighter">R$ 137.94</div>
              </div>
              <div className="bg-[#E6F9F0] rounded-[2rem] p-8 flex flex-col justify-center border border-emerald-100">
                <h3 className="text-xs font-bold tracking-wider text-emerald-800 mb-4 uppercase">
                  CONCLUSÃO FORENSE
                </h3>
                <p className="text-emerald-950 font-medium italic text-sm leading-relaxed">
                  "Hardware Conflict-Free validado via assinatura de dispositivo. Sensores de
                  movimento confirmam captura in-situ."
                </p>
              </div>
            </div>

            <div className="bg-[#0B1120] text-white rounded-[2rem] p-6 md:p-8">
              <h3 className="text-[10px] md:text-xs font-bold tracking-wider text-emerald-400 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 shrink-0" /> ELEGIBILIDADE GHG PROTOCOL (CRÉDITOS DE
                CARBONO)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <ScopeCard num="1" desc="EMISSÕES DIRETAS" dim />
                <ScopeCard num="2" desc="ENERGIA INDIRETA" />
                <ScopeCard num="3" desc="CADEIA DE VALOR" />
              </div>
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">
                  CONTEXTO DE AUDITORIA DMRV
                </div>
                <p className="text-sm font-mono text-slate-300">
                  Abatimento em Escopo 2 (Eficiência Energética) e Escopo 3 (Minerais de Conflito e
                  E-Waste).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[#0B1120] mt-12 mb-6 rounded-full" />

        <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
          <div className="max-w-md leading-relaxed">
            ORBIS PROTOCOL :: AUDIT GRADE L5 :: ORBIS TRUST PROTOCOL :: GAIA-X & UNFCCC DMRV
            FRAMEWORK
          </div>
          <div className="flex items-center gap-4 text-right w-full sm:w-auto justify-end">
            <div>
              <div className="text-[9px] md:text-[10px] text-slate-400">Validação Normativa</div>
              <div className="text-[#0B1120] font-black">MP 2.200-2 COMPLIANT</div>
            </div>
            <QrCode className="w-12 h-12 md:w-16 md:h-16 text-[#0B1120]" />
          </div>
        </footer>
      </div>
    </div>
  )
}

function StatusChip({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'dark' | 'purple' | 'blue' | 'orange' | 'green'
}) {
  const s = {
    dark: 'bg-slate-200 text-slate-700 _ bg-[#0B1120] text-emerald-400',
    purple: 'bg-purple-200 text-purple-800 _ bg-purple-100 text-purple-600',
    blue: 'bg-blue-200 text-blue-800 _ bg-blue-100 text-blue-600',
    orange: 'bg-orange-200 text-orange-800 _ bg-orange-100 text-orange-600',
    green: 'bg-emerald-200 text-emerald-800 _ bg-emerald-100 text-emerald-600',
  }[color].split(' _ ')
  return (
    <div className="flex w-full text-[8px] md:text-[9px] font-mono rounded overflow-hidden">
      <div className={`${s[0]} px-2 py-1.5 flex-1 font-bold truncate`}>{label}</div>
      <div className={`${s[1]} px-2 py-1.5 flex-1 font-bold text-right truncate`}>{value}</div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  mono,
  highlight,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">{label}</div>
      <div
        className={`text-xs break-all ${mono ? 'font-mono' : 'font-medium'} ${highlight ? 'text-cyan-400' : 'text-slate-200'}`}
      >
        {value}
      </div>
    </div>
  )
}

function ScopeCard({ num, desc, dim }: { num: string; desc: string; dim?: boolean }) {
  return (
    <div
      className={`p-4 rounded-xl text-center ${dim ? 'bg-slate-800/50 border border-slate-700 opacity-50' : 'bg-[#064E3B] border border-[#00B87A] shadow-[0_0_15px_rgba(0,184,122,0.1)]'}`}
    >
      <div className={`font-black text-lg ${dim ? 'text-slate-300' : 'text-[#00B87A]'}`}>
        ESCOPO {num}
      </div>
      <div
        className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${dim ? 'text-slate-400' : 'text-emerald-400'}`}
      >
        {desc}
      </div>
    </div>
  )
}

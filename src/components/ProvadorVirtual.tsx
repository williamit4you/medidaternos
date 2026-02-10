"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Edit2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { UserData, calculateSuitSize } from "@/lib/calculator";
import dynamic from "next/dynamic"; // For future 3D if needed, or keeping structure

// Placeholder for the visual component (replacing 3D mannequin)
function SilhouetteDisplay({ step, data }: { step: number, data: UserData }) {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#1a1a1a] overflow-hidden">
            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-80"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

            {/* Abstract Mannequin / Silhouette Representation */}
            <div className="relative z-0 opacity-100 flex flex-col items-center justify-center h-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative"
                >
                    {/* Glowing Orb / Core */}
                    <div className="w-[300px] h-[500px] bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse duration-[4s]"></div>

                    {/* Typography Art */}
                    <div className="relative flex flex-col items-center z-10">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="text-[12rem] font-serif text-white/5 font-bold leading-none select-none"
                        >
                            4K
                        </motion.span>
                        <motion.span
                            initial={{ letterSpacing: "0.2em", opacity: 0 }}
                            animate={{ letterSpacing: "0.8em", opacity: 1 }}
                            transition={{ delay: 1, duration: 1.5 }}
                            className="text-sm font-bold text-amber-500/60 uppercase mt-[-2rem]"
                        >
                            Ternos
                        </motion.span>
                    </div>

                    {/* Dynamic Stats Visualization (Abstract) */}
                    <div className="absolute inset-0 pointer-events-none">
                        {step === 2 && (
                            <>
                                <motion.div initial={{ width: 0 }} animate={{ width: "120%" }} className="absolute top-[30%] left-[-10%] h-[1px] bg-amber-500/30" />
                                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="absolute top-[50%] left-[0%] h-[1px] bg-amber-500/30" />
                                <motion.div initial={{ width: 0 }} animate={{ width: "110%" }} className="absolute top-[70%] left-[-5%] h-[1px] bg-amber-500/30" />
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Step 1 Branding Overlay */}
            <AnimatePresence>
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-12 left-0 w-full text-center z-20"
                    >
                        <h1 className="text-4xl font-serif text-white/90 tracking-wide mb-2 drop-shadow-lg">4K TERNOS</h1>
                        <div className="h-[1px] w-24 bg-amber-600 mx-auto mb-2"></div>
                        <p className="text-neutral-400 text-[10px] tracking-[0.4em] uppercase font-medium">
                            Elegância e Qualidade
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProvadorVirtual() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<UserData>({
        altura: 175,
        peso: 80,
        idade: 30,
        toraxAdj: 0,
        cinturaAdj: 0,
        quadrilAdj: 0,
    });

    const updateForm = (key: keyof UserData, value: number) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const tamanho = calculateSuitSize(formData);

    const handleNext = () => setStep((p) => Math.min(3, p + 1));
    const handleBack = () => setStep((p) => Math.max(1, p - 1));

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-amber-900 selection:text-white overflow-hidden flex flex-col md:flex-row">
            {/* Left Panel: Visuals (Hidden on Mobile) */}
            <div className="hidden md:block relative w-full md:w-1/2 h-screen bg-[#e5e5e5] overflow-hidden shadow-2xl z-0 border-r border-neutral-200">
                <SilhouetteDisplay step={step} data={formData} />
            </div>

            {/* Right Panel: UI */}
            <div className="w-full md:w-1/2 h-screen bg-white text-neutral-900 md:rounded-l-3xl shadow-none md:shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col relative z-20">

                {/* Mobile Branding */}
                <div className="md:hidden pt-8 px-8 text-center">
                    <h1 className="text-2xl font-serif text-neutral-900 tracking-wide opacity-90">4K Ternos</h1>
                    <p className="text-neutral-500 text-[10px] tracking-[0.3em] uppercase mb-4">Provador Virtual</p>
                    <div className="h-[1px] w-full bg-neutral-100"></div>
                </div>

                {/* Header */}
                <div className="px-8 pt-6 pb-4 md:pt-12 md:px-12 flex justify-between items-start">
                    <div>
                        <span className="text-amber-600 font-bold text-[10px] uppercase tracking-widest border border-amber-100 bg-amber-50 px-2 py-1 rounded-sm">
                            {step === 1 ? "Step 01" : step === 2 ? "Step 02" : "Resumo"}
                        </span>
                        <h2 className="text-3xl font-serif text-neutral-800 mt-3">
                            {step === 1 && "Suas Medidas"}
                            {step === 2 && "Ajuste Fino"}
                            {step === 3 && "Seu Tamanho"}
                        </h2>
                    </div>
                    {/* Dots */}
                    <div className="flex gap-1 mt-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step >= s ? "bg-neutral-800 scale-125" : "bg-neutral-300"}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-24 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-6 pt-2"
                            >
                                <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                                    Para garantir o caimento perfeito, precisamos de algumas informações básicas.
                                </p>
                                <InputGroup label="Altura" suffix="cm" value={formData.altura} onChange={(v) => updateForm('altura', v)} min={100} max={250} />
                                <InputGroup label="Peso" suffix="kg" value={formData.peso} onChange={(v) => updateForm('peso', v)} min={40} max={200} />
                                <InputGroup label="Idade" suffix="anos" value={formData.idade} onChange={(v) => updateForm('idade', v)} min={10} max={100} />
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-8 pt-2"
                            >
                                <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                                    Ajuste os sliders se tiver características específicas.
                                </p>
                                <RangeControl label="Tórax" value={formData.toraxAdj} onChange={(v) => updateForm('toraxAdj', v)} />
                                <RangeControl label="Cintura" value={formData.cinturaAdj} onChange={(v) => updateForm('cinturaAdj', v)} />
                                <RangeControl label="Quadril" value={formData.quadrilAdj} onChange={(v) => updateForm('quadrilAdj', v)} />
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center pt-4"
                            >
                                <div className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-600"></div>
                                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-8">Recomendação Sob Medida</h3>
                                    <div className="flex items-center justify-center gap-8 mb-8">
                                        <div className="text-center group">
                                            <span className="block text-5xl md:text-6xl font-serif text-neutral-800 group-hover:scale-110 transition-transform duration-300">{tamanho.paleto}</span>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2 block">Paletó</span>
                                        </div>
                                        <div className="h-16 w-px bg-neutral-200"></div>
                                        <div className="text-center group">
                                            <span className="block text-5xl md:text-6xl font-serif text-neutral-600 group-hover:scale-110 transition-transform duration-300">{tamanho.calca}</span>
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2 block">Calça</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-amber-600 transition-colors"
                                    >
                                        <Edit2 size={12} /> Ajustar Medidas
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-neutral-100 p-6 md:p-8 flex items-center justify-between gap-4">
                    {step > 1 && (
                        <button
                            onClick={handleBack}
                            className="w-12 h-12 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all"
                        >
                            <ArrowRight size={20} className="rotate-180" />
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 bg-neutral-900 hover:bg-black text-white px-6 py-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-neutral-200 transition-all active:scale-[0.98]"
                        >
                            CONTINUAR <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                const mensagem = `Olá! Fiz a simulação no Provador Virtual.\nMinha sugestão foi: Paletó ${tamanho.paleto} e Calça ${tamanho.calca}.\nGostaria de finalizar a compra!`;
                                const url = `https://wa.me/5517997614534?text=${encodeURIComponent(mensagem)}`;
                                window.open(url, '_blank');
                            }}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-4 rounded-xl font-bold tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                        >
                            FALAR COM CONSULTOR <div className="bg-white/20 p-1 rounded-full"><Check size={12} /></div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Subcomponents
function InputGroup({ label, suffix, value, onChange, min, max }: { label: string, suffix: string, value: number, onChange: (v: number) => void, min: number, max: number }) {
    return (
        <div className="py-2">
            <label className="flex justify-between text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">
                {label}
            </label>
            <div className="relative group">
                <input
                    type="number"
                    value={value}
                    min={min} max={max}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full bg-neutral-50 border-b-2 border-neutral-200 focus:border-amber-500 py-3 px-2 text-2xl font-serif text-neutral-800 focus:outline-none transition-colors placeholder-transparent"
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 font-serif italic text-lg pointer-events-none pr-2">{suffix}</span>
            </div>
        </div>
    )
}

function RangeControl({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    const percentage = ((value + 5) / 10) * 100;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{value > 0 ? `+${value}` : value}</span>
            </div>

            <div className="relative h-12 flex items-center select-none">
                <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-neutral-200" style={{ width: `${percentage}%` }}></div>
                </div>

                <div
                    className="absolute h-6 w-6 bg-white border-2 border-neutral-200 shadow-md rounded-full top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:border-amber-500 active:scale-110 transition-all flex items-center justify-center z-10"
                    style={{ left: `calc(${percentage}% - 12px)` }}
                >
                    <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full"></div>
                </div>

                <input
                    type="range" min={-5} max={5} step={1} value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
            </div>
        </div>
    )
}

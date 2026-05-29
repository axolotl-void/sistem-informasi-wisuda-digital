"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Code2,
  Sparkles,
  GitBranch,
  Star,
  Users,
  Eye,
  Terminal,
  FolderKanban,
  CheckCircle2,
  Calendar,
  Layers,
  Monitor
} from "lucide-react";
import { FaGithub, FaLinkedin, FaGamepad, FaEnvelope } from "react-icons/fa";

// Types
interface Project {
  title: string;
  description: string;
  lang: string;
  stars: number;
  forks: number;
  color: string;
  glowColor: string;
  tag: string;
}

// Data
const PROJECTS: Project[] = [
  {
    title: "EduPlay Engine",
    description: "Interactive educational canvas with real-time liquid physics and fluid-dynamics simulations.",
    lang: "TypeScript / Canvas",
    stars: 124,
    forks: 18,
    color: "from-teal-400 to-emerald-500",
    glowColor: "shadow-emerald-500/20",
    tag: "Education",
  },
  {
    title: "Space Canvas 3D",
    description: "Cinematic WebGL-based galactic explorer utilizing Three.js and custom fragment shaders.",
    lang: "Three.js / GLSL",
    stars: 98,
    forks: 12,
    color: "from-blue-400 to-cyan-500",
    glowColor: "shadow-cyan-500/20",
    tag: "3D Graphics",
  },
  {
    title: "Digital Graduation Hub",
    description: "Next.js enterprise platform featuring real-time seat monitoring, qr ticket scan, and attendee management.",
    lang: "Next.js / Prisma",
    stars: 84,
    forks: 32,
    color: "from-purple-400 to-indigo-500",
    glowColor: "shadow-indigo-500/20",
    tag: "Full-Stack",
  },
  {
    title: "Glassy UI Kit",
    description: "Highly optimized CSS glassmorphic components and post-processing shaders for premium web apps.",
    lang: "Tailwind / GLSL",
    stars: 78,
    forks: 7,
    color: "from-pink-400 to-rose-500",
    glowColor: "shadow-rose-500/20",
    tag: "Design System",
  },
];

// Generate fake GitHub contribution data (53 columns x 7 rows)
const generateContributions = () => {
  const levels = [0, 0, 0, 1, 1, 2, 2, 3, 4];
  const data: number[] = [];
  for (let i = 0; i < 371; i++) {
    // Give middle columns slightly higher density for realism
    const bias = Math.sin((i / 371) * Math.PI) * 2;
    const idx = Math.floor(Math.random() * levels.length);
    let level = levels[idx];
    if (level > 0 && Math.random() < 0.3) {
      level = Math.min(4, level + Math.floor(bias));
    }
    data.push(level);
  }
  return data;
};

const CONTRIBUTION_CELLS = generateContributions();

export default function PortfolioPage() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredDock, setHoveredDock] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen w-full bg-[#0A0A0C] text-slate-100 overflow-x-hidden font-sans flex flex-col items-center justify-start p-6 md:p-12 pb-32">
      
      {/* 1. LIQUID BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Blob 1: Cyan/Teal */}
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 120, 0],
            scale: [1, 1.2, 0.9, 1],
            borderRadius: [
              "42% 58% 70% 30% / 45% 45% 55% 55%",
              "70% 30% 52% 48% / 60% 40% 60% 40%",
              "30% 70% 70% 30% / 50% 60% 40% 50%",
              "42% 58% 70% 30% / 45% 45% 55% 55%"
            ]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-20 w-[450px] h-[450px] bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent blur-[80px]"
        />

        {/* Blob 2: Aurora Teal/Indigo */}
        <motion.div
          animate={{
            x: [0, -120, 80, 0],
            y: [0, 100, -90, 0],
            scale: [1, 0.85, 1.15, 1],
            borderRadius: [
              "50% 50% 30% 70% / 50% 60% 40% 50%",
              "30% 70% 70% 30% / 50% 30% 70% 50%",
              "60% 40% 45% 55% / 40% 60% 40% 60%",
              "50% 50% 30% 70% / 50% 60% 40% 50%"
            ]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-gradient-to-br from-teal-500/15 via-blue-600/15 to-transparent blur-[100px]"
        />

        {/* Blob 3: Soft Emerald glow behind profile */}
        <motion.div
          animate={{
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-1/3 w-[300px] h-[300px] bg-emerald-500/5 blur-[90px]"
        />
      </div>

      {/* 2. MAIN SPACIOUS PORTFOLIO CANVAS */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col gap-6 md:gap-8 mt-4">
        
        {/* TOP PANEL: Bento Grid (Profile + Stats) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: Mac-Style Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.02] dark:bg-black/30 backdrop-blur-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] group"
          >
            {/* Glossy inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
            
            {/* Avatar Frame */}
            <div className="relative size-24 md:size-28 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/10 shrink-0">
              <div className="size-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center border border-black/40">
                {/* Fallback elegant illustration */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                  <Terminal className="size-10 text-emerald-400" />
                </div>
              </div>
              {/* Green status indicator */}
              <div className="absolute bottom-1 right-1 size-4 rounded-full bg-emerald-500 border-2 border-[#0A0A0C] shadow-md shadow-emerald-500/30" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Salsa Putri</h1>
                <span className="text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  NIM 23210016
                </span>
              </div>
              <p className="text-emerald-400/90 font-medium text-xs md:text-sm mt-1">Frontend Engineer & Educator</p>
              
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed mt-4">
                Specialized in building high-performance educational engines, interactive UI systems, and modern web application structures. Crafting digital products with meticulous layout planning, smooth transitions, and premium visual physics.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-5">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-slate-300">
                  ✦ Next.js
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-slate-300">
                  ✦ Three.js
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-slate-300">
                  ✦ GLSL / Shaders
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.05] text-slate-300">
                  ✦ Tailwind CSS
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Stats Pill Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.02] dark:bg-black/30 backdrop-blur-2xl p-6 md:p-8 flex flex-col justify-between shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles className="size-3 text-emerald-400" /> Git Analytics
              </span>
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" />
            </div>

            {/* Pill-shaped stats list */}
            <div className="space-y-4 my-6">
              {/* Followers */}
              <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] px-4 py-3 rounded-2xl transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                    <Users className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-300">Followers</span>
                </div>
                <span className="text-sm font-black text-white group-hover:scale-105 transition-transform duration-200">142</span>
              </div>

              {/* Following */}
              <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] px-4 py-3 rounded-2xl transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/15">
                    <Users className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-300">Following</span>
                </div>
                <span className="text-sm font-black text-white group-hover:scale-105 transition-transform duration-200">95</span>
              </div>

              {/* Stars */}
              <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] px-4 py-3 rounded-2xl transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
                    <Star className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-300">Stars Earned</span>
                </div>
                <span className="text-sm font-black text-white group-hover:scale-105 transition-transform duration-200">384</span>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 text-center uppercase tracking-wider">
              Updated live via Github webhook
            </div>
          </motion.div>
        </div>

        {/* MIDDLE PANEL: Bento Bento Grid (Featured Projects) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FolderKanban className="size-3 text-cyan-400" /> Featured Projects
            </span>
            <span className="text-[10px] text-cyan-400/80 font-bold hover:underline cursor-pointer flex items-center gap-1">
              View All Repositories <ExternalLink className="size-2.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {PROJECTS.map((project, idx) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredProject(idx)}
                onMouseLeave={() => setHoveredProject(null)}
                className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.02] dark:bg-black/30 backdrop-blur-2xl p-6 md:p-8 flex flex-col justify-between h-[220px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
              >
                {/* Custom Gradient Background & Blur Shines on Hover */}
                <div className={`absolute -right-20 -top-20 size-48 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 blur-[40px] transition-all duration-500 rounded-full`} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-widest font-black px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
                      {project.tag}
                    </span>
                    <motion.div
                      animate={{
                        opacity: hoveredProject === idx ? 1 : 0,
                        x: hoveredProject === idx ? 0 : -5,
                      }}
                      transition={{ duration: 0.2 }}
                      className="text-cyan-400"
                    >
                      <ExternalLink className="size-4" />
                    </motion.div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-white mt-4 group-hover:text-emerald-400 transition-colors duration-200">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.05] pt-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="size-3 text-cyan-400" />
                    <span className="text-[10px] font-bold text-slate-400">{project.lang}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Star className="size-3 text-amber-400/90" />
                      <span>{project.stars}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <GitBranch className="size-3 text-emerald-400/90" />
                      <span>{project.forks}</span>
                    </div>
                  </div>
                </div>

                {/* Ambient glowing boundary */}
                <div className={`absolute bottom-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-emerald-400/50 transition-all duration-500`} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* BOTTOM PANEL: Glass Contributions Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.02] dark:bg-black/30 backdrop-blur-2xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-tight">GitHub Contributions</span>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
              240 Contributions this year
            </span>
          </div>

          {/* Grid contribution wrapper with custom scrollbar for overflow */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="grid grid-flow-col grid-rows-7 gap-[3.5px] min-w-[760px] md:min-w-none justify-between">
              {CONTRIBUTION_CELLS.map((level, idx) => {
                let colorClass = "bg-white/[0.03] border-white/[0.02]";
                if (level === 1) colorClass = "bg-emerald-950/40 border-emerald-900/30 text-emerald-500/20";
                if (level === 2) colorClass = "bg-emerald-800/30 border-emerald-700/40 text-emerald-400/40";
                if (level === 3) colorClass = "bg-emerald-500/40 border-emerald-400/50 text-emerald-300/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]";
                if (level === 4) colorClass = "bg-emerald-400 border-emerald-300/80 text-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.35)]";

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    transition={{ duration: 0.12 }}
                    className={`size-[10px] md:size-[11px] rounded-[3px] border ${colorClass} transition-colors duration-200 cursor-pointer`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-2">
            <span>Learn more about Salsa's open source activity</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="size-2 rounded-[2px] bg-white/[0.04] border border-white/[0.06]" />
              <div className="size-2 rounded-[2px] bg-emerald-950/50 border border-emerald-900/30" />
              <div className="size-2 rounded-[2px] bg-emerald-800/40 border border-emerald-700/40" />
              <div className="size-2 rounded-[2px] bg-emerald-500/50 border border-emerald-400/50" />
              <div className="size-2 rounded-[2px] bg-emerald-400 border border-emerald-300" />
              <span>More</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 3. APPLE-STYLE FLOATING DOCK LINKS */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 z-50 h-16 rounded-full border border-white/[0.08] bg-black/40 backdrop-blur-2xl px-6 flex items-center justify-center gap-6 shadow-[0_24px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
      >
        {[
          { icon: FaGithub, label: "GitHub", href: "https://github.com/axolotl-void", color: "text-slate-200 hover:text-white" },
          { icon: FaLinkedin, label: "LinkedIn", href: "https://linkedin.com", color: "text-blue-400 hover:text-blue-300" },
          { icon: FaGamepad, label: "Itch.io", href: "https://itch.io", color: "text-rose-400 hover:text-rose-300" },
          { icon: FaEnvelope, label: "Email", href: "mailto:salsaputri@wisuda.ac.id", color: "text-emerald-400 hover:text-emerald-300" },
        ].map((item, idx) => (
          <motion.a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredDock(idx)}
            onMouseLeave={() => setHoveredDock(null)}
            animate={{
              scale: hoveredDock === idx ? 1.25 : hoveredDock !== null && Math.abs(hoveredDock - idx) === 1 ? 1.1 : 1,
              y: hoveredDock === idx ? -6 : hoveredDock !== null && Math.abs(hoveredDock - idx) === 1 ? -3 : 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className={`relative size-10 rounded-full flex items-center justify-center bg-white/[0.03] border border-white/[0.06] ${item.color} shadow-sm active:scale-95 transition-colors duration-200`}
            title={item.label}
          >
            <item.icon className="size-5" />
            
            {/* Glossy sheen indicator */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200" />
          </motion.a>
        ))}
      </motion.div>

    </main>
  );
}

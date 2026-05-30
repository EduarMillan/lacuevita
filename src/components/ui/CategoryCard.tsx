"use client";

import Link from "next/link";

interface CategoryCardProps {
  slug: string;
  icon: string;
  name: string;
  index: number;
}

export function CategoryCardStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes borderTrace {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .cat-card {
        position: relative;
        overflow: hidden;
        z-index: 0;
      }
      .cat-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
          from 0deg,
          transparent 0deg,
          transparent 300deg,
          rgba(13, 148, 136, 0.25) 330deg,
          rgba(13, 148, 136, 0.5) 348deg,
          rgba(13, 148, 136, 0.25) 360deg
        );
        animation: borderTrace 4s linear infinite;
        z-index: -2;
        opacity: 1;
      }
      .cat-card::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
        background: linear-gradient(170deg, #e6fcf5, #f0fdfa);
        border-radius: 10px;
        z-index: -1;
        transition: background 0.3s ease;
      }
      .cat-card:hover::after {
        background: linear-gradient(170deg, #ccfbf1, #e6fcf5);
      }
    `}} />
  );
}

export default function CategoryCard({ slug, icon, name, index }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias/${slug}`}
      className="cat-card group p-3 sm:p-6 rounded-xl text-center hover:-translate-y-2 transition-all duration-500 cursor-pointer"
      style={{ animationDelay: `${index * 0.5}s` }}
    >
      <div className="w-11 h-11 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <span className="material-symbols-outlined text-xl sm:text-3xl">
          {icon}
        </span>
      </div>
      <span className="font-bold text-on-surface text-[11px] sm:text-sm block group-hover:text-primary transition-colors duration-300 leading-tight">
        {name}
      </span>
    </Link>
  );
}

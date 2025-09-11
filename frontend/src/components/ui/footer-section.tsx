"use client";
import React from "react";
import type { ComponentProps, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  FacebookIcon,
  FrameIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "lucide-react";

interface FooterLink {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    label: "Produit",
    links: [
      { title: "Fonctionnalités", href: "#features" },
      { title: "Tarifs", href: "#pricing" },
      { title: "Témoignages", href: "#testimonials" },
      { title: "Intégrations", href: "/" },
    ],
  },
  {
    label: "Entreprise",
    links: [
      { title: "FAQs", href: "/faqs" },
      { title: "À propos", href: "/about" },
      { title: "Confidentialité", href: "/privacy" },
      { title: "Conditions", href: "/terms" },
    ],
  },
  {
    label: "Ressources",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "Changelog", href: "/changelog" },
      { title: "Marque", href: "/brand" },
      { title: "Aide", href: "/help" },
    ],
  },
  {
    label: "Réseaux sociaux",
    links: [
      { title: "Facebook", href: "#", icon: FacebookIcon },
      { title: "Instagram", href: "#", icon: InstagramIcon },
      { title: "Youtube", href: "#", icon: YoutubeIcon },
      { title: "LinkedIn", href: "#", icon: LinkedinIcon },
    ],
  },
];

export function FooterSection() {
  return (
    <footer className="relative w-full flex flex-col   items-center justify-center border-t border-white/10 px-6 py-14 lg:py-20 backdrop-blur-sm shadow-[0_-18px_36px_-8px_rgba(0,0,0,0.55)] bg-black">
      {/* subtle ambient gradient overlays */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_60%_0%,black,transparent_70%)]">
        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -top-16 left-0 h-64 w-64 rounded-full  blur-3xl" />
      </div>
      <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full  blur" />

      <div className="grid w-full max-w-6xl gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          <FrameIcon className="size-8 text-white/90" />
          <p className="mt-8 text-sm md:mt-0 text-white/60">
            © {new Date().getFullYear()} Matcha. Tous droits réservés.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs tracking-wide uppercase text-white/50">
                  {section.label}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-white/55">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        className="inline-flex items-center transition-all duration-300 hover:text-white/90 hover:translate-x-0.5"
                      >
                        {link.icon && (
                          <link.icon className="me-1 size-4 text-white/70 group-hover:text-white" />
                        )}
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

// Animation wrapper
interface ViewAnimationProps {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
}

// Basic prefers-reduced-motion check (fallback if framer-motion hook not used)
function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (shouldReduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

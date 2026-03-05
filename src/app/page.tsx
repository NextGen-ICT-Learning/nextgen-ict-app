"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Code2,
  Cpu,
  CreditCard,
  Laptop,
  Network,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { HomeContent, IconKey, Locale } from "@/content/home-content";
import { getHomeContent } from "@/lib/get-home-content";

const iconMap: Record<IconKey, LucideIcon> = {
  laptop: Laptop,
  code: Code2,
  cpu: Cpu,
  network: Network,
  book: BookOpen,
  brain: Brain,
  users: Users,
  credit: CreditCard,
  banknote: Banknote,
};

export default function Home() {
  const initialLocale: Locale =
    typeof window !== "undefined" &&
    window.localStorage.getItem("site-locale") === "bn"
      ? "bn"
      : "en";

  const [locale, setLocale] = useState<Locale>(() => {
    return initialLocale;
  });
  const [remoteContentByLocale, setRemoteContentByLocale] = useState<
    Partial<Record<Locale, HomeContent>>
  >({});

  const setLanguage = (value: Locale) => {
    setLocale(value);
    window.localStorage.setItem("site-locale", value);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadCmsContent() {
      try {
        const response = await fetch(`/api/content?lang=${locale}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as { data?: HomeContent };
        if (!cancelled && payload.data) {
          setRemoteContentByLocale((previous) => ({
            ...previous,
            [locale]: payload.data,
          }));
        }
      } catch {
        // Keep static fallback content when CMS/API is unavailable.
      }
    }

    loadCmsContent();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const fallbackContent = useMemo(() => getHomeContent(locale), [locale]);
  const content = remoteContentByLocale[locale] ?? fallbackContent;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto mt-6 w-[min(1200px,calc(100%-2rem))] rounded-3xl border border-line bg-surface px-6 py-4 shadow-[var(--shadow-soft)] lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="font-display text-lg font-semibold">{content.brand}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted lg:flex">
            <a href="#courses" className="hover:text-primary">
              {content.nav.courses}
            </a>
            <a href="#solutions" className="hover:text-primary">
              {content.nav.solutions}
            </a>
            <a href="#success" className="hover:text-primary">
              {content.nav.success}
            </a>
            <a href="#faq" className="hover:text-primary">
              {content.nav.faq}
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="inline-flex rounded-xl border border-line bg-surface-muted p-1">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-2 py-1 text-xs font-bold ${
                  locale === "en"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {content.languageToggle.en}
              </button>
              <button
                type="button"
                onClick={() => setLanguage("bn")}
                className={`rounded-lg px-2 py-1 text-xs font-bold ${
                  locale === "bn"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-primary"
                }`}
              >
                {content.languageToggle.bn}
              </button>
            </div>

            <Link
              href="/portal/login"
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-foreground hover:border-primary"
            >
              {content.nav.login}
            </Link>
            <Link
              href="/portal/signup"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              {content.nav.admission}
            </Link>
          </div>

          <details className="relative lg:hidden">
            <summary className="inline-flex h-10 w-10 list-none cursor-pointer items-center justify-center rounded-xl border border-line text-muted [&::-webkit-details-marker]:hidden">
              <span className="sr-only">{content.menuLabel}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <div className="absolute right-0 top-12 z-20 w-56 space-y-2 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow-soft)]">
              <div className="mb-2 inline-flex w-full rounded-lg border border-line bg-surface-muted p-1">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`w-1/2 rounded-md px-2 py-1 text-xs font-bold ${
                    locale === "en"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {content.languageToggle.en}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("bn")}
                  className={`w-1/2 rounded-md px-2 py-1 text-xs font-bold ${
                    locale === "bn"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-primary"
                  }`}
                >
                  {content.languageToggle.bn}
                </button>
              </div>
              <a
                href="#courses"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-primary"
              >
                {content.nav.courses}
              </a>
              <a
                href="#solutions"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-primary"
              >
                {content.nav.solutions}
              </a>
              <a
                href="#success"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-primary"
              >
                {content.nav.success}
              </a>
              <a
                href="#faq"
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-surface-muted hover:text-primary"
              >
                {content.nav.faq}
              </a>
              <Link
                href="/portal/login"
                className="block rounded-lg border border-line px-3 py-2 text-center text-sm font-semibold"
              >
                {content.nav.login}
              </Link>
            </div>
          </details>
        </div>
      </header>

      <main className="pb-16">
        <section className="mx-auto mt-10 w-[min(1200px,calc(100%-2rem))] overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-10 shadow-[var(--shadow-soft)] md:px-10 md:py-14">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#ffe3da] bg-[#fff2ed] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                <Sparkles size={14} />
                {content.hero.badge}
              </p>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                  {content.hero.title}
                </h1>
                <p className="max-w-xl text-lg text-muted">{content.hero.description}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/portal/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-white hover:bg-primary-strong"
                >
                  {content.hero.primaryCta} <ArrowRight size={16} />
                </Link>
                <a
                  href="#courses"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-base font-semibold hover:border-primary hover:text-primary"
                >
                  {content.hero.secondaryCta}
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {content.successHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-line bg-surface-muted px-4 py-3"
                  >
                    <p className="font-display text-2xl font-bold">{item.value}</p>
                    <p className="text-sm text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-muted">{content.metricsNote}</p>
            </div>

            <div className="relative rounded-3xl border border-line bg-[#f4f9ff] p-6 md:p-8">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#d6ecff]" />
              <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#ffe7df]" />

              <div className="relative z-10 space-y-4">
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-muted">{content.hero.liveClassLabel}</p>
                  <p className="mt-2 text-lg font-bold">{content.hero.liveClassTitle}</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-primary">
                    <CalendarCheck size={15} /> {content.hero.liveClassTime}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-surface p-4">
                    <p className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7fd] text-primary">
                      <Code2 size={18} />
                    </p>
                    <p className="mt-3 text-sm font-semibold">{content.hero.codingLab}</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-surface p-4">
                    <p className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2ed] text-accent">
                      <Users size={18} />
                    </p>
                    <p className="mt-3 text-sm font-semibold">{content.hero.mentorSupport}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-primary p-5 text-white">
                  <p className="text-sm text-white/80">{content.hero.improvementLabel}</p>
                  <p className="mt-1 font-display text-3xl font-bold">{content.hero.improvementValue}</p>
                  <p className="mt-2 text-sm text-white/80">
                    {content.hero.improvementDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="courses" className="mx-auto mt-10 w-[min(1200px,calc(100%-2rem))]">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                {content.courseSection.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                {content.courseSection.title}
              </h2>
            </div>
            <p className="hidden max-w-sm text-sm text-muted md:block">
              {content.courseSection.description}
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {content.courseSection.tracks.map((track) => {
              const Icon = iconMap[track.icon];
              return (
                <article
                  key={track.title}
                  className="group overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef7fd] text-primary">
                      <Icon size={18} />
                    </p>
                    <p className="inline-flex max-w-full items-center rounded-full bg-[#fff2ed] px-3 py-1 text-xs font-semibold leading-tight break-words text-accent">
                      {track.level}
                    </p>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{track.title}</h3>
                  <p className="mt-3 text-sm text-muted">{track.description}</p>
                  <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:translate-x-1">
                    {content.courseSection.cta} <ArrowRight size={14} />
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="solutions"
          className="mx-auto mt-12 w-[min(1200px,calc(100%-2rem))] rounded-3xl border border-line bg-surface px-6 py-10 md:px-10 md:py-12"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                {content.solutionsSection.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                {content.solutionsSection.title}
              </h2>
              <p className="mt-4 max-w-xl text-muted">{content.solutionsSection.description}</p>
              <div className="mt-6 space-y-3">
                {content.solutionsSection.bullets.map((bullet) => (
                  <p key={bullet} className="inline-flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 size={16} className="text-success" /> {bullet}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {content.solutionsSection.cards.map((solution) => {
                const Icon = iconMap[solution.icon];
                return (
                  <article key={solution.title} className="rounded-2xl border border-line bg-surface-muted p-5">
                    <p className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-primary">
                      <Icon size={18} />
                    </p>
                    <h3 className="mt-4 text-lg font-bold">{solution.title}</h3>
                    <p className="mt-2 text-sm text-muted">{solution.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="success"
          className="mx-auto mt-12 w-[min(1200px,calc(100%-2rem))] rounded-3xl bg-primary px-6 py-10 text-white md:px-10 md:py-12"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                {content.successSection.eyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                {content.successSection.title}
              </h2>
              <p className="mt-4 text-white/85">{content.successSection.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {content.successSection.stats.map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 p-5">
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-white/80">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 w-[min(1200px,calc(100%-2rem))] rounded-3xl border border-line bg-surface p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            {content.gallerySection.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">{content.gallerySection.title}</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted">{content.gallerySection.description}</p>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="overflow-hidden rounded-2xl border border-line">
              <Image
                src="/images/classroom.jpg"
                alt={content.gallerySection.classroomLabel}
                width={1400}
                height={900}
                className="h-72 w-full object-cover"
              />
              <p className="border-t border-line bg-surface-muted px-4 py-3 text-sm font-semibold">
                {content.gallerySection.classroomLabel}
              </p>
            </article>
            <article className="overflow-hidden rounded-2xl border border-line">
              <Image
                src="/images/campus.jpg"
                alt={content.gallerySection.campusLabel}
                width={1400}
                height={900}
                className="h-72 w-full object-cover"
              />
              <p className="border-t border-line bg-surface-muted px-4 py-3 text-sm font-semibold">
                {content.gallerySection.campusLabel}
              </p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {["mentor-1.jpg", "mentor-2.jpg", "mentor-3.jpg"].map((photo, index) => (
              <article key={photo} className="overflow-hidden rounded-2xl border border-line">
                <Image
                  src={`/images/${photo}`}
                  alt={`${content.gallerySection.mentorLabel} ${index + 1}`}
                  width={800}
                  height={1000}
                  className="h-64 w-full object-cover"
                />
                <p className="border-t border-line bg-surface-muted px-4 py-3 text-sm font-semibold">
                  {content.gallerySection.mentorLabel} {index + 1}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 w-[min(1200px,calc(100%-2rem))]">
          <h2 className="text-3xl font-bold md:text-4xl">{content.testimonialsSection.title}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {content.testimonialsSection.items.map((testimonial) => (
              <article key={testimonial.name} className="rounded-3xl border border-line bg-surface p-6">
                <BadgeCheck size={18} className="text-accent" />
                <p className="mt-4 text-sm text-muted">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="mt-6 font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted">{testimonial.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 grid w-[min(1200px,calc(100%-2rem))] gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-line bg-surface p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              {content.portalSection.title}
            </p>
            <h3 className="mt-3 text-2xl font-bold">{content.portalSection.heading}</h3>
            <p className="mt-3 text-sm text-muted">{content.portalSection.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <p className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold">
                <CreditCard size={16} className="text-primary" /> {content.portalSection.onlinePayment}
              </p>
              <p className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold">
                <Banknote size={16} className="text-accent" /> {content.portalSection.manualPayment}
              </p>
            </div>
            <Link
              href="/portal"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-strong"
            >
              {content.portalSection.cta} <ArrowRight size={15} />
            </Link>
          </article>

          <article className="rounded-3xl border border-line bg-surface p-6 md:p-8">
            <h3 className="text-xl font-bold">{content.helplineSection.title}</h3>
            <p className="mt-2 text-sm text-muted">{content.helplineSection.description}</p>
            <div className="mt-5 space-y-2 text-sm">
              <p>{content.helplineSection.phone}</p>
              <p>{content.helplineSection.email}</p>
              <p>{content.helplineSection.hours}</p>
            </div>
            <Link
              href="/portal/signup"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              {content.helplineSection.cta}
            </Link>
          </article>
        </section>

        <section
          id="faq"
          className="mx-auto mt-12 w-[min(900px,calc(100%-2rem))] rounded-3xl border border-line bg-surface px-6 py-10 md:px-8 md:py-12"
        >
          <h2 className="text-3xl font-bold">{content.faqSection.title}</h2>
          <div className="mt-6 space-y-3">
            {content.faqSection.items.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-line bg-surface-muted px-5 py-4"
              >
                <summary className="list-none cursor-pointer font-semibold">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 w-[min(1200px,calc(100%-2rem))] rounded-3xl bg-[#10203a] px-6 py-10 text-white md:px-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">{content.finalCta.title}</h2>
              <p className="mt-3 max-w-2xl text-white/80">{content.finalCta.description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portal/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-semibold text-[#10203a] hover:bg-slate-100"
              >
                {content.finalCta.primaryCta}
              </Link>
              <Link
                href="/portal/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/35 px-5 py-3 font-semibold text-white hover:border-white"
              >
                {content.finalCta.secondaryCta}
              </Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-8 flex w-[min(1200px,calc(100%-2rem))] flex-col gap-3 pb-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 NextGenICT. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="hover:text-primary">
              {content.legal.terms}
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              {content.legal.privacy}
            </Link>
            <Link href="/refund" className="hover:text-primary">
              {content.legal.refund}
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

import { z } from "zod";

const iconKeySchema = z.enum([
  "laptop",
  "code",
  "cpu",
  "network",
  "book",
  "brain",
  "users",
  "credit",
  "banknote",
]);

const statSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

const qaSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const testimonialSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
});

const navSchema = z.object({
  courses: z.string().min(1),
  solutions: z.string().min(1),
  success: z.string().min(1),
  faq: z.string().min(1),
  login: z.string().min(1),
  admission: z.string().min(1),
});

const languageToggleSchema = z.object({
  en: z.string().min(1),
  bn: z.string().min(1),
});

const heroSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  primaryCta: z.string().min(1),
  secondaryCta: z.string().min(1),
  liveClassLabel: z.string().min(1),
  liveClassTitle: z.string().min(1),
  liveClassTime: z.string().min(1),
  codingLab: z.string().min(1),
  mentorSupport: z.string().min(1),
  improvementLabel: z.string().min(1),
  improvementValue: z.string().min(1),
  improvementDescription: z.string().min(1),
});

const courseTrackSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  level: z.string().min(1),
  icon: iconKeySchema,
});

const solutionCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: iconKeySchema,
});

export const homeContentSchema = z.object({
  brand: z.string().min(1),
  menuLabel: z.string().min(1),
  nav: navSchema,
  languageToggle: languageToggleSchema,
  hero: heroSchema,
  successHighlights: z.array(statSchema).min(1),
  metricsNote: z.string().min(1),
  courseSection: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    cta: z.string().min(1),
    tracks: z.array(courseTrackSchema).min(1),
  }),
  solutionsSection: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(1),
    cards: z.array(solutionCardSchema).min(1),
  }),
  successSection: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    stats: z.array(statSchema).min(1),
  }),
  gallerySection: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    classroomLabel: z.string().min(1),
    campusLabel: z.string().min(1),
    mentorLabel: z.string().min(1),
  }),
  testimonialsSection: z.object({
    title: z.string().min(1),
    items: z.array(testimonialSchema).min(1),
  }),
  portalSection: z.object({
    title: z.string().min(1),
    heading: z.string().min(1),
    description: z.string().min(1),
    onlinePayment: z.string().min(1),
    manualPayment: z.string().min(1),
    cta: z.string().min(1),
  }),
  helplineSection: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().min(1),
    hours: z.string().min(1),
    cta: z.string().min(1),
  }),
  faqSection: z.object({
    title: z.string().min(1),
    items: z.array(qaSchema).min(1),
  }),
  finalCta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    primaryCta: z.string().min(1),
    secondaryCta: z.string().min(1),
  }),
  legal: z.object({
    terms: z.string().min(1),
    privacy: z.string().min(1),
    refund: z.string().min(1),
  }),
});

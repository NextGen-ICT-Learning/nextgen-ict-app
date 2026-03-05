export type Locale = "en" | "bn";

export type IconKey =
  | "laptop"
  | "code"
  | "cpu"
  | "network"
  | "book"
  | "brain"
  | "users"
  | "credit"
  | "banknote";

export type HomeContent = {
  brand: string;
  menuLabel: string;
  nav: {
    courses: string;
    solutions: string;
    success: string;
    faq: string;
    login: string;
    admission: string;
  };
  languageToggle: {
    en: string;
    bn: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    liveClassLabel: string;
    liveClassTitle: string;
    liveClassTime: string;
    codingLab: string;
    mentorSupport: string;
    improvementLabel: string;
    improvementValue: string;
    improvementDescription: string;
  };
  successHighlights: Array<{
    value: string;
    label: string;
  }>;
  metricsNote: string;
  courseSection: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    tracks: Array<{
      title: string;
      description: string;
      level: string;
      icon: IconKey;
    }>;
  };
  solutionsSection: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cards: Array<{
      title: string;
      description: string;
      icon: IconKey;
    }>;
  };
  successSection: {
    eyebrow: string;
    title: string;
    description: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  gallerySection: {
    eyebrow: string;
    title: string;
    description: string;
    classroomLabel: string;
    campusLabel: string;
    mentorLabel: string;
  };
  testimonialsSection: {
    title: string;
    items: Array<{
      quote: string;
      name: string;
      role: string;
    }>;
  };
  portalSection: {
    title: string;
    heading: string;
    description: string;
    onlinePayment: string;
    manualPayment: string;
    cta: string;
  };
  helplineSection: {
    title: string;
    description: string;
    phone: string;
    email: string;
    hours: string;
    cta: string;
  };
  faqSection: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCta: {
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  legal: {
    terms: string;
    privacy: string;
    refund: string;
  };
};

export const homeContentByLocale: Record<Locale, HomeContent> = {
  en: {
    brand: "NextGenICT",
    menuLabel: "Open menu",
    nav: {
      courses: "Courses",
      solutions: "Solutions",
      success: "Success",
      faq: "FAQ",
      login: "Student Login",
      admission: "Admission Open",
    },
    languageToggle: {
      en: "EN",
      bn: "BN",
    },
    hero: {
      badge: "Bangladesh ICT Coaching Excellence",
      title: "Learn ICT the practical way and achieve better academic results.",
      description:
        "NextGenICT helps students master ICT concepts, coding logic and real-world tech skills through live classes, mentor support and smart progress tracking.",
      primaryCta: "Enroll Now",
      secondaryCta: "Explore Courses",
      liveClassLabel: "Today's live class",
      liveClassTitle: "C Programming: Loops and Arrays",
      liveClassTime: "7:30 PM - 9:00 PM",
      codingLab: "Coding Practice Lab",
      mentorSupport: "Mentor Doubt Support",
      improvementLabel: "Student improvement snapshot",
      improvementValue: "+28% score gain",
      improvementDescription:
        "Average ICT exam performance uplift within 12 weeks of guided learning.",
    },
    successHighlights: [
      { value: "4,500+", label: "Active students" },
      { value: "150+", label: "Weekly classes" },
      { value: "92%", label: "Improved ICT scores" },
      { value: "40+", label: "Expert mentors" },
    ],
    metricsNote: "Verified from internal enrollment and exam records. Last updated: March 2026.",
    courseSection: {
      eyebrow: "What We Teach",
      title: "ICT tracks designed for school, college and career growth",
      description:
        "Curriculum blends textbook mastery, conceptual clarity and practical tech capability.",
      cta: "Learn more",
      tracks: [
        {
          title: "Academic ICT Mastery",
          description:
            "Concept-first ICT for SSC/HSC with chapter-wise practice, CQ/MCQ solving and exam strategy.",
          level: "SSC & HSC",
          icon: "laptop",
        },
        {
          title: "Programming Fundamentals",
          description:
            "C, C++, Python and logic-building classes that prepare students for university and olympiad pathways.",
          level: "Beginner to Advanced",
          icon: "code",
        },
        {
          title: "Hardware & Networking Basics",
          description:
            "Hands-on sessions on computer architecture, troubleshooting and networking essentials.",
          level: "Practical Lab Support",
          icon: "cpu",
        },
        {
          title: "Career-Oriented ICT Skills",
          description:
            "Freelancing readiness, productivity tools and digital communication for future careers.",
          level: "Future Ready",
          icon: "network",
        },
      ],
    },
    solutionsSection: {
      eyebrow: "Teaching Solutions",
      title: "A complete learning system, not just classes",
      description:
        "We combine teaching, feedback, revision support and parent visibility to build strong ICT outcomes.",
      bullets: [
        "Chapter-wise worksheets and model tests",
        "Mentor office hours and live doubt clearing",
        "Digital attendance and progress reporting",
      ],
      cards: [
        {
          title: "Live + Recorded Hybrid",
          description:
            "Students attend live classes and revise from recorded lessons with chapter bookmarks.",
          icon: "book",
        },
        {
          title: "Weekly Progress Analytics",
          description:
            "Parents and students get score trends, weak-topic flags and mentor recommendations.",
          icon: "brain",
        },
        {
          title: "Small Batch Mentoring",
          description:
            "Interactive doubt-solving, assignment feedback and one-to-one guidance windows.",
          icon: "users",
        },
      ],
    },
    successSection: {
      eyebrow: "Student Success",
      title: "Results that keep students and guardians confident",
      description:
        "Consistent teaching quality, structured mentoring and transparent communication help learners stay motivated and improve steadily.",
      stats: [
        { value: "1,200+", label: "Students completed ICT intensive program" },
        { value: "95%", label: "Guardian satisfaction in support quality" },
        { value: "30k+", label: "Solved practice problems each month" },
        { value: "24/7", label: "Learning portal and payment access" },
      ],
    },
    gallerySection: {
      eyebrow: "Learning Environment",
      title: "Real classrooms, real mentors, real outcomes",
      description:
        "Students learn in a structured environment with practical lab support, guided mentoring and focused campus sessions.",
      classroomLabel: "Live classroom sessions",
      campusLabel: "Campus learning environment",
      mentorLabel: "Core ICT mentors",
    },
    testimonialsSection: {
      title: "Voices from our community",
      items: [
        {
          quote:
            "My daughter became confident in ICT within 3 months because classes are practical and very structured.",
          name: "Mst. Samia Akter",
          role: "Guardian, HSC 2nd Year",
        },
        {
          quote:
            "The mentors explain complex topics so clearly. The coding classes helped me enjoy learning tech.",
          name: "Mahmudul Hasan",
          role: "Student, SSC Batch",
        },
        {
          quote:
            "We can track class activity and fee updates together. It feels professional and transparent.",
          name: "Nusrat Jahan",
          role: "Guardian",
        },
      ],
    },
    portalSection: {
      title: "Student Portal Included",
      heading: "Coaching + payment management in one platform",
      description:
        "Alongside teaching excellence, students can pay online or manually and track monthly dues clearly.",
      onlinePayment: "Online payment support",
      manualPayment: "Manual payment updates",
      cta: "Open Student Portal",
    },
    helplineSection: {
      title: "Admission Helpline",
      description:
        "Talk to our team for batch selection, schedule and payment guidance.",
      phone: "Phone: +880 1700-000000",
      email: "Email: admissions@nextgenict.edu.bd",
      hours: "Office Hours: Sat-Thu, 10:00 AM - 8:00 PM",
      cta: "Apply for Admission",
    },
    faqSection: {
      title: "Frequently asked questions",
      items: [
        {
          question: "Do you teach only academic ICT or practical skills as well?",
          answer:
            "Both. We combine academic exam prep with practical ICT modules like programming, tools and problem-solving.",
        },
        {
          question: "Can students join from outside Dhaka?",
          answer:
            "Yes. We provide hybrid support with live online classes, recorded revision and digital assignments.",
        },
        {
          question: "How is monthly payment handled?",
          answer:
            "Students can pay online or manually at center. Payment status is updated in the student portal each month.",
        },
      ],
    },
    finalCta: {
      title: "Let's shape your ICT success journey",
      description:
        "Join a coaching center where academic excellence meets practical technology education.",
      primaryCta: "Start Admission",
      secondaryCta: "Student Login",
    },
    legal: {
      terms: "Terms",
      privacy: "Privacy",
      refund: "Refund Policy",
    },
  },
  bn: {
    brand: "NextGenICT",
    menuLabel: "মেনু খুলুন",
    nav: {
      courses: "কোর্সসমূহ",
      solutions: "শিক্ষণ পদ্ধতি",
      success: "সাফল্য",
      faq: "জিজ্ঞাসা",
      login: "স্টুডেন্ট লগইন",
      admission: "ভর্তি চলছে",
    },
    languageToggle: {
      en: "EN",
      bn: "BN",
    },
    hero: {
      badge: "বাংলাদেশের বিশ্বস্ত ICT কোচিং",
      title: "প্র্যাক্টিকালভাবে ICT শিখুন, একাডেমিক ফল আরও ভাল করুন।",
      description:
        "NextGenICT শিক্ষার্থীদের লাইভ ক্লাস, মেন্টর সাপোর্ট এবং স্মার্ট প্রগ্রেস ট্র্যাকিংয়ের মাধ্যমে ICT কনসেপ্ট, কোডিং লজিক এবং বাস্তব দক্ষতায় দক্ষ করে তোলে।",
      primaryCta: "এখনই ভর্তি হন",
      secondaryCta: "কোর্স দেখুন",
      liveClassLabel: "আজকের লাইভ ক্লাস",
      liveClassTitle: "C Programming: Loops and Arrays",
      liveClassTime: "সন্ধ্যা ৭:৩০ - ৯:০০",
      codingLab: "কোডিং প্র্যাকটিস ল্যাব",
      mentorSupport: "মেন্টর ডাউট সাপোর্ট",
      improvementLabel: "শিক্ষার্থীর উন্নতির চিত্র",
      improvementValue: "+28% স্কোর বৃদ্ধি",
      improvementDescription:
        "গাইডেড লার্নিংয়ের ১২ সপ্তাহে ICT পরীক্ষার গড় ফলাফলে উল্লেখযোগ্য উন্নতি।",
    },
    successHighlights: [
      { value: "৪,৫০০+", label: "সক্রিয় শিক্ষার্থী" },
      { value: "১৫০+", label: "সাপ্তাহিক ক্লাস" },
      { value: "৯২%", label: "ICT স্কোর উন্নতি" },
      { value: "৪০+", label: "অভিজ্ঞ মেন্টর" },
    ],
    metricsNote:
      "অভ্যন্তরীণ ভর্তি ও পরীক্ষার রেকর্ড থেকে যাচাইকৃত। সর্বশেষ হালনাগাদ: মার্চ ২০২৬।",
    courseSection: {
      eyebrow: "আমরা যা শেখাই",
      title: "স্কুল, কলেজ ও ক্যারিয়ার লক্ষ্যভিত্তিক ICT ট্র্যাক",
      description:
        "টেক্সটবুক কভারেজ, কনসেপ্ট ক্লিয়ারিটি এবং প্র্যাক্টিকাল স্কিল একসাথে।",
      cta: "আরও জানুন",
      tracks: [
        {
          title: "Academic ICT Mastery",
          description:
            "SSC/HSC শিক্ষার্থীদের জন্য চ্যাপ্টারভিত্তিক প্র্যাকটিস, CQ/MCQ সমাধান এবং এক্সাম স্ট্র্যাটেজি।",
          level: "SSC ও HSC",
          icon: "laptop",
        },
        {
          title: "Programming Fundamentals",
          description:
            "C, C++, Python ও লজিক-বিল্ডিং ক্লাস যা বিশ্ববিদ্যালয় ও অলিম্পিয়াড প্রস্তুতিতে সহায়ক।",
          level: "শুরু থেকে অগ্রসর",
          icon: "code",
        },
        {
          title: "Hardware & Networking Basics",
          description:
            "কম্পিউটার আর্কিটেকচার, ট্রাবলশুটিং ও নেটওয়ার্কিংয়ের হ্যান্ডস-অন সেশন।",
          level: "প্র্যাক্টিকাল ল্যাব সাপোর্ট",
          icon: "cpu",
        },
        {
          title: "Career-Oriented ICT Skills",
          description:
            "ফ্রিল্যান্সিং প্রস্তুতি, প্রোডাক্টিভিটি টুলস ও ডিজিটাল কমিউনিকেশন দক্ষতা।",
          level: "ভবিষ্যৎ প্রস্তুতি",
          icon: "network",
        },
      ],
    },
    solutionsSection: {
      eyebrow: "শিক্ষণ সমাধান",
      title: "শুধু ক্লাস নয়, পূর্ণাঙ্গ লার্নিং সিস্টেম",
      description:
        "পাঠদান, ফিডব্যাক, রিভিশন সাপোর্ট এবং প্যারেন্ট আপডেট একসাথে দিয়ে ICT ফলাফল উন্নত করি।",
      bullets: [
        "চ্যাপ্টারভিত্তিক ওয়ার্কশিট ও মডেল টেস্ট",
        "মেন্টর অফিস আওয়ার ও লাইভ ডাউট ক্লিয়ারিং",
        "ডিজিটাল অ্যাটেনডেন্স ও প্রগ্রেস রিপোর্টিং",
      ],
      cards: [
        {
          title: "Live + Recorded Hybrid",
          description:
            "লাইভ ক্লাসের সাথে রেকর্ডেড লেসন থেকে বারবার রিভিশনের সুযোগ।",
          icon: "book",
        },
        {
          title: "Weekly Progress Analytics",
          description:
            "স্কোর ট্রেন্ড, দুর্বল টপিক এবং মেন্টর রিকমেন্ডেশন নিয়মিত আপডেট।",
          icon: "brain",
        },
        {
          title: "Small Batch Mentoring",
          description:
            "ইন্টারঅ্যাকটিভ ডাউট সলভিং, অ্যাসাইনমেন্ট ফিডব্যাক এবং ওয়ান-টু-ওয়ান গাইডেন্স।",
          icon: "users",
        },
      ],
    },
    successSection: {
      eyebrow: "শিক্ষার্থীদের সাফল্য",
      title: "যে ফলাফল শিক্ষার্থী ও অভিভাবককে আত্মবিশ্বাসী করে",
      description:
        "নিয়মিত মানসম্পন্ন ক্লাস, স্ট্রাকচার্ড মেন্টরিং এবং স্বচ্ছ কমিউনিকেশন শিক্ষার্থীদের অগ্রগতি নিশ্চিত করে।",
      stats: [
        { value: "১,২০০+", label: "ICT ইনটেনসিভ প্রোগ্রাম সম্পন্ন" },
        { value: "৯৫%", label: "অভিভাবক সন্তুষ্টি" },
        { value: "৩০k+", label: "মাসিক প্র্যাকটিস প্রবলেম সমাধান" },
        { value: "২৪/৭", label: "লার্নিং ও পেমেন্ট পোর্টাল অ্যাক্সেস" },
      ],
    },
    gallerySection: {
      eyebrow: "শিক্ষার পরিবেশ",
      title: "বাস্তব ক্লাসরুম, বাস্তব মেন্টর, বাস্তব ফলাফল",
      description:
        "প্র্যাক্টিকাল ল্যাব সাপোর্ট, গাইডেড মেন্টরিং এবং ফোকাসড ক্যাম্পাস সেশনের মাধ্যমে শিক্ষার্থীরা এগিয়ে যায়।",
      classroomLabel: "লাইভ ক্লাসরুম সেশন",
      campusLabel: "ক্যাম্পাস লার্নিং এনভায়রনমেন্ট",
      mentorLabel: "মূল ICT মেন্টরগণ",
    },
    testimonialsSection: {
      title: "আমাদের কমিউনিটির মতামত",
      items: [
        {
          quote:
            "৩ মাসেই আমার মেয়ের ICT নিয়ে আত্মবিশ্বাস বেড়েছে, কারণ ক্লাসগুলো খুবই প্র্যাক্টিকাল ও পরিকল্পিত।",
          name: "মোছাঃ সামিয়া আক্তার",
          role: "অভিভাবক, HSC ২য় বর্ষ",
        },
        {
          quote:
            "মেন্টররা কঠিন বিষয়গুলো সহজ করে বোঝান। কোডিং ক্লাসের কারণে টেক শেখা এখন অনেক উপভোগ্য।",
          name: "মাহমুদুল হাসান",
          role: "শিক্ষার্থী, SSC ব্যাচ",
        },
        {
          quote:
            "ক্লাস অ্যাক্টিভিটি আর ফি আপডেট একসাথে দেখা যায়, পুরো সিস্টেমটা খুবই প্রফেশনাল।",
          name: "নুসরাত জাহান",
          role: "অভিভাবক",
        },
      ],
    },
    portalSection: {
      title: "স্টুডেন্ট পোর্টাল যুক্ত",
      heading: "কোচিং ও পেমেন্ট ম্যানেজমেন্ট এক প্ল্যাটফর্মে",
      description:
        "শিক্ষার্থীরা অনলাইন বা ম্যানুয়াল পেমেন্ট করে মাসিক বকেয়া ও স্ট্যাটাস সহজেই ট্র্যাক করতে পারে।",
      onlinePayment: "অনলাইন পেমেন্ট সাপোর্ট",
      manualPayment: "ম্যানুয়াল পেমেন্ট আপডেট",
      cta: "স্টুডেন্ট পোর্টাল দেখুন",
    },
    helplineSection: {
      title: "ভর্তি সহায়তা",
      description:
        "ব্যাচ নির্বাচন, রুটিন এবং পেমেন্ট বিষয়ে আমাদের টিমের সাথে কথা বলুন।",
      phone: "ফোন: +880 1700-000000",
      email: "ইমেইল: admissions@nextgenict.edu.bd",
      hours: "অফিস সময়: শনি-বৃহস্পতি, সকাল ১০টা - রাত ৮টা",
      cta: "ভর্তির জন্য আবেদন করুন",
    },
    faqSection: {
      title: "সাধারণ জিজ্ঞাসা",
      items: [
        {
          question: "শুধু একাডেমিক ICT নাকি প্র্যাক্টিকাল স্কিলও শেখানো হয়?",
          answer:
            "দুটোই শেখানো হয়। আমরা একাডেমিক এক্সাম প্রস্তুতির সাথে প্রোগ্রামিং ও প্র্যাক্টিকাল টুলস যুক্ত করি।",
        },
        {
          question: "ঢাকার বাইরে থেকেও কি ভর্তি হওয়া যাবে?",
          answer:
            "হ্যাঁ। লাইভ অনলাইন ক্লাস, রেকর্ডেড রিভিশন এবং ডিজিটাল অ্যাসাইনমেন্ট সুবিধা রয়েছে।",
        },
        {
          question: "মাসিক পেমেন্ট কীভাবে করা হয়?",
          answer:
            "অনলাইন বা সেন্টারে ম্যানুয়ালি পেমেন্ট করা যায়, এবং পোর্টালে মাসিক স্ট্যাটাস আপডেট থাকে।",
        },
      ],
    },
    finalCta: {
      title: "আপনার ICT সাফল্যের যাত্রা আজই শুরু হোক",
      description:
        "একাডেমিক এক্সেলেন্স ও প্র্যাক্টিকাল টেক এডুকেশনের জন্য যোগ দিন NextGenICT-তে।",
      primaryCta: "ভর্তি শুরু করুন",
      secondaryCta: "স্টুডেন্ট লগইন",
    },
    legal: {
      terms: "শর্তাবলি",
      privacy: "প্রাইভেসি",
      refund: "রিফান্ড পলিসি",
    },
  },
};

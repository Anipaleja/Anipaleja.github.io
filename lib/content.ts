export const personal = {
  name: "Anish Paleja",
  location: "Markham, Ontario, Canada",
  tagline: "I build things that think.",
  subTagline:
    "Student innovator working at the intersection of AI, robotics, and infrastructure - turning ideas into systems that work.",
  rotatingWords: ["Engineer", "Builder", "Researcher", "Maker"],
  currently: [
    "Building LLMs and neural networks from scratch",
    "Developing EMG-based prosthetic robotics",
    "Co-founding BioBuddy AI",
    "Sr full stack swe at vivirion",
  ],
};

export const about = `I'm a student developer from Markham, Ontario obsessed with building things that sit at the edges of what's possible. I work across the full stack of intelligence - from training transformer-based language models at the 4.9B parameter scale, to writing Go-based security tooling that watches over web infrastructure, to wiring EMG sensors into robotic arms that respond to actual muscle signals.

I care about building systems that are not just functional, but genuinely useful to real people. I'm a senior fullstack developer at vivirion solutions, a co-founder at BioBuddy AI, hackathon organizer, and an active contributor to open source projects. I publish my thinking on Medium and share my models on Hugging Face.

What drives me isn't the tech itself - it's the moment a system does something that surprises even the person who built it.`;

export type Project = {
  slug: string;
  name: string;
  stack: string;
  category: string;
  description: string;
  links: Array<{ label: string; href: string }>;
  tags: string[];
  size: "short" | "medium" | "tall";
  learnings: string[];
};

export const projects: ReadonlyArray<Project> = [
  {
    slug: "nginx-defender",
    name: "nginx-defender",
    stack: "Go, Docker, Kubernetes, iptables/nftables",
    category: "Infrastructure / Security",
    description:
      "An enterprise-grade web application firewall and real-time threat detection system. Monitors nginx logs, detects brute force attacks and abusive IPs using ML-based anomaly detection, and automatically blocks offenders via iptables/ufw - with zero reliance on external services. Supports multi-channel alerting (Telegram, Slack, Email, Discord), Kubernetes deployment, and a real-time web dashboard. 72 GitHub stars.",
    links: [{ label: "Explore ->", href: "https://github.com/Anipaleja/nginx-defender" }],
    tags: ["Go", "Docker", "Kubernetes", "iptables", "Security"],
    size: "tall",
    learnings: [
      "Reliable security tooling needs clear detection thresholds and alerting paths.",
      "Automated blocking is powerful, but you need safeguards to avoid false positives.",
      "Operational visibility (logs, dashboards, notifications) matters as much as model quality.",
    ],
  },
  {
    slug: "illuminator-4-9b",
    name: "iLLuMinator 4.9B",
    stack: "Python, PyTorch, Transformers, RAG, FAISS",
    category: "AI / Machine Learning",
    description:
      "A transformer-based language model trained from scratch at 4.9 billion parameters. Implements Grouped Query Attention, Rotary Position Embeddings, SwiGLU activations, and RMSNorm. Includes integrated RAG capabilities for intelligent Q&A, custom tokenizer, and multi-scale model configs (120M to 4.9B). Available on Hugging Face.",
    links: [
      { label: "Explore ->", href: "https://github.com/Anipaleja/iLLuMinator-4.9B" },
      { label: "Hugging Face ->", href: "https://huggingface.co/Anipal/iLLuMinator" },
    ],
    tags: ["Python", "PyTorch", "Transformers", "LLM", "RAG"],
    size: "tall",
    learnings: [
      "Training large models is mostly an optimization and data pipeline problem.",
      "Small architecture choices can have huge effects on stability and throughput.",
      "Evaluation and observability are essential; loss alone does not tell the full story.",
    ],
  },
  {
    slug: "robotic-ai-arm",
    name: "Robotic AI Arm",
    stack: "Python, Raspberry Pi, OpenCV, EMG Sensors, RPi.GPIO",
    category: "Robotics / Hardware",
    description:
      "An AI-powered robotic arm controlled by electromyography (EMG) signals from MyoWare muscle sensors. Uses OpenCV to detect hand gestures and mirror them in real time. Recognizes individual users for personalized responses. Built on a Raspberry Pi 4 with MG-995 servo motors, custom PCB, and a 3D-printed arm structure.",
    links: [{ label: "Explore ->", href: "https://github.com/Anipaleja/Robotic-AI-Arm" }],
    tags: ["Python", "Raspberry Pi", "EMG", "OpenCV", "Robotics"],
    size: "medium",
    learnings: [
      "Hardware-software integration takes more iteration than model development alone.",
      "Sensor noise handling and calibration can make or break real-time control.",
      "User safety and predictable fallback behavior are non-negotiable in robotics.",
    ],
  },
  {
    slug: "nhl-outcome-predictor",
    name: "NHL Outcome Predictor",
    stack: "Python, Neural Networks, Scikit-learn",
    category: "Machine Learning / Sports Analytics",
    description:
      "Predicts NHL game outcomes using custom ML and deep learning architectures. Features full data preprocessing pipelines, label encoding, feature scaling, model evaluation, and a custom neural network built for game prediction.",
    links: [
      {
        label: "Explore ->",
        href: "https://github.com/Anipaleja/NHL-Outcome-Predictor-ML",
      },
    ],
    tags: ["Python", "Machine Learning", "Neural Networks", "Sports Analytics"],
    size: "short",
    learnings: [
      "Feature quality often matters more than model complexity.",
      "Solid preprocessing and evaluation pipelines prevent misleading results.",
      "Domain context improves model framing and decision usefulness.",
    ],
  },
  {
    slug: "vivirion",
    name: "Vivirion",
    stack: "Startup / Web",
    category: "Startup / Web",
    description:
      "Senior Full Stack SWE and actively building Vivirion - a platform currently in active development.",
    links: [{ label: "Explore ->", href: "https://vivirion.com" }],
    tags: ["Startup", "Web", "Product"],
    size: "short",
    learnings: [
      "Product velocity comes from fast feedback loops with real users.",
      "Balancing shipping speed with maintainability is a daily tradeoff.",
      "Clear ownership and scope boundaries help teams move faster.",
    ],
  },
  {
    slug: "biobuddy-ai",
    name: "BioBuddy AI",
    stack: "AI / Biotech Startup",
    category: "AI / Biotech Startup",
    description:
      "Co-founder of BioBuddy AI, an organization building AI-powered tools for biology and health applications.",
    links: [{ label: "Explore ->", href: "https://github.com/BioBuddyAi-Inc" }],
    tags: ["AI", "Biotech", "Startup"],
    size: "short",
    learnings: [
      "Translating AI ideas into biotech workflows requires strong problem framing.",
      "Early stakeholder alignment is critical in health-related products.",
      "Simple, dependable features beat flashy prototypes in real-world adoption.",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const blogPosts = [
  {
    title:
      "The Quantum Frontier: How the Smallest Particles Are Powering the Biggest Revolution",
    date: "August 27, 2025",
    excerpt:
      "From photons to qubits, superposition to entanglement - quantum physics is no longer just theory. It's actual technology, and it's moving faster than most people realize.",
    link: "https://medium.com/@anipaleja/the-quantum-frontier-how-the-smallest-particles-are-powering-the-biggest-revolution-6e49775aeb59",
    tags: ["Quantum Computing", "Physics", "Technology"],
  },
  {
    title:
      "The Neural Dawn: How AI is Rewriting Reality One Algorithm at a Time",
    date: "May 28, 2025",
    excerpt:
      "From GPTs to general intelligence, from protein folding to quantum-inspired models - the age of groundbreaking AI isn't coming. It's already here, and it's moving quietly.",
    link: "https://medium.com/@anipaleja/the-neural-dawn-how-ai-is-rewriting-reality-one-algorithm-at-a-time-b809c6f3744f",
    tags: ["AI", "Machine Learning", "Future"],
  },
] as const;

export const skills = {
  "AI & ML": [
    "PyTorch",
    "Transformers",
    "RAG",
    "FAISS",
    "Neural Networks",
    "Scikit-learn",
    "LLM Training",
    "Computer Vision (OpenCV)",
    "Data Preprocessing",
    "Reinforcement Learning",
  ],
  "Systems & Infrastructure": [
    "Go",
    "Docker",
    "Kubernetes",
    "iptables",
    "nftables",
    "Linux",
    "Nginx",
    "REST APIs",
    "React", 
    "Next JS", 
    "Jupyter Notebook", 
    "Tailwind CSS", 
    "BootStrap", 
    "TensorFlow", 
    "Pytorch", 
    "Scikit-Learn", 
    "Transformers", 
    "NumPy", 
    "Pandas", 
    "Node.js", 
    "Flask", 
    "Django", 
    "Flutter", 
    "SwiftUI", 
    "Langchain", 
    "Github Actions"
  ],
  Languages: ["Python", "Go", "TypeScript", "JavaScript", "Shell", "C", "C++", "CSS", "C#", "HTML", "PHP", "JavaScript", "Java", "Python", "Golang", "R", "Scala", "LaTeX", "Swift", "Dart", "Bash", "Shell", "GLSL", "Metal", "SQL", "NoSQL", "GraphQL", "Rubik_Storm", "Ruby"],
  "Hardware & Robotics": [
    "Raspberry Pi",
    "EMG Sensors",
    "Servo Motors",
    "GPIO",
    "PCB Design",
    "3D Printing",
  ],
  Web: ["Next.js", "React", "Node.js"],
} as const;

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/anipaleja" },
  { label: "LinkedIn", href: "https://linkedin.com/in/anish-paleja" },
  { label: "Medium", href: "https://medium.com/@anipaleja" },
  { label: "Hugging Face", href: "https://huggingface.co/Anipal" },
  { label: "Vivirion", href: "https://vivirion.com" },
] as const;

export const contactClosing =
  "I'm always open to interesting problems, collaborations, and conversations. If you're building something ambitious, let's talk.";

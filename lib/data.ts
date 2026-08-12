// Mock data for the prototype. Swap these out for calls to the Laravel REST API.

export type SubState = "active" | "open" | "closed" | "pending" | "expired" | "suspended" | "graded";

export type Module = { n: string; pm: number; exam: { state: SubState; txt: string } };
export type Course = { name: string; meta: string; prog: number; modules: Module[] };

export const courses: Course[] = [
  {
    name: "Foundations of Catechesis",
    meta: "4 modules · Catechetical Office",
    prog: 72,
    modules: [
      { n: "Module 1 · The Creed", pm: 70, exam: { state: "closed", txt: "Window closed" } },
      { n: "Module 2 · The Sacraments", pm: 70, exam: { state: "open", txt: "Open · closes in 24:00" } },
      { n: "Module 3 · Life in Christ", pm: 65, exam: { state: "pending", txt: "Opens 18 Jun · 09:00" } },
    ],
  },
  {
    name: "Sacred Scripture I",
    meta: "3 modules · Biblical Institute",
    prog: 40,
    modules: [
      { n: "Module 1 · The Pentateuch", pm: 70, exam: { state: "pending", txt: "Opens 20 Jun · 10:00" } },
      { n: "Module 2 · The Prophets", pm: 70, exam: { state: "pending", txt: "Not yet scheduled" } },
    ],
  },
];

export type Material = { ty: "video" | "pdf" | "text" | "exercise"; n: string; len: string };
export type Topic = { t: string; mats: Material[] };
export const courseContent: { topics: Topic[] }[] = [
  {
    topics: [
      { t: "Topic 1 · The Creed", mats: [
        { ty: "video", n: "Introduction to the Apostles' Creed", len: "12 min" },
        { ty: "pdf", n: "The Creed — study notes", len: "6 pages" },
        { ty: "text", n: "Reflection: what we profess", len: "4 min read" },
        { ty: "exercise", n: "Exercise: exercise on the topic", len: "4 min read" }
      ] },
      { t: "Topic 2 · The Sacraments", mats: [
        { ty: "video", n: "The seven sacraments explained", len: "18 min" },
        { ty: "pdf", n: "Sacraments at a glance", len: "2 pages" },
        { ty: "exercise", n: "Exercise: exercise on the topic", len: "4 min read" }
      ] },
      { t: "Topic 3 · Life in Christ", mats: [
        { ty: "text", n: "The Beatitudes", len: "5 min read" },
        { ty: "pdf", n: "The Ten Commandments", len: "3 pages" },
        { ty: "exercise", n: "Exercise: exercise on the topic", len: "4 min read" }
      ] },
    ],
  },
  {
    topics: [
      { t: "Topic 1 · The Pentateuch", mats: [
        { ty: "video", n: "Overview of the first five books", len: "15 min" },
        { ty: "pdf", n: "Genesis — reading guide", len: "8 pages" },
      ] },
      { t: "Topic 2 · The Prophets", mats: [
        { ty: "text", n: "Who were the prophets?", len: "6 min read" },
      ] },
    ],
  },
];

export const availableCourses = [
  { name: "Church History", meta: "5 modules · Catechetical Office" },
  { name: "Christian Morality", meta: "3 modules · Catechetical Office" },
];

export type ExamQuestion = { t: string; m: number; opts: string[]; correct: number };
export const examQ: ExamQuestion[] = [
  { t: "Which sacrament initiates a person into the Church and removes original sin?", m: 2, opts: ["Confirmation", "Baptism", "Holy Orders", "Anointing of the Sick"], correct: 1 },
  { t: "How many sacraments does the Catholic Church recognise?", m: 2, opts: ["Five", "Six", "Seven", "Twelve"], correct: 2 },
  { t: "The Eucharist is described by the Church as the source and summit of what?", m: 2, opts: ["Canon law", "The Christian life", "The liturgical calendar", "Parish governance"], correct: 1 },
  { t: "Which sacrament can be received only once and confers a permanent character, like Baptism and Holy Orders?", m: 2, opts: ["Reconciliation", "Matrimony", "Confirmation", "Anointing of the Sick"], correct: 2 },
  { t: "What is the ordinary minister of the sacrament of Confirmation?", m: 2, opts: ["A deacon", "A bishop", "A lay catechist", "A religious sister"], correct: 1 },
];
export const PASS_MARK = 70;

export const exerciseQ = [
  "Reflect on the first Beatitude, \u201CBlessed are the poor in spirit.\u201D What do you think it means to be poor in spirit in everyday life?",
  "Describe one moment this week when you tried to be a peacemaker. What happened?",
  "Which Beatitude do you find most challenging, and why?",
];

export type Parishioner = { n: string; e: string; ph: string; en: string; st: SubState };
export const parishioners: Parishioner[] = [
  { n: "Maria Okonkwo", e: "maria.okonkwo@stpeter.org", ph: "+234 803 221 0098", en: "2 courses", st: "active" },
  { n: "Daniel Eze", e: "daniel.eze@stpeter.org", ph: "+234 802 994 1120", en: "1 course", st: "active" },
  { n: "Grace Bello", e: "grace.bello@stpeter.org", ph: "+234 815 330 7741", en: "3 courses", st: "active" },
  { n: "Samuel Idris", e: "samuel.idris@stpeter.org", ph: "+234 809 117 2200", en: "\u2014", st: "pending" },
  { n: "Ruth Adebayo", e: "ruth.adebayo@stpeter.org", ph: "+234 706 552 8890", en: "1 course", st: "active" },
];

export type Submission = { ex: string; who: string; parish: string; date: string; st: SubState };
export const submissions: Submission[] = [
  { ex: "Reflection on the Beatitudes", who: "Daniel Eze", parish: "St. Peter", date: "12 Jun 2026", st: "pending" },
  { ex: "Reflection on the Beatitudes", who: "Grace Bello", parish: "Holy Cross", date: "12 Jun 2026", st: "pending" },
  { ex: "The Ten Commandments — Short Answer", who: "Ruth Adebayo", parish: "St. Peter", date: "11 Jun 2026", st: "pending" },
  { ex: "Reflection on the Beatitudes", who: "Maria Okonkwo", parish: "St. Peter", date: "10 Jun 2026", st: "graded" },
];

export type Node = { kind: "Region" | "Deanery" | "Parish"; label: string; slug?: string; sub?: SubState; count?: string; children?: Node[] };
export const hierarchy: Node[] = [
  { kind: "Region", label: "Lagos Region", children: [
    { kind: "Deanery", label: "Ikeja Deanery", children: [
      { kind: "Parish", label: "Parish of St. Peter", slug: "stpeter", sub: "active", count: "214 parishioners" },
      { kind: "Parish", label: "Holy Cross Cathedral", slug: "holycross", sub: "active", count: "388 parishioners" },
    ] },
    { kind: "Deanery", label: "Lekki Deanery", children: [
      { kind: "Parish", label: "St. Brigid Parish", slug: "stbrigid", sub: "expired", count: "96 parishioners" },
      { kind: "Parish", label: "Our Lady of Apostles", slug: "olapostles", sub: "active", count: "172 parishioners" },
    ] },
  ] },
  { kind: "Region", label: "Ibadan Region", children: [
    { kind: "Deanery", label: "Bodija Deanery", children: [
      { kind: "Parish", label: "St. Augustine Parish", slug: "staugustine", sub: "suspended", count: "58 parishioners" },
      { kind: "Parish", label: "Christ the King", slug: "christking", sub: "pending", count: "0 parishioners" },
    ] },
  ] },
];

export type SubRow = { p: string; slug: string; st: SubState; start: string; end: string; tier: string };
export const subRows: SubRow[] = [
  { p: "Parish of St. Peter", slug: "stpeter", st: "active", start: "01 Jan 2026", end: "31 Dec 2026", tier: "Standard" },
  { p: "Holy Cross Cathedral", slug: "holycross", st: "active", start: "15 Feb 2026", end: "14 Feb 2027", tier: "Standard" },
  { p: "St. Brigid Parish", slug: "stbrigid", st: "expired", start: "01 Jun 2025", end: "31 May 2026", tier: "Standard" },
  { p: "St. Augustine Parish", slug: "staugustine", st: "suspended", start: "01 Mar 2026", end: "28 Feb 2027", tier: "Standard" },
  { p: "Christ the King", slug: "christking", st: "pending", start: "\u2014", end: "\u2014", tier: "\u2014" },
];

// ---------- helpers ----------
export function initials(name: string) {
  return name.split(" ").slice(0, 2).map((x) => x[0]).join("").toUpperCase();
}
export function childCount(n: Node) {
  const c = n.children?.length ?? 0;
  const word = n.kind === "Region" ? (c === 1 ? "deanery" : "deaneries") : (c === 1 ? "parish" : "parishes");
  return `${c} ${word}`;
}

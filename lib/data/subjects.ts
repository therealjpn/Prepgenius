import type { SubjectDefinition } from "@/lib/types";

export const subjectCatalog: SubjectDefinition[] = [
  {
    examType: "jamb",
    name: "Mathematics",
    slug: "mathematics",
    icon: "Calculator",
    topics: ["Algebra", "Quadratic Equations", "Indices", "Logarithms", "Statistics"]
  },
  {
    examType: "jamb",
    name: "English",
    slug: "english",
    icon: "BookOpen",
    topics: ["Lexis", "Comprehension", "Sentence Interpretation", "Summary"]
  },
  {
    examType: "jamb",
    name: "Physics",
    slug: "physics",
    icon: "Atom",
    topics: ["Mechanics", "Waves", "Electricity", "Heat"]
  },
  {
    examType: "waec",
    name: "Biology",
    slug: "biology",
    icon: "Microscope",
    topics: ["Cell Biology", "Ecology", "Genetics", "Evolution"]
  },
  {
    examType: "waec",
    name: "Chemistry",
    slug: "chemistry",
    icon: "FlaskConical",
    topics: ["Atomic Structure", "Organic Chemistry", "Stoichiometry", "Electrolysis"]
  },
  {
    examType: "neco",
    name: "Government",
    slug: "government",
    icon: "Landmark",
    topics: ["Constitution", "Democracy", "Citizenship", "Public Administration"]
  },
  {
    examType: "ican",
    name: "Financial Reporting",
    slug: "financial-reporting",
    icon: "BadgePercent",
    topics: ["IFRS Framework", "IAS 1", "IAS 16", "IAS 36", "Cash Flow Statements"]
  }
];


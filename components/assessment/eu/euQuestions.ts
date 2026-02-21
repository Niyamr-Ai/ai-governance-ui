export type QuestionType = "text" | "radio" | "checkbox" | "textarea";
export type Priority = "high" | "medium" | "low" | "info";

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  placeholder?: string;
  options?: QuestionOption[];
  conditional?: {
    dependsOn: string;
    value: string;
  };
  priority?: Priority;
  required?: boolean;
  helpText?: string;
  section: string;
}

export const EU_SECTIONS = [
  { id: "basic", title: "Basic Information", description: "System details and scope" },
  { id: "risk", title: "Risk Classification", description: "High-risk and prohibited activities" },
  { id: "compliance", title: "Compliance & Governance", description: "Risk management and accountability" },
];

export const euQuestions: Question[] = [
  {
    id: "q1",
    title: "Does your AI system affect users in the European Union?",
    description: "This determines if the EU AI Act applies to your system.",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", description: "The AI system is used by or affects individuals in the EU" },
      { value: "no", label: "No", description: "The AI system operates outside EU jurisdiction" },
    ],
    priority: "high",
    required: true,
    section: "basic",
  },
  {
    id: "q2",
    title: "What does your AI system do?",
    description: "Provide a brief description of your AI system's purpose and functionality.",
    type: "textarea",
    placeholder: "e.g., Our AI system analyzes customer transaction data to detect fraudulent activities in real-time...",
    priority: "medium",
    required: true,
    section: "basic",
  },
  {
    id: "q3",
    title: "Which of these best describe how your company uses or provides the AI system?",
    description: "Select all roles that apply to your organization.",
    type: "checkbox",
    options: [
      { value: "provider", label: "Provider", description: "We build and develop the AI system" },
      { value: "deployer", label: "Deployer", description: "We use the AI system in our operations" },
      { value: "importer", label: "Importer", description: "We import AI models/tools into the EU" },
      { value: "distributor", label: "Distributor", description: "We resell or redistribute AI tools" },
    ],
    priority: "medium",
    required: true,
    section: "basic",
  },
  {
    id: "q4",
    title: "Does your AI system perform any of these high-risk activities?",
    description: "These activities may trigger enhanced regulatory requirements under the EU AI Act.",
    type: "checkbox",
    options: [
      { value: "job_decision", label: "Employment Decisions", description: "Recruiting, hiring, or promotion decisions" },
      { value: "credit_scoring", label: "Credit Scoring", description: "Evaluating creditworthiness for loans" },
      { value: "education_eval", label: "Education Evaluation", description: "Assessing students or educational outcomes" },
      { value: "facial_recognition", label: "Facial Recognition", description: "Identifying individuals using biometrics" },
      { value: "border_screening", label: "Border Screening", description: "Screening at border control points" },
      { value: "machine_safety", label: "Machine Safety", description: "Controlling safety-critical systems" },
      { value: "none", label: "None of the above", description: "No high-risk activities identified" },
    ],
    priority: "high",
    required: true,
    helpText: "High-risk AI systems are subject to stricter requirements including risk management, data governance, and human oversight.",
    section: "risk",
  },
  {
    id: "q5",
    title: "Does your AI system engage in any of these prohibited or controversial activities?",
    description: "The EU AI Act bans certain AI practices entirely.",
    type: "checkbox",
    options: [
      { value: "subliminal", label: "Subliminal Manipulation", description: "Techniques that influence users subconsciously" },
      { value: "social_scoring", label: "Social Scoring", description: "Evaluating trustworthiness based on social behavior" },
      { value: "facial_scraping", label: "Facial Scraping", description: "Mass facial recognition from public sources" },
      { value: "emotion_tracking", label: "Emotion Tracking", description: "Monitoring emotions in workplace or schools" },
      { value: "biometric_grouping", label: "Biometric Grouping", description: "Categorizing people by sensitive attributes" },
      { value: "none", label: "None of the above", description: "No prohibited activities identified" },
    ],
    priority: "high",
    required: true,
    helpText: "Using prohibited AI practices can result in significant fines up to €35 million or 7% of global turnover.",
    section: "risk",
  },
  {
    id: "q6",
    title: "Which risk management and mitigation measures have you implemented?",
    description: "Select all measures currently in place.",
    type: "checkbox",
    options: [
      { value: "risk_management", label: "Risk Management Process", description: "Formal risk identification and mitigation" },
      { value: "bias_checking", label: "Bias & Data Quality Checks", description: "Regular testing for bias and data issues" },
      { value: "documentation", label: "Technical Documentation", description: "Maintaining logs and system documentation" },
      { value: "human_loop", label: "Human Oversight", description: "Human-in-the-loop for critical decisions" },
      { value: "accuracy", label: "Accuracy & Security Testing", description: "Performance validation and security measures" },
      { value: "conformity", label: "Conformity Assessment", description: "Completed official conformity assessment" },
      { value: "none", label: "None of these", description: "No measures implemented yet" },
    ],
    priority: "medium",
    required: true,
    section: "compliance",
  },
  {
    id: "q7",
    title: "Does your AI system interact with people or create synthetic content?",
    description: "This includes chatbots, content generators, deepfakes, or voice synthesis.",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", description: "The system interacts with users or generates content" },
      { value: "no", label: "No", description: "The system operates autonomously without user interaction" },
    ],
    priority: "medium",
    required: true,
    section: "compliance",
  },
  {
    id: "q7a",
    title: "How do you inform users they are interacting with AI?",
    description: "Describe your transparency and disclosure mechanisms.",
    type: "textarea",
    placeholder: "e.g., We display a clear 'AI Assistant' badge on all chat interfaces and disclose AI-generated content with watermarks...",
    conditional: { dependsOn: "q7", value: "yes" },
    priority: "medium",
    required: true,
    section: "compliance",
  },
  {
    id: "q8",
    title: "Have you completed a Fundamental Rights Impact Assessment and post-market monitoring?",
    description: "These are required for high-risk AI systems under the EU AI Act.",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, both completed", description: "All required assessments are in place" },
      { value: "partial", label: "Partially completed", description: "Some assessments are underway" },
      { value: "no", label: "Not started", description: "We have not begun these assessments" },
    ],
    priority: "medium",
    required: true,
    section: "compliance",
  },
  {
    id: "q9",
    title: "Which accountability and governance measures have you implemented?",
    description: "Select all measures currently in place.",
    type: "checkbox",
    options: [
      { value: "accountability_framework", label: "Accountability Framework", description: "Clear roles and responsibilities defined" },
      { value: "human_oversight", label: "Human Oversight Mechanisms", description: "Processes for human review and intervention" },
      { value: "governance_structure", label: "Governance Structure", description: "AI governance committee or similar body" },
      { value: "audit_trail", label: "Audit Trail & Record-keeping", description: "Logging and documentation for audits" },
      { value: "risk_management_process", label: "Risk Management Process", description: "Ongoing risk monitoring and mitigation" },
      { value: "none", label: "None of these", description: "No governance measures implemented yet" },
    ],
    priority: "medium",
    required: true,
    section: "compliance",
  },
  {
    id: "q10",
    title: "Who is accountable for this AI system?",
    description: "Identify the responsible person, team, or department.",
    type: "textarea",
    placeholder: "e.g., John Smith - Chief AI Officer, or AI Governance Team (governance@company.com)",
    priority: "high",
    required: true,
    section: "compliance",
  },
];

export const rapidQuestionIds = ["q1", "q2", "q4", "q5", "q7", "q7a", "q10"];

export function getQuestionsForMode(mode: "rapid" | "comprehensive") {
  if (mode === "rapid") {
    return euQuestions.filter((q) => rapidQuestionIds.includes(q.id));
  }
  return euQuestions;
}

export function getSectionsWithQuestions(mode: "rapid" | "comprehensive") {
  const questions = getQuestionsForMode(mode);
  const sectionMap = new Map<string, Question[]>();

  questions.forEach((q) => {
    const existing = sectionMap.get(q.section) || [];
    sectionMap.set(q.section, [...existing, q]);
  });

  return EU_SECTIONS.filter((section) => sectionMap.has(section.id)).map((section) => ({
    ...section,
    questions: sectionMap.get(section.id) || [],
  }));
}

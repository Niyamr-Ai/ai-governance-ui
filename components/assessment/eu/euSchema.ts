import { z } from "zod";

const createCheckboxSchema = (message: string) =>
  z.array(z.string()).min(1, message);

const createRadioSchema = (message: string) =>
  z.enum(["yes", "no", "partial"], { required_error: message });

export const euComprehensiveSchema = z.object({
  q1: createRadioSchema("Please indicate whether your AI system affects users in the EU"),
  
  q2: z.string().min(1, "Please describe what your AI system does"),
  
  q3: createCheckboxSchema("Please select at least one role"),
  
  q4: createCheckboxSchema("Please select at least one option"),
  
  q5: createCheckboxSchema("Please select at least one option"),
  
  q6: createCheckboxSchema("Please select at least one option"),
  
  q7: createRadioSchema("Please indicate if your AI system interacts with people"),
  
  q7a: z.string().optional(),
  
  q8: z.enum(["yes", "partial", "no"], {
    required_error: "Please indicate assessment completion status",
  }),
  
  q9: createCheckboxSchema("Please select at least one option"),
  
  q10: z.string().min(1, "Please specify who is accountable for this AI system"),
}).refine(
  (data) => {
    if (data.q7 === "yes") {
      return data.q7a && data.q7a.length > 0;
    }
    return true;
  },
  {
    message: "Please describe how users are informed it's AI",
    path: ["q7a"],
  }
);

export const euRapidSchema = z.object({
  q1: createRadioSchema("Required"),
  
  q2: z.string().min(1, "Required"),
  
  q4: createCheckboxSchema("Required"),
  
  q5: createCheckboxSchema("Required"),
  
  q7: createRadioSchema("Required"),
  
  q7a: z.string().optional(),
  
  q10: z.string().min(1, "Required"),
}).refine(
  (data) => {
    if (data.q7 === "yes") {
      return data.q7a && data.q7a.length > 0;
    }
    return true;
  },
  {
    message: "Required",
    path: ["q7a"],
  }
);

export type EuFormValues = z.infer<typeof euComprehensiveSchema>;

export function getSchemaForMode(mode: "rapid" | "comprehensive") {
  return mode === "rapid" ? euRapidSchema : euComprehensiveSchema;
}

export function getDefaultValues(mode: "rapid" | "comprehensive", existingData?: Record<string, unknown>) {
  const allQuestions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q7a", "q8", "q9", "q10"];
  
  const defaults: Record<string, unknown> = {};
  
  allQuestions.forEach((id) => {
    if (id === "q3" || id === "q4" || id === "q5" || id === "q6" || id === "q9") {
      defaults[id] = existingData?.[id] || [];
    } else {
      defaults[id] = existingData?.[id] || "";
    }
  });
  
  return defaults;
}

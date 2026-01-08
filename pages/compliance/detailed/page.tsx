"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, FileText, Shield, ChevronLeft, ChevronRight, Send, ClipboardCheck } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { signOutAction } from "@/app/actions";
import { createClient } from "@/ai-governance-backend/utils/supabase/client";
import { useRouter } from "next/navigation";

// Define the question types
type QuestionType = "checkbox" | "text";

interface Question {
  id: string;
  type: QuestionType;
  question: string;
}

interface Answer {
  question: string;
  answer: string | boolean;
}

interface Category {
  id: string;
  title: string;
  questions: Question[];
}

// Define all categories and questions
const categories: Category[] = [
  {
    id: "riskManagement",
    title: "Risk Management",
    questions: [
      {
        id: "rm1",
        type: "checkbox",
        question:
          "Is there a documented, continuous, and iterative risk management system in place throughout the AI system's entire lifecycle?",
      },
      {
        id: "rm2",
        type: "checkbox",
        question:
          "Does the system identify and analyze known and reasonably foreseeable risks to health, safety, or fundamental rights?",
      },
      {
        id: "rm3",
        type: "text",
        question:
          "Describe how the system's risk evaluation process addresses the potential for misuse, as well as any other risks identified from post-market monitoring.",
      },
      {
        id: "rm4",
        type: "text",
        question:
          "What specific risk management measures, such as fail-safe plans or redundancy solutions, have been implemented to mitigate or eliminate risks?",
      },
    ],
  },
  {
    id: "dataGovernance",
    title: "Data and Data Governance",
    questions: [
      {
        id: "dg1",
        type: "checkbox",
        question:
          "Are the training, validation, and testing data sets used to develop the AI system relevant, representative, and free of errors?",
      },
      {
        id: "dg2",
        type: "text",
        question:
          "Detail the data governance measures that have been implemented to detect and correct potential biases in the data sets, particularly when processing special categories of personal data.",
      },
      {
        id: "dg3",
        type: "text",
        question:
          "How do you ensure the data reflects the specific geographical, behavioral, contextual, or functional setting in which the AI system is intended to be used?",
      },
    ],
  },
  {
    id: "technicalDocumentation",
    title: "Technical Documentation and Record-Keeping",
    questions: [
      {
        id: "td1",
        type: "checkbox",
        question:
          "Is a single, up-to-date set of technical documentation available and maintained?",
      },
      {
        id: "td2",
        type: "text",
        question:
          "Provide a summary of the technical documentation, including the AI system's architecture, data requirements, validation procedures, and cybersecurity measures.",
      },
      {
        id: "td3",
        type: "checkbox",
        question:
          "Does the AI system technically allow for the automatic recording of events (logs) over its lifetime?",
      },
      {
        id: "td4",
        type: "text",
        question:
          "What specific events are logged, and how do these logs facilitate the identification of risks and post-market monitoring?",
      },
    ],
  },
  {
    id: "transparencyOversight",
    title: "Transparency and Human Oversight",
    questions: [
      {
        id: "to1",
        type: "text",
        question:
          "Describe how the AI system's operation is made sufficiently transparent to enable deployers to interpret its output and use it appropriately.",
      },
      {
        id: "to2",
        type: "checkbox",
        question:
          "Are the instructions for use concise, complete, correct, and clear, detailing the system's characteristics and limitations?",
      },
      {
        id: "to3",
        type: "text",
        question:
          "Explain the human oversight measures in place, including the assignment of natural persons with the necessary competence, training, and authority to oversee the system's operation.",
      },
    ],
  },
  {
    id: "accuracyRobustness",
    title: "Accuracy, Robustness, and Cybersecurity",
    questions: [
      {
        id: "ar1",
        type: "checkbox",
        question:
          "Has the AI system been developed to achieve an appropriate level of accuracy, robustness, and cybersecurity, based on its intended purpose and the state of the art?",
      },
      {
        id: "ar2",
        type: "text",
        question:
          "What technical and organizational measures are in place to ensure the system's resilience against errors, faults, and unexpected situations?",
      },
      {
        id: "ar3",
        type: "text",
        question:
          "Describe the security controls used to make the system resilient against cyberattacks that could alter its use, behavior, or performance. This should include measures to prevent, detect, and respond to data poisoning and model poisoning.",
      },
    ],
  },
  {
    id: "conformityAssessment",
    title: "Conformity Assessment and Deployer Obligations",
    questions: [
      {
        id: "ca1",
        type: "checkbox",
        question:
          "Has a conformity assessment procedure been completed before the AI system was placed on the market or put into service?",
      },
      {
        id: "ca2",
        type: "checkbox",
        question:
          "Is a quality management system in place that ensures compliance with the regulation?",
      },
      {
        id: "ca3",
        type: "checkbox",
        question:
          "Has an EU declaration of conformity been drawn up, and is a CE marking affixed to the high-risk AI system?",
      },
      {
        id: "ca4",
        type: "text",
        question:
          "For deployers, describe the fundamental rights impact assessment that was performed prior to deployment, including a description of the processes, affected persons, and identified risks.",
      },
    ],
  },
];

export default function DetailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground mt-4">Loading...</p>
        </div>
      </div>
    }>
      <DetailedPageContent />
    </Suspense>
  );
}

function DetailedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const complianceId = searchParams.get("id");
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await signOutAction();
    router.push("/");
  };

  const currentCategory = categories[currentCategoryIndex];
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const isFirstCategory = currentCategoryIndex === 0;

  // Get answer for a specific question
  const getAnswer = (questionText: string) => {
    const answer = answers.find((a) => a.question === questionText);
    return answer?.answer !== undefined ? answer.answer : null;
  };

  // Update answer for a specific question
  const updateAnswer = (
    questionId: string,
    questionText: string,
    answer: string | boolean
  ) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.question === questionText);
      const newAnswer: Answer = { question: questionText, answer };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });
  };

  // Check if current category is complete
  const isCategoryComplete = () => {
    return currentCategory.questions.every((question) => {
      const answer = getAnswer(question.question);
      if (question.type === "checkbox") {
        return answer !== null;
      } else {
        return typeof answer === "string" && answer.trim() !== "";
      }
    });
  };

  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!complianceId) {
      setSubmitMessage("Error: Missing compliance ID. Please go back and try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Log all questions and answers
      console.log("Detailed questionnaire answers:", answers);
      console.log("Compliance ID:", complianceId);

      // Convert answers array to object format expected by API
      // The API expects an object where keys are question texts and values are answers
      const answersObject: Record<string, any> = {};
      answers.forEach((answer) => {
        answersObject[answer.question] = answer.answer;
      });

      // Include compliance_id in the request body
      const requestBody = {
        compliance_id: complianceId,
        ...answersObject,
      };

      const res = await fetch("/api/compliance/detailed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit detailed check");
      }

      setSubmitMessage("Detailed questionnaire submitted successfully!");

      // Reset form
      setAnswers([]);
      setCurrentCategoryIndex(0);
    } catch (error) {
      setSubmitMessage(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category icons mapping
  const categoryIcons: Record<string, any> = {
    "Risk Management": Shield,
    "Data and Data Governance": ClipboardCheck,
    "Technical Documentation and Record-Keeping": FileText,
    "Transparency and Human Oversight": AlertCircle,
    "Accuracy, Robustness, and Cybersecurity": Shield,
    "Conformity Assessment and Deployer Obligations": CheckCircle2,
  };

  const CategoryIcon = categoryIcons[currentCategory.title] || Shield;

  return (
    <main className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-10">
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}
      <div className={`flex items-center justify-center ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="w-full max-w-4xl">
          <Card className="glass-panel border-border/50 shadow-elevated rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-2xl p-8 border-b border-border/50">
            <div className="flex items-center justify-center gap-3 mb-2">
                <ClipboardCheck className="h-8 w-8 text-primary" />
                <CardTitle className="text-4xl font-bold text-center text-foreground">
                Detailed Compliance Questionnaire
              </CardTitle>
            </div>
              <CardDescription className="text-muted-foreground text-center text-lg mt-2">
              Complete detailed assessment for each compliance category
            </CardDescription>
          </CardHeader>
            <CardContent className="p-8 sm:p-10 bg-secondary/20">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-foreground bg-secondary/50 border border-border/50 px-4 py-2 rounded-xl">
                  Step {currentCategoryIndex + 1} of {categories.length}
                </span>
                <span className="text-sm font-semibold text-foreground bg-secondary/50 border border-border/50 px-4 py-2 rounded-xl">
                  {Math.round(
                    ((currentCategoryIndex + 1) / categories.length) * 100
                  )}
                  % Complete
                </span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-3 shadow-inner border border-border/50">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-lg shadow-primary/30"
                  style={{
                    width: `${((currentCategoryIndex + 1) / categories.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Category title */}
            <div className="mb-8 text-center p-6 rounded-xl glass-panel border-border/50">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CategoryIcon className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold text-foreground">
                  {currentCategory.title}
                </h2>
              </div>
              <p className="text-muted-foreground font-medium">
                Please answer all questions in this category to proceed.
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-10">
              {currentCategory.questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="glass-panel border-border/50 p-6 rounded-xl shadow-sm hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
                >
                  <label className="flex items-start gap-3 text-lg font-semibold text-foreground mb-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-bold mt-0.5 shadow-lg shadow-primary/30">
                      {qIndex + 1}
                    </span>
                    <span className="flex-1">
                      {question.question}
                      <span className="text-red-600 ml-1.5">*</span>
                    </span>
                  </label>

                  {question.type === "checkbox" ? (
                    <div className="space-y-3 ml-10">
                      <label
                        className={`flex items-center space-x-4 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                          getAnswer(question.question) === true
                            ? "border-emerald-500/50 bg-emerald-50 shadow-md ring-2 ring-emerald-500/30"
                            : "border-border/50 bg-secondary/30 hover:border-emerald-500/50 hover:bg-emerald-50/50"
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            id={`${question.id}-yes`}
                            name={question.id}
                            value="true"
                            checked={getAnswer(question.question) === true}
                            onChange={() =>
                              updateAnswer(question.id, question.question, true)
                            }
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            getAnswer(question.question) === true
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-gray-400 bg-gray-200"
                          }`}>
                            {getAnswer(question.question) === true && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <span className={`flex-1 font-medium ${
                          getAnswer(question.question) === true ? "text-emerald-700" : "text-foreground"
                        }`}>
                          Yes
                        </span>
                        {getAnswer(question.question) === true && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        )}
                      </label>
                      <label
                        className={`flex items-center space-x-4 rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                          getAnswer(question.question) === false
                            ? "border-red-500/50 bg-red-50 shadow-md ring-2 ring-red-500/30"
                            : "border-border/50 bg-secondary/30 hover:border-red-500/50 hover:bg-red-50/50"
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            id={`${question.id}-no`}
                            name={question.id}
                            value="false"
                            checked={getAnswer(question.question) === false}
                            onChange={() =>
                              updateAnswer(question.id, question.question, false)
                            }
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            getAnswer(question.question) === false
                              ? "border-red-600 bg-red-600"
                              : "border-gray-400 bg-gray-200"
                          }`}>
                            {getAnswer(question.question) === false && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <span className={`flex-1 font-medium ${
                          getAnswer(question.question) === false ? "text-red-700" : "text-foreground"
                        }`}>
                          No
                        </span>
                        {getAnswer(question.question) === false && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="ml-10">
                      <textarea
                        value={(getAnswer(question.question) as string) || ""}
                        onChange={(e) =>
                          updateAnswer(question.id, question.question, e.target.value)
                        }
                        rows={5}
                        className="block w-full p-4 border-2 border-border/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-base resize-y transition-all duration-200 bg-background hover:border-primary/50 focus:shadow-md text-foreground placeholder:text-muted-foreground"
                        placeholder="Enter your detailed response here..."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-border/50">
              <Button
                onClick={handlePrevious}
                disabled={isFirstCategory}
                variant="outline"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isFirstCategory
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </Button>

              {isLastCategory ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCategoryComplete() || isSubmitting}
                  variant="hero"
                  className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
                  !isCategoryComplete() || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Questionnaire</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCategoryComplete()}
                  variant="hero"
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    !isCategoryComplete()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Completion status */}
            {!isCategoryComplete() && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Please complete all questions in this category to proceed</span>
              </div>
            )}

            {/* Submit message */}
            {submitMessage && (
              <div
                className={`mt-6 p-5 rounded-xl text-center text-base font-medium shadow-md ${
                  submitMessage.includes("Error") || submitMessage.includes("error")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {submitMessage.includes("Error") || submitMessage.includes("error") ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  )}
                  <span>{submitMessage}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </main>
  );
}

import type { FollowUpQuestion, SolutionOption } from "./draft";
import type { HazardKind, NoticeKind } from "./vocabulary";

export type Escalation = {
  risk: "high" | "critical";
  reason: string;
  hazards: HazardKind[];
  actions: string[];
  professionals: string[];
  origin: "precheck" | "output";
};

export type Notice = {
  kind: NoticeKind;
  certainty: "applies" | "possible";
  text: string;
  marks: ("check-locally" | "check-with-manufacturer-or-funding-body")[];
};

export type UserNotice = {
  reason: "insufficient-information" | "output-rejected" | "technical-error" | "offline";
  text: string;
  missing: string[];
};

export type CaseOutcome =
  | { type: "questions"; round: 1 | 2; missing: string[]; questions: FollowUpQuestion[] }
  | { type: "escalation"; escalation: Escalation }
  | {
      type: "guidance";
      summary: string;
      assumptions: string[];
      options: SolutionOption[];
      notices: Notice[];
      photoAlt: string | null;
    }
  | { type: "notice"; notice: UserNotice };

export type ExplainOutcome =
  | { type: "explanation"; packageId: string; steps: { n: number; basics: string }[] }
  | { type: "notice"; notice: UserNotice };

export type StepAnswerOutcome =
  | { type: "answer"; text: string }
  | { type: "escalation"; escalation: Escalation }
  | { type: "notice"; notice: UserNotice };

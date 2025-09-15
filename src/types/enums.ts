enum UserRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  USER = "USER",
}

enum QuizType {
  MULTIPLE_CHOICE_SINGLE = "MULTIPLE_CHOICE_SINGLE",
  MULTIPLE_CHOICE_MULTIPLE = "MULTIPLE_CHOICE_MULTIPLE",
  SHORT_ANSWER = "SHORT_ANSWER",
  LONG_ANSWER = "LONG_ANSWER",
  INPUT_FIELD = "INPUT_FIELD",
  CUSTOM_FORMAT = "CUSTOM_FORMAT",
}

enum OnboardingFieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  SELECT = "SELECT",
  MULTISELECT = "MULTISELECT",
  FILE = "FILE",
  DATE = "DATE",
  MARKDOWN = "MARKDOWN",
  JSON = "JSON",
}

enum SubmissionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum SubmissionType {
  ONBOARDING = "ONBOARDING",
  QUIZ = "QUIZ",
}

export {
  UserRole,
  QuizType,
  OnboardingFieldType,
  SubmissionStatus,
  SubmissionType,
};

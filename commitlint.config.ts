module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Requires lowercase for header, subject, type, and case
    "header-case": [2, "always", "lower-case"],
    "subject-case": [2, "always", "lower-case"],
    "type-case": [2, "always", "lower-case"],
    // Allowed commit types
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
  },
};

// Index = strength score (0 = too short ... 4 = strong), see views/settings/security/utils.
export const PasswordStrengthLabelOptions: { id: number; label: string; hint: string }[] = [
  { id: 0, label: "Too short", hint: "Use at least 8 characters." },
  { id: 1, label: "Weak", hint: "Add more characters or a few unrelated words." },
  { id: 2, label: "Fair", hint: "Getting there. A longer passphrase is stronger." },
  { id: 3, label: "Good", hint: "Good. Longer passphrases are better than symbols." },
  { id: 4, label: "Strong", hint: "Strong. Longer passphrases are better than symbols." },
];

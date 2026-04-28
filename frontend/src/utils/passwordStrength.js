import { PASSWORD_RULES } from "./passwordRules";

export function getPasswordStrength(password) {

  if (!password) return null;

  const passed = PASSWORD_RULES.filter(rule =>
    rule.test(password)
  ).length;

  if (passed <= 2) return "débil";
  if (passed <= 4) return "media";

  return "fuerte";
}
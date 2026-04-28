export const PASSWORD_RULES = [
  {
    id: "length",
    label: "Entre 6 y 30 caracteres",
    test: (password) => password.length >= 6 && password.length <= 30,
  },
  {
    id: "uppercase",
    label: "Al menos 1 mayúscula",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "Al menos 1 minúscula",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "Al menos 1 número",
    test: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    label: "Al menos 1 símbolo",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
  {
    id: "spaces",
    label: "Sin espacios",
    test: (password) => !/\s/.test(password),
  },
];
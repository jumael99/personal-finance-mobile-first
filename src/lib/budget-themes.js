export const budgetThemes = [
  {
    value: 'cyan',
    label: 'Ocean Cyan',
    dotClassName: 'bg-finance-cyan',
    progressClassName: 'bg-finance-cyan',
  },
  {
    value: 'plum',
    label: 'Mulberry Plum',
    dotClassName: 'bg-finance-plum',
    progressClassName: 'bg-finance-plum',
  },
  {
    value: 'slate',
    label: 'Storm Slate',
    dotClassName: 'bg-finance-slate',
    progressClassName: 'bg-finance-slate',
  },
  {
    value: 'rust',
    label: 'Terracotta Rust',
    dotClassName: 'bg-finance-rust',
    progressClassName: 'bg-finance-rust',
  },
  {
    value: 'teal',
    label: 'Forest Teal',
    dotClassName: 'bg-finance-teal',
    progressClassName: 'bg-finance-teal',
  },
  {
    value: 'ochre',
    label: 'Golden Ochre',
    dotClassName: 'bg-finance-ochre',
    progressClassName: 'bg-finance-ochre',
  },
];

const themeByValue = Object.fromEntries(budgetThemes.map((theme) => [theme.value, theme]));

export function getBudgetTheme(themeValue) {
  return themeByValue[themeValue] || themeByValue.cyan;
}

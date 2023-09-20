module.exports = {
  extends: [
    './base.eslintrc.cjs',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'no-console': 'off',
    'max-len': 'warn',
    'semi': 'warn',
    'arrow-parens': 'warn',
    'object-curly-newline': 'warn',
    'comma-dangle': 'warn',
    'consistent-return': 'warn',
    'array-bracket-spacing': 'warn',
    'quote-props': 'off',
    'quotes': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'import/prefer-default-export': 'warn',
    'import/extensions': 'off',
    'vue/multi-word-component-names': ['error', {
      ignores: [
        'Fade',
        'Carousel',
        'Drawer',
        'Skeleton',
        'Prices',
        'Banner',
        'Countdown',
        'Collapse',
        'Accordion',
      ],
    }],
    'tailwindcss/no-custom-classname': 'off',
  },
};

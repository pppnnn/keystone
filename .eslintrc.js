module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
    'cypress/globals': true,
  },
  plugins: ['react', 'react-hooks', 'jest', 'cypress', 'import', 'emotion', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    curly: ['error', 'multi-line'],
    'jsx-quotes': 'error',
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-unused-expressions': 'error',
    'react-hooks/rules-of-hooks': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/__tests__/**/*',
          '**/*test.*',
          '**/tests/**/*',
          '**/examples/**/*',
          '**/build/**/*',
          `packages/fields/src/**/filterTests.*`,
          '**/test-fixtures.*',
        ],
      },
    ],
    'import/no-unresolved': 'error',
    'jest/valid-describe': 'off',
    'jest/valid-expect': 'off',
    'object-curly-spacing': ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'react/jsx-boolean-value': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-wrap-multilines': 'warn',
    'react/no-did-mount-set-state': 'warn',
    'react/no-did-update-set-state': 'warn',
    'react/no-unknown-property': 'warn',
    'react/react-in-jsx-scope': 'error',
    'react/self-closing-comp': 'warn',
    'react/sort-prop-types': 'warn',
    semi: 'error',
    strict: 'off',
    'emotion/jsx-import': 'error',
    'emotion/no-vanilla': 'error',
    'emotion/import-from-emotion': 'error',
    'emotion/styled-import': 'error',
    'no-restricted-syntax': [
      'error',
      {
        // Curious why we have this rule?
        // - Enums only work for a subset of use cases that unions of string literals + objects work for and learning one language feature is easier than learning two language features
        // - Enums are a new language feature which have runtime semantics which means they change TypeScript from JS + types to JS + types + extra language features which is harder to teach without clear advantages for this specific feature
        selector: 'TSEnumDeclaration',
        message: 'Use a union of string literals instead of an enum',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Function:
            '`Function` types are unsafe. Use more specific function types instead. e.g. (arg: number) => string',
          String: {
            message:
              'The `String` type refers to the String object which is probably not what you want, you probably want `string` instead which refers to the string primitive type.',
            fixWith: 'string',
          },
        },
      },
    ],
  },
  extends: ['plugin:jest/recommended'],

  // Disable some rules for (code blocks within) Markdown docs
  overrides: [
    {
      files: ['**/*.md'],
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['packages/fields/src/**/*.{js,ts,tsx}'],
      rules: {
        'import/no-commonjs': 'error',
      },
    },
  ],
};

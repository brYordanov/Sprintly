import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**',
            '**/coverage/**',
        ],
    },

    js.configs.recommended,
    prettier,

    {
        files: ['apps/api/**/*.ts', 'apps/api/**/*.tsx'],
        languageOptions: {
            globals: { ...globals.node, ...globals.jest },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        ...tseslint.configs.recommendedTypeChecked,
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        ...tseslint.configs.recommended,
        rules: {
            'import/no-duplicates': 'error',
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                },
            ],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-imports': 'off',
            'no-debugger': 'warn',
            'no-console': 'off',
            //todo - dont allow logs in prod
        },
    },
)

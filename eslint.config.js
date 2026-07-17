import js from '@eslint/js'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

function restrictImports(groups, message) {
  return [
    'error',
    {
      patterns: [
        {
          group: ['../*'],
          message: '폴더를 넘는 import는 @/ alias를 사용하세요.',
        },
        { group: groups, message },
      ],
    },
  ]
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-nested-ternary': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: '폴더를 넘는 import는 @/ alias를 사용하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        ['@/app/**', '@/components/**', '@/features/**', '@/lib/**', '@/stores/**'],
        'core는 순수 도메인 계층이므로 상위 UI, 상태관리, 외부 연동 계층을 import할 수 없습니다.',
      ),
    },
  },
  {
    files: ['src/content/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        [
          '@/app/**',
          '@/components/**',
          '@/core/**',
          '@/features/**',
          '@/lib/**',
          '@/stores/**',
        ],
        'content는 정적 데이터 계층이므로 다른 애플리케이션 계층을 import할 수 없습니다.',
      ),
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        ['@/app/**', '@/features/**', '@/lib/**', '@/stores/**'],
        '공용 UI는 앱, 기능, 외부 연동, 상태관리 계층에 의존할 수 없습니다.',
      ),
    },
  },
  {
    files: ['src/stores/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        ['@/app/**', '@/components/**', '@/features/**'],
        '스토어는 앱과 UI 계층에 의존할 수 없습니다.',
      ),
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports(
        ['@/app/**', '@/features/**', '@/lib/**'],
        '기능 계층은 앱, 다른 기능, 외부 연동 계층을 직접 import할 수 없습니다.',
      ),
    },
  },
])

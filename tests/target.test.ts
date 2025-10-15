import { describe, expect, test } from 'vitest'
import { testBuild } from './utils'

describe('target', () => {
  test('js syntax lowering', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: { 'index.ts': 'export const foo: number = a?.b?.()' },
      options: { target: 'es2015' },
    })
    expect(snapshot).not.contain('?.')
  })

  test('unnecessary js syntax lowering', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: { 'index.ts': 'export const foo: number = a?.b?.()' },
      options: { target: ['chrome120', 'safari16', 'firefox120'] },
    })
    expect(snapshot).contain('?.')
  })

  test('css syntax lowering', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: { 'index.css': '.foo { & .bar { color: red } }' },
      options: { entry: 'index.css', target: 'chrome108' },
    })
    expect(snapshot).not.contain('&')
  })

  test('unnecessary css syntax lowering', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: { 'index.css': '.foo { & .bar { color: red } }' },
      options: { entry: 'index.css', target: ['safari18.4'] },
    })
    expect(snapshot).contain('&')
  })

  test('target: false disables all syntax transformations', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: { 'index.ts': 'export const foo: number = a?.b?.()' },
      options: { target: false },
    })
    // Modern syntax should be preserved when target is false
    expect(snapshot).contain('?.')
  })

  test('target: false with CSS preserves modern syntax', async (context) => {
    const { snapshot } = await testBuild({
      context,
      files: { 'index.css': '.foo { & .bar { color: red } }' },
      options: { entry: 'index.css', target: false },
    })
    // Modern CSS syntax should be preserved when target is false
    expect(snapshot).contain('&')
  })

  test('numeric target flag should show a useful error message', async (context) => {
    const run = async () =>
      await testBuild({
        context,
        files: { 'index.ts': 'export const foo = 1' },
        options: {
          // @ts-expect-error: A numeric target flag is not valid
          target: 24,
        },
      })
    await expect(run).rejects.toThrow()
    await expect(run).rejects.toMatchInlineSnapshot(
      `[TypeError: format.split is not a function]`,
    )
  })
})

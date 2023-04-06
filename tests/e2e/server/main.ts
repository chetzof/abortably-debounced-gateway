const modules = import.meta.glob('../scenarios/*.mock.ts')
console.log(modules)
// import expect from '@storybook/expect'
window.runTest = async (name, ...arguments_: unknown[]) => {
  const module = await modules[`../scenarios/${name}.mock.ts`]()
  return await module.default(...arguments_)
}

export {}

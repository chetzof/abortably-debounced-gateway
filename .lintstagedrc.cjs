const { ESLint } = require('eslint')

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint()
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file)
    }),
  )
  const filteredFiles = files.filter((_, i) => !isIgnored[i])
  return filteredFiles.join(' ')
}
module.exports = {
  '*': async (files) => {
    const filesToLint = await removeIgnoredFiles(files)
    return [`npm run fix:eslint ${filesToLint}`, 'npm run fix:prettier .']
  },
  '**/*.ts?(x)': [() => 'npm run lint:tsc', 'vitest related --run'],
}

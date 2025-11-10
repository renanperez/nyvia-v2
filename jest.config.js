export default {
  testEnvironment: 'node',                // Ambiente de execução: Node.js
  transform: { '^.+\\.js$': 'babel-jest' }, // Transforma código moderno (import/export) para algo que o Jest entende
  moduleFileExtensions: ['js', 'json'],   // Extensões de arquivo que o Jest reconhece
  roots: ['<rootDir>/src/tests']          // Pasta onde estão os arquivos de teste
}

/**
 * Jest configuration for Nyvia project.
 * - Uses Node test environment.
 * - Transforms JS files using babel-jest.
 * - Supports .js and .json modules.
 * - Looks for tests in src/tests directory.
 */
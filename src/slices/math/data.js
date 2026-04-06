import { STEPS_CONTENT } from './content.js';

export const MOD_MATH = {
  id: 'math',
  title: 'Matemática para CS',
  steps: [
    {
      short: '1. Lógica & Provas',
      title: '🔣 Lógica Proposicional, Predicados & Provas',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'Discrete Mathematics (Rosen)', url: 'https://www.mhhe.com/rosen'},
        {text: 'Curry-Howard Correspondence', url: 'https://en.wikipedia.org/wiki/Curry%E2%80%93Howard_correspondence'},
        {text: 'SAT Problem (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Boolean_satisfiability_problem'}
      ]
    },
    {
      short: '2. Conjuntos & Relações',
      title: '🔗 Teoria dos Conjuntos, Relações & Funções',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Set Theory (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Set_theory'},
        {text: 'Relation (Mathematics)', url: 'https://en.wikipedia.org/wiki/Binary_relation'},
        {text: 'Cantor\'s Diagonal Argument', url: 'https://en.wikipedia.org/wiki/Cantor%27s_diagonal_argument'}
      ]
    },
    {
      short: '3. Combinatória & Prob.',
      title: '🎲 Combinatória & Probabilidade',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'Combinatorics (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Combinatorics'},
        {text: 'Bayes\' Theorem (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Bayes%27_theorem'},
        {text: 'Birthday Problem', url: 'https://en.wikipedia.org/wiki/Birthday_problem'}
      ]
    },
    {
      short: '4. Teoria dos Grafos',
      title: '📐 Teoria dos Grafos Formal',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'Graph Theory (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Graph_theory'},
        {text: 'Four Color Theorem', url: 'https://en.wikipedia.org/wiki/Four_color_theorem'},
        {text: 'Max-Flow Min-Cut', url: 'https://en.wikipedia.org/wiki/Max-flow_min-cut_theorem'}
      ]
    },
    {
      short: '5. Álgebra Linear',
      title: '📊 Álgebra Linear para CS',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'Linear Algebra (3Blue1Brown)', url: 'https://www.3blue1brown.com/topics/linear-algebra'},
        {text: 'SVD (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Singular_value_decomposition'},
        {text: 'PageRank (Original Paper)', url: 'http://infolab.stanford.edu/~backrub/google.html'}
      ]
    },
    {
      short: '6. Teoria dos Números',
      title: '🔢 Teoria dos Números & Criptografia',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'RSA (Wikipedia)', url: 'https://en.wikipedia.org/wiki/RSA_(cryptosystem)'},
        {text: 'A Computational Introduction to Number Theory', url: 'https://shoup.net/ntb/'},
        {text: 'Post-Quantum Cryptography (NIST)', url: 'https://csrc.nist.gov/projects/post-quantum-cryptography'}
      ]
    }
  ]
};

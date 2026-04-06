import { STEPS_CONTENT } from './content.js';

export const MOD_DSA = {
  id: 'dsa',
  title: 'Estruturas de Dados & Algoritmos',
  steps: [
    {
      short: '1. Complexidade',
      title: '📊 Complexidade & Análise Assintótica',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'Introduction to Algorithms (CLRS)', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/'},
        {text: 'Big-O Cheat Sheet', url: 'https://www.bigocheatsheet.com/'},
        {text: 'Master Theorem (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Master_theorem_(analysis_of_algorithms)'}
      ]
    },
    {
      short: '2. Estruturas Lineares',
      title: '📏 Arrays, Listas Ligadas, Stacks & Queues',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Visualgo - Linked List', url: 'https://visualgo.net/en/list'},
        {text: 'Dynamic Array (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Dynamic_array'},
        {text: 'Skip List (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Skip_list'}
      ]
    },
    {
      short: '3. Árvores & Heaps',
      title: '🌳 Árvores Binárias, Balanceadas & Heaps',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'Red-Black Tree (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Red%E2%80%93black_tree'},
        {text: 'Visualgo - BST', url: 'https://visualgo.net/en/bst'},
        {text: 'Binary Heap (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Binary_heap'}
      ]
    },
    {
      short: '4. Hash Tables & Grafos',
      title: '🗺️ Hash Tables & Grafos',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'Hash Table (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Hash_table'},
        {text: 'Visualgo - Graph', url: 'https://visualgo.net/en/graphds'},
        {text: 'Dijkstra\'s Algorithm', url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm'}
      ]
    },
    {
      short: '5. Sorting & Searching',
      title: '🔢 Algoritmos de Ordenação & Busca',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'Sorting Algorithm (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Sorting_algorithm'},
        {text: 'Visualgo - Sorting', url: 'https://visualgo.net/en/sorting'},
        {text: 'TimSort Paper', url: 'https://bugs.python.org/file4451/timsort.txt'}
      ]
    },
    {
      short: '6. Algoritmos Avançados',
      title: '🧮 DP, Greedy, Divide & Conquer e Grafos',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'Dynamic Programming (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Dynamic_programming'},
        {text: 'A* Search (Wikipedia)', url: 'https://en.wikipedia.org/wiki/A*_search_algorithm'},
        {text: 'Algorithm Design Manual (Skiena)', url: 'https://www.algorist.com/'}
      ]
    }
  ]
};

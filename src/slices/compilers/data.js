import { STEPS_CONTENT } from './content.js';

export const MOD_COMP = {
  id: 'comp',
  title: 'Compiladores & Interpretadores',
  steps: [
    {
      short: '1. Análise Léxica',
      title: '🔤 Lexer: Do Texto aos Tokens',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'Lexical Analysis (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Lexical_analysis'},
        {text: 'Crafting Interpreters — Scanning', url: 'https://craftinginterpreters.com/scanning.html'},
        {text: 'Thompson\'s Construction', url: 'https://en.wikipedia.org/wiki/Thompson%27s_construction'}
      ]
    },
    {
      short: '2. Parser & AST',
      title: '🌳 Parsing: Gramáticas e Árvore Sintática',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Crafting Interpreters — Parsing', url: 'https://craftinginterpreters.com/parsing-expressions.html'},
        {text: 'Pratt Parsing (Matklad)', url: 'https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html'},
        {text: 'Context-Free Grammar (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Context-free_grammar'}
      ]
    },
    {
      short: '3. Análise Semântica',
      title: '🔍 Análise Semântica: Types e Scoping',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'Crafting Interpreters — Resolving', url: 'https://craftinginterpreters.com/resolving-and-binding.html'},
        {text: 'Hindley-Milner (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system'},
        {text: 'Type Systems (Pierce)', url: 'https://www.cis.upenn.edu/~bcpierce/tapl/'}
      ]
    },
    {
      short: '4. Representação Intermediária',
      title: '📐 IR: SSA, Three-Address Code e LLVM IR',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'LLVM Language Reference', url: 'https://llvm.org/docs/LangRef.html'},
        {text: 'SSA (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Static_single-assignment_form'},
        {text: 'Crafting Interpreters — Bytecode', url: 'https://craftinginterpreters.com/chunks-of-bytecode.html'}
      ]
    },
    {
      short: '5. Otimização',
      title: '⚡ Otimizações de Compilador',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'LLVM Passes', url: 'https://llvm.org/docs/Passes.html'},
        {text: 'Compiler Explorer (Godbolt)', url: 'https://godbolt.org/'},
        {text: 'Loop Optimization (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Loop_optimization'}
      ]
    },
    {
      short: '6. CodeGen, JIT & GC',
      title: '🏭 Code Generation, JIT e Garbage Collection',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'V8 Blog — TurboFan', url: 'https://v8.dev/blog/turbofan-jit'},
        {text: 'GC Handbook (Jones et al.)', url: 'https://gchandbook.org/'},
        {text: 'Crafting Interpreters — GC', url: 'https://craftinginterpreters.com/garbage-collection.html'},
        {text: 'Compiler Explorer', url: 'https://godbolt.org/'}
      ]
    }
  ]
};

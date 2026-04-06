const STEP_1 =
`<p>A primeira fase de todo compilador/interpretador é a <strong>Análise Léxica (Lexing/Tokenization)</strong>. O lexer lê o código-fonte como uma sequência de caracteres e agrupa-os em <span class="highlight">tokens</span> — as "palavras" da linguagem.</p>
<div class="code-block">Entrada: "let x = 42 + y;"

Lexer processa caractere por caractere:

  l-e-t → Token { type: KEYWORD_LET, value: "let" }
  (espaço → ignorar)
  x     → Token { type: IDENTIFIER, value: "x" }
  =     → Token { type: EQUALS, value: "=" }
  4-2   → Token { type: NUMBER, value: "42" }
  +     → Token { type: PLUS, value: "+" }
  y     → Token { type: IDENTIFIER, value: "y" }
  ;     → Token { type: SEMICOLON, value: ";" }
  (EOF) → Token { type: EOF }

Saída: stream de tokens
  [LET, IDENT("x"), EQUALS, NUM(42), PLUS, IDENT("y"), SEMI, EOF]</div>
<p>O lexer é tipicamente implementado como um <strong>autômato finito (DFA/NFA)</strong> — cada estado representa o progresso na identificação de um token:</p>
<div class="code-block">DFA para reconhecer números e identificadores:

        dígito           dígito
  ┌─────┐  ────→  ┌─────────────┐
  │ S0  │         │ S1 (NUMBER) │◄─┐
  │start│         └─────────────┘  │ dígito
  └──┬──┘                └─────────┘
     │
     │ letra/underscore
     ▼
  ┌─────────────────┐
  │ S2 (IDENTIFIER) │◄─┐
  └─────────────────┘  │ letra/dígito/underscore
           └───────────┘

  Após reconhecer um IDENTIFIER, verifica se é keyword:
  "let" → KEYWORD_LET
  "if"  → KEYWORD_IF
  "x"   → IDENTIFIER (não é keyword → é variável)</div>
<ul><li><strong>Regex → NFA → DFA:</strong> Ferramentas como Flex/Lex aceitam expressões regulares para cada tipo de token, convertem para NFA (Thompson's construction), depois para DFA (subset construction), e geram o código do lexer automaticamente.</li><li><strong>Maximal Munch:</strong> O lexer sempre consome o token mais longo possível. "iffy" é um IDENTIFIER, não "if" + "fy". "==" é EQUALS_EQUALS, não dois "=".</li><li><strong>Lookahead:</strong> Às vezes o lexer precisa espiar o próximo caractere para decidir. "." pode ser DOT ou início de ".5" (número). "<" pode ser LESS_THAN ou início de "<<" ou "<=".</li><li><strong>Erros léxicos:</strong> Caracteres inválidos (ex: @ em C), strings não fechadas, números malformados. O lexer ideal reporta o erro com localização precisa (linha:coluna) e tenta recuperar para continuar análise.</li><li><strong>Hand-written vs Generated:</strong> Linguagens de produção (GCC, V8, rustc) preferem lexers escritos à mão para melhor controle de erros, performance e simplicidade. Ferramentas geradoras (Flex, ANTLR) são úteis para prototipação.</li></ul>`;

const STEP_2 =
`<p>O <strong>Parser</strong> recebe a stream de tokens do lexer e constrói uma <span class="highlight">AST (Abstract Syntax Tree)</span> — a representação estruturada e hierárquica do programa, seguindo as regras da <strong>gramática</strong> da linguagem.</p>
<div class="code-block">Gramática (Context-Free Grammar) simplificada:

  program    → statement* EOF
  statement  → letDecl | exprStmt | ifStmt | ...
  letDecl    → "let" IDENTIFIER "=" expression ";"
  exprStmt   → expression ";"
  ifStmt     → "if" "(" expression ")" block ("else" block)?
  expression → term (("+" | "-") term)*
  term       → factor (("*" | "/") factor)*
  factor     → NUMBER | IDENTIFIER | "(" expression ")"

  Precedência embutida na gramática:
  expression → term → factor
  multiplicação bind mais forte que adição
  porque está mais fundo na hierarquia</div>
<p>Parsing de <code>let x = 2 + 3 * 4;</code>:</p>
<div class="code-block">AST resultante:

  LetDeclaration
  ├── name: "x"
  └── initializer:
      BinaryExpr (+)
      ├── left: NumberLiteral(2)
      └── right:
          BinaryExpr (*)
          ├── left: NumberLiteral(3)
          └── right: NumberLiteral(4)

  → * tem precedência maior que +
  → AST reflete isso: * está mais profundo
  → Avaliar bottom-up: 3*4=12, 2+12=14

  Nota: AST é ABSTRATA — não inclui parênteses, ponto-e-vírgula
  e outros tokens sintáticos (diferente da Parse Tree concreta)</div>
<p>Algoritmos de parsing:</p>
<div class="code-block">Top-Down (LL Parsing):
  → Começa do símbolo inicial, expande regras
  → Recursive Descent: 1 função por regra da gramática
  → LL(k): Left-to-right, Leftmost derivation, k tokens lookahead
  → LL(1): 1 token de lookahead = mais simples e popular
  → Usado por: GCC (C/C++), V8 (JavaScript), rustc

  fn parseExpression() {
    let left = parseTerm();
    while (match(PLUS) || match(MINUS)) {
      let op = previous();
      let right = parseTerm();
      left = BinaryExpr(left, op, right);
    }
    return left;
  }

Bottom-Up (LR Parsing):
  → Começa dos tokens, reduz para o símbolo inicial
  → Mais poderoso: aceita mais gramáticas que LL
  → Tabelas shift-reduce geradas automaticamente
  → Usado por: yacc/bison, Ruby (LALR)

Pratt Parsing (Precedence Climbing):
  → Recursive descent + tabela de precedência por operador
  → Elegante para expressões com muitos níveis de precedência
  → Usado por: Clang, Lua, Pratt's original TDOP</div>
<ul><li><strong>Error Recovery:</strong> Um bom parser não para no primeiro erro. Estratégias: <em>synchronize</em> (avança até um ponto de sincronização como ";"), <em>error productions</em> (regras que capturam erros comuns), e <em>panic mode</em> (descarta tokens até encontrar um ponto seguro).</li><li><strong>Ambiguidade:</strong> Uma gramática é ambígua se uma mesma entrada pode gerar duas parse trees diferentes. Ex: "dangling else" — <code>if a if b then c else d</code>. Resolvido com regras de desambiguação (else associa ao if mais próximo).</li><li><strong>AST vs CST:</strong> CST (Concrete Syntax Tree) inclui todos os tokens (vírgulas, parênteses). AST é simplificada — só a informação semântica. Ferramentas como tree-sitter geram CST para uso em editores (syntax highlighting, code folding).</li></ul>`;

const STEP_3 =
`<p>A AST é sintaticamente válida, mas pode conter erros <em>semânticos</em> — operações que não fazem sentido no contexto da linguagem. A <strong>Análise Semântica</strong> percorre a AST validando tipos, escopo de variáveis, e constraints da linguagem.</p>
<div class="code-block">Erros semânticos (sintaxe OK, semântica ERRADA):

  let x: string = "hello";
  let y: number = x + 5;      // ✗ Tipo: string + number

  let z = w + 1;               // ✗ Escopo: w não declarada

  function foo(): number {
    return "hello";            // ✗ Retorno: string ≠ number
  }

  break;                       // ✗ Contexto: break fora de loop

  const PI = 3.14;
  PI = 42;                     // ✗ Mutabilidade: const</div>
<p>A <span class="highlight">Symbol Table</span> é a estrutura central — mapeia nomes para suas declarações, tipos e escopo:</p>
<div class="code-block">Symbol Table (com escopo aninhado):

  fn main() {                    Scope 0 (global)
    let x: i32 = 10;            ┌───────────────────┐
    {                            │ main: fn() → void │
      let y: f64 = 3.14;       │ x: i32            │
      let x: str = "shadow";   │                   │
      print(x);  // "shadow"   │ Scope 1 (bloco)   │
    }                           │ ┌───────────────┐ │
    print(x);    // 10          │ │ y: f64        │ │
  }                             │ │ x: str (shadow)│ │
                                │ └───────────────┘ │
  Resolução de nome:            └───────────────────┘
  → Busca do escopo mais interno para o mais externo
  → "x" no Scope 1 → encontra str (shadow)
  → "x" no Scope 0 → encontra i32

  Implementação: stack de hash maps
  enter_scope() → push novo mapa
  exit_scope()  → pop (variáveis do escopo morrem)
  lookup(name)  → busca do topo para a base</div>
<p><strong>Type Checking</strong> — verificação de tipos:</p>
<div class="code-block">Type Checking Rules (simplificado):

  ┌──────────────────────────────────────────┐
  │ Γ ⊢ e₁ : number   Γ ⊢ e₂ : number      │
  │ ─────────────────────────────────────    │
  │ Γ ⊢ e₁ + e₂ : number                    │ T-Add
  └──────────────────────────────────────────┘

  → Se e₁ é number E e₂ é number,
    ENTÃO e₁ + e₂ é number

  ┌──────────────────────────────────────────┐
  │ Γ ⊢ cond : bool   Γ ⊢ then : T          │
  │ Γ ⊢ else : T                             │
  │ ─────────────────────────────────────    │
  │ Γ ⊢ if cond then else : T                │ T-If
  └──────────────────────────────────────────┘

  → Condição deve ser bool
  → Branches then/else devem ter mesmo tipo T</div>
<ul><li><strong>Type Inference:</strong> Em vez de exigir anotações, o compilador infere tipos das expressões. <code>let x = 42;</code> → x é i32. Algoritmo W (Hindley-Milner) — usado em ML, Haskell, Rust. Unificação de constraints: se <code>f(x)</code> e f espera <code>int</code>, então x deve ser <code>int</code>.</li><li><strong>Generics / Polimorfismo:</strong> <code>fn max&lt;T: Ord&gt;(a: T, b: T) → T</code>. Na análise semântica, verifica que T implementa o trait <code>Ord</code>. Rust/C++ monomorphiza (gera código especializado para cada T). Java usa type erasure (genéricos existem apenas no compile time).</li><li><strong>Borrow Checker (Rust):</strong> Análise semântica única do Rust — verifica que referências são válidas (não dangling), não há aliasing mutável (no data races), e lifetimes são consistentes. Tudo em compile time, zero overhead em runtime.</li><li><strong>Control Flow Analysis:</strong> Verifica que todas as branches retornam valor, que variáveis são inicializadas antes do uso, que código após return/break é unreachable. Transforma AST em CFG (Control Flow Graph) para análise precisa.</li></ul>`;

const STEP_4 =
`<p>Após a análise semântica, o compilador traduz a AST para uma <strong>Representação Intermediária (IR)</strong> — uma linguagem de nível mais baixo que a fonte, mas mais alto que assembly. A IR permite otimizações independentes da linguagem-fonte e da arquitetura-alvo.</p>
<div class="code-block">AST → IR (Three-Address Code):

  Fonte: let result = (a + b) * (c - 2);

  AST:
    LetDecl
    └── BinaryExpr (*)
        ├── BinaryExpr (+)
        │   ├── a
        │   └── b
        └── BinaryExpr (-)
            ├── c
            └── 2

  Three-Address Code:
    t1 = a + b
    t2 = c - 2
    t3 = t1 * t2
    result = t3

  → Cada instrução tem no máximo 3 operandos
  → Temporários explícitos (t1, t2, t3)
  → Formato flat, fácil de otimizar</div>
<p>A forma <span class="highlight">SSA (Static Single Assignment)</span> é a base de compiladores modernos — cada variável é definida exatamente UMA vez:</p>
<div class="code-block">SSA — Static Single Assignment:

  Código normal:              Forma SSA:
  x = 1                       x₁ = 1
  y = x + 2                   y₁ = x₁ + 2
  x = y * 3                   x₂ = y₁ * 3      ← novo "x"
  z = x + y                   z₁ = x₂ + y₁     ← usa x₂, não x₁

  Com controle de fluxo (phi functions):

  if (cond)                    if (cond)
    x = 1     ← bloco A         x₁ = 1
  else                         else
    x = 2     ← bloco B         x₂ = 2
  print(x)    ← qual x?       x₃ = φ(x₁, x₂)  ← "merge"
                                print(x₃)

  φ-function: seleciona o valor baseado em qual branch executou
  → Facilita otimizações: cada definição tem uso claro
  → GCC, LLVM, V8 Turbofan usam SSA internamente</div>
<div class="code-block">LLVM IR (exemplo real):

  define i32 @add(i32 %a, i32 %b) {
  entry:
    %sum = add i32 %a, %b
    ret i32 %sum
  }

  define i32 @main() {
  entry:
    %result = call i32 @add(i32 3, i32 4)
    ret i32 %result
  }

  Características:
  → Tipado: i32, i64, float, ptr, struct...
  → SSA form nativa
  → Infinitos registradores virtuais (%0, %1, ...)
  → 3 formatos: textual (.ll), bitcode (.bc), in-memory
  → Frontends: Clang (C/C++), rustc, Swift, Zig → LLVM IR
  → Backends: x86, ARM, RISC-V, WebAssembly, GPU</div>
<ul><li><strong>LLVM Architecture:</strong> Frontend (Clang) → LLVM IR → Otimizações → Backend (x86/ARM). Qualquer nova linguagem pode gerar LLVM IR e ganhar otimizações e múltiplos targets "de graça". Rust, Swift, Zig, Julia, Kotlin/Native fazem isso.</li><li><strong>Basic Blocks:</strong> Sequência de instruções sem branches (exceto na última instrução). A IR é organizada em basic blocks conectados por edges (Control Flow Graph). Otimizações operam sobre este CFG.</li><li><strong>Bytecode (para VMs):</strong> Linguagens interpretadas/JIT geram bytecode em vez de IR de compilador. Python (.pyc), Java (.class), CLR (.dll). Bytecode é stack-based ou register-based, interpretado por VM ou compilado JIT.</li></ul>`;

const STEP_5 =
`<p>As <strong>otimizações</strong> transformam a IR em IR equivalente mais eficiente — sem mudar o comportamento observável do programa. Compiladores modernos aplicam dezenas de passes de otimização, e a diferença entre <code>-O0</code> e <code>-O3</code> pode ser 5-10x em performance.</p>
<div class="code-block">Constant Folding & Propagation:

  Antes:                  Depois:
  x = 3 + 4              x = 7          ← folding
  y = x * 2              y = 14         ← propagation + folding
  z = y                   z = 14         ← copy propagation
  → Calculado em compile time, zero custo em runtime

Dead Code Elimination (DCE):

  Antes:                  Depois:
  x = expensive()         (removido — x nunca é usado)
  y = 42                  y = 42
  return y                return y
  print("unreachable")    (removido — após return)

Common Subexpression Elimination (CSE):

  Antes:                  Depois:
  a = b * c + d           t = b * c
  e = b * c + f           a = t + d
                           e = t + f     ← reutiliza t</div>
<div class="code-block">Loop Optimizations:

  Loop-Invariant Code Motion (LICM):
  Antes:                  Depois:
  for i in 0..n:          t = len(array)   ← movido para fora
    x = len(array)        for i in 0..n:
    a[i] = x + i            a[i] = t + i

  Loop Unrolling:
  Antes:                  Depois:
  for i in 0..4:          a[0] = b[0] + 1
    a[i] = b[i] + 1       a[1] = b[1] + 1
                           a[2] = b[2] + 1
                           a[3] = b[3] + 1
  → Elimina overhead do branch (test + jump)
  → Habilita SIMD vectorization

  Strength Reduction:
  x * 2   →  x << 1      (shift é mais rápido que mul)
  x * 15  →  (x << 4) - x
  x / 8   →  x >> 3      (para unsigned)</div>
<ul><li><strong>Inlining:</strong> Substitui chamada de função pelo corpo da função. Elimina overhead de call/return, habilita otimizações cross-function (constant propagation através da chamada). GCC/LLVM: <code>inline</code>, <code>__attribute__((always_inline))</code>. Heurísticas decidem o que inlinar (funções pequenas, hot paths).</li><li><strong>Escape Analysis:</strong> Determina se um objeto "escapa" da função (é referenciado externamente). Se não escapa, pode ser alocado na stack (muito mais rápido que heap). Go e Java HotSpot fazem isso. Ex: <code>new Point(x,y)</code> que não é retornado → alocado na stack.</li><li><strong>Tail Call Optimization:</strong> Se a última operação de uma função é uma chamada recursiva, reutiliza o stack frame atual em vez de criar novo. Transforma recursão em loop. Obrigatório em Scheme/Erlang, opcional em GCC/LLVM.</li><li><strong>Profile-Guided Optimization (PGO):</strong> Compila uma vez, roda com dados reais, coleta profile (hot paths, branch frequencies), recompila com essas informações. O compilador otimiza agressivamente hot paths e pode reordenar básic blocks para melhor cache locality. Usado por Chrome, Firefox, rustc.</li><li><strong>Auto-Vectorization:</strong> Compilador detecta loops que operam em arrays e gera automaticamente instruções SIMD (AVX, NEON). Requer: loop simples, sem dependências entre iterações, tipos uniformes. <code>-O3 -march=native</code>.</li></ul>`;

const STEP_6 =
`<p>A fase final do compilador transforma a IR otimizada em <strong>código de máquina</strong> para a arquitetura-alvo. Em runtimes com JIT, esta compilação acontece <em>durante a execução</em> do programa, usando informações de runtime para otimizar ainda mais.</p>
<div class="code-block">Code Generation — IR → Assembly:

  IR:   %sum = add i32 %a, %b

  Register Allocation:
  → Mapear infinitos registradores virtuais (%a, %b, %sum)
    para registradores físicos finitos (RAX, RBX, RCX...)
  → Algoritmo: Graph Coloring (NP-completo, usa heurísticas)
  → Se não cabem: "spill" para memória (stack)

  Instruction Selection:
  → add i32 → ADD (x86), ADD (ARM), add (RISC-V)
  → Padrões complexos: multiply-add → FMA instruction
  → LLVM usa TableGen: descrição declarativa → gerador

  Instruction Scheduling:
  → Reordenar instruções para evitar pipeline stalls
  → Respeitar dependências de dados
  → Preencher delay slots e maximizar ILP</div>
<p><strong>JIT Compilation</strong> — compilação em tempo de execução:</p>
<div class="code-block">JIT Compilation (V8 / HotSpot):

  Código JavaScript / Java
         │
         ▼
  ┌─────────────────┐
  │  Interpreter    │  Execução imediata (startup rápido)
  │  (Ignition/     │  Coleta profiling data:
  │   bytecode)     │  → tipos observados de variáveis
  │                 │  → branches mais tomados
  │                 │  → funções mais chamadas (hot)
  └────────┬────────┘
           │ função ficou "hot" (>10K execuções)
           ▼
  ┌─────────────────┐
  │  JIT Compiler   │  Compila para código de máquina
  │  (TurboFan/     │  Usa profiling: "x é sempre int"
  │   C2 HotSpot)   │  → especializa para int (elimina type checks)
  │                 │  → inline de funções chamadas
  │                 │  → loop unrolling, vectorization
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Machine Code    │  Código nativo otimizado
  │ (muito rápido)  │
  └────────┬────────┘
           │ tipo muda? (x agora é string!)
           ▼
  Deoptimization: volta para interpreter + re-profile</div>
<p><strong>Garbage Collection</strong> — gerenciamento automático de memória:</p>
<div class="code-block">GC Generacional (Java G1, V8 Orinoco):

  Hipótese Geracional:
  "A maioria dos objetos morre jovem"

  ┌────────────────────────────────────┐
  │ Young Generation (pequena, ~10%)   │
  │  ┌────────┐ ┌────┐ ┌────┐         │
  │  │  Eden  │ │ S0 │ │ S1 │         │ Minor GC: frequente (~ms)
  │  │ (novo) │ │surv│ │surv│         │ Copia vivos para S0/S1
  │  └────────┘ └────┘ └────┘         │ Mortos: liberados em bulk
  └──────────────┬─────────────────────┘
                 │ sobreviveu N coletas
                 ▼
  ┌────────────────────────────────────┐
  │ Old Generation (grande, ~90%)      │
  │ ┌──────────────────────────────┐   │ Major GC: raro (~100ms)
  │ │ Objetos de vida longa        │   │ Mark-Sweep-Compact
  │ │ Caches, singletons, globals  │   │
  │ └──────────────────────────────┘   │
  └────────────────────────────────────┘</div>
<ul><li><strong>Mark-and-Sweep:</strong> Fase 1 (Mark): percorre o grafo de objetos a partir das roots (stack, globals), marca tudo alcançável. Fase 2 (Sweep): libera tudo não marcado. Stop-the-world: pausa a aplicação durante o GC. Concurrent GC (G1, ZGC): marca enquanto a aplicação roda.</li><li><strong>Reference Counting (Swift, Python, Rust Arc):</strong> Cada objeto tem um contador de referências. Quando chega a 0, é liberado imediatamente. Problema: ciclos (A→B→A, ambos com count=1). Solução: cycle detector periódico (Python) ou weak references.</li><li><strong>ZGC / Shenandoah (Java):</strong> GC de ultra-baixa latência — pausas <1ms independente do heap size (até TBs). Usa colored pointers e load barriers para marcar e realocar objetos concorrentemente.</li><li><strong>AOT vs JIT:</strong> Ahead-of-Time (Rust, C, Go, GraalVM Native Image): compila antes de rodar — startup instantâneo, sem overhead de JIT. JIT (V8, HotSpot): compila durante execução — pode otimizar baseado em runtime behavior. Trade-off: startup vs peak performance.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];

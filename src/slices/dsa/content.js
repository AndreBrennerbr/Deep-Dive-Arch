const STEP_1 =
`<p>A <strong>análise de complexidade</strong> responde a pergunta fundamental: <em>"como o tempo/espaço cresce quando a entrada cresce?"</em>. Não medimos segundos — medimos a <span class="highlight">taxa de crescimento</span> em função do tamanho da entrada <em>n</em>.</p>
<div class="code-block">Notações Assintóticas:

Big-O  O(f(n)) — Limite SUPERIOR (pior caso)
  "O tempo de execução nunca cresce mais rápido que f(n)"
  Formalmente: ∃ c, n₀ tal que T(n) ≤ c·f(n), ∀ n ≥ n₀

Big-Ω  Ω(f(n)) — Limite INFERIOR (melhor caso)
  "O tempo de execução cresce pelo menos tão rápido quanto f(n)"

Big-Θ  Θ(f(n)) — Limite JUSTO (caso médio/tight bound)
  "O tempo de execução cresce exatamente na mesma taxa que f(n)"
  Θ(n) ⟺ O(n) ∧ Ω(n)

Hierarquia de crescimento:
  O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
   │       │          │        │            │        │       │
  Hash   BST search  Scan   Merge Sort   Bubble  Subsets  Perms
  lookup  Binary Srch        Quick Sort   Sort</div>
<p>A <strong>Análise Amortizada</strong> mede o custo médio por operação ao longo de uma sequência:</p>
<div class="code-block">Exemplo: Dynamic Array (ArrayList / Vec&lt;T&gt;)

  push() geralmente é O(1), mas quando o array está cheio:
  → Aloca novo array com 2× capacidade
  → Copia todos os n elementos → O(n)

  Sequência de n pushes:
  Pushes normais:   n × O(1) = O(n)
  Copies no resize: 1 + 2 + 4 + 8 + ... + n = 2n - 1 ≈ O(n)
  Total: O(2n) / n operações = O(1) amortizado por push

  Banker's Method: cada push "deposita" 3 moedas:
  → 1 moeda paga o push
  → 2 moedas ficam para pagar a cópia futura no resize</div>
<div class="code-block">Master Theorem — para recorrências T(n) = aT(n/b) + O(nᵈ):

  Caso 1: d < log_b(a) → T(n) = O(n^(log_b a))
  Caso 2: d = log_b(a) → T(n) = O(nᵈ log n)
  Caso 3: d > log_b(a) → T(n) = O(nᵈ)

  Merge Sort:  T(n) = 2T(n/2) + O(n)
    a=2, b=2, d=1 → log₂2 = 1 = d → Caso 2 → O(n log n)

  Binary Search: T(n) = T(n/2) + O(1)
    a=1, b=2, d=0 → log₂1 = 0 = d → Caso 2 → O(log n)

  Strassen:    T(n) = 7T(n/2) + O(n²)
    a=7, b=2, d=2 → log₂7 ≈ 2.81 > 2 → Caso 1 → O(n^2.81)</div>
<ul><li><strong>Espaço vs Tempo:</strong> Toda solução tem trade-offs. Hash tables usam O(n) espaço extra para ganhar O(1) lookup. In-place sorting usa O(1) espaço mas pode ser mais lento.</li><li><strong>Worst vs Average vs Best:</strong> QuickSort é O(n²) no pior caso (pivot ruim), O(n log n) no caso médio, O(n log n) no melhor caso. Na prática, o caso médio importa mais — e quicksort com random pivot é quase sempre O(n log n).</li><li><strong>Constantes importam:</strong> Merge Sort é O(n log n) e Insertion Sort é O(n²), mas para n ≤ ~20, Insertion Sort é mais rápido (constante menor, cache-friendly). TimSort combina ambos.</li></ul>`;

const STEP_2 =
`<p>Estruturas lineares organizam dados em sequência. A escolha entre elas depende de quais operações precisam ser rápidas — acesso aleatório, inserção no início, LIFO, FIFO.</p>
<div class="code-block">Array (Contíguo na memória):

  Endereço base: 0x1000
  ┌────┬────┬────┬────┬────┬────┬────┬────┐
  │ 10 │ 20 │ 30 │ 40 │ 50 │ 60 │ 70 │ 80 │
  └────┴────┴────┴────┴────┴────┴────┴────┘
  [0]  [1]  [2]  [3]  [4]  [5]  [6]  [7]

  Acesso: O(1) — addr = base + index × sizeof(T)
  Busca:  O(n) — linear scan (O(log n) se sorted)
  Insert: O(n) — precisa shift dos elementos à direita
  Delete: O(n) — precisa shift dos elementos à esquerda

  Cache-friendly: elementos adjacentes na mesma cache line (64B)
  → Iteração ~100× mais rápida que linked list</div>
<div class="code-block">Linked List (Nós espalhados na heap):

  head → ┌──────────┐    ┌──────────┐    ┌──────────┐
         │ val: 10  │───→│ val: 20  │───→│ val: 30  │───→ null
         │ next: *  │    │ next: *  │    │ next: *  │
         └──────────┘    └──────────┘    └──────────┘
         0xA100           0xC340           0x8F20

  Acesso: O(n) — percorre do head
  Busca:  O(n) — percorre do head
  Insert: O(1) — ajusta ponteiros (se já tem referência)
  Delete: O(1) — ajusta ponteiros (se já tem referência)

  Doubly Linked List: cada nó tem prev e next
  → Permite travessia reversa, remoção sem busca
  → Usado internamente: LRU cache, memory allocators</div>
<div class="code-block">Stack (LIFO — Last In, First Out):

  push(3)  push(7)  push(1)  pop()→1  pop()→7
  ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐
  │   │    │   │    │ 1 │    │   │    │   │
  │   │    │ 7 │    │ 7 │    │ 7 │    │   │
  │ 3 │    │ 3 │    │ 3 │    │ 3 │    │ 3 │
  └───┘    └───┘    └───┘    └───┘    └───┘

  Usos: call stack, undo, parsing (parênteses),
        DFS, backtracking, avaliação de expressões

Queue (FIFO — First In, First Out):

  enqueue(A) enqueue(B) enqueue(C) dequeue()→A
  ┌─────────────────────────────────┐
  │ front → A  B  C ← rear         │
  └─────────────────────────────────┘

  Implementação: Ring Buffer (array circular)
  → front e rear são índices mod capacidade
  → O(1) para enqueue e dequeue, sem resize

  Usos: BFS, task scheduling, message queues,
        buffer de I/O, producer-consumer</div>
<ul><li><strong>Deque (Double-Ended Queue):</strong> Inserção e remoção em ambas as pontas em O(1). Implementado como ring buffer ou doubly linked list. Usado no work-stealing scheduler.</li><li><strong>Dynamic Array vs Linked List:</strong> Na prática, arrays dinâmicos vencem quase sempre. Motivo: cache locality. Linked lists fazem pointer chasing — cada acesso é um cache miss. Linus Torvalds: "linked lists are almost always wrong".</li><li><strong>Skip List:</strong> Lista ligada com "atalhos" em múltiplos níveis. Busca, inserção e remoção em O(log n) esperado. Alternativa probabilística a árvores balanceadas — usada no Redis (sorted sets) e LevelDB.</li></ul>`;

const STEP_3 =
`<p>Árvores são a estrutura mais versátil da computação. Do file system ao DOM, de bancos de dados a compiladores — árvores estão em todo lugar porque oferecem busca, inserção e remoção em O(log n) quando <strong>balanceadas</strong>.</p>
<div class="code-block">Binary Search Tree (BST):

  Invariante: left.val < node.val < right.val

              ┌────┐
              │ 42 │
           ┌──┴────┴──┐
        ┌────┐      ┌────┐
        │ 20 │      │ 65 │
      ┌─┴────┴─┐  ┌─┴────┴─┐
   ┌────┐  ┌────┐ ┌────┐ ┌────┐
   │ 10 │  │ 30 │ │ 50 │ │ 80 │
   └────┘  └────┘ └────┘ └────┘

  Busca/Insert/Delete:
    Balanceada: O(log n) — altura = log₂(n)
    Desbalanceada: O(n) — degenera em lista ligada

  In-order traversal: 10, 20, 30, 42, 50, 65, 80
  → Produz elementos ordenados!</div>
<div class="code-block">Árvores Auto-Balanceadas:

AVL Tree (Adelson-Velsky & Landis):
  → Fator de balanceamento: |height(left) - height(right)| ≤ 1
  → Rebalanceia via rotações (LL, RR, LR, RL)
  → Mais rígida → busca mais rápida, inserção mais lenta

Red-Black Tree:
  → Cada nó é vermelho ou preto
  → Regras: raiz preta, folhas (NIL) pretas,
    nó vermelho tem filhos pretos, caminho raiz→folha
    tem mesmo nº de nós pretos
  → Menos rotações → inserção/deleção mais rápida
  → Usada: TreeMap (Java), std::map (C++), CFS scheduler (Linux)

B-Tree / B+Tree:
  → Nós com múltiplas chaves (high fan-out)
  → Otimizada para disco (cada nó = 1 página)
  → B+Tree: dados só nas folhas, folhas em lista ligada
  → Usada: PostgreSQL, MySQL, filesystems (NTFS, ext4)</div>
<div class="code-block">Heap (Binary Min-Heap):

  Invariante: parent ≤ children (min-heap)
  Implementação: array (sem ponteiros!)

  Array: [2, 5, 3, 8, 7, 6, 4]

  Árvore implícita:        Índices:
         2                    0
       /   \               /     \
      5     3             1       2
     / \   / \          /   \   /   \
    8   7 6   4        3     4 5     6

  parent(i) = (i-1)/2
  left(i)   = 2i + 1
  right(i)  = 2i + 2

  insert(val): adiciona no fim, sift-up     → O(log n)
  extractMin(): remove raiz, sift-down      → O(log n)
  peek():       retorna raiz                → O(1)
  heapify(arr): build heap bottom-up        → O(n) !

  Priority Queue = Heap abstrato
  Usos: Dijkstra, Huffman, task scheduling,
        merge de k listas ordenadas, median stream</div>
<ul><li><strong>Trie (Prefix Tree):</strong> Árvore onde cada aresta é um caractere. Busca de string em O(m) onde m = comprimento da string. Usado em autocomplete, spell checkers, e roteamento IP (longest prefix match).</li><li><strong>Segment Tree:</strong> Árvore binária para range queries (soma, min, max em intervalo) em O(log n) com updates em O(log n). Usada em competitive programming e bancos de dados analíticos.</li><li><strong>Fenwick Tree (BIT):</strong> Alternativa compacta ao Segment Tree para prefix sums. Usa representação binária do índice para determinar ranges — elegante e eficiente em memória.</li></ul>`;

const STEP_4 =
`<p>Hash tables são a estrutura mais usada na prática — O(1) amortizado para busca, inserção e remoção. Grafos modelam qualquer relação entre entidades — redes sociais, mapas, dependências, web links.</p>
<div class="code-block">Hash Table:

  hash(key) → index no array de buckets

  Exemplo: hash("alice") = 3, hash("bob") = 7, hash("carol") = 3

  ┌───────┐
  │ 0: ── │ → null
  │ 1: ── │ → null
  │ 2: ── │ → null
  │ 3: ── │ → ("alice",42) → ("carol",99)  ← colisão!
  │ 4: ── │ → null
  │ 5: ── │ → null
  │ 6: ── │ → null
  │ 7: ── │ → ("bob",17)
  └───────┘

  Chaining: lista ligada por bucket (acima)
  Open Addressing: probing — busca próximo slot livre
    → Linear probing:  h(k) + 1, h(k) + 2, ...
    → Quadratic probing: h(k) + 1², h(k) + 2², ...
    → Double hashing: h(k) + i·h₂(k)
    → Robin Hood: rouba de quem está mais próximo de casa

  Load Factor α = n/m (elementos / buckets)
  → α > 0.75 → resize (dobra capacidade, rehash tudo)
  → Boa hash function: distribuição uniforme, avalanche</div>
<div class="code-block">Representações de Grafo:

  Grafo: G = (V, E) — vértices e arestas

  Adjacency List (memória eficiente para grafos esparsos):
  0 → [1, 2]
  1 → [0, 3]
  2 → [0, 3]
  3 → [1, 2, 4]
  4 → [3]
  Espaço: O(V + E)

  Adjacency Matrix (acesso O(1) para checar aresta):
     0  1  2  3  4
  0 [0, 1, 1, 0, 0]
  1 [1, 0, 0, 1, 0]
  2 [1, 0, 0, 1, 0]
  3 [0, 1, 1, 0, 1]
  4 [0, 0, 0, 1, 0]
  Espaço: O(V²) — inviável para grafos grandes/esparsos</div>
<div class="code-block">BFS & DFS:

  BFS (Breadth-First Search) — Queue:
  → Explora nível por nível
  → Encontra caminho mais curto (sem peso)
  → Tempo: O(V + E)

  Início em 0:   0 → 1, 2 → 3 → 4
  Queue: [0] → [1,2] → [2,3] → [3] → [4]

  DFS (Depth-First Search) — Stack/Recursão:
  → Vai o mais fundo possível antes de voltar
  → Detecta ciclos, componentes conexas, topological sort
  → Tempo: O(V + E)

  Início em 0:   0 → 1 → 3 → 2 (backtrack) → 4
  Stack: [0] → [1] → [3] → [2] → [4]</div>
<ul><li><strong>Hash Functions:</strong> MurmurHash3 (general purpose), SipHash (proteção contra hash flooding DoS — default em Rust/Python), xxHash (velocidade extrema), SHA-256 (cryptographic — não para hash tables).</li><li><strong>Bloom Filter:</strong> Estrutura probabilística — "definitivamente não está" ou "provavelmente está" no conjunto. Usa k hash functions mapeando para um bit array. False positives possíveis, false negatives impossíveis. Usado em cache, spell check, bancos de dados (LSM-Tree).</li><li><strong>Dijkstra:</strong> Shortest path em grafos com pesos ≥ 0. Usa min-heap (priority queue). Tempo: O((V+E) log V). Bellman-Ford aceita pesos negativos: O(VE). Floyd-Warshall: all-pairs shortest path em O(V³).</li><li><strong>Topological Sort:</strong> Ordenação linear de um DAG onde para toda aresta u→v, u aparece antes de v. Usado em: build systems (Makefile), scheduling, resolução de dependências (npm, pip).</li></ul>`;

const STEP_5 =
`<p>Sorting é o problema mais estudado da computação. Todo sistema depende de dados ordenados — de bancos de dados a rendering pipelines. O limite inferior teórico para comparison-based sorting é <span class="highlight">Ω(n log n)</span>.</p>
<div class="code-block">Merge Sort — Divide and Conquer, O(n log n) garantido:

  [38, 27, 43, 3, 9, 82, 10]
          ┌─────┴─────┐
    [38, 27, 43]    [3, 9, 82, 10]
     ┌───┴───┐       ┌────┴────┐
  [38]  [27,43]   [3,9]    [82,10]
          │         │          │
  [38]  [27][43]  [3][9]  [82][10]
          │         │          │
  [38]  [27,43]   [3,9]    [10,82]
     └───┬───┘       └────┬────┘
    [27, 38, 43]    [3, 9, 10, 82]
          └─────┬─────┘
    [3, 9, 10, 27, 38, 43, 82]

  Merge: dois ponteiros percorrem subarrays ordenados
  Estável: sim | Espaço: O(n) | In-place: não</div>
<div class="code-block">Quick Sort — Divide and Conquer, O(n log n) médio:

  Partição (Lomuto/Hoare):
  pivot = 43
  [38, 27, 43, 3, 9, 82, 10]
              ↑ pivot
  Após partição:
  [38, 27, 3, 9, 10] [43] [82]
        ≤ pivot            > pivot

  Recurse em cada lado.

  Pior caso: O(n²) — pivot sempre min ou max
  Solução: random pivot → O(n log n) esperado
  Estável: não | Espaço: O(log n) stack | In-place: sim
  Na prática: mais rápido que Merge Sort (melhor cache locality)</div>
<div class="code-block">Non-Comparison Sorts — quebram o limite Ω(n log n):

Counting Sort: O(n + k) onde k = range de valores
  → Conta ocorrências de cada valor
  → Ideal para inteiros em range pequeno

Radix Sort: O(d × (n + k)) onde d = nº dígitos
  → Ordena dígito a dígito (LSD ou MSD)
  → Usa counting sort como sub-rotina estável
  → Usado para ordenar strings, inteiros grandes

Binary Search: O(log n) em array ordenado
  left = 0, right = n-1
  while left ≤ right:
    mid = left + (right - left) / 2  ← evita overflow!
    if arr[mid] == target: return mid
    if arr[mid] < target:  left = mid + 1
    else:                  right = mid - 1

  Variantes: lower_bound, upper_bound,
  search on answer (binary search the answer space)</div>
<ul><li><strong>TimSort:</strong> Algoritmo hybrid (Merge Sort + Insertion Sort) usado em Python, Java, Rust, Swift. Detecta "runs" naturais (subsequências já ordenadas), faz merge inteligente. Melhor caso O(n) para dados quase ordenados. Pior caso O(n log n).</li><li><strong>Heap Sort:</strong> Usa max-heap. Build heap O(n), extract max n vezes O(log n) cada → O(n log n). In-place, não-estável. Na prática, mais lento que Quick Sort (cache unfriendly).</li><li><strong>Estabilidade:</strong> Um sort estável preserva a ordem relativa de elementos iguais. Merge Sort é estável, Quick Sort não. Importa quando ordenamos por múltiplas chaves.</li><li><strong>Intro Sort:</strong> Quick Sort que detecta quando o pior caso está acontecendo (recursão profunda demais) e muda para Heap Sort. Usado no C++ std::sort — garante O(n log n) pior caso.</li></ul>`;

const STEP_6 =
`<p>Paradigmas algorítmicos são <em>estratégias gerais</em> para resolver classes inteiras de problemas. Dominar quando usar cada paradigma é a essência da resolução de problemas em CS.</p>
<div class="code-block">Dynamic Programming (DP) — Subestrutura ótima + subproblemas sobrepostos:

Fibonacci — exemplo canônico:

  Recursão naive: O(2ⁿ)         DP Memoization: O(n)
       fib(5)                      fib(5)
      /     \                     /     \
   fib(4)  fib(3)              fib(4)  fib(3) ← cache hit!
   /   \    /   \             /   \
 fib(3) fib(2) ...          fib(3) fib(2)
                            ↓ cache hit!

  Top-Down (Memoization):      Bottom-Up (Tabulation):
  memo = {}                    dp = [0, 1]
  def fib(n):                  for i in 2..n:
    if n in memo: return         dp[i] = dp[i-1] + dp[i-2]
    memo[n] = fib(n-1)+fib(n-2) return dp[n]
    return memo[n]

Knapsack 0/1 — problema clássico de otimização:
  dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt[i]] + val[i])
  → "usar item i ou não?" para cada capacidade w
  → O(n × W) tempo e espaço (pseudo-polinomial)</div>
<div class="code-block">Greedy — Escolha local ótima leva ao global ótimo:

  Funciona quando: optimal substructure + greedy choice property

  Exemplos clássicos:
  • Interval Scheduling: ordena por fim, pega o que não conflita
  • Huffman Coding: merge as duas frequências menores
  • Kruskal/Prim: MST — sempre pega aresta mais barata
  • Dijkstra: sempre expande vértice mais próximo

  ⚠️ Greedy NÃO funciona para:
  • Knapsack 0/1 (precisa DP)
  • Longest Path em grafos gerais (NP-hard)

Divide and Conquer:
  1. Divide: quebra em subproblemas menores
  2. Conquer: resolve recursivamente
  3. Combine: junta soluções

  Exemplos: Merge Sort, Quick Sort, Binary Search,
  Closest Pair of Points O(n log n),
  Strassen Matrix Multiply O(n^2.81),
  FFT (Fast Fourier Transform) O(n log n)</div>
<div class="code-block">Shortest Path em Grafos:

Dijkstra (pesos ≥ 0):
  dist[src] = 0, dist[*] = ∞
  PQ = {(0, src)}
  while PQ not empty:
    (d, u) = PQ.extractMin()
    for (v, w) in adj[u]:
      if d + w < dist[v]:
        dist[v] = d + w
        PQ.insert((dist[v], v))
  → O((V+E) log V) com binary heap

A* Search (heurística admissível):
  f(n) = g(n) + h(n)
  g(n) = custo real do início até n
  h(n) = estimativa do custo de n até o destino
  → Se h é admissível (nunca superestima), A* é ótimo
  → Usado em: pathfinding de jogos, GPS, robótica

Bellman-Ford (aceita pesos negativos):
  Relaxa todas as arestas V-1 vezes → O(VE)
  Detecta ciclos negativos na V-ésima iteração</div>
<ul><li><strong>Backtracking:</strong> Explora todas as possibilidades de forma sistemática, podando ramos inválidos cedo. Usado em: N-Queens, Sudoku solver, geração de permutações/combinações. Tempo exponencial, mas poda torna prático.</li><li><strong>Union-Find (Disjoint Set):</strong> Estrutura para gerenciar componentes conexas. find() e union() em O(α(n)) amortizado (quase O(1)):</li></ul>
<div class="code-block">Union-Find com Path Compression + Union by Rank:

Inicial:  {0} {1} {2} {3} {4}  (cada elemento é sua raiz)

union(0,1): rank iguais → rank[0]←1
  0          parent[1] = 0
  └─1

union(2,3): rank iguais → rank[2]←1
  2
  └─3

union(0,2): rank[0]=rank[2]=1 → rank[0]←2
  0
  ├─1
  └─2
    └─3

find(3) com Path Compression:
  3→2→0 (raiz!)  →  achata: parent[3]=0, parent[2]=0
  0           Agora find(3) é O(1) na próxima chamada!
  ├─1
  ├─2
  └─3

α(n) = inversa de Ackermann ≈ ≤4 para n ≤ 10⁸⁰
→ Na prática, O(1) por operação</div>
<ul><li>Aplicações: Kruskal (MST), detecção de ciclos em grafos, percolation, connected components, equivalence classes em compiladores.</li><li><strong>NP-Completeness:</strong> Classe de problemas onde verificar uma solução é O(polinomial) mas encontrar é (provavelmente) O(exponencial). Se P ≠ NP, não existe algoritmo polinomial. Exemplos: SAT, TSP, Graph Coloring. Ao encontrar um NP-completo, use aproximações ou heurísticas.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];

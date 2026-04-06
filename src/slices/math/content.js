const STEP_1 =
`<p>A <strong>lógica matemática</strong> é o alicerce de toda a ciência da computação — de circuitos digitais (portas AND/OR/NOT) a verificação formal de software, type systems e bancos de dados (SQL = cálculo relacional). Sem lógica, não há provas de corretude.</p>
<div class="code-block">Lógica Proposicional:

Conectivos: ¬ (NOT), ∧ (AND), ∨ (OR), → (implica), ↔ (sse)

Tabela Verdade para p → q:
  p    q    p → q
  V    V      V
  V    F      F     ← única combinação que torna falso
  F    V      V     ← "de falso segue qualquer coisa"
  F    F      V

Equivalências fundamentais:
  ¬(p ∧ q) ≡ ¬p ∨ ¬q        (De Morgan)
  ¬(p ∨ q) ≡ ¬p ∧ ¬q        (De Morgan)
  p → q    ≡ ¬p ∨ q          (Eliminação da implicação)
  p → q    ≡ ¬q → ¬p        (Contrapositiva)

Forma Normal Conjuntiva (CNF): (x₁ ∨ ¬x₂) ∧ (x₃ ∨ x₄)
  → Base para SAT solvers (verificação formal, scheduling)
  → SAT é o primeiro problema provado NP-completo (Cook 1971)</div>
<div class="code-block">Lógica de Predicados (Primeira Ordem):

  Quantificadores:
  ∀x P(x)  — "para todo x, P(x) é verdade"
  ∃x P(x)  — "existe pelo menos um x tal que P(x)"

  Negações:
  ¬(∀x P(x)) ≡ ∃x ¬P(x)
  ¬(∃x P(x)) ≡ ∀x ¬P(x)

  Exemplo em SQL (cálculo relacional):
  SELECT * FROM users WHERE age > 18
  ≡ { u ∈ Users | age(u) > 18 }
  ≡ "o conjunto de todos os u em Users tal que age(u) > 18"

  ∀x ∈ ℕ, ∃y ∈ ℕ tal que y > x
  "para todo natural, existe um maior" → verdadeiro</div>
<div class="code-block">Técnicas de Prova:

1. Prova Direta:
   "Se n é par, então n² é par"
   n par → n = 2k → n² = 4k² = 2(2k²) → n² é par ✓

2. Prova por Contradição:
   "√2 é irracional"
   Suponha √2 = p/q (fração irredutível).
   → 2 = p²/q² → p² = 2q² → p é par → p = 2k
   → 4k² = 2q² → q² = 2k² → q é par
   → Contradição: p e q ambos pares ≠ irredutível ✓

3. Indução Matemática:
   Base: P(0) é verdade
   Passo: P(k) verdade → P(k+1) verdade
   Conclusão: P(n) para todo n ∈ ℕ

   Exemplo: Σ(i=1..n) i = n(n+1)/2
   Base: n=1 → 1 = 1×2/2 ✓
   Passo: assume Σ(1..k) = k(k+1)/2
     Σ(1..k+1) = k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓

4. Princípio da Casa dos Pombos (Pigeonhole):
   n+1 pombos em n casas → pelo menos uma casa tem ≥ 2
   → "Entre 367 pessoas, 2 fazem aniversário no mesmo dia"</div>
<ul><li><strong>Relação com CS:</strong> Type systems são sistemas lógicos (Curry-Howard: provas = programas, tipos = proposições). SAT solvers verificam hardware, software e provam teoremas. Model checking verifica propriedades de sistemas concorrentes.</li><li><strong>Boolean Algebra:</strong> Alicerce dos circuitos digitais. Portas AND, OR, NOT, XOR, NAND (universal), NOR (universal). Toda função booleana pode ser expressa em CNF ou DNF.</li><li><strong>Indução Forte (Completa):</strong> Variante onde o passo assume P(0), P(1), ..., P(k) TODOS verdadeiros para provar P(k+1). Formalmente: [∀k, (∀j≤k, P(j)) → P(k+1)] → ∀n P(n). Equivalente em poder à indução simples, mas mais natural quando P(k+1) depende de múltiplos predecessores. Exemplo clássico: "Todo inteiro ≥ 2 tem fatoração prima" — para fatorar n, se n é primo, pronto; se n = a×b com a,b &lt; n, usamos a hipótese para AMBOS a e b (indução simples só daria P(n-1)). Indução estrutural (em árvores, listas) é a generalização para tipos indutivos.</li></ul>`;

const STEP_2 =
`<p>A <strong>teoria dos conjuntos</strong> é a linguagem universal da matemática. Em CS, conjuntos aparecem em todo lugar: types são conjuntos de valores, bancos de dados são conjuntos de tuplas, linguagens formais são conjuntos de strings.</p>
<div class="code-block">Operações com Conjuntos:

  A = {1, 2, 3, 4}    B = {3, 4, 5, 6}

  União:       A ∪ B = {1, 2, 3, 4, 5, 6}
  Interseção:  A ∩ B = {3, 4}
  Diferença:   A \ B = {1, 2}
  Simétrica:   A △ B = {1, 2, 5, 6}
  Complemento: Aᶜ = U \ A

  Cardinalidade: |A| = 4
  Power Set: P(A) = {∅,{1},{2},{3},{4},{1,2},...} → |P(A)| = 2⁴ = 16

  Princípio da Inclusão-Exclusão:
  |A ∪ B| = |A| + |B| - |A ∩ B|
  |A ∪ B ∪ C| = |A|+|B|+|C| - |A∩B|-|A∩C|-|B∩C| + |A∩B∩C|

  Em CS: Set, HashSet, TreeSet implementam estas operações
  Em SQL: UNION, INTERSECT, EXCEPT</div>
<div class="code-block">Relações Binárias R ⊆ A × B:

Propriedades (quando A = B):
  Reflexiva:     ∀a: aRa           (= é reflexiva, < não é)
  Simétrica:     aRb → bRa         (= é simétrica, ≤ não é)
  Antisimétrica: aRb ∧ bRa → a=b   (≤ é antisimétrica)
  Transitiva:    aRb ∧ bRc → aRc   (todas acima são)

Tipos importantes:
  Equivalência: reflexiva + simétrica + transitiva
    → Particiona o conjunto em classes de equivalência
    → Ex: congruência mod n (3 ≡ 8 mod 5)
    → Ex: isomorfismo de grafos

  Ordem Parcial: reflexiva + antisimétrica + transitiva
    → Nem todos os pares são comparáveis
    → Ex: ⊆ em conjuntos, divisibilidade em ℕ
    → Diagrama de Hasse, Topological Sort

  Ordem Total: ordem parcial + ∀a,b: aRb ∨ bRa
    → ≤ nos reais, ordem lexicográfica</div>
<div class="code-block">Funções f: A → B:

  Injetora (1-para-1):  f(a₁) = f(a₂) → a₁ = a₂
    A: {1,2,3}  →  B: {a,b,c,d}
    → Cada elemento de A mapeia para elemento diferente de B

  Sobrejetora (onto):   ∀b ∈ B, ∃a ∈ A: f(a) = b
    → Todo elemento de B é "atingido"

  Bijetora: injetora + sobrejetora (correspondência 1-para-1)
    → |A| = |B|
    → Existe inversa f⁻¹
    → Prova de que dois conjuntos têm mesma cardinalidade

  Composição: (g ∘ f)(x) = g(f(x))
  → Fundamento de pipe/compose em programação funcional

  Cardinalidade infinita:
  |ℕ| = |ℤ| = |ℚ| = ℵ₀ (contável) ← existe bijeção com ℕ
  |ℝ| = c > ℵ₀ (incontável) ← Cantor's diagonal argument
  → Nem toda função ℕ→{0,1} é computável (Halting Problem)</div>
<ul><li><strong>Relações em CS:</strong> Bancos de dados relacionais são literalmente conjuntos de tuplas com relações. Foreign keys definem relações entre tabelas. SQL é baseado em álgebra relacional (operações sobre conjuntos de tuplas).</li><li><strong>Lattices:</strong> Ordem parcial onde todo par tem supremo (join ⊔) e ínfimo (meet ⊓). Usados em análise estática de programas (abstract interpretation), type systems e flow analysis.</li><li><strong>Closure:</strong> Menor conjunto contendo X que satisfaz uma propriedade. Transitive closure de um grafo = alcançabilidade. Usado em resolução de dependências e análise de programas.</li></ul>`;

const STEP_3 =
`<p>Combinatória responde "de quantas formas?". Probabilidade responde "qual a chance?". Juntas, são essenciais para análise de algoritmos (caso médio), randomized algorithms, hashing, machine learning e criptografia.</p>
<div class="code-block">Princípios de Contagem:

Regra do Produto: k₁ × k₂ × ... × kn
  → Senha de 4 dígitos (0-9): 10⁴ = 10.000
  → Placa AAA-0000: 26³ × 10⁴ = 175.760.000

Permutações (ordem importa):
  n! = n × (n-1) × ... × 1
  P(n,k) = n! / (n-k)!  ← arranjos de k em n
  → 10 pessoas em 3 cadeiras: P(10,3) = 720

Combinações (ordem NÃO importa):
  C(n,k) = n! / (k!(n-k)!) = "n choose k"
  → Escolher 3 de 10: C(10,3) = 120
  → Coeficientes binomiais: (a+b)ⁿ = Σ C(n,k) aᵏ bⁿ⁻ᵏ

Combinações com Repetição:
  → Stars and Bars: C(n+k-1, k)
  → "Distribuir 10 balas entre 3 crianças": C(12,2) = 66

Princípio da Inclusão-Exclusão:
  |A₁ ∪ A₂ ∪ ... ∪ An| = Σ|Ai| - Σ|Ai∩Aj| + ... ± |A₁∩...∩An|
  → Derangements: n! × Σ(-1)ᵏ/k! ≈ n!/e</div>
<div class="code-block">Probabilidade:

P(A) = |A| / |Ω|  (espaço amostral finito, equiprovável)

P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
P(A | B) = P(A ∩ B) / P(B)    ← probabilidade condicional
P(A ∩ B) = P(A) × P(B|A)      ← regra do produto

Teorema de Bayes:
  P(A|B) = P(B|A) × P(A) / P(B)

  Exemplo (teste médico):
  Doença prevalência: P(D) = 1%
  Teste: sensitividade P(+|D) = 99%, especificidade P(-|¬D) = 95%
  P(D|+) = P(+|D)P(D) / P(+)
         = 0.99×0.01 / (0.99×0.01 + 0.05×0.99)
         = 0.0099 / 0.0594
         ≈ 16.7%   ← Surpreendentemente baixo!

  Usado em: Naive Bayes classifier, spam filters,
  medical diagnosis, filtros probabilísticos</div>
<div class="code-block">Variáveis Aleatórias:

Valor Esperado (média): E[X] = Σ xᵢ × P(X = xᵢ)
  Linearidade: E[X + Y] = E[X] + E[Y] (SEMPRE!)

  Exemplo: nº esperado de coin flips até cara
  E[X] = 1/2 + 2×(1/4) + 3×(1/8) + ... = 2

Variância: Var(X) = E[(X - μ)²] = E[X²] - (E[X])²
Desvio Padrão: σ = √Var(X)

Distribuições:
  Bernoulli: X ∈ {0,1}, P(X=1) = p
  Binomial:  B(n,p) — nº sucessos em n trials
    E[X] = np, Var = np(1-p)
  Geométrica: nº trials até primeiro sucesso
    E[X] = 1/p
  Poisson:   λᵏe⁻λ/k! — eventos raros por intervalo

Desigualdade de Markov: P(X ≥ a) ≤ E[X]/a
Desigualdade de Chebyshev: P(|X-μ| ≥ kσ) ≤ 1/k²
Chernoff Bounds: caudas exponencialmente pequenas
  → Usados para provar concentração em algoritmos randomizados</div>
<ul><li><strong>Birthday Problem:</strong> Com 23 pessoas, P(2 com mesmo aniversário) > 50%. Com n items em espaço de tamanho m, colisão esperada após ~√(πm/2) inserções. Implicação direta: hash collisions, birthday attack em criptografia.</li><li><strong>Generating Functions:</strong> Codificam sequências como coeficientes de séries formais: G(x) = Σ aₙxⁿ. Fibonacci: G(x) = x/(1-x-x²). Permitem resolver recorrências algebricamente — T(n) do MergeSort, Catalan numbers para BSTs. OGF (ordinárias) para contagem, EGF (exponenciais) para permutações com estrutura.</li><li><strong>Randomized Algorithms:</strong> QuickSort com random pivot (Las Vegas — sempre correto, tempo esperado O(n log n)). Bloom Filter (Monte Carlo — pode errar). Miller-Rabin primality (Monte Carlo — probabilidade de erro arbitrariamente pequena).</li><li><strong>Expectation em Análise:</strong> Tempo esperado de QuickSort = 2n ln n ≈ 1.39n log₂n. Número esperado de comparações no Binary Search = log₂n - 1. Hashing com load factor α: expected probes = 1/(1-α) para linear probing.</li></ul>`;

const STEP_4 =
`<p>Enquanto o step de grafos em DSA foca em <em>implementação</em> (adjacency list, BFS, DFS), aqui tratamos a <strong>teoria matemática</strong> formal: definições rigorosas, teoremas, propriedades estruturais e problemas clássicos.</p>
<div class="code-block">Definições Formais:

  Grafo: G = (V, E) onde E ⊆ V × V
  Grafo simples: sem self-loops, sem multi-edges
  Digrafo: arestas dirigidas (u,v) ≠ (v,u)

  Grau: deg(v) = nº arestas incidentes em v
  Handshaking Lemma: Σ deg(v) = 2|E|
  → Nº de vértices com grau ímpar é sempre par

  Caminho: sequência v₁,v₂,...,vk sem vértices repetidos
  Ciclo: caminho onde v₁ = vk
  Conexo: existe caminho entre qualquer par de vértices
  Componente conexa: subgrafo conexo maximal

  Árvore: grafo conexo acíclico
  → |E| = |V| - 1  (sempre!)
  → Adicionar 1 aresta cria exatamente 1 ciclo
  → Remover 1 aresta desconecta o grafo
  → Spanning Tree: árvore que cobre todos os vértices</div>
<div class="code-block">Problemas Clássicos:

Caminho/Circuito Euleriano:
  → Visita cada ARESTA exatamente uma vez
  → Existe sse: todo vértice tem grau par (circuito)
    ou exatamente 2 vértices têm grau ímpar (caminho)
  → Solucionável em O(E) — Hierholzer's algorithm
  → Origem: Pontes de Königsberg (Euler, 1736)

Caminho/Ciclo Hamiltoniano:
  → Visita cada VÉRTICE exatamente uma vez
  → NP-completo! (sem condição simples de existência)
  → Dirac: se deg(v) ≥ n/2 para todo v, existe ciclo Ham.
  → TSP (Traveling Salesman) = min-cost Hamiltonian cycle

Coloração de Grafos:
  → χ(G) = nº cromático = mín cores para colorir vértices
    tal que vizinhos tenham cores diferentes
  → Planar → χ(G) ≤ 4 (Teorema das 4 Cores, 1976)
  → Bipartido ↔ χ(G) ≤ 2 ↔ sem ciclo ímpar
  → Aplicação: register allocation em compiladores,
    scheduling de exames, alocação de frequências</div>
<div class="code-block">Planaridade & Fluxo:

Grafo Planar: pode ser desenhado no plano sem cruzamentos
  Fórmula de Euler: V - E + F = 2 (para grafo conexo planar)
  → V=vértices, E=arestas, F=faces (incluindo face externa)
  Corolário: E ≤ 3V - 6 (para V ≥ 3)
  K₅ e K₃,₃ não são planares (Kuratowski)

Max-Flow / Min-Cut:
  → Rede: grafo dirigido com source s, sink t, capacidades c(e)
  → Max-Flow: fluxo máximo de s para t
  → Ford-Fulkerson: encontra augmenting paths, O(E × max_flow)
  → Edmonds-Karp (BFS): O(VE²)
  → Teorema Max-Flow Min-Cut: max flow = min cut
  → Aplicações: bipartite matching, image segmentation,
    network reliability, airline scheduling</div>
<ul><li><strong>Matching:</strong> Conjunto de arestas sem vértices em comum. Maximum matching em bipartite: Hungarian algorithm O(V³) ou Hopcroft-Karp O(E√V). Hall's theorem: matching perfeito existe sse |N(S)| ≥ |S| para todo S.</li><li><strong>Isomorfismo:</strong> G₁ ≅ G₂ se existe bijeção entre vértices que preserva arestas. Não se sabe se é NP-completo ou P. Graph isomorphism problem é um dos poucos em "NP-intermediário".</li><li><strong>Spectral Graph Theory:</strong> Estuda grafos via autovalores da adjacency matrix / Laplacian. O 2º menor autovalor do Laplacian (Fiedler value) mede conectividade. Usado em: graph partitioning, clustering, PageRank.</li></ul>`;

const STEP_5 =
`<p>Álgebra linear é a matemática de <strong>vetores, matrizes e transformações lineares</strong>. Em CS, é fundamental para: computação gráfica (transformações 3D), machine learning (gradient descent, PCA), processamento de sinais (FFT), page rank e muito mais.</p>
<div class="code-block">Vetores & Operações:

  v = [v₁, v₂, ..., vn] ∈ ℝⁿ

  Soma: v + w = [v₁+w₁, v₂+w₂, ...]
  Escalar: αv = [αv₁, αv₂, ...]
  Dot Product: v · w = Σ vᵢwᵢ = |v||w|cos(θ)
    → = 0 sse v ⊥ w (ortogonais)
    → Mede similaridade (cosine similarity em NLP/ML)

  Norma: ||v|| = √(v · v) = √(Σ vᵢ²)
    L1: Σ|vᵢ| (Manhattan), L2: √Σvᵢ² (Euclidiana)
    L∞: max|vᵢ| (Chebyshev)

  Espaço Vetorial:
  → Conjunto fechado sob soma e multiplicação por escalar
  → Base: conjunto LI que gera o espaço
  → Dimensão: nº de vetores na base
  → ℝ³ tem base canônica: {[1,0,0], [0,1,0], [0,0,1]}</div>
<div class="code-block">Matrizes & Transformações Lineares:

  A ∈ ℝᵐˣⁿ — m linhas, n colunas

  Multiplicação: C = AB onde Cᵢⱼ = Σ Aᵢₖ Bₖⱼ
  → (m×n)(n×p) = (m×p)
  → NÃO comutativa: AB ≠ BA em geral
  → Associativa: (AB)C = A(BC)
  → Complexidade: O(n³) naive, O(n^2.37) Strassen+

  Transformações 2D:
  Rotação θ:  [cos θ  -sin θ]   Escala:  [sx  0 ]
              [sin θ   cos θ]             [0   sy]

  Translação: precisa coordenadas homogêneas
  [x']   [1  0  tx] [x]
  [y'] = [0  1  ty] [y]   ← matriz 3×3 para 2D!
  [1 ]   [0  0   1] [1]

  GPU: multiplica milhões de vértices × matrizes 4×4
  → Model × View × Projection pipeline em OpenGL/Vulkan</div>
<div class="code-block">Autovalores, SVD & Aplicações:

Autovalores & Autovetores:
  Av = λv  → "A escala v por λ sem mudar direção"
  det(A - λI) = 0  → polinômio característico

  Aplicações:
  → PageRank: autovetor dominante da matrix de links
  → Estabilidade: |λ| < 1 → sistema estável
  → PCA: autovalores = variância nas direções principais

SVD (Singular Value Decomposition):
  A = UΣVᵀ
  → U: autovetores de AAᵀ (left singular vectors)
  → Σ: valores singulares σ₁ ≥ σ₂ ≥ ... ≥ 0
  → V: autovetores de AᵀA (right singular vectors)

  Usos:
  → Compressão de imagem: manter os top-k valores singulares
  → Recomendação: Netflix Prize (matrix factorization)
  → LSA: Latent Semantic Analysis (NLP)
  → Pseudoinversa: resolve least squares (A⁺ = VΣ⁺Uᵀ)

PCA (Principal Component Analysis):
  1. Centraliza dados (subtrai média)
  2. Calcula matriz de covariância
  3. Autovalores/autovetores da covariância
  4. Projeta nos top-k autovetores
  → Redução de dimensionalidade preservando variância máxima</div>
<ul><li><strong>Sparse Matrices:</strong> Matrizes com maioria dos elementos = 0. Armazenadas como CSR/CSC (Compressed Sparse Row/Column). Multiplicação sparse é O(nnz) em vez de O(n²). Grafos reais são esparsos → adjacency matrix é sparse.</li><li><strong>Sistemas Lineares Ax = b:</strong> Eliminação de Gauss O(n³), LU decomposition, Cholesky (para matrizes positivas definidas). Iterativos: Conjugate Gradient, GMRES — usados para sistemas enormes (milhões de variáveis).</li><li><strong>Tensores:</strong> Generalização de matrizes para dimensões maiores. Vetor = tensor 1D, matriz = tensor 2D, imagem RGB = tensor 3D (H×W×3). Deep learning opera sobre tensores (PyTorch, TensorFlow).</li></ul>`;

const STEP_6 =
`<p>A <strong>teoria dos números</strong> estuda propriedades dos inteiros — divisibilidade, primalidade, aritmética modular. Enquanto o slice de Criptografia foca nos <em>protocolos</em> (TLS, handshake, certificados), aqui exploramos a <span class="highlight">matemática subjacente</span> — provas, construções e a estrutura algébrica que tornam esses protocolos possíveis.</p>
<div class="code-block">Aritmética Modular:

  a ≡ b (mod n) ⟺ n | (a - b)
  17 ≡ 5 (mod 12) → "17h = 5h no relógio"

  Propriedades (mod n):
  (a + b) mod n = ((a mod n) + (b mod n)) mod n
  (a × b) mod n = ((a mod n) × (b mod n)) mod n
  → Permite computar potências enormes sem overflow:
    a^b mod n via repeated squaring → O(log b)

  Algoritmo de Euclides — GCD:
  gcd(252, 105):
    252 = 2 × 105 + 42
    105 = 2 × 42  + 21
    42  = 2 × 21  + 0   → gcd = 21
  Complexidade: O(log(min(a,b)))

  Extended Euclides — encontra x, y tal que:
    ax + by = gcd(a,b)
  → Usado para encontrar inverso modular:
    a⁻¹ mod n existe sse gcd(a,n) = 1
    → Base do RSA: e × d ≡ 1 (mod φ(n))</div>
<div class="code-block">Números Primos:

Teorema Fundamental da Aritmética:
  Todo inteiro > 1 tem fatoração prima ÚNICA
  84 = 2² × 3 × 7

Distribuição:
  π(n) ≈ n / ln(n) (Prime Number Theorem)
  → Primos "ficam mais raros" mas nunca acabam
  → Primo de 2048 bits: ≈ 1 em cada 1400 números é primo

Crivo de Eratóstenes (gerar todos primos até N):
  1. Lista [2, 3, 4, ..., N]
  2. p=2: risca 4, 6, 8, ... (múltiplos)
  3. p=3: risca 9, 12, 15, ...
  4. Próximo não-riscado até p > √N
  → O(n log log n) tempo, O(n) espaço
  → Segmented Sieve: processa em blocos de √N (cabe em cache)

Testes de Primalidade:
  Trial Division: O(√n) — testar divisores até √n
  Miller-Rabin: O(k log²n) — probabilístico
    → k iterações → P(erro) < 4⁻ᵏ
    → Com k=40: P(erro) < 10⁻²⁴
  AKS (2002): O(log⁶n) — primeiro teste determinístico
    polinomial, mas na prática Miller-Rabin é mais rápido

Pequeno Teorema de Fermat:
  Se p primo e gcd(a,p) = 1: a^(p-1) ≡ 1 (mod p)
  → Base do teste de Fermat e Miller-Rabin

Teorema de Euler (generalização):
  a^φ(n) ≡ 1 (mod n) onde gcd(a,n) = 1
  φ(n) = Euler's totient = |{k ≤ n : gcd(k,n) = 1}|
  φ(p) = p-1, φ(pq) = (p-1)(q-1) para p,q primos
  → DIRETO no RSA: c = m^e mod n, m = c^d mod n
    onde ed ≡ 1 (mod φ(n))</div>
<div class="code-block">RSA — Construção Completa:

  Key Generation:
  1. Escolha primos grandes p, q (~1024 bits cada)
  2. n = p × q (2048 bits) ← módulo público
  3. φ(n) = (p-1)(q-1)
  4. Escolha e: gcd(e, φ(n)) = 1 (tipicamente e = 65537)
  5. Calcule d = e⁻¹ mod φ(n) (extended Euclides)

  Public key:  (n, e)
  Private key: (n, d)

  Encrypt: c = m^e mod n
  Decrypt: m = c^d mod n

  Segurança: fatorar n = p×q é computacionalmente inviável
  → Melhor algoritmo clássico: GNFS O(e^(c × (log n)^(1/3)))
  → RSA-2048: estimativa ~10⁹ anos com hardware atual
  → Quantum: Shor's algorithm fatora em O(log³n) → RSA quebrado
    → Post-quantum crypto: lattice-based (Kyber), hash-based

Grupos Finitos & Curvas Elípticas:
  ℤ/nℤ* = {a ∈ ℤn : gcd(a,n) = 1} forma grupo multiplicativo
  → |ℤ/nℤ*| = φ(n)
  Curvas Elípticas: y² = x³ + ax + b sobre campo finito
  → ECDSA: mesma segurança que RSA com chaves ~10× menores
  → Curve25519: 256 bits ≈ RSA-3072 em segurança</div>
<ul><li><strong>Chinese Remainder Theorem (CRT):</strong> Se gcd(m₁,m₂)=1, o sistema x≡a₁(mod m₁), x≡a₂(mod m₂) tem solução única mod m₁m₂. Usado para acelerar RSA: computar mod p e mod q separadamente.</li><li><strong>Discrete Logarithm:</strong> Dado g^x ≡ h (mod p), encontrar x é "fácil" na direção g→h (exponentiation) mas "difícil" na direção h→x (logaritmo discreto). Base do Diffie-Hellman e ElGamal.</li><li><strong>Lattice-Based Crypto:</strong> Baseado na dificuldade de problemas em lattices (Shortest Vector Problem). Resistente a quantum computing. NIST Post-Quantum Standard: Kyber (KEM), Dilithium (signatures).</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];

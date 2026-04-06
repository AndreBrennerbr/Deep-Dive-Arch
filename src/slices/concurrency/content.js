const STEP_1 =
`<p><strong>Concorrência</strong> e <strong>Paralelismo</strong> são conceitos distintos que frequentemente se confundem. Concorrência é sobre <em>estrutura</em> — gerenciar múltiplas tarefas que podem progredir de forma intercalada. Paralelismo é sobre <em>execução</em> — executar múltiplas tarefas simultaneamente em hardware paralelo.</p>
<div class="code-block">Concorrência vs Paralelismo:

Concorrência (1 core):
  Thread A: ████░░░░████░░░░████
  Thread B: ░░░░████░░░░████░░░░
  → Intercaladas no tempo (time-sharing)
  → Progresso em ambas, mas nunca ao mesmo tempo

Paralelismo (2+ cores):
  Core 0:   ████████████████████  Thread A
  Core 1:   ████████████████████  Thread B
  → Execução SIMULTÂNEA real
  → Requer hardware multi-core

Concorrência + Paralelismo (2 cores, 4 threads):
  Core 0:   AAAA CCCC AAAA CCCC
  Core 1:   BBBB DDDD BBBB DDDD
  → Intercalação + execução simultânea</div>
<p>A <span class="highlight">Lei de Amdahl</span> define o speedup máximo teórico da paralelização:</p>
<div class="code-block">Lei de Amdahl:

  Speedup(n) = 1 / (S + P/n)

  S = fração serial (não paralelizável)
  P = fração paralela (P = 1 - S)
  n = número de processadores

  Exemplo: programa com 5% serial (S=0.05):
  n=4:   speedup = 1/(0.05 + 0.95/4)  = 3.48x
  n=16:  speedup = 1/(0.05 + 0.95/16) = 9.52x
  n=∞:   speedup = 1/0.05             = 20x  ← MÁXIMO

  → 5% de código serial limita speedup a 20x,
    independente de quantos cores você tem!
  → Otimizar a parte serial é mais importante
    que adicionar mais cores.</div>
<p>Problemas fundamentais da concorrência:</p>
<ul><li><strong>Data Race:</strong> Dois threads acessam a mesma memória, pelo menos um escreve, sem sincronização. Comportamento indefinido em C/C++/Rust. Diferente de <em>race condition</em> (bug lógico de timing).</li><li><strong>Starvation:</strong> Um thread nunca consegue acesso ao recurso porque outros sempre passam na frente. Pode ocorrer com locks injustos ou prioridades mal configuradas.</li><li><strong>Livelock:</strong> Threads ativamente tentam resolver um conflito, mas suas ações se cancelam mutuamente. Ambos "cedem a passagem" infinitamente — nenhum progride.</li><li><strong>Priority Inversion:</strong> Thread de alta prioridade espera um lock mantido por thread de baixa prioridade, que é preemptada por thread de média prioridade. Solução: Priority Inheritance Protocol. Bug famoso: Mars Pathfinder (1997).</li><li><strong>Lei de Gustafson:</strong> Complemento de Amdahl — se o problema cresce com mais cores (mais dados para processar), o speedup é quase linear: Speedup(n) = n - S×(n-1). Justifica clusters massivos para big data.</li></ul>`;

const STEP_2 =
`<p>Quando dois threads comunicam via memória compartilhada, a ordem em que veem as escritas NÃO é trivial. CPUs modernas, compiladores e caches reordenam operações agressivamente para performance — o que torna a programação concorrente contra-intuitiva sem um <span class="highlight">Modelo de Memória</span> formal.</p>
<div class="code-block">Reordenação surpresa:

  Variáveis: x = 0, y = 0

  Thread A:            Thread B:
  x = 1;              y = 1;
  r1 = y;             r2 = x;

  Resultado possível: r1 = 0 AND r2 = 0  ???

  → SIM! A CPU pode reordenar stores e loads.
  → Store buffer: x=1 está no store buffer de A,
    ainda não visível para B.
  → Compilador pode mover r1=y antes de x=1
    se decidir que é "equivalente" single-threaded.</div>
<p>Os <strong>níveis de ordenação</strong> (do mais forte ao mais fraco):</p>
<div class="code-block">Modelos de Ordenação:

  Sequential Consistency (mais forte):
  → Todas as operações aparecem em alguma ordem total
    consistente com a ordem de cada thread.
  → Intuitivo, mas LENTO (desabilita otimizações do hardware).
  → Java volatile, C++ memory_order_seq_cst.

  Acquire/Release:
  → Acquire (load): garante que loads/stores APÓS o acquire
    não são movidos para ANTES dele.
  → Release (store): garante que loads/stores ANTES do release
    não são movidos para DEPOIS dele.
  → Pares acquire/release sincronizam: tudo escrito antes
    de um release é visível após o acquire correspondente.

  Relaxed (mais fraco):
  → Só garante atomicidade da operação.
  → NENHUMA garantia de ordenação.
  → Útil para contadores onde a ordem não importa.

  Exemplo acquire/release:
  Thread A:                    Thread B:
  data = 42;                   while(!ready.load(acquire));
  ready.store(true, release);  assert(data == 42); // GARANTIDO</div>
<ul><li><strong>Memory Barriers (Fences):</strong> Instruções que forçam a CPU a não reordenar loads/stores através da barreira. MFENCE (x86) = barreira total. LFENCE = barreira de loads. SFENCE = barreira de stores. São caras — invalidam otimizações do pipeline.</li><li><strong>x86 TSO:</strong> x86 tem Total Store Order — stores são vistas em ordem por outros cores (mas um core pode ver seu próprio store antes dos outros via store buffer). Mais forte que ARM/RISC-V, que são relaxed por default.</li><li><strong>C++ Memory Model:</strong> Formalizado no C++11. Cada operação atômica recebe uma <code>memory_order</code> (seq_cst, acquire, release, relaxed, acq_rel, consume). O compilador e hardware cooperam para garantir a semântica escolhida.</li><li><strong>Java Memory Model (JMM):</strong> Definido pela JLS §17.4. <code>volatile</code> = seq_cst. <code>synchronized</code> = acquire no lock, release no unlock. Sem isso, o JIT pode cachear variáveis em registradores e nunca reler da memória.</li><li><strong>False Sharing:</strong> Dois threads escrevem em variáveis diferentes que caem na mesma cache line (64 bytes). Cada write invalida a cache line inteira no outro core (protocolo MESI). Solução: padding para alinhar em cache lines separadas.</li></ul>`;

const STEP_3 =
`<p>Locks (mutex, semáforo) são a ferramenta mais intuitiva para sincronização, mas têm desvantagens: contention, deadlock, priority inversion, e custo de context switch. <strong>Operações atômicas</strong> e <strong>algoritmos lock-free</strong> oferecem alternativas para cenários de alta performance.</p>
<div class="code-block">CAS — Compare-And-Swap (a primitiva fundamental):

  bool CAS(addr, expected, desired) {
    atomicamente {
      if (*addr == expected) {
        *addr = desired;
        return true;   // sucesso
      }
      return false;    // outro thread modificou
    }
  }

  Implementado em hardware:
  x86:   CMPXCHG instruction (lock prefix)
  ARM:   LDXR/STXR (load-exclusive/store-exclusive)
  RISC-V: LR/SC (load-reserved/store-conditional)

  Uso típico — incremento atômico:
  do {
    old = counter.load();
    new = old + 1;
  } while (!CAS(&counter, old, new));
  // Se falhou, outro thread modificou → retry</div>
<p><strong>Estruturas de dados lock-free:</strong></p>
<div class="code-block">Lock-Free Stack (Treiber Stack):

  push(node):
    loop:
      old_head = head.load()
      node.next = old_head
      if CAS(&head, old_head, node): break

  pop():
    loop:
      old_head = head.load()
      if old_head == null: return null
      new_head = old_head.next
      if CAS(&head, old_head, new_head):
        return old_head

  → Nunca bloqueia: se CAS falha, retry
  → Pelo menos 1 thread sempre progride (lock-free)

  Problema: ABA
  → Thread A lê head = X
  → Thread B pop X, pop Y, push X (de volta!)
  → Thread A faz CAS: head ainda é X → sucesso!
  → Mas a stack mudou! X.next pode ser inválido
  → Solução: tagged pointer (version counter + pointer)</div>
<ul><li><strong>Wait-Free vs Lock-Free:</strong> Lock-free garante que <em>algum</em> thread sempre progride (mas um thread específico pode fazer retry infinito sob contention extrema). Wait-free garante que <em>todo</em> thread termina em tempo limitado — mais forte, mais difícil de implementar.</li><li><strong>Futex (Fast Userspace Mutex):</strong> Primitiva do Linux que combina atomics + kernel. No caminho feliz (sem contention), tudo acontece em userspace com atomics (sem syscall). Só quando há contention, o thread faz syscall <code>futex(FUTEX_WAIT)</code> para dormir no kernel. Base de pthread_mutex, semaphores, condition variables.</li><li><strong>RCU (Read-Copy-Update):</strong> Padrão do kernel Linux para dados lidos frequentemente e escritos raramente. Leitores nunca bloqueiam (zero overhead). Escritores criam uma cópia, modificam, e atomicamente trocam o ponteiro. Versões antigas são liberadas após um "grace period" quando nenhum leitor as referencia.</li><li><strong>Hazard Pointers:</strong> Alternativa ao RCU para gerenciar memória em estruturas lock-free. Cada thread registra ponteiros que está usando. Antes de liberar memória, verifica se algum thread tem hazard pointer para ela.</li></ul>`;

const STEP_4 =
`<p>Escrever código concorrente correto com locks primitivos é extremamente difícil. <strong>Padrões de concorrência</strong> são abstrações testadas que encapsulam a complexidade e fornecem modelos mentais seguros.</p>
<div class="code-block">Producer-Consumer (Bounded Buffer):

  Producer               Buffer (fila thread-safe)        Consumer
  ┌──────────┐          ┌───┬───┬───┬───┬───┐          ┌──────────┐
  │ Gera item│───put()─→│ A │ B │ C │   │   │──get()──→│ Processa │
  └──────────┘          └───┴───┴───┴───┴───┘          └──────────┘
                         capacity = 5

  Se buffer cheio:  producer bloqueia (espera espaço)
  Se buffer vazio:  consumer bloqueia (espera item)

  Implementação: mutex + 2 condition variables
  → cond_not_full.wait()  / cond_not_empty.signal()
  → Java: BlockingQueue, Go: buffered channel</div>
<div class="code-block">Actor Model (Erlang, Akka):

  ┌───────────────┐  mensagem  ┌───────────────┐
  │   Actor A     │───────────→│   Actor B     │
  │ ┌───────────┐ │            │ ┌───────────┐ │
  │ │  Mailbox  │ │            │ │  Mailbox  │ │
  │ │  (fila)   │ │            │ │  (fila)   │ │
  │ └───────────┘ │            │ └───────────┘ │
  │ Estado privado│            │ Estado privado│
  └───────────────┘            └───────────────┘

  → Cada actor tem estado PRIVADO (sem memória compartilhada)
  → Comunicação APENAS via mensagens assíncronas
  → Processa 1 mensagem por vez (sem concorrência interna)
  → Sem locks, sem data races por design
  → Erlang: ~2KB por process, milhões de actors por VM</div>
<div class="code-block">CSP — Communicating Sequential Processes (Go, Clojure):

  goroutine A ──ch1──→ goroutine B ──ch2──→ goroutine C

  "Don't communicate by sharing memory;
   share memory by communicating." — Go Proverb

  ch := make(chan int, 10)  // buffered channel, cap 10
  go func() { ch <- 42 }() // sender
  val := <-ch               // receiver blocks until data

  select {                  // multiplexar channels
    case v := <-ch1: ...
    case v := <-ch2: ...
    case <-timeout:  ...
  }</div>
<ul><li><strong>Reader-Writer Lock:</strong> Permite múltiplos leitores simultâneos OU um escritor exclusivo. Ideal quando leituras são muito mais frequentes que escritas. Risco: writer starvation se readers são contínuos.</li><li><strong>Work Stealing (Fork/Join):</strong> Cada worker tem sua própria deque de tarefas. Quando acaba, "rouba" do fundo da deque de outro worker. Java ForkJoinPool, Tokio (Rust), Rayon. Boa distribuição de carga com baixo overhead de sincronização.</li><li><strong>Thread Pool:</strong> Pool pré-criado de N threads que processam tarefas de uma fila compartilhada. Evita o custo de criar/destruir threads. Java ExecutorService, Python ThreadPoolExecutor. Tamanho ideal: CPU-bound = N cores, I/O-bound = N cores × (1 + wait/compute).</li><li><strong>Map-Reduce:</strong> Divide dados em chunks (Map), processa em paralelo, combina resultados (Reduce). Funciona em uma máquina (parallelStream em Java) ou em cluster (Hadoop, Spark).</li></ul>`;

const STEP_5 =
`<p>Paralelismo real requer suporte do hardware. A CPU moderna oferece múltiplos níveis de paralelismo — do nível de instrução ao nível de socket — cada um com trade-offs diferentes.</p>
<div class="code-block">Taxonomia de Flynn:

  SISD — Single Instruction, Single Data
  → CPU escalar clássica. 1 instrução por clock.

  SIMD — Single Instruction, Multiple Data
  → 1 instrução opera em MÚLTIPLOS dados simultaneamente.
  → AVX-512: 16 floats × 1 instrução = 16 resultados

  MIMD — Multiple Instruction, Multiple Data
  → Multi-core: cada core executa instrução diferente
    em dados diferentes.

  SIMD exemplo (soma de arrays):

  Escalar (1 por vez):          SIMD (8 por vez com AVX-256):
  for i in 0..N:                for i in 0..N step 8:
    C[i] = A[i] + B[i]           C[i..i+8] = A[i..i+8] + B[i..i+8]
  → N operações                 → N/8 operações = 8x speedup</div>
<p><strong>Cache Coherence</strong> — como múltiplos cores mantêm visão consistente da memória:</p>
<div class="code-block">Protocolo MESI (Modified, Exclusive, Shared, Invalid):

  Core 0 cache    Core 1 cache     Estado
  ────────────    ────────────     ──────
  [x = 42, E]    [  vazio  ]      Core 0 tem x Exclusive

  Core 1 lê x:
  [x = 42, S]    [x = 42, S]      Ambos Shared (somente leitura)

  Core 0 escreve x = 99:
  [x = 99, M]    [x = 42, I]      Core 0 Modified, Core 1 Invalidado
  │                                 Invalidação via bus/interconnect
  │
  Core 1 lê x:
  → Snoop detecta que Core 0 tem versão Modified
  → Core 0 flushes x=99 para cache/memória
  [x = 99, S]    [x = 99, S]      Ambos Shared novamente

  Custo: cada invalidação = ~50-100 ciclos de latência</div>
<ul><li><strong>NUMA (Non-Uniform Memory Access):</strong> Em servidores multi-socket, cada CPU tem sua própria RAM local. Acessar RAM local: ~80ns. Acessar RAM do outro socket: ~150ns (2x mais lento). O SO tenta alocar memória e agendar threads no mesmo NUMA node (numactl, taskset).</li><li><strong>Hyper-Threading (SMT):</strong> Cada core físico aparece como 2 cores lógicos, compartilhando unidades de execução. Quando um thread está esperando (cache miss, branch mispredict), o outro thread usa os recursos ociosos. Speedup real: ~15-30% (não 2x).</li><li><strong>GPU Paralelismo:</strong> Milhares de cores simples (CUDA cores) executando a mesma instrução em dados diferentes (SIMT). Ideal para operações regulares e massivamente paralelas: multiplicação de matrizes, treinamento de redes neurais, rendering.</li><li><strong>Vectorização Automática:</strong> Compiladores modernos (GCC -O3, LLVM) detectam loops simples e geram automaticamente instruções SIMD. Flags: <code>-march=native -mavx2</code>. Pragma: <code>#pragma omp simd</code>.</li></ul>`;

const STEP_6 =
`<p>Threads do OS são caras (~8KB de stack mínimo + ~5µs para context switch). Para I/O-bound workloads com milhares de tarefas concorrentes (web servers, crawlers), <strong>async I/O</strong> e <strong>green threads</strong> oferecem concorrência massiva com overhead mínimo.</p>
<div class="code-block">Evolução dos modelos de I/O concorrente:

  1. Thread-per-connection:
     → 1 thread por cliente, cada um bloqueia em read()
     → Simples, mas 10K threads = 80MB de stack + scheduling overhead

  2. Event Loop (single-threaded async):
     → 1 thread + epoll/kqueue monitora milhares de FDs
     → Callback quando I/O está pronto
     → Node.js, Redis, Nginx
     ┌─────────────────────────────────┐
     │         Event Loop              │
     │  while(true) {                  │
     │    events = epoll_wait(fds)     │
     │    for ev in events:            │
     │      handle(ev)  // non-blocking│
     │  }                              │
     └─────────────────────────────────┘

  3. Async/Await (coroutines cooperativas):
     → Syntax sugar sobre event loop + state machine
     → Código "parece" síncrono mas é non-blocking
     → Python asyncio, Rust async, JS async/await, C# Tasks</div>
<div class="code-block">Como async/await funciona internamente:

  async fn fetch_data(url: &str) -> Data {
    let response = http_get(url).await;  // suspende aqui
    let body = response.read_body().await; // e aqui
    parse(body)
  }

  Compilador transforma em State Machine:

  enum FetchDataFuture {
    State0 { url },           // antes do 1º await
    State1 { http_future },   // aguardando http_get
    State2 { read_future },   // aguardando read_body
    Complete(Data),           // resultado
  }

  impl Future for FetchDataFuture {
    fn poll(&mut self) -> Poll<Data> {
      match self {
        State0 → inicia http_get, vai para State1
        State1 → poll http_future
                 → Pending: retorna, loop processa outros
                 → Ready: vai para State2
        State2 → poll read_future
                 → Ready: retorna Complete(parse(body))
      }
    }
  }
  → Zero allocation por await! Estado inteiro na stack/struct.</div>
<ul><li><strong>Green Threads / Goroutines:</strong> Go usa goroutines (~2KB initial stack, cresce dinamicamente). O Go runtime agenda milhões de goroutines em poucos OS threads (M:N threading). Scheduler cooperativo + preemption assíncrona (Go 1.14+). Channels para comunicação (CSP).</li><li><strong>Tokio (Rust):</strong> Runtime async para Rust. Work-stealing scheduler multi-thread. Cada task é um Future (~50-200 bytes). <code>tokio::spawn</code> agenda task no thread pool. <code>.await</code> suspende sem bloquear a OS thread. io_uring backend para Linux.</li><li><strong>Structured Concurrency:</strong> Paradigma moderno — tasks filhas são vinculadas ao escopo do pai. Se o pai cancela/falha, filhas são canceladas automaticamente. Previne "task leaks". Kotlin coroutines, Java 21 Virtual Threads (Project Loom), Python TaskGroup (3.11+).</li><li><strong>Virtual Threads (Java 21):</strong> Green threads na JVM — cada virtual thread consome ~1KB. Código bloqueante existente (JDBC, HTTP) funciona sem mudança — a JVM intercepta bloqueio e suspende a virtual thread automaticamente. Milhões de threads concorrentes com API familiar.</li><li><strong>Cancellation & Timeouts:</strong> Fundamental em async — toda operação deve ser cancelável. Go: <code>context.WithTimeout</code>. Rust: <code>tokio::time::timeout</code>. Python: <code>asyncio.wait_for</code>. Sem cancellation, tasks órfãs vazam recursos.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];

const STEP_1 =
`<p>Um <strong>processo</strong> é a unidade fundamental de execução em um SO. Não é "um programa rodando" — é uma <em>instância</em> de um programa, com seu próprio espaço de endereçamento virtual, file descriptors, registradores salvos e estado de execução.</p>
<p>O kernel mantém toda a informação de cada processo em uma estrutura chamada <span class="highlight">PCB (Process Control Block)</span>. No Linux, essa estrutura é a <code>task_struct</code> — com mais de 700 campos e ~6 KB de tamanho:</p>
<div class="code-block">task_struct (PCB simplificado):
┌─────────────────────────────────────────┐
│ pid: 1234                               │ Identificador único
│ state: TASK_RUNNING                     │ Estado atual
│ mm: → memory_struct                     │ → Page tables, mmap areas
│ fs: → fs_struct                         │ → Root dir, cwd
│ files: → files_struct                   │ → Tabela de file descriptors
│ parent: → task_struct (pid 1100)        │ → Processo pai
│ children: [pid 1235, pid 1236]          │ → Processos filhos
│ thread_info: → registradores salvos     │ → RSP, RIP, RFLAGS...
│ cred: uid=1000, gid=1000                │ → Permissões
│ sched_entity: vruntime=42931            │ → Dados do scheduler
│ signal: → pending signals               │ → SIGTERM, SIGKILL...
└─────────────────────────────────────────┘</div>
<p>Estados de um processo no Linux:</p>
<div class="code-block">                    fork()
                      │
                      ▼
               ┌─────────────┐
               │   CREATED   │
               └──────┬──────┘
                      │ schedule()
                      ▼
  ┌──────────────────────────────────────┐
  │            TASK_RUNNING              │◄──── Rodando na CPU
  │         (Ready ou Running)           │      ou na fila de prontos
  └──────┬──────────────┬────────────────┘
  sleep()/│              │ exit()
  read() │              │
         ▼              ▼
  ┌──────────────┐ ┌────────────┐
  │ INTERRUPTIBLE│ │   ZOMBIE   │ ← exit_code salvo,
  │  (Sleeping)  │ │            │   esperando parent wait()
  └──────┬───────┘ └─────┬──────┘
  evento │               │ wait() pelo pai
  ocorre │               ▼
         │          ┌──────────┐
         └─────────→│ REMOVIDO │ ← PCB liberado
                    └──────────┘</div>
<ul><li><strong>fork():</strong> Cria um processo filho como cópia quase exata do pai. Usa Copy-on-Write — páginas de memória são compartilhadas até que um dos processos escreva. <code>fork()</code> retorna 0 no filho e o PID do filho no pai.</li><li><strong>exec():</strong> Substitui o programa do processo atual por um novo binário. <code>fork() + exec()</code> é o padrão Unix para lançar programas.</li><li><strong>wait() / waitpid():</strong> O processo pai espera o filho terminar e coleta o exit status. Se o pai não chamar wait(), o filho morto vira <strong>zombie</strong> — PCB permanece na tabela de processos até ser coletado.</li><li><strong>Processos Órfãos:</strong> Se o pai morre antes do filho, o filho é "adotado" pelo processo init (PID 1), que automaticamente faz wait() nos filhos órfãos.</li><li><strong>Processo 0 (swapper/idle):</strong> O primeiro processo criado pelo kernel durante o boot. Gera o <strong>init (PID 1)</strong>, que por sua vez gera todos os demais processos. Toda árvore de processos descende do PID 1.</li></ul>`;

const STEP_2 =
`<p>Quando existem mais processos prontos do que CPUs disponíveis, o <strong>Scheduler</strong> decide quem roda a seguir. O objetivo é balancear <em>justiça</em> (todos recebem CPU), <em>throughput</em> (maximizar trabalho útil), <em>latência</em> (minimizar tempo de resposta) e <em>prioridade</em> (processos importantes primeiro).</p>
<div class="code-block">Algoritmos de Scheduling (evolução):

1. FCFS (First Come, First Served)
   → Fila simples. Problema: convoy effect (um processo longo bloqueia todos).

2. Round-Robin (time-sharing)
   → Cada processo recebe um quantum (ex: 10ms).
   → Ao expirar, é preemptado e vai pro fim da fila.
   → Justo, mas sem prioridades.
   ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
   │ P1│ P2│ P3│ P1│ P2│ P3│ P1│ P2│...│
   └───┴───┴───┴───┴───┴───┴───┴───┴───┘

3. Priority Scheduling
   → Cada processo tem prioridade (nice: -20 a +19).
   → Risco: starvation (processos de baixa prioridade nunca rodam).

4. Multi-Level Feedback Queue (MLFQ)
   → Múltiplas filas com prioridades diferentes.
   → Processos I/O-bound sobem de prioridade.
   → Processos CPU-bound descem.</div>
<p>O Linux usa o <span class="highlight">CFS (Completely Fair Scheduler)</span> desde o kernel 2.6.23 (2007). A ideia central: dar a cada processo uma fatia "perfeitamente justa" de CPU, como se houvesse um processador ideal que rodasse todos simultaneamente:</p>
<div class="code-block">CFS — Completely Fair Scheduler:

Estruturas-chave:
• vruntime: tempo virtual acumulado de CPU do processo
  → Processos com vruntime MENOR rodaram MENOS → têm prioridade
  → nice afeta a velocidade com que vruntime cresce:
    nice -20: vruntime cresce ~0.1x   (roda muito mais)
    nice  0:  vruntime cresce  1x     (normal)
    nice +19: vruntime cresce ~88x    (roda muito menos)

• Red-Black Tree: Árvore balanceada ordenada por vruntime
  → O nó mais à ESQUERDA tem menor vruntime = próximo a rodar
  → Inserção/remoção: O(log n)
  → Busca do próximo: O(1) — ponteiro cacheado

              (50ms)
             /      \
          (30ms)   (70ms)    ← Red-Black Tree de vruntimes
          /    \       \
       (20ms) (35ms)  (90ms)
         ↑
    Próximo a
    executar!</div>
<ul><li><strong>Time Slice:</strong> O CFS calcula dinamicamente o quantum baseado no número de processos. Com 4 processos, cada um recebe ~6ms de um período de 24ms (sched_latency). Quanto mais processos, menor a fatia (mínimo: sched_min_granularity = ~0.75ms).</li><li><strong>Preemption:</strong> O CFS é preemptivo — quando um processo com vruntime menor acorda (ex: I/O completou), pode interromper o processo atual imediatamente se a diferença de vruntime excede o threshold.</li><li><strong>Cgroups:</strong> Grupos de processos com limites de CPU compartilhados. Docker/Kubernetes usam cgroups para garantir que containers não monopolizem a CPU. Cada cgroup tem seu próprio mini-scheduler dentro do CFS.</li><li><strong>SCHED_FIFO / SCHED_RR:</strong> Classes de scheduling de tempo real, com prioridades absolutas acima do CFS. Usadas por áudio profissional, controle industrial, etc. Um processo SCHED_FIFO com prioridade 99 <em>sempre</em> preempta qualquer processo normal.</li></ul>`;

const STEP_3 =
`<p>Um <strong>thread</strong> é uma linha de execução dentro de um processo. Threads do mesmo processo compartilham o espaço de endereçamento (heap, dados globais, file descriptors), mas cada um tem sua <em>própria stack</em> e registradores salvos.</p>
<div class="code-block">Processo vs Thread:

Processo (fork)                     Threads (pthread_create)
┌──────────────────┐                ┌──────────────────────────┐
│ Espaço Virtual A │                │ Espaço Virtual Único     │
│ ┌──────────────┐ │                │ ┌──────┐ ┌──────┐       │
│ │   Heap       │ │                │ │Heap  │ │ Code │ Compar-│
│ │   Code       │ │                │ │      │ │      │ tilhado│
│ │   Stack      │ │                │ └──────┘ └──────┘       │
│ └──────────────┘ │                │ ┌──────┐ ┌──────┐ ┌────┐│
│ File descriptors │                │ │Stack │ │Stack │ │Stk ││
│ Page tables      │                │ │ T0   │ │ T1   │ │ T2 ││
└──────────────────┘                │ └──────┘ └──────┘ └────┘│
                                    └──────────────────────────┘
fork() = caro (CoW, novo PCB)       pthread = barato (~8KB stack)
Comunicação via IPC (pipe, socket)  Comunicação via memória direta</div>
<p>O compartilhamento de memória entre threads cria o problema central da concorrência: <strong>race conditions</strong>. Quando dois threads modificam a mesma variável sem sincronização, o resultado é indeterminístico:</p>
<div class="code-block">Race Condition — Counter++:

  Thread A              Thread B          counter (memória)
  ─────────             ─────────         ──────────────────
  LOAD counter → R1=0                       0
                        LOAD counter → R2=0
  R1 = R1 + 1 = 1                           0
                        R2 = R2 + 1 = 1
  STORE R1 → counter                         1
                        STORE R2 → counter   1  ← Deveria ser 2!</div>
<p>Primitivas de sincronização:</p>
<ul><li><strong>Mutex (Mutual Exclusion):</strong> Lock que permite apenas 1 thread por vez na seção crítica. <code>pthread_mutex_lock()</code> / <code>pthread_mutex_unlock()</code>. Implementado com instruções atômicas como <code>CMPXCHG</code> (compare-and-swap).</li><li><strong>Semáforo:</strong> Generalização do mutex — permite até N threads simultâneos. Útil para pools de recursos (ex: limitar 5 conexões ao banco).</li><li><strong>Condition Variable:</strong> Permite que um thread espere (<code>wait</code>) até que outro sinalize (<code>signal/broadcast</code>) que uma condição mudou. Evita busy-waiting.</li><li><strong>Spinlock:</strong> Mutex que faz busy-wait (loop ativo) em vez de dormir. Eficiente quando o lock é mantido por pouquíssimo tempo (nanossegundos), pois evita o custo de context switch.</li></ul>
<p><strong>Deadlock</strong> — quatro condições necessárias (Coffman):</p>
<div class="code-block">Deadlock: Thread A espera Thread B, que espera Thread A.

  Thread A                   Thread B
  ─────────                  ─────────
  lock(mutex_1)  ✓           lock(mutex_2)  ✓
  lock(mutex_2)  ⏳ bloqueado lock(mutex_1)  ⏳ bloqueado
  → DEADLOCK! Ambos esperam para sempre.

4 condições de Coffman (TODAS necessárias):
1. Exclusão Mútua — recurso não compartilhável
2. Hold and Wait — segura um recurso enquanto espera outro
3. No Preemption — recurso só é liberado voluntariamente
4. Espera Circular — A→B→C→A

Prevenção: Quebrar qualquer uma das 4 condições.
Solução comum: Ordenar locks (sempre adquirir mutex_1 antes de mutex_2).</div>`;

const STEP_4 =
`<p>O SO gerencia a memória de cada processo através do espaço de endereçamento virtual. Cada processo vê um layout contínuo e padronizado, mesmo que a memória física esteja fragmentada:</p>
<div class="code-block">Layout do Espaço de Endereçamento (x86-64 Linux):

0xFFFFFFFFFFFFFFFF ┌─────────────────────┐
                   │   Kernel Space      │ ← Mapeado em todo processo
                   │   (metade superior) │   mas inacessível em user mode
0xFFFF800000000000 ├─────────────────────┤
                   │                     │
                   │   (não canônico)    │ ← Buraco de endereçamento
                   │                     │
0x00007FFFFFFFFFFF ├─────────────────────┤
                   │   Stack ↓           │ ← Cresce para baixo
                   │   (8 MB default)    │   Variáveis locais, frames
                   ├─────────────────────┤
                   │   mmap / libs       │ ← Bibliotecas compartilhadas
                   │   (.so, .dylib)     │   Alocações grandes
                   ├─────────────────────┤
                   │   Heap ↑            │ ← Cresce para cima
                   │   (malloc/free)     │   brk() / mmap()
                   ├─────────────────────┤
                   │   BSS (não inic.)   │ ← Variáveis globais = 0
                   │   Data (inicializ.) │ ← Variáveis globais com valor
                   │   Text (código)     │ ← Read-only + Execute
0x0000000000400000 └─────────────────────┘</div>
<ul><li><strong>Stack:</strong> Alocação automática (push/pop). Cada chamada de função cria um <strong>stack frame</strong> com variáveis locais, endereço de retorno e RBP salvo. Tamanho fixo (default 8 MB). Stack overflow = acesso abaixo do limite → SIGSEGV.</li><li><strong>Heap:</strong> Alocação dinâmica via <code>malloc()</code> / <code>free()</code>. O alocador (glibc ptmalloc, jemalloc, mimalloc) gerencia chunks de memória, agrupando pedidos pequenos em arenas para reduzir chamadas de sistema (<code>brk()</code> / <code>mmap()</code>).</li><li><strong>Fragmentação:</strong> Externa (buracos entre blocos alocados) e interna (alocação maior que o necessário por alinhamento). Alocadores modernos usam size classes e slabs para minimizar ambas.</li></ul>
<p><strong>Paginação sob demanda (Demand Paging):</strong></p>
<div class="code-block">malloc(1 GB) → NÃO aloca 1 GB de RAM!

1. malloc() pede 1 GB ao kernel (via mmap)
2. Kernel apenas cria entradas na page table
   marcadas como "não presente"
3. RAM usada: ~0 bytes

4. Programa acessa página 42:
   → MMU gera PAGE FAULT (trap)
   → Kernel aloca 1 página física (4 KB)
   → Atualiza page table: "página 42 → frame 0xABC"
   → Retorna à instrução que falhou

5. Programa acessa página 43:
   → Outro page fault, outra página alocada
   → ...

Resultado: Só as páginas realmente acessadas consomem RAM.
Isso é Lazy Allocation / Overcommit.</div>
<ul><li><strong>Swap:</strong> Quando a RAM física acaba, o SO move páginas pouco usadas para disco (swap space). Acessar uma página swapped causa um <strong>major page fault</strong> — ordens de magnitude mais lento (~5ms vs ~100ns). O algoritmo de substituição decide quem sai: LRU (Least Recently Used) aproximado via bits de acesso nas page tables.</li><li><strong>OOM Killer:</strong> Se nem o swap resolve, o Linux invoca o OOM (Out of Memory) Killer, que escolhe e mata o processo com maior "badness score" (geralmente o que consome mais memória).</li><li><strong>ASLR (Address Space Layout Randomization):</strong> Randomiza a posição de stack, heap, mmap e text a cada execução. Dificulta exploits de buffer overflow, pois o atacante não sabe onde está o código/dados.</li></ul>`;

const STEP_5 =
`<p>Um processo em <em>user mode</em> não pode acessar hardware, memória de outros processos, ou estruturas do kernel diretamente. Para qualquer operação privilegiada, deve fazer uma <span class="highlight">System Call (syscall)</span> — uma requisição formal ao kernel que causa uma troca de modo (user → kernel → user).</p>
<div class="code-block">Anatomia de uma Syscall (x86-64 Linux):

  User Space                          Kernel Space
  ────────────                        ──────────────
  write(fd, buf, n)
    │
    ▼
  glibc wrapper:
    MOV RAX, 1        ← syscall number (1 = write)
    MOV RDI, fd        ← arg1: file descriptor
    MOV RSI, buf       ← arg2: ponteiro para dados
    MOV RDX, n         ← arg3: número de bytes
    SYSCALL            ← instrução especial
    │
    │ ══════ Ring Transition (user → kernel) ══════
    │ CPU salva RSP, RIP do user em registradores
    │ Carrega RSP do kernel stack
    │ Salta para entry_SYSCALL_64
    ▼
  sys_call_table[RAX] → ksys_write()
    → vfs_write() → ext4_write() → bio → driver
    │
    │ ══════ Ring Transition (kernel → user) ══════
    ▼
  Retorno em RAX (bytes escritos ou -errno)</div>
<p>Syscalls mais comuns (Linux tem ~450):</p>
<div class="code-block">Processos:    fork, execve, exit, wait4, clone
Arquivos:     open, close, read, write, lseek, stat
Memória:      mmap, munmap, brk, mprotect
Rede:         socket, bind, listen, accept, connect, sendto, recvfrom
I/O Async:    epoll_create, epoll_ctl, epoll_wait, io_uring_enter
Sinais:       kill, sigaction, rt_sigprocmask
Info:         getpid, getuid, uname, clock_gettime</div>
<ul><li><strong>Custo:</strong> Uma syscall custa ~100-1000 ns (vs ~1ns para uma chamada de função normal). O custo vem da troca de modo (salvar/restaurar registradores, flush TLB em alguns casos, verificações de segurança). Por isso, alocadores como jemalloc agrupam muitos mallocs em poucas chamadas de mmap.</li><li><strong>vDSO:</strong> Para syscalls muito frequentes e "somente leitura" (como <code>clock_gettime</code>), o Linux mapeia código do kernel diretamente no espaço do processo via <strong>vDSO (Virtual Dynamic Shared Object)</strong>. O processo chama a função "do kernel" sem trocar de modo — ~10x mais rápido.</li></ul>
<p><strong>Modelos de I/O:</strong></p>
<div class="code-block">1. Blocking I/O (síncrono):
   read(fd, buf, n) → processo dorme até dados chegarem
   → Simples, mas 1 thread por conexão = não escala

2. Non-Blocking I/O:
   fcntl(fd, F_SETFL, O_NONBLOCK)
   read(fd) → retorna -EAGAIN se não há dados
   → Precisa ficar fazendo polling (busy-wait)

3. I/O Multiplexing (select/poll/epoll):
   epoll_wait(epfd, events, max, timeout)
   → UM thread monitora MILHARES de file descriptors
   → Kernel notifica quais FDs estão prontos
   → Base de Node.js, Nginx, Redis

4. io_uring (Linux 5.1+):
   → Filas compartilhadas entre user/kernel (zero-copy)
   → Submissão e conclusão sem syscalls intermediárias
   → ~10x menos overhead que epoll para I/O de disco</div>`;

const STEP_6 =
`<p>Um <strong>File System</strong> é a camada de abstração que organiza bytes em um disco bruto como uma hierarquia de diretórios e arquivos. Sem ele, o disco seria apenas um array gigante de blocos de 4 KB sem significado.</p>
<div class="code-block">Estrutura do ext4 no disco:

┌────────────┬──────────────┬──────────────┬───────────────────┐
│ Superblock  │ Group Desc.  │ Inode Table  │ Data Blocks       │
│ (metadados  │ (mapa de     │ (1 inode por │ (conteúdo real    │
│  do FS)     │  cada grupo) │  arquivo)    │  dos arquivos)    │
└────────────┴──────────────┴──────────────┴───────────────────┘

Superblock contém:
• Número total de inodes e blocos
• Tamanho do bloco (1K, 2K ou 4K)
• Contadores de blocos livres
• UUID do filesystem
• Último mount time, última verificação</div>
<p>O <span class="highlight">Inode</span> é a estrutura central — cada arquivo/diretório tem exatamente um inode (exceto hard links que compartilham):</p>
<div class="code-block">Inode (256 bytes no ext4):
┌────────────────────────────────────────┐
│ mode:    -rwxr-xr-x (permissões)      │
│ uid/gid: 1000/1000 (dono/grupo)       │
│ size:    48.291 bytes                  │
│ atime:   2026-04-05 10:30:00          │
│ mtime:   2026-04-04 18:22:15          │
│ ctime:   2026-04-04 18:22:15          │
│ links:   1 (hard links)               │
│ blocks:  12 × 4KB = 48KB              │
│ extents: [bloco 1000, len 8]          │ ← Ponteiros para dados
│          [bloco 5000, len 4]          │
└────────────────────────────────────────┘

❗ O NOME do arquivo NÃO está no inode!
   → Está na entrada do diretório (que é outro inode)
   → Diretório = lista de pares (nome → número de inode)

  ls -li:
  inode    perms      name
  ──────── ────────── ──────
  2359301  -rw-r--r-- data.js
  2359302  -rw-r--r-- canvas.js</div>
<ul><li><strong>Extents (ext4):</strong> Em vez de listar blocos individuais, ext4 usa "extents" — intervalos contíguos (bloco inicial + comprimento). Um arquivo de 100 MB contíguo usa 1 extent em vez de 25.600 ponteiros de bloco.</li><li><strong>Hard Links vs Soft Links:</strong> Hard link = nova entrada de diretório apontando para o mesmo inode (mesmo arquivo, dois nomes). Soft link (symlink) = inode especial que contém o caminho do alvo como dado.</li><li><strong>Permissões POSIX:</strong> 3 grupos × 3 bits = 9 bits (rwx para user, group, others) + setuid, setgid, sticky bit. Checadas pelo kernel a cada open/exec — o processo precisa ter uid/gid compatível.</li></ul>
<p><strong>Journaling</strong> — proteção contra corrupção em crash:</p>
<div class="code-block">Problema sem journal:
  1. write() atualiza data block    ✓
  2. Atualiza inode (size, mtime)   ✓
  3. Atualiza bitmap de blocos      ← CRASH AQUI!
  → Inconsistência: bloco usado mas marcado como livre

Solução — Journal (Write-Ahead Log):
  1. Escreve a operação COMPLETA no journal primeiro
  2. Executa as mudanças reais nos metadados/dados
  3. Marca a entrada do journal como concluída

  Se crash no passo 2: replay do journal = estado consistente
  Se crash no passo 1: operação incompleta, descartada

Modos de journaling (ext4):
• journal:  dados + metadados no journal (mais seguro, mais lento)
• ordered:  só metadados no journal, dados escritos antes (default)
• writeback: só metadados, dados podem ficar inconsistentes (mais rápido)</div>
<ul><li><strong>VFS (Virtual File System):</strong> Camada de abstração do Linux que permite diferentes file systems (ext4, btrfs, xfs, ntfs, proc, sysfs) coexistirem sob a mesma API (open/read/write). Aplicações não sabem qual FS estão usando.</li><li><strong>Page Cache:</strong> O kernel cacheia blocos lidos do disco em RAM. Um segundo read() do mesmo arquivo retorna do cache (~100ns vs ~20µs do SSD). O <code>sync</code> força flush do cache para disco.</li></ul>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];

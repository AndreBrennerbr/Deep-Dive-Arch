import { STEPS_CONTENT } from './content.js';

export const MOD_CONC = {
  id: 'conc',
  title: 'Concorrência & Paralelismo',
  steps: [
    {
      short: '1. Fundamentos',
      title: '⚡ Concorrência vs Paralelismo',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'Amdahl\'s Law (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Amdahl%27s_law'},
        {text: 'Concurrency is not Parallelism (Rob Pike)', url: 'https://go.dev/blog/waza-talk'},
        {text: 'Data Race vs Race Condition', url: 'https://blog.regehr.org/archives/490'}
      ]
    },
    {
      short: '2. Modelos de Memória',
      title: '🧠 Memory Models & Ordering',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'C++ Memory Order', url: 'https://en.cppreference.com/w/cpp/atomic/memory_order'},
        {text: 'Memory Barriers (Preshing)', url: 'https://preshing.com/20120710/memory-barriers-are-like-source-control-operations/'},
        {text: 'Java Memory Model (JLS)', url: 'https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html'}
      ]
    },
    {
      short: '3. Primitivas Lock-Free',
      title: '🔧 Atomics, CAS e Estruturas Lock-Free',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'CAS (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Compare-and-swap'},
        {text: 'Lock-free programming (Preshing)', url: 'https://preshing.com/20120612/an-introduction-to-lock-free-programming/'},
        {text: 'futex(2) man page', url: 'https://man7.org/linux/man-pages/man2/futex.2.html'}
      ]
    },
    {
      short: '4. Padrões de Concorrência',
      title: '🏗️ Padrões: Producer-Consumer, Actors, CSP',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'CSP Paper (Hoare 1978)', url: 'https://dl.acm.org/doi/10.1145/359576.359585'},
        {text: 'Actor Model (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Actor_model'},
        {text: 'Go Concurrency Patterns', url: 'https://go.dev/blog/pipelines'}
      ]
    },
    {
      short: '5. Paralelismo de Hardware',
      title: '🔲 SIMD, Multi-core, NUMA e Cache Coherence',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'MESI Protocol (Wikipedia)', url: 'https://en.wikipedia.org/wiki/MESI_protocol'},
        {text: 'NUMA (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Non-uniform_memory_access'},
        {text: 'Intel Intrinsics Guide', url: 'https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html'}
      ]
    },
    {
      short: '6. Async & Coroutines',
      title: '🌀 Async/Await, Green Threads e Event Loop',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'Tokio (Rust async runtime)', url: 'https://tokio.rs/tokio/tutorial'},
        {text: 'Go Scheduler Design', url: 'https://www.ardanlabs.com/blog/2018/08/scheduling-in-go-part2.html'},
        {text: 'Project Loom (Java)', url: 'https://openjdk.org/projects/loom/'},
        {text: 'Structured Concurrency (Notes on)', url: 'https://vorpus.org/blog/notes-on-structured-concurrency-or-go-statement-considered-harmful/'}
      ]
    }
  ]
};

import { STEPS_CONTENT } from './content.js';

export const MOD_DIST = {
  id: 'dist',
  title: 'Sistemas Distribuídos',
  steps: [
    {
      short: '1. Fundamentos',
      title: '🌍 Fundamentos: CAP, FLP e Falácias',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'CAP Theorem (Wikipedia)', url: 'https://en.wikipedia.org/wiki/CAP_theorem'},
        {text: 'FLP Impossibility', url: 'https://en.wikipedia.org/wiki/FLP_impossibility'},
        {text: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net/'}
      ]
    },
    {
      short: '2. Relógios & Ordenação',
      title: '🕐 Relógios Lógicos e Ordenação de Eventos',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Lamport — Time, Clocks (1978)', url: 'https://lamport.azurewebsites.net/pubs/time-clocks.pdf'},
        {text: 'Vector Clocks (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Vector_clock'},
        {text: 'CockroachDB — HLC', url: 'https://www.cockroachlabs.com/blog/living-without-atomic-clocks/'}
      ]
    },
    {
      short: '3. Consenso',
      title: '🤝 Consenso: Raft, Paxos e Leader Election',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'Raft Paper (2014)', url: 'https://raft.github.io/raft.pdf'},
        {text: 'Raft Visualization', url: 'https://raft.github.io/'},
        {text: 'Paxos Made Simple (Lamport)', url: 'https://lamport.azurewebsites.net/pubs/paxos-simple.pdf'}
      ]
    },
    {
      short: '4. Consistência & CRDTs',
      title: '📊 Modelos de Consistência e CRDTs',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'CRDTs (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type'},
        {text: 'Jepsen — Consistency Models', url: 'https://jepsen.io/consistency'},
        {text: 'DDIA — Consistency & Consensus', url: 'https://dataintensive.net/'}
      ]
    },
    {
      short: '5. Particionamento',
      title: '🧩 Particionamento, Sharding e Consistent Hashing',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'Consistent Hashing (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Consistent_hashing'},
        {text: 'DDIA — Partitioning', url: 'https://dataintensive.net/'},
        {text: 'Dynamo Paper (Amazon)', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'}
      ]
    },
    {
      short: '6. Casos Reais',
      title: '🏗️ Arquiteturas Reais: Kafka, Spanner e Dynamo',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'Kafka Documentation', url: 'https://kafka.apache.org/documentation/'},
        {text: 'Spanner Paper (Google)', url: 'https://research.google/pubs/pub39966/'},
        {text: 'Dynamo Paper (Amazon)', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'},
        {text: 'Jepsen', url: 'https://jepsen.io/'}
      ]
    }
  ]
};

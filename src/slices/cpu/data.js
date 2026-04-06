import { STEPS_CONTENT } from './content.js';

export const MOD_CPU = {
  id: 'cpu',
  title: 'Arquitetura de Computadores',
  steps: [
    {
      short: '1. Von Neumann & Ciclo',
      title: '🏗️ Modelo Von Neumann & Ciclo Fetch-Decode-Execute',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'Von Neumann Architecture (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Von_Neumann_architecture'},
        {text: 'First Draft of a Report on the EDVAC (1945)', url: 'https://en.wikipedia.org/wiki/First_Draft_of_a_Report_on_the_EDVAC'}
      ]
    },
    {
      short: '2. Registradores & ISA',
      title: '📋 Registradores & Instruction Set Architecture (ISA)',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Intel x86-64 Manual (Vol. 1)', url: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html'},
        {text: 'ARM Architecture Reference', url: 'https://developer.arm.com/documentation/ddi0487/latest'},
        {text: 'System V AMD64 ABI', url: 'https://refspecs.linuxbase.org/elf/x86_64-abi-0.99.pdf'}
      ]
    },
    {
      short: '3. Cache L1/L2/L3',
      title: '⚡ Hierarquia de Cache: L1, L2 e L3',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'What Every Programmer Should Know About Memory (Drepper)', url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf'},
        {text: 'Cache (Wikipedia)', url: 'https://en.wikipedia.org/wiki/CPU_cache'},
        {text: 'MESI Protocol', url: 'https://en.wikipedia.org/wiki/MESI_protocol'}
      ]
    },
    {
      short: '4. Pipeline & Branch Pred.',
      title: '🔄 Pipeline, Superscalar e Branch Prediction',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'Pipeline (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Instruction_pipelining'},
        {text: 'Branch Predictor', url: 'https://en.wikipedia.org/wiki/Branch_predictor'},
        {text: 'Spectre Attack (Paper)', url: 'https://spectreattack.com/spectre.pdf'},
        {text: 'Out-of-Order Execution', url: 'https://en.wikipedia.org/wiki/Out-of-order_execution'}
      ]
    },
    {
      short: '5. GPU vs CPU (SIMD)',
      title: '🎮 GPU vs CPU: Paralelismo de Dados e SIMD',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'CUDA Programming Guide', url: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/'},
        {text: 'Intel Intrinsics Guide (SIMD)', url: 'https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html'},
        {text: 'GPU Architecture (NVIDIA Whitepaper)', url: 'https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf'}
      ]
    },
    {
      short: '6. Memória Virtual',
      title: '🗺️ Memória Virtual: Páginas, TLB e Page Faults',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'Virtual Memory (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Virtual_memory'},
        {text: 'Page Table (x86-64)', url: 'https://wiki.osdev.org/Paging'},
        {text: 'TLB (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Translation_lookaside_buffer'},
        {text: 'What Every Programmer Should Know About Memory', url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf'}
      ]
    }
  ]
};

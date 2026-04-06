import { STEPS_CONTENT } from './content.js';

export const MOD_AI = {
  id: 'ai',
  title: 'Inteligência Artificial & LLMs',
  steps: [
    {
      short: '1. Álgebra Linear & Redes Neurais',
      title: '🧠 Fundamentos Matemáticos: A Rede Neural',
      content: STEPS_CONTENT[0],
      refs: [
        {text: 'Neural Networks (3Blue1Brown)', url:'https://www.youtube.com/watch?v=aircAruvnKk'},
        {text: 'Backpropagation Calculus (3Blue1Brown)', url:'https://www.youtube.com/watch?v=tIeHLnjs5U8'}
      ]
    },
    {
      short: '2. Tokenização (BPE)',
      title: '✂️ Byte-Pair Encoding: A Linguagem da Máquina',
      content: STEPS_CONTENT[1],
      refs: [
        {text: 'Tokenizers (Hugging Face)', url:'https://huggingface.co/docs/tokenizers'},
        {text: 'Let\'s build the GPT Tokenizer (Karpathy)', url:'https://www.youtube.com/watch?v=zduSFxRajkE'}
      ]
    },
    {
      short: '3. Embeddings (Vetores)',
      title: '🧮 Embeddings: Mapeando Significado em Vetores',
      content: STEPS_CONTENT[2],
      refs: [
        {text: 'Word2Vec Explained (Stanford NLP)', url:'https://jalammar.github.io/illustrated-word2vec/'},
        {text: 'Embedding Projector (TensorFlow)', url:'https://projector.tensorflow.org/'}
      ]
    },
    {
      short: '4. Positional Encoding',
      title: '📐 Positional Encoding: Ensinando Ordem ao Transformer',
      content: STEPS_CONTENT[3],
      refs: [
        {text: 'RoPE Paper (Su et al., 2021)', url:'https://arxiv.org/abs/2104.09864'},
        {text: 'Positional Encoding Visualizado', url:'https://jalammar.github.io/illustrated-transformer/'}
      ]
    },
    {
      short: '5. Arquitetura Transformer',
      title: '🤖 A Máquina Paralela: O Transformer',
      content: STEPS_CONTENT[4],
      refs: [
        {text: 'Attention Is All You Need (Paper)', url:'https://arxiv.org/abs/1706.03762'},
        {text: 'The Illustrated Transformer (Jay Alammar)', url:'https://jalammar.github.io/illustrated-transformer/'},
        {text: 'LLaMA Architecture (Meta AI)', url:'https://arxiv.org/abs/2302.13971'}
      ]
    },
    {
      short: '6. Multi-Head Attention (QKV)',
      title: '🔍 Multi-Head Attention: O Mecanismo Q, K, V',
      content: STEPS_CONTENT[5],
      refs: [
        {text: 'Visualizando Attention Heads', url:'https://github.com/jessevig/bertviz'},
        {text: 'Multi-Query Attention (Paper)', url:'https://arxiv.org/abs/1911.02150'}
      ]
    },
    {
      short: '7. Pipeline de Treinamento',
      title: '🏋️ Pipeline de Treinamento: Do Corpus ao Chat',
      content: STEPS_CONTENT[6],
      refs: [
        {text: 'InstructGPT Paper (OpenAI)', url:'https://arxiv.org/abs/2203.02155'},
        {text: 'DPO Paper (Rafailov et al.)', url:'https://arxiv.org/abs/2305.18290'},
        {text: 'Scaling Laws (Kaplan et al.)', url:'https://arxiv.org/abs/2001.08361'},
        {text: 'LoRA Paper (Hu et al.)', url:'https://arxiv.org/abs/2106.09685'},
        {text: 'vLLM / Paged Attention', url:'https://arxiv.org/abs/2309.06180'}
      ]
    },
    {
      short: '8. Inferência e Sampling',
      title: '✨ Geração: Autoregressão e Estratégias de Sampling',
      content: STEPS_CONTENT[7],
      refs: [
        {text: 'Nucleus Sampling Paper', url:'https://arxiv.org/abs/1904.09751'},
        {text: 'How to Generate Text (Hugging Face)', url:'https://huggingface.co/blog/how-to-generate'},
        {text: 'Speculative Decoding (Leviathan et al.)', url:'https://arxiv.org/abs/2211.17192'}
      ]
    }
  ]
};

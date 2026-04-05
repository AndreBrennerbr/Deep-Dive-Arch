export const MOD_AI = {
  id: 'ai',
  title: 'Inteligência Artificial & LLMs',
  steps: [
    {
      short: '1. Álgebra: Y = W·X + B',
      title: '🧠 Matemática Base: A Rede Neural',
      content: '<p>Toda a genialidade das IAs surge de operações matriciais colossais (Álgebra Linear). Não rodam "IF/ELSE" complexos.</p><p>Um neurônio usa a equação canônica <span class="highlight">Y = W * X + b</span>. Onde <code>X</code> é o array de input numérico, <code>W</code> são os <strong>Pesos (Weights)</strong> que aprendem com erros da Backpropagation, e <code>B</code> é a margem de erro. O output passa obrigatoriamente por Funções de Ativação (ReLU, SiLU) para quebrar a previsibilidade linear.</p>',
      refs: [{text: 'Neural Networks (3Blue1Brown)', url:'https://www.youtube.com/watch?v=aircAruvnKk'}]
    },
    {
      short: '2. Tokenização (Tiktoken)',
      title: '✂️ Byte-Pair Encoding (A Linguagem da Máquina)',
      content: '<p>O LLM não enxerga letras ("a", "b") ou palavras ("carro"). Na entrada, ferramentas heurísticas como <strong>Tiktoken (BPE)</strong> fragmentam textos com base na maior taxa de frequência dos caracteres unidos ao longo do tempo (Dicionário com até 128 Mil Tokens).</p><p>Se dizemos "Inconstitucionalissimamente" para o modelo, ele divide em Sub-Tokens numéricos limitados a dicionários exatos, como: <code>{ Incon=739, stitu=192, cional=342, ... }</code>. Excesso de quebra aumenta os custos e afeta o raciocínio no prompt. <i>(Português fragmenta mais tokens que Inglês)</i>.</p>',
      refs: []
    },
    {
      short: '3. Embeddings (Cosine Similarity)',
      title: '🧮 Embeddings e Espaço Vetorial',
      content: '<p>Como a IA sabe que a palavra "Cachorro" tem afinidade com "Gato", mas não com "Teclado"? O modelo projeta os tokens (agora números) em um gráfico N-dimensional bizarro (ex: matriz Float32 de 4.096 de altura por Token).</p><p>Esse vetor aponta geograficamente para significados similares. Matemáticos usam trigonometria (Similaridade dos Cossenos) entre os vetores. Se o ângulo é menor (Cosseno -> 1), as palavras são semanticamente iguais.</p>',
      refs: []
    },
    {
      short: '4. Arquitetura Transformer',
      title: '🤖 A Máquina Paralela: O Transformer',
      content: '<p>Modelos velhos tentavam "decorar" o texto numa sequência longa (A->B->C) e esqueciam o começo da frase (Vanishing Gradient). Em 2017 o Paper <i>"Attention Is All You Need"</i> quebrou esse paradigma ao lançar o processamento agnóstico.</p><p>Cada palavra da frase inteira é injetada simultâneamente nas matrizes (graças à VRAM das Placas NVidia), superando a memória e abrindo alas pros blocos de Multi-Head Attention.</p>',
      refs: [{text: 'Attention Is All You Need', url:'https://arxiv.org/abs/1706.03762'}]
    },
    {
      short: '5. Mecanismo de Attention (QKV)',
      title: '🔍 Multi-Head Attention (O Segredo Q, K, V)',
      content: '<p>Em "O banco afundou os juros", por que "banco" significa economia e não assento de praça? Através de blocos MHA, onde cada Token assume 3 papeis paralelos multiplicados matricialmente: <strong>Q (Query)</strong> - "O que procuro nesse momento?", <strong>K (Key)</strong> - "O que meu bloco oferece a outros?", <strong>V (Value)</strong> - "A extração em si".</p><div class="code-block">Attention(Q, K, V) = Math.softmax( (Q * tranpose(K)) / sqrt(dim_k) ) * V</div><p>Ter várias " cabeças" trabalhando junto significa que enquanto parte das matrizes rastreiam gramática, as outras analisam sentimentos irônicos.</p>',
      refs: []
    },
    {
      short: '6. Inferência: Softmax e Temperatura',
      title: '✨ Geração (Autoregressão e Samplers)',
      content: '<p>A gigantesca GPU passa através da rede e no fim emite 128 mil números decimais bagunçados (matrizes Logits). O modelo força a função estocástica <strong>Softmax</strong> convertendo esses números brutos numa lista onde a soma de todos os 128 mil itens resulta em % de "Qualificação a vencer".</p><p>Para gerar o texto: entratam os controles. Se a <span class="highlight">Temperature (Temperatura)</span> for 0, o robô SEMPRE obedece a probabilidade maior (robótico). Se usar Top-P (0.9), ele ignora palavras raras na cauda estatística e permite que o algoritmo use "dados sorteados" entre as palavras de 90% top massa para ser criativo (uma resposta diferente por tentativa e poética).</p>',
      refs: []
    }
  ]
};

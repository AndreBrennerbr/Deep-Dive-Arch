const STEP_1 =
`<p>Uma <strong>função hash criptográfica</strong> recebe uma entrada de qualquer tamanho e produz uma saída de tamanho fixo (o <em>digest</em>), com propriedades fundamentais para segurança:</p>
<div class="code-block">SHA-256("Hello") =
  185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969

SHA-256("Hello.") =    ← Mudou 1 caractere!
  2d8bd7d9bb5f85ba643f0110d50cb506a1fe439e769a22503193ea6046bb87f7

→ Saída completamente diferente (Avalanche Effect)
→ Impossível derivar "Hello" a partir do hash (One-Way)
→ Sempre 256 bits (32 bytes) independente do tamanho da entrada</div>
<p>Propriedades essenciais:</p>
<ul><li><strong>Resistência à Pré-imagem:</strong> Dado um hash H, é computacionalmente inviável encontrar qualquer M tal que hash(M) = H. Custo: ~2²⁵⁶ operações para SHA-256 — mais que átomos no universo observável (~2²⁶⁵).</li><li><strong>Resistência à Colisão:</strong> É inviável encontrar M₁ ≠ M₂ tal que hash(M₁) = hash(M₂). Pelo <em>Birthday Paradox</em>, o custo é ~2¹²⁸ para SHA-256 (raiz quadrada do espaço).</li><li><strong>Efeito Avalanche:</strong> Mudar 1 bit na entrada altera ~50% dos bits da saída. Não há correlação entre entradas similares.</li></ul>
<p>Como <strong>SHA-256</strong> funciona internamente:</p>
<div class="code-block">SHA-256 — Merkle-Damgård Construction:

1. Padding: Mensagem + bit "1" + zeros + comprimento (mod 512 bits)
2. Dividir em blocos de 512 bits
3. Para cada bloco:
   a. Expandir 16 palavras de 32 bits → 64 palavras (message schedule)
   b. 64 rodadas de compressão:
      → Operações bitwise: AND, XOR, NOT, rotações
      → Adição modular (mod 2³²)
      → 8 variáveis de trabalho (a-h) = estado interno
   c. Somar resultado ao hash acumulado
4. Concatenar os 8 valores finais de 32 bits = 256 bits

Cada rodada: ~15 operações sobre 32-bit words
Total: 64 rodadas × bloco → ~1000 operações por bloco</div>
<p>Aplicações no mundo real:</p>
<ul><li><strong>Armazenamento de senhas:</strong> Nunca armazene senhas em texto! Use bcrypt/scrypt/Argon2 (hashes <em>lentos</em> por design, com salt). SHA-256 puro é rápido demais (~10M hashes/s em GPU) — vulnerável a brute-force.</li><li><strong>Integridade de dados:</strong> Download de um ISO? Compare o SHA-256 do arquivo com o publicado no site oficial. Qualquer modificação (malware injetado) muda completamente o hash.</li><li><strong>Merkle Trees:</strong> Árvore binária de hashes — cada nó pai é o hash dos filhos. Usada em Git (cada commit é um hash de seu conteúdo + pais), Bitcoin (bloco contém Merkle Root de todas as transações) e sistemas de arquivos (ZFS, Btrfs).</li><li><strong>HMAC (Hash-based Message Authentication Code):</strong> HMAC-SHA256(key, message) = prova que a mensagem foi criada por quem possui a chave, sem revelar a chave. Usado em APIs (AWS Signature V4), JWT tokens e cookies seguros.</li></ul>`;

const STEP_2 =
`<p>Na criptografia simétrica, a <strong>mesma chave</strong> cifra e decifra. É extremamente rápida (AES atinge ~5 GB/s com AES-NI em hardware) e usada para cifrar dados em massa — todo o tráfego HTTPS, discos criptografados, backups.</p>
<div class="code-block">Criptografia Simétrica:

  Plaintext ──→ ┌───────────┐ ──→ Ciphertext
  "Hello"       │  AES-256  │     "x\x9f\x3a..."
                │  Encrypt  │
                │  Key: K   │
                └───────────┘

  Ciphertext ──→ ┌───────────┐ ──→ Plaintext
  "x\x9f\x3a..."│  AES-256  │     "Hello"
                │  Decrypt  │
                │  Key: K   │  ← MESMA chave!
                └───────────┘

Chave: 128, 192 ou 256 bits
Bloco: sempre 128 bits (16 bytes)</div>
<p>O <span class="highlight">AES (Advanced Encryption Standard)</span>, selecionado pelo NIST em 2001 após competição pública (algoritmo Rijndael), opera em blocos de 128 bits:</p>
<div class="code-block">AES-256 — 14 rodadas de transformação:

Entrada: bloco de 128 bits (4×4 bytes = State Matrix)

┌────┬────┬────┬────┐
│ s00│ s01│ s02│ s03│   Cada rodada aplica 4 operações:
├────┼────┼────┼────┤
│ s10│ s11│ s12│ s13│   1. SubBytes   — substituição não-linear (S-Box)
├────┼────┼────┼────┤   2. ShiftRows  — rotação de linhas
│ s20│ s21│ s22│ s23│   3. MixColumns — mistura de colunas (GF(2⁸))
├────┼────┼────┼────┤   4. AddRoundKey— XOR com subchave da rodada
│ s30│ s31│ s32│ s33│
└────┴────┴────┴────┘   14 rodadas (AES-256) com chaves expandidas
                        da chave original via Key Schedule</div>
<p><strong>Modos de operação</strong> — como cifrar mais de 128 bits:</p>
<ul><li><strong>ECB (Electronic Codebook):</strong> Cada bloco cifrado independentemente. <em>Nunca use!</em> Blocos iguais geram ciphertext iguais — vazam padrões (o famoso "penguin problem").</li><li><strong>CBC (Cipher Block Chaining):</strong> Cada bloco é XOR com o ciphertext do bloco anterior antes de cifrar. Precisa de IV (Initialization Vector) aleatório. Sequencial — não paralelizável na cifragem.</li><li><strong>CTR (Counter):</strong> Transforma AES em cifra de stream. Cifra um contador incrementado e faz XOR com o plaintext. Paralelizável e permite acesso aleatório.</li><li><strong>GCM (Galois/Counter Mode):</strong> CTR + autenticação (GHASH). Produz ciphertext + tag de autenticação (128 bits). Detecta qualquer modificação no ciphertext. <strong>Padrão moderno</strong> — AES-256-GCM é o que TLS 1.3 usa.</li></ul>
<div class="code-block">AES-256-GCM:
  Entrada: Plaintext + AAD (dados adicionais autenticados) + Nonce (96 bits)
  Saída:   Ciphertext + Tag (128 bits)

  → Confidencialidade (ninguém lê)
  → Integridade (ninguém modifica)
  → Autenticidade (veio de quem tem a chave)

  Se o Tag não bater na decifração → REJEITA (tampered!)</div>`;

const STEP_3 =
`<p>Na criptografia assimétrica, existem <strong>duas chaves matematicamente relacionadas</strong>: uma <em>pública</em> (pode ser distribuída livremente) e uma <em>privada</em> (deve ser mantida em segredo). O que uma cifra, só a outra decifra.</p>
<div class="code-block">Criptografia Assimétrica:

  Qualquer pessoa                      Só o destinatário
  ────────────────                     ──────────────────
  Plaintext ──→ ┌────────────┐ ──→ Ciphertext
                │ Encrypt    │
                │ Pub Key: 🔓│
                └────────────┘

  Ciphertext ──→ ┌────────────┐ ──→ Plaintext
                │ Decrypt    │
                │ Priv Key:🔑│  ← Só o dono tem!
                └────────────┘

Assinatura Digital (inverso):
  Assinar:   hash(msg) cifrado com Priv Key = Assinatura
  Verificar: decifrar assinatura com Pub Key, comparar com hash(msg)</div>
<p><strong>RSA</strong> (Rivest-Shamir-Adleman, 1977) — baseado na dificuldade de fatorar números grandes:</p>
<div class="code-block">RSA — Geração de Chaves (simplificado):

1. Escolher p, q primos grandes (~1024 bits cada)
2. n = p × q    (2048 bits — "modulus")
3. φ(n) = (p-1)(q-1)
4. Escolher e tal que gcd(e, φ(n)) = 1  (geralmente e = 65537)
5. Calcular d = e⁻¹ mod φ(n)   (inverso modular)

Chave Pública:  (e, n)    → publicar
Chave Privada: (d, n)    → guardar

Cifrar:   c = m^e mod n
Decifrar: m = c^d mod n

Segurança: Fatorar n (2048 bits) em p × q é computacionalmente
           inviável com tecnologia atual. Estimativa: ~2¹¹² operações.</div>
<p><strong>ECC (Elliptic Curve Cryptography)</strong> — mesma segurança com chaves muito menores:</p>
<div class="code-block">Comparação de segurança:

  Nível de Segurança   RSA Key Size    ECC Key Size
  ───────────────────  ────────────    ────────────
  80 bits              1024 bits       160 bits
  128 bits             3072 bits       256 bits
  256 bits             15360 bits      512 bits

Curva P-256 (secp256r1 / prime256v1):
  y² = x³ + ax + b  (mod p, onde p é primo de 256 bits)

  Operação fundamental: "Point Multiplication"
  → Q = k × G  (G = ponto gerador da curva, k = escalar)
  → Dado Q e G, encontrar k é o "Elliptic Curve Discrete Log Problem"
  → Computacionalmente inviável para curvas bem escolhidas</div>
<ul><li><strong>ECDSA:</strong> Algoritmo de assinatura digital baseado em curvas elípticas. Usado em Bitcoin, TLS, certificados digitais. Assinar é rápido (~ms), verificar também.</li><li><strong>Ed25519:</strong> Curva de Edwards moderna (Daniel Bernstein). Mais rápida, resistente a side-channel attacks, assinaturas determinísticas. Usada em SSH, WireGuard, Signal.</li><li><strong>RSA vs ECC:</strong> ECC domina em ambientes com restrição de banda/processamento (IoT, mobile, TLS). RSA ainda é usado em certificados legados. Ambos são vulneráveis a computadores quânticos (algoritmo de Shor) — por isso NIST já padronizou criptografia pós-quântica (CRYSTALS-Kyber, Dilithium).</li><li><strong>Uso prático:</strong> Assimétrica é ~1000x mais lenta que simétrica. Por isso, nunca ciframos dados em massa com RSA/ECC — usamos apenas para trocar uma chave simétrica (AES) ou assinar hashes.</li></ul>`;

const STEP_4 =
`<p>O problema central: como duas partes que <em>nunca se encontraram</em> combinam uma chave secreta compartilhada, comunicando-se por um canal que <strong>qualquer um pode observar</strong>? A resposta é o <span class="highlight">Diffie-Hellman Key Exchange</span> (1976).</p>
<div class="code-block">Diffie-Hellman — A Analogia das Cores:

  ┌─────────┐                         ┌─────────┐
  │  Alice   │                         │   Bob   │
  └────┬─────┘                         └────┬────┘
       │                                    │
       │  Público: cor base = AMARELO 🟡    │
       │                                    │
  Alice escolhe                        Bob escolhe
  cor secreta: 🔴                      cor secreta: 🔵
       │                                    │
  Mistura:                             Mistura:
  🟡 + 🔴 = 🟠                        🟡 + 🔵 = 🟢
       │                                    │
       │────── Troca 🟠 e 🟢 ──────────────│
       │     (público, qualquer um vê)      │
       │                                    │
  Alice:                               Bob:
  🟢 + 🔴 = 🟤                        🟠 + 🔵 = 🟤
       │                                    │
       └──── MESMA COR SECRETA! 🟤 ────────┘

  Observador viu: 🟡, 🟠, 🟢
  Mas NÃO consegue derivar 🟤 sem conhecer 🔴 ou 🔵!</div>
<p>A versão real usa matemática modular (DH clássico) ou curvas elípticas (ECDHE):</p>
<div class="code-block">ECDHE (Elliptic Curve Diffie-Hellman Ephemeral):

  Parâmetros públicos: Curva P-256, Ponto gerador G

  Alice                                Bob
  ─────                                ───
  a = random(1..n)                     b = random(1..n)
  (chave privada efêmera)              (chave privada efêmera)

  A = a × G                           B = b × G
  (ponto na curva = pub key)           (ponto na curva = pub key)

  ────── Troca A e B (público) ──────

  S = a × B                           S = b × A
    = a × (b × G)                       = b × (a × G)
    = ab × G          ←  IGUAIS! →      = ab × G

  shared_secret = KDF(S.x)   ← Key Derivation Function
  → Gera chave AES-256 para a sessão</div>
<ul><li><strong>"Ephemeral" (E em ECDHE):</strong> As chaves a e b são geradas <em>novas a cada sessão</em> e descartadas após derivar o segredo. Isso garante <strong>Perfect Forward Secrecy (PFS)</strong> — mesmo que a chave privada do certificado do servidor seja comprometida no futuro, sessões passadas não podem ser decifradas.</li><li><strong>DH clássico vs ECDHE:</strong> DH clássico usa exponenciação modular (g^a mod p) — funciona, mas precisa de parâmetros de 2048-4096 bits. ECDHE usa multiplicação de pontos em curvas elípticas — mesma segurança com 256 bits. Muito mais rápido e com menos banda.</li><li><strong>Autenticação:</strong> DH/ECDHE por si só não autentica as partes — um atacante Man-in-the-Middle poderia se passar por ambos os lados. Por isso, DH é sempre combinado com assinaturas digitais (RSA ou ECDSA) — o servidor assina seus parâmetros DH com sua chave privada do certificado, provando que é quem diz ser.</li><li><strong>Key Derivation (HKDF):</strong> O shared secret bruto não é usado diretamente como chave AES. Passa por HKDF (HMAC-based Key Derivation Function) que extrai entropia uniforme e expande em múltiplas chaves (uma para cada direção, uma para MAC, etc.).</li></ul>`;

const STEP_5 =
`<p>A criptografia assimétrica resolve <em>como</em> cifrar e assinar, mas não resolve <em>com quem</em> estou falando. Se eu acesso google.com, como sei que a chave pública que recebi é realmente do Google e não de um atacante? A resposta é a <span class="highlight">PKI (Public Key Infrastructure)</span> e os <strong>certificados X.509</strong>.</p>
<div class="code-block">Certificado X.509 do google.com:
┌─────────────────────────────────────────────────────┐
│ Version: v3                                         │
│ Serial: 0x7A3F...                                   │
│ Issuer: CN=GTS CA 1C3, O=Google Trust Services      │
│ Subject: CN=*.google.com                             │
│ Valid: 2026-03-01 to 2026-05-24                      │
│ Public Key: EC P-256 (04:3A:F2:...)                  │
│ Key Usage: Digital Signature                         │
│ SAN: *.google.com, google.com, youtube.com, ...      │
│ OCSP: http://ocsp.pki.goog/gts1c3                   │
│                                                      │
│ ─── Assinatura ───                                   │
│ Algorithm: ECDSA-SHA256                              │
│ Signature: 30:45:02:21:... (assinado pela CA)        │
└─────────────────────────────────────────────────────┘</div>
<p>A <strong>Cadeia de Confiança</strong> funciona em 3 níveis:</p>
<div class="code-block">Cadeia de Certificados:

  ┌─────────────────────────────────────┐
  │ Root CA (auto-assinada)             │ ← Pré-instalada no SO/navegador
  │ "GlobalSign Root R2"                │   ~150 Root CAs mundialmente
  │ Válida por 20+ anos                 │   Chave privada em HSM offline
  │ Assina ↓                            │
  └──────────────┬──────────────────────┘
                 │ Assinatura
  ┌──────────────▼──────────────────────┐
  │ Intermediate CA                     │ ← Emite certificados finais
  │ "GTS CA 1C3"                        │   Se comprometida, revoga
  │ Assinada pela Root CA               │   sem afetar a Root
  │ Assina ↓                            │
  └──────────────┬──────────────────────┘
                 │ Assinatura
  ┌──────────────▼──────────────────────┐
  │ Leaf Certificate (End-Entity)       │ ← O certificado do site
  │ CN=*.google.com                     │   Contém a pub key do servidor
  │ Assinado pela Intermediate          │   Válido por ~90 dias
  └─────────────────────────────────────┘

Verificação pelo browser:
1. Recebe Leaf + Intermediate
2. Verifica assinatura do Leaf com pub key da Intermediate ✓
3. Verifica assinatura da Intermediate com pub key da Root ✓
4. Root está no trust store do SO? ✓
5. Certificado não expirado? ✓
6. Domínio bate com SAN? ✓
→ 🔒 Conexão confiável!</div>
<ul><li><strong>Let's Encrypt:</strong> CA gratuita e automatizada que emite ~3 milhões de certificados por dia. Usa o protocolo ACME para verificação automatizada de domínio (HTTP-01, DNS-01). Revolucionou HTTPS — de ~40% da web em 2016 para >95% em 2024.</li><li><strong>Revogação:</strong> Se uma chave privada é comprometida, o certificado precisa ser invalidado antes de expirar. CRL (Certificate Revocation List) é uma lista publicada pela CA. OCSP (Online Certificate Status Protocol) é uma consulta em tempo real. OCSP Stapling — o servidor consulta o OCSP e grampeia a resposta no handshake TLS, evitando que o client precise consultar.</li><li><strong>Certificate Transparency (CT):</strong> Todos os certificados emitidos devem ser registrados em logs públicos imutáveis (Merkle Trees). Browsers como Chrome exigem CT — se uma CA emitir um certificado fraudulento, será detectado publicamente.</li><li><strong>mTLS (Mutual TLS):</strong> Normalmente só o servidor apresenta certificado. Em mTLS, o <em>client</em> também apresenta um certificado — autenticação mútua. Usado em comunicação entre microsserviços, APIs de bancos, e VPNs corporativas.</li></ul>`;

const STEP_6 =
`<p>O <strong>TLS 1.3</strong> (RFC 8446, 2018) é a culminação de todos os conceitos anteriores em um único protocolo que protege a comunicação na internet. Cada conexão HTTPS começa com um <span class="highlight">handshake TLS</span> que negocia algoritmos, troca chaves e verifica identidade — tudo em apenas <strong>1 RTT</strong>.</p>
<div class="code-block">TLS 1.3 Full Handshake (1-RTT):

Cliente                                    Servidor
  │                                            │
  │──── ClientHello ─────────────────────────→  │
  │  • Supported versions: TLS 1.3             │
  │  • Cipher suites: AES-256-GCM, ChaCha20   │
  │  • Key Share: ECDHE pub key (P-256)        │
  │  • SNI: "google.com"                       │
  │  • Supported Groups: P-256, X25519         │
  │  • Signature Algs: ECDSA-SHA256, RSA-PSS   │
  │                                            │
  │←─── ServerHello ───────────────────────────│
  │  • Selected cipher: AES-256-GCM            │
  │  • Key Share: ECDHE pub key do servidor    │
  │                                            │
  │  ═══ Shared Secret derivado (ECDHE) ═══    │
  │  ═══ Handshake keys ativadas ═══           │
  │                                            │
  │←─── {EncryptedExtensions} ────────────────│
  │←─── {Certificate} ────────────────────────│
  │  • Leaf cert + Intermediate cert           │
  │←─── {CertificateVerify} ──────────────────│
  │  • Assinatura ECDSA do transcript          │
  │←─── {Finished} ───────────────────────────│
  │  • HMAC de todo o handshake transcript     │
  │                                            │
  │──── {Finished} ─────────────────────────→  │
  │                                            │
  │  ═══ Application keys ativadas ═══         │
  │                                            │
  │←──── {HTTP/2 Data (cifrado AES-GCM)} ───→  │
  │                                            │
  {} = cifrado com handshake/application keys</div>
<p>O que TLS 1.3 <strong>removeu</strong> vs 1.2 (hardening):</p>
<div class="code-block">Removidos no TLS 1.3 (vulneráveis):
✗ RSA key exchange (sem forward secrecy)
✗ CBC mode ciphers (BEAST, Lucky13 attacks)
✗ RC4, DES, 3DES (cifras fracas)
✗ SHA-1 em assinaturas
✗ Renegociação (complexidade desnecessária)
✗ Compressão (CRIME attack)
✗ ChangeCipherSpec message

Cipher suites permitidas no TLS 1.3:
• TLS_AES_256_GCM_SHA384
• TLS_AES_128_GCM_SHA256
• TLS_CHACHA20_POLY1305_SHA256
→ Apenas 5 cipher suites vs ~300 no TLS 1.2
→ Todas com AEAD (Authenticated Encryption with Associated Data)
→ Key exchange SEMPRE ECDHE (forward secrecy obrigatória)</div>
<p><strong>0-RTT (Early Data)</strong> — reconexão instantânea:</p>
<ul><li>Na primeira conexão, cliente e servidor salvam um <strong>PSK (Pre-Shared Key)</strong> derivado da sessão.</li><li>Na reconexão, o cliente envia dados de aplicação <em>junto</em> com o ClientHello, cifrados com o PSK — sem esperar resposta do servidor.</li><li><strong>Risco:</strong> 0-RTT data não tem proteção contra <em>replay attacks</em>. Um atacante pode gravar e reenviar o ClientHello+Early Data. Servidores devem garantir idempotência (ex: não processar duas vezes o mesmo POST de pagamento).</li></ul>
<p><strong>Derivação de Chaves (HKDF):</strong></p>
<div class="code-block">Key Schedule do TLS 1.3:

  ECDHE Shared Secret
        │
        ▼
  HKDF-Extract → Handshake Secret
        │
        ├── Derive → client_handshake_key + IV
        ├── Derive → server_handshake_key + IV
        │
        ▼
  HKDF-Extract → Master Secret
        │
        ├── Derive → client_application_key + IV
        ├── Derive → server_application_key + IV
        ├── Derive → resumption_master_secret (para 0-RTT)
        └── Derive → exporter_master_secret

→ Chaves diferentes para cada direção
→ Chaves diferentes para handshake e dados
→ Re-keying automático após 2³² records</div>`;

export const STEPS_CONTENT = [
  STEP_1,
  STEP_2,
  STEP_3,
  STEP_4,
  STEP_5,
  STEP_6
];

import { CatalogCourse } from '../types/course'

export const COURSE_CATEGORIES = [
  'Core Systems',
  'Artificial Intelligence',
  'Data Architecture',
  'Cybersecurity',
  'Emerging Tech',
  'Foundations',
] as const

export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const

export const courseCatalog: CatalogCourse[] = [
  // ==========================================
  // Category 1: Core Systems (5 courses)
  // ==========================================
  {
    id: 'crs_ds_402', // Enrolled
    title: 'Distributed Systems Architecture',
    instructor: 'Dr. Elena Vance',
    category: 'Core Systems',
    level: 'Advanced',
    duration: '10 weeks (40 hrs)',
    rating: 4.9,
    lessonCount: 19,
    description:
      'Master the engineering principles behind large-scale fault-tolerant distributed networks, consensus protocols, and resilient microservices topology.',
    learningPoints: [
      'Design fault-tolerant distributed algorithms with high availability guarantees',
      'Implement Raft and Paxos consensus state machines from scratch',
      'Analyze network partitions, vector clocks, and linearizability models',
      'Optimize inter-service RPC throughput with gRPC and Protocol Buffers',
    ],
    syllabus: [
      {
        id: 'mod_ds_1',
        module: 1,
        title: 'Network Semantics & Time Synchronization',
        duration: '2.5 weeks',
        lessons: [
          'Failure Modes, Network Partitions & CAP Theorem',
          'Physical vs Logical Time: Lamport Timestamps',
          'Vector Clocks & Causal Consistency',
        ],
      },
      {
        id: 'mod_ds_2',
        module: 2,
        title: 'Distributed Consensus Mechanics',
        duration: '3.5 weeks',
        lessons: [
          'Two-Phase Commit & Coordinator Failures',
          'Raft Consensus Algorithm & Leader Election',
          'Log Compaction & Dynamic Membership Changes',
          'Paxos Core Protocol & Byzantine Fault Tolerance',
        ],
      },
      {
        id: 'mod_ds_3',
        module: 3,
        title: 'Scalable Coordination & Storage',
        duration: '4 weeks',
        lessons: [
          'Consistent Hashing & Virtual Nodes',
          'Distributed Transactions with Spanner & TrueTime',
          'Eventual Consistency with CRDTs',
        ],
      },
    ],
  },
  {
    id: 'crs_cp_420', // Enrolled
    title: 'Compiler Design & Optimization',
    instructor: 'Prof. Sophia Sterling',
    category: 'Core Systems',
    level: 'Advanced',
    duration: '12 weeks (48 hrs)',
    rating: 4.85,
    lessonCount: 25,
    description:
      'A deep dive into compiler construction, lexing, LLVM intermediate representations, static single assignment (SSA), and hardware-aware code generation.',
    learningPoints: [
      'Build end-to-end scanning and recursive-descent parsing pipelines',
      'Transform Abstract Syntax Trees into Static Single Assignment form',
      'Implement loop invariant code motion and dead code elimination',
      'Target LLVM IR and emit efficient machine assembly',
    ],
    syllabus: [
      {
        id: 'mod_cp_1',
        module: 1,
        title: 'Front-End: Lexing & Syntactic Analysis',
        duration: '3 weeks',
        lessons: [
          'Lexical Analysis & Regular Expression State Automata',
          'Context-Free Grammars & LR/LL Parsing',
          'Abstract Syntax Trees & Parsing Passes',
        ],
      },
      {
        id: 'mod_cp_2',
        module: 2,
        title: 'Semantic Analysis & Type Systems',
        duration: '3 weeks',
        lessons: [
          'Symbol Tables & Lexical Scoping Chains',
          'Type Inference Algorithms (Hindley-Milner)',
          'Intermediate Representation (IR) Generation',
        ],
      },
      {
        id: 'mod_cp_3',
        module: 3,
        title: 'Code Optimization & SSA Form',
        duration: '3 weeks',
        lessons: [
          'Dominator Trees & Dominance Frontiers',
          'SSA Construction & Phi-Function Placement',
          'Global Value Numbering & Loop Optimizations',
        ],
      },
      {
        id: 'mod_cp_4',
        module: 4,
        title: 'Backend Code Generation',
        duration: '3 weeks',
        lessons: [
          'Instruction Selection & Tree Rewriting',
          'Register Allocation via Graph Coloring',
          'JIT Compilation Strategies with LLVM',
        ],
      },
    ],
  },
  {
    id: 'crs_os_301', // Completed
    title: 'Operating Systems Principles',
    instructor: 'Dr. Sarah Connor',
    category: 'Core Systems',
    level: 'Intermediate',
    duration: '8 weeks (32 hrs)',
    rating: 4.8,
    lessonCount: 24,
    description:
      'Explore kernel internals, process concurrency, virtual memory paging, Linux file system implementations, and hardware interrupt dispatching.',
    learningPoints: [
      'Understand kernel architecture and system call transitions',
      'Implement synchronization primitives using mutexes and semaphores',
      'Master two-level and multi-level virtual memory page tables',
      'Design POSIX compliant file systems and block storage drivers',
    ],
    syllabus: [
      {
        id: 'mod_os_1',
        module: 1,
        title: 'Kernel Architecture & Processes',
        duration: '2.5 weeks',
        lessons: [
          'User Mode vs Kernel Mode Boundaries',
          'Process Context Switching & Scheduling Algorithms',
          'POSIX Threads & Synchronization Primitives',
        ],
      },
      {
        id: 'mod_os_2',
        module: 2,
        title: 'Virtual Memory & Storage',
        duration: '3 weeks',
        lessons: [
          'Multi-Level Page Tables & TLB Architecture',
          'Page Replacement Algorithms & Demand Paging',
          'VFS Layer, Inodes, and Journaling File Systems',
        ],
      },
      {
        id: 'mod_os_3',
        module: 3,
        title: 'I/O & Concurrency Hazards',
        duration: '2.5 weeks',
        lessons: [
          'Device Drivers, DMA, and Hardware Interrupts',
          'Deadlock Avoidance & Banker’s Algorithm',
          'Zero-Copy I/O Mechanics (sendfile & io_uring)',
        ],
      },
    ],
  },
  {
    id: 'crs_sys_210',
    title: 'Computer Architecture & Hardware Interface',
    instructor: 'Dr. Ronald Harris',
    category: 'Core Systems',
    level: 'Beginner',
    duration: '6 weeks (24 hrs)',
    rating: 4.75,
    lessonCount: 18,
    description:
      'Learn the foundations of microprocessors, digital logic gates, RISC-V instruction sets, memory hierarchies, and hardware-software contracts.',
    learningPoints: [
      'Construct combinational and sequential digital logic circuits',
      'Decode and trace RISC-V assembly instruction execution',
      'Analyze CPU pipeline hazards and branch prediction mechanisms',
      'Measure L1/L2/L3 cache miss penalties and memory latency',
    ],
    syllabus: [
      {
        id: 'mod_sys_1',
        module: 1,
        title: 'Digital Logic & Arithmetic Units',
        duration: '2 weeks',
        lessons: [
          'Boolean Algebra & Logic Gates Synthesis',
          'ALU Design & Two’s Complement Arithmetic',
          'Sequential Circuits: Flip-Flops and Registers',
        ],
      },
      {
        id: 'mod_sys_2',
        module: 2,
        title: 'Processor Pipeline & RISC-V',
        duration: '2 weeks',
        lessons: [
          'RISC-V Instruction Formats & Encodings',
          'Five-Stage Processor Pipeline Design',
          'Data Hazards, Forwarding, and Branch Stalls',
        ],
      },
      {
        id: 'mod_sys_3',
        module: 3,
        title: 'Memory Hierarchy & Caching',
        duration: '2 weeks',
        lessons: [
          'Direct-Mapped vs Set-Associative Caches',
          'Cache Write Policies & Miss Penalties',
          'Bus Protocols and Peripheral Interfaces',
        ],
      },
    ],
  },
  {
    id: 'crs_sys_435',
    title: 'High-Performance Concurrent Programming',
    instructor: 'Prof. Marcus Thorne',
    category: 'Core Systems',
    level: 'Intermediate',
    duration: '8 weeks (32 hrs)',
    rating: 4.88,
    lessonCount: 22,
    description:
      'Conquer multithreaded systems programming, atomic CPU instructions, lock-free queues, memory consistency models, and cache coherence protocols.',
    learningPoints: [
      'Apply hardware compare-and-swap (CAS) primitives safely',
      'Construct wait-free and lock-free ring buffers and queues',
      'Differentiate between Sequential Consistency, Acquire-Release, and Relaxed memory orders',
      'Eliminate false sharing and benchmark thread contention bottlenecks',
    ],
    syllabus: [
      {
        id: 'mod_con_1',
        module: 1,
        title: 'Hardware Concurrency & Cache Coherence',
        duration: '2.5 weeks',
        lessons: [
          'MESI Coherence Protocol & False Sharing',
          'CPU Store Buffers & Memory Fences',
          'Atomic Instructions & Hardware Lock Elision',
        ],
      },
      {
        id: 'mod_con_2',
        module: 2,
        title: 'Lock-Free Data Structures',
        duration: '3 weeks',
        lessons: [
          'Michael-Scott Lock-Free Queue',
          'ABA Problem & Epoch-Based Reclamation',
          'Lock-Free Skip Lists & Work-Stealing Pools',
        ],
      },
      {
        id: 'mod_con_3',
        module: 3,
        title: 'Asynchronous Runtimes',
        duration: '2.5 weeks',
        lessons: [
          'Cooperative Multitasking & Coroutine Mechanics',
          'Event Loop Internals (epoll/kqueue)',
          'Actor Model & CSP Concurrency Patterns',
        ],
      },
    ],
  },

  // ==========================================
  // Category 2: Artificial Intelligence (5 courses)
  // ==========================================
  {
    id: 'crs_ml_481', // Enrolled
    title: 'Advanced Machine Learning & Neural Networks',
    instructor: 'Prof. Aris Thorne',
    category: 'Artificial Intelligence',
    level: 'Advanced',
    duration: '10 weeks (40 hrs)',
    rating: 4.95,
    lessonCount: 20,
    description:
      'Comprehensive study of deep learning architectures, multi-head self-attention, backpropagation calculus, and distributed GPU training optimization.',
    learningPoints: [
      'Derive and optimize neural network gradient updates with tensor math',
      'Implement self-attention and Transformer encoder-decoder blocks',
      'Tune model convergence with AdamW, learning rate schedulers, and gradient clipping',
      'Scale model training using PyTorch DistributedDataParallel and FlashAttention',
    ],
    syllabus: [
      {
        id: 'mod_ml_1',
        module: 1,
        title: 'Foundations of Deep Optimization',
        duration: '3 weeks',
        lessons: [
          'Automatic Differentiation & Computational Graphs',
          'Stochastic Optimization (SGD, AdamW, Lookahead)',
          'Regularization: Dropout, Weight Decay, LayerNorm',
        ],
      },
      {
        id: 'mod_ml_2',
        module: 2,
        title: 'Transformer Architecture & Attention',
        duration: '4 weeks',
        lessons: [
          'Scaled Dot-Product Attention & Positional Encodings',
          'Attention Mechanisms & Transformer Encoders',
          'Rotary Positional Embeddings (RoPE) & KV Caching',
          'FlashAttention & GPU Memory Optimization',
        ],
      },
      {
        id: 'mod_ml_3',
        module: 3,
        title: 'Distributed Training & Fine-Tuning',
        duration: '3 weeks',
        lessons: [
          'Data Parallelism vs Tensor Parallelism (ZeRO)',
          'Parameter-Efficient Fine-Tuning (LoRA & QLoRA)',
          'Reinforcement Learning from Human Feedback (RLHF)',
        ],
      },
    ],
  },
  {
    id: 'crs_ai_210',
    title: 'Introduction to Machine Learning with Python',
    instructor: 'Dr. Maya Lin',
    category: 'Artificial Intelligence',
    level: 'Beginner',
    duration: '6 weeks (24 hrs)',
    rating: 4.7,
    lessonCount: 16,
    description:
      'Practical entry into supervised and unsupervised learning, exploratory data analysis, Scikit-Learn pipelines, and model evaluation metrics.',
    learningPoints: [
      'Preprocess tabular features, handle missing data, and encode categorical variables',
      'Train linear regressors, logistic models, and decision tree ensembles',
      'Evaluate model generalization using ROC-AUC, precision-recall, and cross-validation',
      'Deploy inference models as REST microservices',
    ],
    syllabus: [
      {
        id: 'mod_ai1_1',
        module: 1,
        title: 'Data Preparation & Feature Engineering',
        duration: '2 weeks',
        lessons: [
          'NumPy & Pandas for Statistical Modeling',
          'Feature Scaling, One-Hot Encoding & Imputation',
          'Dimensionality Reduction via PCA',
        ],
      },
      {
        id: 'mod_ai1_2',
        module: 2,
        title: 'Supervised Learning Algorithms',
        duration: '2 weeks',
        lessons: [
          'Ordinary Least Squares & Ridge Regression',
          'Logistic Regression & Decision Boundaries',
          'Random Forests & Gradient Boosted Trees',
        ],
      },
      {
        id: 'mod_ai1_3',
        module: 3,
        title: 'Model Validation & Deployment',
        duration: '2 weeks',
        lessons: [
          'Cross-Validation & Hyperparameter Tuning (GridSearch)',
          'Classification vs Regression Metrics',
          'Exporting Model Artifacts with ONNX',
        ],
      },
    ],
  },
  {
    id: 'crs_ai_340',
    title: 'Computer Vision & Convolutional Architectures',
    instructor: 'Dr. Julian Alvarez',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    duration: '8 weeks (32 hrs)',
    rating: 4.82,
    lessonCount: 22,
    description:
      'Build state-of-the-art vision systems with CNNs, ResNets, Vision Transformers (ViTs), object detection (YOLO), and image segmentation.',
    learningPoints: [
      'Design convolutional feature extractors and residual skip connections',
      'Implement single-stage object detection architectures',
      'Segment complex scene objects using U-Net and Mask R-CNN',
      'Deploy real-time camera tracking and inference on edge devices',
    ],
    syllabus: [
      {
        id: 'mod_cv_1',
        module: 1,
        title: 'Convolutional Foundations',
        duration: '2.5 weeks',
        lessons: [
          'Spatial Filtering, Convolutions & Pooling',
          'ResNet Architectures & Vanishing Gradient Solutions',
          'Data Augmentation Pipelines for Vision',
        ],
      },
      {
        id: 'mod_cv_2',
        module: 2,
        title: 'Object Detection & Localization',
        duration: '3 weeks',
        lessons: [
          'Anchor Boxes & Intersection over Union (IoU)',
          'YOLOv8 Real-Time Detection Architecture',
          'Non-Maximum Suppression & Metric Evaluation (mAP)',
        ],
      },
      {
        id: 'mod_cv_3',
        module: 3,
        title: 'Modern Vision Transformers',
        duration: '2.5 weeks',
        lessons: [
          'Patch Embeddings & ViT Self-Attention',
          'Semantic Segmentation with U-Net',
          'Zero-Shot Vision with Contrastive Models (CLIP)',
        ],
      },
    ],
  },
  {
    id: 'crs_ai_450',
    title: 'Natural Language Processing & Large Language Models',
    instructor: 'Dr. Clara Evans',
    category: 'Artificial Intelligence',
    level: 'Advanced',
    duration: '10 weeks (40 hrs)',
    rating: 4.92,
    lessonCount: 24,
    description:
      'Train, fine-tune, and align frontier LLMs. Explore retrieval-augmented generation (RAG), vector embeddings, tokenization, and reasoning loops.',
    learningPoints: [
      'Master Byte-Pair Encoding (BPE) and subword tokenization mechanics',
      'Construct production-grade RAG pipelines with vector indices',
      'Fine-tune instruction-following models using Direct Preference Optimization (DPO)',
      'Benchmark context window recall using needle-in-a-haystack analysis',
    ],
    syllabus: [
      {
        id: 'mod_nlp_1',
        module: 1,
        title: 'Tokenization & Language Modeling',
        duration: '3 weeks',
        lessons: [
          'BPE Tokenizer Construction & Vocabulary Trimming',
          'Causal Language Modeling & Cross-Entropy Loss',
          'Decoding Strategies: Greedy, Top-k, Top-p, Temperature',
        ],
      },
      {
        id: 'mod_nlp_2',
        module: 2,
        title: 'Vector Embeddings & Retrieval (RAG)',
        duration: '3.5 weeks',
        lessons: [
          'Dense Retrieval & Cosine Similarity Metrics',
          'Hierarchical Chunking & Re-ranking Models',
          'Vector Index Architecture (HNSW & IVF)',
        ],
      },
      {
        id: 'mod_nlp_3',
        module: 3,
        title: 'Model Alignment & Reasoning Agents',
        duration: '3.5 weeks',
        lessons: [
          'Instruction Tuning with Alpaca-Style Datasets',
          'Direct Preference Optimization (DPO)',
          'Tool Calling & ReAct Reasoning Loops',
        ],
      },
    ],
  },
  {
    id: 'crs_ai_360',
    title: 'Reinforcement Learning & Autonomous Agents',
    instructor: 'Prof. David Kim',
    category: 'Artificial Intelligence',
    level: 'Intermediate',
    duration: '8 weeks (32 hrs)',
    rating: 4.79,
    lessonCount: 20,
    description:
      'Study Markov decision processes, Q-learning, deep policy gradients (PPO), and multi-agent competitive environments for autonomous decision making.',
    learningPoints: [
      'Model decision problems as Markov Decision Processes (MDPs)',
      'Implement Deep Q-Networks (DQN) with replay buffers and target networks',
      'Optimize continuous actions using Proximal Policy Optimization (PPO)',
      'Simulate multi-agent games and Nash equilibrium convergence',
    ],
    syllabus: [
      {
        id: 'mod_rl_1',
        module: 1,
        title: 'Markov Decision Processes & Value Iteration',
        duration: '2.5 weeks',
        lessons: [
          'Bellman Expectation & Optimality Equations',
          'Policy Iteration vs Value Iteration',
          'Temporal Difference Learning & SARSA',
        ],
      },
      {
        id: 'mod_rl_2',
        module: 2,
        title: 'Deep Q-Learning & Actor-Critic',
        duration: '3 weeks',
        lessons: [
          'Deep Q-Networks (DQN) & Experience Replay',
          'Policy Gradient Theorem & REINFORCE Algorithm',
          'Actor-Critic Architectures (A2C/A3C)',
        ],
      },
      {
        id: 'mod_rl_3',
        module: 3,
        title: 'Modern Policy Optimization',
        duration: '2.5 weeks',
        lessons: [
          'Trust Region Policy Optimization (TRPO)',
          'Proximal Policy Optimization (PPO) Clipped Objective',
          'Multi-Agent Coordination & Simulation Environments',
        ],
      },
    ],
  },

  // ==========================================
  // Category 3: Data Architecture (5 courses)
  // ==========================================
  {
    id: 'crs_db_390', // Enrolled
    title: 'Database Internals & Storage Engines',
    instructor: 'Dr. Liam Chen',
    category: 'Data Architecture',
    level: 'Intermediate',
    duration: '9 weeks (36 hrs)',
    rating: 4.88,
    lessonCount: 25,
    description:
      'Understand how modern relational and NoSQL engines persist, index, and query data under strict ACID and multi-version concurrency controls.',
    learningPoints: [
      'Implement B+ Tree leaf node splitting, merging, and search algorithms',
      'Construct Log-Structured Merge (LSM) Trees with Bloom filters',
      'Architect Write-Ahead Logging (WAL) and ARIES recovery protocols',
      'Design Multi-Version Concurrency Control (MVCC) snapshot isolation',
    ],
    syllabus: [
      {
        id: 'mod_db_1',
        module: 1,
        title: 'Disk Storage & Page Buffer Management',
        duration: '2.5 weeks',
        lessons: [
          'Disk Page Formats & Slotted Pages',
          'Buffer Pool Managers & Clock-Pro Eviction',
          'B+ Tree Indexing & Concurrency Crabbing',
        ],
      },
      {
        id: 'mod_db_2',
        module: 2,
        title: 'LSM Trees & Write Optimization',
        duration: '3.5 weeks',
        lessons: [
          'Memtable Design & Skip Lists',
          'SSTable Disk Layout & Bloom Filter Lookups',
          'Write-Ahead Logging & LSM Tree Compaction',
          'Level-Based vs Size-Tiered Compaction',
        ],
      },
      {
        id: 'mod_db_3',
        module: 3,
        title: 'Transactions & Query Execution',
        duration: '3 weeks',
        lessons: [
          'Two-Phase Locking & Deadlock Detection',
          'Multi-Version Concurrency Control (MVCC)',
          'Volcano Iterator Model vs Vectorized Execution',
        ],
      },
    ],
  },
  {
    id: 'crs_data_205',
    title: 'Relational Database Design & SQL Essentials',
    instructor: 'Elena Rostova',
    category: 'Data Architecture',
    level: 'Beginner',
    duration: '6 weeks (24 hrs)',
    rating: 4.72,
    lessonCount: 18,
    description:
      'Master schema normalization, relational algebra, window functions, CTEs, indexing strategies, and PostgreSQL administration.',
    learningPoints: [
      'Design clean schemas in Third Normal Form (3NF) without data anomalies',
      'Author complex SQL queries with recursive CTEs and analytical window functions',
      'Analyze query execution plans using EXPLAIN ANALYZE',
      'Enforce data integrity with foreign keys, checks, and transactional isolation',
    ],
    syllabus: [
      {
        id: 'mod_sql_1',
        module: 1,
        title: 'Data Modeling & Normalization',
        duration: '2 weeks',
        lessons: [
          'Entity-Relationship Diagrams (ERD) to Relational Schemas',
          'First, Second, and Third Normal Forms (1NF-3NF)',
          'Primary Keys, Foreign Keys, and Referential Integrity',
        ],
      },
      {
        id: 'mod_sql_2',
        module: 2,
        title: 'Advanced SQL Querying',
        duration: '2 weeks',
        lessons: [
          'Multi-Table Joins & Grouping Sets',
          'Subqueries & Common Table Expressions (CTEs)',
          'Window Functions (ROW_NUMBER, RANK, LAG, LEAD)',
        ],
      },
      {
        id: 'mod_sql_3',
        module: 3,
        title: 'PostgreSQL Performance & Indexing',
        duration: '2 weeks',
        lessons: [
          'B-Tree, Hash, and GIN Indexing Types',
          'Reading EXPLAIN ANALYZE Execution Plans',
          'Connection Pooling & Schema Migration Best Practices',
        ],
      },
    ],
  },
  {
    id: 'crs_data_415',
    title: 'Real-Time Stream Processing with Kafka & Flink',
    instructor: 'Tariq Mansour',
    category: 'Data Architecture',
    level: 'Advanced',
    duration: '10 weeks (40 hrs)',
    rating: 4.91,
    lessonCount: 26,
    description:
      'Build ultra-low latency event-driven architectures with Apache Kafka, stateful Apache Flink pipelines, exactly-once semantics, and watermarks.',
    learningPoints: [
      'Configure Kafka partitions, replication factors, and consumer groups',
      'Process out-of-order event streams using tumbling and sliding window watermarks',
      'Guarantee end-to-end exactly-once processing with two-phase commit sinks',
      'Manage stateful stream checkpoints and RocksDB state backends',
    ],
    syllabus: [
      {
        id: 'mod_stm_1',
        module: 1,
        title: 'Event Streaming Core with Kafka',
        duration: '3 weeks',
        lessons: [
          'Commit Log Architecture & Zero-Copy Sockets',
          'Partitioning Strategies & Rebalance Protocols',
          'Schema Registry & Avro Serialization',
        ],
      },
      {
        id: 'mod_stm_2',
        module: 2,
        title: 'Stateful Stream Processing with Flink',
        duration: '4 weeks',
        lessons: [
          'Event Time vs Processing Time Semantics',
          'Watermark Generation & Late-Arriving Events',
          'Keyed State, Operator State & RocksDB Backend',
          'Chandy-Lamport Checkpointing & Snapshotting',
        ],
      },
      {
        id: 'mod_stm_3',
        module: 3,
        title: 'Reliability & Production Operations',
        duration: '3 weeks',
        lessons: [
          'Two-Phase Commit Sinks & Exactly-Once Semantics',
          'Dead-Letter Queues & Backpressure Diagnostics',
          'Scaling Streamtopologies under Burst Loads',
        ],
      },
    ],
  },
  {
    id: 'crs_data_350',
    title: 'Distributed Data Warehouses & Analytics Engines',
    instructor: 'Siddharth Nair',
    category: 'Data Architecture',
    level: 'Beginner',
    duration: '8 weeks (32 hrs)',
    rating: 4.77,
    lessonCount: 21,
    description:
      'Learn columnar storage layouts (Parquet/ORC), MPP query engines (DuckDB/Trino/Snowflake), partition pruning, and Lakehouse architectures.',
    learningPoints: [
      'Compare row-oriented vs columnar storage compression efficiencies',
      'Optimize analytical queries using partition pruning and projection pushdown',
      'Architect Delta Lake and Apache Iceberg metadata transaction catalogs',
      'Benchmarking vector query execution engines against traditional row iterators',
    ],
    syllabus: [
      {
        id: 'mod_dwh_1',
        module: 1,
        title: 'Columnar File Formats & Compression',
        duration: '2.5 weeks',
        lessons: [
          'Row vs Column Storage Tradeoffs',
          'Apache Parquet: Page Headers, Dictionary & RLE Encoding',
          'Statistics & Zone Maps for Rapid Pruning',
        ],
      },
      {
        id: 'mod_dwh_2',
        module: 2,
        title: 'Massively Parallel Processing (MPP)',
        duration: '3 weeks',
        lessons: [
          'Shared-Nothing vs Decoupled Compute & Storage',
          'Distributed Hash Joins & Broadcast Shuffles',
          'Cost-Based Query Optimizers (CBO)',
        ],
      },
      {
        id: 'mod_dwh_3',
        module: 3,
        title: 'Modern Lakehouse Paradigms',
        duration: '2.5 weeks',
        lessons: [
          'ACID Transactions on Object Stores (Iceberg/Delta)',
          'Time Travel, Compaction & Vacuuming',
          'Serving High-Throughput BI Dashboards',
        ],
      },
    ],
  },
  {
    id: 'crs_data_460',
    title: 'Distributed Graph Databases & Knowledge Graphs',
    instructor: 'Dr. Fiona Campbell',
    category: 'Data Architecture',
    level: 'Advanced',
    duration: '8 weeks (32 hrs)',
    rating: 4.84,
    lessonCount: 20,
    description:
      'Model connected data structures, implement Cypher/Gremlin graph traversals, and scale property graph storage across distributed clusters.',
    learningPoints: [
      'Structure domain knowledge into labeled property graph models',
      'Execute shortest-path and centrality algorithms at scale',
      'Partition graph topologies with minimal edge cuts across nodes',
      'Integrate vector embeddings with entity relationship knowledge graphs',
    ],
    syllabus: [
      {
        id: 'mod_grp_1',
        module: 1,
        title: 'Graph Data Models & Query Languages',
        duration: '2.5 weeks',
        lessons: [
          'Property Graphs vs RDF Triples',
          'Declarative Graph Querying with Cypher',
          'Index-Free Adjacency & Pointer Swizzling',
        ],
      },
      {
        id: 'mod_grp_2',
        module: 2,
        title: 'Graph Analytics & Algorithms',
        duration: '3 weeks',
        lessons: [
          'Breadth-First Search & Dijkstra at Scale',
          'PageRank, Betweenness Centrality & Community Detection',
          'Graph Neural Network (GNN) Message Passing',
        ],
      },
      {
        id: 'mod_grp_3',
        module: 3,
        title: 'Distributed Graph Partitioning',
        duration: '2.5 weeks',
        lessons: [
          'Vertex-Cut vs Edge-Cut Partitioning',
          'Distributed Query Coordination in Neo4j and JanusGraph',
          'Hybrid Vector-Knowledge Graph Reasoning',
        ],
      },
    ],
  },

  // ==========================================
  // Category 4: Cybersecurity (5 courses)
  // ==========================================
  {
    id: 'crs_sec_455', // Enrolled
    title: 'Cryptographic Engineering & Security',
    instructor: 'Dr. Marcus Novak',
    category: 'Cybersecurity',
    level: 'Intermediate',
    duration: '9 weeks (36 hrs)',
    rating: 4.87,
    lessonCount: 22,
    description:
      'Rigorous study of modern symmetric/asymmetric ciphers, key exchanges, side-channel attack mitigations, and zero-knowledge proof primitives.',
    learningPoints: [
      'Implement AES-GCM authenticated encryption and secure nonce handling',
      'Derive Elliptic Curve Diffie-Hellman (ECDH) key exchanges on Curve25519',
      'Mitigate timing and side-channel vulnerabilities with constant-time code',
      'Construct polynomial commitments and Zero-Knowledge Succinct Non-Interactive Arguments (zk-SNARKs)',
    ],
    syllabus: [
      {
        id: 'mod_sec_1',
        module: 1,
        title: 'Symmetric Cryptography & Modes',
        duration: '2.5 weeks',
        lessons: [
          'Stream Ciphers, Block Ciphers & Feistel Networks',
          'Galois/Counter Mode (GCM) & Associated Data',
          'Cryptographic Hash Functions & HMAC Constructions',
        ],
      },
      {
        id: 'mod_sec_2',
        module: 2,
        title: 'Asymmetric Primitives & Elliptic Curves',
        duration: '3.5 weeks',
        lessons: [
          'Modular Arithmetic & RSA Key Generation',
          'Weierstrass and Edwards Elliptic Curves',
          'Digital Signatures (Ed25519 & ECDSA)',
          'Zero-Knowledge Proofs & Elliptic Curves',
        ],
      },
      {
        id: 'mod_sec_3',
        module: 3,
        title: 'Post-Quantum & Hardware Hardening',
        duration: '3 weeks',
        lessons: [
          'Constant-Time Coding & Cache-Timing Mitigations',
          'Lattice-Based Post-Quantum Standards (ML-KEM/Kyber)',
          'Hardware Security Modules (HSMs) & Enclaves',
        ],
      },
    ],
  },
  {
    id: 'crs_sec_201',
    title: 'Security Foundations & Defensive Architecture',
    instructor: 'Rachel Adams',
    category: 'Cybersecurity',
    level: 'Beginner',
    duration: '6 weeks (24 hrs)',
    rating: 4.68,
    lessonCount: 17,
    description:
      'Core principles of information assurance, threat modeling with STRIDE, authentication protocols (OAuth2/OIDC), and defense-in-depth design.',
    learningPoints: [
      'Apply the CIA Triad and least-privilege principles to software systems',
      'Identify architectural risks with STRIDE threat modeling',
      'Implement secure OAuth 2.0 authorization code flow with PKCE',
      'Configure Content Security Policy (CSP) and CORS protections',
    ],
    syllabus: [
      {
        id: 'mod_secf_1',
        module: 1,
        title: 'Security Principles & Threat Modeling',
        duration: '2 weeks',
        lessons: [
          'CIA Triad & Defense-in-Depth Fundamentals',
          'STRIDE Threat Modeling Methodologies',
          'Attack Surfaces & Trust Boundaries',
        ],
      },
      {
        id: 'mod_secf_2',
        module: 2,
        title: 'Identity, Authentication & Tokens',
        duration: '2 weeks',
        lessons: [
          'Password Hashing (Argon2id, bcrypt)',
          'JSON Web Tokens (JWT) Vulnerabilities & Mitigations',
          'OAuth 2.0 & OpenID Connect Protocols',
        ],
      },
      {
        id: 'mod_secf_3',
        module: 3,
        title: 'Application Defensive Controls',
        duration: '2 weeks',
        lessons: [
          'Cross-Site Scripting (XSS) & Cross-Site Request Forgery (CSRF)',
          'Input Sanitization & Parameterized Queries',
          'Security Headers (HSTS, CSP, X-Frame-Options)',
        ],
      },
    ],
  },
  {
    id: 'crs_sec_380',
    title: 'Network Defense & Penetration Testing',
    instructor: 'Victor Moreau',
    category: 'Cybersecurity',
    level: 'Beginner',
    duration: '8 weeks (32 hrs)',
    rating: 4.81,
    lessonCount: 23,
    description:
      'Hands-on network scanning, packet analysis with Wireshark, firewall topologies, exploit development basics, and automated intrusion detection.',
    learningPoints: [
      'Capture and inspect malicious network payloads with Wireshark',
      'Conduct authorized network vulnerability assessments using Nmap and Metasploit',
      'Configure Snort/Suricata intrusion detection rule engines',
      'Trace lateral movement in Active Directory environments',
    ],
    syllabus: [
      {
        id: 'mod_net_1',
        module: 1,
        title: 'Packet Analysis & Protocol Reconnaissance',
        duration: '2.5 weeks',
        lessons: [
          'TCP/IP Handshake Exploits & SYN Floods',
          'Deep Packet Inspection with Wireshark & tcpdump',
          'Port Scanning Strategies & Service Fingerprinting',
        ],
      },
      {
        id: 'mod_net_2',
        module: 2,
        title: 'Offensive Security & Pen-Testing Workflow',
        duration: '3 weeks',
        lessons: [
          'Vulnerability Scanning & CVE Exploitation',
          'Metasploit Framework & Payload Staging',
          'Privilege Escalation Techniques in Linux and Windows',
        ],
      },
      {
        id: 'mod_net_3',
        module: 3,
        title: 'Defensive Perimeter & IDS/IPS',
        duration: '2.5 weeks',
        lessons: [
          'Stateful Packet Inspection vs Next-Gen Firewalls',
          'Snort/Suricata Rule Authoring & Alert Tuning',
          'SIEM Log Ingestion & Threat Hunting Workflows',
        ],
      },
    ],
  },
  {
    id: 'crs_sec_470',
    title: 'Zero Trust Architecture & Cloud Security',
    instructor: 'Sonia Patel',
    category: 'Cybersecurity',
    level: 'Advanced',
    duration: '8 weeks (32 hrs)',
    rating: 4.89,
    lessonCount: 21,
    description:
      'Architect resilient enterprise networks eliminating implicit trust. Covers mTLS service meshes, SPIFFE/SPIRE identity, IAM policies, and cloud hardening.',
    learningPoints: [
      'Implement mutual TLS (mTLS) with automated certificate rotation',
      'Issue cryptographically verifiable workload identities via SPIFFE/SPIRE',
      'Construct strict IAM boundary policies in AWS/GCP multi-tenant clouds',
      'Enforce Kubernetes pod security standards and runtime eBPF auditing',
    ],
    syllabus: [
      {
        id: 'mod_zt_1',
        module: 1,
        title: 'Zero Trust Tenets & Architecture',
        duration: '2.5 weeks',
        lessons: [
          'NIST 800-207 Zero Trust Tenets & BeyondCorp',
          'Micro-Segmentation & Software-Defined Perimeters',
          'Continuous Contextual Access Evaluation',
        ],
      },
      {
        id: 'mod_zt_2',
        module: 2,
        title: 'Workload Identity & Service Meshes',
        duration: '3 weeks',
        lessons: [
          'Mutual TLS Handshakes & Certificate Authorities',
          'SPIFFE/SPIRE Workload Attestation Mechanics',
          'Istio/Envoy Mesh Traffic Policies & Authorization',
        ],
      },
      {
        id: 'mod_zt_3',
        module: 3,
        title: 'Cloud & Container Runtime Hardening',
        duration: '2.5 weeks',
        lessons: [
          'Least-Privilege IAM & Role Assumption Chains',
          'Kubernetes Admission Controllers & Pod Security Standards',
          'Runtime Observability & Threat Detection with eBPF',
        ],
      },
    ],
  },
  {
    id: 'crs_sec_490',
    title: 'Binary Exploitation & Reverse Engineering',
    instructor: 'Alexei Volkov',
    category: 'Cybersecurity',
    level: 'Advanced',
    duration: '10 weeks (40 hrs)',
    rating: 4.93,
    lessonCount: 25,
    description:
      'Deconstruct compiled binaries using Ghidra, analyze x86-64 assembly, bypass modern exploit mitigations (ASLR, DEP, Canary), and build ROP chains.',
    learningPoints: [
      'Disassemble and decompile stripped C/C++ executables using Ghidra and IDA Pro',
      'Exploit stack and heap buffer overflows in modern Linux environments',
      'Construct Return-Oriented Programming (ROP) payload chains',
      'Bypass stack canaries, Address Space Layout Randomization (ASLR), and Non-Executable stacks',
    ],
    syllabus: [
      {
        id: 'mod_bin_1',
        module: 1,
        title: 'Disassembly & Static Analysis',
        duration: '3 weeks',
        lessons: [
          'x86-64 Calling Conventions & Stack Frames',
          'Ghidra Decompiler Navigation & Data Type Recovery',
          'Analyzing Malicious Control Flow Graphs',
        ],
      },
      {
        id: 'mod_bin_2',
        module: 2,
        title: 'Memory Corruption Vulnerabilities',
        duration: '3.5 weeks',
        lessons: [
          'Stack-Based Buffer Overflows & Instruction Pointer Overwrite',
          'Format String Attacks & Arbitrary Memory Write',
          'Heap Chunk Metadata & Use-After-Free Exploitation',
        ],
      },
      {
        id: 'mod_bin_3',
        module: 3,
        title: 'Modern Mitigations & ROP Chains',
        duration: '3.5 weeks',
        lessons: [
          'Stack Canaries & Information Leak Primitives',
          'Bypassing NX/DEP with Return-Oriented Programming (ROP)',
          'Defeating ASLR via ret2libc and GOT Overwrite',
        ],
      },
    ],
  },

  // ==========================================
  // Category 5: Emerging Tech (5 courses)
  // ==========================================
  {
    id: 'crs_qc_310', // Enrolled
    title: 'Quantum Computing Fundamentals',
    instructor: 'Dr. Rebecca Lin',
    category: 'Emerging Tech',
    level: 'Beginner',
    duration: '7 weeks (28 hrs)',
    rating: 4.76,
    lessonCount: 20,
    description:
      'An accessible introduction to qubits, quantum superpositions, entanglement, quantum logic gates, and circuit simulation using Qiskit.',
    learningPoints: [
      'Represent quantum states using Bloch spheres and bra-ket Dirac notation',
      'Apply Hadamard, Pauli, and Controlled-NOT (CNOT) quantum logic gates',
      'Simulate quantum teleportation and superdense coding circuits in Qiskit',
      'Analyze Deutsch-Jozsa and Grover search algorithm speedups',
    ],
    syllabus: [
      {
        id: 'mod_qc_1',
        module: 1,
        title: 'Introduction to Quantum States',
        duration: '2 weeks',
        lessons: [
          'Module 1: Introduction to Quantum States',
          'Qubits, Vectors & The Bloch Sphere',
          'Quantum Superposition & Measurement Collapse',
        ],
      },
      {
        id: 'mod_qc_2',
        module: 2,
        title: 'Quantum Gates & Two-Qubit Circuits',
        duration: '2.5 weeks',
        lessons: [
          'Single Qubit Operations (H, X, Y, Z, S, T)',
          'Entanglement & The Bell States',
          'Controlled Gates & Quantum Circuit Equivalence',
        ],
      },
      {
        id: 'mod_qc_3',
        module: 3,
        title: 'Introductory Quantum Algorithms',
        duration: '2.5 weeks',
        lessons: [
          'Quantum Teleportation Protocol Implementation',
          'Deutsch-Jozsa & Oracle Function Queries',
          'Grover’s Search Algorithm & Amplitude Amplification',
        ],
      },
    ],
  },
  {
    id: 'crs_emg_280',
    title: 'WebAssembly & High-Performance Browser Runtimes',
    instructor: 'Felix Zimmerman',
    category: 'Emerging Tech',
    level: 'Intermediate',
    duration: '7 weeks (28 hrs)',
    rating: 4.83,
    lessonCount: 19,
    description:
      'Compile Rust and C++ to WebAssembly (Wasm), optimize linear memory management, bridge JavaScript through wasm-bindgen, and run serverless Wasm on the edge.',
    learningPoints: [
      'Compile Rust crates to Wasm modules with negligible bundle overhead',
      'Manage raw linear memory buffers and zero-copy data passing with JS typed arrays',
      'Leverage SIMD instructions inside browser-based WebAssembly',
      'Deploy portable backend microservices using the WebAssembly System Interface (WASI)',
    ],
    syllabus: [
      {
        id: 'mod_wasm_1',
        module: 1,
        title: 'WebAssembly Core & Binary Format',
        duration: '2 weeks',
        lessons: [
          'Stack Machine Architecture & WAT Text Representation',
          'Wasm Module Structure (Types, Imports, Exports, Tables)',
          'Instantiating Wasm from JavaScript in the Browser',
        ],
      },
      {
        id: 'mod_wasm_2',
        module: 2,
        title: 'Rust to Wasm Toolchain',
        duration: '2.5 weeks',
        lessons: [
          'Rust Tooling: wasm-pack and wasm-bindgen',
          'Linear Memory Layout & String/Struct Marshaling',
          'Web Workers, SharedArrayBuffer & Multithreaded Wasm',
        ],
      },
      {
        id: 'mod_wasm_3',
        module: 3,
        title: 'WASI & Edge Compute',
        duration: '2.5 weeks',
        lessons: [
          'WebAssembly System Interface (WASI) Overview',
          'Wasm Edge Runtimes (Wasmtime & Cloudflare Workers)',
          'Benchmarking Wasm vs Native V8 Execution',
        ],
      },
    ],
  },
  {
    id: 'crs_emg_395',
    title: 'Edge AI & Embedded Systems Intelligence',
    instructor: 'Hana Takahashi',
    category: 'Emerging Tech',
    level: 'Intermediate',
    duration: '8 weeks (32 hrs)',
    rating: 4.8,
    lessonCount: 21,
    description:
      'Optimize, quantize, and deploy neural network models on resource-constrained microcontrollers and edge processors using TensorFlow Lite for Microcontrollers.',
    learningPoints: [
      'Quantize float32 models to int8 precision with post-training quantization',
      'Prune weights and compress model parameters for sub-256KB memory footprint',
      'Deploy audio keyword spotting on ARM Cortex-M devices',
      'Benchmark energy consumption and latency trade-offs on battery devices',
    ],
    syllabus: [
      {
        id: 'mod_edge_1',
        module: 1,
        title: 'Model Compression & Quantization',
        duration: '2.5 weeks',
        lessons: [
          'Constraints of Microcontrollers (RAM vs Flash)',
          'Post-Training Int8 Quantization & Calibration',
          'Weight Pruning & Structured Sparsity',
        ],
      },
      {
        id: 'mod_edge_2',
        module: 2,
        title: 'Embedded Inference Engines',
        duration: '3 weeks',
        lessons: [
          'TensorFlow Lite for Microcontrollers (TFLM) Arena',
          'CMSIS-NN Hardware Acceleration on ARM',
          'Real-Time Sensor Ingestion & Ring Buffering',
        ],
      },
      {
        id: 'mod_edge_3',
        module: 3,
        title: 'Edge Deployment Case Studies',
        duration: '2.5 weeks',
        lessons: [
          'Audio Keyword Spotting Model from Scratch',
          'Micro-Vision Anomaly Detection',
          'Low-Power Sleep Modes & Wake-on-Inference',
        ],
      },
    ],
  },
  {
    id: 'crs_emg_430',
    title: 'Decentralized Protocols & Consensus Algorithms',
    instructor: 'Nico Bell',
    category: 'Emerging Tech',
    level: 'Advanced',
    duration: '9 weeks (36 hrs)',
    rating: 4.85,
    lessonCount: 23,
    description:
      'Analyze peer-to-peer gossip networks, Nakamoto Proof-of-Work, Tendermint Proof-of-Stake, smart contract state machines (EVM), and Layer-2 rollups.',
    learningPoints: [
      'Architect P2P libp2p gossip routing and DHT peer discovery',
      'Compare Nakamoto longest-chain consensus with BFT finality algorithms',
      'Write gas-efficient EVM bytecode and audit reentrancy vulnerabilities',
      'Differentiate between Optimistic Rollups and ZK-Rollup proof circuits',
    ],
    syllabus: [
      {
        id: 'mod_dec_1',
        module: 1,
        title: 'Peer-to-Peer Networks & Merkle Trees',
        duration: '2.5 weeks',
        lessons: [
          'Kademlia Distributed Hash Tables (DHT)',
          'Merkle-Patricia Tries & State Root Verification',
          'Gossip Protocols & Transaction Mempools',
        ],
      },
      {
        id: 'mod_dec_2',
        module: 2,
        title: 'Consensus Mechanics & Fork Resolution',
        duration: '3.5 weeks',
        lessons: [
          'Proof-of-Work Difficulty Adjustment & Sybil Resistance',
          'Proof-of-Stake, Slashing & Casper FFG',
          'Tendermint Core & Deterministic State Machine Replication',
        ],
      },
      {
        id: 'mod_dec_3',
        module: 3,
        title: 'Scaling Paradigms & Layer-2',
        duration: '3 weeks',
        lessons: [
          'EVM Execution Gas Metrics & State Bloat',
          'Optimistic Rollups & Fraud Proofs',
          'Zero-Knowledge Validity Rollups (STARKs/SNARKs)',
        ],
      },
    ],
  },
  {
    id: 'crs_emg_215',
    title: 'Spatial Computing & WebXR Environments',
    instructor: 'Chloe Bennett',
    category: 'Emerging Tech',
    level: 'Beginner',
    duration: '6 weeks (24 hrs)',
    rating: 4.74,
    lessonCount: 18,
    description:
      'Create immersive 3D interactive web spaces using Three.js, WebGL shaders, WebXR device APIs, hand-tracking controllers, and spatial audio.',
    learningPoints: [
      'Render 3D scenes with meshes, lighting, and camera perspectives in Three.js',
      'Initialize immersive VR/AR sessions via the WebXR Device API',
      'Implement 6DoF controller input and hand gesture interaction models',
      'Position positional 3D audio sources using the Web Audio API',
    ],
    syllabus: [
      {
        id: 'mod_xr_1',
        module: 1,
        title: '3D Graphics Fundamentals with Three.js',
        duration: '2 weeks',
        lessons: [
          'Scene Graphs, Matrices & Transformations',
          'Materials, Textures & PBR Lighting Models',
          'Animation Loops & Performance Profiling',
        ],
      },
      {
        id: 'mod_xr_2',
        module: 2,
        title: 'WebXR Device API Integration',
        duration: '2 weeks',
        lessons: [
          'Requesting VR/AR Sessions & Reference Spaces',
          'Stereoscopic Rendering & Frame Rate Optimization',
          'Controller Rays, Teleportation & Hit Testing',
        ],
      },
      {
        id: 'mod_xr_3',
        module: 3,
        title: 'Spatial Audio & Interactions',
        duration: '2 weeks',
        lessons: [
          'Web Audio API Positional Panners & HRTF',
          'Physics Integration with Rapier/Cannon',
          'Deploying Cross-Platform WebXR Experiences',
        ],
      },
    ],
  },

  // ==========================================
  // Category 6: Foundations (5 courses)
  // ==========================================
  {
    id: 'crs_alg_250', // Completed
    title: 'Data Structures & Algorithms II',
    instructor: 'Prof. Julian Reed',
    category: 'Foundations',
    level: 'Beginner',
    duration: '8 weeks (32 hrs)',
    rating: 4.88,
    lessonCount: 28,
    description:
      'Rigorous analysis of asymptotic complexity, balanced search trees, graph traversals, greedy approaches, and dynamic programming formulations.',
    learningPoints: [
      'Prove algorithmic correctness and asymptotic runtime bounds with Master Theorem',
      'Implement Red-Black Trees, Heaps, and Disjoint Set Union (DSU) structures',
      'Solve network flow problems using Ford-Fulkerson and Edmonds-Karp',
      'Formulate multidimensional dynamic programming memoization tables',
    ],
    syllabus: [
      {
        id: 'mod_alg_1',
        module: 1,
        title: 'Asymptotic Analysis & Balanced Trees',
        duration: '2.5 weeks',
        lessons: [
          'Amortized Analysis & The Master Theorem',
          'AVL Trees & Red-Black Tree Rotations',
          'Binary Heaps, Binomial Heaps & Priority Queues',
        ],
      },
      {
        id: 'mod_alg_2',
        module: 2,
        title: 'Advanced Graph Algorithms',
        duration: '3 weeks',
        lessons: [
          'Topological Sorting & Strongly Connected Components (Tarjan’s)',
          'Minimum Spanning Trees (Kruskal & Prim with DSU)',
          'Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall)',
          'Maximum Bipartite Matching & Network Flow',
        ],
      },
      {
        id: 'mod_alg_3',
        module: 3,
        title: 'Dynamic Programming Paradigms',
        duration: '2.5 weeks',
        lessons: [
          'Optimal Substructure & Overlapping Subproblems',
          'Knapsack Variants & Longest Common Subsequence',
          'Bitmask Dynamic Programming & State Compression',
        ],
      },
    ],
  },
  {
    id: 'crs_math_220', // Completed
    title: 'Discrete Mathematical Structures',
    instructor: 'Dr. Priya Sharma',
    category: 'Foundations',
    level: 'Beginner',
    duration: '6 weeks (24 hrs)',
    rating: 4.79,
    lessonCount: 20,
    description:
      'Essential mathematical foundations for computer scientists: propositional logic, mathematical induction, combinatorics, relations, and basic graph theory.',
    learningPoints: [
      'Construct formal mathematical proofs via contradiction and strong induction',
      'Calculate permutations, combinations, and generating functions',
      'Analyze equivalence relations, partial orders, and lattices',
      'Apply modular arithmetic and Fermat’s Little Theorem to cryptography',
    ],
    syllabus: [
      {
        id: 'mod_math_1',
        module: 1,
        title: 'Logic & Proof Techniques',
        duration: '2 weeks',
        lessons: [
          'Propositional & Predicate Calculus',
          'Direct Proofs, Contrapositive & Contradiction',
          'Well-Ordering Principle & Strong Induction',
        ],
      },
      {
        id: 'mod_math_2',
        module: 2,
        title: 'Combinatorics & Probability',
        duration: '2 weeks',
        lessons: [
          'Pigeonhole Principle & Inclusion-Exclusion',
          'Binomial Coefficients & Pascal’s Identity',
          'Discrete Probability & Bayes’ Rule',
        ],
      },
      {
        id: 'mod_math_3',
        module: 3,
        title: 'Relations, Graphs & Number Theory',
        duration: '2 weeks',
        lessons: [
          'Equivalence Relations & Partitions',
          'Eulerian and Hamiltonian Graph Circuits',
          'Euclidean Algorithm & Modular Inverses',
        ],
      },
    ],
  },
  {
    id: 'crs_fnd_110',
    title: 'Algorithmic Complexity & Computability Theory',
    instructor: 'Prof. Alan Bradley',
    category: 'Foundations',
    level: 'Intermediate',
    duration: '7 weeks (28 hrs)',
    rating: 4.72,
    lessonCount: 19,
    description:
      'Explore the boundaries of computation: deterministic/nondeterministic Turing machines, the Halting problem, NP-completeness, and polynomial reductions.',
    learningPoints: [
      'Model computation using Finite State Automata, Pushdown Automata, and Turing Machines',
      'Prove undecidability using Rice’s theorem and reduction from the Halting problem',
      'Categorize problems into complexity classes P, NP, NP-Complete, and PSPACE',
      'Design polynomial-time reductions for 3-SAT, Clique, and Vertex Cover',
    ],
    syllabus: [
      {
        id: 'mod_comp_1',
        module: 1,
        title: 'Automata & Formal Languages',
        duration: '2.5 weeks',
        lessons: [
          'DFA, NFA & Regular Expressions Equivalence',
          'Pumping Lemma for Regular Languages',
          'Context-Free Grammars & Pushdown Automata',
        ],
      },
      {
        id: 'mod_comp_2',
        module: 2,
        title: 'Turing Machines & Computability',
        duration: '2.5 weeks',
        lessons: [
          'Turing Machine Formalization & Church-Turing Thesis',
          'Decidability vs Semi-Decidability',
          'The Halting Problem & Undecidable Languages',
        ],
      },
      {
        id: 'mod_comp_3',
        module: 3,
        title: 'Complexity Classes & Reductions',
        duration: '2 weeks',
        lessons: [
          'Time and Space Complexity Classes (P, NP, PSPACE)',
          'Cook-Levin Theorem & SAT Completeness',
          'Polynomial Reductions across Classic NP Problems',
        ],
      },
    ],
  },
  {
    id: 'crs_fnd_320',
    title: 'Software Architecture & Microservice Patterns',
    instructor: 'Amara Okafor',
    category: 'Foundations',
    level: 'Intermediate',
    duration: '8 weeks (32 hrs)',
    rating: 4.86,
    lessonCount: 22,
    description:
      'Design scalable decoupled enterprise software using Domain-Driven Design (DDD), CQRS, Event Sourcing, Saga orchestration, and hexagonal architecture.',
    learningPoints: [
      'Decompose monoliths into bounded contexts following Domain-Driven Design',
      'Implement Command Query Responsibility Segregation (CQRS) with event projections',
      'Manage distributed transactions with Saga orchestrators and choreographies',
      'Structure clean backends using hexagonal/ports-and-adapters architecture',
    ],
    syllabus: [
      {
        id: 'mod_arch_1',
        module: 1,
        title: 'Domain-Driven Design (DDD)',
        duration: '2.5 weeks',
        lessons: [
          'Strategic Design: Ubiquitous Language & Bounded Contexts',
          'Tactical Patterns: Aggregates, Entities, Value Objects',
          'Hexagonal Architecture (Ports and Adapters)',
        ],
      },
      {
        id: 'mod_arch_2',
        module: 2,
        title: 'Event Sourcing & CQRS',
        duration: '3 weeks',
        lessons: [
          'Event Sourcing Storage & Aggregate Rehydration',
          'CQRS Read Models & Asynchronous Projections',
          'Handling Idempotency & Out-of-Order Events',
        ],
      },
      {
        id: 'mod_arch_3',
        module: 3,
        title: 'Distributed Transaction Patterns',
        duration: '2.5 weeks',
        lessons: [
          'The Outbox Pattern & Reliable Messaging',
          'Saga Orchestration vs Choreography',
          'API Gateway Patterns, Circuit Breakers & Rate Limiting',
        ],
      },
    ],
  },
  {
    id: 'crs_fnd_440',
    title: 'Formal Verification & Program Correctness',
    instructor: 'Dr. Henrik Lindqvist',
    category: 'Foundations',
    level: 'Advanced',
    duration: '9 weeks (36 hrs)',
    rating: 4.89,
    lessonCount: 23,
    description:
      'Prove that mission-critical software never crashes using Hoare logic, SAT/SMT solvers (Z3), TLA+ specification modeling, and Coq/Lean interactive proof assistants.',
    learningPoints: [
      'Write formal pre/post-conditions and loop invariants using Hoare logic',
      'Model and verify concurrent protocol safety and liveness in TLA+',
      'Solve constraint satisfaction problems using the Z3 SMT solver',
      'Verify functional program correctness interactively using theorem provers',
    ],
    syllabus: [
      {
        id: 'mod_ver_1',
        module: 1,
        title: 'Hoare Logic & Axiomatic Semantics',
        duration: '2.5 weeks',
        lessons: [
          'Hoare Triples & Weakest Precondition Calculus',
          'Proving Loop Invariants & Termination Functions',
          'Deductive Verification with Dafny',
        ],
      },
      {
        id: 'mod_ver_2',
        module: 2,
        title: 'Model Checking with TLA+',
        duration: '3.5 weeks',
        lessons: [
          'State Machines, Actions & Temporal Logic',
          'Specifying Concurrent Mutual Exclusion in TLA+',
          'Model Checking Invariants & Counterexample Traces',
          'Liveness, Fairness & Stuttering Invariance',
        ],
      },
      {
        id: 'mod_ver_3',
        module: 3,
        title: 'SMT Solvers & Interactive Provers',
        duration: '3 weeks',
        lessons: [
          'DPLL(T) & Satisfiability Modulo Theories (SMT)',
          'Automating Proof Obligations with Z3',
          'Interactive Theorem Proving Foundations (Lean/Coq)',
        ],
      },
    ],
  },
]

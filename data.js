'use strict';

const CHAPTERS = [
  { id: 'setup', icon: '📦', title: 'Setup the Provider', desc: 'Install the package and understand what it gives you.', color: 'purple', type: 'terminal', meta: '4 steps' },
  { id: 'connections', icon: '🔌', title: 'Configure Connection', desc: 'Wire the pydanticai connection to call any LLM.', color: 'teal', type: 'wiring', meta: '5 pairs' },
  { id: 'pipelines', icon: '🔀', title: 'Build the Pipelines', desc: 'Select operators to complete 5 AI pipeline patterns.', color: 'green', type: 'dag-builder', meta: '5 pipelines' },
  { id: 'toolsets', icon: '🧰', title: 'Equip the Agent', desc: 'Match each toolset to the scenario where it belongs.', color: 'blue', type: 'wiring', meta: '4 pairs' },
  { id: 'features', icon: '✨', title: 'Production Features', desc: 'Wire HITL, durable execution, and safety features.', color: 'gold', type: 'wiring', meta: '4 pairs' },
];

const EXPLANATIONS = {
  setup: {
    eyebrow: 'Mission 01', title: 'The Common AI Provider',
    sub: 'A brand new Airflow provider for building production AI pipelines. One package, every LLM.',
    doc: { label: 'Provider overview', url: 'https://airflow.apache.org/docs/apache-airflow-providers-common-ai/stable/index.html' },
    cards: [
      { icon: '📦', title: 'One Package', desc: 'apache-airflow-providers-common-ai replaces individual LLM provider packages' },
      { icon: '🔧', title: 'PydanticAI', desc: 'Built on the PydanticAI framework for structured, type-safe LLM calls' },
      { icon: '🌐', title: '20+ Providers', desc: 'OpenAI, Anthropic, Google, AWS Bedrock, Groq, Ollama, and more' },
      { icon: '⚡', title: '6 Operators', desc: '@task.llm, @task.agent, @task.llm_branch, @task.llm_sql, and more' },
    ],
  },
  connections: {
    eyebrow: 'Mission 02', title: 'Airflow Connections',
    sub: 'With the common-ai provider, LLM configuration lives in Airflow connections, not in your code.',
    doc: { label: 'Connection guide', url: 'https://airflow.apache.org/docs/apache-airflow-providers-common-ai/stable/connections/index.html' },
    cards: [
      { icon: '🔌', title: 'pydanticai Type', desc: 'A new connection type that works with every supported LLM provider' },
      { icon: '🏷️', title: 'Model Format', desc: 'provider:model-name format, e.g. openai:gpt-5 or anthropic:claude-sonnet-4-20250514' },
      { icon: '🔑', title: 'API Key', desc: 'Goes in the Password field. Leave empty for env-based auth (Bedrock, Vertex)' },
      { icon: '🌐', title: 'Custom Endpoints', desc: 'Set the Host field for Ollama, vLLM, or Azure OpenAI-compatible endpoints' },
    ],
    code: {
      label: 'Example: set up via environment variable',
      html: `<span class="hl-env">AIRFLOW_CONN_PYDANTICAI_DEFAULT</span>=<span class="hl-str">'{
  "<span class="hl-key">conn_type</span>": "<span class="hl-val">pydanticai</span>",
  "<span class="hl-key">password</span>": "<span class="hl-val">sk-...</span>",
  "<span class="hl-key">extra</span>": {
    "<span class="hl-key">model</span>": "<span class="hl-val">openai:gpt-5</span>"
  }
}'</span>`,
    },
  },
  pipelines: {
    eyebrow: 'Mission 03', title: 'The Operators',
    sub: 'Six operators for different AI patterns. Each one maps to a specific use case in your Dags.',
    doc: { label: 'Operators reference', url: 'https://airflow.apache.org/docs/apache-airflow-providers-common-ai/stable/operators/index.html' },
    table: [
      { op: 'LLMOperator', dec: '@task.llm', when: 'Single prompt to text or structured output' },
      { op: 'LLMFileAnalysisOperator', dec: '@task.llm_file_analysis', when: 'Reason over PDFs, images, text files' },
      { op: 'LLMBranchOperator', dec: '@task.llm_branch', when: 'LLM picks which downstream task runs' },
      { op: 'LLMSQLQueryOperator', dec: '@task.llm_sql', when: 'Natural language to SQL (no execution)' },
      { op: 'LLMSchemaCompareOperator', dec: '@task.llm_schema_compare', when: 'Compare schemas across database systems' },
      { op: 'AgentOperator', dec: '@task.agent', when: 'Multi-turn reasoning with tools' },
    ],
  },
  toolsets: {
    eyebrow: 'Mission 04', title: 'Toolsets',
    sub: 'Agents are only as useful as their tools. Four toolsets give @task.agent real-world capabilities.',
    doc: { label: 'Toolsets guide', url: 'https://airflow.apache.org/docs/apache-airflow-providers-common-ai/stable/operators/index.html' },
    cards: [
      { icon: '🗄️', title: 'SQLToolset', desc: 'list_tables, get_schema, query, check_query on any database connection' },
      { icon: '🔧', title: 'HookToolset', desc: "Wraps any Airflow Hook's methods as agent tools via introspection" },
      { icon: '🔗', title: 'MCPToolset', desc: 'Connects to external Model Context Protocol servers' },
      { icon: '📁', title: 'DataFusionToolset', desc: 'Query files on S3 or local storage via Apache DataFusion' },
    ],
  },
  features: {
    eyebrow: 'Mission 05', title: 'Production Features',
    sub: 'Ship AI pipelines with confidence. These features handle approval, resilience, and safety.',
    doc: { label: 'HITL & durable execution', url: 'https://airflow.apache.org/docs/apache-airflow-providers-common-ai/stable/operators/index.html' },
    cards: [
      { icon: '👤', title: 'require_approval', desc: 'Pause after LLM output for human approve, reject, or modify' },
      { icon: '🔄', title: 'enable_hitl_review', desc: 'Iterative review loop on agents with max iterations and timeout' },
      { icon: '💾', title: 'durable=True', desc: 'Cache each agent step to ObjectStorage. On retry, replay from cache.' },
      { icon: '🛡️', title: 'allowed_tables', desc: 'Metadata filter for SQLToolset. Not a security control, use DB permissions.' },
    ],
  },
};

const SETUP_QUESTIONS = [
  {
    title: 'Add the Package', file: 'requirements.txt',
    terminal: '<span class="t-comment"># requirements.txt</span>\napache-airflow>=3.0.0\n___',
    answer: 'apache-airflow-providers-common-ai',
    options: ['apache-airflow-providers-common-ai', 'airflow-ai-provider', 'pydantic-ai', 'apache-airflow-providers-openai'],
    explain: 'The package is apache-airflow-providers-common-ai. It wraps PydanticAI and supports all major LLM providers.',
  },
  {
    title: 'Choose the Extras', file: 'terminal',
    terminal: '<span class="t-comment"># Your project uses OpenAI models.</span>\n<span class="t-comment"># Install only what you need:</span>\n\n<span class="t-comment">$</span> pip install apache-airflow-providers-common-ai___',
    answer: '[openai]',
    options: ['[openai]', '[gpt]', '[llm]', '[models]'],
    explain: 'Each provider has its own extra: [openai], [anthropic], [google], [bedrock]. Install only what your project needs.',
  },
  {
    title: 'Minimum Airflow Version', file: 'compatibility.md',
    terminal: '<span class="t-comment"># Provider Compatibility</span>\n<span class="t-comment"># Requires Apache Airflow version:</span>\n___',
    answer: '3.0+',
    options: ['3.0+', '2.8+', '2.5+', '3.2+'],
    explain: 'The common-ai provider requires Apache Airflow 3.0 or later and Python 3.10 to 3.14.',
  },
  {
    title: 'The Framework', file: 'architecture.md',
    terminal: '<span class="t-comment"># Architecture</span>\n<span class="t-comment"># The provider is built on:</span>\n___\n<span class="t-comment"># for structured LLM interactions</span>',
    answer: 'PydanticAI',
    options: ['PydanticAI', 'LangChain', 'LlamaIndex', 'CrewAI'],
    explain: 'Built on PydanticAI (pydantic-ai-slim >= 1.34.0) for type-safe, structured LLM interactions.',
  },
];

const WIRE_DATA = {
  connections: {
    title: 'Wire the Connection', desc: 'Match each connection field to its correct value.',
    eyebrow: 'Mission 02', color: 'teal',
    pairs: [
      { l: { id: 'ct', name: 'Connection Type' }, r: { id: 'ct', name: 'pydanticai' } },
      { l: { id: 'mf', name: 'Model Format' }, r: { id: 'mf', name: 'openai:gpt-5' } },
      { l: { id: 'ak', name: 'API Key Location' }, r: { id: 'ak', name: 'Password field' } },
      { l: { id: 'ci', name: 'Default Conn ID' }, r: { id: 'ci', name: 'pydanticai_default' } },
      { l: { id: 'ep', name: 'Custom Endpoint' }, r: { id: 'ep', name: 'Host field' } },
    ],
  },
  toolsets: {
    title: 'Equip the Agent', desc: 'Match each toolset to the scenario where it belongs.',
    eyebrow: 'Mission 04', color: 'blue',
    pairs: [
      { l: { id: 'sql', name: 'SQLToolset' }, r: { id: 'sql', name: 'Query a database, list tables, run SELECTs' } },
      { l: { id: 'hook', name: 'HookToolset' }, r: { id: 'hook', name: "Wrap any Airflow Hook's methods as tools" } },
      { l: { id: 'mcp', name: 'MCPToolset' }, r: { id: 'mcp', name: 'Connect to an external MCP server' } },
      { l: { id: 'df', name: 'DataFusionToolset' }, r: { id: 'df', name: 'Query Parquet files on S3 as tables' } },
    ],
  },
  features: {
    title: 'Production Features', desc: 'Wire each production feature to what it actually does.',
    eyebrow: 'Mission 05', color: 'gold',
    pairs: [
      { l: { id: 'dur', name: 'durable=True' }, r: { id: 'dur', name: 'Cache agent steps for retry resilience' } },
      { l: { id: 'hitl', name: 'enable_hitl_review' }, r: { id: 'hitl', name: 'Iterative human review loop on agents' } },
      { l: { id: 'app', name: 'require_approval' }, r: { id: 'app', name: 'Pause after LLM output for approve / reject' } },
      { l: { id: 'at', name: 'allowed_tables' }, r: { id: 'at', name: 'Metadata filter, not a security mechanism' } },
    ],
  },
};

const DAG_SCENARIOS = [
  {
    title: 'Classify Support Tickets',
    desc: 'The support team needs automated ticket classification into structured categories.',
    hint: 'One LLM call, structured Pydantic output, no tools.',
    nodes: [
      { type: 'io', label: 'INPUT', sub: 'Support Ticket' },
      { type: 'slot', id: 's1', correct: 'task_llm', options: [
        { id: 'task_llm', label: '@task.llm', desc: 'Single LLM call, structured output' },
        { id: 'task_agent', label: '@task.agent', desc: 'Multi-turn agent with tool loop' },
        { id: 'task_llm_sql', label: '@task.llm_sql', desc: 'Natural language to SQL' },
      ] },
      { type: 'io', label: 'OUTPUT', sub: 'Category', isOutput: true },
    ],
    explain: '@task.llm handles single-turn calls. Pass a Pydantic model as output_type for structured results.',
  },
  {
    title: 'Route to the Right Team',
    desc: 'After classification, route tickets to billing or tech support automatically.',
    hint: 'The LLM should choose which downstream task to run.',
    nodes: [
      { type: 'io', label: 'INPUT', sub: 'Support Ticket' },
      { type: 'op', label: '@task.llm', sub: 'Classify' },
      { type: 'slot', id: 's1', correct: 'task_llm_branch', options: [
        { id: 'task_llm_branch', label: '@task.llm_branch', desc: 'LLM picks which task runs next' },
        { id: 'task_llm', label: '@task.llm', desc: 'Single LLM call, structured output' },
        { id: 'task_file', label: '@task.llm_file_analysis', desc: 'Analyze files from storage' },
      ] },
    ],
    branches: [{ label: 'Billing', sub: 'Team' }, { label: 'Tech Support', sub: 'Team' }],
    explain: '@task.llm_branch auto-discovers downstream task IDs and constrains the LLM to pick from them.',
  },
  {
    title: 'Data Warehouse Explorer',
    desc: 'Let users ask questions about the data warehouse in plain English.',
    hint: 'Needs multiple tool calls to explore schema and run queries.',
    nodes: [
      { type: 'io', label: 'INPUT', sub: 'User Question' },
      { type: 'slot', id: 's1', correct: 'task_agent', toolset: 'SQLToolset', options: [
        { id: 'task_agent', label: '@task.agent', desc: 'Multi-turn agent with tool loop' },
        { id: 'task_llm', label: '@task.llm', desc: 'Single LLM call, structured output' },
        { id: 'task_llm_branch', label: '@task.llm_branch', desc: 'LLM picks which task runs next' },
      ] },
      { type: 'io', label: 'OUTPUT', sub: 'Answer', isOutput: true },
    ],
    explain: '@task.agent runs a multi-turn loop. SQLToolset gives it list_tables, get_schema, and query tools.',
  },
  {
    title: 'Natural Language to SQL',
    desc: 'Product managers want to query data without writing SQL.',
    hint: 'Generate and validate SQL, but do not execute it in the same step.',
    nodes: [
      { type: 'io', label: 'INPUT', sub: 'NL Question' },
      { type: 'slot', id: 's1', correct: 'task_llm_sql', options: [
        { id: 'task_llm_sql', label: '@task.llm_sql', desc: "Generate and validate SQL, don't execute" },
        { id: 'task_llm', label: '@task.llm', desc: 'Single LLM call, structured output' },
        { id: 'task_agent', label: '@task.agent', desc: 'Multi-turn agent with tool loop' },
      ] },
      { type: 'fixed', label: 'SQLExecuteQuery', sub: 'Run Query' },
      { type: 'io', label: 'OUTPUT', sub: 'Query Results', isOutput: true },
    ],
    explain: '@task.llm_sql generates and validates SQL but never runs it. Chain to SQLExecuteQueryOperator.',
  },
  {
    title: 'PDF Report Analysis',
    desc: 'Finance needs key metrics extracted from quarterly PDF reports on S3.',
    hint: 'Reads files from object storage. Supports PDFs, images, CSVs.',
    nodes: [
      { type: 'io', label: 'INPUT', sub: 'S3 PDFs' },
      { type: 'slot', id: 's1', correct: 'task_file', options: [
        { id: 'task_file', label: '@task.llm_file_analysis', desc: 'Analyze files from object storage' },
        { id: 'task_agent', label: '@task.agent', desc: 'Multi-turn agent with tool loop' },
        { id: 'task_llm_sql', label: '@task.llm_sql', desc: 'Natural language to SQL' },
      ] },
      { type: 'op', label: '@task.llm', sub: 'Summarize' },
      { type: 'io', label: 'OUTPUT', sub: 'Report Summary', isOutput: true },
    ],
    explain: '@task.llm_file_analysis resolves paths via ObjectStoragePath. Enable multi_modal=True for PDFs and images.',
  },
];

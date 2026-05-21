import { useMemo, useRef, useState } from 'react';

const conversations = [
  { title: 'Contract labour compliance', meta: 'Updated now' },
  { title: 'Gratuity eligibility', meta: '2 references' },
  { title: 'Minimum wages query', meta: 'Draft answer' },
  { title: 'Factory overtime limits', meta: 'Last week' },
];

const quickPrompts = [
  'Summarize key labour law obligations for a new contractor.',
  'What records should an employer maintain for wage compliance?',
  'Explain gratuity eligibility with citations.',
];

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content:
      'Hello. I can help you reason through Indian labour law questions, summarize provisions, and surface source-backed answers from your knowledge base.',
    sources: [
      {
        title: 'Industrial Disputes Act, 1947',
        detail: 'Section reference extracted from indexed labour law material.',
        score: '92%',
      },
      {
        title: 'Code on Wages, 2019',
        detail: 'Relevant wage, deduction, and payment guidance.',
        score: '88%',
      },
    ],
  },
];

const exampleAnswer = {
  id: 3,
  role: 'assistant',
  content:
    'Based on the indexed material, start by identifying the establishment type, worker category, applicable state rules, and the specific compliance period. For a reliable answer, I would cite the provision, explain the obligation in plain language, and call out any threshold or exception that changes the result.',
  sources: [
    {
      title: 'Contract Labour Regulation Guidance',
      detail: 'Registration, licensing, principal employer duties, and records.',
      score: '94%',
    },
    {
      title: 'Shops and Establishments Reference',
      detail: 'Working hours, weekly holidays, and state-specific obligations.',
      score: '86%',
    },
  ],
};

function Icon({ children }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-teal-200">
      {children}
    </span>
  );
}

function Sidebar() {
  return (
    <aside className="hidden h-screen w-80 shrink-0 border-r border-slate-800 bg-slate-950/80 p-4 backdrop-blur xl:block">
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center gap-3">
          <Icon>AI</Icon>
          <div>
            <p className="text-sm font-semibold text-white">Labour Law AI</p>
            <p className="text-xs text-slate-400">Research assistant</p>
          </div>
        </div>

        <button className="mb-5 flex w-full items-center justify-center rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-950/30 transition hover:bg-teal-300">
          New legal query
        </button>

        <div className="space-y-2">
          <p className="px-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>
          {conversations.map((item, index) => (
            <button
              className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                index === 0
                  ? 'border-teal-400/40 bg-teal-400/10'
                  : 'border-transparent bg-transparent hover:border-slate-800 hover:bg-slate-900'
              }`}
              key={item.title}
            >
              <span className="block truncate text-sm font-medium text-slate-100">
                {item.title}
              </span>
              <span className="mt-1 block text-xs text-slate-500">{item.meta}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold text-slate-100">Citation mode</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Answers are designed to show supporting source cards before you rely on
            them.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur lg:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-teal-200 ring-1 ring-slate-700 xl:hidden">
            AI
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              AI Labour Law Assistant
            </h1>
            <p className="text-xs text-slate-400">
              Ask, verify, and cite from your labour law knowledge base
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Ready
        </div>
      </div>
    </header>
  );
}

function SourceCards({ sources }) {
  if (!sources?.length) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {sources.map((source) => (
        <article
          className="rounded-lg border border-slate-700/80 bg-slate-950/70 p-3 shadow-sm"
          key={source.title}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-100">{source.title}</h3>
            <span className="rounded-full bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-200">
              {source.score}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">{source.detail}</p>
        </article>
      ))}
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <Icon>LL</Icon>}
      <div
        className={`max-w-3xl rounded-xl px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? 'bg-teal-400 text-slate-950'
            : 'border border-slate-800 bg-slate-900/80 text-slate-100'
        }`}
      >
        <p>{message.content}</p>
        <SourceCards sources={message.sources} />
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex gap-3">
      <Icon>LL</Icon>
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal-300 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-300" />
          <span className="ml-2 text-xs text-slate-400">Reviewing sources</span>
        </div>
      </div>
    </div>
  );
}

function PromptRail({ onPrompt }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {quickPrompts.map((prompt) => (
        <button
          className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-left text-xs leading-5 text-slate-300 transition hover:border-teal-400/50 hover:bg-slate-900"
          key={prompt}
          onClick={() => onPrompt(prompt)}
          type="button"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

function Composer({ disabled, onSend }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    textareaRef.current?.focus();
  }

  return (
    <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/30 focus-within:border-teal-400/70">
          <textarea
            className="max-h-40 min-h-14 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
            disabled={disabled}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about compliance, wages, contracts, gratuity, disputes..."
            ref={textareaRef}
            rows={2}
            value={value}
          />
          <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-3 pt-2">
            <p className="hidden text-xs text-slate-500 sm:block">
              Source-backed responses. Press Enter to send.
            </p>
            <button
              className="ml-auto rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-100 disabled:opacity-50"
              disabled={disabled || !value.trim()}
              onClick={submit}
              type="button"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(
    () => [
      { label: 'Indexed sources', value: 'Labour law corpus' },
      { label: 'Answer style', value: 'Plain English + citations' },
      { label: 'Use case', value: 'Compliance research' },
    ],
    [],
  );

  function handleSend(text) {
    const userMessage = { id: Date.now(), role: 'user', content: text };
    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { ...exampleAnswer, id: Date.now() + 1 },
      ]);
      setIsLoading(false);
    }, 900);
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-100">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <Header />

        <section className="thin-scrollbar flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="grid gap-3 md:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <PromptRail onPrompt={handleSend} />

            <div className="mt-6 space-y-5 pb-6">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isLoading && <LoadingMessage />}
            </div>
          </div>
        </section>

        <Composer disabled={isLoading} onSend={handleSend} />
      </main>
    </div>
  );
}

export default App;

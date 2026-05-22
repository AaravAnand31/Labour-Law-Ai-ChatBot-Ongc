import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const CHAT_STORAGE_KEY = 'labour-law-ai-conversations';
const THEME_STORAGE_KEY = 'labour-law-ai-theme';
const BRAND_LOGO_SRC = '/labor-law-agent-logo.png';

const quickPrompts = [
  'Summarize key labour law obligations for a new contractor.',
  'What records should an employer maintain for wage compliance?',
  'Explain gratuity eligibility with citations.',
];

const welcomeMessage = {
  id: 'welcome',
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
};

const starterConversation = {
  id: 'starter',
  title: 'New labour law query',
  updatedAt: new Date().toISOString(),
  messages: [welcomeMessage],
};

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

function loadConversations() {
  if (typeof window === 'undefined') return [starterConversation];

  try {
    const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : [starterConversation];
  } catch {
    return [starterConversation];
  }
}

function formatTime(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function buildTitle(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'New labour law query';
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned;
}

function getThemeClasses(theme) {
  const isDark = theme === 'dark';

  return {
    app: isDark
      ? 'bg-slate-950 text-slate-100'
      : 'bg-slate-100 text-slate-950',
    sidebar: isDark
      ? 'border-slate-800 bg-slate-950/85'
      : 'border-slate-200 bg-white/90',
    panel: isDark
      ? 'border-slate-800 bg-slate-900/70'
      : 'border-slate-200 bg-white/85',
    mutedPanel: isDark
      ? 'border-slate-800 bg-slate-900/50'
      : 'border-slate-200 bg-white/70',
    text: isDark ? 'text-white' : 'text-slate-950',
    muted: isDark ? 'text-slate-400' : 'text-slate-500',
    subtle: isDark ? 'text-slate-500' : 'text-slate-400',
    border: isDark ? 'border-slate-800' : 'border-slate-200',
    icon: isDark
      ? 'border-slate-700 bg-slate-900/80 text-teal-200'
      : 'border-slate-200 bg-white text-teal-700',
    header: isDark
      ? 'border-slate-800 bg-slate-950/75'
      : 'border-slate-200 bg-white/75',
    assistant: isDark
      ? 'border-slate-800 bg-slate-900/85 text-slate-100'
      : 'border-slate-200 bg-white text-slate-800',
    prompt: isDark
      ? 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-900'
      : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white',
    input: isDark
      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500'
      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400',
    composer: isDark
      ? 'border-slate-800 bg-slate-950/85'
      : 'border-slate-200 bg-slate-50/90',
  };
}

function Icon({ children, themeClasses }) {
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm transition-colors duration-300 ${themeClasses.icon}`}
    >
      {children}
    </span>
  );
}

function BrandLogo({ themeClasses }) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border bg-white p-1 shadow-sm transition-colors duration-300 ${themeClasses.icon}`}
    >
      <img
        alt="Labor Law Agent logo"
        className="h-full w-full object-contain"
        src={BRAND_LOGO_SRC}
      />
    </span>
  );
}

function ThemeToggle({ theme, onToggle, themeClasses }) {
  const isDark = theme === 'dark';

  return (
    <button
      aria-label="Toggle theme"
      className={`grid h-10 w-10 place-items-center rounded-lg border text-lg shadow-sm transition-all duration-300 hover:border-teal-400/60 ${themeClasses.panel}`}
      onClick={onToggle}
      type="button"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☾' : '☀'}
    </button>
  );
}

function Sidebar({
  activeId,
  conversations,
  onNewConversation,
  onSelectConversation,
  themeClasses,
}) {
  return (
    <aside
      className={`hidden h-screen w-80 shrink-0 border-r p-4 backdrop-blur transition-colors duration-300 xl:block ${themeClasses.sidebar}`}
    >
      <div className="flex h-full flex-col">
        <div className="mb-6 flex items-center gap-3">
          <BrandLogo themeClasses={themeClasses} />
          <div>
            <p className={`text-sm font-semibold ${themeClasses.text}`}>
              Labour Law AI
            </p>
            <p className={`text-xs ${themeClasses.muted}`}>Research assistant</p>
          </div>
        </div>

        <button
          className="mb-5 flex w-full items-center justify-center rounded-lg bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-950/20 transition hover:bg-teal-300"
          onClick={onNewConversation}
          type="button"
        >
          New legal query
        </button>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
          <p
            className={`px-2 text-xs font-medium uppercase tracking-[0.2em] ${themeClasses.subtle}`}
          >
            Previous chats
          </p>
          {conversations.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors duration-300 ${
                  isActive
                    ? 'border-teal-400/50 bg-teal-400/10'
                    : `border-transparent hover:border-teal-400/30 ${themeClasses.prompt}`
                }`}
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                type="button"
              >
                <span className={`block truncate text-sm font-medium ${themeClasses.text}`}>
                  {item.title}
                </span>
                <span className={`mt-1 block text-xs ${themeClasses.muted}`}>
                  {formatTime(item.updatedAt)}
                </span>
              </button>
            );
          })}
        </div>

        <div className={`mt-4 rounded-lg border p-4 ${themeClasses.panel}`}>
          <p className={`text-sm font-semibold ${themeClasses.text}`}>Citation mode</p>
          <p className={`mt-2 text-xs leading-5 ${themeClasses.muted}`}>
            Answers are designed to show supporting source cards before you rely on
            them.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Header({
  activeConversation,
  conversations,
  onNewConversation,
  onSelectConversation,
  onToggleTheme,
  theme,
  themeClasses,
}) {
  return (
    <header
      className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur transition-colors duration-300 lg:px-8 ${themeClasses.header}`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="xl:hidden">
            <BrandLogo themeClasses={themeClasses} />
          </div>
          <div className="min-w-0">
            <h1 className={`truncate text-base font-semibold sm:text-lg ${themeClasses.text}`}>
              AI Labour Law Assistant
            </h1>
            <p className={`truncate text-xs ${themeClasses.muted}`}>
              {activeConversation.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            className={`hidden max-w-56 rounded-lg border px-3 py-2 text-xs outline-none transition-colors duration-300 sm:block xl:hidden ${themeClasses.input}`}
            onChange={(event) => onSelectConversation(event.target.value)}
            value={activeConversation.id}
          >
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.title}
              </option>
            ))}
          </select>
          <button
            className="hidden rounded-lg border border-teal-400/40 px-3 py-2 text-xs font-semibold text-teal-500 transition hover:bg-teal-400/10 sm:block xl:hidden"
            onClick={onNewConversation}
            type="button"
          >
            New
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Ready
          </div>
          <ThemeToggle
            onToggle={onToggleTheme}
            theme={theme}
            themeClasses={themeClasses}
          />
        </div>
      </div>
    </header>
  );
}

function SourceCards({ sources, themeClasses }) {
  if (!sources?.length) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {sources.map((source, index) => (
        <article
          className={`rounded-lg border p-3 shadow-sm transition-colors duration-300 ${themeClasses.mutedPanel}`}
          key={`${source.title}-${index}`}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className={`text-sm font-semibold ${themeClasses.text}`}>
              {source.title}
            </h3>
            <span className="rounded-full bg-amber-300/15 px-2 py-1 text-xs font-semibold text-amber-500">
              {source.score}
            </span>
          </div>
          <p className={`mt-2 text-xs leading-5 ${themeClasses.muted}`}>
            {source.detail}
          </p>
        </article>
      ))}
    </div>
  );
}

function MarkdownContent({ content, isUser, themeClasses }) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className={`mb-3 mt-1 text-xl font-semibold ${themeClasses.text}`}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={`mb-2 mt-4 text-lg font-semibold ${themeClasses.text}`}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={`mb-2 mt-3 text-base font-semibold ${themeClasses.text}`}>
            {children}
          </h3>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
        ),
        code: ({ children }) => (
          <code className="rounded bg-slate-950/80 px-1.5 py-0.5 text-[0.85em] text-teal-200">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-3 overflow-x-auto rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function Message({ message, themeClasses }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <Icon themeClasses={themeClasses}>LL</Icon>}
      <div
        className={`max-w-3xl rounded-xl px-4 py-3 text-sm leading-6 shadow-sm transition-colors duration-300 ${
          isUser
            ? 'bg-teal-400 text-slate-950'
            : `border ${themeClasses.assistant}`
        }`}
      >
        <MarkdownContent
          content={message.content}
          isUser={isUser}
          themeClasses={themeClasses}
        />
        <SourceCards sources={message.sources} themeClasses={themeClasses} />
      </div>
    </div>
  );
}

function LoadingMessage({ themeClasses }) {
  return (
    <div className="flex gap-3">
      <Icon themeClasses={themeClasses}>LL</Icon>
      <div
        className={`rounded-xl border px-4 py-4 shadow-sm transition-colors duration-300 ${themeClasses.assistant}`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal-300 [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-sky-300 [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-amber-300" />
          <span className={`ml-2 animate-pulse text-xs ${themeClasses.muted}`}>
            Thinking...
          </span>
        </div>
      </div>
    </div>
  );
}

function PromptRail({ onPrompt, themeClasses }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {quickPrompts.map((prompt) => (
        <button
          className={`rounded-lg border p-3 text-left text-xs leading-5 shadow-sm transition-colors duration-300 hover:border-teal-400/50 ${themeClasses.prompt}`}
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

function Composer({ disabled, onSend, themeClasses }) {
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
    <div
      className={`border-t px-4 py-4 backdrop-blur transition-colors duration-300 lg:px-8 ${themeClasses.composer}`}
    >
      <div className="mx-auto max-w-5xl">
        <div
          className={`rounded-xl border p-2 shadow-2xl shadow-black/10 transition-colors duration-300 focus-within:border-teal-400/70 ${themeClasses.input}`}
        >
          <textarea
            className="max-h-40 min-h-14 w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none"
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
          <div className={`flex items-center justify-between gap-3 border-t px-3 pt-2 ${themeClasses.border}`}>
            <p className={`hidden text-xs sm:block ${themeClasses.muted}`}>
              Source-backed responses. Press Enter to send.
            </p>
            <button
              className="ml-auto rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
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
  const [theme, setTheme] = useState(loadTheme);
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => loadConversations()[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const themeClasses = useMemo(() => getThemeClasses(theme), [theme]);
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ||
    conversations[0] ||
    starterConversation;

  const stats = useMemo(
    () => [
      { label: 'Indexed sources', value: 'Labour law corpus' },
      { label: 'Answer style', value: 'Markdown + citations' },
      { label: 'History', value: 'Saved locally' },
    ],
    [],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [activeConversation.messages.length, isLoading]);

  function updateConversation(conversationId, updater) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...updater(conversation), updatedAt: new Date().toISOString() }
          : conversation,
      ),
    );
  }

  function createConversation() {
    const next = {
      id: createId('conversation'),
      title: 'New labour law query',
      updatedAt: new Date().toISOString(),
      messages: [welcomeMessage],
    };

    setConversations((current) => [next, ...current]);
    setActiveId(next.id);
    setIsLoading(false);
  }

  function handleSend(text) {
    const conversationId = activeConversation.id;
    const userMessage = {
      id: createId('user'),
      role: 'user',
      content: text,
    };

    updateConversation(conversationId, (conversation) => ({
      ...conversation,
      title:
        conversation.title === 'New labour law query'
          ? buildTitle(text)
          : conversation.title,
      messages: [...conversation.messages, userMessage],
    }));
    setIsLoading(true);

    fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const sourceList = Array.isArray(data.sources) ? data.sources : [];
        const aiMessage = {
          id: createId('assistant'),
          role: 'assistant',
          content: data.answer || 'No answer was returned by the backend.',
          sources: sourceList.map((source) => ({
            title: String(source),
            detail: 'Retrieved from labour law knowledge base',
            score: 'Relevant',
          })),
        };

        updateConversation(conversationId, (conversation) => ({
          ...conversation,
          messages: [...conversation.messages, aiMessage],
        }));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);

        updateConversation(conversationId, (conversation) => ({
          ...conversation,
          messages: [
            ...conversation.messages,
            {
              id: createId('assistant-error'),
              role: 'assistant',
              content: '**Error connecting to backend.** Please confirm the API server is running.',
            },
          ],
        }));
        setIsLoading(false);
      });
  }

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-300 ${themeClasses.app}`}
    >
      <Sidebar
        activeId={activeConversation.id}
        conversations={conversations}
        onNewConversation={createConversation}
        onSelectConversation={setActiveId}
        themeClasses={themeClasses}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Header
          activeConversation={activeConversation}
          conversations={conversations}
          onNewConversation={createConversation}
          onSelectConversation={setActiveId}
          onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          theme={theme}
          themeClasses={themeClasses}
        />

        <section
          className="thin-scrollbar flex-1 overflow-y-auto px-4 py-6 lg:px-8"
          ref={scrollRef}
        >
          <div className="mx-auto max-w-5xl">
            <div
              className={`mb-6 rounded-xl border p-4 transition-colors duration-300 ${themeClasses.mutedPanel}`}
            >
              <div className="grid gap-3 md:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p
                      className={`text-xs uppercase tracking-[0.18em] ${themeClasses.subtle}`}
                    >
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-sm font-semibold ${themeClasses.text}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <PromptRail onPrompt={handleSend} themeClasses={themeClasses} />

            <div className="mt-6 space-y-5 pb-6">
              {activeConversation.messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  themeClasses={themeClasses}
                />
              ))}
              {isLoading && <LoadingMessage themeClasses={themeClasses} />}
            </div>
          </div>
        </section>

        <Composer
          disabled={isLoading}
          onSend={handleSend}
          themeClasses={themeClasses}
        />
      </main>
    </div>
  );
}

export default App;

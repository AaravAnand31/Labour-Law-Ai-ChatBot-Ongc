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
      ? 'premium-shell bg-[#0e131a] text-[#f4f7fb]'
      : 'premium-shell bg-[#f8f5ef] text-[#172033]',
    sidebar: isDark
      ? 'border-[#d8e7f6]/10 bg-[#111821]/82 shadow-2xl shadow-black/28'
      : 'border-[#d9d3c7]/75 bg-[#fffaf2]/80 shadow-2xl shadow-[#d6cbb8]/35',
    panel: isDark
      ? 'border-[#d8e7f6]/10 bg-[#f6fbff]/[0.055] shadow-lg shadow-black/16'
      : 'border-[#ded7ca]/75 bg-[#fffdf8]/78 shadow-lg shadow-[#ddd2c2]/35',
    mutedPanel: isDark
      ? 'border-[#d8e7f6]/10 bg-[#f6fbff]/[0.04] shadow-lg shadow-black/10'
      : 'border-[#ded7ca]/70 bg-[#fffaf2]/68 shadow-lg shadow-[#ddd2c2]/28',
    text: isDark ? 'text-[#f6f8fb]' : 'text-[#172033]',
    muted: isDark ? 'text-[#a8b4c4]' : 'text-[#667085]',
    subtle: isDark ? 'text-[#788596]' : 'text-[#8a8174]',
    border: isDark ? 'border-[#d8e7f6]/10' : 'border-[#ded7ca]/75',
    icon: isDark
      ? 'border-[#d8e7f6]/10 bg-[#f6fbff]/[0.06] text-[#a8d8e8] shadow-lg shadow-black/22'
      : 'border-[#ded7ca]/80 bg-[#fffdf8] text-[#326b7a] shadow-md shadow-[#d6cbb8]/45',
    header: isDark
      ? 'border-[#d8e7f6]/10 bg-[#0e131a]/72 shadow-sm shadow-black/22'
      : 'border-[#ded7ca]/70 bg-[#fffaf2]/70 shadow-sm shadow-[#d6cbb8]/35',
    assistant: isDark
      ? 'border-[#d8e7f6]/10 bg-[#151d27]/88 text-[#eef3f8] shadow-xl shadow-black/20'
      : 'border-[#ded7ca]/78 bg-[#fffdf8]/94 text-[#273244] shadow-xl shadow-[#d8cdbc]/38',
    prompt: isDark
      ? 'border-[#d8e7f6]/10 bg-[#f6fbff]/[0.045] text-[#c2cbd6] hover:bg-[#dff7ff]/[0.075]'
      : 'border-[#ded7ca]/75 bg-[#fffaf2]/76 text-[#4b5565] hover:bg-[#fffdf8]',
    input: isDark
      ? 'border-[#d8e7f6]/12 bg-[#151d27]/88 text-[#f4f7fb] placeholder:text-[#748294] shadow-2xl shadow-black/28'
      : 'border-[#ded7ca]/90 bg-[#fffdf8]/92 text-[#172033] placeholder:text-[#9b9287] shadow-2xl shadow-[#d6cbb8]/38',
    composer: isDark
      ? 'border-[#d8e7f6]/10 bg-[#0e131a]/38'
      : 'border-[#ded7ca]/70 bg-[#f8f5ef]/48',
    modal: isDark
      ? 'border-[#d8e7f6]/12 bg-[#121a24] text-[#f4f7fb] shadow-2xl shadow-black/48'
      : 'border-[#ded7ca]/90 bg-[#fffdf8] text-[#172033] shadow-2xl shadow-[#9f927e]/24',
    modalBody: isDark
      ? 'border-[#d8e7f6]/10 bg-black/18 text-[#dbe5ee]'
      : 'border-[#ded7ca]/80 bg-[#f7f1e8]/78 text-[#3f4858]',
  };
}

function Icon({ children, themeClasses }) {
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-semibold transition-all duration-300 ${themeClasses.icon}`}
    >
      {children}
    </span>
  );
}

function BrandLogo({ themeClasses }) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white p-1 shadow-sm transition-all duration-300 ${themeClasses.icon}`}
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
      className={`grid h-10 w-10 place-items-center rounded-xl border text-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#93c5d6]/60 ${themeClasses.panel}`}
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
      className={`hidden h-screen w-80 shrink-0 border-r p-5 backdrop-blur-xl transition-colors duration-300 xl:block ${themeClasses.sidebar}`}
    >
      <div className="flex h-full flex-col">
        <div className="mb-7 flex items-center gap-3">
          <BrandLogo themeClasses={themeClasses} />
          <div>
            <p className={`text-sm font-semibold tracking-tight ${themeClasses.text}`}>
              Labour Law AI
            </p>
            <p className={`text-xs ${themeClasses.muted}`}>Research assistant</p>
          </div>
        </div>

        <button
          className="mb-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#b7d8df] via-[#c7d9e8] to-[#d9d0bd] px-4 py-3 text-sm font-semibold text-[#16212f] shadow-xl shadow-[#06121a]/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#c7e3e8] hover:via-[#d3e3ee] hover:to-[#e4d8c6]"
          onClick={onNewConversation}
          type="button"
        >
          New legal query
        </button>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
          <p
            className={`px-2 pb-1 text-xs font-medium uppercase tracking-[0.22em] ${themeClasses.subtle}`}
          >
            Previous chats
          </p>
          {conversations.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                className={`w-full rounded-xl border px-3.5 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                  isActive
                    ? 'border-[#9fc9d6]/45 bg-gradient-to-r from-[#b7d8df]/16 to-[#d9d0bd]/10 shadow-lg shadow-[#06121a]/10'
                    : `border-transparent hover:border-[#93c5d6]/30 ${themeClasses.prompt}`
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

        <div className={`mt-5 rounded-2xl border p-4 backdrop-blur-xl ${themeClasses.panel}`}>
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
      className={`sticky top-0 z-20 border-b px-4 py-3.5 backdrop-blur-xl transition-colors duration-300 lg:px-8 ${themeClasses.header}`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="xl:hidden">
            <BrandLogo themeClasses={themeClasses} />
          </div>
          <div className="min-w-0">
            <h1 className={`truncate text-base font-semibold tracking-tight sm:text-lg ${themeClasses.text}`}>
              AI Labour Law Assistant
            </h1>
            <p className={`truncate text-xs ${themeClasses.muted}`}>
              {activeConversation.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            className={`hidden max-w-56 rounded-xl border px-3 py-2 text-xs outline-none transition-all duration-300 sm:block xl:hidden ${themeClasses.input}`}
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
            className="hidden rounded-xl border border-[#93c5d6]/45 px-3 py-2 text-xs font-semibold text-[#4c8a9a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#93c5d6]/10 sm:block xl:hidden"
            onClick={onNewConversation}
            type="button"
          >
            New
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-[#8db7a6]/24 bg-[#8db7a6]/10 px-3 py-1.5 text-xs font-medium text-[#6fa08e] shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#8db7a6] shadow-[0_0_12px_rgba(141,183,166,0.72)]" />
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

function getSourceTitle(source) {
  return source?.file || source?.title || 'Labour law source';
}

function getSourcePreview(source) {
  if (source?.preview) return source.preview;
  if (source?.text) return `${source.text.slice(0, 140)}${source.text.length > 140 ? '...' : ''}`;
  return source?.detail || 'Retrieved from labour law knowledge base';
}

function getSourceText(source) {
  return source?.text || source?.detail || 'No source text was provided for this citation.';
}

function SourceCards({ className = 'mt-5', onViewSource, sources, themeClasses }) {
  if (!sources?.length) return null;

  return (
    <div className={`${className} grid gap-3 sm:grid-cols-2`}>
      {sources.map((source, index) => (
        <article
          className={`rounded-xl border p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#93c5d6]/42 hover:shadow-xl ${themeClasses.mutedPanel}`}
          key={index}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className={`line-clamp-2 text-sm font-semibold leading-5 ${themeClasses.text}`}>
              {getSourceTitle(source)}
            </h3>

            <span className="rounded-full bg-[#d6b98c]/16 px-2 py-1 text-[11px] font-semibold text-[#b58a4b]">
              {source?.score || 'Relevant'}
            </span>
          </div>

          <p className={`mt-2 line-clamp-3 text-xs leading-5 ${themeClasses.muted}`}>
            {getSourcePreview(source)}
          </p>

          <button
            className="mt-3 rounded-lg px-0 py-1 text-xs font-semibold text-[#4c8a9a] transition-all duration-300 hover:translate-x-0.5 hover:text-[#7bb5c5]"
            onClick={() => onViewSource(source)}
            type="button"
          >
            View Source
          </button>
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
          <h1 className={`mb-4 mt-1 text-2xl font-semibold tracking-tight ${themeClasses.text}`}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={`mb-2 mt-5 text-xl font-semibold tracking-tight ${themeClasses.text}`}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={`mb-2 mt-4 text-base font-semibold tracking-tight ${themeClasses.text}`}>
            {children}
          </h3>
        ),
        p: ({ children }) => <p className="mb-3.5 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => (
          <ul className="mb-3.5 list-disc space-y-1.5 pl-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3.5 list-decimal space-y-1.5 pl-5">{children}</ol>
        ),
        code: ({ children }) => (
          <code className="rounded-md border border-[#d8e7f6]/10 bg-[#0b1117]/80 px-1.5 py-0.5 text-[0.85em] text-[#b7d8df]">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="mb-4 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/95 p-4 text-xs text-slate-100 shadow-inner">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function SourcesButton({ count, onClick }) {
  return (
    <button
      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#93c5d6]/32 bg-[#93c5d6]/10 px-3 py-1.5 text-xs font-semibold text-[#6aa1b0] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#93c5d6]/55 hover:bg-[#93c5d6]/16 hover:text-[#7bb5c5]"
      onClick={onClick}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M8 7h8M8 11h8M8 15h5M6 3h9l3 3v15H6V3Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      Sources ({count})
    </button>
  );
}

function Message({ message, onViewSources, themeClasses }) {
  const isUser = message.role === 'user';
  const sourceCount = message.sources?.length || 0;

  return (
    <div
      className={`animate-[messageIn_220ms_ease-out] flex gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && <Icon themeClasses={themeClasses}>LL</Icon>}
      <div
        className={`max-w-3xl rounded-2xl px-[18px] py-4 text-sm leading-7 shadow-sm transition-all duration-300 ${
          isUser
            ? 'bg-gradient-to-br from-[#b7d8df] via-[#c7d9e8] to-[#d9d0bd] text-[#172033] shadow-xl shadow-[#06121a]/15'
            : `border ${themeClasses.assistant}`
        }`}
      >
        <MarkdownContent
          content={message.content}
          isUser={isUser}
          themeClasses={themeClasses}
        />
        {!isUser && sourceCount > 0 && (
          <SourcesButton
            count={sourceCount}
            onClick={() => onViewSources(message.sources)}
          />
        )}
      </div>
    </div>
  );
}

function SourcesModal({
  isOpen,
  onClose,
  onViewSource,
  sources,
  themeClasses,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close sources"
        className="absolute inset-0 cursor-default bg-slate-950/68 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
        type="button"
      />

      <div
        className={`relative flex max-h-[88vh] w-full max-w-4xl animate-[sourceModalIn_180ms_ease-out] flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 ${themeClasses.modal}`}
      >
        <div className={`flex items-start justify-between gap-4 border-b p-[22px] ${themeClasses.border}`}>
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-[0.18em] ${themeClasses.subtle}`}>
              Retrieved evidence
            </p>
            <h2 className={`mt-1 text-lg font-semibold tracking-tight ${themeClasses.text}`}>
              Sources ({sources.length})
            </h2>
          </div>

          <button
            aria-label="Close"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-semibold leading-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#93c5d6]/60 ${themeClasses.panel}`}
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>

        <div className="min-h-0 p-[22px]">
          <div
            className={`thin-scrollbar max-h-[64vh] overflow-y-auto rounded-2xl border p-4 ${themeClasses.modalBody}`}
          >
            <SourceCards
              className=""
              onViewSource={onViewSource}
              sources={sources}
              themeClasses={themeClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceModal({ isOpen, onClose, source, themeClasses }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close source viewer"
        className="absolute inset-0 cursor-default bg-slate-950/68 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
        type="button"
      />

      <div
        className={`relative flex max-h-[86vh] w-full max-w-3xl animate-[sourceModalIn_180ms_ease-out] flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 ${themeClasses.modal}`}
      >
        <div className={`flex items-start justify-between gap-4 border-b p-[22px] ${themeClasses.border}`}>
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-[0.18em] ${themeClasses.subtle}`}>
              Source citation
            </p>
            <h2 className={`mt-1 truncate text-lg font-semibold tracking-tight ${themeClasses.text}`}>
              {getSourceTitle(source)}
            </h2>
          </div>

          <button
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-lg leading-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#93c5d6]/60 ${themeClasses.panel}`}
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-[22px]">
          <div
            className={`thin-scrollbar max-h-[58vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-7 shadow-inner ${themeClasses.modalBody}`}
          >
            {getSourceText(source)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingMessage({ themeClasses }) {
  return (
    <div className="animate-[messageIn_220ms_ease-out] flex gap-3">
      <Icon themeClasses={themeClasses}>LL</Icon>
      <div
        className={`rounded-2xl border px-4 py-4 shadow-sm transition-all duration-300 ${themeClasses.assistant}`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#b7d8df] shadow-[0_0_12px_rgba(183,216,223,0.65)] [animation-delay:-0.2s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#c7d9e8] shadow-[0_0_12px_rgba(199,217,232,0.58)] [animation-delay:-0.1s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#d6b98c] shadow-[0_0_12px_rgba(214,185,140,0.5)]" />
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
          className={`rounded-2xl border p-4 text-left text-xs leading-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#93c5d6]/50 hover:shadow-xl ${themeClasses.prompt}`}
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
      className={`border-t px-4 pb-5 pt-3 backdrop-blur-xl transition-colors duration-300 lg:px-8 ${themeClasses.composer}`}
    >
      <div className="mx-auto max-w-5xl">
        <div
          className={`rounded-3xl border p-2.5 backdrop-blur-xl transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-[#93c5d6]/70 focus-within:shadow-[#06121a]/20 ${themeClasses.input}`}
        >
          <textarea
            className="max-h-40 min-h-14 w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-6 outline-none"
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
          <div className={`flex items-center justify-between gap-3 border-t px-3 pt-2.5 ${themeClasses.border}`}>
            <p className={`hidden text-xs sm:block ${themeClasses.muted}`}>
              Source-backed responses. Press Enter to send.
            </p>
            <button
              className="ml-auto rounded-xl bg-gradient-to-r from-[#172033] to-[#2f4654] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/15 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2f4654] hover:to-[#4c7280] disabled:translate-y-0 disabled:opacity-50"
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
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedSources, setSelectedSources] = useState([]);
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
  sources: sourceList,
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
      className={`relative isolate flex h-screen overflow-hidden transition-colors duration-300 ${themeClasses.app}`}
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
          className="thin-scrollbar flex-1 overflow-y-auto px-4 py-7 lg:px-8"
          ref={scrollRef}
        >
          <div className="mx-auto max-w-5xl">
            <div
              className={`mb-6 rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 ${themeClasses.mutedPanel}`}
            >
              <div className="grid gap-3 md:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p
                      className={`text-xs uppercase tracking-[0.18em] ${themeClasses.subtle}`}
                    >
                      {stat.label}
                    </p>
                    <p className={`mt-1 text-sm font-semibold tracking-tight ${themeClasses.text}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <PromptRail onPrompt={handleSend} themeClasses={themeClasses} />

            <div className="mt-7 space-y-6 pb-6">
              {activeConversation.messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onViewSources={setSelectedSources}
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

      <SourcesModal
        isOpen={selectedSources.length > 0}
        onClose={() => setSelectedSources([])}
        onViewSource={setSelectedSource}
        sources={selectedSources}
        themeClasses={themeClasses}
      />

      <SourceModal
        isOpen={Boolean(selectedSource)}
        onClose={() => setSelectedSource(null)}
        source={selectedSource}
        themeClasses={themeClasses}
      />
    </div>
  );
}

export default App;

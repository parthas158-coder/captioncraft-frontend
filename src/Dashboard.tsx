import { useEffect, useRef, useState } from "react";

const LOGO_SRC = "/logo.png"; // public/logo.png

type CaptionResult = {
  variant?: string;
  short: string;
  medium: string;
  long: string;
  hashtags?: string[];
  timestamp?: number;
};

const BACKEND_URL = "https://captioncraft-backend-1.onrender.com";

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CaptionResult[] | null>(null);
  const [history, setHistory] = useState<CaptionResult[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [stylesToGenerate] = useState<string[]>(["Friendly", "Professional", "Funny"]);

  // refs for navigation
  const mainRef = useRef<HTMLElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  // Load saved history + theme
  useEffect(() => {
    const raw = localStorage.getItem("captioncraft_history_v4");
    if (raw) setHistory(JSON.parse(raw));
    const t = localStorage.getItem("captioncraft_theme_v1") as "dark" | "light" | null;
    if (t) setTheme(t);
  }, []);

  useEffect(() => {
    localStorage.setItem("captioncraft_history_v4", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("captioncraft_theme_v1", theme);
  }, [theme]);

  // Simple hashtag generator
  const generateHashtags = (text: string, tone: string) => {
    const words = (text + " " + tone)
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 6);
    return [...new Set(words.map((w) => `#${w.toLowerCase()}`))]
      .concat(["#captioncraft", "#ai"])
      .slice(0, 8);
  };

  // Create caption (no animation)
  const generateMockOne = (topic: string, tone: string, variant?: string): CaptionResult => {
    const base = topic || "An inspiring moment";
    const vTone = variant || tone;

    return {
      variant: vTone,
      short: `${base} — ${vTone} boost.`,
      medium: `${base} — A ${vTone.toLowerCase()} note: keep moving forward.`,
      long: `${base} — A longer ${vTone.toLowerCase()} message about progress.`,
      hashtags: generateHashtags(base, vTone),
      timestamp: Date.now(),
    };
  };

  // Generate (currently uses mock if BACKEND_URL not called)
  const generateCaptions = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    setLoading(true);

    try {
      let arr: CaptionResult[] = [];

      if (BACKEND_URL) {
        // If you have a backend ready, uncomment and use this:
        // const resp = await fetch(`${BACKEND_URL}/generate`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ topic, tone, styles: stylesToGenerate }),
        // });
        // const json = await resp.json();
        // if (!resp.ok) throw new Error(json?.error || "Backend error");
        // arr = json.captions;

        // For now (without backend or to fall back), produce front-end mocks:
        arr = stylesToGenerate.map((s) => generateMockOne(topic, tone, s));
      } else {
        arr = stylesToGenerate.map((s) => generateMockOne(topic, tone, s));
      }

      setResults(arr);
    } catch (err: any) {
      console.error("Generate error:", err);
      alert("Failed to generate captions. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (item: CaptionResult) => {
    const copy = { ...item, timestamp: Date.now() };
    setHistory((h) => [copy, ...h].slice(0, 300));
  };

  const deleteHistoryItem = (ts?: number) => {
    setHistory((h) => h.filter((x) => x.timestamp !== ts));
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    alert("Copied!");
  };

  const downloadTxt = (text: string, filename = "caption.txt") => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = (item: CaptionResult) => {
    downloadTxt([item.short, item.medium, item.long].join("\n\n"), `caption-${item.timestamp}.txt`);
  };

  const exportHistory = () => {
    downloadTxt(JSON.stringify(history, null, 2), "history.json");
  };

  // Navigation handlers
  const goToDashboard = () => {
    // Scroll to top/main area
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // optional: set focus for accessibility
      (mainRef.current.querySelector("h1") as HTMLElement | null)?.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToCreate = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = formRef.current.querySelector("input");
      (input as HTMLInputElement | null)?.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      id="app-root"
      className={theme === "dark" ? "min-h-screen bg-black text-white" : "min-h-screen bg-gray-50 text-gray-900"}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 p-4 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_SRC} className="w-12 h-12 rounded" alt="logo" />
            <div>
              <div className="font-bold text-lg">CaptionCraft</div>
              <div className="text-xs text-gray-300">Studio</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={goToDashboard}
              className="p-3 hover:bg-white/5 rounded-lg text-left flex items-center gap-3"
              aria-label="Go to Dashboard"
            >
              <span style={{ fontSize: 18 }}>🏠</span>
              <span className="text-lg font-medium">Dashboard</span>
            </button>

            <button
              onClick={goToCreate}
              className="p-3 hover:bg-white/5 rounded-lg text-left flex items-center gap-3"
              aria-label="Go to Create"
            >
              <span style={{ fontSize: 18 }}>✍️</span>
              <span className="text-lg font-medium">Create</span>
            </button>
          </div>

          <div className="mt-6 text-sm">
            <div className="text-gray-300">Saved</div>
            <div>{history.length} captions</div>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mt-auto bg-yellow-400 text-black p-2 rounded-lg font-semibold"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </aside>

        {/* Main Panel */}
        <main ref={mainRef} id="main-panel" className="flex-1 p-8 overflow-auto">
          <h1 tabIndex={-1} className="text-3xl font-bold mb-2">
            AI Caption Generator
          </h1>
          <p className="text-gray-400 mb-6">Create captions instantly</p>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Panel (form) */}
            <div className="col-span-12 lg:col-span-4">
              <div ref={formRef} id="create-form" className="p-6 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm">Topic</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Morning Motivation"
                  className="w-full p-2 mt-1 rounded bg-white/10"
                />

                <label className="text-sm mt-4">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 mt-1 rounded bg-white/10"
                >
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Motivational</option>
                  <option>Funny</option>
                </select>

                <button
                  onClick={generateCaptions}
                  disabled={loading}
                  className="mt-6 w-full bg-yellow-400 text-black p-2 rounded font-bold"
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
              </div>

              {/* History */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between mb-2">
                  <div className="font-semibold">History</div>
                  <button onClick={exportHistory} className="text-xs underline">
                    Export
                  </button>
                </div>

                <div className="max-h-56 overflow-auto space-y-3">
                  {history.length === 0 && <div className="text-gray-400 text-sm">No saved captions.</div>}

                  {history.map((h) => (
                    <div key={h.timestamp} className="p-3 bg-white/10 rounded">
                      <div className="text-sm">{h.medium}</div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => deleteHistoryItem(h.timestamp)} className="text-red-400 text-xs">
                          Delete
                        </button>
                        <button onClick={() => downloadAll(h)} className="text-gray-300 text-xs">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="col-span-12 lg:col-span-8">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-4">Generated Captions</h3>

                {!results && <div className="text-gray-400">No captions yet. Generate something!</div>}

                {results &&
                  results.map((res) => (
                    <div key={res.timestamp} className="mb-6 p-4 bg-white/10 rounded">
                      <div className="font-semibold">{res.variant}</div>

                      <div className="mt-3 text-sm">{res.short}</div>
                      <div className="mt-3 text-sm">{res.medium}</div>
                      <div className="mt-3 text-sm">{res.long}</div>

                      <div className="flex gap-2 flex-wrap mt-3">
                        {res.hashtags?.map((h, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-white/20 rounded">
                            {h}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button onClick={() => copyText(res.medium)} className="text-yellow-400">
                          Copy
                        </button>
                        <button onClick={() => downloadAll(res)} className="text-gray-300">
                          Download
                        </button>
                        <button onClick={() => saveToHistory(res)} className="text-gray-200">
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

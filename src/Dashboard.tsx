import { useEffect, useState } from "react";

const LOGO_SRC = "/logo.png";

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

  // Load history + theme
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

  // Hashtag generator
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

  // Fallback generator
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

  // Generate captions
  const generateCaptions = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    setLoading(true);

    try {
      let arr: CaptionResult[] = [];

      // If backend exists → call it
      if (BACKEND_URL) {
        try {
          const res = await fetch(`${BACKEND_URL}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, tone, styles: stylesToGenerate }),
          });

          const data = await res.json();

          if (data?.captions) {
            arr = data.captions;
          } else {
            throw new Error("AI error");
          }
        } catch (e) {
          console.log("Backend error → fallback:", e);
          arr = stylesToGenerate.map((s) => generateMockOne(topic, tone, s));
        }
      } else {
        // No backend → use mock
        arr = stylesToGenerate.map((s) => generateMockOne(topic, tone, s));
      }

      setResults(arr);
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
    downloadTxt(
      [item.short, item.medium, item.long].join("\n\n"),
      `caption-${item.timestamp}.txt`
    );
  };

  const exportHistory = () => {
    downloadTxt(JSON.stringify(history, null, 2), "history.json");
  };

  return (
    <div className={theme === "dark" ? "min-h-screen bg-black text-white" : "min-h-screen bg-gray-50 text-gray-900"}>
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 p-4 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">

          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_SRC} className="w-12 h-12 rounded" />
            <div>
              <div className="font-bold text-lg">CaptionCraft</div>
              <div className="text-xs text-gray-300">Studio</div>
            </div>
          </div>

          {/* Sidebar navigation with smooth scroll */}
          <button
            onClick={() => {
              document.getElementById("dashboard-top")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="p-3 hover:bg-white/5 rounded-lg"
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() => {
              document.getElementById("create-panel")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="p-3 hover:bg-white/5 rounded-lg"
          >
            ✍️ Create
          </button>

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

        {/* Main Area */}
        <main id="dashboard-top" className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-2">AI Caption Generator</h1>
          <p className="text-gray-400 mb-6">Create captions instantly</p>

          <div className="grid grid-cols-12 gap-8">

            {/* CREATE PANEL */}
            <div id="create-panel" className="col-span-12 lg:col-span-4">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
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
                  {history.length === 0 && (
                    <div className="text-gray-400 text-sm">No saved captions.</div>
                  )}

                  {history.map((h) => (
                    <div key={h.timestamp} className="p-3 bg-white/10 rounded">
                      <div className="text-sm">{h.medium}</div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => deleteHistoryItem(h.timestamp)}
                          className="text-red-400 text-xs"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => downloadAll(h)}
                          className="text-gray-300 text-xs"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RESULTS PANEL */}
            <div className="col-span-12 lg:col-span-8">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="font-semibold mb-4">Generated Captions</h3>

                {!results && (
                  <div className="text-gray-400">No captions yet. Generate something!</div>
                )}

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

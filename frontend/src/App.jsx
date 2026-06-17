import axios from "axios";
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function ScoreCircle({ score }) {
  const color =
    score >= 75 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
  const bg =
    score >= 75 ? "bg-green-50 border-green-200" : score >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  return (
    <div className={`flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 ${bg} mx-auto mb-6`}>
      <span className={`text-4xl font-bold ${color}`}>{score}</span>
      <span className="text-sm text-gray-500 font-medium">ATS Score</span>
    </div>
  );
}

function TagList({ items, color }) {
  const styles = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
  };
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, i) => (
        <span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${styles[color]}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

export default function App() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!resume.trim() || !jobDesc.trim()) {
      setError("Please fill in both fields before analyzing.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/analyze`, {
        resume_text: resume,
        job_description: jobDesc,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Resume ATS Checker</h1>
          <p className="text-sm text-gray-500">See how well your resume matches a job description</p>
        </div>
        
          <a href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >Built for Digital Heroes</a>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Resume
            </label>
            <textarea
              className="w-full h-64 border border-gray-300 rounded-xl p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Paste your resume text here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              className="w-full h-64 border border-gray-300 rounded-xl p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Paste the job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="text-center mb-10">
          <button
            onClick={analyze}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold px-10 py-3 rounded-xl text-sm transition"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <ScoreCircle score={result.ats_score} />

            <p className="text-center text-gray-600 text-sm mb-8 max-w-xl mx-auto">
              {result.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">✅ Matched Keywords</h3>
                <TagList items={result.matched_keywords} color="green" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">❌ Missing Keywords</h3>
                <TagList items={result.missing_keywords} color="red" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">💪 Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-500 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">🛠 Improvements</h3>
                <ul className="space-y-2">
                  {result.improvements.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-400">
          <p className="font-medium text-gray-600">Poojitha Battula</p>
          <p>battulapoojitha61@gmail.com</p>
          <p className="mt-1">Built with FastAPI + Gemini AI + React</p>
        </footer>

      </main>
    </div>
  );
}
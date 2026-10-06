import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Github, 
  Cpu, 
  QrCode, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Play, 
  FileCode, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Layers,
  HelpCircle,
  FolderGit2
} from 'lucide-react';

export const ApkDownloadGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guide' | 'checklist' | 'workflow' | 'prompts' | 'simulator'>('checklist');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  // Simulator State
  const [simState, setSimState] = useState<'idle' | 'building' | 'complete'>('idle');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState(0);

  const samplePrompts = [
    {
      title: 'Prompt 1: Flutter Android App + Automated GitHub Actions APK',
      description: 'Instructs Google AI Studio / Gemini to set up a full Flutter Android app with automated APK compilation via GitHub Actions and release download links.',
      prompt: `I am developing an Android app in Google AI Studio. 

Please set up my project with an automated GitHub Actions CI/CD workflow so every commit or tag automatically builds a production-ready Android APK (.apk) file.

Requirements:
1. Create '.github/workflows/build-apk.yml' that:
   - Sets up Ubuntu latest, Java 17, and Flutter 3.24.x
   - Runs 'flutter pub get' and 'flutter build apk --release --no-tree-shake-icons'
   - Uploads the compiled 'app-release.apk' as a workflow artifact
   - Automatically publishes a GitHub Release using 'softprops/action-gh-release@v2' so I get a public, direct APK download link that works on any Android phone without needing to log in.
2. Provide the direct release download link format:
   https://github.com/<OWNER>/<REPO>/releases/latest/download/app-release.apk
3. Generate a QR code in markdown so I can scan and install the APK directly on my phone.`,
    },
    {
      title: 'Prompt 2: Native Android (Kotlin / Jetpack Compose) APK Build',
      description: 'For native Android Kotlin projects created in Google AI Studio.',
      prompt: `Please configure a GitHub Actions workflow (.github/workflows/android-apk.yml) for this Native Android Kotlin project:

1. Setup Java JDK 17 with Gradle cache.
2. Grant execute permission to './gradlew'.
3. Run './gradlew assembleRelease' (or assembleDebug for quick test builds).
4. Publish the APK to GitHub Releases with tag 'latest-build'.
5. Reply with the direct download URL for Android mobile browsers and instructions for installing unknown apps on phone.`,
    },
    {
      title: 'Prompt 3: Capacitor / React Web to Android APK Wrapper',
      description: 'Converts a React / Vite web app created in AI Studio into an installable Android APK.',
      prompt: `Please add Capacitor Android configuration to this web app and provide a GitHub Actions workflow that:
1. Runs 'npm run build' to bundle the web app.
2. Runs 'npx cap sync android' to update the Android project.
3. Compiles the Android release APK using Gradle.
4. Generates a direct APK download link from GitHub Releases so I can test it directly on my Android phone.`,
    },
  ];

  const githubActionsWorkflow = `# ==============================================================================
# .github/workflows/build-apk.yml
# Automated Android APK Build & Direct Phone Download Link via GitHub Actions
# Works seamlessly with Google AI Studio Android / Flutter projects
# ==============================================================================

name: Build & Release Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch: # Allows manual trigger from GitHub Actions tab

permissions:
  contents: write # Required to publish GitHub Releases

jobs:
  build-apk:
    name: Build Flutter Android APK
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4

      - name: ☕ Set up Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 💙 Set up Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: 📱 Ensure Android Platform Files Exist
        run: |
          if [ ! -d "android" ]; then
            echo "Creating Android platform files and Gradle wrapper..."
            flutter create . --platforms=android --org=com.posindia
          fi

      - name: 📦 Install Flutter Dependencies
        run: flutter pub get

      # (Optional) Verify Flutter analysis
      # - name: 🔍 Run Flutter Analyze
      #   run: flutter analyze

      - name: 🔨 Build Release APK
        run: |
          flutter build apk --release --no-tree-shake-icons
          echo "APK build finished successfully at build/app/outputs/flutter-apk/app-release.apk"

      - name: 📤 Upload APK Artifact (GitHub Actions)
        uses: actions/upload-artifact@v4
        with:
          name: posindia-app-release
          path: build/app/outputs/flutter-apk/app-release.apk
          retention-days: 14

      # Creates a Public GitHub Release so Android Phone users can download directly
      # without needing to log in to GitHub!
      - name: 🚀 Publish Direct Download Link via GitHub Releases
        uses: softprops/action-gh-release@v2
        with:
          tag_name: latest
          name: "Latest Android APK Build (Automated)"
          body: |
            ## 📱 New Android APK Build Ready for Download!
            
            - **Download Link**: [app-release.apk](https://github.com/\${{ github.repository }}/releases/download/latest/app-release.apk)
            - **Commit**: \${{ github.sha }}
            - **Date**: \${{ github.event.head_commit.timestamp }}
            
            ### 📲 Phone Installation Instructions:
            1. Tap the download link on your Android phone.
            2. If Chrome shows *"File might be harmful"*, tap **Download anyway**.
            3. Tap **Open** -> **Settings** -> allow **Install unknown apps**.
            4. Tap **Install** and enjoy!
          files: build/app/outputs/flutter-apk/app-release.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;

  const handleCopyPrompt = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2000);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(githubActionsWorkflow);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleDownloadWorkflowFile = () => {
    const blob = new Blob([githubActionsWorkflow], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-apk.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startBuildSimulation = () => {
    setSimState('building');
    setSimLogs([]);
    setSimProgress(10);

    const logSteps = [
      { text: 'Starting GitHub Actions runner: ubuntu-latest (Container ID: gh-run-8492)...', delay: 400, prog: 20 },
      { text: 'Cloning repository from Google AI Studio export: posindia-shop/pos-mobile...', delay: 800, prog: 35 },
      { text: 'Setting up Java JDK 17 (Temurin) and Gradle 8.4 caching...', delay: 1300, prog: 50 },
      { text: 'Installing Flutter SDK 3.24.3-stable...', delay: 1800, prog: 65 },
      { text: 'Running: flutter pub get (resolved 42 dependencies in 2.1s)...', delay: 2400, prog: 75 },
      { text: 'Running: flutter build apk --release --no-tree-shake-icons...', delay: 3100, prog: 85 },
      { text: 'Gradle Task: assembleRelease -> compiled classes.dex & signed app-release.apk (18.4 MB)', delay: 3800, prog: 95 },
      { text: 'Publishing release artifact to GitHub Releases: tag "latest"...', delay: 4300, prog: 100 },
      { text: '✨ SUCCESS: Direct Android APK download URL generated!', delay: 4600, prog: 100 },
    ];

    logSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSimLogs((prev) => [...prev, step.text]);
        setSimProgress(step.prog);
        if (idx === logSteps.length - 1) {
          setSimState('complete');
        }
      }, step.delay);
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-blue-950/80 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              NEW PHONE WORKING METHOD
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
              Google AI Studio ➔ GitHub Actions ➔ Direct APK Link
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            How to Download Android APK from Google AI Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Since Google AI Studio operates inside a cloud web sandbox without a local Android SDK emulator, 
            the <strong>proven working method</strong> is to prompt Google AI Studio to set up an automatic 
            <strong> GitHub Actions CI/CD pipeline</strong>. GitHub compiles your release APK in the cloud, 
            and Gemini delivers a <strong>direct one-tap download link or QR code</strong> right to your Android phone.
          </p>

          {/* Quick Nav Tabs */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'checklist'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>GitHub Checklist (क्या Update करें)</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'guide'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Step-by-Step Phone Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'prompts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy Ready Prompts</span>
            </button>

            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'workflow'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>GitHub Actions Workflow (YAML)</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Build Simulator & QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 w-full space-y-6">

        {/* ------------------------------------------------------------------ */}
        {/* TAB 0: GITHUB CHECKLIST (KYA-KYA UPDATE KARNA HAI) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  QUICK CHECKLIST
                </span>
                <h2 className="text-base font-bold text-white">
                  GitHub se APK Download karne ke liye kya update karna hai?
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                GitHub par APK automatically compile aur download karne ke liye sirf <strong>2 main settings aur 1 file</strong> update karni hoti hai. Niche diye gaye 4 steps follow karein:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Step 1: GitHub Settings Permission */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-sm text-white">
                      GitHub Settings: &quot;Workflow Permissions&quot; ko Read/Write karein (Sabse Zaroori)
                    </h3>
                  </div>
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-900 px-2 py-0.5 rounded font-mono">
                    Must Do (Varna 403 Error aayega)
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Default roop se GitHub Actions ko release publish karne ki permission nahi hoti. Isko enable karne ke liye:
                </p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                  <div>1️⃣ Apne GitHub Repo me upar <strong>Settings</strong> tab (⚙️) par click karein.</div>
                  <div>2️⃣ Left menu me <strong>Actions</strong> ➔ <strong>General</strong> par jayein.</div>
                  <div>3️⃣ Niche scroll karein jab tak <strong>&quot;Workflow permissions&quot;</strong> na dikhe.</div>
                  <div className="text-emerald-400 font-bold">4️⃣ &quot;Read and write permissions&quot; ko SELECT karein.</div>
                  <div>5️⃣ Niche checkbox tick karein: <em>&quot;Allow GitHub Actions to create and approve pull requests&quot;</em>.</div>
                  <div>6️⃣ Green <strong>Save</strong> button daba dein!</div>
                </div>
              </div>

              {/* Step 2: Add build-apk.yml */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-sm text-white">
                      Repo me <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> file daalein
                    </h3>
                  </div>
                  <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-900 px-2 py-0.5 rounded font-mono">
                    Workflow File
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Apne project ke root folder me ye path hona chahiye:
                </p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>your-repo/.github/workflows/build-apk.yml</span>
                  <button
                    onClick={() => setActiveTab('workflow')}
                    className="text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-sans font-semibold transition"
                  >
                    View / Copy File
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  (Note: Agar aapne AI Studio se code export kiya hai ya zip download kiya hai, to ye file already included hai!)
                </p>
              </div>

              {/* Step 3: Commit & Run Workflow */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-bold text-sm text-white">
                      Code Commit & Push karein (Build Trigger karne ke liye)
                    </h3>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-2 py-0.5 rounded font-mono">
                    Auto-Build
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Jaise hi aap <code className="text-emerald-400 font-mono">git push origin main</code> karenge:
                </p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div>• GitHub automatically Ubuntu server par Flutter/Gradle run karega.</div>
                  <div>• 2 se 3 minute me APK build ho kar release me upload ho jayega.</div>
                  <div>• Aap GitHub ke <strong>Actions</strong> tab me live progress dekh sakte hain.</div>
                </div>
              </div>

              {/* Step 4: Where to Download APK */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      4
                    </span>
                    <h3 className="font-bold text-sm text-white">
                      APK Phone me Download Kahan se karein? (3 Tarike)
                    </h3>
                  </div>
                  <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-900 px-2 py-0.5 rounded font-mono">
                    Download Links
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Tarika 1 */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-emerald-400 block">Tarika 1: Direct Link (Best)</span>
                    <p className="text-slate-400 text-[11px]">
                      Apne phone browser me ye link kholein:
                    </p>
                    <code className="text-[10px] text-blue-300 block break-all bg-slate-900 p-1.5 rounded">
                      https://github.com/&lt;user&gt;/&lt;repo&gt;/releases/latest/download/app-release.apk
                    </code>
                    <p className="text-[10px] text-emerald-400">Single tap me direct APK download start hoga!</p>
                  </div>

                  {/* Tarika 2 */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-blue-400 block">Tarika 2: Releases Tab</span>
                    <p className="text-slate-400 text-[11px]">
                      Repo ke homepage par right side me <strong>Releases</strong> section dikhega.
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      Vahan <strong>&quot;Latest Android APK Build&quot;</strong> par click karein aur <code className="text-emerald-300">app-release.apk</code> download karein.
                    </p>
                  </div>

                  {/* Tarika 3 */}
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-bold text-purple-400 block">Tarika 3: Actions Artifacts</span>
                    <p className="text-slate-400 text-[11px]">
                      Repo me <strong>Actions</strong> tab me jayein ➔ Latest green build run kholein ➔ Niche <strong>Artifacts</strong> se download karein.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: STEP-BY-STEP PHONE GUIDE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            {/* Visual Process Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {[
                { num: 1, title: 'Prompt AI Studio', desc: 'Ask Gemini to create the GitHub Actions workflow' },
                { num: 2, title: 'Push to GitHub', desc: 'Sync code from AI Studio to your repository' },
                { num: 3, title: 'Cloud Compiles APK', desc: 'GitHub Actions runs flutter build apk --release' },
                { num: 4, title: 'Download on Phone', desc: 'Get direct public link or scan QR code' },
              ].map((step) => (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(step.num)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    activeStep === step.num
                      ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      activeStep === step.num ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.num}
                    </span>
                    <span className="text-xs font-bold text-white">{step.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Detailed Step Cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                    STEP 1
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Prompt Google AI Studio to Create the GitHub Actions CI/CD Pipeline
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  In Google AI Studio chat or prompt window, tell Gemini to generate the automated Android APK compilation file. 
                  This creates <code className="text-emerald-400 font-mono">.github/workflows/build-apk.yml</code> inside your project directory.
                </p>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 relative group">
                  <div className="text-[10px] text-slate-500 mb-1">Quick copy prompt:</div>
                  <p className="text-emerald-300">
                    &quot;Please add a GitHub Actions workflow to build an Android APK (.apk) on every commit, publish it to GitHub Releases, and output a direct phone download link with a QR code.&quot;
                  </p>
                  <button
                    onClick={() => handleCopyPrompt(99, 'Please add a GitHub Actions workflow to build an Android APK (.apk) on every commit, publish it to GitHub Releases, and output a direct phone download link with a QR code.')}
                    className="mt-2 text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 font-sans transition"
                  >
                    {copiedPromptIndex === 99 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPromptIndex === 99 ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
              </div>

              <hr className="border-slate-800" />

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold font-mono">
                    STEP 2
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Connect / Push Project to Your GitHub Account
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Export or push your project to a GitHub repository (e.g. <code className="text-blue-300">https://github.com/your-username/your-app</code>).
                  As soon as the repository receives the code with the <code className="text-slate-200">.github/workflows/build-apk.yml</code> file, 
                  <strong>GitHub automatically starts the cloud build</strong> on their fast Ubuntu runners.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-semibold text-emerald-400 block mb-1">✅ 100% Free on GitHub:</span>
                    <span className="text-slate-400">Public repositories get unlimited free GitHub Actions minutes for building APKs.</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="font-semibold text-blue-400 block mb-1">⚡ No Local Android Studio:</span>
                    <span className="text-slate-400">You don&apos;t need 20 GB of Android SDKs or Gradle installed on your phone or laptop.</span>
                  </div>
                </div>
              </div>

              <hr className="border-slate-800" />

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-bold font-mono">
                    STEP 3
                  </span>
                  <h3 className="text-base font-bold text-white">
                    GitHub Actions Automatically Compiles <code className="text-emerald-400">app-release.apk</code>
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Inside GitHub, navigate to the <strong>Actions</strong> tab. You will see a workflow running named 
                  <span className="text-slate-100 font-semibold"> &quot;Build & Release Android APK&quot;</span>. 
                  In roughly 2 to 3 minutes, it finishes and attaches the compiled <code className="text-emerald-300">app-release.apk</code> file!
                </p>
              </div>

              <hr className="border-slate-800" />

              {/* Step 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                    STEP 4
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Download & Install Directly on Your Android Phone
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Gemini provides the direct release URL format:
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-blue-400 break-all select-all">
                  https://github.com/&lt;your-username&gt;/&lt;your-repo&gt;/releases/latest/download/app-release.apk
                </div>

                {/* Android Phone Installation Guide */}
                <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-800/60 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Android Phone Installation Instructions:</span>
                  </h4>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <li>Open the direct download link in <strong>Chrome</strong> on your Android phone.</li>
                    <li>If prompted with <em>&quot;File might be harmful. Do you want to download app-release.apk anyway?&quot;</em>, tap <strong>Download anyway</strong>. (This standard warning appears for any APK not from the Google Play Store).</li>
                    <li>Once downloaded, tap <strong>Open</strong>.</li>
                    <li>If Android asks for permission: Tap <strong>Settings</strong> ➔ toggle <strong>Allow from this source</strong> ➔ go back and tap <strong>Install</strong>.</li>
                    <li>If Google Play Protect scans the app, tap <strong>Install anyway</strong>. Your new app is now installed on your phone home screen!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: COPY READY PROMPTS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="text-base font-bold text-white mb-1">
                AI Studio Ready-to-Copy Prompts
              </h2>
              <p className="text-xs text-slate-400">
                Copy and paste any of these tested prompts directly into Google AI Studio to trigger the automated APK build setup.
              </p>
            </div>

            <div className="space-y-4">
              {samplePrompts.map((p, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-emerald-400">{p.title}</h3>
                    <button
                      onClick={() => handleCopyPrompt(idx, p.prompt)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copiedPromptIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPromptIndex === idx ? 'Copied!' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">{p.description}</p>
                  <pre className="p-3 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap border border-slate-800/80 leading-relaxed">
                    {p.prompt}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: GITHUB ACTIONS WORKFLOW FILE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  <span>.github/workflows/build-apk.yml</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Place this file in your project&apos;s <code className="text-emerald-400">.github/workflows/</code> directory to compile APKs automatically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyWorkflow}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  {copiedWorkflow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWorkflow ? 'Copied' : 'Copy YAML'}</span>
                </button>

                <button
                  onClick={handleDownloadWorkflowFile}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .yml</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed">
              <pre className="whitespace-pre">
                {githubActionsWorkflow}
              </pre>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: LIVE BUILD SIMULATOR & QR CODE */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'simulator' && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Simulate Cloud APK Build & Generate Phone Download Link</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test the complete flow! Click the button below to simulate the GitHub Actions build runner compiling 
                the POSIndia Flutter app, verifying SHA-256 signatures, and generating the phone-ready APK package and QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Build Runner Console */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">GitHub Actions Runner</span>
                  </div>
                  <button
                    onClick={startBuildSimulation}
                    disabled={simState === 'building'}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                      simState === 'building'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                  >
                    {simState === 'building' ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Building...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Run Build Simulation</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {simState === 'building' && (
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-2">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${simProgress}%` }}
                    />
                  </div>
                )}

                {/* Terminal Logs */}
                <div className="flex-1 overflow-y-auto mt-2 font-mono text-[11px] space-y-1.5 p-2 bg-slate-950 rounded border border-slate-800/80 text-slate-300">
                  {simLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                      Press &quot;Run Build Simulation&quot; to test cloud APK generation
                    </div>
                  ) : (
                    simLogs.map((log, idx) => (
                      <div key={idx} className="leading-snug">
                        <span className="text-emerald-500 mr-1.5">➜</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Download / QR Code Result Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-[340px]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-white">Direct Phone Download Link</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900">
                      v1.0.0 Release
                    </span>
                  </div>

                  {simState === 'complete' ? (
                    <div className="py-3 flex items-center gap-4">
                      {/* Simulated QR Code */}
                      <div className="w-28 h-28 bg-white p-1.5 rounded-xl border border-slate-700 shadow-md flex items-center justify-center shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded p-1.5 flex flex-col items-center justify-center">
                          <div className="grid grid-cols-4 gap-1 w-full h-full p-1">
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                            <div className="bg-slate-800"></div>
                            <div className="bg-emerald-400 rounded-xs"></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-white">posindia-app-release.apk</div>
                        <div className="text-[11px] text-slate-400">Size: 18.4 MB • Architecture: arm64-v8a</div>
                        <div className="text-[10px] text-emerald-400 font-mono">Status: Ready to install</div>
                        <p className="text-[10px] text-slate-500 pt-1">
                          Scan this QR code with your phone camera or use the direct download link.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Smartphone className="w-10 h-10 text-slate-700" />
                      <span className="text-xs">Run build simulation to activate download links</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      if (simState !== 'complete') {
                        startBuildSimulation();
                        return;
                      }
                      // Download sample APK package bundle
                      const sampleContent = `POSIndia Android APK Release Package\nBuild: 1.0.0+1\nTarget: Android 14 (API 34)\nCompiled via Google AI Studio + GitHub Actions\nURL: https://posindia.shop`;
                      const blob = new Blob([sampleContent], { type: 'application/vnd.android.package-archive' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'posindia-app-release.apk';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                      simState === 'complete'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {simState === 'complete' ? 'Download posindia-app-release.apk (18.4 MB)' : 'Trigger Build to Download APK'}
                    </span>
                  </a>

                  <div className="text-[10px] text-slate-400 text-center font-mono truncate">
                    Direct URL: https://github.com/posindia/pos/releases/latest/download/app-release.apk
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

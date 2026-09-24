import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || null;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  /**
   * Explain deployment error logs using Gemini API
   * @param {Object} params
   * @param {string} params.errorMessage
   * @param {Array|string} params.logs
   * @param {string} params.framework
   * @param {string} params.buildCommand
   */
  async explainError({ errorMessage, logs, framework = 'React', buildCommand = 'npm run build', userApiKey }) {
    const activeKey = userApiKey || this.apiKey;
    const rawLogsText = Array.isArray(logs)
      ? logs.map(l => (typeof l === 'string' ? l : `[${l.stage || 'build'}] ${l.message}`)).join('\n')
      : String(logs || errorMessage || '');

    // If Gemini API key is available, call Google Gemini 1.5 / 2.0 Flash
    if (activeKey) {
      try {
        const prompt = `You are the Lead DevOps & Cloud AI Diagnostic Assistant for DeployHub, a modern developer deployment platform.
Analyze the following deployment/build error logs and explain the failure clearly and concisely.

Context:
Framework: ${framework}
Build Command: ${buildCommand}
Primary Error: ${errorMessage || 'Build failed'}

Deployment Logs:
\`\`\`
${rawLogsText.slice(-3000)}
\`\`\`

You must respond ONLY with a valid JSON object matching this exact structure:
{
  "headline": "Short 1-line headline summarizing what went wrong",
  "whatHappened": "Clear 2-3 sentence explanation of the failure in simple developer language",
  "whyItHappened": "Technical root cause explanation (e.g., missing package, syntax error, memory limit, wrong node version, missing environment variable)",
  "possibleSolution": "Clear step-by-step resolution instruction for the developer",
  "recommendedCommand": "Direct terminal command to fix it (e.g. npm install <package> or npx prisma generate), or null if not applicable",
  "preventionTip": "Proactive best-practice recommendation to prevent this issue in future CI/CD runs",
  "affectedFile": "Path/file name if identifiable from logs, or null"
}`;

        const resp = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          },
          { timeout: 12000 }
        );

        const candidate = resp.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          try {
            const parsed = JSON.parse(candidate);
            return {
              ...parsed,
              source: 'gemini-1.5-flash',
              success: true
            };
          } catch {
            // fallback if JSON parse fails
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in diagnostic engine:', err.message);
      }
    }

    // Built-in intelligent diagnostic engine
    return this.generateHeuristicAnalysis(errorMessage, rawLogsText, framework, buildCommand);
  }

  generateHeuristicAnalysis(errorMessage, logsText, framework, buildCommand) {
    const combined = `${errorMessage} ${logsText}`.toLowerCase();

    // Case 1: Missing NPM Module resolution error
    if (combined.includes('cannot find module') || combined.includes("could not resolve") || combined.includes("module not found")) {
      const match = logsText.match(/['"](@?[a-zA-Z0-9_\-\/]+)['"]/) || logsText.match(/resolve ['"]([^'"]+)['"]/);
      const pkgName = match ? match[1] : '@radix-ui/react-tooltip';

      return {
        source: 'deployhub-ai-engine',
        headline: `Missing Module Dependency: "${pkgName}"`,
        whatHappened: `The build failed because the application imported the package "${pkgName}", but it was not listed in package.json dependencies or installed during the build step.`,
        whyItHappened: `The bundler encountered an unresolved import in your component tree. This typically happens when a package is installed locally without being saved to dependencies, or when peer dependencies are missing.`,
        possibleSolution: `Install the missing package in your project root, verify it is committed to your package.json, and push to trigger a fresh deployment.`,
        recommendedCommand: `npm install ${pkgName}`,
        preventionTip: `Ensure all external imports are added via "npm install <package> --save" and verify that your package-lock.json is committed to Git.`,
        affectedFile: logsText.match(/from ['"]([^'"]+)['"]/)?.[1] || 'src/components/Tooltip.tsx',
        success: true
      };
    }

    // Case 2: Environment Variable Missing
    if (combined.includes('environment variable') || combined.includes('process.env') || combined.includes('api_key') || combined.includes('database_url')) {
      return {
        source: 'deployhub-ai-engine',
        headline: `Missing Required Environment Variable`,
        whatHappened: `The application failed during initialization or build because a critical environment variable (such as DATABASE_URL or API_KEY) was undefined.`,
        whyItHappened: `Your application code or ORM schema references process.env variables that were not configured in the DeployHub Project Settings.`,
        possibleSolution: `Navigate to your Project Settings > Environment Variables in DeployHub, add the missing secret keys, and redeploy.`,
        recommendedCommand: `deployhub env set DATABASE_URL="postgresql://..."`,
        preventionTip: `Use a type-safe schema validator like Zod or t3-env to validate all environment variables at startup and provide clear error messages.`,
        affectedFile: '.env',
        success: true
      };
    }

    // Case 3: TypeScript Compilation / Type Error
    if (combined.includes('ts') || combined.includes('type error') || combined.includes('typescript')) {
      return {
        source: 'deployhub-ai-engine',
        headline: `TypeScript Compilation Error`,
        whatHappened: `TypeScript compiler ("tsc") failed with type mismatches or unresolved interfaces during the production build.`,
        whyItHappened: `Strict type checking detected invalid property access or incompatible types that prevent generating JavaScript output.`,
        possibleSolution: `Run "npx tsc --noEmit" locally to inspect and fix all type errors before deploying.`,
        recommendedCommand: `npx tsc --noEmit`,
        preventionTip: `Add a pre-commit git hook with Husky or run "npm run typecheck" in your pull request workflow.`,
        affectedFile: 'src/types/index.ts',
        success: true
      };
    }

    // Case 4: Out of Memory / Heap allocation
    if (combined.includes('out of memory') || combined.includes('heap out of memory') || combined.includes('javascript heap')) {
      return {
        source: 'deployhub-ai-engine',
        headline: `Node.js V8 Heap Out of Memory`,
        whatHappened: `The build process exceeded the allocated container memory limit while bundling large asset chunks or source maps.`,
        whyItHappened: `V8 default memory limit was reached during Webpack/Next.js asset generation.`,
        possibleSolution: `Increase the Node max old space size in your build script or project settings.`,
        recommendedCommand: `NODE_OPTIONS="--max-old-space-size=4096" ${buildCommand}`,
        preventionTip: `Optimize large static imports, dynamic-import heavy client components, and disable source maps in production builds.`,
        affectedFile: 'package.json',
        success: true
      };
    }

    // Default general diagnostic
    return {
      source: 'deployhub-ai-engine',
      headline: `Build Command "${buildCommand}" Terminated With Error`,
      whatHappened: `The build process exited with an error code during execution. The framework was unable to complete the artifact generation.`,
      whyItHappened: `A fatal runtime or compilation error occurred in the build pipeline. Please inspect the highlighted error stack trace.`,
      possibleSolution: `Check that your build command works locally by running "${buildCommand}" in a clean clone, verify all dependencies are committed, and retry deployment.`,
      recommendedCommand: `npm run build`,
      preventionTip: `Test your build locally in clean CI mode using "npm ci && ${buildCommand}".`,
      affectedFile: null,
      success: true
    };
  }
}

export const aiService = new AIService();
export default aiService;

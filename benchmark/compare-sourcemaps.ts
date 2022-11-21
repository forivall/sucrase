#!./node_modules/.bin/sucrase-node
/* eslint-disable no-console */
import {exec} from "mz/child_process";
import {writeFile} from "mz/fs";

interface BenchmarkResult {
  name: string;
  totalTime: number;
  linesPerSecond: number;
  totalLines: number;
  sourceMaps?: {simple?: boolean};
}

interface BenchmarkSummary {
  title: string;
  speeds: Array<number>;
}

interface BenchmarkRuns {
  flag: string;
  runs: Array<BenchmarkResult>;
}

// Handle SIGINT, which makes it so the child benchmark process is stopped with
// an exception and we hit the finally block to switch back to the original
// branch.
process.on("SIGINT", () => {
  console.log("Detected SIGINT, letting main process clean up...");
});

async function main(): Promise<void> {
  const results = await runBenchmarks("--sourceMaps", "--sourceMaps=simple");
  const summary = summarizeComparison(results);
  console.log(summary);
  await exec("mkdir -p ./.perf-comparison");
  await writeFile("./.perf-comparison/sourcemaps.txt", summary);
}

async function runBenchmarks(...flags: Array<string>): Promise<Array<BenchmarkSummary>> {
  flags.unshift(""); // base
  const benchmarks = flags.map((flag): BenchmarkRuns => ({flag, runs: []}));
  for (let i = 0; i < 5; i++) {
    for (const {flag, runs} of benchmarks) {
      const result = await runBenchmark(flag);
      console.log(result);
      runs.push(result);
    }
  }

  const summary = benchmarks.map(({flag, runs}) => {
    const speeds = runs.map((r) => r.linesPerSecond).sort((a, b) => a - b);
    const title = `${sourcemapsDescription(runs[0])} sourcemaps`;
    console.log(`Speeds for ${title}: ${speeds.join(", ")}`);
    return {title, speeds};
  });

  return summary;
}

function sourcemapsDescription(result: BenchmarkResult): string {
  if (result.sourceMaps) {
    return result.sourceMaps.simple ? "Simple" : "Full";
  }
  return "No";
}

function formatSpeed(speed: number): string {
  const thousandLinesPerSecond = speed / 1000;
  return `${Math.round(thousandLinesPerSecond * 10) / 10} thousand lines per second`;
}

function describeDifference(base: number, other: number): string {
  if (other > base) {
    const percentFaster = (other / base - 1) * 100;
    return `${Math.round(percentFaster * 100) / 100}% faster`;
  } else if (other < base) {
    const percentSlower = (1 - other / base) * 100;
    return `${Math.round(percentSlower * 100) / 100}% slower`;
  } else {
    return "same speed";
  }
}

function summarizeComparison(results: Array<BenchmarkSummary>): string {
  const [{speeds: baseSpeeds}] = results;
  const summary = `\
## Benchmark results
${results.map(({title, speeds}) => `**${title}:** ${formatSpeed(speeds[2])}`).join("\n")}

### Change
${results
  .slice(1)
  .map(({title, speeds}) => {
    const fair = describeDifference(baseSpeeds[2], speeds[2]);
    const pessimistic = describeDifference(baseSpeeds[3], speeds[3]);
    const optimistic = describeDifference(baseSpeeds[1], speeds[1]);
    return `**${title}:** ${fair} (${pessimistic} to ${optimistic})`;
  })
  .join("\n")}
`;
  return summary;
}

async function runBenchmark(flags: string): Promise<BenchmarkResult> {
  const command = `node -r sucrase/register benchmark/benchmark.ts jest-diff ${flags}`;
  return JSON.parse((await exec(command))[0].toString());
}

main().catch((e) => {
  if (e.signal !== "SIGINT") {
    console.error("Unhandled error:");
    console.error(e);
    process.exitCode = 1;
  }
});

import React from 'react'
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Code2, MessageCircle, Rocket, Sparkles, Trophy, Users } from "lucide-react";

const featureData = [
  {
    icon: <Code2 className="h-6 w-6 text-primary" />,
    title: "Curated Problems",
    description: "Hand-picked questions with editorials, tags, and difficulty indicators."
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-primary" />,
    title: "Live Discussions",
    description: "Collaborate in real-time via discussion threads and code reviews."
  },
  {
    icon: <Rocket className="h-6 w-6 text-primary" />,
    title: "Instant Execution",
    description: "Run code in the browser with the integrated Monaco editor + Piston."
  },
  {
    icon: <Trophy className="h-6 w-6 text-primary" />,
    title: "Progress Insights",
    description: "Track acceptance rate, solved counts, and streaks at a glance."
  }
];

const stats = [
  { label: "Problems", value: "350+" },
  { label: "Active Coders", value: "12k" },
  { label: "Daily Submissions", value: "48k" },
  { label: "Communities", value: "120+" },
];

const steps = [
  "Create your profile and set learning goals.",
  "Pick a problem, code in the built-in editor, run against test cases.",
  "Discuss solutions, compare approaches, and climb the leaderboard."
];

const Home = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-transparent dark:from-indigo-900/40 dark:via-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:flex-row lg:items-center lg:gap-10">
          <div className="flex-1 space-y-8">
            <motion.span
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-primary dark:text-primary-foreground/80"
            >
              <Sparkles className="h-4 w-4" /> Built for code explorers
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              Ship better solutions faster with a collaborative coding HQ.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base text-muted-foreground sm:text-lg"
            >
              From daily practice to contest-ready preparation, streamline everything:
              read challenges, test locally, discuss live, and showcase your progress in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
              <Link to="/problems" className="inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                <Button size="lg" className="w-full px-6 py-6 text-base sm:w-auto">
                  Start Solving
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register" className="inline-flex w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full px-6 py-6 text-base dark:border-white/20 sm:w-auto"
                >
                  Create Account
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-card/60 p-4 shadow-lg backdrop-blur sm:gap-6 sm:p-6"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-primary sm:text-3xl">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full flex-1 rounded-2xl border border-border/40 bg-card/70 p-4 shadow-2xl backdrop-blur sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Team Rooms</p>
                  <p className="text-xs text-muted-foreground">
                    Pair program and brainstorm in synced editor sessions.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-primary/30 bg-background/60 p-4">
                <div className="rounded-xl bg-slate-900 p-4 text-left text-slate-100 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live Session</p>
                  <pre className="mt-3 overflow-x-auto text-sm">
{`function bestSlidingWindow(nums, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum;

  for (let r = k; r < nums.length; r++) {
    sum += nums[r] - nums[r - k];
    best = Math.max(best, sum);
  }
  return best / k;
}`}
                  </pre>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-muted/40 px-4 py-3">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=code"
                  alt="avatar"
                  className="h-12 w-12 rounded-full border border-white/30"
                />
                <div>
                  <p className="break-words font-semibold">"Pairing here got me contest-ready in weeks!"</p>
                  <p className="text-sm text-muted-foreground">Sanya, regional ICPC finalist</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-12 space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">Features</p>
          <h2 className="text-3xl font-bold sm:text-4xl">Everything you need to stay sharp</h2>
          <p className="text-muted-foreground">
            The toolkit blends structured practice with community-powered learning.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featureData.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-md transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:gap-12">
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">How it works</p>
            <h2 className="text-3xl font-bold sm:text-4xl">Get productive in three steps</h2>
            <div className="space-y-5">
              {steps.map((step, index) => (
                <div key={step} className="flex items-start gap-4 rounded-2xl bg-background p-4 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            <Link to="/submission">
              <Button variant="ghost" className="gap-2 text-primary">
                View latest submissions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="flex-1 rounded-2xl border border-border/40 bg-card p-4 shadow-xl sm:rounded-3xl sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Community challenge</p>
                <h3 className="text-2xl font-bold">Week of Sliding Windows</h3>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li>• Unlock five curated problems that progress in difficulty.</li>
              <li>• Share patterns in the discussion board to collect insights.</li>
              <li>• Submit daily to maintain your streak and earn badges.</li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link to="/Chats" className="flex-1">
                <Button className="w-full">Join Discussion</Button>
              </Link>
              <Link to="/Landing" className="flex-1">
                <Button variant="outline" className="w-full">Explore Playground</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home;

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios.config';
import { Medal, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ContestLeaderboardPage = () => {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    try {
      setError('');
      const [contestResponse, leaderboardResponse] = await Promise.all([
        axios.get(`/api/contests/${contestId}`),
        axios.get(`/api/contests/${contestId}/leaderboard`),
      ]);
      setContest(contestResponse.data);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);
      setStatus(leaderboardResponse.data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [contestId]);

  useEffect(() => {
    if (status !== 'running') return;
    const timer = setInterval(fetchLeaderboard, 15000);
    return () => clearInterval(timer);
  }, [status, contestId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <p className="text-center text-muted-foreground">Loading leaderboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-20 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to={`/contest/${contestId}`} className="text-sm font-medium text-primary hover:underline">
              Back to contest
            </Link>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{contest?.title || 'Contest'} Leaderboard</h1>
            <p className="mt-2 text-muted-foreground">
              Best score per problem is counted. Ties are sorted by solved count and earlier activity.
            </p>
          </div>
          <Button onClick={fetchLeaderboard} variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        {!error && leaderboard.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No contest submissions yet.
            </CardContent>
          </Card>
        )}

        {leaderboard.length > 0 && (
          <>
            <div className="grid gap-3 md:hidden">
              {leaderboard.map(row => (
                <Card key={row.userId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4 text-primary" />
                          <span className="font-black">#{row.rank}</span>
                        </div>
                        <p className="mt-2 truncate text-lg font-semibold">{row.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{row.totalScore}</p>
                        <p className="text-xs text-muted-foreground">{row.problemsSolved} solved</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {row.problemScores.map(problemScore => (
                        <span key={problemScore.problemId} className="rounded-full bg-muted px-2 py-1 text-xs">
                          {problemScore.problemname}: {problemScore.score}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="hidden overflow-hidden md:block">
              <CardHeader>
                <CardTitle>Rankings</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left">Rank</th>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Solved</th>
                      <th className="px-4 py-3 text-left">Problem Scores</th>
                      <th className="px-4 py-3 text-left">Last Submit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(row => (
                      <tr key={row.userId} className="border-b last:border-0">
                        <td className="px-4 py-3 font-black">#{row.rank}</td>
                        <td className="px-4 py-3 font-semibold">{row.username}</td>
                        <td className="px-4 py-3 text-primary font-black">{row.totalScore}</td>
                        <td className="px-4 py-3">{row.problemsSolved}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {row.problemScores.map(problemScore => (
                              <span key={problemScore.problemId} className="rounded-full bg-muted px-2 py-1 text-xs">
                                {problemScore.problemname}: {problemScore.score}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.lastSubmissionTime ? new Date(row.lastSubmissionTime).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </section>
    </main>
  );
};

export default ContestLeaderboardPage;

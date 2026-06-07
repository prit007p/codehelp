import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios.config';
import { CalendarClock, Lock, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const statusStyles = {
  upcoming: 'bg-blue-500/15 text-blue-600',
  running: 'bg-green-500/15 text-green-600',
  ended: 'bg-muted text-muted-foreground',
};

const formatDateTime = (value) => new Date(value).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const ContestDetailPage = () => {
  const { contestId } = useParams();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [problemMessage, setProblemMessage] = useState('');

  const fetchContest = async () => {
    const response = await axios.get(`/api/contests/${contestId}`);
    setContest(response.data);
    return response.data;
  };

  const fetchProblems = async () => {
    try {
      const response = await axios.get(`/api/contests/${contestId}/problems`);
      setProblems(response.data || []);
      setProblemMessage('');
    } catch (err) {
      setProblems([]);
      setProblemMessage(err.response?.data?.message || 'Problems are not available yet.');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const contestData = await fetchContest();
        if (contestData.status !== 'upcoming' && contestData.isRegistered) {
          await fetchProblems();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load contest');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [contestId]);

  const registerForContest = async () => {
    try {
      setActionLoading(true);
      await axios.post(`/api/contests/${contestId}/register`);
      const contestData = await fetchContest();
      if (contestData.status !== 'upcoming') {
        await fetchProblems();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for contest');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <p className="text-center text-muted-foreground">Loading contest...</p>
      </main>
    );
  }

  if (error && !contest) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <Card className="mx-auto max-w-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-destructive">{error}</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-20 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[contest.status] || statusStyles.ended}`}>
                  {contest.status}
                </span>
                <CardTitle className="mt-3 break-words text-3xl font-black sm:text-4xl">{contest.title}</CardTitle>
                <p className="mt-3 max-w-3xl whitespace-pre-wrap text-muted-foreground">
                  {contest.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                {!contest.isRegistered && contest.status !== 'ended' && (
                  <Button onClick={registerForContest} disabled={actionLoading}>
                    {actionLoading ? 'Registering...' : 'Register'}
                  </Button>
                )}
                <Link to={`/contest/${contest._id}/leaderboard`}>
                  <Button variant="outline" className="w-full">Leaderboard</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span>Starts {formatDateTime(contest.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <CalendarClock className="h-4 w-4 text-primary" />
              <span>Ends {formatDateTime(contest.endTime)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Trophy className="h-4 w-4 text-primary" />
              <span>{contest.problems?.length || 0} problems</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Users className="h-4 w-4 text-primary" />
              <span>{contest.participantCount || 0} participants</span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contest Problems</CardTitle>
          </CardHeader>
          <CardContent>
            {!contest.isRegistered && contest.status !== 'ended' ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Lock className="h-8 w-8" />
                <p>Register to access problems when the contest starts.</p>
              </div>
            ) : problemMessage ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Lock className="h-8 w-8" />
                <p>{problemMessage}</p>
              </div>
            ) : problems.length === 0 ? (
              <p className="text-muted-foreground">No problems are available yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {problems.map(problem => (
                  <Link
                    key={problem._id}
                    to={`/contest/${contest._id}/problem/${problem._id}`}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="break-words font-semibold text-primary">{problem.problemName}</h2>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {problem.tags?.slice(0, 4).map(tag => (
                            <span key={tag} className="rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                        {problem.difficulty}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default ContestDetailPage;

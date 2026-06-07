import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios.config';
import { CalendarClock, Trophy, Users } from 'lucide-react';
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

const ContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get('/api/contests');
        setContests(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load contests');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const filteredContests = useMemo(() => (
    filter === 'all' ? contests : contests.filter(contest => contest.status === filter)
  ), [contests, filter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <p className="text-center text-muted-foreground">Loading contests...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-20 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Compete</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Coding Contests</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Register for timed contests, solve curated problems, and climb the live leaderboard.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'running', 'upcoming', 'ended'].map(status => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status)}
                className="shrink-0 capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        {!error && filteredContests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No contests found for this filter.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {filteredContests.map(contest => (
            <Card key={contest._id} className="overflow-hidden">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="break-words text-2xl">{contest.title}</CardTitle>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[contest.status] || statusStyles.ended}`}>
                    {contest.status}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{contest.description || 'No description provided.'}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <span>{formatDateTime(contest.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>{contest.problems?.length || 0} problems</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{contest.participantCount || 0} registered</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link to={`/contest/${contest._id}`} className="w-full sm:w-auto">
                    <Button className="w-full">{contest.isRegistered ? 'Open Contest' : 'View Details'}</Button>
                  </Link>
                  <Link to={`/contest/${contest._id}/leaderboard`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">Leaderboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ContestsPage;

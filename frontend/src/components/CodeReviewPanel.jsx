import { useState } from 'react';
import axios from 'axios.config';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const severityStyles = {
  high: 'border-destructive/30 bg-destructive/10 text-destructive',
  medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  low: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
};

const ScoreBadge = ({ score }) => {
  const colorClass = score >= 85
    ? 'bg-green-500/15 text-green-600'
    : score >= 65
      ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
      : 'bg-destructive/15 text-destructive';

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${colorClass}`}>
      {score}/100
    </span>
  );
};

const CodeReviewPanel = ({ code, language, version }) => {
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Write some code before requesting a review.');
      setReview(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/code-review', {
        language,
        version,
        files: [{ content: code }],
      });
      setReview(response.data);
    } catch (err) {
      setReview(null);
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not review this code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Code Review
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">Get quick feedback before you submit.</p>
        </div>
        <Button type="button" onClick={handleReview} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
          {loading ? 'Reviewing...' : 'Review Code'}
        </Button>
      </CardHeader>

      {(error || review) && (
        <CardContent className="space-y-4 p-4 pt-0">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {review && (
            <>
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{review.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.metrics.nonEmptyLines} lines reviewed, estimated complexity {review.metrics.estimatedComplexity}
                  </p>
                </div>
                <ScoreBadge score={review.score} />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {review.checklist?.map(item => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                    {item.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {review.strengths?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">What looks good</p>
                  <div className="space-y-2">
                    {review.strengths.map((strength, index) => (
                      <div key={`${strength}-${index}`} className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-sm text-green-700 dark:text-green-400">
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {review.suggestions?.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Suggestions</p>
                  <div className="space-y-2">
                    {review.suggestions.map((suggestion, index) => (
                      <div key={`${suggestion.title}-${index}`} className={`rounded-lg border p-3 text-sm ${severityStyles[suggestion.severity] || severityStyles.low}`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-semibold capitalize">{suggestion.severity}: {suggestion.title}</p>
                            <p className="mt-1">{suggestion.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CodeReviewPanel;

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";

const ProblemslistPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed: const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('none'); // 'difficulty-asc', 'difficulty-desc', 'name-asc', 'name-desc', 'status-solved-unsolved', 'status-unsolved-solved'
  const [selectedTag, setSelectedTag] = useState('All');

  const showToast = ({ title, description, status }) => {
    if (title) alert(`${title}${description ? '\n' + description : ''}`);
  };

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('/api/problems');
        setProblems(response.data);
        // console.log(response.data);
      } catch (err) {
        setError("Failed to fetch problems. Please try again later.");
        showToast({ title: "Error", description: "Failed to fetch problems.", status: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    problems.forEach(problem => {
      if (problem.tags && Array.isArray(problem.tags)) {
        problem.tags.forEach(tag => tags.add(tag));
      }
    });
    return ['All', ...Array.from(tags).sort()];
  }, [problems]);

  const filteredAndSortedProblems = useMemo(() => {
    let processedProblems = [...problems];

    // Apply tag filter
    if (selectedTag !== 'All') {
      processedProblems = processedProblems.filter(problem =>
        problem.tags && problem.tags.includes(selectedTag)
      );
    }

    // Apply sorting
    if (sortBy === 'none') {
      return processedProblems;
    }

    processedProblems.sort((a, b) => {
      if (sortBy === 'difficulty-asc') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
      } else if (sortBy === 'difficulty-desc') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (difficultyOrder[b.difficulty] || 0) - (difficultyOrder[a.difficulty] || 0);
      } else if (sortBy === 'name-asc') {
        return (a.problemName || '').localeCompare(b.problemName || '');
      } else if (sortBy === 'name-desc') {
        return (b.problemName || '').localeCompare(a.problemName || '');
      } else if (sortBy === 'status-solved-unsolved') {
        const statusA = a.status === 'Solved' || a.status === 'Accepted' ? 1 : 0;
        const statusB = b.status === 'Solved' || b.status === 'Accepted' ? 1 : 0;
        if (statusA !== statusB) {
          return statusB - statusA; 
        } else {
          return (a.problemName || '').localeCompare(b.problemName || ''); 
        }
      } else if (sortBy === 'status-unsolved-solved') {
        const statusA = a.status === 'Solved' || a.status === 'Accepted' ? 1 : 0;
        const statusB = b.status === 'Solved' || b.status === 'Accepted' ? 1 : 0;
        if (statusA !== statusB) {
          return statusA - statusB; 
        } else {
          return (a.problemName || '').localeCompare(b.problemName || ''); 
        }
      }
      return 0;
    });
    return processedProblems;
  }, [problems, sortBy, selectedTag]);

  if (loading) {
    return (
      <Card className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-700">Loading problems...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="min-h-screen bg-background text-foreground border-none rounded-none pt-16">
      <CardHeader>
        <h1 className="text-4xl font-extrabold text-card-foreground mb-4 text-center">Problems List</h1>
        <p className="text-lg text-muted-foreground mb-6 text-center">Browse and solve competitive programming problems.</p>
      </CardHeader>
      <CardContent>
        <Card className="shadow-md rounded-lg p-6">
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <label htmlFor="tag-filter" className="mr-2 text-foreground">Filter by Tag:</label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring shadow-sm bg-input text-foreground"
            >
              {uniqueTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-foreground">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring shadow-sm bg-input text-foreground"
            >
              <option value="none">None</option>
              <option value="difficulty-asc">Difficulty (Easy to Hard)</option>
              <option value="difficulty-desc">Difficulty (Hard to Easy)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="status-solved-unsolved">Status (Solved then Unsolved)</option>
              <option value="status-unsolved-solved">Status (Unsolved then Solved)</option>
            </select>
          </div>
        </div>

        {filteredAndSortedProblems.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">No problems found matching your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card border border-border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Problem Name</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tags</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedProblems.map((problem) => (
                  <tr key={problem._id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Link to={`/problem/${problem._id}`} className="text-primary hover:underline font-medium">
                        {problem.problemName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {problem.tags && problem.tags.length > 0 ? (
                        problem.tags.map((tag, index) => (
                          <span key={index} className="inline-block bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {tag}
                          </span>
                        ))
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        problem.difficulty === 'Hard' ? 'bg-destructive/20 text-destructive' : problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-green-500/20 text-green-600'}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        problem.status === 'Accepted' ? 'bg-green-500/20 text-green-600' :
                        problem.status === 'Wrong Answer' ? 'bg-destructive/20 text-destructive' :
                        problem.status === 'Solved' ? 'bg-blue-500/20 text-blue-600' :
                        'bg-muted/50 text-muted-foreground'
                      }`}>
                        {problem.status || 'Unsolved'}
                      </span>
                      {problem.remark && problem.status !== 'Unsolved' && (
                        <p className="text-xs text-muted-foreground mt-1">Remarks: {problem.remark}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      </CardContent>
    </Card>
  );
};

export default ProblemslistPage; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); 

  const showToast = ({ title, description, status }) => {
    if (title) alert(`${title}${description ? '\n' + description : ''}`);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const navigate = useNavigate();
      const token = Cookies.get('token');
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/api/profile', token);
        if(response.data.status === false){
          setLoading(false);
          navigate('/login');
          return;
        }
        setRole(response.data.role);
        setUserProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile.");
        setLoading(false);
        showToast({ title: "Error", description: "Failed to fetch user profile.", status: "error" });
      }
    };
    fetchUserProfile();
  }, []);

  const fetchFriends = async () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const response = await axios.get('/api/users/friends', token);
      setFriends(response.data.friends);
      setFriendRequests(response.data.friendRequests);
    } catch (err) {
      console.error("Error fetching friends/requests:", err);
      showToast({ title: "Error", description: "Failed to fetch friends or requests.", status: "error" });
    }
  };

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    }
  }, [activeTab]);

  const handleAcceptRequest = async (requestId) => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      await axios.post('/api/users/accept-friend-request', { requestId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({ title: "Request Accepted", description: "Friend added!", status: "success" });
      fetchFriends(); // Refresh lists
    } catch (err) {
      console.error("Error accepting request:", err);
      showToast({ title: "Error", description: "Failed to accept friend request.", status: "error" });
    }
  };

  const handleRejectRequest = async (requestId) => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      await axios.post('/api/users/reject-friend-request', { requestId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast({ title: "Request Rejected", description: "Friend request declined.", status: "info" });
      fetchFriends(); // Refresh lists
    } catch (err) {
      console.error("Error rejecting request:", err);
      showToast({ title: "Error", description: "Failed to reject friend request.", status: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">No profile data available.</p>
      </div>
    );
  }

  const totalProblems = userProfile.problemsSolved.length;
  const acceptedProblems = userProfile.problemsSolved.filter(p => p.status === 'Accepted').length;
  const wrongAnswerProblems = userProfile.problemsSolved.filter(p => p.status === 'Wrong Answer').length;
  const timeLimitExceededProblems = userProfile.problemsSolved.filter(p => p.status === 'Time Limit Exceeded').length;
  const runtimeErrorProblems = userProfile.problemsSolved.filter(p => p.status === 'Runtime Error').length;

  return (
    <div className="container mx-auto p-4 pt-20 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-6">
          <img 
            src={`https://ui-avatars.com/api/?name=${userProfile.username.charAt(0)}&background=random&color=fff`}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-4 border-blue-400 object-cover"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{userProfile.username}</h1>
            <p className="text-gray-600 text-lg">{userProfile.email}</p>
            <p className="text-gray-500 text-sm">Member since: {new Date(userProfile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              className={`
                ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none
              `}
              onClick={() => setActiveTab('profile')}
            >
              Overview
            </button>
            <button
              className={`
                ${activeTab === 'submissions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none
              `}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions
            </button>
            <button
              className={`
                ${activeTab === 'friends' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg focus:outline-none
              `}
              onClick={() => setActiveTab('friends')}
            >
              Friends
            </button>
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Submission Statistics</h2>
                <div className="max-h-60 overflow-y-auto pr-2 border border-gray-200 rounded-md p-4">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Total Problems Attempted: <span className="font-semibold">{totalProblems}</span></li>
                    <li>Accepted: <span className="font-semibold text-green-600">{acceptedProblems}</span></li>
                    <li>Wrong Answer: <span className="font-semibold text-red-600">{wrongAnswerProblems}</span></li>
                    <li>Time Limit Exceeded: <span className="font-semibold text-yellow-600">{timeLimitExceededProblems}</span></li>
                    <li>Runtime Error: <span className="font-semibold text-red-600">{runtimeErrorProblems}</span></li>
                  </ul>
                  {/* Example of Marquee usage, if desired for stats, otherwise remove */}
                  {/* <Marquee pauseOnHover className="[--duration:20s]">
                    <div className="flex space-x-4 pr-10">
                      <span>Total Problems: {totalProblems}</span>
                      <span>Accepted: {acceptedProblems}</span>
                      <span>Wrong Answer: {wrongAnswerProblems}</span>
                    </div>
                  </Marquee> */}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Friends & Messaging</h2>
                <p className="text-gray-700">This section will display your friends and allow you to send personal messages.</p>
                {/* Placeholder for future friend list and messaging UI */}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Submissions</h2>
              {userProfile.submissions && userProfile.submissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Problem</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Language</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userProfile.submissions.map((submission) => (
                        <tr key={submission._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 text-blue-600 hover:underline"><a href={`/problem/${submission.problemId}`}>{submission.problemTitle}</a></td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${submission.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{submission.language}</td>
                          <td className="py-3 px-4 text-gray-700">{new Date(submission.submittedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500">No submissions yet.</p>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Friend Requests</h2>
                {friendRequests.length > 0 ? (
                  <div className="space-y-3">
                    {friendRequests.map(request => (
                      <div key={request._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm">
                        <span className="text-gray-800 font-medium">{request.sender.username}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No pending friend requests.</p>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Friends</h2>
                {friends.length > 0 ? (
                  <div className="space-y-3">
                    {friends.map(friend => (
                      <div key={friend._id} className="flex items-center bg-gray-50 p-3 rounded-md shadow-sm">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${friend.username.charAt(0)}&background=random&color=fff`}
                          alt="Friend Avatar"
                          className="w-9 h-9 rounded-full mr-3 object-cover"
                        />
                        <span className="text-gray-800 font-medium">{friend.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">You have no friends yet. Use the "Find/Add Friend" feature in the navbar!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
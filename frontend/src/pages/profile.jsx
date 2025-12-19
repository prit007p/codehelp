import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import axiosInstance from 'axios.config';
import axios from 'axios';
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Search, Mail, Calendar, Users, CheckCircle, XCircle, MessageCircle, Settings, LogOut, Camera, UserPlus } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import ModeToggle from '@/components/Themechanger'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'

const Profile = () => {
    const [user, setUser] = useState({});
    const [find, setFind] = useState("");
    const [findfriend, setFindfriends] = useState([]);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [friends, setFriends] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const [totalSubmissions, setTotalSubmission] = useState(0);
    const [acceptedSubmissions, setAcceptedSubmission] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const navigate = useNavigate();

    const token = Cookies.get("token");
    const { theme } = useTheme();

    // Calculate acceptance rate
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    useEffect(() => {
        const fetchuser = async () => {
            try {
                setIsLoading(true);
                const res = await axiosInstance.get('/api/profile');
                if (res.data.status === false) {
                    navigate('/login');
                }
                if (res.data) {
                    setUser(res.data);
                    setEditUsername(res.data.username);
                    setEditEmail(res.data.email);
                    setTotalSubmission(res.data.totalSubmissions || 0);
                    setAcceptedSubmission(res.data.acceptedSubmissions || 0);
                    setFriends(res.data.friends || []);
                }
                toast.success("Welcome to your profile!");
            } catch (err) {
                console.log("error in fetching user", err);
                if (err.response && err.response.status === 401 && err.response.data.redirect) {
                    window.location.href = err.response.data.redirect;
                } else {
                    toast.error("Error getting user info");
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchuser();

        const fetchsubmission = async () => {
            try {
                const submissions = await axiosInstance.get('/api/problems/submission');
                const submissionsData = submissions.data || [];
                setTotalSubmission(submissionsData.length);
                const count = submissionsData.filter(obj => obj.status === "accepted").length;
                setAcceptedSubmission(count);
            } catch (err) {
                console.log("Error fetching submissions", err);
            }
        };
        fetchsubmission();
    }, []);

    async function handleSave() {
        let avatarUrl = user?.avatar;

        if (avatarFile) {
            try {
                const signatureRes = await axiosInstance.get('/api/get-signature', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const { signature, timestamp, api_key, cloud_name, folder } = signatureRes.data;

                const formData = new FormData();
                formData.append("file", avatarFile);
                formData.append("api_key", api_key);
                formData.append("timestamp", timestamp);
                formData.append("signature", signature);
                formData.append("folder", folder);

                const cloudinaryUploadRes = await axios.post(
                    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                avatarUrl = cloudinaryUploadRes.data.secure_url;
                toast.success("Avatar uploaded successfully!");
            } catch (uploadError) {
                console.error("Error uploading avatar to Cloudinary", uploadError);
                toast.error("Failed to upload avatar.");
                return;
            }
        }

        try {
            const res = await axiosInstance.put('/api/profile', {
                username: editUsername,
                email: editEmail,
                avatar: avatarUrl,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            setEditUsername(res.data.username);
            setEditEmail(res.data.email);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile", err);
            toast.error(err.response?.data?.message || "Failed to update profile.");
        }
    }

    async function searchfriend(e) {
        const value = e.target.value;
        setFind(value);
        if (!value.trim()) {
            setFindfriends([]);
            return;
        }
        try {
            setSearchLoading(true);
            const res = await axiosInstance.get('/api/profile/findfriend', {
                params: { findfriend: value }
            });
            setFindfriends(res.data || []);
        } catch (err) {
            console.error('error in finding friend', err);
        } finally {
            setSearchLoading(false);
        }
    }

    const handleLogout = () => {
        Cookies.remove("token");
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    async function addfriend(username) {
        try {
            const res = await axiosInstance.post('/api/profile/add-friend', { username });
            toast.success(res.data.message);
        } catch (err) {
            console.log("error in adding friend", err);
            toast.error(err.response?.data?.message || "Failed to add friend");
        }
    }

    const openChat = (friendId) => {
        navigate(`/chat/${friendId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center pt-16">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-primary/20"></div>
                    <div className="h-4 w-32 bg-primary/20 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-20 pb-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Profile Header Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
                    <CardContent className="relative p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Avatar Section */}
                            <div className="relative group">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-primary/60 p-1 shadow-xl shadow-primary/20">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                                            <User className="w-12 h-12 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                    {user?.username}
                                </h1>
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Member since {new Date(user?.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/50">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">{friends?.length || 0}</span>
                                        <span className="text-muted-foreground text-sm">Friends</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="font-semibold text-green-500">{acceptanceRate}%</span>
                                        <span className="text-muted-foreground text-sm">Success</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <ModeToggle />
                                <Button variant="destructive" size="icon" onClick={handleLogout}>
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['overview', 'friends', 'settings'].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'default' : 'ghost'}
                            onClick={() => setActiveTab(tab)}
                            className={`capitalize ${activeTab === tab ? '' : 'hover:bg-primary/10'}`}
                        >
                            {tab === 'overview' && <User className="w-4 h-4 mr-2" />}
                            {tab === 'friends' && <Users className="w-4 h-4 mr-2" />}
                            {tab === 'settings' && <Settings className="w-4 h-4 mr-2" />}
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="grid gap-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Submissions */}
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <span className="text-3xl font-bold">{totalSubmissions}</span>
                                    </div>
                                    <p className="text-muted-foreground font-medium">Total Submissions</p>
                                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Accepted */}
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-green-500/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-green-500" />
                                        </div>
                                        <span className="text-3xl font-bold text-green-500">{acceptedSubmissions}</span>
                                    </div>
                                    <p className="text-muted-foreground font-medium">Accepted</p>
                                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${acceptanceRate}%` }}></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Failed */}
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-red-500/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                            <XCircle className="w-6 h-6 text-red-500" />
                                        </div>
                                        <span className="text-3xl font-bold text-red-500">{totalSubmissions - acceptedSubmissions}</span>
                                    </div>
                                    <p className="text-muted-foreground font-medium">Failed</p>
                                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${100 - acceptanceRate}%` }}></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Friends */}
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveTab('friends')}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className="text-3xl font-bold">{friends?.length || 0}</span>
                                    </div>
                                    <p className="text-muted-foreground font-medium">Friends</p>
                                    <p className="mt-3 text-sm text-primary">View all →</p>
                                </CardContent>
                            </Card>

                            {/* Find Friends Section */}
                            <Card className="md:col-span-2 lg:col-span-4 bg-card/50 backdrop-blur-sm border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="w-5 h-5 text-primary" />
                                        Find Friends
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by username..."
                                            onChange={searchfriend}
                                            value={find}
                                            className="pl-10"
                                        />
                                    </div>
                                    {searchLoading && (
                                        <div className="mt-4 flex items-center justify-center py-4">
                                            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                    {find && !searchLoading && findfriend.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {findfriend.map((element, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <span className="font-medium">{element.username}</span>
                                                    </div>
                                                    <Button size="sm" onClick={() => addfriend(element.username)}>
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Add
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {find && !searchLoading && findfriend.length === 0 && (
                                        <p className="mt-4 text-center text-muted-foreground py-4">No users found</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Friends Tab */}
                    {activeTab === 'friends' && (
                        <div className="grid gap-6">
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Your Friends ({friends?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Array.isArray(friends) && friends.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {friends.map((friend) => (
                                                <div
                                                    key={friend._id}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 p-0.5">
                                                        {friend.avatar ? (
                                                            <img src={friend.avatar} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                                                                <User className="w-5 h-5 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold truncate">{friend.username}</p>
                                                        <p className="text-sm text-muted-foreground">Friend</p>
                                                    </div>
                                                    <Button size="icon" variant="ghost" onClick={() => openChat(friend._id)}>
                                                        <MessageCircle className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground">No friends yet</p>
                                            <Button variant="outline" className="mt-4" onClick={() => setActiveTab('overview')}>
                                                Find Friends
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="grid gap-6 max-w-2xl">
                            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-primary" />
                                        Edit Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 p-1">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                                                        <User className="w-10 h-10 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full max-w-xs">
                                            <Label htmlFor="avatar-upload" className="text-sm text-muted-foreground">Upload new avatar</Label>
                                            <Input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="mt-2"
                                                onChange={(e) => setAvatarFile(e.target.files[0])}
                                            />
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={editUsername}
                                            onChange={(e) => setEditUsername(e.target.value)}
                                            placeholder="Enter username"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            placeholder="Enter email"
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <Button onClick={handleSave} className="w-full">
                                        Save Changes
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="bg-red-500/5 border-red-500/20">
                                <CardHeader>
                                    <CardTitle className="text-red-500">Danger Zone</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="destructive" onClick={handleLogout} className="w-full">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
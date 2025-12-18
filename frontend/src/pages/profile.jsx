import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import axios from 'axios.config';
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Search } from 'lucide-react'
import { Toast } from 'radix-ui'
import { Toaster } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import ModeToggle from '@/components/Themechanger'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"



const Profile = () => {

    const [user, setUser] = useState({});
    const [find, setFind] = useState("");
    const [findfriend, setFindfriends] = useState([]);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [friends,setFriends] = useState(0);
    const [avatarFile, setAvatarFile] = useState(null);
    const [totalSubmissions,setTotalSubmission] = useState(0);
    const [acceptedSubmissions,setAcceptedSubmission] = useState(0);
    const navigate = useNavigate();

    const token = Cookies.get("token");
    const { theme } = useTheme();
    // fetching user 
    useEffect(() => {
        const fetchuser = async () => {
            try {
                const res = await axios.get('/api/profile');
                if(res.data.status===false){
                    navigate('/login');
                }
                if (res.data ) {
                    setUser(res.data);
                    setEditUsername(res.data.username);
                    setEditEmail(res.data.email);
                    setTotalSubmission(res.data.totalSubmissions);
                    setAcceptedSubmission(res.data.acceptedSubmissions);
                }

                toast("welcome to your profile");
            } catch (err) {
                console.log("error in fetching user", err);

                if (err.response && err.response.status === 401 && err.response.data.redirect) {
                    window.location.href = err.response.data.redirect;
                } else {
                    toast("error in getting userinfo");
                }
            }
        };
        fetchuser();
        const fetchsubmission = async ()=> {
            const submissions = await axios.get('/api/problems/submission');
            setTotalSubmission(submissions.data.length);
            const count = submissions.data.filter(obj => obj.status === "accepted").length;
            setAcceptedSubmission(count);
        }
        fetchsubmission();
    }, []);

    async function handleSave() {
        let avatarUrl = user?.avatar; 

        if (avatarFile) {
            try {
                const signatureRes = await axios.get('/api/get-signature', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const { signature, timestamp, api_key, cloud_name, folder } = signatureRes.data;

                const formData = new FormData();
                formData.append("file", avatarFile);
                formData.append("api_key", api_key);
                formData.append("timestamp", timestamp);
                formData.append("signature", signature);
                formData.append("folder", folder);


                const cloudinaryUploadRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });


                avatarUrl = cloudinaryUploadRes.data.secure_url;
                toast.success("Avatar uploaded successfully!");
            } catch (uploadError) {
                console.error("Error uploading avatar to Cloudinary", uploadError);
                toast.error("Failed to upload avatar.");
                return; // Stop if avatar upload fails
            }
        }

        try {
            const res = await axios.put('/api/profile', {
                username: editUsername,
                email: editEmail,
                avatar: avatarUrl,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(res.data);
            setEditUsername(res.data.username); // Update state with new username from backend
            setEditEmail(res.data.email);     // Update state with new email from backend
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile", err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Failed to update profile.");
            }
        }
    }

    // searchig friend section
    async function searchfriend(e) {
        const value = e.target.value;
        setFind(value);
        try {
            if (value.trim()) {
                const res = await axios.get('/api/profile/findfriend', {
                    params: { findfriend: value }
                });
                setFindfriends(res.data);
            }
        } catch (err) {
            console.error('error in finding friend', err);
        }
    }

    // logout
    const handleLogout = () => {
        Cookies.remove("token");
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    //adding friend section
    async function addfriend(username) {
        try {
            const res = await axios.post('/api/profile/add-friend', {
                username
            });
            toast(res.data.message);
        }
        catch (err) {
            console.log("error in adding friend", err);
            toast.error(err.response.data.message);
        }
    }

    return (
        <Card className="fixed w-screen h-screen m-0 rounded-none border-none bg-background text-foreground pt-16">
            <Card className='flex gap-[20px] h-full mt-[40px] m-[20px] rounded-none border-none bg-card text-card-foreground'>
                {/* userinfo */}
                <Card className="w-3/6 p-[25px] font-mono bg-card text-card-foreground border border-border">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className='font-bold text-4xl text-primary'>{user?.username}</h3>
                        {user?.avatar && (
                            <img src={user.avatar} alt="User Avatar" className="w-24 h-24 rounded-full object-cover" />
                        )}
                    </div>
                    <div className=' flex flex-col gap-1'>
                        <p className='font-semibold text-muted-foreground'>Email : {user?.email}</p>
                        <p className='font-semibold text-muted-foreground'>Total Submissions : {totalSubmissions}</p>
                        <p className='font-semibold text-muted-foreground'>Accepted Submissions : {acceptedSubmissions }</p>
                        <p className='font-semibold text-muted-foreground'> Friends : {user?.friends?.length}</p>
                        <a className='font-semibold text-primary'> My friends</a>
                        {/*edit section*/}
                        <div className="flex gap-3 flex-wrap items-center">
                            {/*Edit option side opener*/}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline">edit profile</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Edit profile</SheetTitle>
                                        <SheetDescription>
                                            Make changes to your profile here. Click save when you&apos;re done.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                                        <div className="grid gap-3">
                                            <Label htmlFor="avatar-upload">Avatar</Label>
                                            <Input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setAvatarFile(e.target.files[0])}
                                            />
                                            {user?.avatar && (
                                                <img src={user.avatar} alt="User Avatar" className="w-20 h-20 rounded-full object-cover mt-2" />
                                            )}
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="sheet-demo-name">username</Label>
                                            <Input id="sheet-demo-name" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="sheet-demo-username">Email</Label>
                                            <Input id="sheet-demo-username" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                                        </div>
                                    </div>
                                    <SheetFooter>
                                        <Button type="submit" onClick={handleSave}>Save changes</Button>
                                        <SheetClose asChild>
                                            <Button variant="outline">Close</Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                            <Button variant="destructive" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </Card>
                {/*find friend*/}
                <Card className="w-3/6 p-[25px] font-mono bg-card text-card-foreground border border-border">
                    <CardHeader>
                        <CardTitle className='font-bold text-2xl mb-3 text-primary'>Find user</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="Enter username " onChange={searchfriend} value={find} />
                    </CardContent>
                    <CardContent>
                        {find && findfriend.map((element, index) => (
                            <p key={index} className="flex justify-between  px-2 text-foreground">
                                {element.username}
                                <Button className="p-1 font-semibold size-5" onClick={() => addfriend(element.username)}> + </Button>
                            </p>
                        ))}
                    </CardContent>
                </Card>
            </Card>
        </Card>
    )
}

export default Profile
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import axios from 'axios';
import Cookies from 'js-cookie';

const LoginPage =  function LoginForm({
  email,
  password
}) {

  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3002/api/login', { email: userEmail, password: userPassword });
      const { token, message } = response.data;
      
      if (token) {
        Cookies.set('token', token, { expires: 7 }); // Cookie expires in 7 days
        navigate('/'); // Redirect to home or dashboard
      } else {
        alert({message:"somthing went wrong"});
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred during login.";
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" onClick={handleSubmit}>
                  Login
                </Button>
                <Button variant="outline" className="w-full" >
                  Login with Google
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage;
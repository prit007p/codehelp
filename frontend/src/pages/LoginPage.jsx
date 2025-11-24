import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import LoginForm from '../components/Loginform';

const LoginPage = () => {
  return (
    <LoginForm />
  );
};

export default LoginPage;

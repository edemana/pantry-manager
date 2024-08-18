'use client';

import { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting to log in...');
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      window.location.href = '/';  // Use window.location instead of router
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting to sign up...');
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful');
      window.location.href = '/';  // Use window.location instead of router
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <Container 
      maxWidth="xs" 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, .5)', 
        padding: 3, 
        borderRadius: 2, 
        boxShadow: 3, 
        marginTop: 4, 
        backdropFilter: 'blur(10px)', // Apply blur effect within the box
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Login / Sign Up
      </Typography>
      <form>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          fullWidth
          sx={{ mt: 2 }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSignUp}
          fullWidth
          sx={{ mt: 2 }}
        >
          Sign Up
        </Button>
      </form>
    </Container>
  );
} 

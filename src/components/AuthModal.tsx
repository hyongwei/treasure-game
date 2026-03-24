import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

interface AuthFormValues {
  username: string;
  password: string;
}

interface FormProps {
  onSuccess: () => void;
}

function LoginForm({ onSuccess }: FormProps) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormValues>();

  const onSubmit = async (values: AuthFormValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? 'Something went wrong'); return; }
      login(data.username, data.token);
      onSuccess();
    } catch {
      setServerError('Network error, please try again');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" autoComplete="off">
      <div className="space-y-1">
        <Label htmlFor="login-username">Username</Label>
        <Input id="login-username" placeholder="Your username" autoComplete="off"
          {...register('username', { required: 'Username is required' })} />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" placeholder="Your password" autoComplete="off"
          {...register('password', { required: 'Password is required' })} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
        {isSubmitting ? 'Please wait…' : 'Login'}
      </Button>
    </form>
  );
}

function RegisterForm({ onSuccess }: FormProps) {
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthFormValues>();

  const onSubmit = async (values: AuthFormValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? 'Something went wrong'); return; }
      login(data.username, data.token);
      onSuccess();
    } catch {
      setServerError('Network error, please try again');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2" autoComplete="off">
      <div className="space-y-1">
        <Label htmlFor="register-username">Username</Label>
        <Input id="register-username" placeholder="3-20 alphanumeric characters" autoComplete="off"
          {...register('username', {
            required: 'Username is required',
            pattern: { value: /^[a-zA-Z0-9]{3,20}$/, message: '3-20 alphanumeric characters only' },
          })} />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="register-password">Password</Label>
        <Input id="register-password" type="password" placeholder="Minimum 8 characters" autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters required' },
          })} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
        {isSubmitting ? 'Please wait…' : 'Create Account'}
      </Button>
    </form>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900">🏴‍☠️ Player Account</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSuccess={onClose} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onSuccess={onClose} />
          </TabsContent>
        </Tabs>

        <div className="text-center pt-2 border-t border-amber-200">
          <button onClick={onClose} className="text-sm text-amber-600 hover:text-amber-800 underline">
            Continue as Guest
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

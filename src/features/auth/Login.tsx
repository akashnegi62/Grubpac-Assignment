import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

const calculateStrength = (pass: string) => {
  if (pass.length === 0) return -1;
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return Math.min(score, 4);
};

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

export function Login() {
  const [username, setUsername] = useState('emilys'); // Pre-fill with a valid dummyjson user
  const [password, setPassword] = useState('emilyspass');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login: setAuthSession } = useAuthStore();
  const { toast } = useToast();

  const strengthScore = calculateStrength(password);

  const loginMutation = useMutation({
    mutationFn: () => authService.login(username, password),
    onSuccess: (data) => {
      setAuthSession(data.accessToken, data.refreshToken, data.user, rememberMe);
      toast({
        title: 'Welcome back!',
        description: `Successfully logged in as ${data.user.firstName}`,
        type: 'success',
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        type: 'error',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            SprintDesk
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1"
                required
                disabled={loginMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="mt-1"
                required
                disabled={loginMutation.isPending}
              />
              
              {/* Password Strength Indicator */}
              {strengthScore >= 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span>Password Strength:</span>
                    <span>{strengthLabels[strengthScore]}</span>
                  </div>
                  <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-full w-full rounded-full transition-all duration-300",
                          i <= strengthScore ? strengthColors[strengthScore] : "bg-gray-200 dark:bg-gray-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending || !username || !password}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center text-xs text-gray-500">
            Use <strong>emilys</strong> / <strong>emilyspass</strong> to test
          </div>
        </form>
      </div>
    </div>
  );
}

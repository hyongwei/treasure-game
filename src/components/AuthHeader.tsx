import { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

export function AuthHeader() {
  const { username, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="w-full flex justify-end items-center px-6 py-3 bg-amber-100/80 border-b border-amber-200">
        {username ? (
          <div className="flex items-center gap-3">
            <span className="text-amber-800 text-sm">Playing as <strong>{username}</strong></span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-amber-400 text-amber-700 hover:bg-amber-200"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Sign In / Register
          </Button>
        )}
      </div>

      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

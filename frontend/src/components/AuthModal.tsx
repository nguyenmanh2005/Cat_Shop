import React, { useState } from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal = ({ isOpen, onClose, initialMode = "login" }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Reset mode khi modal mở với initialMode mới
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  const handleSwitchToRegister = () => {
    setMode("register");
  };

  const handleSwitchToLogin = () => {
    setMode("login");
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="bg-black/50" />
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-10 rounded-full bg-background border border-border p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          {mode === "login" ? (
            <LoginForm 
              onSwitchToRegister={handleSwitchToRegister}
              onClose={handleClose}
            />
          ) : mode === "register" ? (
            <RegisterForm 
              onSwitchToLogin={handleSwitchToLogin}
              onClose={handleClose}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

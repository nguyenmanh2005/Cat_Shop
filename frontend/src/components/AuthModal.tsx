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
      <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-0 shadow-none max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-white border border-border p-2 hover:bg-muted transition-colors shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>
          
          {mode === "login" ? (
            <LoginForm 
              onSwitchToRegister={handleSwitchToRegister}
              onClose={handleClose}
            />
          ) : mode === "register" ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <RegisterForm 
                onSwitchToLogin={handleSwitchToLogin}
                onClose={handleClose}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;

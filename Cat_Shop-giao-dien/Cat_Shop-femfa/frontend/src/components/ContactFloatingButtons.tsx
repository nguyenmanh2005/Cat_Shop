import { useState } from "react";
import { Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactFloatingButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contactMethods = [
    {
      id: "phone",
      icon: Phone,
      label: "Call",
      color: "bg-red-500 hover:bg-red-600",
      href: "tel:0911079086",
      zIndex: 30
    },
    {
      id: "zalo",
      label: "Zalo",
      color: "bg-white hover:bg-blue-50",
      iconColor: "text-blue-500",
      href: "https://zalo.me/0911079086",
      zIndex: 20,
      // Custom Zalo icon - speech bubble màu trắng với chữ Zalo màu xanh
      customIcon: (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Speech bubble shape */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" stroke="#3b82f6" strokeWidth="2" fill="white"/>
          </svg>
          <span className="relative text-blue-500 font-bold text-[10px] leading-tight">Zalo</span>
        </div>
      )
    },
    {
      id: "messenger",
      label: "Messenger",
      color: "bg-blue-500 hover:bg-blue-600",
      href: "https://m.me/champets",
      zIndex: 10,
      // Custom Messenger icon - speech bubble màu xanh với lightning bolt trắng
      customIcon: (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Speech bubble shape */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#3b82f6"/>
          </svg>
          {/* Lightning bolt */}
          <svg className="relative w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 items-start">
      {isExpanded && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={method.id}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`${method.color} ${method.iconColor || "text-white"} w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group relative`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  zIndex: method.zIndex
                }}
                title={method.label}
              >
                {method.customIcon ? method.customIcon : (Icon && <Icon className="h-6 w-6" />)}
                {/* Tooltip */}
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                  {method.label}
                </span>
              </a>
            );
          })}
        </div>
      )}
      
      {/* Main toggle button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
          isExpanded 
            ? "bg-pink-500 hover:bg-pink-600" 
            : "bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        }`}
        title={isExpanded ? "Close" : "Contact"}
      >
        {isExpanded ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Phone className="h-6 w-6 text-white" />
        )}
      </Button>
    </div>
  );
};

export default ContactFloatingButtons;


import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileCheck, BarChart2, Settings, Bot, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const routes = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      active: location === "/"
    },
    { 
      href: "/interviews", 
      label: "My Interviews", 
      icon: FileCheck,
      active: location === "/interviews"
    },
    { 
      href: "/progress", 
      label: "Progress", 
      icon: BarChart2,
      active: location === "/progress"
    },
    { 
      href: "/settings", 
      label: "Settings", 
      icon: Settings,
      active: location === "/settings"
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Bot className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-heading font-bold text-gray-800 dark:text-white">AI Interview Prep</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {routes.map((route) => (
            <li key={route.href}>
              <Link href={route.href}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  route.active 
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}>
                  <route.icon className="mr-3 h-5 w-5" />
                  {route.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <Button 
              variant="ghost" 
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 p-0 h-auto"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Signing out...
                </>
              ) : "Sign out"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

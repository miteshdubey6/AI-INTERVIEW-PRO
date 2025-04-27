import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileCheck, BarChart2, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();
  
  const routes = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      active: location === "/"
    },
    { 
      href: "/interviews", 
      label: "Interviews", 
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
      href: "/profile", 
      label: "Profile", 
      icon: User,
      active: location === "/profile"
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="flex justify-around">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <a className={cn(
              "flex flex-col items-center p-3",
              route.active 
                ? "text-primary dark:text-primary-400" 
                : "text-gray-500 dark:text-gray-400"
            )}>
              <route.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{route.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

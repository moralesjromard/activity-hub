"use client";

import { Cog, Lock, LogOut } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/actions/auth";
import { useUserStore } from "@/store/user-store";
import { getNameInitials } from "@/lib/utils";

export const UserButton = () => {
  const router = useRouter();

  const { user, clearUser } = useUserStore();

  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
      clearUser();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none hover:opacity-90 transition">
        <Avatar>
          <AvatarFallback className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {user?.name && getNameInitials(user?.name!)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[240px] max-w-fit" align="end">
        <DropdownMenuLabel>
          <h2>{user?.name}</h2>
          <p className="text-muted-foreground font-normal text-xs">
            {user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive hover:!bg-destructive/10 group cursor-pointer"
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut className="group-hover:text-destructive/80 transition" />
          <span className="group-hover:text-destructive/80 transition">
            Log out
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

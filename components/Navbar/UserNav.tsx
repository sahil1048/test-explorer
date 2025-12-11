'use client'

import Link from 'next/link'
import { signout } from '@/app/auth/actions'
import { 
  LogOut, 
  LayoutDashboard, 
  User, 
  Settings 
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface UserNavProps {
  profile: {
    full_name: string | null
    role: string
    school_id: string | null
  }
}

export default function UserNav({ profile }: UserNavProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  }

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    switch (profile.role) {
      case 'super_admin': return '/'
      case 'school_admin': return '/'
      default: return '/dashboard'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-gray-200">
            {/* You can add an image URL to your profile schema later */}
            <AvatarImage src="/avatars/01.png" alt={profile.full_name || ''} />
            <AvatarFallback className="bg-blue-600 text-white font-bold">
              {getInitials(profile.full_name || '')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.full_name || 'Student'}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()} className="cursor-pointer w-full flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer w-full flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          
          {/* Optional: Show Settings only for admins */}
          {(profile.role === 'super_admin' || profile.role === 'school_admin') && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onSelect={(e) => {
            e.preventDefault() // Prevent menu closing immediately
            signout()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
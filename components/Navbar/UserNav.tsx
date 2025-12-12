'use client'

import Link from 'next/link'
import { signout } from '@/app/auth/actions'
import { 
  LogOut, 
  LayoutDashboard, 
  User
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
    organization_id: string | null
  }
  email?: string
}

export default function UserNav({ profile, email }: UserNavProps) {
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
      case 'super_admin': return '/dashboard/admin'
      case 'school_admin': return '/dashboard'
      default: return '/dashboard'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage src="" alt={profile.full_name || ''} />
            <AvatarFallback className="bg-blue-600 text-white font-bold">
              {getInitials(profile.full_name || '')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-gray-900">
              {profile.full_name || 'User'}
            </p>
            
            <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mt-1">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* The 3 Main Options */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={getDashboardLink()} className="cursor-pointer w-full flex items-center py-2.5">
              <LayoutDashboard className="mr-3 h-4 w-4 text-gray-500" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer w-full flex items-center py-2.5">
              <User className="mr-3 h-4 w-4 text-gray-500" />
              <span className="font-medium">Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5"
          onSelect={(e) => {
            e.preventDefault() 
            signout()
          }}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-bold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
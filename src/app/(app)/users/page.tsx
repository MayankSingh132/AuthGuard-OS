"use client"

import {
  MoreHorizontal,
  PlusCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, orderBy, query } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"


export default function UsersPage() {

  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"), orderBy("lastLogin", "desc"));
  }, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);


  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <PageHeader
        title="User Management"
        description="Manage all users, their roles, and authentication settings."
      />
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                        A list of all users in your system.
                    </CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add User
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">
                  MFA Status
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Last Login
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingUsers && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="grid gap-1">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                  </TableCell>
                   <TableCell>
                      <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                     <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt="Avatar" />
                          <AvatarFallback>{user.email.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                            {user.email.split('@')[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={'secondary'}>User</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        user.mfaEnabled ? "outline" : "destructive"
                      }
                      className={user.mfaEnabled ? 'border-green-600 text-green-600' : ''}
                    >
                      {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.lastLogin ? format(new Date(user.lastLogin), "PPpp") : 'Never'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-red-500/10">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{users?.length || 0}</strong> of <strong>{users?.length || 0}</strong> users
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

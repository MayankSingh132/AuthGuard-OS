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

const users = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    role: "Admin",
    mfa: "Enabled",
    lastLogin: "2024-07-20 10:30 AM",
    avatar: "/avatars/01.png",
    initials: "OM",
  },
  {
    name: "Liam Johnson",
    email: "liam.johnson@email.com",
    role: "User",
    mfa: "Enabled",
    lastLogin: "2024-07-20 09:45 AM",
    avatar: "/avatars/02.png",
    initials: "LJ",
  },
  {
    name: "Noah Williams",
    email: "noah.williams@email.com",
    role: "User",
    mfa: "Disabled",
    lastLogin: "2024-07-19 08:15 PM",
    avatar: "/avatars/03.png",
    initials: "NW",
  },
  {
    name: "Emma Brown",
    email: "emma.brown@email.com",
    role: "User",
    mfa: "Enabled",
    lastLogin: "2024-07-20 11:00 AM",
    avatar: "/avatars/04.png",
    initials: "EB",
  },
  {
    name: "Service Account",
    email: "svc-runner@os.local",
    role: "Service",
    mfa: "N/A",
    lastLogin: "2024-07-20 11:10 AM",
    avatar: "",
    initials: "SA",
  },
]

export default function UsersPage() {
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
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarImage src={user.avatar} alt="Avatar" />
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        user.mfa === "Enabled" ? "outline" : "destructive"
                      }
                      className={user.mfa === 'Enabled' ? 'border-green-600 text-green-600' : ''}
                    >
                      {user.mfa}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.lastLogin}
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
            Showing <strong>1-5</strong> of <strong>{users.length}</strong> users
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

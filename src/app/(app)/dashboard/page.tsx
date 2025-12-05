
"use client"

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Users,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, limit, orderBy, query } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

const chartData = [
  { date: "3d ago", successful: 186, failed: 80 },
  { date: "2d ago", successful: 305, failed: 200 },
  { date: "Yesterday", successful: 237, failed: 120 },
  { date: "Today", successful: 73, failed: 19 },
]

const chartConfig = {
  successful: {
    label: "Successful",
    color: "hsl(var(--chart-1))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

const heroImage = PlaceHolderImages.find(p => p.id === 'dashboard-hero');


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "auth_logs"), orderBy("timestamp", "desc"), limit(5));
  }, [firestore, user]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users");
  }, [firestore, user]);

  const { data: recentLogs, isLoading: isLoadingLogs } = useCollection(logsQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection(usersQuery);

  const mfaEnabledPercentage = React.useMemo(() => {
    if (!users || users.length === 0) return 0;
    const mfaEnabledCount = users.filter(u => u.mfaEnabled).length;
    return Math.round((mfaEnabledCount / users.length) * 100);
  }, [users]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative isolate overflow-hidden rounded-none border-b bg-card shadow-sm">
        <Image
          src={heroImage?.imageUrl || "https://picsum.photos/seed/1/1200/400"}
          alt={heroImage?.description || "Dashboard hero image"}
          data-ai-hint={heroImage?.imageHint || "abstract security"}
          width={1200}
          height={400}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
         <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="p-8 md:p-12">
            <PageHeader
                title="Welcome to AuthGuard OS"
                description="This is your central hub for monitoring system security, tracking authentication events, and managing user access. Everything you need to maintain a secure operating environment is right at your fingertips."
            />
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">{users?.length || 0}</div>}
              <p className="text-xs text-muted-foreground">+20 since last month</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Logins (24h)
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last 24h
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Threats Detected (24h)
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">12</div>
              <p className="text-xs text-muted-foreground">
                +5 since last 24h
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
            {isLoadingUsers ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{mfaEnabledPercentage}%</div>}
              <p className="text-xs text-muted-foreground">
                4% increase from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 pt-8">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Login Attempts Overview</CardTitle>
              <CardDescription>A visual breakdown of successful vs. failed logins over time.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))"/>
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                      cursor={{fill: "hsl(var(--accent))"}}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Legend content={({ payload }) => (
                      <div className="flex justify-center space-x-4 pt-4">
                          {payload?.map((entry, index) => (
                              <div key={`item-${index}`} className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: entry.color}} />
                                  <span>{entry.value}</span>
                              </div>
                          ))}
                      </div>
                  )} />
                  <Bar
                    dataKey="successful"
                    stackId="a"
                    fill="var(--color-successful)"
                    name="Successful"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="failed"
                    stackId="a"
                    fill="var(--color-failed)"
                    name="Failed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
               <div className="grid gap-2">
                  <CardTitle>Recent Authentication Events</CardTitle>
                  <CardDescription>
                      A stream of the latest login activities.
                  </CardDescription>
               </div>
               <Button asChild size="sm" className="ml-auto gap-1">
                  <Link href="/logs">
                      View All
                      <ArrowUpRight className="h-4 w-4" />
                  </Link>
               </Button>
            </CardHeader>
            <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingLogs && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-4 w-32 mt-1" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                       <Skeleton className="h-5 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
                {recentLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">{log.userId.substring(0,12)}...</div>
                      <div className="text-xs text-muted-foreground">
                        {log.ip}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          log.status === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400" 
                          : "bg-red-500/10 text-red-700 dark:text-red-400"
                      }`}>
                          {log.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

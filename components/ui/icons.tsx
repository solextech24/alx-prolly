import {
  LucideProps,
  User,
  Settings,
  LogOut,
  Plus,
  BarChart,
  Activity,
  List,
  TrendingUp,
  Search,
  Filter,
  Vote,
  Eye,
  Users,
  Calendar,
  Clock,
  X,
  Loader2,
  CheckCircle,
  Trash2
} from 'lucide-react'

export const Icons = {
  user: User,
  settings: Settings,
  logOut: LogOut,
  plus: Plus,
  barChart: BarChart,
  activity: Activity,
  list: List,
  trendingUp: TrendingUp,
  search: Search,
  filter: Filter,
  vote: Vote,
  eye: Eye,
  users: Users,
  calendar: Calendar,
  clock: Clock,
  x: X,
  spinner: Loader2,
  checkCircle: CheckCircle,
  trash: Trash2,
  google: (props: LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 22c-2.5 0-4.75-.92-6.5-2.4" />
      <path d="M12 2c2.5 0 4.75.92 6.5 2.4" />
      <path d="M2 12h20" />
      <path d="M12 2a10 10 0 0 0-6.5 17.6" />
      <path d="M12 22a10 10 0 0 0 6.5-17.6" />
    </svg>
  ),
  // Add more icons as needed
}

import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Wallet,
  BookOpen,
} from "lucide-react";

export const sidebarItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    path: "/dashboard/students",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    path: "/dashboard/teachers",
    icon: Users,
  },
  {
    title: "Academics",
    path: "/dashboard/academics",
    icon: BookOpen,
  },
  {
    title: "Finance",
    path: "/dashboard/finance",
    icon: Wallet,
  },
];
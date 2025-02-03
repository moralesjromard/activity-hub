"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

import { CheckSquare, Image, Pizza, Rabbit, FileText } from "lucide-react";

const activities = [
  {
    title: "Todo List",
    description: "Manage your daily tasks",
    icon: CheckSquare,
    href: "/todo",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Google Drive Lite",
    description: "Upload, manage and search your photos",
    icon: Image,
    href: "/drive",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Food Review",
    description: "Share and review your favorite dishes",
    icon: Pizza,
    href: "/food",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Pokemon Review",
    description: "Search and review Pokemon",
    icon: Rabbit,
    href: "/pokemon",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Markdown Notes",
    description: "Create and manage your markdown notes",
    icon: FileText,
    href: "/notes",
    gradient: "from-purple-500 to-pink-500",
  },
];

const HomePage = () => {
  return (
    <div className="h-full w-full p-8">
      <div className="max-w-7xl mx-auto">
        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <Link href={activity.href} key={activity.title}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardContent className="pt-6">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${activity.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <activity.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    {activity.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

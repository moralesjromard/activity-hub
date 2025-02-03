import { Heart, Star } from "lucide-react";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useFoodStore } from "@/store/food-store";
import { getNameInitials } from "@/lib/utils";
import Image from "next/image";

export type FoodList = {
  id: number;
  name: string;
  description: string;
  url: string;
  profiles: {
    email: string;
    name: string;
    user_id: string;
  };
  updated_at: string;
  created_at: string;
};

interface FoodPostListProps {
  post: FoodList;
}

export const FoodPostList = ({ post }: FoodPostListProps) => {
  const { setIsPostOpen, setPost } = useFoodStore();

  const handleOpenPost = (post: FoodList) => {
    setPost(post);
    setIsPostOpen(true);
  };

  return (
    <Card key={post.id} className="overflow-hidden group">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={post.url}
            alt={post.name}
            className="w-full h-full object-cover"
            priority
            fill
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <div className="flex justify-between items-center w-full mb-4">
            <div className="flex items-center gap-2 ">
              <Avatar className="h-8 w-8 ">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  {getNameInitials(`${post.profiles.name}`)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.profiles.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(post?.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-1 h-full py-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">5</span>
            </div>
          </div>
          <div className="bg-muted/80 w-full p-4 rounded-lg">
            <CardTitle className="text-xl">{post.name}</CardTitle>
            <CardDescription>{post.description}</CardDescription>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />0
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenPost(post)}
        >
          Add review
        </Button>
      </CardFooter>
    </Card>
  );
};

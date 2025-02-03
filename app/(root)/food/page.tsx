"use client";

import { useEffect, useMemo, useState } from "react";
import { Pizza, Search, Upload, Calendar, SortAsc } from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadFoodModal } from "./_components/upload-food-modal";

import { getFoods } from "@/actions/food";
import { FoodList, FoodPostList } from "./_components/food-post-list";
import { FoodPost } from "./_components/food-post";

import { useFoodStore } from "@/store/food-store";
import { SortOption } from "../drive/page";
import { format } from "date-fns";

const FoodPage = () => {
  const { isPostOpen, setIsPostOpen, post } = useFoodStore();

  const [foodPosts, setFoodPosts] = useState<FoodList[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-newest");

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...foodPosts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((post) => {
        const formattedDate = format(new Date(post.created_at), "MMM d, yyyy");

        return (
          post.name.toLowerCase().includes(query) ||
          formattedDate.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case "name-desc":
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        case "date-newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [foodPosts, searchQuery, sortOption]);

  const handleGetFoods = async () => {
    const res = await getFoods();

    if ("error" in res) {
      toast.error(res.message);
      return;
    }

    setFoodPosts(res);
  };

  useEffect(() => {
    handleGetFoods();
  }, []);

  return (
    <main className="w-full h-full flex justify-center items-start flex-col p-6">
      <header className="flex flex-col mb-6 gap-6 w-full">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mr-4">
              <Pizza className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">Food Review</h2>
              <p className="text-muted-foreground">
                Share and review your favorite dishes
              </p>
            </div>
          </div>

          <Button
            className="shadow-lg"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> Share Food
          </Button>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Food Review</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      {/* Toolbar */}
      <div className="w-full flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search food name or date added..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">
              <div className="flex items-center">
                <SortAsc className="mr-2 h-4 w-4" />
                Name (A to Z)
              </div>
            </SelectItem>
            <SelectItem value="name-desc">
              <div className="flex items-center">
                <SortAsc className="mr-2 h-4 w-4 rotate-180" />
                Name (Z to A)
              </div>
            </SelectItem>
            <SelectItem value="date-newest">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="date-oldest">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Oldest First
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Food Posts Grid */}
      {filteredAndSortedPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredAndSortedPosts.map((foodPost) => (
            <FoodPostList key={foodPost.id} post={foodPost} />
          ))}
        </div>
      )}

      {filteredAndSortedPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 w-full">
          <Pizza className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {searchQuery ? "No matching food posts found" : "No food posts yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            ) : (
              "Share your food posts to get started"
            )}
          </p>
        </div>
      )}

      <UploadFoodModal
        isOpen={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
        updatePostsList={handleGetFoods}
      />

      <FoodPost
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        post={post}
      />
    </main>
  );
};

export default FoodPage;

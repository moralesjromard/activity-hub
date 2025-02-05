import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Heart,
  Loader,
  Loader2,
  LoaderCircle,
  MessageCircle,
  MoreVertical,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNameInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  addPokemonReview,
  deletePokemonReview,
  getPokemonReviews,
} from "@/actions/pokemon";

import { useUserStore } from "@/store/user-store";
import { PokemonReview } from "../page";
import { usePokemonStore } from "@/store/pokemon-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateReviewModal } from "./update-review-modal";

interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats: PokemonStats;
}

interface PokemonPostProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: Pokemon;
}

interface TypeStyle {
  bg: string;
  icon: string;
}

type TypeStyles = Record<string, TypeStyle>;

export const PokemonPost: React.FC<PokemonPostProps> = ({
  isOpen,
  onClose,
  pokemon,
}) => {
  const { user } = useUserStore();
  const { selectedPokemon, setIsUpdateReviewOpen, setSelectedReview } =
    usePokemonStore();

  const [isLoading, setIsLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [newReview, setNewReview] = useState("");
  const [reviews, setReviews] = useState<PokemonReview[]>([]);

  const typeStyles: TypeStyles = {
    fire: {
      bg: "bg-gradient-to-r from-red-500 to-orange-500",
      icon: "🔥",
    },
    water: {
      bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: "💧",
    },
    grass: {
      bg: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: "🌱",
    },
    electric: {
      bg: "bg-gradient-to-r from-yellow-400 to-amber-500",
      icon: "⚡",
    },
    psychic: {
      bg: "bg-gradient-to-r from-pink-500 to-purple-500",
      icon: "🔮",
    },
    ice: {
      bg: "bg-gradient-to-r from-cyan-400 to-blue-300",
      icon: "❄️",
    },
    dragon: {
      bg: "bg-gradient-to-r from-purple-600 to-indigo-600",
      icon: "🐉",
    },
    dark: {
      bg: "bg-gradient-to-r from-gray-700 to-gray-900",
      icon: "🌑",
    },
    fairy: {
      bg: "bg-gradient-to-r from-pink-400 to-rose-400",
      icon: "✨",
    },
    normal: {
      bg: "bg-gradient-to-r from-gray-400 to-gray-500",
      icon: "⭐",
    },
  };

  const getStatColor = (value: number): string => {
    if (value >= 150) return "bg-emerald-500";
    if (value >= 100) return "bg-blue-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const handleGetPokemonReviews = async () => {
    const res = await getPokemonReviews({ pokemonId: pokemon.id });

    if ("error" in res) {
      toast.error(res.message);
      return;
    }

    setReviews(res);
    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user?.id) return;

    startTransition(async () => {
      const result = await addPokemonReview({
        userId: user?.id,
        pokemonId: pokemon.id,
        comment: newReview,
      });

      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (result.success) {
        toast.success("Review posted successfully!");
        setNewReview("");
        handleGetPokemonReviews();
      }
    });
  };

  const handleDeleteReview = async ({
    pokemonReviewId,
  }: {
    pokemonReviewId: number;
  }) => {
    const result = await deletePokemonReview({ pokemonReviewId });
    if (result.error) {
      toast.error(result.message);
      return;
    }

    if (result.success) {
      toast.success(result.message);
      handleGetPokemonReviews();
      return;
    }
  };

  const handleOpenUpdateReviewModal = ({
    reviewId,
    comment,
  }: {
    reviewId: number;
    comment: string;
  }) => {
    setIsUpdateReviewOpen(true);
    setSelectedReview({ id: reviewId, comment: comment });
  };

  useEffect(() => {
    if (selectedPokemon) {
      setIsLoading(true);
      setNewReview("");
      handleGetPokemonReviews();
    }
  }, [selectedPokemon]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden rounded-xl border-none [&>button]:hidden bg-transparent">
          <div className="flex h-[85vh]">
            {/* Left side  */}
            <div className="w-[50%] bg-gradient-to-br from-slate-950 via-slate-800 to-slate-900 text-white p-8 relative overflow-hidden border-none">
              <div className="flex justify-between items-start mb-6">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {pokemon.name}
                </DialogTitle>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="h-8 w-8 bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Pokemon Image */}
              <div className="relative h-72 w-full my-8 rounded-xl bg-gradient-to-b from-white/10 to-transparent p-4">
                <Image
                  src={pokemon.image}
                  alt={pokemon.name}
                  fill
                  className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>

              {/* Types */}
              <div className="flex gap-3 my-6">
                {pokemon.types.map((type) => {
                  const typeStyle =
                    typeStyles[type.toLowerCase()] || typeStyles.normal;
                  return (
                    <span
                      key={type}
                      className={`${typeStyle.bg} px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition-transform duration-200`}
                    >
                      <span>{typeStyle.icon}</span>
                      {type}
                    </span>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="space-y-4 mt-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5" /> Base Stats
                </h3>
                <div className="space-y-4">
                  {Object.entries(pokemon.stats).map(([stat, value]) => (
                    <div key={stat} className="space-y-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 uppercase tracking-wider">
                          {stat}
                        </span>
                        <span className="font-mono">{value}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStatColor(
                            value
                          )} transition-all duration-500`}
                          style={{ width: `${(value / 255) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="w-[55%] flex flex-col bg-background">
              <header className="p-6 border-b bg-background">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    Pokemon Reviews
                  </h2>
                </div>
              </header>

              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="py-12 w-full flex justify-center items-center">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div>
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 transition-colors duration-200 bg-muted/50 border-b relative"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-white">
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                              {getNameInitials(review.profiles.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">
                                {review.profiles.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(review.created_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-700 leading-relaxed dark:text-gray-200">
                              {review.comment}
                            </p>
                          </div>
                        </div>

                        {user?.id === review.profiles.user_id && (
                          <div className="absolute top-4 right-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleOpenUpdateReviewModal({
                                      reviewId: review.id,
                                      comment: review.comment,
                                    })
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="!text-red-600 cursor-pointer"
                                  onClick={() => {
                                    handleDeleteReview({
                                      pokemonReviewId: review.id,
                                    });
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <MessageCircle className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-medium">No reviews yet</p>
                    <p className="text-sm text-gray-400">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Review Input Section */}
              <div className="p-6 border-t bg-background">
                <Textarea
                  placeholder="Share your experience with this Pokemon..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="min-h-[100px] mb-3 resize-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={!newReview.trim() || pending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                  >
                    {pending ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      "Share Review"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpdateReviewModal updateReviewList={handleGetPokemonReviews} />
    </>
  );
};

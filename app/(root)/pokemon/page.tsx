"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Rabbit,
  Search,
  MessageSquare,
  Clock,
  User,
  Calendar,
  SortAsc,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getPokemons } from "@/actions/pokemon";
import { useUserStore } from "@/store/user-store";
import { PokemonList } from "./_components/pokemon-list";
import { PokemonPost } from "./_components/pokemon-post";
import { usePokemonStore } from "@/store/pokemon-store";
import { SortOption } from "../drive/page";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export type Pokemon = {
  id: number;
  name: string;
  image: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  created_at: string;
};

export type PokemonReview = {
  id: number;
  pokemon_id: number;
  user_id: number;
  comment: string;
  profiles: {
    user_id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
};

const PokemonPage = () => {
  const { user } = useUserStore();
  const { setIsPokemonDetailsOpen, isPokemonDetailsOpen, selectedPokemon } =
    usePokemonStore();

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-newest");

  const filteredAndSortedPokemons = useMemo(() => {
    let filtered = [...pokemons];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((post) => {
        const formattedDate = format(new Date(post.created_at), "MMM d, yyyy");

        return (
          post.name.toLowerCase().includes(query) ||
          formattedDate.toLowerCase().includes(query)
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
  }, [pokemons, searchQuery, sortOption]);

  const handleGetPokemons = async () => {
    if (!user?.id) return;

    const res = await getPokemons();

    if ("error" in res) {
      toast.error(res.message);
      return;
    }

    setPokemons(res);
    console.log(res);
    return;
  };

  useEffect(() => {
    handleGetPokemons();
  }, [user?.id]);

  return (
    <main className="w-full h-full flex justify-center items-start flex-col p-6">
      <header className="flex flex-col mb-6 gap-6 w-full">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 mr-4">
              <Rabbit className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">Pokemon Review</h2>
              <p className="text-muted-foreground">Search and review Pokemon</p>
            </div>
          </div>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pokemon Review</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Search and Sort */}
      <div className="w-full flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pokemon by name or date added..."
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

      {/* Pokemon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {filteredAndSortedPokemons.map((pokemon: Pokemon) => (
          <PokemonList key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>

      {filteredAndSortedPokemons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 w-full">
          <Rabbit className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            {searchQuery ? "No matching pokemon found" : "No pokemons yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            ) : (
              "Share your pokemon to get started"
            )}
          </p>
        </div>
      )}

      <PokemonPost
        isOpen={isPokemonDetailsOpen}
        onClose={() => setIsPokemonDetailsOpen(false)}
        pokemon={selectedPokemon}
      />
    </main>
  );
};

export default PokemonPage;

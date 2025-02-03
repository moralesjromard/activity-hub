import { Star, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Pokemon } from "../page";
import { usePokemonStore } from "@/store/pokemon-store";
import { format } from "date-fns";

interface PokemonListProps {
  pokemon: Pokemon;
}

export const PokemonList = ({ pokemon }: PokemonListProps) => {
  const { setIsPokemonDetailsOpen, setSelectedPokemon } = usePokemonStore();

  const handleOpenPokemonDetails = (pokemon: Pokemon) => {
    setIsPokemonDetailsOpen(true);
    setSelectedPokemon(pokemon);
  };

  return (
    <Card key={pokemon.id} className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/10 dark:to-orange-900/10 p-6">
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="w-full">
            <div className="w-full flex justify-between items-center">
              <CardTitle className="capitalize text-2xl">
                {pokemon.name}
              </CardTitle>
              <span className="text-muted-foreground text-xs font-medium">
                Date Added:{" "}
                {format(new Date(pokemon.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {pokemon.types.map((type) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.entries(pokemon.stats).map(([stat, value]) => (
            <div key={stat} className="bg-muted/50 rounded-lg p-2">
              <div className="text-xs text-muted-foreground capitalize">
                {stat}
              </div>
              <div className="font-medium">{value}</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => handleOpenPokemonDetails(pokemon)}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Write a Review
        </Button>
      </CardFooter>
    </Card>
  );
};

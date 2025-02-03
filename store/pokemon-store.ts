import { create } from "zustand";
import { Pokemon, PokemonReview } from "@/app/(root)/pokemon/page";

type SelectedReview = {
  id: number;
  comment: string;
};

interface PokemonStore {
  // Modal states
  isUpdateReviewOpen: boolean;
  setIsUpdateReviewOpen: (isOpen: boolean) => void;

  isPokemonDetailsOpen: boolean;
  setIsPokemonDetailsOpen: (isOpen: boolean) => void;

  // Selected Pokemon data
  selectedPokemon: Pokemon;
  setSelectedPokemon: (pokemon: Pokemon) => void;
  clearSelectedPokemon: () => void;

  // Reviews management
  reviews: PokemonReview[];
  setReviews: (reviews: PokemonReview[]) => void;
  clearReviews: () => void;

  // Selected review for editing
  selectedReview: SelectedReview;
  setSelectedReview: (review: SelectedReview) => void;
}

const defaultPokemon: Pokemon = {
  id: 0,
  name: "",
  image: "",
  types: [],
  stats: {
    hp: 0,
    attack: 0,
    defense: 0,
    speed: 0,
  },
};

export const usePokemonStore = create<PokemonStore>((set) => ({
  isUpdateReviewOpen: false,
  setIsUpdateReviewOpen: (isOpen: boolean) =>
    set({ isUpdateReviewOpen: isOpen }),

  isPokemonDetailsOpen: false,
  setIsPokemonDetailsOpen: (isOpen: boolean) =>
    set({ isPokemonDetailsOpen: isOpen }),

  selectedPokemon: defaultPokemon,
  setSelectedPokemon: (pokemon: Pokemon) => set({ selectedPokemon: pokemon }),
  clearSelectedPokemon: () => set({ selectedPokemon: defaultPokemon }),

  // Reviews management
  reviews: [],
  setReviews: (reviews: PokemonReview[]) => set({ reviews }),
  clearReviews: () => set({ reviews: [] }),

  // Selected review management
  selectedReview: {
    id: 0,
    comment: "",
  },
  setSelectedReview: (review: SelectedReview) =>
    set({ selectedReview: review }),
}));

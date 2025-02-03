"use server";

import { createClient } from "@/utils/supabase/server";

import { Pokemon, PokemonReview } from "@/app/(root)/pokemon/page";

type PokemonResponse = Pokemon[] | { error: true; message: string };
type PokemonReviewResponse = PokemonReview[] | { error: true; message: string };

export const getPokemons = async (): Promise<PokemonResponse> => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("pokemons").select("*");

  if (error) {
    return {
      error: true,
      message: "Faield to fetch pokemons",
    };
  }
  return data as Pokemon[];
};

export const addPokemonReview = async ({
  userId,
  pokemonId,
  comment,
}: {
  userId: string;
  pokemonId: number;
  comment: string;
}) => {
  const supabase = await createClient();

  const { error } = await supabase.from("pokemon_reviews").insert({
    user_id: userId,
    pokemon_id: pokemonId,
    comment: comment,
  });

  if (error) {
    return {
      error: true,
      message: "Failed to create pokemon review",
    };
  }

  return {
    success: true,
    message: "Pokemon review created successfully",
  };
};

export const getPokemonReviews = async ({
  pokemonId,
}: {
  pokemonId: number;
}): Promise<PokemonReviewResponse> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pokemon_reviews")
    .select(
      `
      *,
      profiles (
        user_id,
        name,
        email
      )
    `
    )
    .eq("pokemon_id", pokemonId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      error: true,
      message: "Failed to fetch Pokemon reviews",
    };
  }

  return data as PokemonReview[];
};

export const updatePokemonReview = async ({
  pokemonReviewId,
  comment,
}: {
  pokemonReviewId: number;
  comment: string;
}) => {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("pokemon_reviews")
    .update({
      comment,
    })
    .match({ id: pokemonReviewId });

  if (updateError) {
    return {
      error: true,
      message: "Failed to update pokemon review",
    };
  }

  return {
    success: true,
    message: "Pokemon review updated successfully",
  };
};

export const deletePokemonReview = async ({
  pokemonReviewId,
}: {
  pokemonReviewId: number;
}) => {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("pokemon_reviews")
    .delete()
    .match({ id: pokemonReviewId });

  if (deleteError) {
    return {
      error: true,
      message: "Failed to delete Pokemon review",
    };
  }

  return {
    success: true,
    message: "Pokemon review deleted successfully",
  };
};

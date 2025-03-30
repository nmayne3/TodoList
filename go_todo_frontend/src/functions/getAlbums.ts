"use server";

/**
 * REST API actions for the database
 */

import { Album } from "../components/albumsList";

export async function createInitialAlbums(): Promise<Album[]> {
  const response = await fetch("/api/albums", {
    method: "GET",
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data);

    return data;
  }

  console.log("something went wrong fetching the data...\n");
  throw console.error(`${response}`);
}

export async function deleteSelectedAlbums(selected: number[]) {
  const numDelete = selected.toString();
  const response = await fetch("/api/albums/" + numDelete, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log("response gooded");
  } else {
    console.log("reseponse bad");
  }
}

export const postAlbum = async (
  album_title: string,
  artist_name: string,
  retail_price: number
): Promise<Album> => {
  console.log("posty initiated");
  const result = await fetch("/api/albums", {
    method: "POST",
    body: JSON.stringify({
      album_title: album_title,
      artist_name: artist_name,
      retail_price: retail_price,
    }),
    headers: { "Content-type": "application/json" },
  });
  if (result.ok) {
    console.log("Album posted!");
    const data = await result.json();
    console.log(data);
    return data;
  } else {
    throw new Error("Album failed to post...");
  }
};

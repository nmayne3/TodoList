import {
  Box,
  Checkbox,
  IconButton,
  Paper,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TableSortLabel,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { startTransition, useEffect, useOptimistic, useState } from "react";
import NewAlbumDialog from "./newAlbumDialog";
import { Delete } from "@mui/icons-material";

export interface Album {
  album_id: string;
  album_title: string;
  artist_name: string;
  retail_price: number;
}

async function createInitialAlbums(): Promise<Album[]> {
  const response = await fetch("/albums", {
    method: "GET",
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data);

    return data;
  }

  console.log("something went wrong...");
  throw console.error(`${response}`);
}

async function deleteSelectedAlbums(selected: number[]) {
  const numDelete = selected.toString();
  const response = await fetch("/albums/" + numDelete, {
    method: "DELETE",
  });

  if (response.ok) {
    console.log("response gooded");
  } else {
    console.log("reseponse bad");
  }
}

const sortRows = (
  dir: "asc" | "desc",
  sortBy: "album_title" | "artist_name" | "retail_price"
) => {
  console.log(`${sortBy}, ${dir}`);

  switch (sortBy) {
    case "album_title":
      return (a: Album, b: Album) =>
        dir == "desc"
          ? a.album_title < b.album_title
            ? 1
            : -1
          : a.album_title > b.album_title
          ? 1
          : -1;
    case "artist_name":
      return (a: Album, b: Album) =>
        dir == "desc"
          ? a.artist_name < b.artist_name
            ? 1
            : -1
          : a.artist_name > b.artist_name
          ? 1
          : -1;
    case "retail_price":
      return (a: Album, b: Album) =>
        dir == "asc"
          ? a.retail_price - b.retail_price
          : b.retail_price - a.retail_price;
  }
};

type Field = {
  id: "album_title" | "artist_name" | "retail_price";
  label: string;
};

const fields = Array<Field>(
  { id: "album_title", label: "Album" },
  { id: "artist_name", label: "Artist" },
  { id: "retail_price", label: "Price" }
);

const SortableHeadCol = ({
  field,
  active,
  direction,
  handleSort,
  sx,
}: {
  field: Field;
  active?: string;
  direction: "asc" | "desc";
  handleSort: (
    dir: "asc" | "desc",
    sortBy: "album_title" | "artist_name" | "retail_price"
  ) => void;
  sx?: SxProps<Theme>;
}) => {
  return (
    <TableCell sx={sx} align={field.id == "album_title" ? "left" : "right"}>
      <TableSortLabel
        active={active == field.id}
        direction={direction}
        onClick={() =>
          handleSort(
            active == field.id
              ? direction == "asc"
                ? "desc"
                : "asc"
              : direction,
            field.id
          )
        }
      >
        {field.label}
      </TableSortLabel>
    </TableCell>
  );
};

const AlbumsList = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [optimisticAlbums, setOptimisticAlbums] =
    useOptimistic<Album[]>(albums);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [active, setActive] = useState<
    "album_title" | "artist_name" | "retail_price"
  >();

  useEffect(() => {
    createInitialAlbums().then((data) => setAlbums(data));
  }, []);

  const handleSort = (
    dir: "asc" | "desc",
    sortBy: "album_title" | "artist_name" | "retail_price"
  ) => {
    setDirection(dir);
    setAlbums([...albums].sort(sortRows(dir, sortBy)));
    setActive(sortBy);
  };

  const handleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected([...selected.filter((value) => value != id)]);
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      setOptimisticAlbums([
        ...albums.filter(
          (album) => selected.includes(Number(album.album_id)) == false
        ),
      ]);
      await deleteSelectedAlbums(selected);
      startTransition(async () => {
        setAlbums([
          ...albums.filter(
            (album) => selected.includes(Number(album.album_id)) == false
          ),
        ]);
        setSelected([]);
      });
    });
  };

  return (
    <Box>
      <Paper>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
          }}
        >
          {" "}
          <Typography
            variant="h6"
            sx={{ flex: "1 1 100%", pl: 1, pr: 1, textAlign: "start" }}
            component={"div"}
          >
            {" "}
            Albums{" "}
          </Typography>{" "}
          {selected.length ? (
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDelete()}>
                <Delete />
              </IconButton>
            </Tooltip>
          ) : null}
        </Toolbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                {fields.map((field) => (
                  <SortableHeadCol
                    key={field.id}
                    field={field}
                    active={active}
                    direction={direction}
                    handleSort={handleSort}
                  />
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {optimisticAlbums.map((album) => {
                const isSelected = selected.includes(Number(album.album_id));
                return (
                  <TableRow selected={isSelected} hover key={album.album_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        onClick={() => handleSelect(Number(album.album_id))}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {" "}
                      {album.album_title}{" "}
                    </TableCell>
                    <TableCell align="right"> {album.artist_name} </TableCell>
                    <TableCell align="right">
                      {" "}
                      {`$${album.retail_price.toFixed(2)}`}{" "}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell align="right" colSpan={4}>
                  {" "}
                  <NewAlbumDialog
                    albums={albums}
                    setAlbums={setAlbums}
                    setOptimisticAlbums={setOptimisticAlbums}
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AlbumsList;

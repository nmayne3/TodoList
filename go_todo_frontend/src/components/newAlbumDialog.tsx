import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  TextField,
} from "@mui/material";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Album } from "./albumsList";
import { postAlbum } from "../functions/getAlbums";

const NewAlbumDialog = ({
  albums,
  setAlbums,
  setOptimisticAlbums,
}: {
  albums: Album[];
  setAlbums: React.Dispatch<React.SetStateAction<Album[]>>;
  setOptimisticAlbums: (action: Album[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const schema = z.object({
    album_title: z.string().min(1, "required"),
    artist_name: z.string().min(1, "required"),
    retail_price: z.preprocess(
      (a) => parseFloat(z.string().parse(a)),
      z.number({ message: "Price must be a valid number" })
    ),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      setOptimisticAlbums([
        ...albums,
        {
          album_id: "-1",
          album_title: data.album_title,
          artist_name: data.artist_name,
          retail_price: data.retail_price,
        },
      ]);
      setOpen(false);
      const createdAlbum = await postAlbum(
        data.album_title,
        data.artist_name,
        data.retail_price
      );
      startTransition(() => {
        setAlbums((albums) => [
          ...albums,
          {
            album_id: createdAlbum.album_id,
            album_title: data.album_title,
            artist_name: data.artist_name,
            retail_price: data.retail_price,
          },
        ]);
      });
    });
  };

  return (
    <div>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {" "}
        New Album{" "}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        disableRestoreFocus
        slotProps={{
          paper: {
            component: "form",
            onSubmit: form.handleSubmit(onSubmit),
          },
        }}
      >
        <DialogTitle> New Album </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add to the album library, please enter the required information.
          </DialogContentText>
          <TextField
            error={form.formState.errors.album_title != undefined}
            helperText={form.formState.errors.album_title?.message}
            autoFocus
            label="Album Title"
            fullWidth
            margin="dense"
            variant="standard"
            {...form.register("album_title")}
          />
          <TextField
            error={form.formState.errors.artist_name != undefined}
            helperText={form.formState.errors.artist_name?.message}
            label="Artist Name"
            fullWidth
            variant="standard"
            margin="dense"
            {...form.register("artist_name")}
          />
          <TextField
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start"> $ </InputAdornment>
                ),
              },
            }}
            error={form.formState.errors.retail_price != undefined}
            helperText={form.formState.errors.retail_price?.message}
            label="Retail Price"
            fullWidth
            variant="standard"
            margin="dense"
            typeof=""
            {...form.register("retail_price")}
          />
          {form.formState.errors.retail_price && <p></p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}> Cancel </Button>
          <Button type="submit"> Submit </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewAlbumDialog;

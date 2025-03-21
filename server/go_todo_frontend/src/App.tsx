import "./App.css";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AlbumsList from "./components/albumsList";
import { Icon, Typography, Box } from "@mui/material";

// album represents data about a record album.

function App() {
  return (
    <>
      <Typography variant="h1">To do List</Typography>
      <Box className="card">
        <Typography
          sx={{
            placeContent: "center",
            alignItems: "center",
            display: "flex",
            width: "full",
            margin: "auto",
          }}
          variant="body1"
        >
          React + Go ={" "}
          <Icon>
            {" "}
            <FavoriteIcon />{" "}
          </Icon>
        </Typography>
      </Box>
      <div>
        <AlbumsList />
      </div>
    </>
  );
}

export default App;

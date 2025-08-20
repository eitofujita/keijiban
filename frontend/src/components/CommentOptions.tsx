import { useState } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type Props = {
  onDelete: () => void;
  onEdit?: () => void;
};

export default function CommentOptions({ onDelete, onEdit }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon sx={{ color: "#ccc" }} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {onEdit && <MenuItem onClick={() => { handleClose(); onEdit(); }}>編集</MenuItem>}
        <MenuItem onClick={() => { handleClose(); onDelete(); }} sx={{ color: "red" }}>
          削除
        </MenuItem>
      </Menu>
    </>
  );
}

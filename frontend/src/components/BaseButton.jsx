import Button from "@mui/material/Button";

const BaseButton = ({txt, onClick}) => {
    return (
        <Button variant="outlined" size="small" onClick={onClick}>{txt}</Button>
    );
}

export default BaseButton;
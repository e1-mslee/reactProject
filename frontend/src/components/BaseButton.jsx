import Button from "@mui/material/Button";

const BaseButton = ({id="", txt, onClick}) => {
    return (
        <Button id={id} variant="outlined" size="small" onClick={onClick}>{txt}</Button>
    );
}

export default BaseButton;
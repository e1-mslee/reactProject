import React, {type FormEvent} from "react";
import { useState } from "react";

import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControl,
    Box,
    Grid,
    Typography,
    Container,
    Select,
    MenuItem,
    InputLabel,
    type SelectChangeEvent, IconButton,
} from "@mui/material"

import { createTheme, ThemeProvider } from "@mui/material/styles"
import api from "@api/api";
import {useNavigate} from "react-router-dom";

const Signup = () => {
    const [ role, setRole ] = useState<string>("");
    const navigate = useNavigate();
    const theme = createTheme()

    // form 전송
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = new FormData(e.currentTarget)
        const joinData = {
            id: data.get("id"),
            name: data.get("name"),
            password: data.get("password"),
            rePassword: data.get("rePassword"),
            email: data.get("email"),
            role: role
        }

        if(joinData.password !== joinData.rePassword){
            alert("비밀번호가 다릅니다. 다시 입력해주세요.");
            return;
        }

        api.post("/signup", joinData).then( res => {
            alert("회원가입에 성공했습니다.");
            void navigate("/login");
        }).catch( err => {
            alert("회원가입에 실패했습니다.");
            console.log(err)
        }).finally(() => {
            joinData.password = "";
            joinData.rePassword = "";
            e.currentTarget.reset();
        });
    }

    const handleChange = (event: SelectChangeEvent) => {
        setRole(event.target.value);
    };

    const cancelBtnHandler = () => {
        void navigate("/login");
    }

    return (
        <div>
            <ThemeProvider theme={theme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} />
                        <Typography component="h1" variant="h5">
                            회원가입
                        </Typography>
                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit}
                            sx={{ mt: 3 }}
                        >
                            <FormControl component="fieldset" variant="standard">
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            required
                                            autoFocus
                                            fullWidth
                                            type="email"
                                            id="id"
                                            name="id"
                                            label="id"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            required
                                            fullWidth
                                            type="password"
                                            id="password"
                                            name="password"
                                            label="비밀번호 (숫자+영문자+특수문자 8자리 이상)"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            required
                                            fullWidth
                                            type="password"
                                            id="rePassword"
                                            name="rePassword"
                                            label="비밀번호 재입력"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="name"
                                            name="name"
                                            label="이름"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="email"
                                            name="email"
                                            label="email"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="roleSelect">Role</InputLabel>
                                            <Select
                                                labelId="roleSelect"
                                                id="role"
                                                value={role}
                                                label="Role"
                                                onChange={handleChange}
                                            >
                                                <MenuItem value={""}>-선택-</MenuItem>
                                                <MenuItem value={"10"}>admin</MenuItem>
                                                <MenuItem value={"20"}>system</MenuItem>
                                                <MenuItem value={"30"}>master</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        fullWidth
                                    >
                                        회원가입
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="error"
                                        fullWidth
                                        onClick={cancelBtnHandler} // 뒤로가기
                                    >
                                        취소
                                    </Button>
                                </Box>
                                {/*<Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    size="large"
                                >
                                    회원가입
                                </Button>*/}
                            </FormControl>
                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    )
}
export default Signup
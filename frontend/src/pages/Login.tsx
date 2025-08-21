import {
    Button,
    Checkbox,
    FormControlLabel,
    Link,
} from '@mui/material';

import type {AuthResponse, AuthProvider } from '@toolpad/core/SignInPage';
import { SignInPage } from '@toolpad/core/SignInPage';
import {AppProvider} from '@toolpad/core/AppProvider';
import {useTheme} from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import useAuth from '@/auth/useAuth';
import useAccountData from "@/store/kjo/accountStore";

const providers = [{ id: 'credentials', name: 'Id and Password' }];

function Title() {
    return <h2 style={{ marginBottom: 8 }}>Login</h2>;
}

function SignUpLink() {
    return (
        <Link href="/signup" variant="body2">
            Sign up
        </Link>
    );
}

function CustomButton() {
    return (
        <Button
            type="submit"
            variant="outlined"
            color="info"
            size="small"
            disableElevation
            fullWidth
            sx={{ my: 2 }}
        >
            Log In
        </Button>
    );
}

function RememberMeCheckbox() {
    const theme = useTheme();
    return (
        <FormControlLabel
            label="Remember me"
            control={
                <Checkbox
                    name="remember"
                    value="true"
                    color="primary"
                    sx={{ padding: 0.5, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                />
            }
            slotProps={{
                typography: {
                    color: 'textSecondary',
                    fontSize: theme.typography.pxToRem(14),
                },
            }}
        />
    );
}

const Login = () => {
    const { setUserInfo } = useAccountData();
    const { login } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const LoginHandle = (provider: AuthProvider, formData: FormData) => {
        const id = formData.get("email") || "";
        const password = formData.get("password") || "";

        if(!formData || id == "" || password == "") {
            alert("Id 와 Password를 입력해주세요");
            return;
        }
        if (typeof id === "string" && typeof password === "string") {
            login(id, password)
                .then(res => {
                    setUserInfo(res);
                    void navigate('/home');
                }).catch(e => {
                    console.log(e)
                    alert("로그인 실패 \nId와 Password를 확인해주세요");
                });
        }
    };

    return (
        // preview-start
        <AppProvider theme={theme}>
            <SignInPage
                signIn={LoginHandle}
                providers={providers}
                slots = {{
                    title: Title,
                    submitButton: CustomButton,
                    signUpLink: SignUpLink,
                    rememberMe: RememberMeCheckbox
                }}
                slotProps={{ emailField: { autoFocus: false, label: "Id", placeholder: "Your Id" }, form: { noValidate: true } }}
            />
        </AppProvider>

        // preview-end
    );
}
export default Login
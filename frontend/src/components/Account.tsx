import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import Logout from '@mui/icons-material/Logout';
import { Account } from '@toolpad/core/Account';
import { AppProvider } from '@toolpad/core/AppProvider';

import useAuth from '@auth/useAuth';
import useAccountData from "@store/kjo/accountStore";

export default function AccountCustomSlotProps() {
    const { logout } = useAuth();
    const { userInfo } = useAccountData();
    const navigate = useNavigate();
    const [session, setSession] = React.useState({
        user: {
            name: userInfo?.userName || "User",
            email: userInfo?.email || "user@example.com",
        },
    });

  const authentication = React.useMemo(() => {
    return {
        signIn: ()=>{},
        signOut: () => {
            logout(userInfo.userId)
                .then(res => {
                    void navigate('/login');
                }).catch(e => {
                    alert("로그아웃 실패");
            });
        },
    };
  }, []);

  return (
    <AppProvider authentication={authentication} session={session}>
      {/* preview-start */}
      <Account
        slotProps={{
          signOutButton: {
            color: 'success',
            startIcon: <Logout />,
          },
          preview: {
            variant: 'expanded',
            slotProps: {
              avatarIconButton: {
                sx: {
                  width: 'fit-content',
                  margin: 'auto',
                },
              },
              avatar: {
                variant: 'rounded',
              },
            },
          },
        }}
      />
    </AppProvider>
  );
}
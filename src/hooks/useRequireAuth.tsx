import { useUser } from '@/contexts/user/useUser';
import { useSnackbar } from '@/hooks/useSnackbar';
import { Button } from '@mui/material';

export function useRequireAuth() {
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();

  return (action: string, callback: () => void) => {
    if (!user) {
      showSnackbar(
        `Please login to ${action}`,
        'warning',
        <Button
          size="small"
          color="inherit"
          onClick={() => (window.location.href = '/login')}
        >
          Login
        </Button>,
      );
      return;
    }
    callback();
  };
}

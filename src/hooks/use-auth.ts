import { useAuth } from "@/contexts/auth-context";
import type { LoginPayload, RegisterPayload } from "@/api/api-response";
import { toast } from "@/components/ui/sonner";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      toast.success("Login efetuado com sucesso");
    },
  });
}

export function useRegister() {
  const { register } = useAuth();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      toast.success("Conta criada com sucesso");
    },
  });
}

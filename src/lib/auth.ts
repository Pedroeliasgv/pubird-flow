import { supabase } from "../integrations/supabase/client";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  fullName: string;
}) {
  const { email, password, fullName } = params;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

export async function signInWithEmail(params: {
  email: string;
  password: string;
}) {
  const { email, password } = params;

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
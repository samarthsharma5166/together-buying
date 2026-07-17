"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchCurrentUser } from "@/store/slices/authSlice";

export function AuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return null;
}

"use client";

import { useEffect } from "react";

export default function Throw() {
  useEffect(() => {
    throw new Error("test-throw");
  }, []);
  
  return <div>This page will throw an error...</div>;
}

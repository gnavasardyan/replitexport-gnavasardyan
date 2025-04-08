
import { useLocation } from "wouter";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const [, navigate] = useLocation();

  return (
    <Button
      variant="outline"
      className="mb-4"
      onClick={() => navigate("/")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Назад
    </Button>
  );
}

import { redirect } from "next/navigation";

// La home "storica" (my mood) e' stata sostituita da Elly: chi apre il
// dominio nudo va dritto nel percorso di pianificazione viaggio.
export default function HomePage() {
  redirect("/viaggio");
}

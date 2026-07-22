import { Home, Settings, Info, UserRound, FileText } from "lucide-react-native";

export const tabsConstants = [
  {
    name: "index",
    title: "Home",
    component: Home,
  },
  {
    name: "my-reports",
    title: "Meus Spots",
    component: FileText, // ícone de exemplo
  },
  {
    name: "contacts",
    title: "Contatos",
    component: UserRound,
  },
  {
    name: "settings",
    title: "Settings",
    component: Settings,
  },
  {
    name: "about",
    title: "About",
    component: Info,
  },
];

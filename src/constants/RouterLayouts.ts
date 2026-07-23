import { MapPin, Info, LogOut, UserRound, Settings } from "lucide-react-native";
        
export const tabsConstants = [
  {
    name: "📍 Meus Locais",
    route: "MyReports",
    text: "Meus Locais",
    icon: MapPin,
    close: false,

  },
  {
    name: "👥 Contatos",
    route: "Contacts",
    text: "Meus Contatos",
    icon: UserRound,
    close: false,
  },
  {
    name: "📍 Sobre o App",
    route: "About",
    text: "Sobre o App",
    icon: Info,
    close: false,

  },
  {
    text: "Meus Locais",
    icon: LogOut,
    close: true,
  }




]
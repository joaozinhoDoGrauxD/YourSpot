export interface HomeMenuAnimatedProps {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onNavigate: (route: string) => void ;
}
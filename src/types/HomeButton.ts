import { LucideProps } from "lucide-react-native"
import {ForwardRefExoticComponent, RefAttributes} from 'react'
export type FuncProps = (myName?: string, myRoute?: string) => void;

export interface HomeButtonProps {
    icon: ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>, 
    text: string,
    route?: string,
    name?: string,
    close: boolean,
    func: FuncProps 
}
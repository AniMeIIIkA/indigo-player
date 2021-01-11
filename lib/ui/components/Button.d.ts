interface ButtonProps {
    children?: JSX.Element | string;
    icon?: string;
    name?: string;
    disabled?: boolean;
    active?: boolean;
    tooltip?: string;
    onClick(): any;
}
export declare const Button: (props: ButtonProps) => JSX.Element;
export {};

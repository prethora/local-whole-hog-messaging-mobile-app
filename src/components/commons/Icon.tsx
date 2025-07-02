import React from "react";
import { IconName } from "boxicons";
import { s } from "../../lib/styler";

interface IconProps {
    className?: string;
    name: IconName;
    size?: string;
    color?: string;
    activeExpand?: number;
    activeExpandX?: number;
    activeExpandY?: number;
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, size = "24px", color = "", className = "", activeExpand = 0, activeExpandX = activeExpand, activeExpandY = activeExpand, onClick, disabled = false, style }) => {
    return <div className="group relative">
        <div className={s("absolute z-10", {
            "group-active:bg-black/10 md:group-active:bg-transparent": !disabled
        })} style={{
            left: `${-activeExpandX}px`,
            right: `${-activeExpandX}px`,
            top: `${-activeExpandY}px`,
            bottom: `${-activeExpandY}px`,
        }} onClick={(e) => { if (!disabled) onClick?.(e) }}></div>
        <i className={`bx ${name} ${className}`} style={{ ...style, fontSize: size, color }} />
    </div>;
};

export default Icon;
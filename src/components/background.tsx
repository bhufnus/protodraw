"use client";

import { Brush, Circle, Palette, Square } from 'lucide-react';
import React, { useCallback, useState, useEffect, useMemo } from 'react';

interface IconProps {
    id: React.Key;
    icon: number;
    size: number;
    x: number;
    y: number;
    rotation: number;
    animation: string;
}

const Icon = React.memo(function Icon({ icon, size, x, y, rotation, animation, id }: IconProps) {
    const IconComponents = {
        0: Brush,
        1: Palette,
        2: Circle,
        3: Square,
    };

    const IconComponent = IconComponents[icon] || Square;
    let className = "";

    switch (icon) {
        case 0:
            className = "text-red-500";
            break;
        case 1:
            className = "text-green-500";
            break;
        case 2:
            className = "text-blue-500";
            break;
        default:
            className = "text-yellow-500";
    }

    return (
        <span
            key={id}
            className="absolute opacity-30"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                fontSize: `${size}px`,
                transform: `rotate(${rotation}deg)`,
                animation: animation,
            }}
        >
            <IconComponent className={className} />
        </span>
    );
});

interface BackgroundProps {
    regenerateOnChange?: string;
}

export default function Background({ regenerateOnChange }: BackgroundProps) {
    const [backgroundIcons, setBackgroundIcons] = useState([]);

    const generateIcons = useCallback(() => {
        const newIcons = [...Array(20)].map((_, index) => {
            const size = Math.floor(Math.random() * 30) + 20; // Random size between 20 and 50
            const x = Math.floor(Math.random() * 100); // Random position
            const y = Math.floor(Math.random() * 100);
            const rotation = Math.floor(Math.random() * 360); // Random rotation
            const iconType = Math.floor(Math.random() * 4); // Randomly select icon

            let animation = '';
            switch (iconType) {
                case 0: // Brush - Horizontal drift
                    animation = 'drift-left 10s linear infinite';
                    break;
                case 2: // Circle - Horizontal drift
                    animation = 'drift 10s linear infinite';
                    break;
                case 1: // Palette - Spin
                    animation = Math.random() < 0.5 ? 'spin-clockwise 15s linear infinite' : 'spin-counterclockwise 15s linear infinite';
                    break;
                case 3: // Square - Falling
                    animation = 'fall 15s linear infinite';
                    break;
                default:
                    animation = '';
                    break;
            }

            return {
                key: index,
                size,
                x,
                y,
                rotation,
                iconType,
                animation,
            };
        });
        setBackgroundIcons(newIcons);
    }, []);

    useEffect(() => {
        generateIcons();
    }, [generateIcons, regenerateOnChange]);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {backgroundIcons.map((icon) => (
                <Icon
                    key={icon.key}
                    id={icon.key}
                    icon={icon.iconType}
                    size={icon.size}
                    x={icon.x}
                    y={icon.y}
                    rotation={icon.rotation}
                    animation={icon.animation}
                />
            ))}
        </div>
    );
}
